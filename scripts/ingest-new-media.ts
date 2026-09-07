/**
 * scripts/ingest-new-media.ts
 *
 * Bounded first-pass media ingestion for a single series. Default mode is dry-run.
 * It can read a podcast RSS feed directly, and it still understands the broader
 * YouTube + podcast ingestion workflow used elsewhere in the pipeline.
 *
 * D4 note: the podcast RSS URL is a live rollout decision and should be supplied
 * in automation.config.json (or via --feed) before this is treated as production.
 *
 * Usage:
 *   npm run automation:ingest-one-series
 *   npm run automation:ingest-one-series -- --write
 *   AUTOMATION_DRY_RUN=1 npm run automation:ingest-one-series
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { makeSlug } from "./lib/slug.ts";
import { checkDuplicate, DuplicateStatus } from "./lib/duplicate-detection.ts";

type AutomationSource = {
  id: string;
  kind: string;
  label: string;
  channelUrl?: string | null;
  playlistUrl?: string | null;
  feedUrl?: string | null;
  requiredSourceFields?: string[];
  notes?: string;
};

type SeriesScope = {
  slug: string;
  title: string;
  seriesLink: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  titleHints?: string[];
  messageDir?: string;
  transcriptArchiveDir?: string;
  youtubeTitleOverrides?: Record<string, string>;
};

type AutomationConfig = {
  name: string;
  description?: string;
  schedule: string;
  runMode: string;
  seriesScope: SeriesScope;
  defaults: {
    writeContentFiles?: boolean;
    [key: string]: unknown;
  };
  sources: AutomationSource[];
};

type PodcastItem = {
  title: string;
  normalizedTitle: string;
  publishedDate: string;
  link: string;
  guid: string;
  spotifyEpisodeUrl: string;
};

type YouTubeItem = {
  title: string;
  normalizedTitle: string;
  publishedDate: string;
  sourceUrl: string;
  youtubeId: string;
};

type ExistingMessage = {
  path: string;
  slug: string;
  title?: string;
  normalizedTitle?: string;
  date?: string;
  sourceUrl?: string;
  podcastUrl?: string;
  series?: string;
};

type MatchedPair = {
  key: string;
  youtube?: YouTubeItem;
  podcast?: PodcastItem;
  score: number;
  dateDeltaDays: number;
  status: "existing" | "missing" | "ambiguous" | "unpaired";
  existingMessage?: ExistingMessage;
  reasons: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

type CliOptions = {
  writeMode: boolean;
  dryRun: boolean;
  feedUrl?: string;
  limit: number;
};

function isTruthyEnv(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseCliArgs(argv: string[]): CliOptions {
  let feedUrl: string | undefined;
  let limit = 5;
  let dryRun = isTruthyEnv(process.env.AUTOMATION_DRY_RUN);
  let writeMode = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--write") {
      writeMode = true;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--feed") {
      feedUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--feed=")) {
      feedUrl = arg.slice("--feed=".length);
      continue;
    }

    if (arg === "--limit") {
      const rawLimit = Number.parseInt(argv[index + 1] ?? "", 10);
      if (Number.isFinite(rawLimit) && rawLimit > 0) limit = rawLimit;
      index += 1;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const rawLimit = Number.parseInt(arg.slice("--limit=".length), 10);
      if (Number.isFinite(rawLimit) && rawLimit > 0) limit = rawLimit;
    }
  }

  return { writeMode, dryRun, feedUrl, limit };
}

const cli = parseCliArgs(process.argv.slice(2));

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripTags(input: string): string {
  return decodeEntities(input).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getTagValue(block: string, tagName: string): string | null {
  const escaped = tagName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`, "i"));
  return match ? stripTags(match[1]) : null;
}

function getAttributeValue(block: string, tagName: string, attrName: string): string | null {
  const escapedTag = tagName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const escapedAttr = attrName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const match = block.match(new RegExp(`<${escapedTag}[^>]*\b${escapedAttr}="([^"]+)"[^>]*/?>`, "i"));
  return match ? decodeEntities(match[1]) : null;
}

function normalizeTitle(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyYoutubeTitleOverride(scope: SeriesScope, youtubeId: string, title: string): string {
  return scope.youtubeTitleOverrides?.[youtubeId] ?? title;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function parseDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const aDate = new Date(`${a}T00:00:00Z`);
  const bDate = new Date(`${b}T00:00:00Z`);
  return Math.round(Math.abs(aDate.getTime() - bDate.getTime()) / DAY_MS);
}

function withinRange(date: string, scope: SeriesScope): boolean {
  const start = scope.dateRange?.start;
  const end = scope.dateRange?.end;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function titleMatchesScope(title: string, scope: SeriesScope): boolean {
  const normalized = normalizeTitle(title);
  return (scope.titleHints ?? []).some((hint) => normalized.includes(normalizeTitle(hint)));
}

function scoreTitlePair(a: string, b: string): number {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  if (left === right) return 100;
  if (left.includes(right) || right.includes(left)) return 85;
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const maxSize = Math.max(leftTokens.size, rightTokens.size, 1);
  return Math.round((overlap / maxSize) * 100);
}

function deriveYoutubeFeedUrl(source: AutomationSource): string | null {
  if (source.feedUrl?.trim()) return source.feedUrl.trim();
  if (!source.channelUrl) return null;

  try {
    const url = new URL(source.channelUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const channelIdx = parts.indexOf("channel");
    if (channelIdx >= 0 && parts[channelIdx + 1]) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${parts[channelIdx + 1]}`;
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; thetable-media-ingestion/1.0)",
      accept: "application/xml,text/xml,application/atom+xml,application/rss+xml,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

