/**
 * scripts/youtube-discovery.ts
 *
 * Weekly YouTube discovery wrapper for The Table automation pipeline.
 *
 * Notes:
 * - Exclude patterns are regexes read from scripts/automation.config.json.
 * - The YouTube source URL (channel or playlist) must be supplied via
 *   YOUTUBE_SOURCE_URL before this wrapper produces real output. See decision D3.
 * - Dry-run is the default and prints normalized discoveries to stdout.
 * - --commit is reserved for future use in this card and does not write files.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type AutomationConfig = {
  youtubeDiscovery?: {
    sourceUrl?: string;
    excludePatterns?: string[];
    notes?: string;
  };
};

type RawYoutubeItem = Record<string, unknown>;

export type NormalizedYoutubeItem = {
  youtubeId: string;
  title: string;
  uploadDate: string;
  sourceUrl: string;
};

type NormalizationResult = {
  items: NormalizedYoutubeItem[];
  excludedCount: number;
  skippedCount: number;
};

type SourceResolutionInput = {
  envSourceUrl?: string;
  configSourceUrl?: string;
};

function isPlaceholderSourceUrl(value: string | undefined | null): boolean {
  if (typeof value !== "string") return true;
  const trimmed = value.trim();
  if (!trimmed) return true;

  const normalized = trimmed.toLowerCase();
  const compact = normalized.replace(/[^a-z0-9]+/g, "");
  return [
    "todo",
    "tbd",
    "placeholder",
    "setviaenv",
    "setviayoutubesourceurl",
    "supplyviayoutubesourceurl",
    "supplyviayoutubesourceurlbeforethiswrapperproducesrealoutput",
    "unknown",
    "n/a",
    "na",
  ].some((needle) => normalized.includes(needle) || compact.includes(needle.replace(/[^a-z0-9]+/g, "")));
}

function resolveYoutubeSourceUrl(input: SourceResolutionInput): string | null {
  if (input.envSourceUrl !== undefined) {
    return isPlaceholderSourceUrl(input.envSourceUrl) ? null : input.envSourceUrl.trim();
  }

  if (input.configSourceUrl !== undefined) {
    return isPlaceholderSourceUrl(input.configSourceUrl) ? null : input.configSourceUrl.trim();
  }

  return null;
}

function parseDateFromTimestamp(timestamp: number): string | null {
  if (!Number.isFinite(timestamp)) return null;
  const milliseconds = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function normalizeUploadDate(source: RawYoutubeItem): string | null {
  const uploadDate = source.upload_date;
  if (typeof uploadDate === "string") {
    const trimmed = uploadDate.trim();
    if (/^\d{8}$/.test(trimmed)) {
      return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const timestamp = source.timestamp;
  if (typeof timestamp === "number") {
    return parseDateFromTimestamp(timestamp);
  }
  if (typeof timestamp === "string" && timestamp.trim()) {
    const parsed = Number(timestamp);
    if (!Number.isNaN(parsed)) return parseDateFromTimestamp(parsed);
  }

  const releaseTimestamp = source.release_timestamp;
  if (typeof releaseTimestamp === "number") {
    return parseDateFromTimestamp(releaseTimestamp);
  }
  if (typeof releaseTimestamp === "string" && releaseTimestamp.trim()) {
    const parsed = Number(releaseTimestamp);
    if (!Number.isNaN(parsed)) return parseDateFromTimestamp(parsed);
  }

  return null;
}

function extractYoutubeId(source: RawYoutubeItem): string | null {
  const directId = source.id;
  if (typeof directId === "string" && directId.trim()) {
    return directId.trim();
  }

  const videoId = source.video_id;
  if (typeof videoId === "string" && videoId.trim()) {
    return videoId.trim();
  }

  const url = source.url;
  if (typeof url === "string" && url.trim()) {
    const trimmed = url.trim();
    try {
      const parsed = new URL(trimmed);
      const candidate = parsed.searchParams.get("v");
      if (candidate) return candidate;

      if (parsed.hostname === "youtu.be") {
        const pathId = parsed.pathname.split("/").filter(Boolean)[0];
        if (pathId) return pathId;
      }

      const lastPathPart = parsed.pathname.split("/").filter(Boolean).pop();
      if (lastPathPart && lastPathPart !== "watch" && lastPathPart !== "shorts") {
        return lastPathPart;
      }
    } catch {
      return trimmed;
    }
  }

  return null;
}

function extractTitle(source: RawYoutubeItem): string | null {
  const title = source.title ?? source.fulltitle ?? source.webpage_url_basename;
  if (typeof title === "string" && title.trim()) {
    return title.trim();
  }
  return null;
}

function compileExcludeMatchers(patterns: string[]): RegExp[] {
  return patterns
    .map((pattern) => pattern.trim())
    .filter(Boolean)
    .map((pattern) => {
      try {
        return new RegExp(pattern, "i");
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid exclude regex ${JSON.stringify(pattern)}: ${reason}`);
      }
    });
}

function matchesAnyPattern(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function parseYtDlpFlatPlaylistOutput(output: string): RawYoutubeItem[] {
  const trimmed = output.trim();
  if (!trimmed) return [];

  const maybeParse = (text: string): RawYoutubeItem[] | null => {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is RawYoutubeItem => typeof entry === "object" && entry !== null);
      }
      if (typeof parsed === "object" && parsed !== null) {
        const maybeEntries = (parsed as { entries?: unknown }).entries;
        if (Array.isArray(maybeEntries)) {
          return maybeEntries.filter((entry): entry is RawYoutubeItem => typeof entry === "object" && entry !== null);
        }
        return [parsed as RawYoutubeItem];
      }
    } catch {
      return null;
    }
    return null;
  };

  const whole = maybeParse(trimmed);
  if (whole) return whole;

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => maybeParse(line) ?? []);
}

function normalizeDiscoveryItems(items: RawYoutubeItem[], excludeMatchers: RegExp[]): NormalizationResult {
  const normalized: NormalizedYoutubeItem[] = [];
  let excludedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const youtubeId = extractYoutubeId(item);
    const title = extractTitle(item);
    const uploadDate = normalizeUploadDate(item);

    if (!youtubeId || !title || !uploadDate) {
      skippedCount += 1;
      continue;
    }

    if (matchesAnyPattern(youtubeId, excludeMatchers) || matchesAnyPattern(title, excludeMatchers)) {
      excludedCount += 1;
      continue;
    }

    normalized.push({
      youtubeId,
      title,
      uploadDate,
      sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    });
  }

  return { items: normalized, excludedCount, skippedCount };
}

async function loadAutomationConfig(): Promise<AutomationConfig> {
  const configPath = resolve("scripts/automation.config.json");
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as AutomationConfig;
}

async function runYtDlpDiscovery(sourceUrl: string): Promise<RawYoutubeItem[]> {
  try {
    const { stdout } = await execFileAsync(
      "yt-dlp",
      ["--dump-json", "--flat-playlist", "--no-warnings", sourceUrl],
      { maxBuffer: 10 * 1024 * 1024 },
    );

    return parseYtDlpFlatPlaylistOutput(stdout);
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("yt-dlp was not found on PATH. Install yt-dlp before running this wrapper.");
    }

    if (error instanceof Error) {
      const stderr = (error as NodeJS.ErrnoException & { stderr?: string }).stderr;
      if (typeof stderr === "string" && stderr.trim()) {
        throw new Error(`yt-dlp failed: ${stderr.trim()}`);
      }
      throw new Error(`yt-dlp failed: ${error.message}`);
    }

    throw error;
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const commitRequested = args.has("--commit");
  const dryRunRequested = args.has("--dry-run") || !commitRequested;

  const config = await loadAutomationConfig();
  const configSourceUrl = config.youtubeDiscovery?.sourceUrl;
  const sourceUrl = resolveYoutubeSourceUrl({
    envSourceUrl: process.env.YOUTUBE_SOURCE_URL,
    configSourceUrl,
  });

  if (!sourceUrl) {
    console.error(
      "YouTube source URL is not configured. Set YOUTUBE_SOURCE_URL to a real channel or playlist URL before running this wrapper. See decision D3.",
    );
    process.exitCode = 1;
    return;
  }

  const excludePatterns = config.youtubeDiscovery?.excludePatterns ?? [];
  const excludeMatchers = compileExcludeMatchers(excludePatterns);

  if (commitRequested && !dryRunRequested) {
    console.error("--commit is reserved for future use; running dry-run only in this card.");
  }

  const rawItems = await runYtDlpDiscovery(sourceUrl);
  const result = normalizeDiscoveryItems(rawItems, excludeMatchers);

  if (result.skippedCount > 0) {
    console.error(`Skipped ${result.skippedCount} item(s) with incomplete yt-dlp data.`);
  }
  console.error(`Excluded ${result.excludedCount} item(s) using ${excludeMatchers.length} regex pattern(s).`);

  if (!dryRunRequested) {
    console.error("Commit mode is not enabled in this card; emitting dry-run output only.");
  }

  process.stdout.write(`${JSON.stringify(result.items, null, 2)}\n`);
}

export {
  compileExcludeMatchers,
  isPlaceholderSourceUrl,
  main,
  normalizeDiscoveryItems,
  normalizeUploadDate,
  parseYtDlpFlatPlaylistOutput,
  resolveYoutubeSourceUrl,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  });
}
