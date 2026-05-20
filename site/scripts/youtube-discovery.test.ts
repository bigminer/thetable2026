import test from "node:test";
import assert from "node:assert/strict";

import {
  compileExcludeMatchers,
  isPlaceholderSourceUrl,
  normalizeDiscoveryItems,
  normalizeUploadDate,
  parseYtDlpFlatPlaylistOutput,
  resolveYoutubeSourceUrl,
} from "./youtube-discovery.ts";

test("isPlaceholderSourceUrl rejects missing and placeholder values", () => {
  assert.equal(isPlaceholderSourceUrl(undefined), true);
  assert.equal(isPlaceholderSourceUrl(""), true);
  assert.equal(isPlaceholderSourceUrl("   "), true);
  assert.equal(isPlaceholderSourceUrl("TODO"), true);
  assert.equal(isPlaceholderSourceUrl("TBD"), true);
  assert.equal(isPlaceholderSourceUrl("https://www.youtube.com/playlist?list=PL123"), false);
});

test("resolveYoutubeSourceUrl prefers env and rejects placeholders", () => {
  const config = { sourceUrl: "https://example.invalid/placeholder" };
  assert.equal(
    resolveYoutubeSourceUrl({ envSourceUrl: "https://www.youtube.com/channel/UC123", configSourceUrl: config.sourceUrl }),
    "https://www.youtube.com/channel/UC123",
  );
  assert.equal(
    resolveYoutubeSourceUrl({ envSourceUrl: "TBD", configSourceUrl: config.sourceUrl }),
    null,
  );
});

test("normalizeUploadDate produces YYYY-MM-DD from supported values", () => {
  assert.equal(normalizeUploadDate({ upload_date: "20260519" }), "2026-05-19");
  assert.equal(normalizeUploadDate({ timestamp: 1779148800 }), "2026-05-19");
  assert.equal(normalizeUploadDate({ upload_date: "2026-05-19" }), "2026-05-19");
});

test("parseYtDlpFlatPlaylistOutput handles json lines and arrays", () => {
  const jsonl = [
    JSON.stringify({ id: "abc123", title: "First", upload_date: "20260519" }),
    JSON.stringify({ id: "def456", title: "Second", timestamp: 1779240000 }),
  ].join("\n");
  const array = JSON.stringify([
    { id: "abc123", title: "First", upload_date: "20260519" },
    { id: "def456", title: "Second", timestamp: 1779240000 },
  ]);

  assert.equal(parseYtDlpFlatPlaylistOutput(jsonl).length, 2);
  assert.equal(parseYtDlpFlatPlaylistOutput(array).length, 2);
});

test("normalizeDiscoveryItems filters excludes and maps fields", () => {
  const patterns = compileExcludeMatchers(["shorts", "^abc123$"]);
  const items = normalizeDiscoveryItems(
    [
      { id: "abc123", title: "Keep me?", upload_date: "20260519" },
      { id: "def456", title: "Shorts update", upload_date: "20260518" },
      { id: "ghi789", title: "Weekly teaching", timestamp: 1779240000 },
    ],
    patterns,
  );

  assert.deepEqual(items.items, [
    {
      youtubeId: "ghi789",
      title: "Weekly teaching",
      uploadDate: "2026-05-20",
      sourceUrl: "https://www.youtube.com/watch?v=ghi789",
    },
  ]);
  assert.equal(items.excludedCount, 2);
});
