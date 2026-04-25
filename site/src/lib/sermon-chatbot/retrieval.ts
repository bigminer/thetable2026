import OpenAI from "openai";
import type { Chunk, ScoredChunk, Shape, Tier } from "./types.ts";

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
