# Astro Parity Remediation Plan

## Purpose

Turn the adversarial parity findings into a practical repair plan for moving the Astro + Vault CMS migration closer to launch readiness.

This plan continues the direction established in:

- [_bmad-output/astro-parity-progress-log.md](/Users/gary/Dev/table-cms-vault/_bmad-output/astro-parity-progress-log.md)
- [_bmad-output/navigation-preservation-checklist.md](/Users/gary/Dev/table-cms-vault/_bmad-output/navigation-preservation-checklist.md)
- [_bmad-output/style-preservation-checklist.md](/Users/gary/Dev/table-cms-vault/_bmad-output/style-preservation-checklist.md)
- [_bmad-output/wordpress-to-astro-schema-mapping.md](/Users/gary/Dev/table-cms-vault/_bmad-output/wordpress-to-astro-schema-mapping.md)

## Current Position

The project is in migration execution and parity repair.

The Astro content model and route foundation are viable, but the current site is not yet a faithful public replacement for `thetabletx.com`. The main gaps are shared shell parity, homepage parity, launch-visible form stubs, service/sidebar parity, series archive completeness, podcast source-of-record risk, and editor template drift.

## Operating Principle

Fix public parity and editor safety together.

Every remediation pass should answer both questions:

1. Does this page now behave more like the live WordPress site?
2. Can real staff still understand and maintain the source content in Obsidian + Vault CMS?

Avoid broad schema expansion unless a specific live-site behavior cannot be represented comfortably with the current model.

## Phase 1: Shared Site Shell Parity

### Goal

Restore the site-wide identity and repeated page behaviors that shape the public experience.

### Work

1. Add a real footer to `site/src/layouts/Layout.astro`.
   - Include location, service time, social links, copyright, privacy link behavior, and tagline.
   - Keep footer content editable if it is likely to change, preferably through `site/src/content/site/homepage.md` or a small `site` singleton pattern rather than hardcoded strings.

2. Review header brand parity.
   - Decide whether to use the live logo asset or a localized replacement.
   - Preserve live-site brand intent: `The Table Church`, not just generic text.

3. Fix page eyebrow labeling.
   - Replace the hardcoded `Who We Are` label in `site/src/pages/[...slug].astro`.
   - Prefer a simple optional `sectionLabel` or derive from known nav grouping if that remains editor-friendly.
   - If adding `sectionLabel`, update all Vault CMS/editor surfaces listed in `AGENTS.md`.

4. Remove visitor-facing migration metadata.
   - Replace fallback meta description `Markdown-managed Astro migration for The Table Church` with public-safe copy.

### Acceptance Checks

- Footer appears on every menu-reachable page.
- Header brand is recognizably The Table Church.
- `/new-here/`, `/service-times-locations/`, `/contact-us/`, and `/series/` do not show misleading `Who We Are` context.
- `npm run build` passes.
- Desktop and mobile screenshots show no obvious header/footer layout breakage.

## Phase 2: Homepage Parity Repair

### Goal

Bring the homepage back toward the live site's public experience instead of letting it become a generic Astro landing page.

### Work

1. Restore the welcome video as an inline playable embed.
   - Keep the YouTube dependency documented as intentional.
   - Avoid making editors paste iframe HTML into Markdown.

2. Restore the contact/map section behavior.
   - Add map support through structured frontmatter if the homepage remains the right source.
   - Decide whether the homepage contact form is deferred, replaced by a temporary email link, or intentionally omitted for launch.

3. Match homepage section order and visual rhythm against live screenshots.
   - Hero
   - Welcome/video
   - Values
   - Feature rows
   - Get involved/gallery
   - Recent messages
   - Reach out/contact
   - Vision/footer transition if still present on live site

4. Recheck homepage copy against the live page.
   - Fix any invented, compressed, or stale copy that changes the church's public message.

### Acceptance Checks

- Live and local homepage screenshots are recognizably the same site.
- Welcome video can play inline.
- Contact area has a deliberate launch behavior.
- No placeholder migration copy is visible.
- Homepage content remains understandable in `site/src/content/site/homepage.md`.

## Phase 3: Route Content And Sidebar Parity

### Goal

Make each menu-reachable page launch-acceptable, not merely route-valid.

### Work

1. Repair `/service-times-locations/`.
   - Restore the live sidebar intent: Our Vision, Connect With Us, map, and Facebook panel if still desired.
   - Use existing `pages.sidebar` fields where possible before adding schema.

2. Review all ordinary pages against live content.
   - `/new-here/`
   - `/our-story/`
   - `/our-vision/`
   - `/leadership/`
   - `/meetups/`
   - `/kids-youth/`
   - `/community-meal/`
   - `/get-involved/`
   - `/contact-us/`
   - `/sign-up-for-our-newsletter/`

3. Replace launch-visible form stubs with explicit decisions.
   - Contact page: provide a working external contact path, mail link, or clearly approved temporary behavior.
   - Newsletter page: provide a working external signup path or intentionally deferred state approved for launch.
   - Get Involved page: provide a working Church Center or equivalent next-step path if available.

4. Document intentional external flows.
   - Giving / Church Center
   - MeetUps forms
   - YouTube
   - Facebook and other social links
   - Any temporary contact/newsletter/get-involved flow

