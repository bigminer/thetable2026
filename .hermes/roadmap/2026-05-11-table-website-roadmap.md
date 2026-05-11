# The Table Website Roadmap

> Generated 2026-05-11 from existing plans, repo state, and AGENTS.md context.
> Planning only — no implementation in this task.

---

## Executive Summary

The Table Astro site is post-launch parity and entering growth mode. The immediate priority is hardening the technical foundation (SEO, analytics, bot protection) so later content and automation work ships on stable ground. Content automation and the Ask page refinements are ready to execute once a few source URLs and service decisions are locked. WhatsApp and multilingual are later-phase; they depend on simpler integrations that should not block core improvements.

**Current state at a glance:**
- Site: Astro + Vault CMS, content collections for pages/series/messages/site
- Repo: `git@github.com:bigminer/thetable2026`
- Dev server: `npm run dev:tailscale` (Tailscale IP bound)
- Existing plans: YouTube/podcast automation, SEO/Google Ads
- Build passes, homepage + nav + core pages exist
- Ask page exists at `src/pages/ask.astro` with API at `src/pages/api/ask.ts`
- No sitemap, robots.txt, GA/GTM, or form bot protection yet

---

## Epics

| Epic | Status | Priority | Notes |
|------|--------|----------|-------|
| E1. Foundation & Discoverability | Not started | P0 | SEO, analytics, sitemap, structured data |
| E2. Content Automation | Planned | P1 | YouTube + podcast ingestion pipeline |
| E3. Ask Page / Local LLM | Needs adjustment | P1 | Already built; needs context tuning |
| E4. Forms & Bot Protection | Not started | P1 | Contact + newsletter forms |
| E5. Editorial Workflow | Partial | P2 | Vault CMS aligned; needs final polish |
| E6. Dev / Demo / Hosting | In progress | P1 | GitHub Pages demo exists; needs cutover plan |
| E7. Social & Messaging Integrations | Not started | P2 | WhatsApp channels |
| E8. Multilingual | Not started | P3 | Spanish likely first |

---

## Card List

### E1. Foundation & Discoverability

**E1-C1: Technical SEO foundation**
- Add canonical URLs, Open Graph, Twitter cards to `Layout.astro`
- Add `robots.txt` and `@astrojs/sitemap`
- Add church JSON-LD structured data
- Add `noindex` guard for experimental pages
- Acceptance: every public page has canonical + OG + title + description; sitemap builds; robots.txt exists
- Assignee: mac-code or web-worker

**E1-C2: Google Analytics 4 + Tag Manager**
- Add optional GTM/GA config hook via env/site config
- Do not break local dev when unset
- Do not hardcode secrets
- Acceptance: `npm run build` passes with and without IDs set; tracking loads on preview when configured
- Assignee: mac-code or web-worker

**E1-C3: Google Search Console + landing page copy pass**
- Verify site ownership
- Submit sitemap
- Review `/new-here/`, `/what-sundays-are-like/`, `/service-times-locations/`, `/kids-youth/`, `/our-vision/` for unique titles/descriptions
- Acceptance: Search Console shows sitemap submitted; each key page has unique meta
- Assignee: content-worker or mac-code

**E1-C4: Google Ads readiness**
- Add conversion event tracking (plan visit, contact click, newsletter signup, directions click)
- Define negative keyword list
- Set up small local search campaign
- Acceptance: conversion events fire in test; campaign configured with daily budget cap and geo radius
- Assignee: ops or external

### E2. Content Automation

**E2-C1: Automation config skeleton**
- Create `site/scripts/automation.config.json` with TODO source URLs
- Set `messages.defaultDraft: true`
- Acceptance: config parses; `npm run ingest-media -- --dry-run` prints config summary
- Assignee: mac-code

**E2-C2: Podcast RSS parsing**
- Add `fast-xml-parser` dependency
- Implement minimal feed reader in `site/scripts/ingest-new-media.ts`
- Acceptance: given a feed URL, script prints latest 5 items with title/date/link/guid
- Assignee: mac-code

