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

2. **Correct the transcript-ingestion PR instructions.**
   `.github/workflows/ingest-transcripts.yml` asks reviewers for `sermon_start_seconds`
   and `sermon_end_seconds`; the generator and corpus reader use `content_start` and
   `content_end` in `hh:mm:ss`. Check every instruction against the scripts before
   editing.

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