function parsePodcastFeed(xml: string): PodcastItem[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  return items
    .map((block) => {
      const title = getTagValue(block, "title");
      const pubDate = getTagValue(block, "pubDate");
      const link = getTagValue(block, "link") ?? getTagValue(block, "guid");
      const guid = getTagValue(block, "guid") ?? link;
      if (!title || !pubDate || !link || !guid) return null;
      const resolvedLink = link as string;
      const resolvedGuid = guid as string;
      const spotifyEpisodeUrl = resolvedLink;
      return {
        title,
        normalizedTitle: normalizeTitle(title),
        publishedDate: parseDate(pubDate),
        link: resolvedLink,
        guid: resolvedGuid,
        spotifyEpisodeUrl,
      } satisfies PodcastItem;
    })
    .filter((item): item is PodcastItem => item !== null);
}

const SAMPLE_PODCAST_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Table Podcast (sample feed)</title>
    <item>
      <title>Sample episode one</title>
      <pubDate>Sun, 14 Sep 2025 09:00:00 GMT</pubDate>
      <link>https://example.com/podcast/sample-episode-one</link>
      <guid>sample-episode-one</guid>
    </item>
    <item>
      <title>Sample episode two</title>
      <pubDate>Sun, 21 Sep 2025 09:00:00 GMT</pubDate>
      <link>https://example.com/podcast/sample-episode-two</link>
      <guid>sample-episode-two</guid>
    </item>
  </channel>
