import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SiteContext } from "./types.ts";

const CONTENT_ROOT = "src/content";
const SITE_CONTEXT_COLLECTIONS = ["pages", "series", "site"] as const;
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

function extractFrontmatter(raw: string): { frontmatter: string; body: string } {
  if (!raw.startsWith("---")) return { frontmatter: "", body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: "", body: raw };
  return {
    frontmatter: raw.slice(3, end).trim(),
    body: raw.slice(end + 4).trim(),
  };
}

function frontmatterValue(frontmatter: string, field: string): string | null {
  const re = new RegExp(`^${field}:\\s*(.*?)\\s*(?:#.*)?$`, "m");
  const match = frontmatter.match(re);
  if (!match) return null;
  const value = match[1].trim();
  if (!value || value === "null") return null;
  return value.replace(/^['\"](.*)['\"]$/, "$1");
}

function frontmatterText(frontmatter: string): string {
  return frontmatter
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("-") || /^[\w-]+:\s*$/.test(trimmed)) return false;
      const [key = "", value = ""] = trimmed.split(":", 2);
      if (/^(title|description|lede|showSidebar)$/i.test(key)) return false;
      if (/^(true|false)$/i.test(value.trim())) return false;
      if (/image|video|url|link|embed|draft|slug/i.test(key)) return false;
      return /:\s*\S/.test(trimmed);
    })
    .map((line) => line.replace(/^\s*[\w-]+:\s*/, ""))
    .join("\n");
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

async function loadSiteContexts(): Promise<SiteContext[]> {
  const contexts: SiteContext[] = [];

  for (const collection of SITE_CONTEXT_COLLECTIONS) {
    const dir = join(CONTENT_ROOT, collection);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      continue;
    }

    for (const filename of entries.filter((entry) => entry.endsWith(".md")).sort()) {
      const filePath = join(dir, filename);
      const raw = await readFile(filePath, "utf8");
      const { frontmatter, body } = extractFrontmatter(raw);
      if (frontmatterValue(frontmatter, "draft") === "true") continue;

      const title = frontmatterValue(frontmatter, "title") ?? filename.replace(/\.md$/, "");
      const description = frontmatterValue(frontmatter, "description") ?? frontmatterValue(frontmatter, "lede");
      const frontmatterCopy = frontmatterText(frontmatter);
      const text = stripMarkdown([description, frontmatterCopy, body].filter(Boolean).join("\n\n"));
      if (!text) continue;

      contexts.push({
        id: `${collection}/${filename.replace(/\.md$/, "")}`,
        source_type: "site_content",
        collection,
        title,
        description,
        path: filePath,
        text: text.slice(0, MAX_DOC_CHARS),
        score: 0,
      });
    }
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
