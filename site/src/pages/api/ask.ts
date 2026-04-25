// Load .env into process.env before anything else so the API keys are
// available in dev. In production (Cloudflare Pages / Node hosting),
// env vars come from the platform and dotenv finds no file, which is
// fine — it's a no-op.
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import type { APIRoute } from "astro";
import OpenAI from "openai";
import { compose } from "../../lib/sermon-chatbot/composition.ts";
import { getOrLoadCorpus } from "../../lib/sermon-chatbot/corpus.ts";
import {
  classifyShape,
  classifyTier,
  retrieveTopK,
} from "../../lib/sermon-chatbot/retrieval.ts";
import type { AskResponse } from "../../lib/sermon-chatbot/types.ts";
import { youtubeLink } from "../../lib/sermon-chatbot/vtt.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!openaiKey || !anthropicKey) {
    return new Response(
      JSON.stringify({ error: "Server missing OPENAI_API_KEY or ANTHROPIC_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { query?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return new Response(JSON.stringify({ error: "Missing or empty 'query'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  try {
    const { corpus } = await getOrLoadCorpus(openai);
    const top = await retrieveTopK(openai, corpus, query, 5);
    const topScore = top[0]?.score ?? 0;
    const tier = classifyTier(topScore);
    const shape = classifyShape(top);
    const composed = await compose(anthropic, query, top, tier, shape);

    const response: AskResponse = {
      tier,
      shape,
      top_score: topScore,
      top3_gap: top.length >= 3 ? top[0].score - top[2].score : 0,
      distinct_content_ids_in_top10: new Set(top.map((c) => c.content_id)).size,
      chunks: top.map((c) => ({
        content_id: c.content_id,
        source_title: c.source_title,
        source_date: c.source_date,
        source_type: c.source_type,
        series: c.series,
        start_seconds: c.start_seconds,
        end_seconds: c.end_seconds,
        score: c.score,
        text: c.text,
        youtube_deep_link: youtubeLink(c.youtube_id, c.start_seconds),
      })),
      composed_response: composed,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/ask]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
