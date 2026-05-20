# Editorial Workflow

## Purpose

Describe how the current Astro spike should be edited so the project can be evaluated as a plausible Obsidian + Vault CMS workflow, not just a developer-only prototype.

## Content Promotion Workflow

This project uses a demo-first promotion model:

1. Non-technical contributors send the requested content update in WhatsApp.
2. A maintainer records the request and opens a short-lived working branch, usually `content/<topic>`.
3. Once the change is ready for review, it is promoted into the `demo` branch.
4. `demo` is the preview branch deployed to the GitHub Pages demo site.
5. Reviewers compare the demo branch against the live GitHub Pages demo site.
6. If the demo is approved, merge `demo` into `main` for production deployment. If this repository ever uses `master` instead of `main`, treat `master` as the production branch name.
7. If the demo is not approved, either rework the `demo` branch and review again, or revert the demo commit(s), return to the working branch, and try again with a clean promotion.

Branch roles are intentionally simple:

- `content/<topic>` = working branch for the actual edit
- `demo` = shared preview branch for approval
- `main` = production branch

The important rule is that nothing reaches production until it has been reviewed on the demo site.

## Deployment Split

The repo already separates the two deploy targets:

- `site/astro.config.gh-pages.mjs` builds the static GitHub Pages demo with the `/thetable2026` base path.
- `site/astro.config.mjs` builds the production server app for the live site.

That means the demo branch can stay on a static review path while `main` keeps the production deploy path isolated.

## Vault Root

The intended Obsidian vault root is:

```text
/Users/gary/Dev/table-cms-vault/site/src/content
```

Vault CMS was installed there using the current recommended CLI:

```bash
npx create-vaultcms
```

That added:

- `.obsidian/`
- `_bases/Home.base`
- `_GUIDE.md`

After opening the folder in Obsidian, run `Vault CMS: Open Wizard` so the installed plugins can inspect the existing Astro collections.

Current note after the first wizard pass:

- the wizard successfully detected `pages`, `series`, `messages`, and `site`
- the generated templates were adjusted slightly afterward so they better match the Astro schema, especially for `pages.sidebar`, flat `series` metadata, and individual `messages` entries
- live editing in Obsidian was validated against the running Astro site during the spike
- one renderer assumption was exposed and fixed when `heroImage` was changed to a video URL on the homepage
- the homepage now uses flat `contactActionLabel`, `contactActionUrl`, and `mapEmbedUrl` fields
- `site/homepage.md` is part of the normal editorial flow, not an empty collection stub

## Dev Server Note

Normal content edits usually appear with a browser refresh while `npm run dev` is running.

One caveat showed up during the spike:

- if Astro hits an invalid content entry or a route-affecting content problem, the running dev server can keep serving a stale route graph
- in that state, a production build may succeed and show the right routes while the local dev server still returns `404`

Practical rule:

- for normal copy edits, refresh the browser
- for missing new pages, stale routes, or unexpected `404`s after content changes, restart the Astro dev server

## Migration Handoff Notes

These are the patterns that have already shown up during real page migration work, and they are worth carrying into any fresh session.

### Current Migration Loop

For standard `pages` entries, use this sequence:

1. Pull source HTML from:
   - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-content.json`
2. Create or update the Markdown file in:
   - `site/src/content/pages/`
3. Copy launch-critical images from:
   - `/Users/gary/Dev/thetable/wp-content/uploads/`
4. Store localized page media in:
   - `site/src/content/attachments/`
   - Astro copies this to `site/public/attachments/` at build time and serves it at `/attachments/...`
5. Run:
   - `npm run build`
6. Verify the live dev route in a real browser with Playwright at:
   - `http://127.0.0.1:4321/<slug>/`

Do not treat a successful build as enough. We already hit cases where the static build was correct but the running dev server still served stale routes until it was restarted.

### Real Content Conventions

Patterns that are working well so far:

- Leave `slug` out entirely when the filename should define the route.
- Leave optional frontmatter keys out instead of setting them blank.
- Use `draft: false` once the page is migrated and browser-verified.
- Prefer Markdown cleanup over preserving WordPress HTML structure.
- Keep sidebars out unless the page clearly needs structured supporting data.
- Use `contactActionLabel`, `contactActionUrl`, and `mapEmbedUrl` for the homepage CTA and directions block.
- Keep project-owned launch media under `site/src/content/attachments/`; Astro copies it to `site/public/attachments/` and serves it at `/attachments/...`.
- Reserve remote URLs for temporary migration work or for intentionally external services.

