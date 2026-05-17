# The Table Astro Spike

This folder contains the Astro + Markdown + content-collections spike for evaluating whether `thetabletx.org` can move from WordPress to an Astro workflow that remains believable for Obsidian and Vault CMS editing.

## Current Proof Targets

- homepage: `/`
- representative page: `/our-story/`
- series index: `/series/`
- series detail examples:
  - `/series/the-good-book/`
  - `/series/advent-2025/`

## Commands

Run these from the `site/` directory:

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server for same-machine testing |
| `npm run dev:tailscale` | Start the dev server bound to this machine's Tailscale IPv4 address for remote access over Tailnet |
| `PORT=4322 npm run dev:tailscale` | Same as above, but on a custom port |
| `npm run build` | Build the production server app into `dist/` |
| `npm run build:gh-pages` | Build the static GitHub Pages demo with `site: https://bigminer.github.io` and `base: /thetable2026` |
| `npm run preview` | Preview the production build locally |
| `npm run automation:dry-run` | Print the weekly media ingestion config summary and missing source URLs |
| `npm run automation:ingest-one-series` | Fetch the scoped YouTube + podcast feeds, pair items for `the-good-book`, and print the backfill report without writing files |

The GitHub Pages build is static-only. It prerenders `/ask/` as a demo page with the source list and a notice that live Ask answers require the production server build; GitHub Pages cannot run `/api/ask/` server routes or use secret LLM/API credentials.

## Bounded media automation

The first automation pass is intentionally narrow:

- scope: `the-good-book` only
- source of truth: `scripts/automation.config.json`
- default behavior: dry-run only
- write guard: writes stay blocked until both `defaults.writeContentFiles` is intentionally flipped **and** the operator runs `npm run automation:ingest-one-series -- --write`

The ingestion script uses the podcast RSS feed plus the YouTube uploads RSS feed in this environment. That choice is deliberate because `yt-dlp` is not installed here, and the live YouTube uploads RSS feed is too shallow for historical 2025 backfill by itself. For that reason the scoped ingest command also uses the repo transcript archive (`scripts/transcripts/content`) as a bounded historical fallback for `the-good-book` only. If you later broaden the workflow, update `seriesScope` and source settings in `scripts/automation.config.json` first.

## Demo / production split

The approval workflow uses two deployment paths:

- `demo` branch: preview branch for GitHub Pages review using `npm run build:gh-pages`
- `main` branch: production branch using `npm run build`
- `master`, if it exists in a future fork, should be treated the same as `main`

Deployment config is already separated in the repo:

- `site/astro.config.gh-pages.mjs` = static GitHub Pages config with the `/thetable2026` base path
- `site/astro.config.mjs` = production server config for the live site

That split keeps the demo site isolated from the production deploy path while still letting editors review the same content before promotion.

Ask page answer composition uses the local OpenAI-compatible LLM by default:

```text
ASK_LLM_BASE_URL=http://127.0.0.1:8080/v1
ASK_LLM_MODEL=Qwen3-8B-Q4_K_M.gguf
```

Assumptions:

- `ASK_LLM_BASE_URL` must point at an OpenAI-compatible server exposing `/v1/chat/completions`
- the default local server is `http://127.0.0.1:8080/v1`
- if the local LLM is unreachable or times out, Ask returns a friendly fallback instead of failing the request

`OPENAI_API_KEY` is optional. If it is set, Ask uses OpenAI embeddings for semantic retrieval. If it is missing, Ask falls back to local keyword retrieval over the transcript archive, then still composes the final answer with the local LLM.

## Analytics

Analytics are disabled by default. Configure public Google IDs at build/deploy time only when tracking should be enabled:

```text
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_GA4_ID=G-XXXXXXXXXX
```

Prefer `PUBLIC_GTM_ID` for production so GA4 and other tags can be managed in Google Tag Manager. When `PUBLIC_GTM_ID` is set, the shared layout renders the GTM head script and body `noscript` iframe. When `PUBLIC_GTM_ID` is unset and `PUBLIC_GA4_ID` is set, the layout renders direct GA4 `gtag.js` tracking instead. If neither value is set, no Google tracking tags are rendered and local development/builds continue without analytics.

## Form bot protection

The contact and newsletter forms use a lightweight free stack:

- honeypot field
- server-side basic validation
- best-effort IP-based rate limiting

No extra bot-protection service keys are required for this setup. The rate limiter is in-memory and per server process, so it is meant as a simple first-pass defense rather than distributed abuse protection.

## Content Locations

The spike currently uses Astro content collections from:

```text
src/content/
  messages/
  pages/
  series/
  site/
```

Important entries:

- [src/content/site/homepage.md](src/content/site/homepage.md:1)
- [src/content/pages/our-story.md](src/content/pages/our-story.md:1)
- [src/content/series/the-good-book.md](src/content/series/the-good-book.md:1)
- [src/content/series/advent-2025.md](src/content/series/advent-2025.md:1)

## Editorial Workflow

See the repo guide at [docs/editorial-workflow.md](docs/editorial-workflow.md:1) for:

- how content is organized
- how this should map to an Obsidian + Vault CMS workflow
- editing conventions for pages, series, and the homepage
- the demo-first promotion flow from WhatsApp intake to `demo` review to `main` production
- template files for new content

## Vault CMS Status

Vault CMS is now installed into:

- [src/content/.obsidian](src/content/.obsidian:1)
- [src/content/_bases/Home.base](src/content/_bases/Home.base:1)
- [src/content/_GUIDE.md](src/content/_GUIDE.md:1)

To test the editorial workflow locally:

1. Open `src/content` as an Obsidian vault.
2. Run `Vault CMS: Open Wizard`.
3. Review the `pages`, `series`, and `site` content groups against the current spike content.

## Templates

Reference templates live in:

- [editor-templates/page-template.md](editor-templates/page-template.md:1)
- [editor-templates/series-template.md](editor-templates/series-template.md:1)
- [editor-templates/homepage-template.md](editor-templates/homepage-template.md:1)

These are not wired into Astro Composer automatically yet. They still exist as a reference for shaping future content-type presets.
