# Astro Parity Progress Log

## Purpose

Record the current migration/parity state after the April 23, 2026 repair pass so future work can resume from a grounded BMad artifact instead of conversation memory.

This log extends:

- [_bmad-output/astro-migration-execution-plan.md](/Users/gary/Dev/table-cms-vault/_bmad-output/astro-migration-execution-plan.md)
- [_bmad-output/navigation-preservation-checklist.md](/Users/gary/Dev/table-cms-vault/_bmad-output/navigation-preservation-checklist.md)
- [_bmad-output/wordpress-to-astro-schema-mapping.md](/Users/gary/Dev/table-cms-vault/_bmad-output/wordpress-to-astro-schema-mapping.md)

## Current Position

The project is in migration execution and parity review.

The validated direction remains:

- Astro as the replacement site framework
- Markdown content collections as the primary CMS surface
- Obsidian plus Vault CMS as the editorial workflow
- local project-owned media for launch-critical assets
- WordPress as a migration source, not the long-term runtime dependency

## Completed In This Pass

### Review Findings Resolved

- Guarded remote podcast page fetches so static builds can fall back when `thetabletx.com` is unavailable.
- Fixed homepage series card links to use slug fallback behavior instead of assuming `entry.data.slug`.
- Preserved mobile menu active-trail visibility by opening the active submenu section.
- Prevented broken episode anchors when an episode URL is absent.
- Excluded the current series from podcast detail "More Series" recommendations.
- Replaced old-site episode click-throughs with local `/podcast/[slug]/` routes.
- Added local podcast detail pages generated from migrated series frontmatter.
- Removed live WordPress HTML enrichment from podcast builds; podcast pages now use Markdown/frontmatter metadata and link back to the old episode URL only as an explicit external source when no local embed exists.
- Reworked desktop navigation groups into stable interactive controls instead of fragile hover-only labels.
- Removed the desktop submenu hover gap by anchoring submenu display directly under the parent group.

### Markdown And Content Model Work

- Added a Markdown-backed leadership page at `site/src/content/pages/leadership.md`.
- Added `staffCards` frontmatter support to the `pages` collection.
- Rendered staff cards from Markdown/frontmatter instead of hardcoding the leadership roster in a route template.
- Localized leadership images into `site/public/images/pages/leadership/`.
- Replaced form-heavy page dead ends with explicit temporary action paths using the sourced church phone number and existing Church Center MeetUp forms.

### Route And Interaction Work

- Main menu now includes the live-site menu groups and targets.
- `Giving` remains an intentional external Church Center link.
- Series detail pages now route episode titles and watch buttons to local podcast pages.
- Local podcast pages render message title, date, speaker, series context, in-series links, and a clear external watch/listen action when no local embed is available.
- Mobile menu stays collapsed until selected and keeps the active section visible when opened.

### Verification Completed

- `npm run build` passed.
- Static generation produced the menu-reachable pages plus local podcast detail pages.
- Playwright confirmed `/series/the-good-book/` episode links point to local `/podcast/...` routes.
- Build verification confirmed local podcast routes render from Markdown/frontmatter without live WordPress scraping.
- Playwright confirmed the desktop `Who We Are` submenu opens and exposes expected child links.

## Parity Sweep — April 24, 2026

Full desktop sweep comparing every menu-reachable route on the local Astro build against the live WordPress site. Screenshots captured to `parity/` for reference.

### Cross-Site Patterns (affect every page)

- **Sidebar missing on all inner pages.** The live site renders a right sidebar on most content pages containing Our Vision text, Connect With Us (address + phone), Service Time, an embedded Google Map, and a "Connect With Us On Facebook" widget. The local Astro layout is full-width single-column throughout. This is the single largest structural difference.
- **Footer social links incomplete.** Live footer: Facebook, Twitter, Instagram. Local footer: Facebook, YouTube only. Twitter and Instagram are missing.
- **Hero images missing on most inner pages.** Live pages frequently have a full-bleed photo hero at the top of the page. Local pages use a simple tinted page header or (on a few pages) a split-image layout. Affected: New Here, Our Story, MeetUps, Kids & Youth, Community Meals, and the series index.
- **Page title casing / wording mismatches.** Several `<title>` tags and visible `<h1>` headings differ slightly from the live site (details per page below).

### Homepage

- Hero layout differs: live uses a full-width background image with centered text; local uses a left-text / right-image card.
- Photo mosaic section (colorful tiled community photos) present on live, absent locally.
- "WHO WE ARE" (live) vs "Five guiding values" (local) — section heading mismatch.
- Values section styling differs: live uses circular icon tiles; local uses a five-column prose grid.
- "WEEKLY COMMUNITY" (live) vs "Weekly Communion" (local) — likely a typo in the local content.
- "RECENT MESSAGES" (live) vs "Current series" (local) — section label mismatch.
- Homepage contact/reach-out form present on live, absent locally (intentional deferral).

