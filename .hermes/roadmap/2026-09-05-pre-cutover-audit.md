# Pre-Cutover Audit — 2026-09-05

> Re-audit of `thetable2026` against actual repo state, performed on a fresh clone
> at `C:\github\thetable2026` (Windows). Supersedes the state claims in
> `2026-05-11-table-website-roadmap.md`, which was last audited 2026-05-20.
> Planning artifact. No implementation performed.

---

## 1. Machine / environment reality

| Claim in existing docs | Reality on this machine |
|---|---|
| Build from `/Users/gary/Dev/table-cms-vault/site` (AGENTS.md) | Repo is `C:\github\thetable2026`; build root is `site/` |
| — | `site/node_modules` absent on fresh clone; `npm ci` required |
| — | A stray `node_modules/` (233 packages, includes astro) sits at repo root with **no root `package.json`**. Untracked leftover; unused by any build script |
| Build passes | **Confirmed.** `npm ci && npm run build` exits 0. Astro 6.1.8, node adapter, server output |
| — | Repo is cold: last commit `f8a9ac5`, 2026-05-20. ~3.5 months of no activity while two GitHub Actions crons kept firing |

**Runtime smoke test** (SSR build, `node dist/server/entry.mjs`): all 19 menu-reachable
routes return 200 — `/`, `/new-here/`, `/our-story/`, `/our-vision/`, `/leadership/`,
`/series/`, `/series/the-good-book/`, `/meetups/`, `/kids-youth/`, `/community-meal/`,
`/get-involved/`, `/merch/`, `/service-times-locations/`, `/contact-us/`,
`/sign-up-for-our-newsletter/`, `/privacy-policy/`, `/what-sundays-are-like/`,
`/plan-your-visit/`, `/ask/`. An unknown route returns 302, not 404 (see D2).

---

## 2. What is genuinely done

- Astro 6 SSR site on the Vault CMS content model: `pages` (13), `series` (7), `messages` (40), `site` (1), `attachments`.
- Media is project-owned. Zero WordPress or external image URLs remain in content; 35 files / 20 MB under `src/content/attachments`, copied to `public/attachments` at build and also served by a path-traversal-guarded SSR route (`src/pages/attachments/[...path].ts`).
- SEO foundation: canonical URLs, OG/Twitter tags, church JSON-LD, sitemap integration, `noindex` support (used on `/ask/`).
- Analytics hook: `PUBLIC_GTM_ID` preferred, `PUBLIC_GA4_ID` fallback, both optional.
- Canonical-host redirect is in code: `src/middleware.ts` 301s `thetabletx.com`, `www.thetabletx.com`, `www.thetabletx.org` to `thetabletx.org`.
- Forms: native contact and newsletter endpoints with honeypot, validation, in-memory IP rate limiting, Resend delivery.
- Ask page and retrieval pipeline work locally. 333 transcripts are committed under `scripts/transcripts/content`; lexical retrieval returns sane hits with no API key set.
- Design token system exists (brand palette, radii, shadows) in `Layout.astro`.
- Automation code landed: RSS discovery, matching, draft writer, dry-run gates, GitHub Actions scheduler.

---

## 3. Defects found (code is wrong, not merely incomplete)

**D1 — robots.txt points at the wrong domain.**
`site/public/robots.txt:4` advertises `https://thetabletx.com/sitemap-index.xml`, but
canonical is `thetabletx.org` and middleware 301s `.com` away. Sitemap discovery
redirects on every crawl.

**D2 — Missing pages never return 404.**
`site/src/pages/[...slug].astro:23` and `site/src/pages/series/[slug].astro:23` call
`Astro.redirect('/404', 302)`. Crawlers see 302 then 200. Every dead legacy WordPress
URL will look like a live page at cutover. Should return a real 404 status.

**D3 — Trailing-slash normalization is client-side only.**
No `trailingSlash` setting in `astro.config.mjs`; `404.astro` corrects it with a JS
`location.replace`. Non-JS clients and crawlers get the 404 body instead.

