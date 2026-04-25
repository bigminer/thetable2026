/**
 * scripts/make-descriptions.ts — generate short AI descriptions for stubs.
 *
 * For each stub in scripts/transcripts/content/ with content_description
 * still null (or missing), reads the VTT, bounds it to content_start /
 * content_end if those are set, and asks Claude Haiku for a 1-2 sentence
 * factual description calibrated to the honest-warmth voice rules.
 *
 * Cost: ~$0.01 per stub via Haiku.
 *
 * Idempotent: skips stubs where content_description is already non-null
 * (preserves human-edited descriptions).
 *
 * Usage: npm run make-descriptions
 */

import Anthropic from "@anthropic-ai/sdk";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CONTENT_DIR = "scripts/transcripts/content";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const MAX_TRANSCRIPT_CHARS = 60_000; // keep Haiku context comfortable

const SYSTEM_PROMPT = `You write short 1-2 sentence factual descriptions of sermon transcripts for a list-view subtitle on a church website.

The transcript may contain non-sermon content: welcome, announcements, worship music (transcribed as ♪♪♪ or 🎶 markers), Story Sunday testimonies, and a benediction. If content boundaries were set upstream, you'll only see the sermon portion. If not, focus your description on the sermon/teaching portion and ignore the rest.

Requirements:
- State concretely what the speaker is actually saying. No abstractions.
- Keep to 1-2 sentences, maximum 40 words.
- Do NOT use: explores, journey, unpacks, delves, invites, beautifully, powerfully, wrestles with, leans into, reminds us that, reflects on, speaks to.
- Do NOT start with "This sermon..." or "Brett discusses..." or "The speaker shares..."
- No filler. No pastoral softening. Seams show on purpose — if the sermon refuses a clean answer, say so.
- If the speaker says "I don't know" about something, do not call it wisdom.
- Output only the description text — no preamble, no quotes around it.
- If the transcript contains only worship music (mostly ♪♪♪ or 🎶 markers), or otherwise has no substantive teaching content, respond with exactly: NO_SERMON_CONTENT

Example of the right register:
"Brett on self-blame as a trauma response — how the brain keeps us in charge of things that weren't ours, and how 'I did something wrong' hardens into 'I am something wrong.'"
`.trim();

type Cue = { start: number; end: number; text: string };

function parseTimestamp(s: string): number {
  const m = s.match(/(\d+):(\d+):(\d+)\.(\d+)/);
  if (!m) return NaN;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}

function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = [];
  // Split on truly blank lines only (see detect-bounds.ts for rationale).
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
    if (end - start < 0.1) continue;
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

