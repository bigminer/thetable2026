# Content Model Proposal

This proposal is the paper design for `E2-S1`. It keeps the launch model small, typed, and friendly to Markdown/frontmatter editing while still covering the route families proven in `source-extraction-notes.md`.

## Collections

| Collection | Purpose | Notes |
|---|---|---|
| `pages` | Static public pages and landing pages | Holds the homepage and core informational pages. This is the main Markdown authoring surface. |
| `messages` | Sermon/podcast episodes | Replaces the current provisional `podcast` collection with a clearer public-facing name. |
| `series` | Message series | One series can contain many messages; series pages also power archive views. |
| `speakers` | Message speakers | Public speaker archive and speaker-specific message pages. |
| `staff` | Staff and leadership profiles | Used for directory pages and staff detail pages. |
| `staff-groups` | Staff directory taxonomy | Models the leadership/group archive surface. |
| `events` | Public event records | Source of truth for Planning Center or Church Center event content. |
| `event-categories` | Event archive taxonomy | Powers category archive routes such as `/events/category/services/`. |

### Collections not added at launch
- No standalone `authors` collection. The author archive URLs are technical/legacy and do not need a public content model.
- No standalone `forms` collection. Forms are modeled as typed blocks or external links inside pages.
- No dedicated `media` collection yet. Referenced media stays path-based with optional metadata in frontmatter or block data.

## Block union

The current `markdown | raw_html | image` union is too narrow. The launch union should be typed and finite:

| Block type | Covers |
|---|---|
| `markdown` | Standard prose, headings, lists, and inline emphasis. |
| `hero` | Full-width hero sections with headline, subheadline, image, and CTA(s). |
| `feature_grid` | SiteOrigin-style value grids, icon cards, and short feature summaries. |
| `card_grid` | Repeated cards such as ministries, resources, or navigation tiles. |
| `columns` | Two- and multi-column layouts that preserve the current page-builder structure. |
| `image_grid` | Repeated image collections and gallery-style rows. |
| `video_embed` | YouTube/Vimeo/video-shortcode embeds. |
| `form_embed` | Planning Center, Church Center, Formidable, or Apps Script-linked forms. |
| `map_embed` | Google Maps or equivalent location embeds. |
| `quote` | Pull quotes, testimonials, and emphasis blocks. |
| `staff_spotlight` | Staff/profile callouts tied to `staff` or `speakers`. |
| `series_feature` | Featured series widgets and archive promos. |
| `event_feature` | Featured event promos or calendar teasers. |
| `social_links` | Social icon/link strips. |
| `raw_html` | Last-resort fallback only, always sanitized, always audit tagged. |

Raw HTML is migration debt, not a normal authoring path. Typed blocks should cover the common page-builder fragments first; raw HTML only carries the leftovers.

## References

| From | To | Reason |
|---|---|---|
| `messages.series` | `series` | Every episode belongs to at most one series. |
| `messages.speakers` | `speakers` | Panels and guest messages can have more than one speaker. |
| `speakers.staff` | `staff` | Some speakers are also staff and should reuse the staff bio where possible. |
| `staff.groups` | `staff-groups` | Staff directory pages are taxonomy-driven. |
| `events.categories` | `event-categories` | Event archives need category filters and archive routes. |
| `pages.blocks[].featuredSeries` | `series` | Home and landing pages promote series content. |
| `pages.blocks[].featuredEvent` | `events` | Landing pages can surface a selected event or event list. |

## Cardinality

- `messages.speakers` is an array, not a single ref. The manifest already shows panel discussions and guest-speaker episodes where one episode can involve more than one speaker.
- `messages.series` is optional and singular. A message can belong to zero or one series.
- `staff.groups` is an array. The taxonomy behaves like a multi-value archive even if most profiles will have one primary group.
- `events.categories` is an array. Archive and filtering behavior are taxonomy-like, not scalar.
- `pages.blocks` is ordered and may repeat block types many times on one page.
- `raw_html` is allowed only as a fallback block and should always carry a source URL and a reason for the fallback.

## URL validation

- `pages.url` must match a route in `migration-data/route-classification.json`.
- `keep`, `needs-content`, and `needs-integration` are valid public content routes for `pages`.
- `technical` routes are not allowed in content collections.
- Collection-derived routes must compile to exact manifest URLs before build output is accepted.
- Build failures should name the missing or mismatched URL so editors can fix frontmatter without touching code.

## SEO

Each public entry should carry a shared SEO object:

- `title`
- `description`
- `canonical`
- `noindex`
- `ogImage`
- `twitterCard`
- `jsonLd`

Canonical URLs should default to the resolved production host in `D-014`. JSON-LD hooks should support at least `Article`, `PodcastEpisode`, `Person`, and `Event`.

## Media

Use string paths for referenced media at launch. That keeps Markdown/frontmatter editing simple and matches the current migration scope of referenced assets only.

- Media references should carry `src` plus `alt` text.
- Add `width` and `height` when they are known so layout does not shift.
- Add `credit` and `rights` only when needed for provenance.
- Keep media files under the static asset pipeline; do not create a full uploads-library clone.

## Approval note

This proposal is intentionally conservative. It covers the manifest families now, leaves room for future growth, and avoids a schema that would force raw HTML to become the default authoring path.
