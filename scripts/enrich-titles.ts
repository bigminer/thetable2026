/**
 * scripts/enrich-titles.ts — fill in better titles + series from
 * descriptions, transcripts, and cross-stub normalization.
 *
 * Runs after make-stubs. Only touches fields that still hold their
 * defaults, so it won't overwrite anything a reviewer has edited.
 *
 * Title rules:
 *   1. If youtube_title has a clear "Series | Episode" split, use the
 *      right side as title (and the left as a series candidate).
 *   2. If youtube_title is generic ("The Table Live"), try the info.json
 *      description's first line, then search the VTT for
 *      "the title of my message is <X>".
 *   3. If youtube_title starts with "The Table Live - ..." or similar
 *      prefix, strip the prefix and use what's left.
 *
 * Series rules:
 *   1. From the pipe-split above, the left side is a series candidate.
 *   2. If still no series, search the VTT for "part N of our series
 *      [titled|called|on] <X>" or similar.
 *   3. Normalize any detected series against series values already in
 *      other stubs (case/spelling match), so "Enchanted" and "enchanted"
 *      collapse to one canonical form.
 *
 * Usage: npm run enrich-titles
 */

import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseVtt } from "../src/lib/sermon-chatbot/vtt.ts";

const CONTENT_DIR = "scripts/transcripts/content";
const RAW_DIR = "scripts/transcripts/raw";

// ---- Helpers ------------------------------------------------------------

const BOILERPLATE_PREFIXES = [
  "join us",
  "the table is a",
  "welcome to the table",
  "subscribe to",
  "follow us",
  "service at",
];

const LOWERCASE_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "nor",
  "for",
  "in",
  "on",
  "at",
  "to",
  "of",
  "with",
  "by",
  "from",
  "is",
  "as",
  "if",
]);

function isBoilerplate(s: string): boolean {
  const lower = s.toLowerCase().trim();
  return BOILERPLATE_PREFIXES.some((p) => lower.startsWith(p));
}

