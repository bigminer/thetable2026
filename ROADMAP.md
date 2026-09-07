# Roadmap

Planned work and known gaps. One file, kept short.

This replaces the `.hermes/` planning archive, removed because its plans were spent
and its state claims predated the flatten refactor (`f21644b`) and the redesign
(`43f10a8`). The originals remain in git history at commit `9dc1aff`.

---

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

2. **Correct the transcript-ingestion PR instructions.**
   `.github/workflows/ingest-transcripts.yml` asks reviewers for `sermon_start_seconds`
   and `sermon_end_seconds`; the generator and corpus reader use `content_start` and
   `content_end` in `hh:mm:ss`. Check every instruction against the scripts before
   editing.

3. **Reassess smoke coverage.**
   `scripts/verify-site.mjs` passes 26 checks and now covers `/giving/`. It samples one
   series-detail route and asserts HTTP and HTML behavior, not layout. Propose only
   coverage that would catch a real regression.

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
- **Mail needs a verified sending domain.** Delivery now goes through Google Workspace
  SMTP rather than Resend, so re-verify: production needs a verified sender (e.g.
  `website@thetabletx.org`) with SPF and DKIM alongside the existing Workspace records.
  *Unverified — the audit predates the SMTP switch.*
- **Media ingestion is unfinished feature work.** The transcript pipeline that feeds
  `/ask` runs weekly and works. The pipeline that writes sermon entries to the site is
  fenced shut in four deliberate places and scoped to a pilot window that closed in
  October 2025. Wanted, not urgent. Written up in
  [`docs/media-ingestion-remaining-work.md`](docs/media-ingestion-remaining-work.md).
- **`/ask` is unfinished feature work.** Retrieval and citations work; there is no LLM
  behind composition in production, so answers degrade to a list of source matches. It
  is deliberately hidden (`noindex` plus no nav entry) until finished. Needs a
  composition backend and a precomputed embedding cache. Written up in
  [`docs/ask-remaining-work.md`](docs/ask-remaining-work.md).
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
