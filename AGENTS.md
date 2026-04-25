# Agent Guide

## Project Goal

This project is migrating `thetabletx.com` from WordPress to Astro without losing the current site's public experience.

The goal is not simply to produce an Astro rebuild. The goal is to create an Astro site that:

- preserves the live site's navigation, routes, visual identity, layout feel, footer behavior, and mobile behavior
- uses Markdown content collections as the long-term content model
- supports non-technical editing through Obsidian plus Vault CMS
- keeps WordPress as a migration source, not a long-term runtime dependency
- moves launch-critical media into project-owned assets instead of depending on old WordPress URLs
- documents intentional external dependencies such as Church Center, social links, YouTube embeds, events, and form flows

The current work is in migration execution and parity review. The main question for future iterations is: "Does this Astro/Vault CMS version feel and behave like the current site while staying editable by real staff?"

## Framework In Use

The chosen framework is the Vault CMS workflow for Astro:

- Astro builds the public website.
- Astro content collections define the content model.
- Markdown files in `site/src/content` hold editable content.
- Obsidian opens `site/src/content` as the vault.
- Vault CMS configures Obsidian with a dashboard, plugins, templates, and setup wizard.
- Git remains the version-control and publishing path.
- There is no separate CMS server or database.

Official docs:

- Vault CMS introduction: https://docs.vaultcms.org/guides/introduction/
- How it works: https://docs.vaultcms.org/concepts/how-it-works/
- Content types: https://docs.vaultcms.org/concepts/content-types/
- Publishing: https://docs.vaultcms.org/concepts/publishing/
- Images: https://docs.vaultcms.org/guides/images/
- Astro CMS guide: https://docs.astro.build/en/guides/cms/vault-cms/

## Current Vault CMS Shape

Vault root:

```text
site/src/content
```

Vault CMS installed files live under:

```text
site/src/content/.obsidian/
site/src/content/_bases/Home.base
site/src/content/_GUIDE.md
```

Current Astro content collections:

```text
site/src/content/pages/
site/src/content/series/
site/src/content/site/
```

Current schema:

```text
site/src/content.config.ts
```

Current editorial workflow guide:

```text
site/docs/editorial-workflow.md
```

Current migration/parity state:

```text
_bmad-output/astro-parity-progress-log.md
```

## Vault CMS Design Rules

When changing the content model, optimize for editor comfort in Obsidian, not just developer convenience.

Prefer:

- Markdown body content for normal page copy
- flat frontmatter fields where possible
- clear field names such as `title`, `description`, `heroImage`, `heroImageAlt`, `draft`
- optional fields omitted entirely when unused
- `draft: true` for new content until it is ready
- filename-derived routes unless a custom `slug` is truly needed
- project-owned media paths such as `/images/...` and `/video/...`

Avoid:

- deeply nested YAML unless the content shape clearly requires it
- page-builder-style frontmatter for ordinary pages
- blank optional fields that may parse as `null`
- hardcoding content into route templates when it should be editable
- adding schema fields without updating the Obsidian/Vault CMS authoring path
- treating a successful Astro build as proof that the editorial workflow is good

Vault CMS works best when content types are obvious folders under `src/content`, each with a frontmatter template and predictable route pattern. If a content type becomes hard to explain to an editor, reconsider the model.

## Keep These Files In Sync

Whenever a content model changes, update these together:

1. `site/src/content.config.ts`
2. `site/src/content/.obsidian/plugins/astro-composer/data.json`
3. `site/src/content/_bases/Home.base`
4. `site/src/content/_GUIDE.md`
5. `site/docs/editorial-workflow.md`
6. relevant files in `site/editor-templates/`

This prevents the project from drifting into "developer-only Astro with some Markdown nearby."

## Current Alignment Assessment

The setup is well aligned with Vault CMS because:

- `site/src/content` is the Obsidian vault root
- Vault CMS files are installed inside the content folder
- content lives in Astro collections
- `pages`, `series`, and `site` are visible content groups
- drafts are filtered from Astro routes with `!data.draft`
- the site builds successfully from Markdown content

The main areas to strengthen are:

- keep Vault CMS plugin templates aligned with the current Astro schema
- keep homepage structure from becoming too complex for editors
- define the final editor-friendly media workflow
- make the `site/homepage.md` editing path feel like a special homepage workflow, not a generic content item
- ensure personal Obsidian workspace state is ignored rather than committed

## Migration Priorities

Near-term priority is parity review, not broad schema expansion.

Recommended order:

1. Run a full desktop and mobile parity sweep for all menu-reachable pages.
2. Compare local Astro pages against the live WordPress site.
3. Record missing content, visual drift, mobile issues, footer/nav gaps, and old WordPress link escapes.
4. Patch highest-visibility routes first: homepage, navigation, footer, `new-here`, `our-story`, `our-vision`, `leadership`, `series`, and podcast detail pages.
5. Keep checking that every change remains editable through the Vault CMS workflow.

## Build And Verification

Run from:

```bash
cd /Users/gary/Dev/table-cms-vault/site
```

Useful commands:

```bash
npm run build
npm run dev -- --host 127.0.0.1
npm run preview
```

Do not rely only on `npm run build` for migration acceptance. Also verify important routes in a browser, especially after content or route changes. If the dev server shows a stale `404` for a page that builds successfully, restart the dev server.

## External Dependencies

Some destinations are intentionally external and should not be converted into broken local routes:

- Giving / Church Center
- social links
- YouTube embeds
- Church Center MeetUp interest forms
- future events and form integrations unless explicitly migrated

Document intentional external behavior so parity reviews do not treat it as a regression.

## Agent Operating Principle

Every implementation decision should satisfy both sides of the project:

1. The public Astro site should preserve the current live site's user experience.
2. The source content should remain understandable and maintainable inside Obsidian plus Vault CMS.

If those goals conflict, pause and make the tradeoff explicit before adding complexity.
