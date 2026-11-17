# Roadmap

Planned work and known gaps. One file, kept short.

This replaces the `.hermes/` planning archive, removed because its plans were spent
and its state claims predated the flatten refactor (`f21644b`) and the redesign
(`43f10a8`). The originals remain in git history at commit `9dc1aff`.

---

## Priority: Ask The Table — one sermon through the whole workflow (2026-11-17)

Milestone 1 implementation authorized 2026-11-17: self-blame sermon, Anna as
reviewer, OpenAI promotional credits with no paid overage, and a separate
credits-only API organization. Implementation is in progress; transcript approval,
API activation/evaluation and release verification remain outstanding. See
[the pilot runbook](docs/ask-pilot.md). This queue supersedes the older `/ask` and transcript-pipeline status
claims below and in `docs/ask-remaining-work.md` and
`docs/media-ingestion-remaining-work.md`. Work these milestones in order.

**Milestone 1 progress (2026-11-17):** [implementation draft #55](https://github.com/bigminer/thetable2026/pull/55)
prepares saved semantic indexing, exact-quotation validation, review/consent gates,
and isolated credit configuration. GitHub Actions successfully created
[transcript review draft #56](https://github.com/bigminer/thetable2026/pull/56), confirming
Gary's PR-permission fix. Direct YouTube acquisition on the runner failed because
its saved cookies expired; the recovery run imported locally acquired bounded
captions instead, without a paid transcription fallback. The candidate covers
21:20–53:30.24 through the closing Amen and remains unapproved. OpenAI support has
received and escalated the separate credits-only organization request. No API calls,
approval, merge or deployment have occurred; real retrieval evaluation is pending.

**Verified baseline:** 333 metadata records; 273 pass the current eligibility
filter, but there are zero tracked raw transcripts and a clean checkout builds zero
searchable sermon chunks. Production returns composition fallback text and zero
sermon matches. The newest listed source is 2026-04-20. Some eligible records are
guest, panel, or Story Sunday material mislabeled as Brett sermons. The
[2026-11-16 ingestion run](https://github.com/bigminer/thetable2026/actions/runs/43944172472)
transcribed 0 of 26 videos, marked the failed videos as processed, pushed an
archive-only branch, then failed to open a PR because Actions PR creation is
disabled. Existing tests/build/smoke pass without testing a real `/ask` answer.

**Required direction:** semantic search is part of the first milestone. Generate
document embeddings before serving visitors, persist them with the approved source
text, and reuse them across requests, restarts, and deployments. At question time,
embed only the question, search the existing index, then compose from selected
evidence. Never rebuild the corpus in a visitor request. Keywords may complement
semantic ranking for exact titles, names, and Bible references; they are not the
primary acceptance criterion. Keep the file-based Astro architecture.

### 1. Prove one reviewed sermon end to end

- **Select one source and reviewer.** Candidate: “Trauma Self Blame,” YouTube
  `u7Q-WVrNLfc` (upload 2026-04-20), because it exercises the page's example
  question. Confirm Brett is the speaker, consent, actual sermon date, transcript
  accuracy, and segment bounds against the video; existing auto-detected values
  are suggestions. Only this explicitly approved sermon enters the pilot corpus.
- **Repair acquisition and PR delivery for that source.** Allow a single-video
  run, recover captions or audio through an authorized source, pass authentication
  consistently to fallback downloads, and report failures. Archive only successful
  acquisitions and preserve enough state to retry failures. Do not merge the
  existing archive-only branch unchanged. A repository admin must enable Actions
  PR creation; verify the bot PR's checks can run and retain human merge approval.
- **Make the reviewed text deployable.** Persist the bounded transcript, provenance,
  timestamps, and explicit review/consent state. Full-service raw transcripts and
  personal-story material must not be swept into this public repository. Missing
  approved text must fail validation rather than silently produce an empty index.
- **Precompute semantic retrieval.** Build a versioned index outside request handling
  from approved content. Record content hashes, chunking version, embedding provider,
  model, and dimensions. Reuse unchanged vectors; invalidate on source or configuration
  changes. Deploy the index and matching text atomically; validate their manifest on
  build/startup. A clean deploy must load the persisted index without embedding it.
- **Produce a grounded answer.** Configure the hosted answer model, remove the
  keyword-based routing that drops sermon evidence, and enforce source-backed
  excerpts. Validate quoted text against approved transcript spans; construct titles,
  dates, timestamps, and allowed links in code. Fix unsafe Markdown/HTML rendering
  before enabling generated output. On model failure, show usable source links and
  an explicit degraded state; on missing evidence, abstain. Restrict diagnostic
  logging to operational metadata by default, not raw visitor questions.
- **Exercise the release path.** Open/review the content PR, merge to `main`, promote
  through a reviewed PR to `release`, and verify on Render. Static GitHub Pages
  preview cannot exercise `/api/ask`. Keep `/ask` out of navigation and noindexed;
  that is discoverability control, not access control. Quarantine unreviewed legacy
  entries from the source feed as well as retrieval when enabling the pilot.

**Acceptance:** one source completes acquisition → PR → human review → persisted
text/index → release → semantic question → supported answer with a working YouTube
timestamp. A small reviewed evaluation set includes differently worded questions,
the self-blame example, and unrelated questions that must abstain. Verify a clean
deploy/restart makes zero document-embedding calls, a repeated unchanged ingestion
makes no duplicate content or embedding calls, and a failed acquisition remains
retryable. Verify revoked/unreviewed content is excluded, fabricated quotations are
rejected, hostile output renders safely, and provider failure is visible. Record
actual processing cost, query cost, and latency before expanding. A one-sermon test
proves the workflow, not archive-wide ranking quality.

### 2. Establish search quality across a small reviewed collection

Add a handful of contrasting sermons and current website facts. Test semantic
paraphrases, exact references, ambiguous questions, multiple sources, and absent
topics. Compare semantic and hybrid ranking against human-selected passages;
calibrate abstention thresholds using this evidence, not inherited similarity
constants. Keep service time/location grounded in shared site facts. Verify
transcript corrections and consent revocation invalidate every published index and
cached answer. Choose broader quality/latency/cost targets from pilot measurements.

### 3. Recover the backlog and make weekly ingestion dependable

Audit the 333 existing records before admitting them; correct speaker, type, consent,
and boundaries. Recover missing text in reviewable batches, with incremental indexing
and per-run limits. Make weekly discovery produce actionable PRs, retry failed items,
avoid concurrent duplicate runs, and alert on failure or stale source dates. Reconcile
the old ingestion and editorial docs with the proven workflow. Keep separate automation
for publishing `/series/` message entries outside this Ask milestone unless explicitly
added to scope.

### 4. Prepare public launch

Finalize Brett's quotation/editorial policy and a named review owner. Explain archive
coverage, AI processing, and retention to visitors; provide useful feedback, source
links, and outage behavior. Replace debug scores with meaningful explanations and
set usable request/spending limits. Add ongoing semantic/quotation regression checks
and freshness/availability monitoring. Unhide only after reviewed launch acceptance.

### Decisions before implementation

| Decision | Proposed default / unresolved dependency |
| --- | --- |
| Pilot source and review owner | Selected: the self-blame sermon; Anna reviews the exact transcript, metadata, bounds and consent before activation. |
| API provider, ownership, and spending | Approved: OpenAI promotional credits only, no paid overage, in a separate organization. Confirm activation, receiving organization, current grant/expiry, and model access; use a dedicated project/key. Stop on exhaustion; paid usage is prohibited. A second organization currently requires an OpenAI support request. Confirm who owns ongoing church operation. Personal billing details and keys stay out of the repo. |
| Durable storage and indexing | Prefer approved bounded text plus a compact versioned index shipped with the app. Measure size before choosing tracked generated files versus a durable versioned artifact. Store reusable vectors outside disposable runner/Render filesystems; avoid adding a database until scale requires one. |
| Editorial contract | Source-backed transcript excerpts and explicit attribution; AI may supply brief connecting prose but may not invent or freely paraphrase Brett's position. Reviewer confirms transcript corrections and the acceptable quotation policy. |
| Publication scope | One approved sermon in `/ask`, no navigation launch and no `/series/` automation. Confirm that a direct-URL public pilot is acceptable; use authenticated staging if it must be private. |

The embedding and answer models may differ. Select exact versions/dimensions during
the first implementation proposal against current API availability and the evaluation
set; document the selection in the index manifest. API credits are a funding option,
not evidence of activation or a permanent operating budget. Semantic embeddings are
required now; a hosted vector database, reranker, conversation memory, full backlog,
and autonomous publishing are not prerequisites for the one-sermon milestone.

---

## Prepared: Get Involved invitation copy (2026-11-07)

Explicitly requested by the maintainer. Replace the two old body headings and
their paragraphs with the supplied community, gifts, and practical-love sections,
followed by the revised next-step invitation. Keep the phone and external MeetUp
form links working and use the existing prose-page typography and layout.

## Completed: use The Table logo for the browser tab icon (2026-11-07)

Explicitly requested by the maintainer. Replace Astro's starter favicons with the
red script/woodgrain logo supplied from Drive, `TableLogo_Transparent Red.png`
([source](https://drive.google.com/file/d/1asLtRbjqqsGpsHSJ8qSGj_kYmqnJ4jnw/view)).
The web-sized asset removes empty transparent margins and preserves the artwork;
the SVG centers it on cream and the ICO supplies standard pixel sizes. The
maintainer requested a circular cream ground with transparent outer corners after
the initial square version shipped. Align the logo's curved woodgrain bottom with
the circle's lower edge, using the approved slight stretch and a circular clip.
Version the icon URLs so existing browsers fetch the new branding. The original
version shipped in PR #45; the circular follow-up is prepared for review and
activation through main and release.

The same PR also includes the maintainer's requested Get Involved copy cleanup:
remove the interest-form restoration preface and begin the paragraph “Call or text”.

## Planned: domain cutover

The site runs on Render at `https://thetabletx.onrender.com`. `thetabletx.org` still
points at WordPress. Cutting over is a planned task, not an open question — do not
relitigate it each session.

- Canonical domain: `thetabletx.org` (set as `canonicalOrigin` in `src/config/domains.mjs`)
- Secondary: `thetabletx.com` 301s to the canonical domain
- Registrar: GoDaddy. DNS records were last observed 2026-05-16 and need re-checking
  before any change.
- No custom domain is attached to the Render service yet.

Ready in code: `src/middleware.ts` 301s `thetabletx.com`, `www.thetabletx.com` and
`www.thetabletx.org` to the canonical host; `astro.config.mjs` builds the sitemap from
`canonicalOrigin`; `robots.txt` derives its sitemap URL from the same value.

Remaining is external: point DNS at Render, attach the custom domain, confirm SSL.

**Acceptance:** `thetabletx.org` serves the Astro site with valid SSL, and
`thetabletx.com` plus old WordPress URLs redirect or 404 cleanly.

Sequence the mail work (below) with this — both touch DNS.

---

## In progress: restore Google Ads contact measurement (2026-11-07)

Approved after the post-migration audit. Reuse the existing Ads tag and Submit lead
form conversion; no new Ads account or GA4 property. Add optional build-time Ads
settings and count a successful contact API response once, excluding honeypots and
failed requests. Keep form contents out of events and disable advertising
personalization/user-provided advertising data. GTM, if configured, owns tags and
receives `contact_form_success` instead of a second direct conversion event.

Implementation is prepared on `codex/google-ads-tracking`; production activation
requires review, release promotion, Render settings/rebuild, and real form/tag
verification. Existing GA4 and Business Profile links were found in Ads Data Manager;
recover direct ownership separately rather than creating duplicate properties.
See [docs/google-ads-measurement.md](docs/google-ads-measurement.md) for the staged
Render settings, saved Google tag privacy change, and acceptance checks.

## Direction

Three roles, no content-management system. The repository is the database.

- **Ingestion is autonomous.** A YouTube video is published; the sermon reaches the
  archive and its transcript reaches `/ask` without a human running anything. The
  scripts for this exist but sit behind four deliberate safety catches — see the
  weekly-ingestion item below.
- **Editing is conversational.** Someone wants a change; they ask an LLM, which edits
  the files and opens a pull request.
- **Pull request review is the gate.** Every change — ingested or authored — arrives as
  a PR with its own Render preview deploy, and a human approves it. Nothing merges
  itself.

Podcasts stay as links. The feed is hosted on Anchor; this site does not generate one
and is not planned to.

**Branches:** `main` is integration, `release` is production. Render deploys from
`release` only — pinned in `render.yaml`, because a branch set in the Render dashboard
is reset to the Blueprint's own branch on the next sync. Promote by merging `main` into
`release`.

**Preview:** a static build deploys to <https://bigminer.github.io/thetable2026/> for
visual QA — run the *Deploy preview to GitHub Pages* workflow by hand from any branch.
Every page route is prerendered, so the preview's markup matches production; only the
three API endpoints are missing, meaning forms render but do not submit and `/ask`
returns no answer. It is `Disallow: /` so it never competes with the real site in
search. Render preview environments would give a fully functional per-PR deploy, but
they bill per open PR and inherit production SMTP credentials — worth revisiting only
when a preview needs working forms.

## Open: documentation and pipeline accuracy

The current work queue, taken one item at a time.

1. **Rewrite `docs/editorial-workflow.md` for the direction above.**
   Blocked on the media-ingestion work (see Known gaps) — the document describes a human
   running scripts by hand, and correcting those descriptions would only make it an
   accurate account of a workflow being replaced. Known wrong today: `make-stubs`
   writes transcript-review metadata to `data/transcripts/content/`, not message
   drafts; `automation:dry-run` prints a config summary rather than previewing the
   chain; "generated content always lands as `draft: true`" holds only for
   `ingest-new-media.ts`, while the transcript pipeline is gated by the default-deny
   filter in `corpus.ts` instead; there is no podcast feed; `detect-bounds` and
   `youtube:dry-run` are missing from the command table; and the `/ask` eligibility
   rules are documented nowhere. `AGENTS.md` repeats the podcast-feed claim.

   *(Superseded scope: this began as a straight correction of the command
   descriptions.)*

2. ~~**Correct the transcript-ingestion PR instructions.**~~ Done in PR #20;
   verified 2026-11-17. The workflow now requests `content_start` and `content_end`
   in `hh:mm:ss`. Stronger review/consent validation is part of the Ask plan above.

3. ~~**Reassess smoke coverage.**~~ Done. Form-endpoint wiring and internal-link
   integrity added; what is covered, what is deliberately not, and the known weaknesses
   are recorded in [`docs/smoke-coverage.md`](docs/smoke-coverage.md).

4. **Reconcile `design.md` with the accepted merch exceptions.**
   It says Long Document pages are typography-only and that Giving is the sole
   bordered-chip exception. Merch now intentionally uses a photographic hero and a Shop
   Now chip. Document the accepted exceptions rather than removing the approved design.

---

## Known gaps

From a pre-cutover audit on 2026-09-05, written against the pre-flatten layout. Status
below reflects a spot-check on 2026-09-07; anything marked *unverified* needs
confirming against current code before work starts.

### Blocking cutover

- **Trailing-slash normalization is client-side only.** No `trailingSlash` setting in
  `astro.config.mjs`; `404.astro` corrects it with `location.replace`. Non-JS clients
  and crawlers get the 404 body. *Confirmed still open.*
- **No legacy URL redirect map.** Nothing translates old WordPress permalinks (dated
  sermon URLs, `/?p=`, category and tag archives, `/wp-content/uploads/*`) to new
  routes. Inbound links and search rankings drop at cutover.
- **Forms deliver — fixed 2026-09-07. They had never worked.**

  Recorded here because the cause was not what any prior document predicted. The forms
  were not merely *unproven*; every submission returned HTTP 500 and a phone number.
  `SMTP_USER` and `SMTP_PASSWORD` are declared `sync: false` in `render.yaml`, so the
  Blueprint created the slots and a human was expected to fill them. Nobody had.
  `SMTP_HOST` and `SMTP_PORT` were present only because they carry literal values in the
  YAML, which made the configuration look complete.

  The account also had to be usable: `webadmin.agent@thetabletx.org` had never been
  signed into, so it had no 2-Step Verification and therefore no App Password to give.
  Google rejects basic SMTP auth without one.

  Verified end to end on 2026-09-07: `POST /api/contact` and `POST /api/newsletter` both
  return `{"ok":true}`, and the message arrives in one second.

  **Nothing caught this.** 45 unit tests, a clean build and 62 smoke checks all passed
  throughout, exactly as [`docs/smoke-coverage.md`](docs/smoke-coverage.md) predicted:
  the smoke test proves the endpoints are wired, never that mail leaves the building.
  A production health check that actually posts is the only thing that would have
  caught it, and is worth building before cutover.
- **Turnstile hostname must track the serving host.** `TURNSTILE_HOSTNAMES` is a literal
  value in `render.yaml`, and `verifyTurnstile` rejects any hostname not listed. It was
  set to `thetabletx.org` while production serves from `thetabletx.onrender.com`, so
  every submission returned HTTP 403 until both hosts were listed. **At cutover, drop
  the onrender host** — and remember that adding a new serving host means adding it
  here too.
- **Mail authentication — mostly resolved 2026-09-07.** The audit called for "a verified
  sender with SPF and DKIM" without checking which were missing. Measured:

  | | `thetabletx.org` | `thetabletx.com` |
  |---|---|---|
  | SPF | already correct — `v=spf1 include:_spf.google.com ~all` | none |
  | DKIM | **published and signing** — 2048-bit at the `google` selector | none |
  | DMARC | pending | none |
  | MX | Google | Google |

  SPF was never the gap. DKIM was: nothing existed at any standard selector, so mail
  had one of three authentication pillars. A key was generated in the Workspace admin
  console, published in GoDaddy, verified as a complete 410-character record across two
  DNS chunks, and authentication was started.

  DMARC was published the same evening at `_dmarc.thetabletx.org` as
  `v=DMARC1; p=none; rua=mailto:gary@thetabletx.org`, and resolves on both Google and
  Cloudflare. It is deliberately permissive — `p=none` reports without blocking. Tighten
  to `quarantine` once aggregate reports read clean.

  Confirmed by header inspection on a delivered message: **`SPF: PASS`** (IP
  209.85.220.65) and **`DKIM: PASS`** with domain `thetabletx.org`. DMARC read `FAIL`
  before the record existed, which is what a missing policy looks like rather than a
  misconfiguration; alignment was already correct, since the `From:` domain and the DKIM
  signing domain both match.

  Still open: `thetabletx.com` has no SPF, DKIM or DMARC. Worth adding before cutover —
  it will only redirect, but an unprotected domain can still be spoofed.
- **Media ingestion is unfinished feature work.** The separate pipeline that writes
  sermon entries to the site remains fenced shut and scoped to a closed pilot window.
  The transcript pipeline feeding `/ask` is also failing, contrary to the earlier
  status here. See the prioritized Ask plan above; the older
  [`media-ingestion notes`](docs/media-ingestion-remaining-work.md) need reconciliation.
- **`/ask` is blocked by missing source text, unsafe classifications, ingestion/PR
  failures, and unavailable composition.** The 2026-11-17 review supersedes the old
  claim that retrieval and citations work. Follow the prioritized plan above;
  [`docs/ask-remaining-work.md`](docs/ask-remaining-work.md) is historical context,
  not the current acceptance checklist. Keep the route hidden until launch review.
- **Rate limiter may key every visitor to one bucket behind Render's proxy.**
  `checkRateLimit` prefers `clientAddress`, falling back to `cf-connecting-ip` /
  `x-real-ip`. If the adapter reports Render's internal proxy IP, all visitors share a
  bucket. Verify against the deployed instance; prefer `x-forwarded-for` if confirmed.
  Rate-limit state is also in-memory, so it resets on deploy — an accepted tradeoff at
  this scale.

### Quality

- **No image optimization.** Raw files are copied to `public/`; no Astro `<Image>`, no
  `srcset`, no WebP/AVIF. A 9.1 MB homepage hero MP4 and several ~1 MB images make
  mobile first-load heavy. Largest single UX win available.
- **Forms are JavaScript-only.** `novalidate` plus a `fetch` handler, no
  `action`/`method` fallback. With JS blocked, submitting does nothing visible.
- **`Get Involved` appears twice in the menu** — once under *Join In!*, once top-level
  (`src/config/navigation.ts`). *Confirmed present; may be intentional.*
- **Message content is empty.** All 40 message entries have empty bodies, none carries a
  `speaker`, 7 are `draft: true`, and `series/no-fear-in-love.md` has no
  `featuredImage`. *Unverified.*

### Post-launch

- **Messages have no pages of their own.** They render only as Watch/Listen rows inside
  `series/[slug]`. No `/messages/` index, no per-message page, so no sermon-title search
  surface and no transcript display — despite the transcripts in `data/transcripts/`.
- **Spanish localization** — awaiting stakeholder sign-off.

### Resolved since the audit

`robots.txt` sitemap host (fixed in `9dc1aff`); the catch-all route that returned 302
instead of 404 (removed in the flatten); the system body typeface (the redesign sets
Switzer); navigation hard-coded in `Layout.astro` (now `src/config/navigation.ts`);
missing form and analytics env vars in `render.yaml`.

---

## Also noted

`src/lib/sermon-chatbot/corpus.ts` imports the default OpenAI export, which the
production bundle reports as unused. Not investigated.