**E2-C3: YouTube discovery wrapper**
- Use `yt-dlp --dump-json --flat-playlist` for discovery
- Normalize youtubeId, title, uploadDate, sourceUrl
- Ignore configured exclude patterns
- Acceptance: dry run prints recent items without writing files
- Assignee: mac-code

**E2-C4: Message matching and file writing**
- Match YouTube + podcast by date/title
- Generate stable slug (date + cleaned title)
- Check existing `src/content/messages/*.md` for duplicates
- Write `draft: true` files; never overwrite hand-edited content
- Acceptance: `npm run build` passes after ingestion; running twice produces no duplicates
- Assignee: mac-code

**E2-C5: Scheduled runner**
- Hermes cron or GitHub Actions to run ingestion
- Sundays post-service + daily catch-up
- Acceptance: scheduled run completes; reports no-op cleanly when nothing is new
- Assignee: bob or devops

### E3. Ask Page / Local LLM

**E3-C1: Tune Ask page responses**
- Reduce or remove repetitive "Brett said" framing
- Inject website content context so answers reference current pages/series/vision
- Acceptance: sample queries feel like site-aware answers, not transcript recitations
- Assignee: mac-code or content-worker

**E3-C2: Local LLM integration hardening**
- Ensure Ask API uses local OpenAI-compatible endpoint with safe env defaults
- Add graceful fallback if local LLM is down
- Acceptance: Ask endpoint returns 200 with context-aware answer when LLM is up; returns friendly fallback when down
- Assignee: mac-code

### E4. Forms & Bot Protection

**E4-C1: Contact us form with bot protection**
- Add honeypot field
- Consider Cloudflare Turnstile or reCAPTCHA v3 (decision needed)
- Wire to email/notification destination
- Acceptance: form submits; bot submissions are filtered; human submissions reach destination
- Assignee: mac-code

**E4-C2: Newsletter signup with bot protection**
- Same protection strategy as contact form
- Integrate with mailing list provider (Mailchimp, Buttondown, etc. — decision needed)
- Acceptance: signup works; bots blocked; subscriber appears in list
- Assignee: mac-code

### E5. Editorial Workflow

**E5-C1: Vault CMS template alignment**
- Keep `astro-composer` data.json, `_bases/Home.base`, `_GUIDE.md`, and `editorial-workflow.md` in sync with current schema
- Acceptance: editor can create a new page/series/message from Vault CMS without manual YAML edits
- Assignee: mac-code

**E5-C2: Homepage editing path**
- Make `site/src/content/site/homepage.md` feel like a special homepage workflow, not a generic item
- Acceptance: non-technical editor can update hero text and CTAs without touching Astro code
- Assignee: mac-code

**E5-C3: Direct GitHub edit workflow (decision)**
- Decide whether staff will use Obsidian + Vault CMS, or direct GitHub Markdown editing
- Document chosen workflow
- Acceptance: one primary workflow is documented and tested with a non-technical user
- Assignee: content-worker or bob

### E6. Dev / Demo / Hosting

**E6-C1: GitHub Pages demo review**
- Review `https://bigminer.github.io/thetable2026/` for parity against local build
- Acceptance: demo renders correctly; assets load; routes resolve
- Assignee: mac-code or qa-worker

**E6-C2: Production hosting plan**
- Define target host (Cloudflare Pages, Vercel, Netlify, self-hosted — decision needed)
- Document build + deploy pipeline
- Acceptance: deploy pipeline documented; at least one successful production-like deploy
- Assignee: devops or bob

**E6-C3: SSL + domain cutover**
- Plan DNS cutover from WordPress to Astro
- Plan redirect rules for old WordPress URLs
- Acceptance: `thetabletx.com` serves Astro site with valid SSL; old URLs redirect or 404 gracefully
- Assignee: devops or bob

### E7. Social & Messaging Integrations

**E7-C1: WhatsApp channel for content management**
- Enable posting events and special announcements via WhatsApp to website
- Likely via WhatsApp Business API or webhook
- Acceptance: message sent to channel appears as event/announcement on site within minutes
- Assignee: devops or mac-code

