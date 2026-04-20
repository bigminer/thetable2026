# Original-Site Content and Design Parity Contract

## Objective

The migration objective is not “Astro builds” or “WordPress HTML appears on a route.”

The objective is to rebuild the public `thetabletx.com` site as a static Astro site that preserves each public page’s purpose, content hierarchy, section order, calls to action, media intent, and brand-level visual feel while improving mobile consistency and editor maintainability.

Raw WordPress/SiteOrigin HTML is allowed only as an audited migration fallback. It is not sufficient evidence that a high-priority page has been migrated well.

## Authoritative Inputs

Use these inputs in this order:

1. `DECISIONS.md`
2. `plan.yaml`
3. `migration-data/source-reference/site-manifest-latest/`
4. WordPress theme CSS:
   - `migration-data/source-reference/wp-themes/kerygma/style.css`
   - `migration-data/source-reference/wp-themes/thetable/style.css`
5. Local generated route/content artifacts in `migration-data/`
6. Live `https://thetabletx.com/` screenshots only when local artifacts cannot prove visual intent

Do not re-crawl or regenerate the manifest unless `npm run verify:manifest` reports drift.

## Page Tiers

Tier 1 pages must be manually compared before E6-S1 can close:

- `/`
- `/new-here/`
- `/service-times-locations/`
- `/lgbt-affirming-church/`
- `/our-vision/`
- `/our-story/`
- `/kids-youth/`
- `/meetups/`
- `/giving/`
- `/contact-us/`

Tier 2 pages must have source-vs-target content evidence and route checks:

- `/community-meal/`
- `/leadership/`
- `/privacy-policy/`
- `/blog/`
- `/series/`
- `/events/category/community-events/`
- `/events/category/fellowship/`
- `/events/category/services/`

Tier 3 pages may remain fallback or placeholder only if explicitly marked as migration debt:

- `/features/`
- `/full-hero/`
- `/merch/`
- `/thank-you-page/`

## Per-Page Evidence Required

Each migrated Tier 1 page needs a source-vs-target record with:

- Source URL and target local URL.
- Source title and target title.
- Primary page purpose.
- Section inventory in source order.
- CTA inventory, including labels and destinations.
- Media inventory, including images, video, embeds, maps, and forms.
- Integration handoff behavior where applicable.
- Notes for any omitted, transformed, or deferred content.
- Desktop and mobile visual review result.

For Tier 1 pages, a passing route status is not enough. The page must preserve the original page’s communication intent and section rhythm.

## Raw HTML Rules

Raw HTML fallback may be used to preserve content during migration only when:

- The fragment is sanitized.
- The fragment carries source URL and reason metadata.
- The page has an audit note explaining why typed blocks were not used.
- The fallback does not create visibly random, duplicated, broken, or out-of-order content.

Tier 1 pages should be converted to typed blocks before launch unless a specific blocker is logged in `JOURNAL.md`.

## Visual Parity Rules

Brand-level parity means:

- Preserve the church’s existing identity, tone, imagery style, and page intent.
- Preserve major section sequencing and CTA priority.
- Preserve service-time, location, giving, contact, and newcomer paths without drift.
- Improve mobile spacing and consistency without redesigning the brand.

It does not mean:

- Pixel-for-pixel cloning.
- Dumping page-builder HTML into Astro and calling it done.
- Inventing new page copy, layouts, colors, or navigation priorities without a decision entry.

## Playwright Visual Confirmation

Playwright is the authoritative visual confirmation mechanism for parity, not a post-hoc regression check.

**Baseline capture:**
- Screenshot each Tier 1 page on the live `thetabletx.com` production site and commit those images as fixtures in `tests/visual/production-baselines/`.
- Capture at both desktop (1440×1024) and mobile (390×844) viewports.
- Baselines represent current production content and are treated as fixed — the site is not a moving target.

**Comparison:**
- The Astro local preview is diffed against the committed production baselines for each Tier 1 page.
- During the current rebuild, the Tier 1 visual diff is warning-only because major WordPress/SiteOrigin-to-Astro structure drift is already recorded as `E6-S10`.
- Dynamic content regions are not masked — if it is on the page it is part of the page.

**Passing criteria before launch:**
- `E6-S10` must either tighten the Astro implementation against the production baselines or intentionally replace the production baselines with approved Astro-native baselines.
- A page may not be marked migrated on visual evidence alone — it must also have a passing E6-S5 evidence file.

## Media Audit Rule

Assets in `public/media/` must trace to an active reference in `migration-data/source-reference/site-manifest-latest/`. Any asset not referenced on the live `thetabletx.com` site is removed before launch. E6-S6 includes an audit pass against the manifest.

Every migrated asset must have two local paths recorded in `migration-data/asset-copy-manifest.json`:

- `sourceReferencePath`: the copied source/reference asset under `migration-data/source-reference/assets/`.
- `destinationPath`: the public Astro asset under `public/media/`.

Content must reference `publicPath` values from the asset copy manifest, never WordPress upload URLs. The manifest keeps the original `sourceUrl` for audit, but runtime pages should load the local `destinationPath` through its public `/media/...` URL.

Media retrieval uses `scripts/extract-referenced-media.mjs`:

- `npm run media:extract:dry-run` discovers WordPress upload URLs in active Astro content and local WordPress API snapshots.
- `npm run media:check` fails when active content references unmanaged WordPress media or when managed assets are missing either local copy.
- `npm run media:extract` downloads only unmanaged URLs referenced by active repo content, writes both local copies, updates `migration-data/asset-copy-manifest.json`, and rewrites active content references to `/media/...`.

Source-only URLs found in the WordPress snapshots are audit candidates, not automatic launch scope. They should be copied only when a migration task actually uses that content.

## E6-S1 Verification Requirements

Before E6-S1 can be marked done again, its verifier must prove at least:

- `npm run build` passes.
- `npm run test:routes` passes.
- Tier 1 routes return `200` locally.
- Tier 1 source-vs-target evidence files exist.
- Homepage rendered text includes the source homepage’s primary sections.
- No verifier checks for scaffold/sample phrases.
- Raw HTML blocks include audit metadata.
- Visual checks cover homepage plus at least two Tier 1 interior pages on desktop and mobile.

If those checks are not implemented yet, E6-S1 remains blocked.
