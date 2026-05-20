import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import {
  DuplicateStatus,
  checkDuplicate,
  isHandEdited,
} from "./duplicate-detection.ts";

const TMP_DIR = resolve(import.meta.dirname ?? ".", "__test_messages__");

describe("duplicate-detection", () => {
  beforeEach(async () => {
    await mkdir(TMP_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TMP_DIR, { recursive: true, force: true });
  });

  describe("checkDuplicate", () => {
    it("returns MISSING when no file matches the slug", async () => {
      const result = await checkDuplicate(TMP_DIR, "2026-05-04-the-table");
      assert.strictEqual(result, DuplicateStatus.MISSING);
    });

    it("returns EXISTS_DRAFT when file has generated: true", async () => {
      const content = `---\ngenerated: true\ntitle: "The Table Episode 12"\n---\n\nBody here.\n`;
      await writeFile(
        resolve(TMP_DIR, "2026-05-04-the-table-episode-12.md"),
        content
      );
      const result = await checkDuplicate(TMP_DIR, "2026-05-04-the-table");
      assert.strictEqual(result, DuplicateStatus.EXISTS_DRAFT);
    });

    it("returns EXISTS_HAND_EDITED when file lacks generated flag", async () => {
      const content = `---\ntitle: "The Table Episode 12"\n---\n\nBody here.\n`;
      await writeFile(
        resolve(TMP_DIR, "2026-05-04-the-table-episode-12.md"),
        content
      );
      const result = await checkDuplicate(TMP_DIR, "2026-05-04-the-table");
      assert.strictEqual(result, DuplicateStatus.EXISTS_HAND_EDITED);
    });

    it("returns EXISTS_HAND_EDITED when file has hand_edited: true", async () => {
      const content = `---\nhand_edited: true\ngenerated: true\ntitle: "The Table Episode 12"\n---\n\nBody here.\n`;
      await writeFile(
        resolve(TMP_DIR, "2026-05-04-the-table-episode-12.md"),
        content
      );
      const result = await checkDuplicate(TMP_DIR, "2026-05-04-the-table");
      assert.strictEqual(result, DuplicateStatus.EXISTS_HAND_EDITED);
    });

    it("matches files whose stem starts with the slug", async () => {
      const content = `---\ngenerated: true\n---\n`;
      await writeFile(
        resolve(TMP_DIR, "2026-05-04-the-table-episode-12-extra.md"),
        content
      );
      const result = await checkDuplicate(TMP_DIR, "2026-05-04-the-table");
      assert.strictEqual(result, DuplicateStatus.EXISTS_DRAFT);
    });

    it("ignores non-.md files", async () => {
      await writeFile(resolve(TMP_DIR, "2026-05-04-the-table.txt"), "text");
      const result = await checkDuplicate(TMP_DIR, "2026-05-04-the-table");
      assert.strictEqual(result, DuplicateStatus.MISSING);
    });
  });

  describe("isHandEdited", () => {
    it("returns true for file without frontmatter", async () => {
      const path = resolve(TMP_DIR, "no-frontmatter.md");
      await writeFile(path, "# Just markdown\n");
      const result = await isHandEdited(path);
      assert.strictEqual(result, true);
    });

    it("returns false for generated: true", async () => {
      const path = resolve(TMP_DIR, "generated.md");
      await writeFile(path, `---\ngenerated: true\n---\n`);
      const result = await isHandEdited(path);
      assert.strictEqual(result, false);
    });

    it("returns true for hand_edited: true even with generated: true", async () => {
      const path = resolve(TMP_DIR, "hand-edited.md");
      await writeFile(path, `---\nhand_edited: true\ngenerated: true\n---\n`);
      const result = await isHandEdited(path);
      assert.strictEqual(result, true);
    });

    it("returns true when no flags are present", async () => {
      const path = resolve(TMP_DIR, "plain.md");
      await writeFile(path, `---\ntitle: "Hello"\n---\n`);
      const result = await isHandEdited(path);
      assert.strictEqual(result, true);
    });
  });
});