### Acceptance Checks

- Every live menu route has content that a visitor can act on.
- Form-related pages do not dead-end with "check back soon" copy unless that is explicitly accepted as launch behavior.
- External links are intentional and documented.
- `npm run build` passes after each route group.

## Phase 4: Series And Podcast Source Of Record

### Goal

Stop treating live WordPress pages as an invisible runtime/build dependency, and make series behavior predictable.

### Work

1. Decide the podcast source of record.
   - Option A: Markdown/frontmatter owns launch-visible podcast metadata.
   - Option B: a confirmed podcast feed or API owns metadata.
   - Option C: live WordPress enrichment remains temporary and documented as a pre-launch dependency only.

2. If keeping Markdown ownership, expand `series` entries.
   - Add speaker metadata.
   - Add subscription links.
   - Add reliable date fields or normalized date labels.
   - Add embed URLs when needed so builds do not scrape live HTML.

3. Fix series ordering.
   - Homepage recent messages should follow live-site order or a clear date-based rule.
   - `/series/` should sort by recency, not filename/id.

4. Decide archive scope.
   - Current local series set is only a recent subset.
   - Either migrate the live archive scope needed for launch or document that only recent/current series are launch scope.

5. Remove or quarantine build-time live-page scraping.
   - `site/src/lib/podcast.ts` should not silently depend on brittle WordPress HTML for launch-critical pages.

### Acceptance Checks

- Local `/series/` order matches the chosen rule.
- Homepage recent series order matches the chosen rule.
- Podcast pages build correctly without requiring WordPress page HTML, unless that dependency is explicitly accepted as temporary.
- The chosen source of record is documented.

## Phase 5: Vault CMS And Editor Workflow Repair

### Goal

Keep the editing workflow aligned with the repaired content model so the site does not drift into developer-only Astro.

### Work

1. Fix editor templates that create blank YAML fields.
   - Avoid blank optional fields that parse as `null`.
   - Prefer omitted optional fields or valid starter values.

2. Sync all content-model-facing surfaces after any schema changes.
   - `site/src/content.config.ts`
   - `site/src/content/.obsidian/plugins/astro-composer/data.json`
   - `site/src/content/_bases/Home.base`
   - `site/src/content/_GUIDE.md`
   - `site/docs/editorial-workflow.md`
   - relevant files in `site/editor-templates/`

3. Update the editorial guide to reflect current state.
   - Remove stale notes saying `series` and `site` are expected empty.
   - Add the final media and external dependency rules once decided.

4. Review committed Obsidian state.
   - Confirm personal workspace files are ignored or intentionally tracked.
   - Avoid committing personal layout/session churn.

### Acceptance Checks

- A new page, series, and homepage-style edit can be created or edited without schema errors.
- `npm run build` passes after template changes.
- The editorial guide matches reality.
- Vault CMS surfaces do not encourage invalid frontmatter.

## Phase 6: Full Parity Sweep And Final Repair Loop

### Goal

Move from targeted repair to evidence-backed migration readiness.

### Work

1. Capture local and live desktop screenshots for every menu-reachable page.
2. Capture local and live mobile screenshots for every menu-reachable page.
3. Record route-by-route findings in a parity matrix:
   - content parity
   - visual hierarchy
   - spacing and typography
   - nav/footer behavior
   - mobile behavior
   - internal/external link behavior
   - media ownership
4. Patch remaining high-visibility differences.
5. Run a final adversarial review and edge-case review.

### Acceptance Checks

- Every menu-reachable page has a local/live comparison.
- All intentional differences are documented.
- No old WordPress link escape remains unless explicitly intentional.
- `npm run build` passes.
- Browser checks pass on desktop and mobile for homepage, ordinary page, series index, series detail, and podcast detail.

## Recommended BMad Skill Sequence

### Optional Before Implementation

`[ECH]` **Edge Case Hunter Review**

- Skill: `bmad-review-edge-case-hunter`
- Fresh-context target: this remediation plan plus current route/layout files.
- Why: catches optional-field, route, external-link, and build dependency failure paths before edits start.

### Required Practical Work

Implementation does not have a separate installed BMad skill gate in the current catalog. Proceed in normal coding sessions using this plan as the work order.

Suggested implementation order:

1. Phase 1: shared shell parity.
2. Phase 2: homepage parity.
3. Phase 3: route content and external flow repair.
4. Phase 4: series/podcast source-of-record cleanup.
5. Phase 5: Vault CMS/editor workflow sync.
6. Phase 6: full parity sweep and final repair loop.

### After Major Repairs

`[AR]` **Adversarial Review**

- Skill: `bmad-review-adversarial-general`
- Fresh-context target: repaired site, parity screenshots, and this plan.
- Why: verifies that the repaired Astro site feels like the live site rather than merely passing builds.

`[ECH]` **Edge Case Hunter Review**

- Skill: `bmad-review-edge-case-hunter`
- Fresh-context target: final route layer, content collections, templates, and external links.
- Why: catches launch-risk edge cases after the big visible gaps are closed.

## Immediate Next Step

Start with Phase 1.

The shared shell issues are the best first repair because header, footer, metadata, and page context affect every route. Fixing them first raises the whole site and gives later page-specific parity checks a stable frame.
