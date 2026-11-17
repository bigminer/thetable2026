/** One-source ingestion, review, validation and offline indexing. No paid fallback. */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseVtt } from '../src/lib/sermon-chatbot/vtt.ts';
import { SOURCE_FILE, INDEX_FILE, VIDEO_ID, loadSource, isApproved, sourceHash, buildIndex,
  loadIndex, createClient, validateSource, type Source, type Index } from '../src/lib/sermon-chatbot/pilot.ts';

export async function atomicJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2) + '\n');
  await rename(temp, path);
}
export function prepareSource(vtt: string): Source {
  // Bounds are review candidates from the legacy metadata, NOT editorial approval.
  const start = 1280, end = 3203;
  const cues = parseVtt(vtt).filter(c => c.start >= start && c.end <= end);
  const source: Source = { version: 1, videoId: VIDEO_ID, title: 'Trauma Self Blame', date: '2026-04-20',
    speaker: 'brett_tilford', start, end, provenance: 'YouTube English automatic captions; date is upload date pending review',
    cues, review: { status: 'pending', reviewer: null, reviewedAt: null, consent: 'pending', contentHash: null } };
  validateSource(source);
  // A tiny/partial caption response is not a successful acquisition.
  if (cues.length < 100 || cues.map(c=>c.text).join(' ').length < 10000
      || cues[0].start > start + 20 || cues.at(-1)!.end < end - 20) throw new Error('Incomplete sermon captions; retry acquisition');
  return source;
}
async function ingest(path?: string): Promise<void> {
  let temp: string | undefined;
  try {
    if (!path) {
      temp = await mkdtemp(join(tmpdir(), 'ask-sermon-'));
      const args = ['--skip-download', '--write-auto-subs', '--write-subs', '--sub-langs', 'en', '--sub-format', 'vtt',
        '--no-playlist', '--output', join(temp, '%(id)s.%(ext)s')];
      if (process.env.YOUTUBE_COOKIES_FILE) args.push('--cookies', process.env.YOUTUBE_COOKIES_FILE);
      args.push(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
      execFileSync('yt-dlp', args, { stdio: 'inherit' });
      path = join(temp, `${VIDEO_ID}.en.vtt`);
    }
    const source = prepareSource(await readFile(path, 'utf8'));
    const existing = await loadSource();
    if (existing && sourceHash(existing) === sourceHash(source)) {
      console.log('Source unchanged; preserving review and existing index.'); return;
    }
    // Never overwrite human edits or an approval on a routine rerun.
    if (existing) throw new Error('Caption content changed; stage it separately and review the diff before replacing the source');
    await atomicJson(SOURCE_FILE, source);
    console.log(`Prepared ${source.cues.length} bounded cues for Anna. Status: pending review.`);
    // No legacy archive entry: the persisted, validated source is the success record.
  } finally { if (temp) await rm(temp, { recursive: true, force: true }); }
}
async function main(): Promise<void> {
  const [command, argument] = process.argv.slice(2);
  if (command === 'ingest') { await ingest(argument); return; }
  if (command === 'import') {
    if (!argument) throw new Error('Supply the locally acquired source JSON');
    const candidate = await loadSource(argument);
    if (!candidate) throw new Error('Missing prepared source');
    // An acquisition artifact never grants editorial approval.
    candidate.review = { status: 'pending', reviewer: null, reviewedAt: null, consent: 'pending', contentHash: null };
    const existing = await loadSource();
    if (existing) {
      if (sourceHash(existing) === sourceHash(candidate)) { console.log('Source unchanged; preserving review.'); return; }
      throw new Error('Prepared source differs from existing text; review before replacing it');
    }
    await atomicJson(SOURCE_FILE, candidate);
    console.log(`Imported ${candidate.cues.length} bounded cues. Status: pending review.`); return;
  }
  const source = await loadSource();
  if (command === 'check') {
    if (!source || !isApproved(source)) {
      if (source?.review.status === 'approved') throw new Error('Approval no longer matches the source; re-review required');
      console.log('Pilot gated: transcript review pending; no public sermon answers enabled.'); return;
    }
    await loadIndex(source);
    console.log('Reviewed source and persisted semantic index match.'); return;
  }
  if (!source) throw new Error('Acquire the sermon first');
  if (command === 'approve') {
    // Run only after Anna has explicitly reviewed this exact file/hash and granted consent.
    if (argument !== sourceHash(source)) throw new Error('Supply the exact reviewed content hash');
    source.review = { status: 'approved', reviewer: 'Anna Barnes', reviewedAt: new Date().toISOString(),
      consent: 'granted', contentHash: argument };
    await atomicJson(SOURCE_FILE, source);
    console.log('Approval recorded. Build the index before publishing.'); return;
  }
  if (command === 'index') {
    if (!isApproved(source)) throw new Error('Transcript review required before indexing');
    let previous: Index | undefined;
    try { previous = JSON.parse(await readFile(INDEX_FILE, 'utf8')); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    const client = createClient();
    const index = await buildIndex(source, client, previous);
    await atomicJson(INDEX_FILE, index);
    console.log(`Saved ${index.passages.length} passages. Source hash: ${index.sourceHash}`); return;
  }
  if (command === 'hash') { console.log(sourceHash(source)); return; }
  throw new Error('Usage: ask-pilot.ts ingest [vtt-path] | import <source-json> | check | hash | approve <reviewed-hash> | index');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
