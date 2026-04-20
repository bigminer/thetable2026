# Source Extraction Notes

These notes prove one representative per route family from the WordPress manifest and summarize the source shapes that will feed `E2-S1`.

## Homepage
- Representative URL: `/`
- Source shape: SiteOrigin page builder homepage with a full-bleed hero, feature/value grid, image grid, video block, social links, and recent-series widget.
- Observed blocks: hero, feature grid, text band, image grid, video embed, social links, related-series list.
- Target model: `pages` record with typed content blocks instead of a single raw HTML blob.

## Standard Page
- Representative URL: `/our-vision/`
- Source shape: classic static page content with headings, paragraphs, lists, and occasional inline media.
- Observed blocks: markdown paragraphs, heading hierarchy, list blocks, image blocks, occasional link callouts.
- Target model: `pages` with markdown-first blocks and media references.

## Podcast Detail
- Representative URL: `/podcast/thoughtful/`
- Source shape: single sermon/message page with title, speaker links, series links, audio/video media, and related content widgets.
- Observed blocks: article header, metadata line, audio/video embed, speaker/series references, related-series widget.
- Target model: `messages`/`podcast` collection with `series` and `speakers` references.

## Series
- Representative URL: `/series/advent-2025/`
- Source shape: archive page listing episodes in a table-style layout.
- Observed blocks: archive header, series artwork, episode table with date/title/speaker/watch link rows.
- Target model: `series` collection plus message references back to the series.

## Speaker
- Representative URL: `/speakers/brett-tilford/`
- Source shape: archive page filtered to one speaker.
- Observed blocks: archive header, speaker name, episode table filtered by speaker, related metadata.
- Target model: `speakers` collection referenced by message entries.

## Staff
- Representative URL: `/staff/brett-tilford/`
- Source shape: staff profile page with sidebar image, role/title line, contact links, and social icons.
- Observed blocks: profile header, sidebar image, job title, email/phone/contact links, icon links.
- Target model: `staff` collection with a `staff-groups` reference for directory grouping.

## Event Category
- Representative URL: `/events/category/services/`
- Source shape: The Events Calendar archive view with list-style rendering and empty-state messaging when there are no upcoming events.
- Observed blocks: archive wrapper, event list, date/title/location rows, empty-state notice, category filter.
- Target model: `events` plus `event-categories`, sourced from Planning Center or Church Center.

## Form Newsletter
- Representative URL: `/sign-up-for-our-newsletter/`
- Source shape: Formidable form embed with first/last/email fields and reCAPTCHA.
- Observed blocks: intro paragraph, form embed, validation markup, submit state, anti-spam hidden fields.
- Target model: page block with a `form_embed` typed block rather than raw HTML by default.

## Author
- Representative URL: `/author/mhill/`
- Source shape: empty author archive shell with no public posts.
- Observed blocks: archive chrome only; no content payload worth preserving.
- Target model: technical/legacy route only. No public author collection at launch.

## Blog
- Representative URL: `/blog/`
- Source shape: single devotional page with plain rich text.
- Observed blocks: title, paragraph copy, occasional inline emphasis.
- Target model: keep as a page entry unless the editorial model later expands to a true posts collection.

## Staff Group
- Representative URL: `/staff-group/leadership/`
- Source shape: taxonomy archive that renders a staff list instead of a prose page.
- Observed blocks: staff cards, thumbnails, names, group labels, archive wrapper.
- Target model: `staff-groups` collection feeding filtered staff views.
