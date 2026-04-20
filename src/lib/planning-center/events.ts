import fs from 'node:fs';
import path from 'node:path';

// events.fixture.json is the last-known-good Planning Center snapshot.
const FIXTURE_PATH = path.join(process.cwd(), 'src', 'data', 'planning-center', 'events.fixture.json');

type RawPlanningCenterEvent = {
  slug: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  location: string;
  categorySlug: string;
  summary: string;
  url: string;
};

type RawPlanningCenterCategory = {
  slug: string;
  title: string;
  description?: string;
};

type RawPlanningCenterFeed = {
  snapshotNote?: string;
  scheduledRebuild?: string;
  categories: RawPlanningCenterCategory[];
  events: RawPlanningCenterEvent[];
};

export type PlanningCenterCategory = RawPlanningCenterCategory;

export type PlanningCenterEvent = RawPlanningCenterEvent & {
  categoryTitle: string;
};

export type PlanningCenterFeed = {
  snapshotNote: string;
  scheduledRebuild: string;
  categories: PlanningCenterCategory[];
  events: PlanningCenterEvent[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readJsonFeed(filePath: string): RawPlanningCenterFeed {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as RawPlanningCenterFeed;
}

function normalizeFeed(raw: unknown): PlanningCenterFeed {
  if (!isRecord(raw)) {
    throw new Error('Planning Center feed must be an object.');
  }

  const categories = Array.isArray(raw.categories) ? raw.categories : [];
  const events = Array.isArray(raw.events) ? raw.events : [];

  const normalizedCategories = categories.filter(isRecord).map((category) => {
    if (!isString(category.slug) || !isString(category.title)) {
      throw new Error('Planning Center category entries require slug and title.');
    }

    return {
      slug: category.slug,
      title: category.title,
      description: isString(category.description) ? category.description : undefined,
    };
  });

  const categoryBySlug = new Map(normalizedCategories.map((category) => [category.slug, category.title] as const));
  const normalizedEvents = events.filter(isRecord).map((event) => {
    if (
      !isString(event.slug) ||
      !isString(event.title) ||
      !isString(event.startsAt) ||
      !isString(event.location) ||
      !isString(event.categorySlug) ||
      !isString(event.summary) ||
      !isString(event.url)
    ) {
      throw new Error('Planning Center event entries require slug, title, startsAt, location, categorySlug, summary, and url.');
    }

    return {
      slug: event.slug,
      title: event.title,
      startsAt: event.startsAt,
      endsAt: isString(event.endsAt) ? event.endsAt : undefined,
      location: event.location,
      categorySlug: event.categorySlug,
      summary: event.summary,
      url: event.url,
      categoryTitle: categoryBySlug.get(event.categorySlug) ?? event.categorySlug,
    };
  });

  return {
    snapshotNote: isString(raw.snapshotNote) ? raw.snapshotNote : 'last-known-good Planning Center events fixture',
    scheduledRebuild: isString(raw.scheduledRebuild) ? raw.scheduledRebuild : 'scheduled rebuild on deploy or cron',
    categories: normalizedCategories,
    events: normalizedEvents,
  };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  }).format(date);

  return { dateLabel, timeLabel };
}

async function loadFeedFromApi(): Promise<PlanningCenterFeed> {
  const apiUrl = process.env.PLANNING_CENTER_EVENTS_API_URL;
  if (!apiUrl) {
    throw new Error('PLANNING_CENTER_EVENTS_API_URL is required for Planning Center API mode.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const token = process.env.PLANNING_CENTER_EVENTS_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, { headers });
  if (!response.ok) {
    throw new Error(`Planning Center API request failed with ${response.status}`);
  }

  return normalizeFeed(await response.json());
}

function loadFixtureFeed(): PlanningCenterFeed {
  // The fixture is the last-known-good snapshot until a scheduled rebuild or
  // an API-backed local run refreshes the Planning Center feed.
  return normalizeFeed(readJsonFeed(FIXTURE_PATH));
}

export async function loadPlanningCenterFeed(): Promise<PlanningCenterFeed> {
  const source = process.env.PLANNING_CENTER_EVENTS_SOURCE ?? 'fixture';

  if (source === 'api') {
    try {
      return await loadFeedFromApi();
    } catch {
      return loadFixtureFeed();
    }
  }

  return loadFixtureFeed();
}

export async function loadPlanningCenterEvents(): Promise<PlanningCenterEvent[]> {
  const feed = await loadPlanningCenterFeed();
  return [...feed.events].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

export async function loadPlanningCenterCategories(): Promise<PlanningCenterCategory[]> {
  const feed = await loadPlanningCenterFeed();
  return [...feed.categories];
}

export function formatPlanningCenterEvent(value: string) {
  return formatDateTime(value);
}
