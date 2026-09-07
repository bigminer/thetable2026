import OpenAI from "openai";
import type { Chunk, RawChunk, ScoredChunk, Shape, Tier } from "./types.ts";

const EMBEDDING_MODEL = "text-embedding-3-small";
const TIER_HIGH = 0.4;
const TIER_MEDIUM = 0.32;

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function embedQuery(openai: OpenAI, query: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: [query],
  });
  return res.data[0].embedding;
}

export async function retrieveTopK(
  openai: OpenAI,
  corpus: Chunk[],
  query: string,
  k: number,
): Promise<ScoredChunk[]> {
  const q = await embedQuery(openai, query);
  const scored = corpus.map((c) => ({ ...c, score: cosineSimilarity(q, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

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
  "that",
  "the",
  "this",
  "to",
  "was",
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
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function lexicalScore(query: string, chunk: RawChunk): number {
  const queryTerms = [...new Set(terms(query))];
  if (queryTerms.length === 0) return 0;

  const searchable = `${chunk.source_title} ${chunk.series ?? ""} ${chunk.text}`.toLowerCase();
  let matched = 0;
  let hits = 0;
  for (const term of queryTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = searchable.match(new RegExp(`\\b${escaped}`, "g"))?.length ?? 0;
    if (count > 0) matched += 1;
    hits += Math.min(count, 4);
  }

  const coverage = matched / queryTerms.length;
  const density = hits / Math.max(12, terms(chunk.text).length);
  const phraseBonus = searchable.includes(query.toLowerCase()) ? 0.12 : 0;
  return Math.min(0.72, coverage * 0.48 + density * 1.8 + phraseBonus);
}

export function retrieveTopKLexical(
  corpus: RawChunk[],
  query: string,
  k: number,
): ScoredChunk[] {
  const scored = corpus
    .map((c) => ({ ...c, embedding: [], score: lexicalScore(query, c) }))
    .filter((c) => c.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

export function classifyTier(topScore: number): Tier {
  if (topScore >= TIER_HIGH) return "high";
  if (topScore >= TIER_MEDIUM) return "medium";
  return "low";
}

export function classifyShape(results: ScoredChunk[]): Shape {
  if (results.length === 0) return "single";
  const top = results[0].score;
  const distinctSermons = new Set(results.map((r) => r.content_id)).size;
  const gap = results.length >= 3 ? top - results[2].score : 0;

  if (distinctSermons === 1) return "single";
  if (distinctSermons <= 3 && gap < 0.06) return "parallel";
  if (distinctSermons >= 4) return "sprawl";
  return "single";
}
