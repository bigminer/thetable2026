import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import sanitizeHtml from "sanitize-html";
import type { SiteContext } from "./types.ts";

const BUILT_PAGES_ROOT = "dist/client";
const MAX_DOC_CHARS = 7000;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "about",
  "brett",
  "can",
  "does",
  "for",
  "from",
  "has",
  "have",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "this",
  "to",
  "preached",
  "said",
  "says",
  "table",
  "church",
  "taught",
  "teach",
  "teaches",
  "was",
  "we",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
  "you",
]);

function terms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((term) => term.replace(/^'+|'+$/g, ""))
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function scoreContext(query: string, context: SiteContext): number {
  const queryTerms = [...new Set(terms(query))];
  if (queryTerms.length === 0) return 0;

  const searchable = `${context.title} ${context.description ?? ""} ${context.text}`.toLowerCase();
  let matched = 0;
  let hits = 0;

  for (const term of queryTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const stem = term.length >= 6 ? term.slice(0, 5).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null;
    const exactCount = searchable.match(new RegExp(`\\b${escaped}`, "g"))?.length ?? 0;
    const stemCount = stem ? (searchable.match(new RegExp(`\\b${stem}[a-z]*`, "g"))?.length ?? 0) : 0;
    const count = Math.max(exactCount, stemCount);
    if (count > 0) matched += 1;
    hits += Math.min(count, 5);
  }

  const coverage = matched / queryTerms.length;
  const density = hits / Math.max(20, terms(context.text).length);
  const phraseBonus = searchable.includes(query.toLowerCase()) ? 0.15 : 0;
  const collectionWeight = context.collection === "series" ? 0.75 : 1;
  return Math.min(0.85, (coverage * 0.6 + density * 2.2 + phraseBonus) * collectionWeight);
}

// Read the same generated pages that visitors see; no separate editorial copy.
export async function loadSiteContexts(root = BUILT_PAGES_ROOT): Promise<SiteContext[]> {
  const contexts: SiteContext[] = [];
  const entries = await readdir(root, { recursive: true });
  for (const filename of entries.filter(entry => entry.endsWith(".html")).sort()) {
    const relativePath = filename.replaceAll("\\", "/");
    if (relativePath === "404.html" || relativePath === "ask/index.html") continue;
    const html = await readFile(join(root, filename), "utf8");
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main) continue;
    const plainText = (value: string) => sanitizeHtml(value.replace(/<\/[^>]+>/g, "$& "), { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
    const title = plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "The Table Church");
    const path = "/" + relativePath.replace(/index\.html$/, "");
    const collection = path.startsWith("/series/") ? "series" : path === "/" ? "site" : "pages";
    contexts.push({
      id: collection + "/" + (path.replace(/^\/|\/$/g, "") || "homepage"),
      source_type: "site_content",
      collection,
      title,
      description: null,
      path,
      text: plainText(main).slice(0, MAX_DOC_CHARS),
      score: 0,
    });
  }
  return contexts;
}

let inMemorySiteContexts: SiteContext[] | null = null;

export async function getOrLoadSiteContexts(): Promise<SiteContext[]> {
  if (inMemorySiteContexts) return inMemorySiteContexts;
  inMemorySiteContexts = await loadSiteContexts();
  return inMemorySiteContexts;
}

export function retrieveTopSiteContexts(
  contexts: SiteContext[],
  query: string,
  k = 3,
): SiteContext[] {
  return contexts
    .map((context) => ({ ...context, score: scoreContext(query, context) }))
    .filter((context) => context.score >= 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function invalidateInMemorySiteContexts(): void {
  inMemorySiteContexts = null;
}
