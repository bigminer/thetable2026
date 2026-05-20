/**
 * slug.ts
 *
 * Deterministic, idempotent, filesystem-safe slug generation from date + title.
 */

/**
 * Strip accents by decomposing Unicode and removing combining marks.
 * This keeps the base ASCII character rather than transliterating.
 */
function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Convert a date string and title into a stable filesystem slug.
 *
 * Format: `{date}-{cleaned-title}`
 *
 * Rules:
 * - Accented characters are stripped to ASCII (not transliterated).
 * - Underscores are treated as word separators (converted to spaces, then hyphens).
 * - All non-alphanumeric characters become hyphens.
 * - Collapsed to single hyphens; no leading/trailing hyphens.
 * - Title truncated to 60 chars of cleaned output to keep filenames reasonable.
 */
export function makeSlug(date: string, title: string): string {
  const cleaned = stripAccents(title)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const maxTitleLen = 60;
  const truncated =
    cleaned.length > maxTitleLen
      ? cleaned.slice(0, maxTitleLen).replace(/-+$/, "")
      : cleaned;

  return `${date}-${truncated}`;
}
