/**
 * duplicate-detection.ts
 *
 * Determine whether a message file already exists for a given slug,
 * and classify it as safe-to-overwrite (draft / generated) or hand-edited.
 */

import { readFile, readdir } from "node:fs/promises";
import { resolve, basename, extname } from "node:path";
import yaml from "js-yaml";

export enum DuplicateStatus {
  MISSING = "MISSING",
  EXISTS_DRAFT = "EXISTS_DRAFT",
  EXISTS_HAND_EDITED = "EXISTS_HAND_EDITED",
}

/**
 * Read only the YAML front-matter of a Markdown file and determine
 * whether it should be treated as hand-edited.
 *
 * A file is considered hand-edited when:
 *   - `hand_edited: true` is present, OR
 *   - `generated: true` is absent (default conservative stance)
 */
export async function isHandEdited(path: string): Promise<boolean> {
  const text = await readFile(path, "utf8");
  const frontmatter = extractFrontmatter(text);
  if (!frontmatter) return true; // no frontmatter -> treat as hand-edited

  const data = yaml.load(frontmatter) as Record<string, unknown> | null;
  if (!data) return true;

  if (data.hand_edited === true) return true;
  if (data.generated === true) return false;

  return true; // default conservative: if not explicitly generated, it's hand-edited
}

/**
 * Given a directory of `.md` message files and a candidate slug,
 * determine whether a matching file already exists and what its
 * overwrite policy should be.
 *
 * Matching rule: any file whose basename (minus `.md`) starts with
 * the candidate slug is considered a match.
 */
export async function checkDuplicate(
  messagesDir: string,
  slug: string
): Promise<DuplicateStatus> {
  const entries = await readdir(messagesDir, { withFileTypes: true });
  const mdFiles = entries.filter(
    (e) => e.isFile() && extname(e.name).toLowerCase() === ".md"
  );

  const match = mdFiles.find((f) => {
    const stem = f.name.slice(0, -3); // remove ".md"
    return stem.startsWith(slug);
  });

  if (!match) return DuplicateStatus.MISSING;

  const handEdited = await isHandEdited(resolve(messagesDir, match.name));
  return handEdited ? DuplicateStatus.EXISTS_HAND_EDITED : DuplicateStatus.EXISTS_DRAFT;
}

/**
 * Extract raw YAML front-matter string from Markdown text.
 * Returns the content between the first two `---` fences, or null.
 */
function extractFrontmatter(text: string): string | null {
  const trimmed = text.trimStart();
  if (!trimmed.startsWith("---")) return null;

  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return null;

  return trimmed.slice(3, end).trim();
}
