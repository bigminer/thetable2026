/**
 * scripts/ask.ts — query the sermon corpus.
 *
 * Loads every reviewed sermon stub from scripts/transcripts/content/,
 * bounds each VTT by content_start/content_end, chunks + embeds the
 * results, caches per-content_id in scripts/transcripts/embeddings.json,
 * and composes an answer via Claude.
 *
 * A stub is "reviewed" (eligible for the corpus) when all of:
 *   - content_type = "sermon"
 *   - speaker = "brett_tilford"
 *   - consent_status = "granted"
 *   - content_start and content_end both non-null
 *
 * The cache is keyed by content_id and versioned by the bounds. When a
 * stub's bounds change (volunteer edits start/end), that single sermon
 * gets re-embedded on the next run; everything else reuses its cache.
 *
 * Usage: npm run ask -- "your question"
 */

import Anthropic from "@anthropic-ai/sdk";
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";

// ---- Config --------------------------------------------------------------

const CONTENT_DIR = "scripts/transcripts/content";
const EMBEDDINGS_CACHE = "scripts/transcripts/embeddings.json";
const CHUNK_TARGET_CHARS = 1600; // ~400 tokens
const CHUNK_OVERLAP_CHARS = 200; // ~50 tokens
const TOP_K = 5; // retrieve more than the spec's 2-inline limit so sprawl can fall back
const EMBEDDING_MODEL = "text-embedding-3-small";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const TIER_HIGH = 0.4; // empirical thresholds from prototype calibration
const TIER_MEDIUM = 0.32;

// ---- Types ---------------------------------------------------------------

type Sermon = {
  content_id: string;
  youtube_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  speaker: string;
  vtt_path: string;
  content_start_seconds: number;
  content_end_seconds: number;
};

type RawChunk = {
  content_id: string;
  youtube_id: string;
  sermon_title: string;
  sermon_date: string;
  speaker: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
};

type Chunk = RawChunk & { embedding: number[] };

type CacheEntry = {
  bounds_start: number;
  bounds_end: number;
  chunks: Chunk[];
};

type Cache = Record<string, CacheEntry>;

type Cue = { start: number; end: number; text: string };

// ---- Stub frontmatter parsing -------------------------------------------

function extractYamlValue(content: string, field: string): string | null {
  const re = new RegExp(`^${field}:\\s*(.*?)\\s*(?:#.*)?$`, "m");
  const m = content.match(re);
  if (!m) return null;
  const v = m[1].trim();
  if (v === "null" || v === "") return null;
  return v.replace(/^"(.*)"$/, "$1");
}

function parseHms(hms: string): number {
  const parts = hms.split(":").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return NaN;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

async function loadReviewedSermons(): Promise<Sermon[]> {
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

    // Default-deny retrieval filter (spec §11). Allowed content types
    // for v1 corpus: sermon (Sunday services) and table_talk (Brett's
    // personal-channel devotionals).
    const ALLOWED_CONTENT_TYPES = new Set(["sermon", "table_talk"]);
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
      extractYamlValue(raw, "title") ?? extractYamlValue(raw, "youtube_title") ?? "(untitled)";
    const date = extractYamlValue(raw, "upload_date") ?? "";
    const vttPath = extractYamlValue(raw, "vtt_path");

    if (!contentId || !youtubeId || !vttPath) continue;

    sermons.push({
      content_id: contentId,
      youtube_id: youtubeId,
      title,
      date,
      speaker,
      vtt_path: vttPath,
      content_start_seconds: startS,
      content_end_seconds: endS,
    });
  }

  return sermons;
}

// ---- VTT parsing + chunking ---------------------------------------------

function parseTimestamp(s: string): number {
  const m = s.match(/(\d+):(\d+):(\d+)\.(\d+)/);
  if (!m) return NaN;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}