Important Astro frontmatter nuance:

- blank frontmatter fields in Markdown may be parsed as `null`
- if the schema expects `string` or `''`, those `null` values will fail validation
- for optional fields like `slug`, `navTitle`, `heroImage`, and `heroImageAlt`, omission is safer than a blank value

### Local Media Rule

The migration is now using project-owned media paths like:

- `/attachments/pages/our-story/Brett-and-Maggie-Tilford.jpg`
- `/attachments/pages/our-vision/theTable_vision-pic.jpeg`

To support that, the content schema in `src/content.config.ts` was broadened to accept both:

- full remote URLs
- root-relative local asset paths beginning with `/`

This matters for any future session because local image paths are now part of the intended migration workflow, not a special case.

### Dev Server / Playwright Gotchas

Two operational problems have already repeated:

- multiple Astro dev servers can end up running at once, which may shift the live port from `4321` to `4322`
- after route-affecting content changes or content-config changes, the dev server can hold onto a stale route graph and return `404` for pages that the build can generate successfully

Practical rule:

- before Playwright verification, make sure only one Astro dev server is running
- prefer `127.0.0.1:4321`
- if Playwright sees a `404` for a page that `npm run build` includes, restart `npm run dev` and check again

### Current Verified Pages

As of the first migration passes, these routes have been migrated and verified in Playwright:

- `/our-story/`
- `/new-here/`
- `/our-vision/`
- `/service-times-locations/`

### Expected Warnings Right Now

These are no longer expected:

- `series` being empty
- `site` being empty

Treat either warning as a migration gap that should be checked, not as a normal baseline state.

## Current Model

The spike uses Astro content collections for four content groups:

- `site`
- `pages`
- `series`
- `messages`

Each collection uses Markdown entries with frontmatter plus Markdown body content.

The `messages` collection replaces the earlier nested `series.episodes[]` model. This follows Vault CMS guidance: content stays in plain Markdown in the repo, content types line up with Astro collection folders under `src/content`, and flat frontmatter works better with Obsidian properties than deeply nested YAML object arrays.

## Editing Conventions

### General

- Prefer standard Markdown links over wikilinks.
- Keep frontmatter flat where possible.
- Treat the `title` field as the primary label editors work from.
- Prefer editing body copy in Markdown instead of pushing too much into structured fields.
- Only add new schema fields when the page genuinely needs reusable structure.

