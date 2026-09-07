/**
 * write-drafts.ts
 *
 * Pipeline that wires together slug generation, duplicate detection, and
 * draft file writing for matched message results.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { makeSlug } from "./slug.ts";
import { checkDuplicate, DuplicateStatus } from "./duplicate-detection.ts";
import type { MatchResult } from "./matcher.ts";

export type DraftWriterOptions = {
  /** Directory where message .md files live. */
  messagesDir: string;
  /** Default series value for front-matter (e.g. a wikilink or markdown link). */
  defaultSeries?: string;
  /** When true, only report what would be written/skipped. */
  dryRun: boolean;
};

export type DraftWriterReport = {
  written: string[];
  skippedDraft: string[];
  skippedHandEdited: string[];
  skippedNoUrls: string[];
  skippedNoSeries: string[];
  warnings: string[];
};

function renderFrontmatter(result: MatchResult, defaultSeries?: string): string {
  const lines = [
    "---",
    "generated: true",
    `title: "${result.title.replaceAll('"', '\\"')}"`,
    `date: ${result.date}`,
    "draft: true",
  ];

  if (defaultSeries) {
    lines.push(`series: "${defaultSeries.replaceAll('"', '\\"')}"`);
  }

  if (result.youtubeUrl) {
    lines.push(`sourceUrl: ${result.youtubeUrl}`);
  }

  if (result.podcastUrl) {
    lines.push(`podcastUrl: ${result.podcastUrl}`);
  }

  lines.push("---", "");
  return lines.join("\n");
}

/**
 * Process matched results and write draft message files.
 *
 * Skips (with a warning) any result that lacks both a YouTube and podcast URL,
 * or any result that lacks a defaultSeries when one is expected.
 */
export async function writeDrafts(
  results: MatchResult[],
  options: DraftWriterOptions
): Promise<DraftWriterReport> {
  const report: DraftWriterReport = {
    written: [],
    skippedDraft: [],
    skippedHandEdited: [],
    skippedNoUrls: [],
    skippedNoSeries: [],
    warnings: [],
  };

  if (!options.dryRun) {
    await mkdir(options.messagesDir, { recursive: true });
  }

  for (const result of results) {
    const slug = makeSlug(result.date, result.title);
    const filePath = resolve(options.messagesDir, `${slug}.md`);

    if (!result.youtubeUrl && !result.podcastUrl) {
      const msg = `Skipping ${slug}: no source URLs`;
      report.warnings.push(msg);
      report.skippedNoUrls.push(slug);
      console.log(`[WARNING] ${msg}`);
      continue;
    }

    // If defaultSeries is expected but missing, skip and warn
    if (options.defaultSeries === undefined || options.defaultSeries.trim() === "") {
      const msg = `Skipping ${slug}: default series not configured`;
      report.warnings.push(msg);
      report.skippedNoSeries.push(slug);
      console.log(`[WARNING] ${msg}`);
      continue;
    }

    const status = await checkDuplicate(options.messagesDir, slug);

    if (status === DuplicateStatus.EXISTS_DRAFT) {
      const msg = `Skipping ${slug}: already exists (draft)`;
      report.skippedDraft.push(slug);
      console.log(`[SKIP] ${msg}`);
      continue;
    }

    if (status === DuplicateStatus.EXISTS_HAND_EDITED) {
      const msg = `Skipping ${slug}: skipping hand-edited file`;
      report.skippedHandEdited.push(slug);
      console.log(`[SKIP] ${msg}`);
      continue;
    }

    const content = renderFrontmatter(result, options.defaultSeries);

    if (options.dryRun) {
      console.log(`[DRY-RUN] Would write ${filePath}`);
      console.log(content);
      report.written.push(filePath);
      continue;
    }

    await writeFile(filePath, content, "utf8");
    console.log(`[WRITE] ${filePath}`);
    report.written.push(filePath);
  }

  return report;
}
