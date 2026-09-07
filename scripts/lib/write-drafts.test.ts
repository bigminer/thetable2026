import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdir, writeFile, readdir, rm, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { writeDrafts, type DraftWriterOptions } from "./write-drafts.ts";
import type { MatchResult } from "./matcher.ts";

const TMP_DIR = resolve(import.meta.dirname ?? ".", "__test_drafts__");

async function listMdFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  return entries.filter((name) => name.endsWith(".md")).sort();
}

function createOptions(overrides?: Partial<DraftWriterOptions>): DraftWriterOptions {
  return {
    messagesDir: TMP_DIR,
    defaultSeries: "[Test Series](../series/test.md)",
    dryRun: false,
    ...overrides,
  };
}

describe("writeDrafts", () => {
  beforeEach(async () => {
    await mkdir(TMP_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TMP_DIR, { recursive: true, force: true });
  });

  it("writes draft files for MISSING results", async () => {
    const results: MatchResult[] = [
      { date: "2026-05-04", title: "The Table Episode 12", youtubeUrl: "https://youtube.com/a", podcastUrl: "https://spotify.com/a" },
    ];

    const report = await writeDrafts(results, createOptions());
    assert.strictEqual(report.written.length, 1);
    assert.strictEqual(report.skippedDraft.length, 0);
    assert.strictEqual(report.skippedHandEdited.length, 0);

    const files = await listMdFiles(TMP_DIR);
    assert.strictEqual(files.length, 1);

    const content = await readFile(resolve(TMP_DIR, files[0]), "utf8");
    assert.ok(content.includes("generated: true"));
    assert.ok(content.includes('title: "The Table Episode 12"'));
    assert.ok(content.includes("date: 2026-05-04"));
    assert.ok(content.includes("draft: true"));
    assert.ok(content.includes("sourceUrl: https://youtube.com/a"));
    assert.ok(content.includes("podcastUrl: https://spotify.com/a"));
  });

  it("is idempotent: second run creates no duplicates", async () => {
    const results: MatchResult[] = [
      { date: "2026-05-04", title: "The Table Episode 12", youtubeUrl: "https://youtube.com/a", podcastUrl: "https://spotify.com/a" },
    ];

    const report1 = await writeDrafts(results, createOptions());
    assert.strictEqual(report1.written.length, 1);

    const filesAfterFirst = await listMdFiles(TMP_DIR);
    assert.strictEqual(filesAfterFirst.length, 1);

    const report2 = await writeDrafts(results, createOptions());
    assert.strictEqual(report2.written.length, 0);
    assert.strictEqual(report2.skippedDraft.length, 1);

    const filesAfterSecond = await listMdFiles(TMP_DIR);
    assert.strictEqual(filesAfterSecond.length, 1);
  });

  it("never overwrites hand-edited files", async () => {
    const slug = "2026-05-04-the-table-episode-12";
    const existingContent = `---\ntitle: "The Table Episode 12"\ndate: 2026-05-04\n---\n\nHand-edited body.\n`;
    await writeFile(resolve(TMP_DIR, `${slug}.md`), existingContent, "utf8");

    const results: MatchResult[] = [
      { date: "2026-05-04", title: "The Table Episode 12", youtubeUrl: "https://youtube.com/a", podcastUrl: "https://spotify.com/a" },
    ];

    const report = await writeDrafts(results, createOptions());
    assert.strictEqual(report.skippedHandEdited.length, 1);
    assert.strictEqual(report.written.length, 0);

    const content = await readFile(resolve(TMP_DIR, `${slug}.md`), "utf8");
    assert.strictEqual(content, existingContent);
  });

  it("dry-run produces a report without touching the filesystem", async () => {
    const results: MatchResult[] = [
      { date: "2026-05-04", title: "The Table Episode 12", youtubeUrl: "https://youtube.com/a", podcastUrl: "https://spotify.com/a" },
    ];

    const report = await writeDrafts(results, createOptions({ dryRun: true }));
    assert.strictEqual(report.written.length, 1);

    const files = await listMdFiles(TMP_DIR);
    assert.strictEqual(files.length, 0);
  });

  it("skips results with no source URLs", async () => {
    const results: MatchResult[] = [
      { date: "2026-05-04", title: "No URLs", youtubeUrl: undefined, podcastUrl: undefined },
    ];

    const report = await writeDrafts(results, createOptions());
    assert.strictEqual(report.skippedNoUrls.length, 1);
    assert.strictEqual(report.written.length, 0);
    assert.ok(report.warnings.some((w) => w.includes("no source URLs")));
  });

  it("skips results when default series is absent", async () => {
    const results: MatchResult[] = [
      { date: "2026-05-04", title: "The Table Episode 12", youtubeUrl: "https://youtube.com/a", podcastUrl: "https://spotify.com/a" },
    ];

    const report = await writeDrafts(results, createOptions({ defaultSeries: undefined }));
    assert.strictEqual(report.skippedNoSeries.length, 1);
    assert.strictEqual(report.written.length, 0);
    assert.ok(report.warnings.some((w) => w.includes("default series not configured")));
  });

  it("handles mixed batches correctly", async () => {
    // Pre-seed a hand-edited file
    const handSlug = "2026-05-03-existing-hand";
    await writeFile(resolve(TMP_DIR, `${handSlug}.md`), `---\ntitle: "Existing Hand"\ndate: 2026-05-03\n---\n`, "utf8");

    // Pre-seed a generated draft
    const draftSlug = "2026-05-02-existing-draft";
    await writeFile(resolve(TMP_DIR, `${draftSlug}.md`), `---\ngenerated: true\ntitle: "Existing Draft"\ndate: 2026-05-02\n---\n`, "utf8");

    const results: MatchResult[] = [
      { date: "2026-05-01", title: "New Message", youtubeUrl: "https://youtube.com/new", podcastUrl: "https://spotify.com/new" },
      { date: "2026-05-02", title: "Existing Draft", youtubeUrl: "https://youtube.com/draft", podcastUrl: "https://spotify.com/draft" },
      { date: "2026-05-03", title: "Existing Hand", youtubeUrl: "https://youtube.com/hand", podcastUrl: "https://spotify.com/hand" },
    ];

    const report = await writeDrafts(results, createOptions());
    assert.strictEqual(report.written.length, 1);
    assert.strictEqual(report.skippedDraft.length, 1);
    assert.strictEqual(report.skippedHandEdited.length, 1);

    const files = await listMdFiles(TMP_DIR);
    assert.strictEqual(files.length, 3);
  });
});
