import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";
import type { Cache, Chunk, RawChunk, Sermon } from "./types.ts";
import { parseHms, parseVtt } from "./vtt.ts";

const CONTENT_DIR = "data/transcripts/content";
const EMBEDDINGS_CACHE = "data/transcripts/embeddings.json";
const CHUNK_TARGET_CHARS = 1600; // ~400 tokens
const CHUNK_OVERLAP_CHARS = 200;
const EMBEDDING_MODEL = "text-embedding-3-small";
const ALLOWED_CONTENT_TYPES = new Set(["sermon", "table_talk"]);

function extractYamlValue(content: string, field: string): string | null {
  const re = new RegExp(`^${field}:\\s*(.*?)\\s*(?:#.*)?$`, "m");
  const m = content.match(re);
  if (!m) return null;
  const v = m[1].trim();
  if (v === "null" || v === "") return null;
  return v.replace(/^"(.*)"$/, "$1");
}

export async function loadReviewedSermons(): Promise<Sermon[]> {
  const entries = await readdir(CONTENT_DIR);
  const stubs = entries.filter((f) => f.endsWith(".md")).sort();
  const sermons: Sermon[] = [];

  for (const filename of stubs) {
    const raw = await readFile(join(CONTENT_DIR, filename), "utf8");
    const contentType = extractYamlValue(raw, "content_type");
    const speaker = extractYamlValue(raw, "speaker");
    const consent = extractYamlValue(raw, "consent_status");
    const startHms = extractYamlValue(raw, "content_start");
    const endHms = extractYamlValue(raw, "content_end");

    // Default-deny retrieval filter (spec §11)
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) continue;
    if (speaker !== "brett_tilford") continue;
    if (consent !== "granted") continue;
    if (!startHms || !endHms) continue;

    const startS = parseHms(startHms);
    const endS = parseHms(endHms);
    if (isNaN(startS) || isNaN(endS)) continue;

    const contentId = extractYamlValue(raw, "content_id");
    const youtubeId = extractYamlValue(raw, "youtube_id");
    const title =
      extractYamlValue(raw, "title") ??
      extractYamlValue(raw, "youtube_title") ??
      "(untitled)";
    const date = extractYamlValue(raw, "upload_date") ?? "";
    const vttPath = extractYamlValue(raw, "vtt_path");
    const durationStr = extractYamlValue(raw, "duration_seconds");
    const duration = durationStr ? Number(durationStr) : 0;
    const series = extractYamlValue(raw, "series");
    const description = extractYamlValue(raw, "content_description");

    if (!contentId || !youtubeId || !vttPath) continue;

    sermons.push({
      content_id: contentId,
      youtube_id: youtubeId,
      title,
      date,
      speaker,
      content_type: contentType,
      series,
      description,
      vtt_path: vttPath,
      duration_seconds: duration,
      content_start_seconds: startS,
      content_end_seconds: endS,
    });
  }

  return sermons;
}

export function buildChunksForSermon(sermon: Sermon, vtt: string): RawChunk[] {
  const cues = parseVtt(vtt);
  const bounded = cues.filter(
    (c) =>
      c.start >= sermon.content_start_seconds && c.start <= sermon.content_end_seconds,
  );

  const words: Array<{ t: number; w: string }> = [];
  for (const cue of bounded) {
    for (const part of cue.text.split(/\s+/).filter(Boolean)) {
      words.push({ t: cue.start, w: part });
    }
  }

  const chunks: RawChunk[] = [];
  let i = 0;
  while (i < words.length) {
    let j = i;
    let chars = 0;
    while (j < words.length && chars < CHUNK_TARGET_CHARS) {
      chars += words[j].w.length + 1;
      j++;
    }
    const slice = words.slice(i, j);
    if (slice.length === 0) break;

    chunks.push({
      content_id: sermon.content_id,
      youtube_id: sermon.youtube_id,
      source_title: sermon.title,
      source_date: sermon.date,
      source_type: sermon.content_type,
      series: sermon.series,
      speaker: sermon.speaker,
      start_seconds: Math.floor(slice[0].t),
      end_seconds: Math.floor(slice[slice.length - 1].t),
      text: slice.map((w) => w.w).join(" "),
    });

    const stepTarget = CHUNK_TARGET_CHARS - CHUNK_OVERLAP_CHARS;
    let stepped = 0;
    let stepWords = 0;
    while (stepped < stepTarget && stepWords < slice.length) {
      stepped += slice[stepWords].w.length + 1;
      stepWords++;
    }
    i += Math.max(1, stepWords);
  }
  return chunks;
}

export async function buildRawCorpus(
  sermons: Sermon[],
  log: (msg: string) => void = () => {},
): Promise<RawChunk[]> {
  const allChunks: RawChunk[] = [];
  for (const sermon of sermons) {
    if (!existsSync(sermon.vtt_path)) {
      log(`  skip ${sermon.content_id}: VTT missing at ${sermon.vtt_path}`);
      continue;
    }
    const vtt = await readFile(sermon.vtt_path, "utf8");
    const raw = buildChunksForSermon(sermon, vtt);
    allChunks.push(...raw);
  }
  return allChunks;
}

