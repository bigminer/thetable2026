# WordPress To Astro Schema Mapping

## Purpose

Define how content from the WordPress backup at `/Users/gary/Dev/thetable` should map into the current Astro content collections in `/Users/gary/Dev/table-cms-vault/site/src/content/`.

This document is for migration execution, not spike brainstorming.

## Source Inputs

Primary source files:

- `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-index.json`
- `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-content.json`
- `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/site-meta.json`
- `/Users/gary/Dev/thetable/wp-content/uploads/`

Target schema source:

- [site/src/content.config.ts](/Users/gary/Dev/table-cms-vault/site/src/content.config.ts:1)

## General Mapping Rules

### Standard WordPress Page Metadata

| WordPress Source | Astro Target | Notes |
| --- | --- | --- |
| `title.rendered` | `title` | Decode HTML entities during import |
| `slug` | `slug` or filename fallback | Use live URL intent; Astro can fall back to filename if blank |
| `excerpt.rendered` | `description` or `lede` | Prefer concise summary text when useful |
| `content.rendered` | Markdown body | Convert HTML to Markdown where practical |
| `status=publish` | `draft: false` | Non-published content should not migrate automatically |
| `link` | route parity reference | Preserve public URL structure where possible |

### Media Rule

During migration, replace remote WordPress media URLs with local project-owned paths.

Target locations:

- `site/public/images/...`
- `site/public/video/...`

## Collection Mapping

### 1. `pages`

Target files:

- `site/src/content/pages/*.md`

Use for:

- standard menu pages
- text-and-image pages
- pages with small sidebar/supporting data

#### Field Mapping

| Astro Field | WordPress Source | Migration Rule |
| --- | --- | --- |
| `title` | `title.rendered` | Decode entities and use plain text |
| `description` | `excerpt.rendered` or manually summarized body | Prefer a short human summary if excerpt is weak |
| `slug` | `slug` | Keep live route parity where possible |
| `navTitle` | manual or `title.rendered` | Optional; only use when nav label should differ |
| `lede` | first strong paragraph or intro heading text | Manual extraction often better than raw excerpt |
| `heroImage` | page hero image if present | Copy local and reference project path |
| `heroImageAlt` | media alt text or manual | Manual cleanup likely required |
| `sidebar.*` | page-specific structured extras | Manual extraction from layout/widgets, not generic REST fields |
| body Markdown | `content.rendered` | Convert HTML to Markdown and keep meaningful structure |
| `draft` | migration state | Use `false` for migrated launch pages |

#### Pages Likely To Need `sidebar`

- `our-story`
- `contact-us`
- `service-times-locations`
- possibly `our-vision`

These pages may contain map/embed/contact/supporting blocks that are better modeled as small structured data than left buried in body HTML.

### 2. `series`

Target files:

- `site/src/content/series/*.md`

Use for:

- series detail entries
- subscription links
- lightweight message lists used for launch parity

#### Field Mapping

| Astro Field | WordPress Source | Migration Rule |
| --- | --- | --- |
| `title` | series page title | Use visible public title |
| `description` | intro/summary paragraph from series page | Manual extraction from page content |
| `slug` | live series slug | Preserve route parity |
| `featuredImage` | series artwork in page/media | Copy local and reference project path |
| `featuredImageAlt` | media alt text or manual | Manual cleanup likely required |
| `speaker` | visible speaker metadata | Extract only if clearly present |
| `scripture` | visible scripture metadata | Extract only if clearly present |
| `startDate` / `endDate` | manual or inferred from live display | Optional, only if useful and trustworthy |
| `externalLinks[]` | visible subscription/platform links | Preserve as explicit labeled links |
| `episodes[]` | visible message rows | Map each row to `title`, `speaker`, `dateLabel`, `url` |
| body Markdown | series intro body | Convert to Markdown |
| `draft` | migration state | Use `false` for launch-relevant series |

#### Important Note

The current WordPress manifest does not expose a ready-made normalized `series` structure in the same way ordinary pages do. The migration will likely need:

