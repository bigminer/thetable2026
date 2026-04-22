/**
 * scripts/ask.ts — Afternoon 1 prototype.
 *
 * Answers a question using Brett's Trauma / Self-Blame sermon transcript.
 * Parses YouTube auto-captions, chunks them, embeds once, caches the result,
 * retrieves top-k by cosine, and composes a response with Claude using the
 * voice rules from docs/sermon-chatbot-spec.md §20.
 *
 * Usage:
 *   npm run ask -- "why does everything feel like my fault?"
 */

import { readFile, writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ---- Config --------------------------------------------------------------

const SERMON = {
  content_id: "sermon-trauma-self-blame",
  title: "Trauma / Self-Blame",
  speaker: "brett_tilford",
  youtube_id: "u7Q-WVrNLfc",
  vtt_path: "scripts/transcripts/raw/trauma-self-blame.vtt",
} as const;

const EMBEDDINGS_CACHE = "scripts/transcripts/embeddings.json";
const CHUNK_TARGET_CHARS = 1600; // ~400 tokens at 4 chars/token
const CHUNK_OVERLAP_CHARS = 200; // ~50 tokens overlap
const TOP_K = 3;
const EMBEDDING_MODEL = "text-embedding-3-small";
const CLAUDE_MODEL = "claude-sonnet-4-6";

// ---- Types ---------------------------------------------------------------

type Cue = { start: number; end: number; text: string };

type Chunk = {
  content_id: string;
  speaker: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
  embedding: number[];
};

// ---- VTT parsing ---------------------------------------------------------

function parseTimestamp(s: string): number {
  const match = s.match(/(\d+):(\d+):(\d+)\.(\d+)/);
  if (!match) return NaN;
  const [, h, m, sec, ms] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(sec) + Number(ms) / 1000;
}

/**
 * Parse YouTube auto-caption VTT into clean cues, each representing new
 * spoken words with their spoken time. Skips 10ms echo cues; keeps only
 * the last line of each real cue (that's where new words appear) and
 * strips inline timing tags.
 */
function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = [];
  const blocks = vtt.split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.length > 0);
    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;

    const timeLine = lines[timeLineIdx];
    const tsMatch = timeLine.match(
      /(\d+:\d+:\d+\.\d+)\s*-->\s*(\d+:\d+:\d+\.\d+)/,
    );
    if (!tsMatch) continue;

    const start = parseTimestamp(tsMatch[1]);
    const end = parseTimestamp(tsMatch[2]);

    // Skip echo cues (10ms "frame" between real captions)
    if (end - start < 0.1) continue;

    // Take the last content line — that's where new words with inline
    // <timing><c>word</c> tags appear. Preceding lines are carry-over.
    const contentLines = lines
      .slice(timeLineIdx + 1)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (contentLines.length === 0) continue;

    const lastLine = contentLines[contentLines.length - 1];

    // Strip inline timing tags and <c>/</c> markers
    let text = lastLine
      .replace(/<\d+:\d+:\d+\.\d+>/g, "")
      .replace(/<\/?c[^>]*>/g, "")
      .replace(/&gt;&gt;/g, ">>")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/\s+/g, " ")
      .trim();

    // Strip speaker-change markers (">>"); these come from YouTube, not Brett
    text = text.replace(/^>>\s*/, "").trim();
    if (!text) continue;

    cues.push({ start, end, text });
  }

  return cues;
}

// ---- Chunking ------------------------------------------------------------

/**
 * Turn the word-level cue stream into overlapping ~400-token chunks. Each
 * chunk keeps the spoken time of its first and last words so we can build
 * YouTube deep-links into the exact moment.
 */
function buildChunks(cues: Cue[]): Array<Omit<Chunk, "embedding">> {
  // Flatten to a word timeline: each word gets the cue's start time.
  // (Good enough for deep-link granularity; precise sub-word timing lives
  // in the source VTT if we ever want it.)
  const words: Array<{ t: number; w: string }> = [];
  for (const cue of cues) {
    const parts = cue.text.split(/\s+/).filter(Boolean);
    for (const w of parts) words.push({ t: cue.start, w });
  }

  const chunks: Array<Omit<Chunk, "embedding">> = [];
  let i = 0;
  while (i < words.length) {
    // Grow chunk until we hit target chars
    let j = i;
    let chars = 0;
    while (j < words.length && chars < CHUNK_TARGET_CHARS) {
      chars += words[j].w.length + 1;
      j++;
    }

    const slice = words.slice(i, j);
    if (slice.length === 0) break;

    chunks.push({
      content_id: SERMON.content_id,
      speaker: SERMON.speaker,
      start_seconds: Math.floor(slice[0].t),
      end_seconds: Math.floor(slice[slice.length - 1].t),
      text: slice.map((w) => w.w).join(" "),
    });

    // Step forward, leaving ~overlap chars behind
    const stepTargetChars = CHUNK_TARGET_CHARS - CHUNK_OVERLAP_CHARS;
    let stepped = 0;
    let stepWords = 0;
    while (stepped < stepTargetChars && stepWords < slice.length) {
      stepped += slice[stepWords].w.length + 1;
      stepWords++;
    }
    i += Math.max(1, stepWords);
  }

  return chunks;
}

// ---- Embeddings ----------------------------------------------------------

