# Astro Migration Inventory

## Purpose

Define the exact migration scope from the current live `thetabletx.com` navigation into Astro content collections, using:

- the live menu-reachable site as the scope authority
- `/Users/gary/Dev/thetable` as the source extraction location

## Scope Rule

Migrate the pages currently reachable from the live navigation on `https://thetabletx.com/`.

This includes:

- page content
- launch-critical images
- homepage b-roll video

It does not automatically include:

- abandoned WordPress pages not visible from the live navigation
- old theme demo pages
- every WordPress post type unless it supports a live navigation or launch-critical public experience

## Source Systems

### Scope Authority

- live site inventory:
  - [_bmad-output/live-site-menu-inventory.md](/Users/gary/Dev/table-cms-vault/_bmad-output/live-site-menu-inventory.md:1)

### Extraction Sources

- WordPress backup root:
  - `/Users/gary/Dev/thetable`
- page metadata:
  - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-index.json`
- page HTML payloads:
  - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-content.json`
- site meta:
  - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/site-meta.json`
- uploads:
  - `/Users/gary/Dev/thetable/wp-content/uploads/`

## Collection Mapping

### `site`

Use for singleton-style site content.

Initial migration target:

- homepage

### `pages`

Use for standard menu pages and document-style content.

Initial migration targets:

- `new-here`
- `our-story`
- `our-vision`
- `leadership`
- `service-times-locations`
- `meetups`
- `kids-youth`
- `community-meal`
- `get-involved`
- `sign-up-for-our-newsletter`
- `contact-us`

### `series`

Use for:

- series index
- individual series entries

Initial migration targets:

- `series` page/index behavior
- live series detail entries needed for launch parity

### External / Not Astro Content Pages

- `giving`
  - keep external to Church Center unless a later launch decision changes this

## Menu-Reachable Page Inventory

| Live URL | WP Page ID | WP Slug | Proposed Astro Target | Notes |
| --- | ---: | --- | --- | --- |
| `https://thetabletx.com/` | `1737` | `homepage-updates-draft` | `site/homepage.md` | Front page per `site-meta.json`; migrate content plus hero media |
| `https://thetabletx.com/new-here/` | `1168` | `new-here` | `pages/new-here.md` | Standard page migration |
| `https://thetabletx.com/our-story/` | `1099` | `our-story` | `pages/our-story.md` | Already used in spike; keep as representative page |
| `https://thetabletx.com/our-vision/` | `1100` | `our-vision` | `pages/our-vision.md` | Standard page migration |
| `https://thetabletx.com/leadership/` | `1029` | `leadership` | `pages/leadership.md` or `staff` collection-backed page | Likely leads into future `staff` modeling |
| `https://thetabletx.com/service-times-locations/` | `1064` | `service-times-locations` | `pages/service-times-locations.md` | Standard page migration |
| `https://thetabletx.com/series/` | `1028` | `series` | `series` index route | Collection/index behavior, not just one page body |
| `https://thetabletx.com/meetups/` | `1065` | `meetups` | `pages/meetups.md` | Likely temporary static page unless events integration changes |
| `https://thetabletx.com/kids-youth/` | `1067` | `kids-youth` | `pages/kids-youth.md` | Standard page migration |
| `https://thetabletx.com/community-meal/` | `1163` | `community-meal` | `pages/community-meal.md` | Standard page migration |
| `https://thetabletx.com/get-involved/` | `1071` | `get-involved` | `pages/get-involved.md` | Standard page migration |
| `https://thetabletx.com/sign-up-for-our-newsletter/` | `1072` | `sign-up-for-our-newsletter` | `pages/sign-up-for-our-newsletter.md` | Form/embed review needed |
| `https://thetabletx.com/contact-us/` | `692` | `contact-us` | `pages/contact-us.md` | Migrate as content page with temporary form stub |
| External giving target | `1062` | `giving` | external link only | Do not migrate as an internal Astro page for now |

## Series Scope Notes

The page record for `/series/` exists in WordPress, but the real migration need is broader:

- recreate the series index experience
- migrate the currently relevant live series entries
- preserve launch-relevant subscription and message linking behavior

The spike has already validated two live examples:

- `the-good-book`
- `advent-2025`

The full migration should inventory the series entries needed for launch rather than assuming the page record alone is sufficient.

## Media Scope

Localize launch-critical media into the Astro project.

Chosen project-owned media locations:

- `site/public/images/`
- `site/public/video/`

What should be copied:

- homepage b-roll video
- homepage images
- page hero images
- inline page images used by migrated pages
- series cover art needed for launch

What can stay external initially if needed:

- third-party embeds
- Church Center giving target
- podcast platform links

## Initial Migration Sequence

1. Homepage content and media
2. Remaining standard menu pages in `pages`
3. Series index and launch-relevant series entries
4. Leadership/staff decision and implementation
5. Newsletter/contact pages migrated with temporary form stubs
6. Navigation/footer parity cleanup

## Immediate Follow-Up Artifacts Needed

- WordPress-to-Astro schema mapping
- local media copy plan
- series launch inventory

## Recommendation

Treat this inventory as the authoritative page-level migration scope unless the live navigation changes.
