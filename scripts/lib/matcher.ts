/**
 * matcher.ts
 *
 * Pure-function YouTube + podcast item matcher.
 *
 * - Date normalization supports ISO, slash, dot, and US/EU ordering.
 * - Title normalization strips punctuation, lowercases, collapses whitespace.
 * - Fuzzy matching uses a sequence-matcher-style similarity >= 0.7.
 * - Greedy pairing by highest similarity, tie-broken by original index for determinism.
 */

export type YoutubeItem = {
  title: string;
  publishedDate: string;
  sourceUrl: string;
};

export type PodcastItem = {
  title: string;
  publishedDate: string;
  spotifyEpisodeUrl: string;
};

export type MatchResult = {
  date: string;
  title: string;
  youtubeUrl?: string;
  podcastUrl?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function stripTime(value: string): string {
  return value.replace(/T.*$/, "");
}

/**
 * Normalize a date string to ISO YYYY-MM-DD.
 * Handles ISO, slash, dot, and common US/EU orderings.
 */
export function normalizeDate(value: string): string | null {
  const trimmed = stripTime(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) return trimmed.replace(/\//g, "-");
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(trimmed)) return trimmed.replace(/\./g, "-");

  // US-style: MM/DD/YYYY or MM-DD-YYYY
  const usMatch = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Let the JS Date parser have a go
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Normalize a title for comparison.
 * Strips punctuation, lowercases, collapses whitespace.
 */
export function normalizeTitle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Simple longest-common-subsequence-based similarity ratio (0..1).
 * Approximates difflib.SequenceMatcher ratio without external deps.
 */
function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Use two rows for O(min(m,n)) space
  const prev = new Array<number>(n + 1).fill(0);
  const curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    prev.fill(0);
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }

  return curr[n];
}

export function similarity(a: string, b: string): number {
  const len = a.length + b.length;
  if (len === 0) return 1;
  return (2 * lcsLength(a, b)) / len;
}

function diffDays(a: string, b: string): number {
  const aDate = new Date(`${a}T00:00:00Z`);
  const bDate = new Date(`${b}T00:00:00Z`);
  return Math.round(Math.abs(aDate.getTime() - bDate.getTime()) / DAY_MS);
}

/**
 * Match YouTube and podcast items by normalized date + fuzzy title similarity.
 *
 * Greedy algorithm:
 * 1. For each YouTube item, find the best unpaired podcast item with the same date.
 * 2. If no same-date match, allow up to a 7-day delta with similarity >= 0.7.
 * 3. Tie-break by original index for determinism.
 */
export function matchItems(
  youtubeItems: YoutubeItem[],
  podcastItems: PodcastItem[]
): MatchResult[] {
  const normalizedYoutube = youtubeItems
    .map((item, index) => ({
      ...item,
      normalizedDate: normalizeDate(item.publishedDate),
      normalizedTitle: normalizeTitle(item.title),
      originalIndex: index,
    }))
    .filter((item) => item.normalizedDate !== null);

  const normalizedPodcast = podcastItems
    .map((item, index) => ({
      ...item,
      normalizedDate: normalizeDate(item.publishedDate),
      normalizedTitle: normalizeTitle(item.title),
      originalIndex: index,
    }))
    .filter((item) => item.normalizedDate !== null);

  const usedPodcast = new Set<number>();
  const results: MatchResult[] = [];

  for (const yt of normalizedYoutube) {
    let bestIdx = -1;
    let bestScore = -1;
    let bestIsSameDate = false;

    for (let i = 0; i < normalizedPodcast.length; i++) {
      if (usedPodcast.has(i)) continue;
      const pc = normalizedPodcast[i];
      const sameDate = yt.normalizedDate === pc.normalizedDate;
      const delta = diffDays(yt.normalizedDate!, pc.normalizedDate!);
      const sim = similarity(yt.normalizedTitle, pc.normalizedTitle);

      let score: number;
      let isSameDate = false;
      if (sameDate) {
        score = 1000 + sim;
        isSameDate = true;
      } else if (delta <= 7 && sim >= 0.7) {
        score = sim;
      } else {
        continue;
      }

      // Tie-break: higher score wins, then lower podcast index for determinism
      if (
        score > bestScore ||
        (score === bestScore && pc.originalIndex < normalizedPodcast[bestIdx]?.originalIndex)
      ) {
        bestScore = score;
        bestIdx = i;
        bestIsSameDate = isSameDate;
      }
    }

    if (bestIdx >= 0) {
      const pc = normalizedPodcast[bestIdx];
      usedPodcast.add(bestIdx);
      results.push({
        date: yt.normalizedDate!,
        title: yt.title,
        youtubeUrl: yt.sourceUrl,
        podcastUrl: pc.spotifyEpisodeUrl,
      });
    } else {
      // Unpaired YouTube item
      results.push({
        date: yt.normalizedDate!,
        title: yt.title,
        youtubeUrl: yt.sourceUrl,
      });
    }
  }

  // Add unpaired podcast items
  for (let i = 0; i < normalizedPodcast.length; i++) {
    if (usedPodcast.has(i)) continue;
    const pc = normalizedPodcast[i];
    results.push({
      date: pc.normalizedDate!,
      title: pc.title,
      podcastUrl: pc.spotifyEpisodeUrl,
    });
  }

  // Sort by date, then title for determinism
  return results.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.title.localeCompare(b.title);
  });
}