function titleCase(s: string): string {
  const words = s.split(/\s+/);
  return words
    .map((w, i) => {
      if (!w) return w;
      if (i > 0 && LOWERCASE_WORDS.has(w.toLowerCase())) return w.toLowerCase();
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function dedupeRepeatedPhrase(s: string): string {
  // Collapse "X Y X Y" → "X Y" (word-level exact repeat)
  const words = s.split(/\s+/);
  const n = words.length;
  if (n >= 2 && n % 2 === 0) {
    const half = n / 2;
    const first = words.slice(0, half).join(" ");
    const second = words.slice(half).join(" ");
    if (first === second) return first;
  }
  return s;
}

function cleanTitle(raw: string, fromTranscript: boolean = false): string {
  // Strip trailing noise punctuation but preserve `?` and `!` which often
  // belong to the title itself (e.g. "Why Faith?").
  let s = raw.trim().replace(/^['"]|['"]$/g, "").replace(/[.,;:]+$/, "");
  s = s.replace(/\s+/g, " ");
  s = dedupeRepeatedPhrase(s);
  if (fromTranscript && s === s.toLowerCase()) {
    s = titleCase(s);
  }
  return s;
}

// ---- YAML field access --------------------------------------------------

// YAML double-quoted value: `"..."` where embedded `\"` and `\\` are
// escapes. Pattern matches one unescaped closing quote.
const QUOTED_VALUE = String.raw`"((?:[^"\\]|\\.)*)"`;

function unescapeYamlDouble(s: string): string {
  return s.replace(/\\(["\\])/g, "$1");
}

function escapeYamlDouble(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getField(stubText: string, field: string): string | null {
  const m = stubText.match(new RegExp(`^${field}:\\s*${QUOTED_VALUE}`, "m"));
  return m ? unescapeYamlDouble(m[1]) : null;
}

function isFieldNull(stubText: string, field: string): boolean {
  return new RegExp(`^${field}:\\s*null\\b`, "m").test(stubText);
}

function setQuotedField(
  stubText: string,
  field: string,
  value: string,
): string {
  const escaped = escapeYamlDouble(value);
  return stubText.replace(
    new RegExp(`^(${field}:\\s*)(?:${QUOTED_VALUE}|null\\b)(.*)$`, "m"),
    `$1"${escaped}"$3`,
  );
}

// ---- Title detection ----------------------------------------------------

type TitleResult = {
  title: string;
  series: string | null;
  source: "pipe-split" | "prefix-strip" | "description" | "transcript";
};

const GENERIC_TITLE_RE = /^the\s+table\s+(live|online)\.?$/i;
const TABLE_LIVE_PREFIX_RE = /^the\s+table\s+(?:live|online)\s*[-|]\s*(.+)$/i;

function splitPipeTitle(yt: string): { series: string; title: string } | null {
  const idx = yt.indexOf("|");
  if (idx === -1) return null;
  const left = yt.slice(0, idx).trim();
  const right = yt.slice(idx + 1).trim();
  if (!left || !right) return null;
  return { series: left, title: right };
}

// Prefixes that look like series but aren't — they're roles, categories,
// or otherwise generic umbrella strings.
const SERIES_BLACKLIST = new Set([
  "guest speaker",
  "the table live",
  "the table online",
]);

const SEPARATOR_REGEX = /(\s*\|\s*|\s+-\s+|\s*:\s+)/g;

function extractAllPrefixes(title: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  SEPARATOR_REGEX.lastIndex = 0;
  while ((m = SEPARATOR_REGEX.exec(title)) !== null) {
    const prefix = title.slice(0, m.index).trim();
    if (prefix.length < 3 || prefix.length > 60) continue;
    if (seen.has(prefix)) continue;
    seen.add(prefix);
    out.push(prefix);
  }
  return out;
}

type PrefixMap = Map<string, string>; // key → canonical form

function findRecurringPrefixes(titles: string[]): PrefixMap {
  const counts = new Map<string, number>();
  const canonicalByKey = new Map<string, string>();
  const score = (v: string) => v.length - v.replace(/[^a-z0-9\s]/gi, "").length;

  for (const t of titles) {
    for (const p of extractAllPrefixes(t)) {
      const k = seriesKey(p);
      counts.set(k, (counts.get(k) ?? 0) + 1);
      const existing = canonicalByKey.get(k);
      if (!existing || score(p) > score(existing) || (score(p) === score(existing) && p.length > existing.length)) {
        canonicalByKey.set(k, p);
      }
    }
  }

  const out: PrefixMap = new Map();
  for (const [k, c] of counts) {
    if (c < 2) continue;
    if (SERIES_BLACKLIST.has(k)) continue;
    out.set(k, canonicalByKey.get(k)!);
  }
  return out;
}

function splitByRecurringPrefix(
  title: string,
  recurring: PrefixMap,
): { series: string; title: string } | null {
  let best: { series: string; rest: string; len: number } | null = null;
  for (const p of extractAllPrefixes(title)) {
    const k = seriesKey(p);
    if (!recurring.has(k)) continue;
    // Find the separator that follows this prefix in the original title
    const after = title.slice(p.length);
    const sepMatch = after.match(/^(\s*\|\s*|\s+-\s+|\s*:\s+)/);
    if (!sepMatch) continue;
    const rest = after.slice(sepMatch[0].length).trim();
    if (!rest) continue;
    const canonical = recurring.get(k)!;
    if (!best || canonical.length > best.len) {
      best = { series: canonical, rest, len: canonical.length };
    }
  }
  return best ? { series: best.series, title: best.rest } : null;
}

// Verify a candidate series name actually gets spoken during the sermon.
// Recurring title prefixes can be incidental ("The Purpose of Prayer"
// appearing in two titles doesn't make it a series) — requiring Brett to
// actually name the series in the transcript filters those out.
function verifySeriesInVtt(candidate: string, vttText: string): boolean {
  const cues = parseVtt(vttText);
  const flat = cues
    .map((c) => c.text)
    .join(" ")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

  const needle = candidate
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!needle || needle.length < 3) return false;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(flat);
}

function detectTitleFromDescription(infoJsonText: string): string | null {
  try {
    const info = JSON.parse(infoJsonText);
    const desc = (info.description as string | undefined) ?? "";
    const firstLine = desc.split(/\r?\n/)[0]?.trim();
    if (!firstLine) return null;
    if (isBoilerplate(firstLine)) return null;
    if (firstLine.length < 3 || firstLine.length > 120) return null;
    return cleanTitle(firstLine);
  } catch {
    return null;
  }
}

function detectTitleFromVtt(vttText: string): string | null {
  const cues = parseVtt(vttText);
  const flat = cues.map((c) => c.text).join(" ");
  const patterns = [
    /\btitle\s+of\s+my\s+message[^.?!]{0,80}?\bis\b\s+([^.?!]{3,80}?)(?:[.?!]|\band\b|\bum\b|\buh\b)/i,
    /\bmy\s+message\s+(?:today|tonight|this\s+(?:morning|evening))\s*,?\s*is\s+([^.?!]{3,80}?)(?:[.?!]|\band\b|\bum\b|\buh\b)/i,
  ];
  for (const re of patterns) {
    const m = flat.match(re);
    if (m) return cleanTitle(m[1], true);
  }
  return null;
}

function resolveTitle(
  stub: string,
  ytTitle: string,
  infoJsonText: string | null,
  vttText: string | null,
  recurring: PrefixMap,
): TitleResult | null {
  // Case 1 — pipe split in the youtube title (highest confidence)
  const piped = splitPipeTitle(ytTitle);
  if (piped) {
    return {
      title: cleanTitle(piped.title),
      series: cleanTitle(piped.series),
      source: "pipe-split",
    };
  }

  // Case 2 — generic-prefix with separator ("The Table Live - Real Title")
  // Tried before recurring-prefix because "The Table Live" is blacklisted
  // anyway and this branch also recovers the meaningful tail.
  const prefixMatch = ytTitle.match(TABLE_LIVE_PREFIX_RE);
  if (prefixMatch) {
    return {
      title: cleanTitle(prefixMatch[1]),
      series: null,
      source: "prefix-strip",
    };
  }

  // Case 3 — recurring prefix (non-pipe series). "Sticks & Stones: Sameness"
  // matches because "Sticks & Stones" appears as a series prefix in other
  // titles too. Picks the LONGEST matching recurring prefix, so
  // "Lent - the way of the cross : X" wins over bare "Lent".
  // Only accept if the VTT confirms Brett actually names the series during
  // the sermon — otherwise the "recurring prefix" is likely incidental.
  const recurringSplit = splitByRecurringPrefix(ytTitle, recurring);
  if (recurringSplit && vttText && verifySeriesInVtt(recurringSplit.series, vttText)) {
    return {
      title: cleanTitle(recurringSplit.title),
      series: cleanTitle(recurringSplit.series),
      source: "pipe-split",
    };
  }

  // Case 4 — exact generic title ("The Table Live")
  if (GENERIC_TITLE_RE.test(ytTitle.trim())) {
    if (infoJsonText) {
      const fromDesc = detectTitleFromDescription(infoJsonText);
      if (fromDesc) return { title: fromDesc, series: null, source: "description" };
    }
    if (vttText) {
      const fromVtt = detectTitleFromVtt(vttText);
      if (fromVtt) return { title: fromVtt, series: null, source: "transcript" };
    }
    return null;
  }

  return null;
}

// ---- Series normalization -----------------------------------------------

// Key used to match series across stubs regardless of punctuation/case.
// So "Epiphany: A Radical Invitation" and "Epiphany a Radical Invitation"
// collapse to the same series.
function seriesKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function buildCanonicalSeriesMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const files = await readdir(CONTENT_DIR);
  // Scan twice — first pass collects all existing series, second pass picks
  // the "best" canonical form per key (preferring ones with more punctuation,
  // which are usually the description/title-sourced ones).
  const allValues: string[] = [];
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const text = await readFile(join(CONTENT_DIR, f), "utf8");
    const s = getField(text, "series");
    if (s) allValues.push(s);
  }
  for (const s of allValues) {
    const key = seriesKey(s);
    const existing = map.get(key);
    // Prefer the value that has more non-alphanumeric chars (richer
    // punctuation = more likely the correctly-cased title form).
    const score = (v: string) => v.length - v.replace(/[^a-z0-9\s]/gi, "").length;
    if (!existing || score(s) > score(existing)) {
      map.set(key, s);
    }
  }
  return map;
}

function normalizeSeries(candidate: string, canonical: Map<string, string>): string {
  return canonical.get(seriesKey(candidate)) ?? candidate;
}

// ---- Main ---------------------------------------------------------------

async function main() {
  const canonicalSeries = await buildCanonicalSeriesMap();

  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith(".md"));

  // Collect all youtube_titles to find recurring non-pipe prefixes.
  const allTitles: string[] = [];
  for (const f of files) {
    const text = await readFile(join(CONTENT_DIR, f), "utf8");
    const yt = getField(text, "youtube_title");
    if (yt) allTitles.push(yt);
  }
  const recurringPrefixes = findRecurringPrefixes(allTitles);
  let titleUpdated = 0;
  let seriesUpdatedNew = 0;
  let seriesNormalized = 0;
  let skipped = 0;

  for (const filename of files) {
    const path = join(CONTENT_DIR, filename);
    const original = await readFile(path, "utf8");
    let text = original;

    const ytTitle = getField(text, "youtube_title");
    const currentTitle = getField(text, "title");
    if (!ytTitle || !currentTitle) continue;

    // Only touch the title if it still equals youtube_title (default unchanged)
    const titleIsDefault = currentTitle === ytTitle;
    const seriesIsNull = isFieldNull(text, "series");
    const stubSlug = filename.replace(/\.md$/, "");
    const infoPath = join(RAW_DIR, `${stubSlug}.info.json`);
    const vttPath = join(RAW_DIR, `${stubSlug}.en.vtt`);
    const infoText = existsSync(infoPath)
      ? await readFile(infoPath, "utf8")
      : null;
    const vttText = existsSync(vttPath) ? await readFile(vttPath, "utf8") : null;

    // --- Title + pipe-split series
    let pipeSeries: string | null = null;
    if (titleIsDefault) {
      const result = resolveTitle(
        stubSlug,
        ytTitle,
        infoText,
        vttText,
        recurringPrefixes,
      );
      if (result) {
        text = setQuotedField(text, "title", result.title);
        titleUpdated++;
        if (result.series) pipeSeries = result.series;
      }
    }

    // --- Series detection (pipe-split only; VTT-based detection was too
    //     noisy — truncating "Sticks and Stones" at "and", missing
    //     punctuation, etc. Volunteer fills in the rest manually.)
    if (seriesIsNull && pipeSeries) {
      const canonical = normalizeSeries(pipeSeries, canonicalSeries);
      const wasNormalized = canonical !== pipeSeries;
      text = setQuotedField(text, "series", canonical);
      if (wasNormalized) seriesNormalized++;
      else seriesUpdatedNew++;
      const key = seriesKey(canonical);
      if (!canonicalSeries.has(key)) canonicalSeries.set(key, canonical);
    }

    if (text !== original) await writeFile(path, text);
    else skipped++;
  }

  console.log(`Titles updated:        ${titleUpdated}`);
  console.log(`Series added:          ${seriesUpdatedNew}`);
  console.log(`Series case-normalized: ${seriesNormalized}`);
  console.log(`Stubs unchanged:       ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
