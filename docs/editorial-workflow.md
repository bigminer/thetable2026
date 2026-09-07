# Editorial Workflow

## Purpose

Describe how content on this site is edited now that the Obsidian + Vault CMS layer has been removed. There is no CMS, no admin UI, and no database. Everything is files in this repository.

## Where Content Lives

| What | Where | Who edits it |
| --- | --- | --- |
| Page copy (all public pages) | `src/pages/<route>.astro` | maintainer, in the editor |
| Navigation menu | `src/config/navigation.ts` | maintainer |
| Address, service time, podcast and social links | `src/config/site.ts` | maintainer |
| Sermon series | `src/content/series/*.md` | maintainer, partly script-generated |
| Individual messages | `src/content/messages/*.md` | maintainer, partly script-generated |
| Page and series media | `public/attachments/...` | maintainer |
| Curated photography | `public/images/scrapbook/...` | maintainer |

Static page copy is deliberately not in Markdown. These pages change a few times a year, and one Markdown file per page bought an indirection layer without buying an editor. If a page needs to become editable by a non-developer later, that is a scoped decision, not a default.

## Changing a Page

1. Open the matching file in `src/pages`. Routes map to filenames: `/our-story/` is `src/pages/our-story.astro`.
2. Edit the copy inside the component.
3. Run `npm run dev -- --host 127.0.0.1` and check the page.
4. Commit.

Do not copy shared facts into a page. Address, service time, podcast links, and social links come from `src/config/site.ts`; the header and footer come from `src/components`.

## Adding a Series or Message

Series and messages are Astro content collections validated by `src/content.config.ts`.

A series file, `src/content/series/<slug>.md`:

```yaml
---
title: The Good Book
description: A series on how we read scripture.
featuredImage: attachments/series/the-good-book/cover.jpg
featuredImageAlt: Series artwork
startDate: 2025-09-07
draft: false
---
```

A message file, `src/content/messages/<slug>.md`:

```yaml
---
title: How Did Jesus Interpret Scripture?
series: the-good-book
date: 2025-09-14
speaker: Jesse Watts
sourceUrl: https://www.youtube.com/watch?v=...
draft: false
---
```

Rules the schema enforces:

- every published (non-draft) message must reference an existing series
- `date` is required on messages; series dates are optional
- `draft: true` hides an entry from every route and from the podcast feed

Slugs come from the filename unless a `slug` field overrides it. Prefer the filename.

Some of these files are produced by the ingest scripts (see below) as drafts; the editorial step is reviewing the generated title, description, and series link, then flipping `draft` to `false`.

## Media

Two directories, two different purposes:

- `public/attachments/` — media referenced by pages and series, served at `/attachments/...`. Frontmatter may use the short `attachments/...` form; `resolveAsset()` in `src/lib/content.ts` adds the prefix.
- `public/images/scrapbook/` — curated photography, resized to a 1600px long edge with EXIF stripped, committed to the repo.

Full-resolution originals live in `public/attachments/scrapbook/`, which is git-ignored. Keep them locally or in cloud storage; they run around 700MB and must not enter git history. To promote one:

```bash
ffmpeg -i "public/attachments/scrapbook/<original>.jpg" \
  -vf "scale='if(gt(iw,ih),min(1600,iw),-2)':'if(gt(iw,ih),-2,min(1600,ih))'" \
  -q:v 4 -map_metadata -1 \
  "public/images/scrapbook/<descriptive-name>.jpg"
```

Name the output for what it shows (`communion-serving.jpg`), not for the camera's filename. Always give an `alt` when placing it in a page.

## Transcript and Media Automation

`scripts/` holds the pipeline that keeps the sermon archive and the `/ask` chatbot fed:

| Command | Does |
| --- | --- |
| `npm run fetch` | pulls new YouTube captions into `data/transcripts/raw/` |
| `npm run transcribe` | transcribes anything missing captions |
| `npm run make-stubs` | writes draft message files from transcripts |
| `npm run enrich-titles` | improves generated titles |
| `npm run make-descriptions` | generates descriptions |
| `npm run automation:dry-run` | previews the whole chain without writing |
| `npm run automation:ingest-one-series` | scoped ingest, see `SCHEDULER.md` |

Generated content always lands as `draft: true`. Nothing reaches the public site without a human flipping that flag.

## Publishing

1. Work on a branch.
2. `npm test && npm run build && npm run test:smoke` locally.
3. Open a PR. CI (`.github/workflows/verify.yml`) runs the same three checks.
4. Merge to `main`. Render builds from `render.yaml` and deploys.

There is no separate demo branch and no GitHub Pages target; both were removed with the CMS layer.

## What Not To Do

- Do not reintroduce a `pages` content collection or a catch-all `[...slug].astro` route without an explicit decision. That layer was removed on purpose.
- Do not commit full-resolution photos or raw video.
- Do not hardcode the address, service time, or social links into a page.
- Do not treat a green `npm run build` as proof a change is right; look at the page.
