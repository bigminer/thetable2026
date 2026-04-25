/**
 * scripts/transcribe-missing.ts — Whisper fallback for videos without auto-captions.
 *
 * Scans scripts/transcripts/raw/ for info.json files that lack a matching
 * .en.vtt (YouTube had no auto-captions available). For each one, downloads
 * low-bitrate mono audio via yt-dlp, sends it to OpenAI Whisper, and writes
 * the resulting VTT next to the info.json.
 *
 * Cost: ~$0.006/min of audio via whisper-1.
 *
 * Requires: OPENAI_API_KEY in .env, yt-dlp on PATH, ffmpeg on PATH.
 *
 * Usage: npm run transcribe
 */

import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";

const RAW_DIR = "scripts/transcripts/raw";
const MAX_WHISPER_BYTES = 25 * 1024 * 1024; // Whisper API hard limit
const AUDIO_BITRATE_BPS = 32_000; // 32 kbps mono mp3, safe for ~100min videos

type YtDlpInfo = {
  id: string;
  title?: string;
  upload_date?: string;
  duration?: number;
  _type?: string;
};

type Missing = {
  base: string;
  id: string;
  title: string;
  duration: number;
};

async function findMissing(): Promise<Missing[]> {
  const entries = await readdir(RAW_DIR).catch(() => [] as string[]);
  const infoFiles = entries.filter((f) => f.endsWith(".info.json"));
  const out: Missing[] = [];

  for (const infoFile of infoFiles) {
    const base = infoFile.replace(/\.info\.json$/, "");
    const infoRaw = await readFile(join(RAW_DIR, infoFile), "utf8");
    const info: YtDlpInfo = JSON.parse(infoRaw);

    if (info._type === "playlist" || !info.upload_date) continue;

    const vttPath = join(RAW_DIR, `${base}.en.vtt`);
    if (existsSync(vttPath)) continue;

    out.push({
      base,
      id: info.id,
      title: info.title ?? "(untitled)",
      duration: info.duration ?? 0,
    });
  }

  return out;
}

function downloadAudio(videoId: string, outputBase: string): string {
  const audioPath = join(RAW_DIR, `${outputBase}.mp3`);

  execFileSync(
    "yt-dlp",
    [
      "-x",
      "--audio-format",
      "mp3",
      "--postprocessor-args",
      "ffmpeg:-ac 1 -ar 16000 -b:a 32k",
      "--output",
      join(RAW_DIR, `${outputBase}.%(ext)s`),
      `https://www.youtube.com/watch?v=${videoId}`,
    ],
    { stdio: "inherit" },
  );

  return audioPath;
}

async function transcribe(openai: OpenAI, audioPath: string): Promise<string> {
  const result = await openai.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    response_format: "vtt",
    language: "en",
  });
  return String(result);
}

function parseLimitFlag(): number | null {
  const idx = process.argv.indexOf("--limit");
  if (idx === -1) return null;
  const n = Number(process.argv[idx + 1]);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`--limit requires a positive integer, got: ${process.argv[idx + 1]}`);
  }
  return n;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Add it to .env");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const limit = parseLimitFlag();

  let missing = await findMissing();
  if (limit !== null && missing.length > limit) {
    console.log(`Limiting to ${limit} of ${missing.length} missing transcripts (--limit).`);
    missing = missing.slice(0, limit);
  }
  if (missing.length === 0) {
    console.log("No missing transcripts. Nothing to do.");
    return;
  }

  const totalMinutes = missing.reduce((sum, m) => sum + m.duration / 60, 0);
  const estCost = totalMinutes * 0.006;

  console.log(`Found ${missing.length} videos needing transcription.`);
  console.log(`Total audio: ${totalMinutes.toFixed(1)} minutes`);
  console.log(`Estimated Whisper cost: $${estCost.toFixed(2)}`);
  console.log("");

  let ok = 0;
  let failed = 0;

  for (const m of missing) {
    const minutes = Math.round(m.duration / 60);
    const estMb = (m.duration * AUDIO_BITRATE_BPS) / 8 / (1024 * 1024);
    console.log(`[${m.id}] ${m.title} (${minutes}min, ~${estMb.toFixed(1)}MB audio)`);

    let audioPath: string | null = null;
    try {
      audioPath = downloadAudio(m.id, m.base);

      const stats = statSync(audioPath);
      if (stats.size > MAX_WHISPER_BYTES) {
        console.warn(
          `    Skipped: audio is ${(stats.size / 1024 / 1024).toFixed(1)}MB, ` +
            `exceeds Whisper's 25MB limit.`,
        );
        failed++;
        continue;
      }

      console.log(`    Transcribing (${(stats.size / 1024 / 1024).toFixed(1)}MB)...`);
      const vtt = await transcribe(openai, audioPath);

      const vttPath = join(RAW_DIR, `${m.base}.en.vtt`);
      await writeFile(vttPath, vtt);
      console.log(`    Wrote ${vttPath}`);
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    Failed: ${msg}`);
      failed++;
    } finally {
      if (audioPath && existsSync(audioPath)) {
        await unlink(audioPath);
      }
    }
  }

  console.log("");
  console.log(`Done: ${ok} transcribed, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
