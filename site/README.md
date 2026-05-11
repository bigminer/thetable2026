# The Table Astro Spike

This folder contains the Astro + Markdown + content-collections spike for evaluating whether `thetabletx.com` can move from WordPress to an Astro workflow that remains believable for Obsidian and Vault CMS editing.

## Current Proof Targets

- homepage: `/`
- representative page: `/our-story/`
- series index: `/series/`
- series detail examples:
  - `/series/the-good-book/`
  - `/series/advent-2025/`

## Commands

Run these from [/Users/gary/Dev/table-cms-vault/site](/Users/gary/Dev/table-cms-vault/site:1):

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server for same-machine testing |
| `npm run dev:tailscale` | Start the dev server bound to this machine's Tailscale IPv4 address for remote access over Tailnet |
| `PORT=4322 npm run dev:tailscale` | Same as above, but on a custom port |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build locally |

Ask page answer composition uses the local OpenAI-compatible LLM by default:

```text
ASK_LLM_BASE_URL=http://127.0.0.1:8080/v1
ASK_LLM_MODEL=Qwen3-8B-Q4_K_M.gguf
```

`OPENAI_API_KEY` is optional. If it is set, Ask uses OpenAI embeddings for semantic retrieval. If it is missing, Ask falls back to local keyword retrieval over the transcript archive, then still composes the final answer with the local LLM.

## Content Locations

The spike currently uses Astro content collections from:

```text
src/content/
  pages/
  series/
  site/
```

Important entries:

- [src/content/site/homepage.md](/Users/gary/Dev/table-cms-vault/site/src/content/site/homepage.md:1)
- [src/content/pages/our-story.md](/Users/gary/Dev/table-cms-vault/site/src/content/pages/our-story.md:1)
- [src/content/series/the-good-book.md](/Users/gary/Dev/table-cms-vault/site/src/content/series/the-good-book.md:1)
- [src/content/series/advent-2025.md](/Users/gary/Dev/table-cms-vault/site/src/content/series/advent-2025.md:1)

## Editorial Workflow

See the repo guide at [docs/editorial-workflow.md](/Users/gary/Dev/table-cms-vault/site/docs/editorial-workflow.md:1) for:

- how content is organized
- how this should map to an Obsidian + Vault CMS workflow
- editing conventions for pages, series, and the homepage
- template files for new content

## Vault CMS Status

Vault CMS is now installed into:

- [src/content/.obsidian](/Users/gary/Dev/table-cms-vault/site/src/content/.obsidian:1)
- [src/content/_bases/Home.base](/Users/gary/Dev/table-cms-vault/site/src/content/_bases/Home.base:1)
- [src/content/_GUIDE.md](/Users/gary/Dev/table-cms-vault/site/src/content/_GUIDE.md:1)

To test the editorial workflow locally:

1. Open `/Users/gary/Dev/table-cms-vault/site/src/content` as an Obsidian vault.
2. Run `Vault CMS: Open Wizard`.
3. Review the `pages`, `series`, and `site` content groups against the current spike content.

## Templates

Reference templates live in:

- [editor-templates/page-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/page-template.md:1)
- [editor-templates/series-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/series-template.md:1)
- [editor-templates/homepage-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/homepage-template.md:1)

These are not wired into Astro Composer automatically yet. They still exist as a reference for shaping future content-type presets.
