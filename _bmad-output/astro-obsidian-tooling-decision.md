# Astro + Obsidian Tooling Decision

## Purpose

Capture the recommended tooling and content architecture for the `thetabletx.com` migration spike before implementation begins.

This memo reflects:

- the live-site inventory and seed set already captured for the spike
- earlier migration planning work in this repo
- Astro-specific guidance validated against current Astro documentation

## Decision Summary

Use the following stack for the spike:

- site framework: Astro
- migration source: WordPress REST API and exported site assets
- long-term content model: local Astro content collections
- editor workflow candidate: Obsidian + Vault CMS
- authoring format: Markdown by default
- enhanced authoring format: MDX only when a page truly needs embedded components
- image strategy: Astro content collection images and Astro asset handling

## Why This Is The Best Fit

Astro’s current guidance makes content collections the default best fit for structured, content-heavy sites. Build-time collections are especially recommended when content is relatively static and when the site benefits from prerendering, MDX support, and image optimization.

That matches this project well:

- the site is content-driven
- most content is not real-time data
- performance matters
- image handling matters
- the editorial workflow should stay close to working in documents

This also aligns with the desired end state of managing content in Obsidian rather than keeping WordPress as the long-term CMS.

## Recommended Tooling

### Core Stack

- Astro
- Astro content collections
- Astro image handling
- WordPress REST API for migration extraction
- Vault CMS for Obsidian-backed editing

### Supporting Editorial Tools

- Obsidian Properties for structured frontmatter-like fields
- Obsidian Templates for repeatable page and series creation
- Obsidian Bases if editors need table-like views over collections

### Optional Tools

- `@astrojs/mdx` only if needed for a small number of richer pages

## Recommended Content Architecture

### Pages

Model regular content pages as a content collection.

Suggested direction:

- one Markdown file per page
- typed schema with flat fields
- body content written in Markdown
- route generation from the collection

Likely fields:

- `title`
- `description`
- `slug`
- `navTitle` optional
- `heroImage` optional
- `heroAlt` optional

### Series

Model `series` as a content collection.

This is the clearest fit for Astro collections because entries share a common shape and should be rendered through a repeatable template.

Suggested direction:

- one Markdown file per series
- flat schema matching the live site as closely as practical
- body content used for descriptive intro text
- route generation from the collection

Likely fields:

- `title`
- `description`
- `slug`
- `featuredImage`
- `featuredImageAlt`
- `speaker` optional
- `dateRange` optional
- `podcastLinks` optional if needed for the spike

### Homepage

Treat the homepage as the spike’s hardest editorial-model test.

The homepage should be content-driven, but it should not become a giant deeply nested frontmatter object. For the spike, prefer one of these:

- a singleton collection entry
- a structured data file plus Markdown content sections

If the homepage only works when represented as a deeply nested schema or a highly custom data structure, that is evidence against the simplicity of the Obsidian + Vault CMS workflow.

## Markdown vs MDX

Use Markdown as the default format.

Reasons:

- better fit for Obsidian and document-like editing
- simpler mental model for non-technical staff
- less risk of turning content editing into code editing

Use MDX only when a page truly needs:

- embedded custom components
- richer layout control inside body content
- image/component patterns that standard Markdown cannot support cleanly

MDX should be the exception, not the default.

## Images

Astro’s current docs make image handling stronger than a plain Markdown setup would suggest.

Recommended approach:

- keep local images near content where practical
- use Astro content collection schema validation for associated images
- use Astro asset handling for optimized rendering
- avoid an ad hoc media process that depends on editors manually guessing file paths

This area still needs spike validation because image workflow is one of the most likely sources of editor friction.

## Routing Direction

Use collection-driven dynamic routes.

Examples:

- `src/pages/series/[slug].astro`
- page route strategy based on page collection slugs

For a static build, Astro expects routes to be generated from collection entries using `getStaticPaths()`.

## What Not To Use As The Default

### Headless WordPress As The Long-Term CMS

Do not use WordPress as the long-term editing system unless the Obsidian workflow fails. WordPress should be treated as the migration source, not the preferred destination architecture.

### Live Content Collections

Do not use live collections as the default content approach for this project.

They are better suited to real-time or frequently changing remote data. They also lose some of the advantages that matter here, including MDX and image optimization.

### MDX Everywhere

Do not default the whole site to MDX. That would make editing more code-like and less document-like than needed.

## Fallback If Obsidian Proves Too Fragile

If the spike shows that Obsidian + Vault CMS is too brittle or too technical for real editors, the best fallback is CloudCannon.

Why CloudCannon is the best fallback:

- Astro officially documents it as a CMS path
- it works well with Git-backed Astro content
- it supports structured content editing and visual editing
- it offers a friendlier editor experience for non-technical users than a file-oriented Markdown workflow

Fallback rule:

- stay with Vault CMS if editors can comfortably manage the proof set
- move to CloudCannon if the content model is sound but the editor experience is too fragile

## Implications For The Spike

The spike should validate all of the following:

- Astro content collections can model `pages`, `series`, and homepage content cleanly
- Vault CMS and Obsidian can edit the chosen proof set without exposing unnecessary complexity
- image handling is workable for editors
- the homepage can be modeled without an obviously brittle special-case system
- Markdown remains the default authoring mode for most of the site

## Current Recommendation

Proceed with:

- Astro
- build-time content collections
- Markdown-first authoring
- MDX only where justified
- Vault CMS + Obsidian as the primary editorial candidate
- CloudCannon as the fallback if the editorial workflow fails

## Sources

- Astro content collections: `https://docs.astro.build/en/guides/content-collections/`
- Astro images: `https://docs.astro.build/en/guides/images/`
- Astro MDX: `https://docs.astro.build/en/guides/integrations-guide/mdx/`
- Astro WordPress migration: `https://docs.astro.build/en/guides/migrate-to-astro/from-wordpress/`
- Astro Vault CMS guide: `https://docs.astro.build/en/guides/cms/vault-cms/`
- Astro CloudCannon guide: `https://docs.astro.build/en/guides/cms/cloudcannon/`