### New Here (`/new-here/`)

- Missing full-bleed hero image.
- Page `<title>` and `<h1>` is "New Here" locally; live shows "New Here?" (with question mark).
- Missing sidebar.

### Our Story (`/our-story/`)

- Missing sidebar (includes Google Map embed on live).
- "Brett and Maggie Tilford" appears as a separate `<h2>` locally; it is inline body text on live.

### Our Vision (`/our-vision/`)

- Page title is "Our Vision" locally; live shows "Our Vision & Values".
- Local adds a hero image that the live page does not have (minor divergence in the other direction).
- Missing sidebar.

### Leadership (`/leadership/`)

- Live renders a 4-column staff grid; local renders 3 columns.
- Local adds a "Leadership Team" `<h2>` heading and an extra intro paragraph not present on live.
- Missing sidebar.
- Kaitlyn Randall photo is a different image than the one (missing/blank) on live — local is an improvement but differs.

### Service Times & Locations (`/service-times-locations/`)

- Live page title is "Service Time & Location" (singular); local is "Service Times & Locations" (plural).
- Sidebar on live includes a Google Maps embed and phone number; local sidebar shows address and a plain "Follow us on Facebook" link — no map, no phone.

### MeetUps (`/meetups/`)

- Missing full-bleed hero image.
- Missing sidebar.
- Section sub-headings ("Home Groups", "Affinity Groups", "Sprint Groups") are italic body text on live; local renders them as `<h2>`/`<h3>` headings — different visual weight.
- "How can I pitch in to help get Table MeetUps off the ground?" (live) vs "How Can I Pitch In?" (local) — heading text shortened.

### Kids & Youth (`/kids-youth/`)

- Live hero: full-bleed outdoor photo of kids playing. Local: right-side split image (different stock photo of a child).
- Missing sidebar.
- "The Kid's Table" (live, with apostrophe) vs "The Kids Table" (local, no apostrophe).

### Community Meals (`/community-meal/`)

- Missing full-bleed hero image.
- Missing sidebar.
- Sign-up action uses a temporary phone number path locally (intentional).

### Get Involved (`/get-involved/`)

- Live has a full contact/interest form (First Name, Last Name, Email, Phone, Message, reCAPTCHA). Local shows a temporary phone number path (intentional deferral).
- Missing sidebar.

### Newsletter (`/sign-up-for-our-newsletter/`)

- Live has a newsletter signup form. Local shows a temporary phone number path (intentional deferral).

### Contact Us (`/contact-us/`)

- Live has a full contact form. Local shows a temporary phone number path (intentional deferral).

### Series Index (`/series/`)

- Live shows 20+ historical series. Local shows only the 6 migrated series (expected scope limit for now).
- Live has podcast platform subscribe buttons (Spotify, Anchor FM, iTunes, Google Podcasts) at the bottom of the page. Local has none.

### Series Detail (e.g. `/series/lent-2025/`)

- Live uses a full-bleed slideshow hero. Local uses a half-width image + title card side by side.
- Live sidebar has podcast subscribe buttons (Spotify, Anchor FM, iTunes, Google). Local has none.
- Episode list layout and styling differ but data is equivalent.

### Podcast Detail (e.g. `/podcast/palm-sunday-christ-is-borne/`)

- Live shows an embedded Spotify player widget (interactive, plays in-page). Local shows a "Listen on Spotify" button link. YouTube is embedded in both.
- Local layout is richer (More Series shown as image cards with descriptions). Live shows them as a plain row of images.

## Completed In April 24 Pass (Session 2)

### Vault CMS Content Management Constraint Applied

All changes from this session conform to the Vault CMS pattern: editable content lives in markdown frontmatter, not hardcoded in templates. A non-technical editor manages content through Obsidian.

- `homepage.md` (the `site` collection) is the single source of truth for cross-page config: address, service time, map URL, social links, and now podcast subscribe links.
- Inner pages use a flat `showSidebar: true` boolean — the sidebar renders its content by reading `homepage.md` at build time.

### Completed Items