async function embedTexts(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const BATCH = 200;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    for (const d of res.data) out.push(d.embedding);
  }
  return out;
}

async function loadCacheFile(): Promise<Cache> {
  if (!existsSync(EMBEDDINGS_CACHE)) return {};
  try {
    const raw = await readFile(EMBEDDINGS_CACHE, "utf8");
    return JSON.parse(raw) as Cache;
  } catch {
    return {};
  }
}

async function saveCacheFile(cache: Cache): Promise<void> {
  await writeFile(EMBEDDINGS_CACHE, JSON.stringify(cache));
}

/**
 * Build (or load from cache) the full chunk corpus for the given sermons.
 * Per-sermon caching means editing one stub's bounds only re-embeds that
 * one sermon.
 */
export async function buildCorpus(
  openai: OpenAI,
  sermons: Sermon[],
  log: (msg: string) => void = () => {},
): Promise<Chunk[]> {
  const cache = await loadCacheFile();
  let dirty = false;
  const allChunks: Chunk[] = [];

  for (const sermon of sermons) {
    const cached = cache[sermon.content_id];
    const boundsMatch =
      cached &&
      cached.bounds_start === sermon.content_start_seconds &&
      cached.bounds_end === sermon.content_end_seconds;

    if (boundsMatch) {
      // Enrich cached chunks with current stub metadata (handles older
      // cache entries that predate certain fields, and picks up stub
      // title/date edits without a re-embed)
      for (const chunk of cached.chunks) {
        allChunks.push({
          ...chunk,
          source_title: sermon.title,
          source_date: sermon.date,
          source_type: sermon.content_type,
          series: sermon.series,
        });
      }
      continue;
    }

    if (!existsSync(sermon.vtt_path)) {
      log(`  skip ${sermon.content_id}: VTT missing at ${sermon.vtt_path}`);
      continue;
    }
    const vtt = await readFile(sermon.vtt_path, "utf8");
    const raw = buildChunksForSermon(sermon, vtt);
    if (raw.length === 0) {
      log(`  skip ${sermon.content_id}: no chunks after bounds filtering`);
      continue;
    }
    const embeddings = await embedTexts(openai, raw.map((c) => c.text));
    const chunks: Chunk[] = raw.map((c, i) => ({ ...c, embedding: embeddings[i] }));
    cache[sermon.content_id] = {
      bounds_start: sermon.content_start_seconds,
      bounds_end: sermon.content_end_seconds,
      chunks,
    };
    allChunks.push(...chunks);
    dirty = true;
    log(
      `  embedded ${sermon.content_id}: ${chunks.length} chunks from "${sermon.title}"`,
    );
  }

  // Prune cache entries for sermons no longer in the reviewed corpus
  const currentIds = new Set(sermons.map((s) => s.content_id));
  for (const id of Object.keys(cache)) {
    if (!currentIds.has(id)) {
      delete cache[id];
      dirty = true;
    }
  }

  if (dirty) await saveCacheFile(cache);
  return allChunks;
}

// In-memory corpus cache for the server. First call loads + embeds; later
// calls return the same in-memory copy. Force reload by deleting the
// embeddings.json file or calling invalidateInMemoryCorpus().
let inMemoryCorpus: Chunk[] | null = null;
let inMemorySermons: Sermon[] | null = null;
let inMemoryRawCorpus: RawChunk[] | null = null;
let inMemoryRawSermons: Sermon[] | null = null;

export async function getOrLoadCorpus(
  openai: OpenAI,
): Promise<{ corpus: Chunk[]; sermons: Sermon[] }> {
  if (inMemoryCorpus && inMemorySermons) {
    return { corpus: inMemoryCorpus, sermons: inMemorySermons };
  }
  const sermons = await loadReviewedSermons();
  const corpus = await buildCorpus(openai, sermons);
  inMemoryCorpus = corpus;
  inMemorySermons = sermons;
  return { corpus, sermons };
}

export async function getOrLoadRawCorpus(): Promise<{
  corpus: RawChunk[];
  sermons: Sermon[];
}> {
  if (inMemoryRawCorpus && inMemoryRawSermons) {
    return { corpus: inMemoryRawCorpus, sermons: inMemoryRawSermons };
  }
  const sermons = await loadReviewedSermons();
  const corpus = await buildRawCorpus(sermons);
  inMemoryRawCorpus = corpus;
  inMemoryRawSermons = sermons;
  return { corpus, sermons };
}

export function invalidateInMemoryCorpus(): void {
  inMemoryCorpus = null;
  inMemorySermons = null;
  inMemoryRawCorpus = null;
  inMemoryRawSermons = null;
}
