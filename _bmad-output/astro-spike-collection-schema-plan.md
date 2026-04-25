# Astro Spike Collection + Schema Plan

## Purpose

Define the concrete Astro content model for the `vaultcms` spike so implementation can begin with stable assumptions.

This plan is intentionally narrow. It is designed to support only the spike proof set:

- homepage
- one representative page
- one `series` content type

## Seed Set

Use the already selected live-site references:

- homepage: `https://thetabletx.com/`
- representative page: `https://thetabletx.com/our-story/`
- series index reference: `https://thetabletx.com/series/`
- primary series detail reference: `https://thetabletx.com/series/the-good-book/`
- secondary series detail reference: `https://thetabletx.com/series/advent-2025/`

## Principles

- Prefer build-time Astro content collections.
- Prefer flat schemas over deeply nested frontmatter.
- Prefer Markdown as the default authoring format.
- Use MDX only if a page genuinely needs embedded components.
- Keep the homepage model simple enough that it would still feel manageable in Obsidian.
- Match the live site’s visible structure and terminology where practical.

## Proposed File Structure

```text
src/
  content/
    pages/
      our-story.md
    series/
      the-good-book.md
      advent-2025.md
    site/
      homepage.md
    media/
      ...
  pages/
    index.astro
    [...slug].astro
    series/
      [slug].astro
```

## Collections

### `pages`

Purpose:

- ordinary content pages such as `Our Story`
- routeable by slug
- body content authored in Markdown

Suggested schema:

```ts
z.object({
  title: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  navTitle: z.string().optional(),
  heroImage: image().optional(),
  heroImageAlt: z.string().optional(),
  draft: z.boolean().default(false),
})
```

Notes:

- `slug` should support page URLs such as `our-story`
- body content should handle longform copy
- a single optional hero image is enough for the spike
- inline images inside Markdown remain allowed

### `series`

Purpose:

- validate structured content with repeatable fields
- support a list/index page and detail pages
- follow the live series presentation as closely as practical

Suggested schema:

```ts
z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  featuredImage: image(),
  featuredImageAlt: z.string().optional(),
  speaker: z.string().optional(),
  scripture: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  externalLinks: z.array(
    z.object({
      label: z.string(),
      url: z.string().url(),
    })
  ).optional(),
  draft: z.boolean().default(false),
})
```

Notes:

- `title`, `description`, and `featuredImage` are the core visible series fields
- `speaker`, `scripture`, and dates remain optional because the spike should follow the live site rather than invent missing data
- `externalLinks` is a practical replacement for the live page’s subscription buttons
- do not model episodes as fully local Markdown entries yet unless the spike needs them
- for the spike, linked episodes can remain external URLs or lightweight metadata if needed

### `site`

Purpose:

- hold singleton site-level spike content
- provide an editable homepage source without requiring a giant nested schema

Suggested schema:

```ts
z.object({
  title: z.string(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImage: image().optional(),
  heroImageAlt: z.string().optional(),
  intro: z.string().optional(),
  draft: z.boolean().default(false),
})
```

Notes:

- use a single `homepage.md` entry for the spike
- represent the homepage as a mix of flat frontmatter plus Markdown body
- if later homepage sections require more structure, add only a small number of repeatable section objects or a companion data file
- avoid turning the homepage into a giant nested object during the spike

## Routing Plan

### Homepage

- `src/pages/index.astro`
- loads the singleton `site/homepage` entry

### Representative Pages

- `src/pages/[...slug].astro`
- uses `getStaticPaths()`
- maps `pages` collection entries by `slug`

This allows a simple path such as:

- `our-story` -> `/our-story/`

### Series Pages

- `src/pages/series/[slug].astro`
- uses `getStaticPaths()`
- maps `series` collection entries by `slug`

### Series Index

One of these is acceptable for the spike:

- dedicated route at `src/pages/series/index.astro`
- or a static route file `src/pages/series.astro` if that better matches the desired URL structure

Preferred:

- `src/pages/series/index.astro`

## Rendering Plan

### Pages

- query entry from `pages`
- render body content with `render()`
- use a shared content page layout

### Series

- query entry from `series`
- render series body content with `render()`
- show featured image, title, description, and external links
- add a simple related-message list only if needed for spike credibility

### Homepage

- query `homepage` entry from `site`
- render hero and intro from frontmatter
- render the rest of the page from body Markdown and/or a small amount of structured data

## Image Plan

- store spike images in `src/content/...` near the relevant entries or in a nearby shared media directory
- validate associated images using Astro’s `image()` schema helper
- render major images through Astro image handling
- keep image naming human-readable and editor-friendly

## Authoring Plan

### Default format

- `.md`

### When to allow `.mdx`

Only if one of these becomes necessary:

- embedded Astro component in page body
- richer image/component composition than Markdown can reasonably support
- clearly improved editor outcome for a specific proof target

If `.mdx` is introduced, keep it limited to the smallest possible surface area.

## What This Spike Does Not Yet Model

- full podcast episode migration
- full events integration
- forms replacement
- a fully normalized speaker collection
- a fully normalized episode collection
- every page type on the site

## Suggested Initial Entries

### `pages/our-story.md`

Should include:

- title
- slug `our-story`
- optional hero image if needed
- body copied/adapted from the live `Our Story` page

### `series/the-good-book.md`

Should include:

- title
- slug `the-good-book`
- description
- featured image
- external subscription links if retained in the spike

### `series/advent-2025.md`

Should include:

- title
- slug `advent-2025`
- description and image
- enough data to confirm schema consistency across more than one series

### `site/homepage.md`

Should include:

- title
- hero title/subtitle
- hero image if used
- body content representing the homepage’s editable narrative sections

## Success Test For The Model

This model is good enough for the spike if:

- it can express the chosen seed set without awkward schema workarounds
- it remains understandable as plain Markdown plus flat frontmatter
- it does not require the homepage to become a special-case tangle
- it feels like something an Obsidian-based editor could plausibly maintain
