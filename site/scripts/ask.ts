/**
 * scripts/ask.ts — CLI wrapper around the shared sermon-chatbot lib.
 *
 * Usage: npm run ask -- "your question"
 *
 * Shares all retrieval + composition logic with src/pages/api/ask.ts via
 * src/lib/sermon-chatbot/.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { compose } from "../src/lib/sermon-chatbot/composition.ts";
import { getOrLoadCorpus } from "../src/lib/sermon-chatbot/corpus.ts";
import {
  classifyShape,
  classifyTier,
  retrieveTopK,
} from "../src/lib/sermon-chatbot/retrieval.ts";
import { formatTime } from "../src/lib/sermon-chatbot/vtt.ts";

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage: npm run ask -- "your question"');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set.");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.error("[corpus] loading reviewed stubs + embeddings...");
  const { corpus, sermons } = await getOrLoadCorpus(openai);
  console.error(`[corpus] ${corpus.length} chunks across ${sermons.length} sources`);

  const top = await retrieveTopK(openai, corpus, query, 5);
  const topScore = top[0]?.score ?? 0;
  const tier = classifyTier(topScore);
  const shape = classifyShape(top);

  console.error(
    `\n[retrieval] tier=${tier} shape=${shape} top_score=${topScore.toFixed(3)}`,
  );
  console.error(`[retrieval] top ${top.length}:`);
  for (let i = 0; i < top.length; i++) {
    const c = top[i];
    const preview = c.text.slice(0, 70).replace(/\s+/g, " ");
    console.error(
      `  ${i + 1}. ${c.score.toFixed(3)} "${c.source_title}" (${c.source_date}) @ ${formatTime(c.start_seconds)}: "${preview}..."`,
    );
  }
  console.error("");

  const response = await compose(anthropic, query, top, tier, shape);
  console.log(response);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