function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = [];
  const blocks = vtt.split(/\r?\n\r?\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.length > 0);
    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;
    const tsMatch = lines[timeLineIdx].match(
      /(\d+:\d+:\d+\.\d+)\s*-->\s*(\d+:\d+:\d+\.\d+)/,
    );
    if (!tsMatch) continue;
    const start = parseTimestamp(tsMatch[1]);
    const end = parseTimestamp(tsMatch[2]);
    if (end - start < 0.1) continue; // skip echo cues
    const contentLines = lines
      .slice(timeLineIdx + 1)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (contentLines.length === 0) continue;
    const lastLine = contentLines[contentLines.length - 1];
    let text = lastLine
      .replace(/<\d+:\d+:\d+\.\d+>/g, "")
      .replace(/<\/?c[^>]*>/g, "")
      .replace(/&gt;&gt;/g, ">>")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^>>\s*/, "");
    if (!text) continue;
    cues.push({ start, end, text });
  }
  return cues;
}

function buildChunksForSermon(sermon: Sermon, cues: Cue[]): RawChunk[] {
  // Filter to sermon bounds
  const bounded = cues.filter(
    (c) => c.start >= sermon.content_start_seconds && c.start <= sermon.content_end_seconds,
  );

  // Flatten to word-level stream with per-word timestamps
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
      sermon_title: sermon.title,
      sermon_date: sermon.date,
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

// ---- Embedding + cache --------------------------------------------------

async function embedTexts(openai: OpenAI, texts: string[]): Promise<number[][]> {
  // OpenAI embeddings endpoint accepts up to 2048 inputs per call
  const BATCH = 200;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: batch });
    for (const d of res.data) out.push(d.embedding);
  }
  return out;
}

async function loadCache(): Promise<Cache> {
  if (!existsSync(EMBEDDINGS_CACHE)) return {};
  try {
    const raw = await readFile(EMBEDDINGS_CACHE, "utf8");
    return JSON.parse(raw) as Cache;
  } catch {
    return {};
  }
}

async function saveCache(cache: Cache): Promise<void> {
  await writeFile(EMBEDDINGS_CACHE, JSON.stringify(cache));
}

async function buildCorpus(openai: OpenAI, sermons: Sermon[]): Promise<Chunk[]> {
  const cache = await loadCache();
  let dirty = false;
  const allChunks: Chunk[] = [];

  for (const sermon of sermons) {
    const cached = cache[sermon.content_id];
    const boundsMatch =
      cached &&
      cached.bounds_start === sermon.content_start_seconds &&
      cached.bounds_end === sermon.content_end_seconds;

    if (boundsMatch) {
      allChunks.push(...cached.chunks);
      continue;
    }

    // Need to (re)embed this sermon
    if (!existsSync(sermon.vtt_path)) {
      console.error(`  skip ${sermon.content_id}: VTT missing at ${sermon.vtt_path}`);
      continue;
    }
    const vtt = await readFile(sermon.vtt_path, "utf8");
    const cues = parseVtt(vtt);
    const raw = buildChunksForSermon(sermon, cues);
    if (raw.length === 0) {
      console.error(`  skip ${sermon.content_id}: no chunks after bounds filtering`);
      continue;
    }
    const embeddings = await embedTexts(
      openai,
      raw.map((c) => c.text),
    );
    const chunks: Chunk[] = raw.map((c, i) => ({ ...c, embedding: embeddings[i] }));
    cache[sermon.content_id] = {
      bounds_start: sermon.content_start_seconds,
      bounds_end: sermon.content_end_seconds,
      chunks,
    };
    allChunks.push(...chunks);
    dirty = true;
    console.error(
      `  embedded ${sermon.content_id}: ${chunks.length} chunks from "${sermon.title}"`,
    );
  }

  // Remove cache entries for sermons no longer in the reviewed corpus
  const currentIds = new Set(sermons.map((s) => s.content_id));
  for (const id of Object.keys(cache)) {
    if (!currentIds.has(id)) {
      delete cache[id];
      dirty = true;
    }
  }

  if (dirty) await saveCache(cache);
  return allChunks;
}