- **Sidebar added to all inner pages.** Replaced the previous per-page `sidebar:` object (duplicated data) with a flat `showSidebar: true` boolean on 11 pages. Template reads address, service time, Google Maps embed, and Facebook link from `homepage.md`. Our Vision card renders from a static vision statement. No duplication — one edit to `homepage.md` updates all pages.
- **Twitter and Instagram added to footer.** Verified URLs against the live site: Twitter is `@bretttilford` (Brett's personal account — confirm if a church-specific handle is preferred), Instagram is `@tablechurchtx`. Both in `homepage.md` `socialLinks`.
- **Hero images localized for New Here, MeetUps, and Community Meals.** Images downloaded from WordPress, resized to max 2400px, stored in `public/attachments/pages/`. Wired via `heroImage` frontmatter on each page. Our Story has no hero on the live site — skipped.
- **Page title fixes.** "New Here?" (question mark), "Our Vision & Values", "Service Time & Location" — all updated in page frontmatter.
- **"The Kid's Table" apostrophe fixed** throughout `kids-youth.md` (lede, heading, body text).
- **Podcast subscribe buttons** added to series index and series detail pages. Four platforms: Spotify, Apple Podcasts, Anchor FM, Google Podcasts. URLs live in `homepage.md` under `podcastLinks` — same `{label, url}` structure as `socialLinks`.

### Still Deferred From This Session

- **"Weekly Communion" vs "WEEKLY COMMUNITY"** — the body text of that section is specifically about communion, so "Weekly Communion" may be intentional. Needs owner decision before changing.

## Current Known Open Work

### High Priority — From Parity Sweep

- **Homepage hero layout.** Local hero card layout diverges significantly from live's full-width background-image style. Evaluate whether to match the live style or accept as intentional redesign.
- **Homepage photo mosaic.** The tiled community photo section after the hero is missing locally. Decide whether to reproduce it or document as a deliberate omission.
- **Homepage section labels.** "WHO WE ARE" and "RECENT MESSAGES" labels from live differ from local equivalents. Align or document the differences.

### Medium Priority — From Parity Sweep

- **Leadership grid columns.** Live uses 4 columns; local uses 3. Evaluate which is better for the content at current count (9 staff).
- **"Brett and Maggie Tilford" heading on Our Story.** Decide if the local `<h2>` heading is an improvement or should match live's inline styling.
- **"Leadership Team" heading.** Extra heading on local not present on live. Remove if not needed.
- **MeetUps section headings.** Live uses italic body text for group type labels; local uses `<h3>`. One approach is better for screen readers but differs visually from live.
- **"How Can I Pitch In?" heading on MeetUps.** Restore the fuller heading text if desired.
- **Spotify embed on podcast detail.** Live shows an interactive embedded player. Local shows a button link. Decide if embedding is desired.
- **Kids & Youth hero image.** Local uses a different (stock) photo from live. Source and localize the original church kids photo if preferred.
- **Series index: historical series.** Only 6 of 20+ live series are migrated. Decide scope of historical series migration before launch.
- **Homepage contact form.** Live homepage has a "REACH OUT TO US" contact form section. Currently absent locally (intentional deferral, but visible gap).
- Decide whether leadership should remain as `pages.staffCards` or graduate to a dedicated `staff` collection before launch.

### Intentional Temporary Paths (document, do not fix)

- Contact Us form → phone number until form replacement is chosen.
- Newsletter signup form → phone number until service is chosen.
- Get Involved interest form → phone number + MeetUp Church Center link.
- Community Meals sign-up → phone number.
- Giving → intentional external Church Center link.
- YouTube embeds → intentional; not converting to local media.
- Church Center MeetUp interest forms → intentional external links.

### Deferred By Prior Decision

- Contact form replacement.
- Newsletter form replacement.
- Events integration.
- Launch hosting, DNS, SSL, redirects, and rollback planning.

## Recommended Next BMad Moves

### Optional Quality Passes

1. `[ECH]` **Edge Case Hunter Review**
   - Skill: `bmad-review-edge-case-hunter`
   - Recommended target: current Astro route layer and content collections
   - Suggested files:
     - `site/src/layouts/Layout.astro`
     - `site/src/pages/[...slug].astro`
     - `site/src/pages/series/[slug].astro`
     - `site/src/pages/podcast/[slug].astro`
     - `site/src/lib/podcast.ts`
     - `site/src/content/**/*.md`
   - Why: catches remaining route, optional-field, build-time fetch, and content-shape edge cases.

2. `[AR]` **Adversarial Review**
   - Skill: `bmad-review-adversarial-general`
   - Recommended target: the migrated site against the BMad parity docs
   - Suggested inputs:
     - `_bmad-output/live-site-menu-inventory.md`
     - `_bmad-output/navigation-preservation-checklist.md`
     - `_bmad-output/style-preservation-checklist.md`
     - Playwright screenshots from local and live pages
   - Why: strongest next pass for "what still feels off from the original site?"

### Next Required Migration Work

Desktop parity sweep completed April 24, 2026. High-priority structural items resolved April 24, 2026. Mobile sweep not yet done.

Recommended next order:

1. Decide homepage hero layout (match live full-bleed style vs accept current card layout as intentional redesign).
2. Decide homepage photo mosaic (reproduce or document as deliberate omission).
3. Work through medium-priority items below.
4. Run mobile parity sweep.

## Resume Note

If resuming in a fresh context, start by reading this file plus:

- `_bmad-output/astro-migration-execution-plan.md`
- `_bmad-output/live-site-menu-inventory.md`
- `_bmad-output/navigation-preservation-checklist.md`
- `_bmad-output/style-preservation-checklist.md`
- `_bmad-output/wordpress-to-astro-schema-mapping.md`

Then run:

```bash
cd /Users/gary/Dev/table-cms-vault/site
npm run build
```