**E7-C2: WhatsApp for Facebook/Instagram management (if possible)**
- Evaluate Meta Business Suite API for cross-posting
- Acceptance: if feasible, single WhatsApp message can trigger FB/IG post; if not, document why
- Assignee: devops or research-worker

### E8. Multilingual

**E8-C1: Spanish localization planning**
- Evaluate Astro i18n approach (`astro-i18next`, content collections per locale, or route prefixes)
- Acceptance: decision doc exists; proof-of-concept page renders in Spanish
- Assignee: mac-code

**E8-C2: Translate core pages**
- Translate `/new-here/`, `/service-times-locations/`, `/what-sundays-are-like/`, `/our-vision/`
- Acceptance: translated pages build and are reachable at `/es/...`
- Assignee: content-worker

---

## Open Decisions (Need User Input)

| # | Decision | Blocks | Current Best Guess |
|---|----------|--------|-------------------|
| D1 | Final canonical domain | E1-C1, E1-C3, E6-C3 | `https://thetabletx.com` |
| D2 | Hosting provider | E6-C2, E6-C3 | Cloudflare Pages or Vercel |
| D3 | YouTube channel/playlist URL for ingestion | E2-C1, E2-C3 | Unknown — need source |
| D4 | Podcast RSS feed URL | E2-C1, E2-C2 | Unknown — need source |
| D5 | Default series for auto-messages | E2-C4 | `null` / require review |
| D6 | Bot protection provider | E4-C1, E4-C2 | Cloudflare Turnstile (free, privacy-friendly) |
| D7 | Newsletter provider | E4-C2 | Unknown — Mailchimp, Buttondown, Substack? |
| D8 | GTM vs direct GA4/Ads tags | E1-C2 | GTM for flexibility |
| D9 | Monthly ad budget + radius | E1-C4 | Unknown — likely small, local |
| D10 | Primary editorial workflow | E5-C3 | Vault CMS + Obsidian |
| D11 | WhatsApp Business API access | E7-C1 | Needs Meta developer account |
| D12 | Multilingual first locale | E8-C1 | Spanish (`es`) |

---

## Recommended Next 3 Cards to Execute

1. **E1-C1: Technical SEO foundation**
   - This is pure web work, well-scoped, and unblocks all discoverability efforts.
   - No external decisions needed; canonical domain can default to `thetabletx.com` and be updated later.

2. **E1-C2: Google Analytics 4 + Tag Manager**
   - Pairs naturally with E1-C1; once layout accepts measurement IDs, tracking is ready.
   - Need decision D8 (GTM vs direct), but defaulting to GTM is reasonable.

3. **E2-C1 + E2-C2: Automation config + podcast RSS parser**
   - These are small, safe setup tasks that unblock the content automation pipeline.
   - Need decisions D3 and D4 (source URLs), but the config skeleton can ship with TODO placeholders.

---

## Dependencies Graph

```
E1-C1 (SEO foundation)
  ├── E1-C2 (GA/GTM)
  ├── E1-C3 (Search Console)
  └── E1-C4 (Ads)

E2-C1 (Config)
  ├── E2-C2 (RSS parser)
  ├── E2-C3 (YouTube discovery)
  └── E2-C4 (Matching + writing)
        └── E2-C5 (Scheduled runner)

E6-C1 (Demo review)
  └── E6-C2 (Hosting plan)
        └── E6-C3 (Domain cutover)

E4-C1 (Contact form)
  └── E4-C2 (Newsletter signup)
        └── E1-C4 (conversion tracking)

E5-C1 (Vault CMS alignment) can run in parallel with everything.
E3-C1 (Ask tuning) depends on local LLM endpoint availability.
E7-C1 (WhatsApp) depends on Meta API access.
E8-C1 (i18n planning) is independent until E8-C2.
```

---

## Notes

- The prior attempt on this task crashed without completion. This roadmap replaces it.
- All file references assume working directory `/home/gary/dev/github/thetable2026/site` unless noted.
- Do not start E6-C3 (domain cutover) until E1 and E6-C1/C2 are complete and the demo has been reviewed.
- Keep `draft: true` as the default for all automated content until the pipeline has been verified through several real-world cycles.
