# The Table Website Roadmap

> Generated 2026-05-11 from existing plans, repo state, and AGENTS.md context.
> Audited and updated 2026-05-15 against current repo code and `table-website` kanban state.
> Planning artifact — update when code/board reality changes.

---

## Executive Summary

The Table Astro site is post-launch parity and entering growth mode. The early hardening pass has largely landed: SEO foundations, analytics hooks, form protection, demo workflow, and Ask response tuning are now in place. The remaining near-term priority is to finish the next layer of operational work: weekly YouTube/podcast ingestion beyond the config skeleton, local LLM hardening/verification, real newsletter-provider integration, and final production/deployment decisions that go beyond the demo path. WhatsApp and multilingual remain later-phase and should not block the core site.

**Current state at a glance:**
- Site: Astro + Vault CMS, content collections for pages/series/messages/site
- Repo: `git@github.com:bigminer/thetable2026`
- Dev server: `npm run dev:tailscale` (Tailscale IP bound)
- Existing plans: YouTube/podcast automation, SEO/Google Ads
- Build passes; homepage + nav + core pages exist
- Ask page exists at `src/pages/ask.astro` with API at `src/pages/api/ask.ts`; response tuning work is done
- SEO foundation exists: canonical URLs, OG/Twitter metadata, `noindex` support, organization JSON-LD, sitemap integration, and `robots.txt`
- Analytics hooks exist: GTM preferred, direct GA4 fallback when GTM is unset
- Contact and newsletter forms use a lightweight free anti-spam stack (honeypot + validation + in-memory IP rate limiting)
- Weekly media ingestion config skeleton and dry-run script exist, but real source URLs and parser/discovery follow-up work remain
- Demo branch workflow is documented; GitHub Pages demo and Render production config both exist in-repo

---

## Epics

| Epic | Status | Priority | Notes |
|------|--------|----------|-------|
| E1. Foundation & Discoverability | Mostly done | P0 | SEO/analytics foundation is in code; Search Console + Ads work remains |
| E2. Content Automation | In progress | P1 | Config skeleton landed; parser/discovery/writer still open |
| E3. Ask Page / Local LLM | Partial / blocked | P1 | Ask tuning done; local endpoint hardening still blocked |
| E4. Forms & Bot Protection | Partial | P1 | Contact + newsletter intake forms exist; real newsletter provider integration remains |
| E5. Editorial Workflow | Partial | P2 | Vault CMS aligned; needs final polish |
| E6. Dev / Demo / Hosting | Partial | P1 | Demo workflow and hosting-path clarification landed; production cutover remains |
| E7. Social & Messaging Integrations | Not started | P2 | WhatsApp channels |
| E8. Multilingual | Triage | P3 | Spanish likely first |

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
- Status: done in code (`Layout.astro`, `astro.config.mjs`, `public/robots.txt`)

**E1-C2: Google Analytics 4 + Tag Manager**
- Add optional GTM/GA config hook via env/site config
- Do not break local dev when unset
- Do not hardcode secrets
- Acceptance: `npm run build` passes with and without IDs set; tracking loads on preview when configured
- Assignee: mac-code or web-worker
- Status: done in code (`PUBLIC_GTM_ID` preferred, `PUBLIC_GA4_ID` fallback)

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

**E2-C1: Automation config skeleton for weekly YouTube + podcast ingestion**
- Create `site/scripts/automation.config.json` with TODO source URLs for The Table's weekly videos and podcasts
- Set `messages.defaultDraft: true`
- Acceptance: config parses; `npm run automation:dry-run` prints config summary
- Assignee: mac-code
- Status: done in code (`site/scripts/automation.config.json`, `site/scripts/automation-dry-run.ts`)

**E2-C2: Weekly podcast RSS parsing**
- Add `fast-xml-parser` dependency
- Implement minimal feed reader in `site/scripts/ingest-new-media.ts`
- Acceptance: given a feed URL, script prints latest 5 items with title/date/link/guid
- Assignee: mac-code

**E2-C3: Weekly YouTube discovery wrapper**
- Use `yt-dlp --dump-json --flat-playlist` for discovery
- Normalize youtubeId, title, uploadDate, sourceUrl
- Ignore configured exclude patterns
- Acceptance: dry run prints recent items without writing files
- Assignee: mac-code
- Status: done in code (`site/scripts/youtube-discovery.ts`, `site/scripts/automation.config.json`, `site/package.json`)

**E2-C4: Message matching and file writing**
- Match YouTube + podcast by date/title
- Generate stable slug (date + cleaned title)
- Check existing `src/content/messages/*.md` for duplicates
- Write `draft: true` files; never overwrite hand-edited content
- Acceptance: `npm run build` passes after ingestion; running twice produces no duplicates
- Assignee: mac-code

**E2-C5: Scheduled runner**
- GitHub Actions scheduled workflow to run ingestion
- Sundays post-service + daily catch-up
- Acceptance: scheduled run completes; reports no-op cleanly when nothing is new
- Assignee: bob or devops
- Status: done in code (`.github/workflows/weekly-media-ingestion.yml`, `SCHEDULER.md`)

### E3. Ask Page / Local LLM

**E3-C1: Tune Ask page responses**
- Reduce or remove repetitive "Brett said" framing
- Inject website content context so answers reference current pages/series/vision
- Acceptance: sample queries feel like site-aware answers, not transcript recitations
- Assignee: mac-code or content-worker
- Status: done in code; composition prompt now uses website context and softer church-aware answer framing