- page-level extraction for the series index
- page scraping or manual extraction for the launch-relevant series entries
- possible consultation of sitemap taxonomies or podcast-related post data later

So `series` is partly structured migration and partly controlled manual extraction.

### 3. `site`

Target files:

- `site/src/content/site/homepage.md`

Use for:

- homepage singleton-style content

#### Field Mapping

| Astro Field | WordPress Source | Migration Rule |
| --- | --- | --- |
| `title` | homepage title or site title | Use site-appropriate label |
| `heroTitle` | homepage headline widget | Manual extraction from homepage layout content |
| `heroSubtitle` | homepage subheadline widget | Manual extraction |
| `heroImage` | homepage hero still image if used | Copy local image path if image hero is chosen |
| `heroVideo` | homepage b-roll video | Copy local video path into `site/public/video/` |
| `heroImageAlt` | manual | Write intentionally |
| `intro` | homepage statement text | Extract from homepage content block |
| `welcomeTitle` | homepage welcome heading | Manual extraction |
| `welcomeVideoUrl` | homepage embedded welcome video | Keep external if still YouTube-based |
| `valuesIntro` | homepage values intro text | Manual extraction |
| `values[]` | homepage values/features section | Manual extraction into title/body items |
| `featureSections[]` | homepage repeated feature blocks | Manual extraction into title/body/image rows |
| `communityTitle` | homepage community/get involved heading | Manual extraction |
| `communityBody` | homepage supporting copy | Manual extraction |
| `communityImages[]` | homepage supporting gallery | Copy local image paths |
| `contactTitle` | homepage contact heading | Manual extraction |
| `contactBody` | homepage contact copy | Manual extraction |
| `addressLines[]` | visible contact/address block | Manual extraction |
| `serviceTime` | visible service time | Manual extraction |
| `meetupsUrl` | visible internal meetups link | Preserve as internal route |
| `socialLinks[]` | visible social links | Preserve as labeled URLs |
| body Markdown | supporting narrative copy | Keep only meaningful longform body content |
| `draft` | migration state | Use `false` for launch homepage |

#### Important Note

The homepage is not a generic “convert page HTML to Markdown” case.

It is a layout decomposition task:

- extract repeated sections from the WordPress homepage layout
- map them intentionally into the current `site` schema
- copy the required media locally

## Page-Level Mapping Guidance

### Straightforward `pages` Candidates

These are likely normal page migrations:

- `new-here`
- `our-story`
- `our-vision`
- `service-times-locations`
- `meetups`
- `kids-youth`
- `community-meal`
- `get-involved`

### Special-Handling `pages`

- `leadership`
  - may eventually be better backed by `staff` entries plus a page shell
- `sign-up-for-our-newsletter`
  - likely contains form/embed logic that should be reviewed, not blindly converted
- `contact-us`
  - likely contains form/embed logic and contact/sidebar behavior

### Special-Handling `site`

- homepage
  - must be decomposed from SiteOrigin/Page Builder style content into the `site` schema

### Special-Handling `series`

- `series` index and detail pages
  - likely need targeted extraction rather than simple REST-to-Markdown conversion

## HTML To Markdown Rule

Use HTML-to-Markdown conversion for ordinary longform page body content, but do not blindly convert:

- form markup
- widget wrappers
- SiteOrigin layout scaffolding
- embedded plugin shortcodes without deciding whether they stay external

Preferred approach:

- keep meaningful headings, paragraphs, lists, and inline images
- strip layout noise
- move structural content into frontmatter only when it clearly maps to the Astro schema

## Draft / Publish Rule

Imported launch-scope content should generally land as:

- `draft: false` once validated

Use `draft: true` only when:

- the page is incomplete
- media has not yet been localized
- route/content parity is still under review

## Recommended Next Step

Use this mapping document to create:

1. a page transformation checklist for `pages`
2. a homepage decomposition checklist for `site/homepage.md`
3. a series extraction checklist for launch-relevant series entries
