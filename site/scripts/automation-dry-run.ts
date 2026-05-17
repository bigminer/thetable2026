/**
 * scripts/automation-dry-run.ts — summarize the weekly media ingestion config
 * without writing any content files.
 *
 * Usage: npm run automation:dry-run
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

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
  seriesLink?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  titleHints?: string[];
  messageDir?: string;
  transcriptArchiveDir?: string;
};

type AutomationConfig = {
  name: string;
  description?: string;
  schedule: string;
  runMode: string;
  seriesScope?: SeriesScope;
  defaults: Record<string, unknown>;
  sources: AutomationSource[];
  reporting?: Record<string, unknown>;
};

function isConfigured(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function summarizeSource(source: AutomationSource): string {
  const parts: string[] = [];

  if (source.kind === "youtube") {
    const channel = isConfigured(source.channelUrl) ? "channelUrl=set" : "channelUrl=missing";
    const playlist = isConfigured(source.playlistUrl) ? "playlistUrl=set" : "playlistUrl=missing";
    const feed = isConfigured(source.feedUrl) ? "feedUrl=set" : "feedUrl=derived";
    parts.push(channel, playlist, feed);
  } else if (source.kind === "rss") {
    parts.push(isConfigured(source.feedUrl) ? "feedUrl=set" : "feedUrl=missing");
  }

  return `${source.label} (${parts.join(", ") || "no fields"})`;
}

async function main() {
  const configPath = resolve("scripts/automation.config.json");
  const raw = await readFile(configPath, "utf8");
  const config = JSON.parse(raw) as AutomationConfig;

  const missingSources = config.sources.flatMap((source) => {
    const requiredFields = source.requiredSourceFields ?? [];
    return requiredFields.filter((fieldName) => !isConfigured((source as Record<string, unknown>)[fieldName])).map((fieldName) => `${source.id}.${fieldName}`);
  });

  console.log(`Automation config: ${config.name}`);
  console.log(`Description: ${config.description ?? "(none)"}`);
  console.log(`Schedule: ${config.schedule}`);
  console.log(`Run mode: ${config.runMode}`);
  if (config.seriesScope) {
    const { slug, title, dateRange, titleHints, messageDir, transcriptArchiveDir } = config.seriesScope;
    console.log(`Series scope: ${slug} — ${title}`);
    if (dateRange?.start || dateRange?.end) {
      console.log(`Scope window: ${dateRange?.start ?? "?"} .. ${dateRange?.end ?? "?"}`);
    }
    if (titleHints?.length) {
      console.log(`Scope title hints: ${titleHints.join(", ")}`);
    }
    if (messageDir) {
      console.log(`Scope message dir: ${messageDir}`);
    }
    if (transcriptArchiveDir) {
      console.log(`Scope transcript archive: ${transcriptArchiveDir}`);
    }
  }
  console.log("Defaults:");
  for (const [key, value] of Object.entries(config.defaults)) {
    console.log(`  - ${key}: ${JSON.stringify(value)}`);
  }
  console.log("Sources:");
  for (const source of config.sources) {
    console.log(`  - ${summarizeSource(source)}`);
    if (source.notes) {
      console.log(`    ${source.notes}`);
    }
  }
  console.log("Missing source URLs:");
  if (missingSources.length === 0) {
    console.log("  - none");
  } else {
    for (const item of missingSources) {
      console.log(`  - ${item}`);
    }
  }
  console.log("Dry-run safety: no content files are written.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
