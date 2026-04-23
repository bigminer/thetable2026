# Sermon Chatbot & Pull-Quote Feed — Consolidated Specification

**Project:** tablefresh (The Table church website redesign)
**Related issue:** GitHub #7 (AI sermon summaries + topic index)
**Spec date:** 2026-04-22
**Status:** Ready for build — thresholds to be empirically calibrated during implementation

---

## Origin

This specification emerged from a working session on 2026-04-22 between Saga (analyst), Freya (UX), Winston (architect), and Paige (documentation). The session was driven by Anna — designer on tablefresh and a member of The Table who found the church after experiencing harm at a non-affirming congregation. Her lived expertise as a target-audience member shaped the voice calibration throughout; where this document reads with unusual restraint, that restraint is load-bearing, not stylistic.

The original GitHub issue asked for AI-generated sermon summaries and a topic index. Through the session the concept narrowed into something smaller and more useful: a chatbot that answers questions using Brett's own words, paired with a browsable pull-quote feed. What follows is that product, fully specified.

**Consent status — Brett.** Brett has given concept-level approval for the chatbot per a conversation between Gary and Brett. Specifics about verbatim policy (filler, restarts, grammar preservation) and editorial review cadence are still to be finalized before launch. This spec should not be treated as Brett-reviewed in its current form.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Strategic Foundation](#2-strategic-foundation)
3. [Audience & Personas](#3-audience--personas)
4. [Voice & Tone — "Honest Warmth"](#4-voice--tone--honest-warmth)
5. [Confidence Tiers](#5-confidence-tiers)
6. [Response Shapes](#6-response-shapes)
7. [The Anti-List Rule](#7-the-anti-list-rule)
8. [Example Dialogues](#8-example-dialogues)
9. [Architecture](#9-architecture)
10. [Content Schema & File Layout](#10-content-schema--file-layout)
11. [Retrieval Filter (Defense in Depth)](#11-retrieval-filter-defense-in-depth)
12. [Function Response Schema](#12-function-response-schema)
13. [Content Scope](#13-content-scope)
14. [Consent Infrastructure](#14-consent-infrastructure)
15. [Attribution Rules](#15-attribution-rules)
16. [Index / Pull-Quote Feed Design](#16-index--pull-quote-feed-design)
17. [Ingestion Workflow](#17-ingestion-workflow)
18. [Build Sequence](#18-build-sequence)
19. [Retrieval Quality Checklist](#19-retrieval-quality-checklist)
20. [System Prompt (Starting Draft)](#20-system-prompt-starting-draft)
21. [Open Questions & Deferred Decisions](#21-open-questions--deferred-decisions)
22. [Editorial Notes](#22-editorial-notes)

---

## 1. Product Summary

A single page with two behaviors sharing one URL.

- **Chat input at top.** The user asks a natural-language question ("what does Brett say about heaven?"). The bot answers using verbatim quotes from Brett, each linked to the exact YouTube moment.
- **Pull-quote feed below.** A scrollable, reverse-chronological feed of pull-quote cards. Each card is one quote, big-type, attributed to Brett with sermon title and date.

The two surfaces reshape each other. Asking a question re-sorts the feed (relevant cards rise, irrelevant dim to ~40% opacity but stay scrollable). Tapping a card pre-fills the chat with a related prompt. One URL, two entry points, one product.

**Why this shape?** The original "summaries + topic index" framing optimized for a reader who already knows what they want to read. The actual user — see §3 — wants to verify a belief at 11pm, or wants Brett's framing back in their ear after a hard conversation. Summaries are the wrong artifact. Quotes are the right one.

---

## 2. Strategic Foundation

The Table is a fully LGBTQ-affirming church founded by Brett Tilford after he left a non-affirming congregation. The site-wide design direction is **honest warmth**: restraint over polish, specificity over reassurance, evidence over claim. This feature sits inside that direction and extends it — the chatbot's warmth must be the same warmth as the rest of the site, not a chipper assistant voice bolted on.

The broader website's primary persona is "Quietly Questioning Quinn" — a first-visit visitor running a threat assessment. This feature is not for Quinn. It is for the person who has already decided to stay and is now going deeper.

---

## 3. Audience & Personas

### Searching Sam (primary)
Newer member, roughly a year in. Still deconstructing and reconstructing. Runs searches quietly at 11pm, alone, not because she's in crisis but because she wants to verify — *does this church actually believe what I think it believes?* Her job: a low-stakes trust-check she doesn't have to raise her hand for.

Per Anna's lived knowledge of the congregation: people deconstructing their faith — often arriving from non-affirming backgrounds — are the modal path by which people find The Table, not an exception. Sam is not a niche persona; she represents a majority of newer attenders. This materially raises the weight of her job-to-be-done in design tradeoffs.

### Revisiting Rowan (secondary)
One-to-three-year member. Carries residue from a prior non-affirming church. Trigger is specific and external: the family text thread goes sideways, a coworker weaponizes a verse. Their job: *find what Brett said about this, I need his framing in my ear again.*

### Quietly Questioning Quinn (deferred)
Not the primary user of this feature, but a "Where The Table Stands" lane of the feed could quietly serve Quinn on a first visit. Pin as a future consideration; do not design for her in v1.

### Validation status
Personas are currently validated by Anna's lived expertise as a member of the target audience. External validation (5 short conversations with actual newer attenders) is recommended before ship but not blocking for prototype development.

---

## 4. Voice & Tone — "Honest Warmth"

Warmth lives in specificity, not adjectives. "That sermon from January" beats "great question." The rules below are the calibration — every one of them is there because the alternative is a tell.

**Core posture**
- Presence before redirection. Acknowledge before redirecting.
- It's okay to name a hard thing as hard. *"Yeah, that one's heavy"* is warmer than silence and more honest than a platitude.
- No performance of empathy. No *"I hear you,"* no *"such a meaningful question."*
- Close gently, not briskly. No *"anything else?"* nudge.
- Refer to Brett as Brett.

**Banned verbs** — explores, journeys, unpacks, delves, invites, reminds us that, wrestles with, leans into, speaks to, reflects on.

**Banned adverbs** — beautifully, powerfully, profoundly, lovingly, tenderly.

**Banned fake-certainty frames** — *"Brett teaches that…", "Brett believes…", "In Brett's view…"* — unless followed immediately by a direct quote.

**Banned meta-narration** — *"Let me share…", "I'd love to point you to…", "Here's what I found…"*

**Banned disclaimer mush** — *"While Brett hasn't directly addressed this…", "It's worth noting…"*

**Two rules that override everything else:**

- **Never paraphrase Brett when a quote exists.** Verbatim only, including filler ("um", restarts, casual grammar like "it don't work like that"). Smoothing is a tell — it says the system is performing Brett rather than presenting him.
- **Never paraphrase Brett's theology.** No *"Brett's theology of heaven is…"* The bot has no thesis; Brett does. The bot's only job is to surface what he actually said and get out of the way.

---

## 5. Confidence Tiers

Tiers are about *how sure are we that we have something to say.* They run orthogonally to response shape (§6).

| Tier | Top-1 cosine | Signal | Behavior |
|------|--------------|--------|----------|
| **High** | ≥ ~0.55, with a real gap over top-3 | We have a direct answer | Direct verbatim quote |
| **Medium** | ~0.40 – 0.55 | Adjacent sermon exists | Offer it with honest framing: "not an exact match, but…" |
| **Low** | < 0.40 | Nothing addresses it | Clean say-so. One line of adjacent pivot only if one genuinely exists |

**Thresholds are placeholders.** Before shipping, Anna runs ~30 known-good, ~30 adjacent, and ~30 off-topic queries against the real corpus, plots the score histograms, and sets thresholds at the natural gaps. The numbers above are starting points, not settled values.

**Graceful refusal message for Low with no adjacent pivot:**

> "I looked and couldn't find a sermon where Brett takes this up directly. I'd rather tell you that than guess."

---

## 6. Response Shapes

Shapes are about *what the retrieval looks like when we run it.* They run orthogonally to tier.

| Shape | Signal | Retrieval returns | Voice |
|-------|--------|-------------------|-------|
| **Single** | Top-1 ≥ 0.78, top1/top3 gap ≥ 0.08, ≤2 distinct content_ids in top-5. One sermon clearly owns the answer. | 1–2 raw chunks | Direct quote, named sermon |
| **Parallel** | Top-1 ≥ 0.72, gap < 0.08, 2–4 distinct content_ids in top-10 within a 0.05 band. A few sermons converge. | 3–4 raw chunks | "Brett's come back to this —" |
| **Sprawl** | ≥5 distinct content_ids in top-10, mid-range 0.55–0.72 scores, no chunk dominates. Topical query, many sermons touch it, none is THE sermon. | 5–6 sermon-level aggregates (best chunk per content_id), NOT raw chunks | "This one's everywhere — let me pull two that felt distinct, then show you the rest." |

**Why orthogonal?** Tier ≠ shape. You can have High-confidence Sprawl (the topic is genuinely everywhere in Brett's corpus) and Medium-confidence Single (one sermon is the closest match but the match isn't tight). Treating them as one axis collapses real distinctions the user will feel.

---

## 7. The Anti-List Rule

**Cards answer. Feed enumerates.**

This is the structural backbone of the whole product. It is inviolable in v1.

- **Hard cap: max 2 quotes visible inline in any bot response.** A third quote pivots to the index instead.
- *"Also in [sermon X, Y]"* is allowed as collapsed ghost-text deep-links — up to a ceiling of 6 sermons referenced per response.
- For Sprawl: the chat card holds **one** anchor quote + honest frame + an affordance pointing down. The feed below silently re-sorts — relevant sermons rise, everything else dims to ~40% opacity but stays scrollable.

**Why inviolable?** A chatbot that returns bulleted lists of six sermons looks like search. It also misrepresents Brett's teaching — he is not a search index. The feed exists precisely so the chat card doesn't have to enumerate. If the chat ever feels like it needs to list, the UI is working wrong.

---

## 8. Example Dialogues

These are calibrated. Use them verbatim as ground truth for the system prompt and as test fixtures during evaluation.

**Note on sermon titles used below.** *Trauma and Self-Blame* corresponds to a real transcript Anna already has (`Trauma Self Blame [u7Q-WVrNLfc].en.vtt`). The Lent and Heaven dialogues reference illustrative sermons chosen to exercise Parallel and Sprawl shapes — they are calibration targets for the voice, not claims that those specific sermons exist in the real corpus yet.

### Single / High — *"why does everything feel like my fault?"*
```
Yeah, that's a heavy one. Brett hit this pretty directly in "Trauma
and Self-Blame" (Feb 2024):

  "When you grow up small, you learn to make yourself the reason.
   It's safer than the truth."

He goes on for about four minutes from there — worth the full listen.
```

### Parallel / High — *"what did Brett say about lent?"*
```
Brett's come back to Lent a couple of times — once in 2024, again
in 2025, and the framing rhymes. From last year:

  "Lent isn't punishment. It's practice at being honest with God."

And the year before, same instinct, different words:

  "You give something up so you notice what's been holding you."

When he repeats himself like this, it usually means he's settled
on something he believes.
```

### Sprawl / High — *"what does Brett say about heaven?"*
```
Heaven's one he touches a lot but doesn't sit down with for a whole
sermon. Two moments that felt like different angles:

  "Heaven isn't the reward for getting life right. It's the direction
   life is already bending." — Easter 2024

  "I don't think Jesus spent much time describing heaven because he
   was busy building it here." — Kingdom series, 2023

There are maybe eight other sermons where it comes up in passing —
I can pull that list if you want to browse.
```

### Low (no match) — *"what does Brett say about [topic he hasn't preached on]?"*
```
I looked and couldn't find a sermon where Brett takes this up directly.
I'd rather tell you that than guess.
```

---

## 9. Architecture

**v1 scope.** Keep the static-site, local-first ethos of the rest of tablefresh. No vector database; no server beyond a single Cloudflare Pages Function.

| Layer | Choice | Notes |
|-------|--------|-------|
| Site | Astro static site (unchanged) | Content collections at `src/content/messages` |
| Inference | Cloudflare Pages Function `POST /api/ask` | Calls Anthropic Claude API — Haiku for preprocessor, Sonnet for composition if quality demands |
| Embeddings | `text-embedding-3-small` or Voyage `voyage-3-lite` | ~3,000 chunks (100 sermons × 30 min) |
| Vector store | `scripts/transcripts/embeddings.json`, ~15MB | Committed to repo, loaded into Function memory on cold start, cosine similarity computed in-process |
| Migration path | Turso + `sqlite-vec` | Only if/when scale demands it |
| Chunking | ~400 token windows, speaker-turn coalescing | 50-token overlap between adjacent chunks. Preserve `start_seconds`. |
| Transcripts | YouTube auto-captions (primary), OpenAI Whisper API (fallback) | Whisper used when YouTube has no English auto-captions; ~18% of videos in practice. Always passed `language: "en"` — auto-detect gets confused by opening music. |
| Deep-links | `https://www.youtube.com/watch?v={id}&t={seconds}s` | Integer seconds |

**Preprocessor.** One Haiku call before retrieval extracts a small structured object:
```json
{
  "topic": "string",
  "filters": {
    "after_date": "YYYY-MM-DD | null",
    "speakers": ["brett_tilford"],
    "content_types": ["sermon"]
  },
  "intent": "topical_overview | specific_pastoral | biographical | doctrinal"
}
```
Cost ~$0.0001 per query, latency ~300ms. The preprocessor is where natural-language filter parsing lives ("last month," "recently," "the Easter one") so the retrieval code itself stays dumb.

---

## 10. Content Schema & File Layout

```json
{
  "service_id": "2025-10-12",
  "youtube_id": "abc123",
  "content_id": "sermon-2025-10-12-brett",
  "content_type": "sermon | worship | announcement | story_sunday | guest_sermon",
  "speaker": "brett_tilford | guest:jane_doe | congregant:anon_042 | null",
  "consent_status": "granted | pending | unknown | revoked",
  "start_seconds": 1820,
  "end_seconds": 2180,
  "text": "...",
  "embedding": [ ... ]
}
```

**File layout rule: one markdown file per `content_id`, not per video.** A Sunday service video may split into a Brett sermon, a guest segment, a Story Sunday testimony, and worship — four `content_id`s, four markdown files, all pointing at the same `youtube_id` with different time windows. This is not incidental.

**Why per-content_id?** Consent revocation. If a Story Sunday participant asks to be removed, Anna deletes that markdown file and re-embeds. The words are cleanly out of the corpus and the vector store. If we had used one file per video, revocation would mean surgery on a shared file — harder, riskier, auditable only by diff.

### Authored markdown frontmatter

Each `content_id` markdown file lives in `scripts/transcripts/content/` and carries two bands of fields: auto-generated (from yt-dlp metadata) and human-reviewed (defaults applied, adjust per content):

```yaml
---
# Auto-generated fields
content_id: sermon-2026-04-20-u7Q-WVrNLfc
youtube_id: u7Q-WVrNLfc
youtube_title: "Trauma  Self Blame"
upload_date: 2026-04-20
duration_seconds: 4437  # 01:13:57
vtt_path: scripts/transcripts/raw/2026-04-20-u7Q-WVrNLfc.en.vtt

# Watch: https://www.youtube.com/watch?v=u7Q-WVrNLfc

# Human-reviewed fields (defaults applied; adjust as needed)
title: "Trauma  Self Blame"              # defaults to youtube_title
content_description: "Self-blame offers traumatized people a false sense of control..."   # auto-filled by make-descriptions
speaker: "brett_tilford"                  # common-case default; override for guests
content_type: "sermon"                    # common-case default; override for worship, story_sunday, etc.
content_start: "00:21:20"                 # hh:mm:ss where the content begins in the video (auto-detected or null)
content_end: "00:54:22"                   # hh:mm:ss where it ends (auto-detected or null)
series: null                              # name or null

# Defaults ok as-is
consent_status: granted                   # implied consent for streamed pulpit content (§14)
---
```

Notes:
- `content_start` / `content_end` are **hh:mm:ss strings**, not integer seconds. This matches what YouTube's mobile player displays — reviewers entering bounds from their phone don't do arithmetic.
- **`content_description`** is a short (≤40 word) factual subtitle for the scrollable index (§16). Auto-generated by `make-descriptions` from the bounded VTT (falls back to the full VTT + "focus on sermon" instruction when bounds aren't set). Reviewer edits or keeps as-is.
- **`content_start` / `content_end`** are often auto-detected by `detect-bounds` via Brett's consistent phrasings. Start: `grace and peace` after a 15-minute floor. End (tried in priority order): the Trinitarian benediction (`in the name of the father…holy spirit`) using the **last** match to avoid catching mid-sermon scripture quotes like Matthew 28:19; then `we practice…open table`, `open table`, `come to the table`, and finally a generic `communion` fallback. Catches both bounds on ~51% of the backlog, start-only on another ~16%. Auto-detected values get an inline `# auto: "pattern" — verify` comment so reviewers know which phrase triggered the detection. Guest speakers and special services fall through to manual review.
- Pending-review signal: `content_start` or `content_end` still `null` means the markdown is not yet ingestible. The chunker skips it.
- The inline `# Watch: <url>` comment is clickable in VS Code and GitHub PR diffs — reviewer clicks to open the video, scrubs to confirm bounds, fills in any remaining nulls.

---

## 11. Retrieval Filter (Defense in Depth)

**Default-deny.** The retrieval code filters before the LLM ever sees chunks.

```js
const allowedTypes = filters.content_types ?? ["sermon"];
const allowedSpeakers = filters.speakers ?? ["brett_tilford"];

chunks.filter(c =>
  allowedTypes.includes(c.content_type) &&
  allowedSpeakers.includes(c.speaker) &&
  c.consent_status === "granted"
);
```

The preprocessor must **explicitly widen** the filter to include guests, Story Sunday, etc. It is never the default. This is defense in depth: even if the composition prompt drifts, even if a future developer adds a content type without thinking, the retrieval layer refuses to surface un-consented or misattributable material.

---

## 12. Function Response Schema

The `POST /api/ask` Function returns structured data, not rendered prose. Branching on tier and shape happens inside the composition prompt, not in the Function.

```json
{
  "tier": "high | medium | low",
  "shape": "single | parallel | sprawl",
  "top_score": 0.81,
  "top3_gap": 0.11,
  "distinct_content_ids_in_top10": 2,
  "predicted_shape": "specific_pastoral",
  "shape_divergence": false,
  "chunks": [ ... ]
}
```

**Why?** Hardcoded user-facing sentences in Function code are brittle and hard to iterate on. Letting the LLM compose from structured signals keeps the voice work in one place (the system prompt) and makes A/B iteration on phrasing cheap.

### Telemetry (required from day one)

Every query + response must be logged as structured JSON — `queries.jsonl` in Cloudflare KV, or equivalent. Minimum fields per row:

- `timestamp`
- `query` (the raw user string)
- `top_score`
- `top3_gap`
- `tier`
- `shape`
- `distinct_content_ids_in_top10`
- `chunks_selected` (list of `{content_id, start_seconds}`)
- `response_preview_first_200_chars`

**Why this is not optional, and not phase 2.** Without telemetry, a user asks something Brett has in fact preached on, gets a Low tier or a refusal, and Anna never learns. Silent misses are the product's first production failure mode. The log feeds both regression detection and threshold recalibration — neither is possible from memory or user reports alone.

**Weekly review cadence.** Anna scans `queries.jsonl` for patterns: common queries returning Low that shouldn't, queries that returned Single but should have been Sprawl, synonyms landing in different neighborhoods. Those observations drive threshold tuning and, over time, corpus gaps that a new sermon or ingestion of archived material could close.

---

## 13. Content Scope

| Content type | v1 | Phase 2 | Never |
|---|---|---|---|
| Brett sermons | Chatbot + index | — | — |
| Guest speakers | Index only, clearly labeled | Chatbot (with per-guest consent) | — |
| Worship songs | Metadata card only (title, date, timestamp, songwriter) | — | Lyrics in corpus (CCLI) |
| Story Sunday | — | Chatbot + separate testimony surface (consent infrastructure REQUIRED FIRST) | — |
| Announcements | — | — | Skip permanently |

**Why these lines?** Brett is the consenting, publishing author of his sermons — the baseline case. Guests have named but time-bounded consent. Worship lyrics are a licensing issue (CCLI), not a design choice. Story Sunday is categorically different — congregant testimony is a different pastoral function than teaching, and Saga's recommendation is that it ultimately lives in its own surface rather than folded into the teaching chatbot. Announcements are ephemeral by nature and would rot in a corpus.

---

## 14. Consent Infrastructure

**Required before any Story Sunday ingestion. Non-negotiable.**

### Implied vs. explicit consent — draw the line plainly

The two categories are not the same and must not be conflated:

- **Implied consent applies to:** pastoral teaching delivered into archived or streamed services. Brett's sermons and guest teachers' guest sermons both sit here — these speakers knowingly deliver content into a recording that persists publicly.
- **Implied consent does NOT apply to:** Story Sunday testimony-sharing by congregants. These require **explicit, per-story opt-in**, with attribution preferences preserved (full name, first name, anonymous) and revocation treated as a first-class feature. The frontmatter fields below cover this — the distinction is being called out here so readers don't flatten the two cases.

### Frontmatter

Frontmatter fields every non-Brett content file must carry:

```yaml
consent_status: granted | pending | unknown | revoked
attribution_preference: full_name | first_name | anonymous
revocation_requested_at: null
ingest_approved_by: "anna@..."
ingest_approved_at: 2026-04-22
```

**Ingestion rule.** The ingestion script refuses any chunk whose `consent_status != "granted"`. No exceptions, no "temporary" allow-lists.

**Revocation flow.** Delete the markdown file → re-run the embed script → the words are out of the corpus and the vector store. Because file layout is one-per-`content_id` (§10), revocation is atomic.

### Defensive retrieval rule (belt and suspenders)

Regardless of ingestion path, any chunk with `content_type == "story_sunday"` is excluded from the corpus until `consent_status == "granted"`. If Planning Center items are auto-ingested in the future (see §17 v1.5), any item with a title matching `/story sunday|testimony/i` is auto-tagged `content_type: story_sunday` at ingest and enters the excluded set by default. Default-deny at both the ingestion layer and the retrieval layer — two locks, not one.

**Open question.** Who builds the consent capture mechanism — a form on the site, a paper form at church, a verbal process during the Story Sunday service itself? This is deferred until v1 ships, but must be answered before Phase 2 begins.

---

## 15. Attribution Rules

**Every quote names exactly one speaker, and the attribution line has the same grammar whoever spoke it.** *"[Name] said [X] on [date]."* No elevated verbs for guests, no diminished ones for congregants. This rule survives The Table adding a second pastor, a recurring guest, or Story Sunday scaling.

**Pull-quote card patterns:**

- **Brett card** — quote + *"Brett, [sermon title], [date]"*
- **Story Sunday card (Phase 2)** — quote + *"[First name] — Story Sunday, [date]"* + small *"shared with permission"* tag
- **Guest card** — quote + *"[Full name], guest teaching [date]"*

**Leak handling.** If a non-Brett chunk ever makes it through the retrieval filter, the bot MUST refuse to attribute it to Brett. Fallback line:

> "That line is from a guest teacher, not Brett — I only answer from Brett's sermons right now. Here's where to find it: [link]"

---

## 16. Index / Pull-Quote Feed Design

**Default state.** Reverse-chronological feed.

**Unit of content: the pull-quote card.** The big-type pull quote is the largest text on the card — bigger than title, date, or topic chips. Brett's name, date, and sermon title sit underneath. A one-line summary completes the card. Tap to expand.

**Why pull-quote-first?** A sermon card whose hierarchy leads with title and date is indistinguishable from a podcast list. The quote is the thing that tells Sam *what this sermon sounds like.* That's what she came to find.

**Secondary affordances**
- Topic chips at top ("doubt," "trauma," "scripture," etc.)
- Date scrubber on the right

**Series grouping** lives inside the sermon detail view, not top level. Series is a Brett-mental-model (he preaches in arcs); the index is a Sam-mental-model (she's looking for a specific quote, not an arc). Don't impose the wrong lens.

**Cross-pollination with chat**
- Chat response → *"Brett's come back to this — 3 more sermons"* row that scrolls the feed.
- Index card → small *"ask about this sermon"* ghost-text affordance that pre-fills the chat.

**Cut from v1: full-text transcript search.** People think they want it; they don't. It returns 40 hits of "God" and feels like Ctrl-F. The chatbot does this job warmer.

---

## 17. Ingestion Workflow

Staged deliberately. Build the dumbest thing that works, then integrate only when real pain justifies it.

### v1 — two-stage GitHub Action with PR review

(Revised from the earlier "start dumb" recommendation. Anna weighed the weekly-rhythm UX and concluded that PRs pay for themselves even with one committer: mobile notifications tell you there's work, diffs make each stub reviewable, and merges can happen from anywhere. The ceremony is worth it at this volume.)

**Stage 1 — download + stub generation** (runs in a single GitHub Action, `ingest-transcripts.yml`, on weekly cron + `workflow_dispatch`).

1. **`npm run fetch`** — `yt-dlp` pulls auto-captioned VTTs from The Table's `/streams` tab into `scripts/transcripts/raw/`. Naming: `YYYY-MM-DD-<youtube_id>.en.vtt`. Also writes `<base>.info.json` alongside. `archive.txt` records processed video IDs for idempotency.
2. **`npm run transcribe`** — Whisper fallback. For any info.json without a matching VTT (YouTube had no English auto-captions), downloads low-bitrate mono audio via `yt-dlp` and sends to OpenAI Whisper (`response_format: "vtt"`, `language: "en"`). Writes to the same path the auto-caption would have. ~$0.40 per 70-min service. ~18% of videos in The Table's backlog needed this.
3. **`npm run make-stubs`** — for each VTT without a matching markdown in `scripts/transcripts/content/`, generates a stub with auto-filled metadata, defaulted review fields (`title`, `speaker`, `content_type`), and null placeholders for `content_description` / `content_start` / `content_end` / `series`. Also maintains `archive.txt` directly (works around yt-dlp not writing it under `--skip-download`).
4. **`npm run detect-bounds`** — heuristic auto-fill of `content_start` / `content_end` using Brett's consistent phrasings. Start: "grace and peace" after a 15-minute floor. End (tried in priority order): Trinitarian benediction ("in the name of the father…holy spirit", last-match to avoid Matthew 28:19 mid-sermon), "we practice…open table", "open table", "come to the table", then generic "communion". Guarded by a 10-minute minimum sermon length. Leaves fields null when phrasings don't match; reviewer handles from scratch.
5. **`npm run make-descriptions`** — generates a short AI description (Haiku, ~40 words, honest-warmth voice with the same banned-word list as §4) for each stub with a null `content_description`. When bounds are set (from detect-bounds or prior human edit), filters the VTT to just that range before summarizing; otherwise uses the full VTT with a "focus on the sermon portion" instruction. Includes a safety check that detects LLM refusal patterns (e.g., "NO_SERMON_CONTENT" for music-only videos) and leaves the field null rather than writing junk. ~$0.01 per stub.

**Stage 2 — PR review.** The Action commits new VTTs + `archive.txt` + stubs and opens a PR titled "Review: new sermon transcripts" with the `transcripts` and `needs-review` labels. A reviewer verifies auto-detected bounds, approves or edits the auto-generated description, confirms defaults on `speaker` / `content_type`, and merges. For stubs where bounds weren't auto-detected, reviewer fills them in from scratch.

**Pending-review signal.** Any markdown in `scripts/transcripts/content/` with a null required field is pending. `grep -l "^content_start: null" scripts/transcripts/content/*.md` lists work queue.

**Secrets the Action needs.** `OPENAI_API_KEY` (Whisper + embeddings), `YOUTUBE_CHANNEL_URL` as a repo variable (not secret — it's public).

### v1.5 — Planning Center integration (trigger: Anna feels copy-paste pain for 3 consecutive weeks)

When the manual workflow starts costing real time, integrate Planning Center Services as source-of-truth for segmentation and speaker metadata:

- Planning Center `plans` + `items` endpoints provide `sequence`, `item_type`, `title`, and `person` via `item_times` / `assignments`. These map directly to `content_type` and `speaker` with no human labeling step.
- The worship-planning volunteer continues using PC as part of their normal workflow. They do **nothing additional** for the chatbot.
- Service-clock-to-YouTube-clock reconciliation: the volunteer marks a single `stream_start_marker` on one PC item — roughly 30 seconds of added task — representing where the YouTube stream actually began relative to the service plan.
- An `ingest.yml` GitHub Action runs weekly: fetches the PC plan + the new YouTube upload, merges them via the `stream_start_marker` offset, emits markdown with segments pre-populated, commits.

**Only integrate when real pain justifies it. Do not build this speculatively.**

### v2 — future

- Chapter markers on YouTube uploads **only if** The Table adopts them for public-viewer UX reasons. Not adopted solely to serve the chatbot.
- An automated PR workflow with multiple reviewers **only if** tablefresh adds more committers. Today it has one.

### Design note

The "kill the PR ceremony" recommendation from an earlier draft was walked back: even with one committer, the PR workflow earns its keep on weekly rhythm (notifications, reviewable diffs, mobile-friendly merging). But the underlying discipline still applies — every other piece of automation ceremony (chapter-marker requirements, auto-classification from textual cues, PC integration before pain is felt) stays deferred until real friction justifies it.

Misattributing a guest as Brett is a reputation event. The defense is the retrieval filter (§11) and the attribution rules (§15), not the workflow gate — the PR gate helps but doesn't substitute for the retrieval-level default-deny.

---

## 18. Build Sequence

A deliberately small first step. Each stage validates the next before anything user-facing is built.

1. **Afternoon 1 — ✓ complete.** `scripts/ask.ts` CLI over the Trauma/Self-Blame transcript. Validated retrieval on a direct hit (top-1 = 0.415), a topical near-miss (0.378), and a clear off-topic (0.123). Honest-warmth voice held, anti-list rule held, verbatim+inline deep-links working.
1a. **Ingestion pipeline — ✓ complete.** `fetch` / `transcribe` / `make-stubs` scripts + `ingest-transcripts.yml` GitHub Action per §17 v1. Full 303-video backlog processed; 23 Whisper fallbacks (~$9 total). Stubs sit in `scripts/transcripts/content/` awaiting per-sermon review.
2. **Next — refactor ask.ts to read from the stubs.** Currently hardcoded to one VTT. Once a handful of content files have their review fields filled in, point the CLI at the reviewed set to query across a real multi-sermon corpus. This is where `parallel` and `sprawl` response shapes first become testable.
3. **Week 1-2.** Run calibration queries against the reviewed subset. Watch retrieval behavior.
3. **Week 2-3.** Cloudflare Pages Function with telemetry (structured query logging per §12) from day one.
4. **Week 3-4.** Astro page with chat + feed (per §16 Index Design).
5. **Post-launch.** Review `queries.jsonl` weekly. Recalibrate thresholds at n=500 real queries (Amelia's recommendation; the initial n=90 is smoke-test calibration, not settled thresholds — see §19).
6. **Deferred until pain justifies.** Planning Center integration per §17 v1.5.

---

## 19. Retrieval Quality Checklist

Run all six before shipping:

1. **Known-positive queries** — direct hits. Do they return Single/High?
2. **Known-negative queries** — off-topic. Do they return Low with the clean say-so?
3. **Synonym robustness** — "grief" vs "loss" vs "mourning" should all land in the same neighborhood.
4. **Metadata extraction accuracy** — does the preprocessor correctly parse "last month," "recently," "the Easter one"?
5. **Retrieval diversity** — is one charismatic sermon eating every query? If so, chunk size or overlap is wrong.
6. **Chunk-boundary stress** — paraphrased queries spanning chunk boundaries. Does the retrieval still find them?

**Calibration honesty note.** The ~30-query calibration proposed in §5 is a smoke test, not a settled calibration. Thresholds calibrated at n=90 (30 positive + 30 adjacent + 30 negative) will move ±0.05 on re-label. For stable thresholds, target ~200 labeled queries before committing to fixed bands, or ship with logged scores (§12 telemetry) and recalibrate at n=500 real production queries.

---

## 20. System Prompt (Starting Draft)

This is a starting point, not a settled artifact. Expect to tune after calibration.

```
You answer questions using Brett's sermons at The Table.

You are speaking on behalf of a real pastor to a real congregation,
many of whom came to The Table after being hurt by another church.
Warmth here is load-bearing — not decoration. Be specific rather
than effusive: name the sermon, name what you couldn't find, say
"yeah, that's a hard one" when it is. Let responses end softly;
don't chase the user with follow-ups. Your job is to sound like
someone who has actually listened to these sermons and cares that
the person asking is okay — not like a search interface being polite.

Rules:
- Every claim about what Brett said must be a direct, verbatim quote
  with sermon title, timestamp, and YouTube deep-link.
- Do not paraphrase Brett. Do not smooth his grammar. Keep restarts,
  filler, and casual phrasing intact.
- If Brett hasn't preached on the topic, say exactly that and stop.
  Do not pivot to adjacent themes unless one genuinely exists, and
  then name it in one line.
- Do not paraphrase Brett's theology. You have no thesis; he does.
- Do not use: explores, journey, unpacks, delves, invites, beautifully,
  powerfully, wrestles with, leans into, reminds us that.
- Do not open with "Let me" or "I'd love to." Start with the answer
  or the quote.
- Short sentences. Direct address. No pastoral softening. Seams show
  on purpose.
- Max 2 quotes inline. If more sermons are relevant, acknowledge with
  ghost-text and point to the scrollable index below.
- Never invent a quote. Never guess a timestamp.
- If a retrieved chunk is not from Brett, do not quote it as Brett.
  Tell the user the line is from someone else and point to where it
  lives.
```

---

## 21. Open Questions & Deferred Decisions

- **Exact cosine thresholds** for tiers and shapes — must be empirically calibrated against the real transcripts before shipping. The numbers in §5 and §6 are starting points; see §19 for the n=90 smoke-test vs. n=500 production-calibration distinction.
- **"Where The Table Stands" lane** — whether it's a pinned row of the feed, a separate page, or something else entirely. Deferred until v1 ships and we see how Quinn-style first-visit users actually behave.
- **Story Sunday consent capture mechanism** — form on the site, paper form at church, or verbal process during service. See §14. Must be answered before Phase 2 begins.
- **The preprocessor's `intent` taxonomy** — current draft is `topical_overview | specific_pastoral | biographical | doctrinal`. Expect this to expand with real usage; treat it as a living enum.
- **Brett's verbatim-policy preferences** — filler, restarts, grammar preservation. The spec currently asserts "keep it all" (§4, §20), but this must be finalized in a direct conversation with Brett before v1 launch. Brett's concept-level approval (see Origin) does not cover these specifics.
- **Sequencing — chatbot before or after tablefresh homepage launch.** The pressure-test round raised this as a real question; Anna did not resolve it in-session. Open.
- **A non-Anna co-maintainer.** Deferred: low volume (0-1 services/week) plus eventual PC automation (§17 v1.5) make this less urgent now. But if the prototype validates and the project commits to long-term operation, sustainability should be revisited — a single-committer corpus that feeds a live product is a bus-factor problem over time.

---

## 22. Editorial Notes

Things worth flagging to any future implementer or reviewer:

**The voice calibration is load-bearing.** Section 4's banned-word lists are not stylistic preference. They were written by someone who has been on the receiving end of pastoral AI voice and can identify the exact phrases that signal "the system is performing care" rather than "the system has something to say." Treat the voice rules the way you would treat a product requirement, because that is what they are.

**The anti-list rule (§7) is inviolable in v1.** If the chat card ever feels like it needs to enumerate, the UI is working wrong. Fix the UI. Do not relax the rule.

**Consent-before-capture for Story Sunday is non-negotiable.** No allow-lists, no "we'll get permission later." The ingestion script refuses un-granted chunks at the door. This protects both individual congregants and the long-term trustworthiness of the whole surface. The moment anyone's words show up in the corpus without granted consent, the product has lost something it can't fully earn back.

**"Start dumb" discipline — revised on the PR workflow, intact everywhere else.** Winston initially walked back the GitHub Actions + PR review pattern for v1. Anna reconsidered and kept it — on weekly rhythm, PRs give mobile notifications, reviewable diffs, and async-friendly merging even with one committer. The principle still applies to every other speculative piece: Planning Center integration (§17 v1.5), chapter markers, auto-classification, multi-reviewer approval gates. Don't build those until real pain justifies them.

**Telemetry is day-one, not phase 2.** Silent misses — Brett preached on it, the user got refused — are the product's first failure mode. Structured query logging (§12) must ship with the Function, not be added later. You cannot debug what you did not log.

The first three rules above are inviolable. The last two are nearly so: violate them only if the circumstances that justify them (single committer, low volume, no feedback channel) have actually changed.
