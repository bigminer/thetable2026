---
project_name: 'tablefresh'
user_name: 'Gary'
date: '2026-04-19'
sections_completed: ['technology_stack', 'content_authoring', 'integration_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 12
---

# Project Context for AI Agents

This repository is a migrated church website built to stay local-first and content-driven. Keep implementation changes aligned with the existing Astro + markdown architecture and avoid introducing unnecessary platform complexity.

## Technology Stack & Versions

- Node.js `>=22.12.0`
- Astro `^6.1.8`
- TypeScript via `astro/tsconfigs/strict`
- `sanitize-html` `^2.17.3`
- Static site output from Astro build
- Content collections in `src/content`
- Obsidian templates in `obsidian/templates`
- No dedicated lint or test stack is present; `astro build` is the primary verification step

## Content Authoring Rules

- Treat markdown frontmatter as the CMS.
- Use the `obsidian/templates/*` files for new or updated content entries.
- Keep `pages`, `messages`, `staff`, and `events` in their approved collection folders.
- Prefer typed blocks in page frontmatter over freeform HTML.
- Use `draft: true` for content that should not be considered final yet.
- Preserve existing migrated pages that still use `raw_html` until they are explicitly converted.
- Use reference slugs for series, speakers, staff groups, and event categories.
- Use structured media objects with `src` and `alt`; include dimensions when available.
- Keep Obsidian-friendly authoring simple so non-technical contributors can edit safely.

## Integration Rules

- Keep Planning Center as an external data source, not the primary CMS.
- Default Planning Center event reads to the local fixture snapshot.
- Use API mode only when `PLANNING_CENTER_EVENTS_SOURCE=api` is set.
- Preserve fixture fallback behavior so local work does not depend on live credentials.
- Treat Google Business and Church Center links as external destinations, not content stores.
- Prefer small integration layers in `src/lib` and keep page routes focused on presentation.

## Critical Implementation Rules

- Preserve the content-collection structure in `src/content`; do not replace it with a heavier CMS unless explicitly requested.
- Use the existing template-driven markdown workflow for content edits.
- Keep entries frontmatter-only unless a template explicitly allows a body.
- Use reference slugs for related content like series, speakers, staff groups, and event categories.
- Use structured media objects with `src` and `alt` for images.
- Do not introduce `raw_html` unless there is no reasonable typed block alternative.
- Keep Planning Center as an external data source with local fixture fallback.
- Favor local buildability; changes should work without requiring hosting infrastructure first.
- Run the local build when content schema or routing changes are made.
- Keep Astro page routes thin; source content should drive the page wherever possible.
- Preserve current URL paths and canonical links unless a migration change is explicitly planned.

## Existing Patterns To Preserve

- Astro pages pull content from `astro:content` entries.
- The homepage is assembled from content blocks rather than hardcoded JSX.
- Navigation and small config data live in `src/data`.
- Integration code lives in `src/lib`.
- Static assets are stored under `public/media`.
- The project already uses a clear separation between source content, templates, and presentation.
- Existing raw HTML content is a migration artifact, not a preferred pattern.
- Cloudflare Pages is mentioned in the editing guide, but the repo should remain buildable locally without hosting assumptions.