function parseHms(hms: string): number {
  const parts = hms.split(":").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return NaN;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function extractYamlValue(content: string, field: string): string | null {
  const re = new RegExp(`^${field}:\\s*(.*?)\\s*(?:#.*)?$`, "m");
  const m = content.match(re);
  if (!m) return null;
  const v = m[1].trim();
  if (v === "null" || v === "") return null;
  return v.replace(/^"(.*)"$/, "$1");
}

function hasField(content: string, field: string): boolean {
  const re = new RegExp(`^${field}:`, "m");
  return re.test(content);
}

function cuesToText(cues: Cue[]): string {
  const out: string[] = [];
  for (const cue of cues) {
    const last = out[out.length - 1];
    if (last !== cue.text) out.push(cue.text);
  }
  return out.join(" ");
}

async function generateDescription(
  anthropic: Anthropic,
  transcript: string,
  title: string,
): Promise<string> {
  const truncated =
    transcript.length > MAX_TRANSCRIPT_CHARS
      ? transcript.slice(0, MAX_TRANSCRIPT_CHARS) + "\n\n[...transcript truncated...]"
      : transcript;

  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 150,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Title: ${title}\n\nTranscript:\n${truncated}`,
      },
    ],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return "";
  return textBlock.text.trim().replace(/^["']|["']$/g, "");
}

function yamlQuote(s: string): string {
  // Double-quote YAML: escape embedded double quotes and backslashes
  return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

async function processStub(
  anthropic: Anthropic,
  filePath: string,
  filename: string,
): Promise<{ filename: string; status: "filled" | "skipped-existing" | "skipped-no-vtt" | "failed"; error?: string }> {
  const content = await readFile(filePath, "utf8");

  const currentDesc = extractYamlValue(content, "content_description");
  if (currentDesc !== null) {
    return { filename, status: "skipped-existing" };
  }

  const vttPath = extractYamlValue(content, "vtt_path");
  if (!vttPath) return { filename, status: "skipped-no-vtt", error: "no vtt_path field" };

  let vtt: string;
  try {
    vtt = await readFile(vttPath, "utf8");
  } catch {
    return { filename, status: "skipped-no-vtt", error: `VTT not found: ${vttPath}` };
  }

  let cues = parseVtt(vtt);

  // If bounds are set, filter cues to that range
  const startHms = extractYamlValue(content, "content_start");
  const endHms = extractYamlValue(content, "content_end");
  if (startHms && endHms) {
    const startS = parseHms(startHms);
    const endS = parseHms(endHms);
    if (!isNaN(startS) && !isNaN(endS)) {
      cues = cues.filter((c) => c.start >= startS && c.end <= endS);
    }
  }

  const transcript = cuesToText(cues);
  if (!transcript || transcript.length < 200) {
    return { filename, status: "skipped-no-vtt", error: "transcript too short after filtering" };
  }

  const title = extractYamlValue(content, "title") ?? extractYamlValue(content, "youtube_title") ?? "";

  try {
    const desc = await generateDescription(anthropic, transcript, title);
    if (!desc) return { filename, status: "failed", error: "empty response" };

    // Safety: detect LLM refusal/meta patterns. A valid description is
    // one or two sentences on a single logical line, third-person, about
    // the sermon content.
    if (desc.startsWith("NO_SERMON_CONTENT")) {
      return { filename, status: "skipped-no-vtt", error: "LLM: no sermon content" };
    }
    const refusalPrefixes = /^(I |Unfortunately|Sorry|I'?m (unable|sorry)|I apologize|I cannot|I can't|Without)/i;
    if (refusalPrefixes.test(desc) || desc.includes("\n\n")) {
      return { filename, status: "failed", error: `LLM refused/meta response: "${desc.slice(0, 60)}..."` };
    }

    // Replace the content_description line — handle both `null` value and
    // (defensively) missing field by inserting after title.
    let updated: string;
    if (/^content_description:\s*null.*$/m.test(content)) {
      updated = content.replace(
        /^content_description:\s*null.*$/m,
        `content_description: ${yamlQuote(desc)}`,
      );
    } else if (!hasField(content, "content_description")) {
      // Insert after title line
      updated = content.replace(
        /^(title:.*)$/m,
        `$1\ncontent_description: ${yamlQuote(desc)}`,
      );
    } else {
      return { filename, status: "failed", error: "description field has unexpected shape" };
    }

    await writeFile(filePath, updated);
    return { filename, status: "filled" };
  } catch (err) {
    return { filename, status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

function parseLimit(): number | null {
  const idx = process.argv.indexOf("--limit");
  if (idx === -1) return null;
  const n = Number(process.argv[idx + 1]);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`--limit requires a positive integer, got: ${process.argv[idx + 1]}`);
  }
  return n;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env");
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const limit = parseLimit();

  const entries = await readdir(CONTENT_DIR);
  let stubs = entries.filter((f) => f.endsWith(".md")).sort();

  // Identify stubs that actually need work (have null content_description)
  const pending: string[] = [];
  for (const f of stubs) {
    const c = await readFile(join(CONTENT_DIR, f), "utf8");
    const desc = extractYamlValue(c, "content_description");
    if (desc === null) pending.push(f);
  }

  if (limit !== null && pending.length > limit) {
    console.log(`Limiting to ${limit} of ${pending.length} stubs needing descriptions.`);
    pending.splice(limit);
  }

  if (pending.length === 0) {
    console.log("No stubs need descriptions. Nothing to do.");
    return;
  }

  console.log(`Generating descriptions for ${pending.length} stubs (~$${(pending.length * 0.01).toFixed(2)} via Haiku).`);
  console.log("");

  let filled = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const filename = pending[i];
    const filePath = join(CONTENT_DIR, filename);
    process.stdout.write(`[${i + 1}/${pending.length}] ${filename}... `);
    const r = await processStub(anthropic, filePath, filename);
    if (r.status === "filled") {
      filled++;
      console.log("ok");
    } else if (r.status === "skipped-existing") {
      skipped++;
      console.log("skipped (already has description)");
    } else if (r.status === "skipped-no-vtt") {
      skipped++;
      console.log(`skipped (${r.error})`);
    } else {
      failed++;
      console.log(`FAILED: ${r.error}`);
    }
  }

  console.log("");
  console.log(`Done: ${filled} filled, ${skipped} skipped, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
