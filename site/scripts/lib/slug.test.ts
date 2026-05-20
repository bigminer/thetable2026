import { describe, it } from "node:test";
import assert from "node:assert";
import { makeSlug } from "./slug.ts";

describe("makeSlug", () => {
  it("produces a basic date + hyphenated-title slug", () => {
    const result = makeSlug("2026-05-04", "The Table Episode 12");
    assert.strictEqual(result, "2026-05-04-the-table-episode-12");
  });

  it("strips accented characters to ASCII", () => {
    const result = makeSlug("2026-05-04", "Résumé Café");
    assert.strictEqual(result, "2026-05-04-resume-cafe");
  });

  it("treats underscores as word separators", () => {
    const result = makeSlug("2026-05-04", "The_Table_Episode_12");
    assert.strictEqual(result, "2026-05-04-the-table-episode-12");
  });

  it("removes punctuation", () => {
    const result = makeSlug("2026-05-04", "Hello, World! (Special)");
    assert.strictEqual(result, "2026-05-04-hello-world-special");
  });

  it("truncates very long titles", () => {
    const longTitle = "a".repeat(200);
    const result = makeSlug("2026-05-04", longTitle);
    assert.ok(result.startsWith("2026-05-04-"));
    assert.ok(result.length <= "2026-05-04-".length + 60);
    assert.ok(!result.endsWith("-"));
  });

  it("collapses multiple hyphens", () => {
    const result = makeSlug("2026-05-04", "The   Table---Episode");
    assert.strictEqual(result, "2026-05-04-the-table-episode");
  });

  it("handles already-slug-like input", () => {
    const result = makeSlug("2026-05-04", "the-table-episode-12");
    assert.strictEqual(result, "2026-05-04-the-table-episode-12");
  });
});