</rss>`;

function isPlaceholderFeedUrl(feedUrl: string | undefined | null): boolean {
  if (!feedUrl) return true;
  const trimmed = feedUrl.trim();
  return (
    trimmed.length === 0 ||
    trimmed === "placeholder" ||
    trimmed === "mock" ||
    trimmed === "sample" ||
    trimmed.startsWith("placeholder:") ||
    trimmed.startsWith("mock:") ||
    trimmed.startsWith("sample:")
  );
}

async function getPodcastFeedXml(feedUrl: string | undefined, dryRun: boolean): Promise<{ xml: string; sourceLabel: string }> {
  if (dryRun || isPlaceholderFeedUrl(feedUrl)) {
    return {
      xml: SAMPLE_PODCAST_FEED,
      sourceLabel: dryRun ? "sample feed (dry-run)" : "sample feed (placeholder)",
    };
  }

  return {
    xml: await fetchText(feedUrl!),
    sourceLabel: feedUrl!,
  };
}

function printPodcastItems(items: PodcastItem[], limit: number): void {
  const sorted = [...items].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
  const latest = sorted.slice(0, limit);

  console.log(`Podcast items: ${latest.length} of ${items.length}`);
  for (const item of latest) {
    console.log(`- title: ${item.title}`);
    console.log(`  date: ${item.publishedDate}`);
    console.log(`  link: ${item.link}`);
    console.log(`  guid: ${item.guid}`);
  }
}

function parseYoutubeFeed(xml: string, scope?: SeriesScope): YouTubeItem[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]);
  return entries
    .map((block) => {
      const rawTitle = getTagValue(block, "title");
      const published = getTagValue(block, "published") ?? getTagValue(block, "updated");
      const youtubeId = getTagValue(block, "yt:videoId") ?? getTagValue(block, "videoId");
      const sourceUrl = getAttributeValue(block, "link", "href") ?? (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null);
      if (!rawTitle || !published || !youtubeId || !sourceUrl) return null;
      const title = scope ? applyYoutubeTitleOverride(scope, youtubeId, rawTitle) : rawTitle;
      return {
        title,
        normalizedTitle: normalizeTitle(title),
        publishedDate: parseDate(published),
        sourceUrl,
        youtubeId,
      } satisfies YouTubeItem;
    })
    .filter((item): item is YouTubeItem => item !== null);
}

function getFrontmatterBlock(content: string): string {
  if (!content.startsWith("---\n")) return content;
  const end = content.indexOf("\n---", 4);
  if (end < 0) return content;
  return content.slice(4, end);
}

function extractYamlField(content: string, field: string): string | undefined {
  const frontmatter = getFrontmatterBlock(content);
  const match = frontmatter.match(new RegExp(`^${field}:\s*(.+)$`, "m"));
  if (!match) return undefined;

  const raw = match[1].trim();
  if ((raw.startsWith('"') && raw.includes('"')) || (raw.startsWith("'") && raw.includes("'"))) {
    const quote = raw[0];
    const end = raw.indexOf(quote, 1);
    if (end > 0) return raw.slice(1, end);
  }

  return raw.replace(/\s+#.*$/, "");
}

function messageBelongsToScope(seriesValue: string | undefined, scope: SeriesScope): boolean {
  if (!seriesValue) return false;
  const normalizedSeries = normalizeTitle(seriesValue);
  const normalizedScopeTitle = normalizeTitle(scope.title);
  return (
    seriesValue.includes(`/series/${scope.slug}.md`) ||
    seriesValue.includes(`series/${scope.slug}.md`) ||
    normalizedSeries.includes(normalizedScopeTitle)
  );
}

async function loadExistingMessages(scope: SeriesScope): Promise<ExistingMessage[]> {
  const messageDir = resolve(scope.messageDir ?? "src/content/messages");
  const files = await readdir(messageDir);
  const messages: ExistingMessage[] = [];

  for (const file of files.filter((name) => name.endsWith(".md"))) {
    const path = resolve(messageDir, file);
    const raw = await readFile(path, "utf8");
    const series = extractYamlField(raw, "series");
    if (!messageBelongsToScope(series, scope)) continue;

    const title = extractYamlField(raw, "title");
    const date = extractYamlField(raw, "date");
    const sourceUrl = extractYamlField(raw, "sourceUrl");
    const podcastUrl = extractYamlField(raw, "podcastUrl");
    messages.push({
      path,
      slug: basename(file, ".md"),
      title,
      normalizedTitle: title ? normalizeTitle(title) : undefined,
      date,
      sourceUrl,
      podcastUrl,
      series,
    });
  }

  return messages.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

async function loadScopedTranscriptArchive(scope: SeriesScope): Promise<YouTubeItem[]> {
  const transcriptDir = resolve(scope.transcriptArchiveDir ?? "data/transcripts/content");
  const files = await readdir(transcriptDir);
  const items: YouTubeItem[] = [];

  for (const file of files.filter((name) => name.endsWith(".md"))) {
    const path = resolve(transcriptDir, file);
    const raw = await readFile(path, "utf8");
    const uploadDate = extractYamlField(raw, "upload_date");
    const youtubeId = extractYamlField(raw, "youtube_id");
    const rawTitle = extractYamlField(raw, "title") ?? extractYamlField(raw, "youtube_title");
    const series = extractYamlField(raw, "series");

    if (!uploadDate || !youtubeId || !rawTitle) continue;
    const title = applyYoutubeTitleOverride(scope, youtubeId, rawTitle);

    const inScopeBySeries = normalizeTitle(series ?? "") === normalizeTitle(scope.title);
    const inScopeByRange = withinRange(uploadDate, scope);
    const requireTitleHint = (scope.titleHints?.length ?? 0) > 0;
    const inScopeByTitle = !requireTitleHint || titleMatchesScope(title, scope);
    if (!inScopeBySeries && !(inScopeByRange && inScopeByTitle)) continue;

    items.push({
      title,
      normalizedTitle: normalizeTitle(title),
      publishedDate: uploadDate,
      sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId,
    });
  }

  return items.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
}

function mergeYoutubeItems(...collections: YouTubeItem[][]): YouTubeItem[] {
  const merged = new Map<string, YouTubeItem>();

  for (const collection of collections) {
    for (const item of collection) {
      if (!merged.has(item.youtubeId)) {
        merged.set(item.youtubeId, item);
      }
    }
  }

  return [...merged.values()].sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
}

function filterScopedPodcastItems(items: PodcastItem[], scope: SeriesScope): PodcastItem[] {
  const requireTitleHint = (scope.titleHints?.length ?? 0) > 0;
  return items.filter((item) => withinRange(item.publishedDate, scope) && (!requireTitleHint || titleMatchesScope(item.title, scope)));
}

function filterScopedYoutubeItems(items: YouTubeItem[], scope: SeriesScope): YouTubeItem[] {
  const requireTitleHint = (scope.titleHints?.length ?? 0) > 0;
  return items.filter((item) => withinRange(item.publishedDate, scope) && (!requireTitleHint || titleMatchesScope(item.title, scope)));
}

function findExistingMessage(youtube: YouTubeItem | undefined, podcast: PodcastItem | undefined, existingMessages: ExistingMessage[]): ExistingMessage | undefined {
  return existingMessages.find((message) => {
    if (youtube?.sourceUrl && message.sourceUrl === youtube.sourceUrl) return true;
    if (podcast?.spotifyEpisodeUrl && message.podcastUrl === podcast.spotifyEpisodeUrl) return true;
    if (youtube?.normalizedTitle && message.normalizedTitle === youtube.normalizedTitle) return true;
    if (podcast?.normalizedTitle && message.normalizedTitle === podcast.normalizedTitle) return true;
    return false;
  });
}

function pairItems(youtubeItems: YouTubeItem[], podcastItems: PodcastItem[], existingMessages: ExistingMessage[]): MatchedPair[] {
  const pairs: MatchedPair[] = [];
  const usedPodcastIndexes = new Set<number>();

  for (const youtube of youtubeItems) {
    let bestIndex = -1;
    let bestScore = -1;
    let bestDelta = Number.POSITIVE_INFINITY;

    podcastItems.forEach((podcast, index) => {
      if (usedPodcastIndexes.has(index)) return;
      const score = scoreTitlePair(youtube.title, podcast.title);
      const delta = diffDays(youtube.publishedDate, podcast.publishedDate);
      const combinedScore = score - delta * 3;
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestIndex = index;
        bestDelta = delta;
      }
    });

    const reasons: string[] = [];
    let podcast: PodcastItem | undefined;
    let score = 0;
    let status: MatchedPair["status"] = "unpaired";

    if (bestIndex >= 0) {
      podcast = podcastItems[bestIndex];
      score = scoreTitlePair(youtube.title, podcast.title);
      if (score >= 70 && bestDelta <= 7) {
        status = "missing";
        reasons.push(`paired by title score ${score} and ${bestDelta} day date delta`);
        usedPodcastIndexes.add(bestIndex);
      } else {
        status = "ambiguous";
        reasons.push(`best match too weak: title score ${score}, date delta ${bestDelta} days`);
      }
    } else {
      reasons.push("no podcast candidate available");
    }

    const existingMessage = findExistingMessage(youtube, podcast, existingMessages);
    if (existingMessage) {
      status = "existing";
      reasons.push(`existing message found: ${basename(existingMessage.path)}`);
    }

    pairs.push({
      key: youtube.youtubeId,
      youtube,
      podcast,
      score,
      dateDeltaDays: Number.isFinite(bestDelta) ? bestDelta : -1,
      status,
      existingMessage,
      reasons,
    });
  }

  podcastItems.forEach((podcast, index) => {
    if (usedPodcastIndexes.has(index)) return;
    const existingMessage = findExistingMessage(undefined, podcast, existingMessages);
    pairs.push({
      key: `podcast-${slugify(podcast.title)}`,
      podcast,
      score: 0,
      dateDeltaDays: -1,
      status: existingMessage ? "existing" : "unpaired",
      existingMessage,
      reasons: [existingMessage ? `existing message found: ${basename(existingMessage.path)}` : "podcast item has no paired YouTube match in scope"],
    });
  });

  return pairs.sort((a, b) => {
    const left = a.youtube?.publishedDate ?? a.podcast?.publishedDate ?? "";
    const right = b.youtube?.publishedDate ?? b.podcast?.publishedDate ?? "";
    return left.localeCompare(right);
  });
}

function renderMessageFrontmatter(scope: SeriesScope, pair: MatchedPair): string {
  const title = pair.youtube?.title ?? pair.podcast?.title ?? "Untitled Message";
  const date = pair.youtube?.publishedDate ?? pair.podcast?.publishedDate ?? new Date().toISOString().slice(0, 10);
  const sourceUrl = pair.youtube?.sourceUrl;
  const podcastUrl = pair.podcast?.spotifyEpisodeUrl;

  const lines = [
    "---",
    "generated: true",
    `title: \"${title.replaceAll('"', '\\"')}\"`,
    `series: \"${scope.seriesLink.replaceAll('"', '\\"')}\"`,
    `date: ${date}`,
  ];

  if (sourceUrl) lines.push(`sourceUrl: ${sourceUrl}`);
  if (podcastUrl) lines.push(`podcastUrl: ${podcastUrl}`);
  lines.push("draft: true", "---", "");
  return `${lines.join("\n")}`;
}

