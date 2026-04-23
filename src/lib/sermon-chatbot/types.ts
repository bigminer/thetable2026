// Shared types for the sermon-chatbot retrieval + composition pipeline.
// Consumed by scripts/ask.ts (CLI) and src/pages/api/ask.ts (HTTP endpoint).

export type Sermon = {
  content_id: string;
  youtube_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  speaker: string;
  content_type: string; // "sermon" | "table_talk"
  series: string | null;
  description: string | null;
  vtt_path: string;
  duration_seconds: number;
  content_start_seconds: number;
  content_end_seconds: number;
};

export type RawChunk = {
  content_id: string;
  youtube_id: string;
  source_title: string;
  source_date: string;
  source_type: string;
  speaker: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
};

export type Chunk = RawChunk & { embedding: number[] };

export type ScoredChunk = Chunk & { score: number };

export type CacheEntry = {
  bounds_start: number;
  bounds_end: number;
  chunks: Chunk[];
};

export type Cache = Record<string, CacheEntry>;

export type Cue = { start: number; end: number; text: string };

export type Tier = "high" | "medium" | "low";
export type Shape = "single" | "parallel" | "sprawl";

export type AskResponse = {
  tier: Tier;
  shape: Shape;
  top_score: number;
  top3_gap: number;
  distinct_content_ids_in_top10: number;
  chunks: Array<{
    content_id: string;
    source_title: string;
    source_date: string;
    source_type: string;
    start_seconds: number;
    end_seconds: number;
    score: number;
    text: string;
    youtube_deep_link: string;
  }>;
  composed_response: string;
};