async function embedTexts(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

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

async function loadOrBuildCorpus(openai: OpenAI): Promise<Chunk[]> {
  try {
    const raw = await readFile(EMBEDDINGS_CACHE, "utf8");
    const cached: Chunk[] = JSON.parse(raw);
    console.error(`[cache] Loaded ${cached.length} chunks from ${EMBEDDINGS_CACHE}`);
    return cached;
  } catch {
    console.error(`[build] Cache miss. Parsing ${SERMON.vtt_path}...`);
    const vtt = await readFile(SERMON.vtt_path, "utf8");
    const cues = parseVtt(vtt);
    console.error(`[build] Parsed ${cues.length} cues`);

    const rawChunks = buildChunks(cues);
    console.error(`[build] Coalesced into ${rawChunks.length} chunks. Embedding...`);

    const embeddings = await embedTexts(openai, rawChunks.map((c) => c.text));
    const chunks: Chunk[] = rawChunks.map((c, i) => ({
      ...c,
      embedding: embeddings[i],
    }));

    await writeFile(EMBEDDINGS_CACHE, JSON.stringify(chunks, null, 2));
    console.error(`[build] Cached ${chunks.length} chunks to ${EMBEDDINGS_CACHE}`);
    return chunks;
  }
}

// ---- Retrieval -----------------------------------------------------------

async function retrieveTopK(
  openai: OpenAI,
  corpus: Chunk[],
  query: string,
  k: number,
): Promise<Array<Chunk & { score: number }>> {
  const [queryEmbedding] = await embedTexts(openai, [query]);
  const scored = corpus.map((c) => ({
    ...c,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// ---- Composition ---------------------------------------------------------

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
  with sermon title, timestamp, and YouTube deep-link.
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

function youtubeLink(youtubeId: string, startSeconds: number): string {
  return `https://www.youtube.com/watch?v=${youtubeId}&t=${startSeconds}s`;
}

async function compose(
  anthropic: Anthropic,
  query: string,
  chunks: Array<Chunk & { score: number }>,
): Promise<string> {
  const contextBlock = chunks
    .map((c, i) => {
      const url = youtubeLink(SERMON.youtube_id, c.start_seconds);
      return [
        `[chunk ${i + 1}] score=${c.score.toFixed(3)}`,
        `sermon_title: ${SERMON.title}`,
        `speaker: ${c.speaker}`,
        `timestamp: ${formatTime(c.start_seconds)}–${formatTime(c.end_seconds)}`,
        `youtube_deep_link: ${url}`,
        `text:`,
        `"${c.text}"`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const userMessage = `User asked: "${query}"

Single-sermon corpus this run: "${SERMON.title}". All chunks below come from this one sermon. Ignore any "other sermons" framing; there are none.

---

FORMAT THE RESPONSE LIKE THIS (illustrative example from the spec's calibration target):

  Yeah, that's a heavy one. Brett hit this pretty directly in "${SERMON.title}":

    "<verbatim quote>" — ${SERMON.title}, <mm:ss>, <youtube deep-link>

  <optional short framing sentence in YOUR own voice — NOT a paraphrase of Brett's argument>

    "<optional second verbatim quote>" — ${SERMON.title}, <mm:ss>, <youtube deep-link>

  <soft close, one sentence, no "anything else?" nudge>

HARD RULES (these override anything in the system prompt if they conflict):

1. MAXIMUM 2 VERBATIM QUOTES. No third quote. Not even a short one. If the answer needs three, it doesn't — pick the two strongest and stop.

2. EVERY QUOTE CARRIES ITS OWN TIMESTAMP AND YOUTUBE DEEP-LINK, INLINE, IMMEDIATELY AFTER THE QUOTE. Format: \`— ${SERMON.title}, <mm:ss>, <url>\`. Not a single URL at the bottom.

3. BETWEEN QUOTES, USE FRAMING SENTENCES IN YOUR OWN VOICE ONLY. Do not summarize Brett's argument in your prose. ("That backwards logic — that blaming gives you back control — it works in the short run" is the forbidden kind of summary-of-Brett.) If you can't think of a short framing sentence that isn't a paraphrase, omit the framing and just put the quote.

4. VERBATIM MEANS VERBATIM. Keep every "you know", "uh", "like", restart, and false start from the retrieved chunk. Do not tidy.

5. The opener ("Yeah, that's a heavy one.") is illustrative — use a register that fits the question. Don't parrot that exact phrase unless the topic actually warrants it.

---

RETRIEVED CHUNKS (in score order, highest first):

${contextBlock}

Now compose the response.`;

  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "(empty response)";
}

// ---- Main ----------------------------------------------------------------

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage: npm run ask -- "your question"');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Add it to .env");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const corpus = await loadOrBuildCorpus(openai);
  const topChunks = await retrieveTopK(openai, corpus, query, TOP_K);

  console.error(`\n[retrieval] Top ${TOP_K} chunks:`);
  topChunks.forEach((c, i) => {
    const preview = c.text.slice(0, 90).replace(/\s+/g, " ");
    console.error(
      `  ${i + 1}. score=${c.score.toFixed(3)} @ ${formatTime(c.start_seconds)}–${formatTime(c.end_seconds)}: "${preview}..."`,
    );
  });
  console.error("");

  const response = await compose(anthropic, query, topChunks);
  console.log(response);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