async function writeMissingDrafts(scope: SeriesScope, pairs: MatchedPair[]): Promise<string[]> {
  const messageDir = resolve(scope.messageDir ?? "src/content/messages");
  await mkdir(messageDir, { recursive: true });
  const written: string[] = [];

  for (const pair of pairs.filter((item) => item.status === "missing")) {
    const title = pair.youtube?.title ?? pair.podcast?.title;
    if (!title) continue;

    const date = pair.youtube?.publishedDate ?? pair.podcast?.publishedDate ?? new Date().toISOString().slice(0, 10);
    const slug = makeSlug(date, title);
    const path = resolve(messageDir, `${slug}.md`);

    const status = await checkDuplicate(messageDir, slug);
    if (status === DuplicateStatus.EXISTS_DRAFT) {
      console.log(`[SKIP] ${slug}: already exists (draft)`);
      continue;
    }
    if (status === DuplicateStatus.EXISTS_HAND_EDITED) {
      console.log(`[SKIP] ${slug}: skipping hand-edited file`);
      continue;
    }

    await writeFile(path, renderMessageFrontmatter(scope, pair), "utf8");
    written.push(path);
  }

  return written;
}

async function loadConfig(): Promise<AutomationConfig> {
  const raw = await readFile(resolve("scripts/automation.config.json"), "utf8");
  return JSON.parse(raw) as AutomationConfig;
}

