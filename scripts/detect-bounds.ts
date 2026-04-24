/**
 * scripts/detect-bounds.ts — heuristic sermon start/end detection.
 *
 * Brett opens sermons with "grace and peace" and transitions into
 * communion with "we practice what's called an open table". This
 * script finds those phrases in each VTT and auto-fills the
 * content_start / content_end fields in the matching stub.
 *
 * Rules:
 *   - Start: first "grace and peace" AFTER 15 min into the video
 *     (welcome + worship usually takes at least that long).
 *   - End: first "we practice...open table" AFTER start + 10 min.
 *     Falls back to "open table" alone if the specific phrase doesn't
 *     match (possibly a captioning miss or slight phrasing drift).
 *   - If a marker isn't found, leaves the field null. Guest speakers
 *     and special services fall through to manual review.
 *
 * Idempotent: only touches fields that are currently null. Skips
 * stubs where bounds are already filled in (either by previous
 * detection or human review).
 *
 * Usage: npm run detect-bounds
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CONTENT_DIR = "scripts/transcripts/content";
const MIN_START_SECONDS = 15 * 60; // sermon starts no earlier than 15 min
const MIN_SERMON_SECONDS = 10 * 60; // sermon must be at least 10 min long
const MIN_END_SECONDS_STANDALONE = 25 * 60; // absolute floor for end-only detection
const END_STANDALONE_FRACTION = 0.6; // end-only must also be past this fraction of the video (filters worship-song phrases that happen to mention "come to the table")

type Cue = { start: number; end: number; text: string };
type Word = { t: number; text: string };

function parseTimestamp(s: string): number {
  const m = s.match(/(\d+):(\d+):(\d+)\.(\d+)/);
  if (!m) return NaN;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}

function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = [];
  // Split on truly blank lines only. Some auto-caption cues contain
  // space-only lines internally; a greedy /\n\s*\n/ split would break
  // blocks mid-cue and drop content.
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

function flattenToWords(cues: Cue[]): Word[] {
  const words: Word[] = [];
  for (const cue of cues) {
    for (const part of cue.text.split(/\s+/).filter(Boolean)) {
      words.push({ t: cue.start, text: part });
    }
  }
  return words;
}

function findPhraseTime(
  words: Word[],
  pattern: RegExp,
  afterSeconds: number,
  direction: "first" | "last" = "first",
): number | null {
  // Concatenate words into one string, tracking char offset per word
  const wordOffsets: number[] = [];
  let offset = 0;
  const parts: string[] = [];
  for (const w of words) {
    wordOffsets.push(offset);
    parts.push(w.text);
    offset += w.text.length + 1;
  }
  const text = parts.join(" ");

  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const global = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  let lastValid: number | null = null;
  while ((match = global.exec(text)) !== null) {
    // Find which word this match starts in
    const charOffset = match.index;
    let wordIdx = 0;
    for (let i = wordOffsets.length - 1; i >= 0; i--) {
      if (wordOffsets[i] <= charOffset) {
        wordIdx = i;
        break;
      }
    }
    const word = words[wordIdx];
    if (word && word.t >= afterSeconds) {
      if (direction === "first") return word.t;
      lastValid = word.t;
    }
  }
  return lastValid;
}

function toHms(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function parseHms(hms: string): number {
  const parts = hms.split(":").map(Number);
  if (parts.length !== 3) return NaN;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function extractYamlValue(content: string, field: string): string | null {
  const re = new RegExp(`^${field}:\\s*(.*?)\\s*(?:#.*)?$`, "m");
  const m = content.match(re);
  if (!m) return null;
  const v = m[1].trim();
  if (v === "null" || v === "") return null;
  // Strip surrounding quotes
  return v.replace(/^"(.*)"$/, "$1");
}

type StubResult = {
  filename: string;
  startDetected: boolean;
  endDetected: boolean;
  endPattern?: string;
  note?: string;
};

async function processStub(filePath: string, filename: string): Promise<StubResult> {
  const content = await readFile(filePath, "utf8");

  const currentStart = extractYamlValue(content, "content_start");
  const currentEnd = extractYamlValue(content, "content_end");

  // Skip if both already set
  if (currentStart !== null && currentEnd !== null) {
    return { filename, startDetected: false, endDetected: false, note: "both already set" };
  }

  // Get VTT path
  const vttPath = extractYamlValue(content, "vtt_path");
  if (!vttPath) {
    return { filename, startDetected: false, endDetected: false, note: "no vtt_path field" };
  }

  // Parse VTT
  let vtt: string;
  try {
    vtt = await readFile(vttPath, "utf8");
  } catch {
    return { filename, startDetected: false, endDetected: false, note: `VTT not found: ${vttPath}` };
  }

  const cues = parseVtt(vtt);
  const words = flattenToWords(cues);

  // Find start
  let detectedStart: number | null = null;
  if (currentStart === null) {
    detectedStart = findPhraseTime(words, /\bgrace\s+and\s+peace\b/i, MIN_START_SECONDS);
  }

  // Find end. Prefer using start + 10-min floor when start is known. When
  // start is unknown, fall back to a higher absolute floor (25 min) AND
  // require the match to be past 60% of the video — filters worship-song
  // references to "come to the table" etc that happen in the first half.
  let detectedEnd: number | null = null;
  let endPattern: string | undefined;
  if (currentEnd === null) {
    const startSeconds = currentStart !== null ? parseHms(currentStart) : detectedStart;
    const durationSecondsStr = extractYamlValue(content, "duration_seconds");
    const durationSeconds = durationSecondsStr ? Number(durationSecondsStr) : 0;
    const afterSeconds =
      startSeconds !== null
        ? startSeconds + MIN_SERMON_SECONDS
        : Math.max(MIN_END_SECONDS_STANDALONE, durationSeconds * END_STANDALONE_FRACTION);

    // Try multiple patterns in priority order: most specific to least.
    // Trinitarian benediction marks the literal end of the sermon, so use
    // the LAST occurrence to avoid catching mid-sermon scripture quotes
    // (Matthew 28:19, etc). Other patterns use the first occurrence.
    const patterns: Array<{
      re: RegExp;
      label: string;
      direction: "first" | "last";
    }> = [
      {
        // Brett's usual sermon-closing prayer ends with something like
        // "in the [powerful / life-changing] name of Jesus I pray. Amen."
        // Last-match to avoid scripture quotes that mention Jesus + amen
        // earlier in the sermon.
        re: /\bname\s+of\s+(jesus|christ|god)\b[\s\S]{0,60}\bamen\b/i,
        label: `"name of Jesus...Amen" (closing prayer)`,
        direction: "last",
      },
      {
        re: /\bin\s+the\s+name\s+of\s+the\s+father[\s\S]{0,40}holy\s+(spirit|ghost)/i,
        label: `"in the name of the father...holy spirit"`,
        direction: "last",
      },
      {
        re: /\bwe\s+practice\s+(what'?s?\s+called\s+)?an\s+open\s+table\b/i,
        label: `"we practice...open table"`,
        direction: "first",
      },
      { re: /\bopen\s+table\b/i, label: `"open table"`, direction: "first" },
      {
        re: /\b(come|gather)\s+to\s+the\s+table\b/i,
        label: `"come to the table"`,
        direction: "first",
      },
      { re: /\bcommunion\b/i, label: `"communion"`, direction: "first" },
    ];
    for (const p of patterns) {
      detectedEnd = findPhraseTime(words, p.re, afterSeconds, p.direction);
      if (detectedEnd !== null) {
        endPattern = p.label;
        break;
      }
    }
  }

  // Nothing found? Return without writing.
  if (detectedStart === null && detectedEnd === null) {
    return { filename, startDetected: false, endDetected: false };
  }

  let updated = content;
  if (detectedStart !== null) {
    updated = updated.replace(
      /^content_start:\s*null.*$/m,
      `content_start: "${toHms(detectedStart)}"     # auto: "grace and peace" — verify`,
    );
  }
  if (detectedEnd !== null) {
    updated = updated.replace(
      /^content_end:\s*null.*$/m,
      `content_end: "${toHms(detectedEnd)}"       # auto: ${endPattern} — verify`,
    );
  }

  if (updated !== content) {
    await writeFile(filePath, updated);
  }

  return {
    filename,
    startDetected: detectedStart !== null,
    endDetected: detectedEnd !== null,
    endPattern,
  };
}

async function main() {
  const entries = await readdir(CONTENT_DIR);
  const stubs = entries.filter((f) => f.endsWith(".md")).sort();

  let bothDetected = 0;
  let startOnly = 0;
  let endOnly = 0;
  let neither = 0;
  let skipped = 0;

  for (const filename of stubs) {
    const filePath = join(CONTENT_DIR, filename);
    const r = await processStub(filePath, filename);

    if (r.note === "both already set") {
      skipped++;
    } else if (r.startDetected && r.endDetected) {
      bothDetected++;
    } else if (r.startDetected) {
      startOnly++;
    } else if (r.endDetected) {
      endOnly++;
    } else {
      neither++;
    }
  }

  console.log(
    `Bounds detection: ${bothDetected} full, ${startOnly} start-only, ${endOnly} end-only, ` +
      `${neither} no match, ${skipped} already set. (${stubs.length} total)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