**E3-C2: Local LLM integration hardening**
- Ensure Ask API uses local OpenAI-compatible endpoint with safe env defaults
- Add graceful fallback if local LLM is down
- Acceptance: Ask endpoint returns 200 with context-aware answer when LLM is up; returns friendly fallback when down
- Assignee: mac-code
- Status: still active/blocked — config and fallback assumptions are documented, but this remains the open hardening/verification card

### E4. Forms & Bot Protection

**E4-C1: Contact us form with bot protection**
- Add honeypot field
- Keep the current lightweight free stack unless real abuse proves it insufficient; only add Turnstile/reCAPTCHA if needed later
- Wire to email/notification destination
- Acceptance: form submits; bot submissions are filtered; human submissions reach destination
- Assignee: mac-code
- Status: done in code

**E4-C2: Newsletter signup with bot protection**
- Same protection strategy as contact form
- Current implementation is a protected local intake form that emails staff; it does not yet add subscribers to a real mailing list
- Split the remaining work into provider selection + true subscription integration
- Acceptance: protected signup form works; chosen provider receives real subscribers in-list
- Assignee: mac-code
- Status: partial — intake/protection work done, provider integration still open

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
- Status: done

**E6-C2: Demo branch promotion workflow**
- Keep the GitHub Pages demo on its own branch
- Non-technical contributors send content updates through the WhatsApp channel
- Approved updates are merged into the demo branch first, reviewed there, then merged from demo into main/master for production deployment
- If a change is not approved, either rework the demo branch until approved or revert the demo work and try again
- Acceptance: workflow documented with clear branch names, WhatsApp intake, review step, and approve/rework/revert loop
- Assignee: devops or bob
- Status: done/documented in repo guidance

**E6-C3: Production hosting plan**
- Define target host (current repo evidence points to Render for production, GitHub Pages for demo)
- Document build + deploy pipeline
- Acceptance: deploy pipeline documented; at least one successful production-like deploy
- Assignee: devops or bob
- Status: planning/clarification card completed; production cutover execution still remains in E6-C4

**E6-C4: SSL + domain cutover**
- Plan DNS cutover from WordPress to Astro
- Plan redirect rules for old WordPress URLs
- Canonical domain: `thetabletx.org`
- Secondary domain: `thetabletx.com` redirects to the canonical domain
- Render origin: `https://thetabletx.onrender.com/`
- Acceptance: `thetabletx.org` serves the Astro site with valid SSL; `thetabletx.com` and old URLs redirect or 404 gracefully
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
| D1 | Final canonical domain | E1-C1, E1-C3, E6-C4 | `https://thetabletx.org` |
| D2 | Hosting provider | E6-C4 | Render for production; GitHub Pages for demo appears to be the current repo path |
| D3 | YouTube channel/playlist URL for ingestion | E2-C1, E2-C3 | Unknown — need source |
| D4 | Podcast RSS feed URL | E2-C1, E2-C2 | Unknown — need source |
| D5 | Default series for auto-messages | E2-C4 | `null` / require review |
| D6 | Bot protection provider | none for current intake forms | Current implemented stack is honeypot + validation + in-memory IP rate limiting; Turnstile remains optional later |
| D7 | Newsletter provider | E4-C2 | Unknown — Buttondown, Beehiiv, Mailchimp, ConvertKit, etc. |
| D8 | GTM vs direct GA4/Ads tags | E1-C4 | Resolved in code: prefer GTM, allow direct GA4 fallback |
| D9 | Monthly ad budget + radius | E1-C4 | Unknown — likely small, local |
| D10 | Primary editorial workflow | E5-C3 | Vault CMS + Obsidian |
| D11 | WhatsApp Business API access | E7-C1 | Needs Meta developer account |
| D12 | Multilingual first locale | E8-C1 | Spanish (`es`) |

---

## Recommended Next 3 Cards to Execute

1. **E3-C2: Local LLM integration hardening**
   - Ask response tuning is done, so the main remaining Ask risk is endpoint hardening and live verification.
   - This is already on the board as the main blocked card and should either be unblocked or re-scoped.

2. **E2-C2 + E2-C3: Podcast RSS parser + YouTube discovery wrapper**
   - The config skeleton already exists, so the next useful automation step is real source ingestion.
   - These depend on D3 and D4 (source URLs), but implementation can proceed with dry-run-safe behavior.

3. **Newsletter provider selection + real subscription flow**
   - The intake form and protection exist now; the remaining gap is choosing and wiring the actual mailing-list provider.
   - This is now a separate follow-up card from the completed local intake work.

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
  └── E6-C2 (Demo workflow)
        └── E6-C3 (Hosting plan)
              └── E6-C4 (Domain cutover)

E4-C1 (Contact form)
  └── E4-C2 (Newsletter intake + provider integration split)
        └── E1-C4 (conversion tracking)

E5-C1 (Vault CMS alignment) can run in parallel with everything.
E3-C2 (Local LLM hardening) depends on local LLM endpoint availability.
E7-C1 (WhatsApp) depends on Meta API access.
E8-C1 (i18n planning) is independent until E8-C2.
```

---

## Notes

- The prior attempt on this task crashed without completion. This roadmap replaces it.
- This file was audited on 2026-05-15 and now reflects current code/kanban state more closely than the original generated version.
- All file references assume working directory `/home/gary/dev/github/thetable2026/site` unless noted.
- Do not start E6-C4 (domain cutover) until E1 and E6-C1/C2/C3 are complete and the demo has been reviewed.
- Keep `draft: true` as the default for all automated content until the pipeline has been verified through several real-world cycles.
