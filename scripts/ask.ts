/**
 * scripts/ask.ts — CLI wrapper around the shared sermon-chatbot lib.
 *
 * Usage: npm run ask -- "your question"
 *
 * Shares all retrieval + composition logic with src/pages/api/ask.ts via
 * src/lib/sermon-chatbot/.
 */

import OpenAI from "openai";
import { compose } from "../src/lib/sermon-chatbot/composition.ts";
import { getOrLoadCorpus, getOrLoadRawCorpus } from "../src/lib/sermon-chatbot/corpus.ts";
import {
  classifyShape,
  classifyTier,
  retrieveTopK,
  retrieveTopKLexical,
} from "../src/lib/sermon-chatbot/retrieval.ts";
import {
  getOrLoadSiteContexts,
  retrieveTopSiteContexts,
} from "../src/lib/sermon-chatbot/site-content.ts";
import { formatTime } from "../src/lib/sermon-chatbot/vtt.ts";

function asksForSermonContext(query: string): boolean {
  return /\b(brett|sermon|sermons|preach|preached|preaches|taught|teach|teaches|said|says|quote|table talk)\b/i.test(
    query,
  );
}

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage: npm run ask -- "your question"');
    process.exit(1);
  }
  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
  const localLlm = {
    baseURL: process.env.ASK_LLM_BASE_URL ?? "http://127.0.0.1:8080/v1",
    apiKey: process.env.ASK_LLM_API_KEY,
    model: process.env.ASK_LLM_MODEL ?? "Qwen3-8B-Q4_K_M.gguf",
  };

  console.error(
    `[corpus] loading reviewed stubs ${openai ? "+ embeddings" : "+ local lexical index"}...`,
  );
  const { corpus, sermons } = openai
    ? await getOrLoadCorpus(openai)
    : await getOrLoadRawCorpus();
  console.error(`[corpus] ${corpus.length} chunks across ${sermons.length} sources`);

  const top = openai ? await retrieveTopK(openai, corpus, query, 5) : retrieveTopKLexical(corpus, query, 5);
  const topScore = top[0]?.score ?? 0;
  const tier = classifyTier(topScore);
  const shape = classifyShape(top);
  const siteContexts = retrieveTopSiteContexts(await getOrLoadSiteContexts(), query, 3);
  const compositionChunks = siteContexts.length > 0 && !asksForSermonContext(query) ? [] : top;
  const compositionTier = compositionChunks.length > 0 ? tier : "low";
  const compositionShape = compositionChunks.length > 0 ? shape : "single";

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
  console.error(`[site-context] top ${siteContexts.length}:`);
  for (let i = 0; i < siteContexts.length; i++) {
    const c = siteContexts[i];
    const preview = c.text.slice(0, 70).replace(/\s+/g, " ");
    console.error(`  ${i + 1}. ${c.score.toFixed(3)} "${c.title}" (${c.collection}): "${preview}..."`);
  }
  console.error("");

  const response = await compose(
    localLlm,
    query,
    compositionChunks,
    compositionTier,
    compositionShape,
    siteContexts,
  );
  console.log(response);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