// ---- Retrieval ----------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function retrieveTopK(
  openai: OpenAI,
  corpus: Chunk[],
  query: string,
  k: number,
): Promise<Array<Chunk & { score: number }>> {
  const [q] = await embedTexts(openai, [query]);
  const scored = corpus.map((c) => ({ ...c, score: cosineSimilarity(q, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// ---- Tier + shape classification ----------------------------------------

function classifyTier(topScore: number): "high" | "medium" | "low" {
  if (topScore >= TIER_HIGH) return "high";
  if (topScore >= TIER_MEDIUM) return "medium";
  return "low";
}

function classifyShape(
  results: Array<Chunk & { score: number }>,
): "single" | "parallel" | "sprawl" {
  if (results.length === 0) return "single";
  const top = results[0].score;
  const distinctSermons = new Set(results.map((r) => r.content_id)).size;
  const gap = results.length >= 3 ? top - results[2].score : 0;

  if (distinctSermons === 1) return "single";
  if (distinctSermons <= 3 && gap < 0.06) return "parallel";
  if (distinctSermons >= 4) return "sprawl";
  return "single";
}

// ---- Composition --------------------------------------------------------

const SYSTEM_PROMPT = `You answer questions using Brett's sermons at The Table.

You are speaking on behalf of a real pastor to a real congregation,
many of whom came to The Table after being hurt by another church.
Warmth here is load-bearing — not decoration. Be specific rather
than effusive: name the sermon, name what you couldn't find, say
"yeah, that's a hard one" when it is. Let responses end softly;
don't chase the user with follow-ups. Your job is to sound like
someone who has actually listened to these sermons and cares that
the person asking is okay — not like a search interface being polite.

Rules:
- Every claim about what Brett said must be a direct, verbatim quote
  with sermon title, date, timestamp, and YouTube deep-link.
- Do not paraphrase Brett. Do not smooth his grammar. Keep restarts,
  filler, and casual phrasing intact.
- If Brett hasn't preached on the topic, say exactly that and stop.
  Do not pivot to adjacent themes unless one genuinely exists, and
  then name it in one line.
- Do not paraphrase Brett's theology. You have no thesis; he does.
- Do not use: explores, journey, unpacks, delves, invites, beautifully,
  powerfully, wrestles with, leans into, reminds us that.
- Do not open with "Let me" or "I'd love to." Start with the answer
  or the quote.
- Short sentences. Direct address. No pastoral softening. Seams show
  on purpose.
- Max 2 quotes inline. If more sermons are relevant, acknowledge with
  ghost-text and point to the scrollable index below.
- Never invent a quote. Never guess a timestamp.
- If a retrieved chunk is not from Brett, do not quote it as Brett.
  Tell the user the line is from someone else and point to where it
  lives.`;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function youtubeLink(id: string, start: number): string {
  return `https://www.youtube.com/watch?v=${id}&t=${start}s`;
}

async function compose(
  anthropic: Anthropic,
  query: string,
  chunks: Array<Chunk & { score: number }>,
  tier: "high" | "medium" | "low",
  shape: "single" | "parallel" | "sprawl",
): Promise<string> {
  const contextBlock = chunks
    .map((c, i) => {
      return [
        `[chunk ${i + 1}] score=${c.score.toFixed(3)}`,
        `sermon: "${c.sermon_title}"`,
        `date: ${c.sermon_date}`,
        `speaker: ${c.speaker}`,
        `timestamp: ${formatTime(c.start_seconds)}–${formatTime(c.end_seconds)}`,
        `youtube_deep_link: ${youtubeLink(c.youtube_id, c.start_seconds)}`,
        `text:`,
        `"${c.text}"`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const distinctSermons = new Set(chunks.map((c) => c.content_id)).size;

  const shapeGuidance = {
    single: `This query resolved to ONE sermon. Use the single-high pattern: one opener sentence + one verbatim quote with inline attribution + a soft close.`,
    parallel: `This query resolved to a handful of sermons where Brett has come back to the same theme. Use the parallel pattern: two verbatim quotes from DIFFERENT sermons, linked by a short framing like "Brett's come back to this" or "same instinct, different words." Both quotes must carry inline attribution.`,
    sprawl: `This query is topical/diffuse — many sermons touch it, no single one owns it. Use the sprawl pattern: one anchor quote + an honest acknowledgment that the topic is diffuse ("this one's everywhere" / "he touches this a lot but doesn't sit down with it for a whole sermon") + a ghost-text list of other sermons where it surfaces (no more than 4-5 titles).`,
  }[shape];

  const tierGuidance =
    tier === "low"
      ? `Retrieval returned LOW confidence (top score < 0.32). Use the no-match pattern: "I looked and couldn't find a sermon where Brett takes this up directly. I'd rather tell you that than guess." Do NOT force a quote from the weak retrievals.`
      : tier === "medium"
        ? `Retrieval returned MEDIUM confidence. Use the adjacent-content pattern: name the closest sermon in one line, offer the quote, but signal "not exact match."`
        : `Retrieval returned HIGH confidence. Quote directly.`;

  const userMessage = `User asked: "${query}"

Retrieved ${chunks.length} chunks from ${distinctSermons} sermon(s).
Tier: ${tier}. Shape: ${shape}.

${tierGuidance}

${shapeGuidance}

---

HARD RULES (override system prompt if conflicting):

1. MAXIMUM 2 VERBATIM QUOTES inline in the response. If more sermons are relevant, acknowledge them as ghost-text titles after the main quotes.
2. EVERY QUOTE CARRIES ITS OWN ATTRIBUTION: format \`— <sermon title>, <date>, <mm:ss>, <youtube link>\` immediately after the quote. Not at the bottom.
3. BETWEEN QUOTES, use framing in YOUR own voice only. Do not summarize Brett's argument.
4. VERBATIM MEANS VERBATIM. Keep "you know", "uh", restarts, casual phrasing.
5. If top score is below 0.32 (low tier), refuse gracefully — no forced quotes.

---

RETRIEVED CHUNKS (score order):

${contextBlock}

Compose the response.`;

  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "(empty response)";
}

// ---- Main ---------------------------------------------------------------

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage: npm run ask -- "your question"');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set.");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.error("[corpus] scanning reviewed stubs...");
  const sermons = await loadReviewedSermons();
  console.error(`[corpus] ${sermons.length} reviewed sermons in scope`);
  if (sermons.length === 0) {
    console.error("No reviewed sermons available. Check scripts/transcripts/content/.");
    process.exit(1);
  }

  console.error("[corpus] building/loading embeddings...");
  const corpus = await buildCorpus(openai, sermons);
  console.error(`[corpus] ${corpus.length} chunks across ${sermons.length} sermons`);

  const top = await retrieveTopK(openai, corpus, query, TOP_K);
  const topScore = top[0]?.score ?? 0;
  const tier = classifyTier(topScore);
  const shape = classifyShape(top);

  console.error(`\n[retrieval] tier=${tier} shape=${shape} top_score=${topScore.toFixed(3)}`);
  console.error(`[retrieval] top ${top.length}:`);
  for (let i = 0; i < top.length; i++) {
    const c = top[i];
    const preview = c.text.slice(0, 70).replace(/\s+/g, " ");
    console.error(
      `  ${i + 1}. ${c.score.toFixed(3)} "${c.sermon_title}" (${c.sermon_date}) @ ${formatTime(c.start_seconds)}: "${preview}..."`,
    );
  }
  console.error("");

  const response = await compose(anthropic, query, top, tier, shape);
  console.log(response);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
