import { describe, it } from "node:test";
import assert from "node:assert";
import { matchItems, normalizeDate, similarity, type YoutubeItem, type PodcastItem } from "./matcher.ts";

describe("normalizeDate", () => {
  it("handles ISO format", () => {
    assert.strictEqual(normalizeDate("2026-05-04"), "2026-05-04");
  });

  it("handles slash format", () => {
    assert.strictEqual(normalizeDate("2026/05/04"), "2026-05-04");
  });

  it("handles dot format", () => {
    assert.strictEqual(normalizeDate("2026.05.04"), "2026-05-04");
  });

  it("handles US ordering", () => {
    assert.strictEqual(normalizeDate("05/04/2026"), "2026-05-04");
  });

  it("strips time component", () => {
    assert.strictEqual(normalizeDate("2026-05-04T09:00:00Z"), "2026-05-04");
  });

  it("returns null for garbage", () => {
    assert.strictEqual(normalizeDate("not a date"), null);
  });
});

describe("similarity", () => {
  it("returns 1 for identical strings", () => {
    assert.strictEqual(similarity("hello world", "hello world"), 1);
  });

  it("returns 0 for completely different strings", () => {
    assert.strictEqual(similarity("abc", "xyz"), 0);
  });

  it("returns > 0 for partial overlap", () => {
    const score = similarity("hello world", "hello there");
    assert.ok(score > 0 && score < 1);
  });
});

describe("matchItems", () => {
  it("matches exact date + title", () => {
    const youtube: YoutubeItem[] = [
      { title: "The Table Episode 12", publishedDate: "2026-05-04", sourceUrl: "https://youtube.com/watch?v=abc" },
    ];
    const podcast: PodcastItem[] = [
      { title: "The Table Episode 12", publishedDate: "2026-05-04", spotifyEpisodeUrl: "https://spotify.com/episode/abc" },
    ];
    const results = matchItems(youtube, podcast);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].youtubeUrl, "https://youtube.com/watch?v=abc");
    assert.strictEqual(results[0].podcastUrl, "https://spotify.com/episode/abc");
  });

  it("matches fuzzy title within 7-day delta", () => {
    const youtube: YoutubeItem[] = [
      { title: "The Table Episode 12", publishedDate: "2026-05-04", sourceUrl: "https://youtube.com/watch?v=abc" },
    ];
    const podcast: PodcastItem[] = [
      { title: "Table Episode 12", publishedDate: "2026-05-05", spotifyEpisodeUrl: "https://spotify.com/episode/abc" },
    ];
    const results = matchItems(youtube, podcast);
    assert.strictEqual(results.length, 1);
    assert.ok(results[0].youtubeUrl);
    assert.ok(results[0].podcastUrl);
  });

  it("leaves items unpaired when no match", () => {
    const youtube: YoutubeItem[] = [
      { title: "Totally Different", publishedDate: "2026-05-04", sourceUrl: "https://youtube.com/watch?v=abc" },
    ];
    const podcast: PodcastItem[] = [
      { title: "Another World", publishedDate: "2026-05-20", spotifyEpisodeUrl: "https://spotify.com/episode/abc" },
    ];
    const results = matchItems(youtube, podcast);
    assert.strictEqual(results.length, 2);
    assert.ok(results.some((r) => r.youtubeUrl && !r.podcastUrl));
    assert.ok(results.some((r) => !r.youtubeUrl && r.podcastUrl));
  });

  it("handles duplicate-date edge case greedily", () => {
    const youtube: YoutubeItem[] = [
      { title: "The Table Episode 12", publishedDate: "2026-05-04", sourceUrl: "https://youtube.com/watch?v=a" },
      { title: "The Table Episode 13", publishedDate: "2026-05-04", sourceUrl: "https://youtube.com/watch?v=b" },
    ];
    const podcast: PodcastItem[] = [
      { title: "The Table Episode 13", publishedDate: "2026-05-04", spotifyEpisodeUrl: "https://spotify.com/episode/b" },
      { title: "The Table Episode 12", publishedDate: "2026-05-04", spotifyEpisodeUrl: "https://spotify.com/episode/a" },
    ];
    const results = matchItems(youtube, podcast);
    const matched = results.filter((r) => r.youtubeUrl && r.podcastUrl);
    assert.strictEqual(matched.length, 2);
    assert.ok(matched.some((r) => r.title === "The Table Episode 12"));
    assert.ok(matched.some((r) => r.title === "The Table Episode 13"));
  });

  it("is deterministic and pure", () => {
    const youtube: YoutubeItem[] = [
      { title: "Episode A", publishedDate: "2026-05-01", sourceUrl: "https://youtube.com/a" },
      { title: "Episode B", publishedDate: "2026-05-02", sourceUrl: "https://youtube.com/b" },
    ];
    const podcast: PodcastItem[] = [
      { title: "Episode B", publishedDate: "2026-05-02", spotifyEpisodeUrl: "https://spotify.com/b" },
      { title: "Episode A", publishedDate: "2026-05-01", spotifyEpisodeUrl: "https://spotify.com/a" },
    ];
    const r1 = matchItems(youtube, podcast);
    const r2 = matchItems(youtube, podcast);
    assert.deepStrictEqual(r1, r2);
  });

  it("ignores items with unparseable dates", () => {
    const youtube: YoutubeItem[] = [
      { title: "Bad Date", publishedDate: "nope", sourceUrl: "https://youtube.com/bad" },
    ];
    const podcast: PodcastItem[] = [
      { title: "Bad Date", publishedDate: "also nope", spotifyEpisodeUrl: "https://spotify.com/bad" },
    ];
    const results = matchItems(youtube, podcast);
    assert.strictEqual(results.length, 0);
  });

  it("falls back to youtube title when pairing", () => {
    const youtube: YoutubeItem[] = [
      { title: "YouTube Title", publishedDate: "2026-05-04", sourceUrl: "https://youtube.com/watch?v=abc" },
    ];
    const podcast: PodcastItem[] = [
      { title: "Podcast Title", publishedDate: "2026-05-04", spotifyEpisodeUrl: "https://spotify.com/episode/abc" },
    ];
    const results = matchItems(youtube, podcast);
    assert.strictEqual(results[0].title, "YouTube Title");
  });
});