**D4 — Production env vars are not declared for the forms.**
`render.yaml` declares only `ASK_LLM_*` and `OPENAI_API_KEY`. `RESEND_API_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and `PUBLIC_GTM_ID`/`PUBLIC_GA4_ID` are
absent. As deployed, both forms return HTTP 500 "Form is not configured" and analytics
never load.

**D5 — Duplicate nav entry.**
`Get Involved` appears twice in `navItems` in `Layout.astro`: once under *Join In!*,
once as a top-level item.

---

## 4. Functionality gaps blocking cutover

**F1 — No legacy URL redirect map.** Nothing translates old WordPress permalinks
(dated sermon URLs, `/?p=`, category and tag archives, `/wp-content/uploads/*`) to new
routes. Combined with D2, inbound links and existing search rankings drop at cutover.

**F2 — Sender address is a Resend test address.** *(Revised 2026-09-05 after owner
clarification: emailing staff on submit is the intended and complete behavior for both
forms — no list provider is wanted or missing. Anti-spam is in place: honeypot field
rendered on both forms, server-side validation, length caps, HTML escaping, per-IP rate
limiting. The remaining issues are delivery configuration, not design.)*

`CONTACT_FROM_EMAIL` defaults to `onboarding@resend.dev`, Resend's shared test sender.
Production needs a verified sending domain (e.g. `website@thetabletx.org`) with SPF and
DKIM records added alongside the existing Google Workspace records. Until then, mail is
either undeliverable or lands in spam. Sequence this with the DNS work in F6.

**F2a — Rate limiter may key every visitor to one bucket behind Render's proxy.**
`checkRateLimit` prefers `clientAddress` and only falls back to `cf-connecting-ip` /
`x-real-ip`. If the node adapter reports Render's internal proxy IP rather than the real
client, all visitors share a bucket and the third submission site-wide gets a 429. Needs
verification against the deployed instance; if confirmed, prefer `x-forwarded-for`.

**F2b — Rate-limit state is in-memory.** Resets on every deploy or restart, and does not
hold if Render ever runs more than one instance. Acceptable at this site's scale — noted
so it is a known tradeoff rather than a surprise.

**F2c — Both forms are JavaScript-only.** `novalidate` plus a `fetch` handler, no
`action`/`method` fallback. With JS blocked or broken, submitting does nothing visible.

**F3 — Ask page has no production inference backend.** `ASK_LLM_BASE_URL` defaults to
`http://127.0.0.1:8080/v1` (local llama.cpp). Render has no such server and no hosted
endpoint is chosen. Live `/ask/` will fail or degrade to raw retrieval output.

**F4 — Messages have no pages of their own.** The 40 message entries render only as
Watch/Listen link rows inside `series/[slug]`. There is no `/messages/` index and no
per-message page, so there is no sermon-title search surface, no embedded player and no
transcript display — despite 333 transcripts sitting in the repo.

**F5 — Automation pilot is stale and inert.** `automation.config.json` still carries
`writeContentFiles: false`, a `sourceUrl` marked `TODO`, and a pilot window of
2025-09-14 to 2025-10-05. The Sunday and daily crons have been running against that
frozen scope since May 2026.

**F6 — DNS cutover unexecuted.** The code side (middleware, canonical `site:` value) is
ready; the external GoDaddy/Render steps in `2026-05-16-domain-cutover-plan.md` are not
confirmed done, and that plan's DNS observations are roughly four months old.

---

## 5. Design gaps

**G1 — No image optimization at all.** Raw files are copied to `public/`; no Astro
`<Image>`, no responsive `srcset`, no WebP/AVIF. Worst offenders: a 9.1 MB homepage hero
MP4, a 1.3 MB leadership headshot, a 1.2 MB homepage JPEG, and several ~0.7 MB PNGs that
are re-encoded JPEGs (`TheTable-0044-scaled.jpg-1.png`). Mobile first-load is heavy.

**G2 — Body typeface is a system font.** `Lora` is loaded from Google Fonts for
headings; body copy is `'Trebuchet MS', 'Segoe UI', sans-serif`, which is absent on
Android and most Linux. Typography differs per platform.

**G3 — Desktop dropdowns use `<details>`/`<summary>`.** Click-only, no hover intent, no
Escape-to-close, and `open={hasActiveChild(item)}` leaves a submenu permanently expanded
on its own section's pages. Behaves unlike the WordPress menu.

**G4 — Footer is thin.** Location, service time, social, copyright, privacy only. No
giving CTA, no newsletter capture, no nav column.

**G5 — Navigation is hard-coded in `Layout.astro`.** AGENTS.md forbids hardcoding
content that should be editable, yet staff cannot change the menu through Obsidian.
Same for the site tagline and the fallback address.

---

## 6. Content gaps

- **All 40 messages have empty bodies.** 33 have zero body lines; 7 have a single HTML
  comment placeholder. Nothing renders even once F4 is built.
- **Zero messages carry a `speaker` field**, though the schema and series template both
  surface it.
- **7 of 40 messages are `draft: true`.** The published-message-must-link-a-series guard
  in `content.config.ts` keeps them invisible until a human finishes them.
- **`series/no-fear-in-love.md` has no `featuredImage`** — the only series without a cover.

---

## 7. Suggested ordering (proposal, not approved work)

**Tier 1 — cutover blockers**
1. D4 Render env vars, then verify both forms end-to-end on Render.
2. D2 + D3 + F1: real 404 status, server-side trailing slash, legacy redirect map.
3. D1 robots sitemap host.
4. F6 DNS re-verification against current live records.
5. F3 decide the Ask backend — hosted endpoint, or ship `/ask/` disabled.

Tier 1 also covers F2 (verified sending domain, done with the DNS work) and F2a
(confirm the real client IP reaches the rate limiter on Render).

**Tier 2 — credibility before launch**
6. G1 image and video pipeline (largest single UX win).
7. Content: message bodies and speakers, `no-fear-in-love` cover.
8. D5 duplicate nav item.
9. F2c no-JS form fallback.

**Tier 3 — post-launch**
10. F4 message pages and transcript surface.
11. G2–G5 design and editability polish.
12. F5 re-scope or pause the automation crons.
13. Spanish localization (still awaiting stakeholder sign-off).

---

## 8. Doc corrections needed

- `AGENTS.md` build path points at a Mac directory that does not exist here.
- `AGENTS.md` cites `_bmad-output/astro-parity-progress-log.md` as the parity state
  file. **That path does not exist in the repo.** Parity state is currently unrecorded.
- `2026-05-11-table-website-roadmap.md` "current state" section is 3.5 months stale and
  should point at this audit.