These choices line up with Vault CMS’s stated preference for an Obsidian-native workflow where Markdown remains central and the backend/frontend stay visually close. Source: [Vault CMS introduction](https://docs.vaultcms.org/guides/introduction/)

### Pages

Files live in:

- `src/content/pages/`

Current example:

- [src/content/pages/our-story.md](/Users/gary/Dev/table-cms-vault/site/src/content/pages/our-story.md:1)

Use page entries for:

- regular informational pages
- document-like content with optional hero image
- pages that may need a small sidebar model

### Series

Files live in:

- `src/content/series/`

Current examples:

- [src/content/series/the-good-book.md](/Users/gary/Dev/table-cms-vault/site/src/content/series/the-good-book.md:1)
- [src/content/series/advent-2025.md](/Users/gary/Dev/table-cms-vault/site/src/content/series/advent-2025.md:1)

Use series entries for:

- artwork
- series description
- optional series-level dates

Do not add message or episode arrays to series frontmatter. Series entries should stay flat and describe the series only: `title`, `description`, artwork such as `featuredImage`, optional dates, and `draft`.

### Messages

Files live in:

- `src/content/messages/`

Use message entries for:

- individual sermons
- launch-visible message metadata
- external watch/listen destinations

Message frontmatter should stay flat:

- `title`
- `series`, as an Obsidian link to a series note
- `date`
- `speaker`, only when needed
- `sourceUrl`, the YouTube video URL when available
- `podcastUrl`, the specific Spotify or podcast-platform episode URL when available
- `draft`

Message files are listed on their series page. The `series` field should link to a series note, such as `[Lent 2025](../series/lent-2025.md)`; Astro normalizes Obsidian links to a validated series collection reference. The YouTube URL belongs in `sourceUrl`; the platform-specific audio episode belongs in `podcastUrl`. Watch and Listen buttons appear directly on the series page for each message.

### Homepage

Files live in:

- `src/content/site/`

Current example:

- [src/content/site/homepage.md](/Users/gary/Dev/table-cms-vault/site/src/content/site/homepage.md:1)

The homepage is the hardest editorial test in the spike.

Rules:

- keep the hero and major homepage sections editable
- avoid turning the homepage into a giant deeply nested blob
- allow some structured section data where it clearly maps to repeated homepage sections
- if the homepage only works through complex custom structure, treat that as a warning sign
- prefer `heroImage` for image-based heroes and `heroVideo` for video heroes
- keep `heroImage` as the image-oriented field so Vault CMS image handling stays straightforward

## Images

Current state:

- launch-visible page, homepage, leadership, and series artwork has been moved into `site/src/content/attachments/`
- the homepage hero media is project-owned under `site/src/content/attachments/`
- the homepage now also supports an optional `heroVideo` URL

Why:

- it avoids making launch-critical media depend on old WordPress URLs
- it keeps intentional service embeds visible as external dependencies instead of hiding them in body HTML

Current practical media rule:

- for ordinary image fields, keep using vault-relative `attachments/...` paths in frontmatter; Astro serves them at `/attachments/...`
- for the homepage hero specifically, use `heroImage` or `heroVideo` depending on the media type
- this keeps the image-oriented Obsidian/Vault CMS flow intact instead of overloading one field too heavily
- if a page needs a map embed or social embed, keep that external URL explicit instead of trying to localize it

Chosen migration direction:

- move away from remote WordPress URLs
- store project-owned launch media in `site/src/content/attachments/`
- rely on the build copy to publish that media at `site/public/attachments/` and `/attachments/...`
- use site-relative paths in frontmatter during the real migration
- keep Church Center, YouTube, Facebook, Google Maps, and similar services external when they are intentionally part of the public experience
- use the sourced phone path for temporary contact, newsletter, and get-involved actions until the replacement flow is ready

What to test next:

- how editors should add new local images and video during the real migration
- how bulk asset copying from WordPress should be organized into the shared folders

## Markdown vs MDX

Default:

- Markdown

Use MDX only when a page genuinely needs:

- embedded components
- richer layout behavior inside the body
- image/component composition that standard Markdown cannot support cleanly

For this spike, Markdown-first is the safer editorial choice.

## Templates

Reference templates are available in:

- [editor-templates/page-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/page-template.md:1)
- [editor-templates/series-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/series-template.md:1)
- [editor-templates/message-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/message-template.md:1)
- [editor-templates/homepage-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/homepage-template.md:1)

These are currently manual references, not automated Vault CMS actions.

## Current Validation Questions

This workflow pass is trying to answer:

- can an editor understand where each kind of content lives?
- does the frontmatter feel manageable rather than brittle?
- does the homepage model feel merely structured, or overengineered?
- does the split between flat `series` entries and individual `messages` entries feel clean enough to repeat?
- do the current templates make new entries straightforward?

## Likely Next Improvements

- add local image workflow guidance and convert away from remote image shortcuts
- align file naming and slug conventions more tightly
- optionally add Obsidian-facing metadata tables or notes for collection browsing
- finish the Obsidian-side wizard pass and verify the detected content types feel correct

## Authoring Guardrails

For new series entries:

- start with `draft: true` on purpose while the content is incomplete
- leave `slug` blank to use the filename, or use a unique custom `slug`
- keep the entry limited to series-level metadata such as title, description, artwork, optional dates, and draft status
- create individual message or podcast items in `messages/`, not nested `episodes[]` arrays
- change `draft` to `false` when the entry should render on the site

For new message entries:

- start with `draft: true` while the message is incomplete
- set `series` with Obsidian's link picker by choosing the related note in `series/`
- set `date` using `YYYY-MM-DD`
- add `speaker`, `sourceUrl`, or `podcastUrl` only when needed
- change `draft` to `false` when the message should render on the site

For new page entries:

- start with `draft: true` while the page is incomplete
- leave `slug` blank to use the filename, or use a unique custom `slug`
- change `draft` to `false` when the page should render on the site
