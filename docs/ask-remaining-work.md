# `/ask` — Remaining Work

The sermon chatbot is built but unfinished. It answers in production, but without an
LLM behind it: composition degrades to a list of source matches. This document records
what is left; the product itself is specified in
[`sermon-chatbot-spec.md`](sermon-chatbot-spec.md).

**Current state: deliberately hidden.** `src/pages/ask.astro` sets `noindex={true}`
and the route is absent from `src/config/navigation.ts`. Both stay until the items
below are resolved. The page is reachable by direct URL.

---

## What works

- Transcript corpus: 334 VTT files in `data/transcripts/raw/`, 333 review stubs in
  `data/transcripts/content/`.
- The default-deny eligibility filter in `src/lib/sermon-chatbot/corpus.ts` — a stub is
  only retrievable when `content_type` is in the allowlist, `speaker` is
  `brett_tilford`, `consent_status` is `granted`, and both `content_start` and
  `content_end` parse as `hh:mm:ss`. 307 of 333 stubs currently pass; the other 26 have
  no bounds set.
- Lexical retrieval, which needs no API key and no precomputation.
- Embedding retrieval and chunk caching, when an OpenAI key is present.
- The composition layer, its prompt shaping, and the tier/shape classification that
  decides how confidently to answer.

## What blocks production

### 1. No composition backend

`src/pages/api/ask.ts:37` defaults `ASK_LLM_BASE_URL` to `http://127.0.0.1:8080/v1`
with model `Qwen3-8B-Q4_K_M.gguf` — a local llama.cpp server. Render has no such
process.

This does not error. `compose()` catches its own failure
(`src/lib/sermon-chatbot/composition.ts:257`) and returns a fallback: *"I couldn't
reach the local answer engine just now, so I'm giving you the closest source matches
instead,"* followed by the best site page and sermon chunks. Verified by POSTing to a
local build with no backend running — HTTP 200, retrieval intact, no generated answer.

So the feature is degraded rather than broken: retrieval works, citations work, and the
part that reads as a chatbot does not. That is the gap to close.

The client is OpenAI-compatible, so any hosted OpenAI-compatible endpoint works by
setting three environment variables in Render, with no code change:

```
ASK_LLM_BASE_URL
ASK_LLM_MODEL
ASK_LLM_API_KEY
```

**Candidate: Gemini** via Google's OpenAI-compatible endpoint
(`https://generativelanguage.googleapis.com/v1beta/openai/`). A Flash-class model is
the right weight — composition receives pre-retrieved chunks and writes a short
grounded answer, so it does not need a frontier model. Two things to confirm before
committing to it: a Google Workspace account does not by itself grant Gemini API
access (the key comes from AI Studio's free tier or from Vertex AI on a GCP project),
and current model names, rate limits and free-tier terms need checking directly rather
than taken from this document.

`openai` and `@anthropic-ai/sdk` are both already dependencies if another provider is
preferred.

### 2. Embedding cache is neither committed nor generated at build time

`data/transcripts/embeddings.json` does not exist in the repository. With
`OPENAI_API_KEY` set in production, the first visitor's question embeds the entire
eligible corpus before answering: minutes of latency and real API spend. Render's
filesystem is ephemeral, so the cache is lost on every deploy and restart and the cost
repeats.

Precomputing in CI is the right shape, but the artifact does not fit as written:

- ~5,000–8,000 chunks across the corpus (1,600-char target, 200-char overlap)
- 1,536 float dimensions per chunk, ~21 KB each once serialized as JSON text
- → roughly 100–170 MB, past GitHub's 100 MB per-file limit, and permanent in history
  once committed

Two changes make it viable, and both are needed:

- **Reduce dimensions.** `text-embedding-3-small` accepts a `dimensions` parameter;
  1536 → 256 costs little retrieval quality and cuts size sixfold.
- **Store binary, not JSON text.** Packed Float32 plus base64 is roughly 15× smaller
  than a JSON float array.

Together: about 10 MB, reasonable to commit and ship in the build. The work is a
generation script, a format change in `corpus.ts` for both read and write paths, a
workflow that regenerates when transcripts change, and a decision about incremental
regeneration.

Retrieval is also pinned to OpenAI: `corpus.ts:12` hardcodes `text-embedding-3-small`
and builds its client from `OPENAI_API_KEY` with no configurable base URL. Composition
is provider-swappable; retrieval is not, without a code change.

### 3. Raw error text is returned to the browser

The catch block in `src/pages/api/ask.ts` returned the exception message in the
response body. Composition failures never reach it, but corpus, retrieval and embedding
failures do, and their messages carry filesystem paths and provider request detail.

**Fixed:** the detail is logged server-side and the response body is generic.

## Before unhiding

Beyond the three above, `sermon-chatbot-spec.md` carries its own open items:

- Brett has given concept-level approval, but the verbatim policy (filler, restarts,
  grammar preservation) and the editorial review cadence were never finalized. The spec
  states it should not be treated as Brett-reviewed in its current form.
- The confidence thresholds were to be calibrated empirically during implementation.

Unhiding means removing `noindex={true}` from `ask.astro` and adding the route to
`src/config/navigation.ts`. Do it last.

## Suggested order

1. ~~Return a generic error body.~~ Done.
2. Choose and configure the composition backend; ship with lexical retrieval — it works
   today at no cost and with no cold-start penalty.
3. Verify on a Render preview deploy.
4. Precompute embeddings with reduced dimensions and binary storage; switch retrieval.
5. Settle the spec's consent and threshold questions.
6. Unhide.

## Also noted

`src/lib/sermon-chatbot/corpus.ts` imports the default OpenAI export, which the
production bundle reports as unused. Not investigated.