async function main() {
  const config = await loadConfig();
  const scope = config.seriesScope;
  const youtubeSource = config.sources.find((source) => source.id === "youtube");
  const podcastSource = config.sources.find((source) => source.id === "podcast");
  const feedUrl = cli.feedUrl ?? podcastSource?.feedUrl ?? undefined;
  const feedIsPlaceholder = isPlaceholderFeedUrl(feedUrl);

  if (!scope) throw new Error("automation.config.json is missing seriesScope");
  if (!youtubeSource) throw new Error("automation.config.json is missing the youtube source");

  if (cli.feedUrl) {
    const { xml, sourceLabel } = await getPodcastFeedXml(cli.feedUrl, cli.dryRun);
    const podcastItems = parsePodcastFeed(xml);
    console.log(`Podcast feed reader: ${sourceLabel}`);
    console.log(`Mode: ${cli.dryRun ? "DRY-RUN" : "READ-ONLY"}`);
    printPodcastItems(podcastItems, cli.limit);
    if (feedIsPlaceholder || cli.dryRun) {
      console.log("Note: D4 still needs the live podcast RSS URL before production rollout.");
    }
    return;
  }

  const youtubeFeedUrl = deriveYoutubeFeedUrl(youtubeSource);
  if (!youtubeFeedUrl) throw new Error("Could not determine a YouTube feed URL from the configured source");

  const youtubeXml = await fetchText(youtubeFeedUrl).catch((error) => {
    if (cli.dryRun) {
      console.log(`Note: YouTube feed fetch failed in dry-run; continuing with transcript archive only (${error instanceof Error ? error.message : error}).`);
      return "";
    }
    throw error;
  });
  const [podcastXml, existingMessages, scopedTranscriptArchive] = await Promise.all([
    getPodcastFeedXml(feedUrl, cli.dryRun).then((result) => result.xml),
    loadExistingMessages(scope),
    loadScopedTranscriptArchive(scope),
  ]);

  const scopedYoutubeFeedItems = filterScopedYoutubeItems(parseYoutubeFeed(youtubeXml, scope), scope);
  const scopedYoutubeItems = mergeYoutubeItems(scopedTranscriptArchive, scopedYoutubeFeedItems);
  const scopedPodcastItems = filterScopedPodcastItems(parsePodcastFeed(podcastXml), scope);
  const pairs = pairItems(scopedYoutubeItems, scopedPodcastItems, existingMessages);

  console.log(`Automation config: ${config.name}`);
  console.log(`Mode: ${cli.writeMode ? "WRITE" : "DRY-RUN"}`);
  console.log(`Series scope: ${scope.slug} — ${scope.title}`);
  console.log(`Scope window: ${scope.dateRange?.start ?? "?"} .. ${scope.dateRange?.end ?? "?"}`);
  console.log(`YouTube feed: ${youtubeFeedUrl}`);
  console.log(`Podcast feed: ${feedUrl ?? "(missing; sample feed used)"}`);
  console.log(`Existing messages in scope: ${existingMessages.length}`);
  console.log(`Scoped transcript archive items: ${scopedTranscriptArchive.length}`);
  console.log(`Scoped live YouTube feed items: ${scopedYoutubeFeedItems.length}`);
  console.log(`Scoped combined YouTube items: ${scopedYoutubeItems.length}`);
  console.log(`Scoped podcast items: ${scopedPodcastItems.length}`);
  console.log("\nPair report:");

  for (const pair of pairs) {
    const title = pair.youtube?.title ?? pair.podcast?.title ?? pair.key;
    const date = pair.youtube?.publishedDate ?? pair.podcast?.publishedDate ?? "unknown-date";
    console.log(`- [${pair.status}] ${date} — ${title}`);
    if (pair.youtube) console.log(`    youtube: ${pair.youtube.sourceUrl}`);
    if (pair.podcast) console.log(`    podcast: ${pair.podcast.spotifyEpisodeUrl}`);
    for (const reason of pair.reasons) {
      console.log(`    note: ${reason}`);
    }
  }

  const missingPairs = pairs.filter((pair) => pair.status === "missing");
  const ambiguousPairs = pairs.filter((pair) => pair.status === "ambiguous" || pair.status === "unpaired");

  console.log("\nBackfill summary:");
  console.log(`- existing: ${pairs.filter((pair) => pair.status === "existing").length}`);
  console.log(`- missing: ${missingPairs.length}`);
  console.log(`- ambiguous_or_unpaired: ${ambiguousPairs.length}`);

  if (missingPairs.length === 0 && ambiguousPairs.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (!cli.writeMode) {
    console.log("Dry-run safety: no content files are written.");
    return;
  }

  if (config.defaults.writeContentFiles !== true) {
    throw new Error("Config blocks writes: defaults.writeContentFiles must be explicitly set to true before using --write.");
  }

  if (ambiguousPairs.length > 0) {
    throw new Error("Refusing to write while ambiguous or unpaired items remain in scope.");
  }

  const written = await writeMissingDrafts(scope, missingPairs);
  console.log("\nWrite results:");
  if (written.length === 0) {
    console.log("- no new draft files were needed");
  } else {
    for (const path of written) {
      console.log(`- wrote ${path}`);
    }
  }
}

main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
