# YouTube Live + Podcast Automation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Automatically add The Table's newly available YouTube live videos and podcast episodes to the Astro/Vault CMS website with safe review gates.

**Architecture:** Build a small ingestion pipeline around the existing transcript scripts. Poll YouTube and the podcast RSS/feed on a schedule, normalize discoveries into message candidates, generate Markdown in `site/src/content/messages/`, and open a reviewable Git change rather than silently publishing uncertain content. Publish automatically only when required fields are confidently known.

**Tech Stack:** Astro content collections, Markdown content in `site/src/content/messages`, Node/TypeScript scripts via `tsx`, `yt-dlp`, podcast RSS parsing, Git/GitHub Actions or Hermes cron, optional local LLM for summaries/title cleanup.

---

## Current repo facts

Existing content model:
- Message files live in `site/src/content/messages/*.md`.
- Published messages require `series` in `site/src/content.config.ts`.
- Message frontmatter currently supports:
  - `title`
  - `series`
  - `date`
  - `speaker`
  - `slug`
  - `sourceUrl`
  - `podcastUrl`
  - `draft`

Existing scripts:
- `npm run fetch`
  - uses `yt-dlp`
  - pulls YouTube auto captions and `info.json`
  - writes to `site/scripts/transcripts/raw/`
  - maintains archive indirectly through `make-stubs`
- `npm run make-stubs`
  - creates transcript-review stubs in `site/scripts/transcripts/content/`
- `npm run transcribe`
  - OpenAI Whisper fallback for missing captions
- `npm run enrich-titles`
- `npm run detect-bounds`
- `npm run make-descriptions`

Current gap:
- The transcript pipeline supports the Ask/archive system, but does not yet create public website message files in `src/content/messages`.
- Podcast URLs are manually attached as `podcastUrl`.
- Series assignment is required for publication but cannot always be inferred safely.

---

## Proposed workflow

### Phase 1: Safe semi-automation

1. Poll YouTube for new live videos.
2. Poll podcast feed for new audio episodes.
3. Match YouTube and podcast items by date/title similarity.
4. Create or update a message Markdown file in `src/content/messages`.
5. If series is unknown, write `draft: true` and a clear review note.
6. If all required fields are known, allow publication with `draft: false`.
7. Run `npm run build`.
8. Commit changes on a branch and open a PR, or create a local review branch.

### Phase 2: Better automation

1. Add a small config file for source URLs and default behavior.
2. Add idempotent state so repeated runs do not duplicate content.
3. Add local LLM cleanup for title/description suggestions.
4. Add optional notification when a new draft needs review.
5. Add scheduled execution through Hermes cron or GitHub Actions.

### Phase 3: Full publishing confidence

Only after several successful runs:
- Auto-publish if date, sourceUrl, podcastUrl, title, and series are confidently matched.
- Keep uncertain items as drafts.
- Notify humans for series changes or title ambiguity.

---

## Decisions needed

1. YouTube source
   - The exact channel URL, playlist URL, or `/streams` URL to poll.
   - Current `npm run fetch` expects a URL argument but does not bake one into package.json.

2. Podcast source
   - Prefer RSS feed URL over scraping Spotify.
   - Needed fields: episode title, publish date, canonical audio URL or platform URL.

3. Publication rule
   - Should new messages default to `draft: true` until reviewed?
   - Recommended: yes at first.

4. Series assignment
   - Source of truth options:
     - infer from title prefix
     - current active series config
     - always require review
   - Recommended: use a small `automation.config.json` with `defaultSeries` plus explicit title patterns.

5. Deployment trigger
   - If the site publishes from Git, the automation should commit/push a branch or main depending on confidence.
   - Recommended: PR/review branch first.

---

## Target file additions

### Create: `site/scripts/automation.config.json`

Purpose: keep source URLs and matching rules out of code.

Suggested shape:

```json
{
  "youtube": {
    "sourceUrl": "TODO: channel streams or playlist URL",
    "excludeTitleContains": ["📱"],
    "defaultSpeaker": "Brett Tilford"
  },
  "podcast": {
    "feedUrl": "TODO: podcast RSS feed URL"
  },
  "messages": {
    "defaultDraft": true,
    "defaultSeries": "TODO: series-slug-or-null",
    "seriesTitlePatterns": []
  }
}
```

### Create: `site/scripts/ingest-new-media.ts`

Purpose: one command that discovers new YouTube/podcast items and writes public message Markdown.

Responsibilities:
- Load config.
- Run/discover new YouTube items using `yt-dlp --dump-json` or current raw `info.json` files.
- Fetch podcast RSS.
- Match by date/title.
- Generate slug safely.
- Avoid overwriting manually edited files unless only filling a missing `podcastUrl`.
- Write new files under `site/src/content/messages/`.
- Print a summary.

### Modify: `site/package.json`

Add:

```json
"ingest-media": "node --env-file-if-exists=.env --import tsx scripts/ingest-new-media.ts"
```

### Optional create: `site/scripts/media-ingest-state.json`

Purpose: cache seen YouTube IDs and podcast GUIDs if relying on feeds that change ordering. This should be committed only if we want repo-visible state; otherwise keep it generated and ignored.

---

## Message file output format

For confident published item:

```md
---
title: "Message Title"
series: "[Series Title](../series/series-slug.md)"
date: 2026-05-10
speaker: "Brett Tilford"
sourceUrl: https://www.youtube.com/watch?v=VIDEO_ID
podcastUrl: https://...
draft: false
---
```

For uncertain item:

```md
---
title: "Message Title"
date: 2026-05-10
speaker: "Brett Tilford"
sourceUrl: https://www.youtube.com/watch?v=VIDEO_ID
podcastUrl: https://...
draft: true
---

<!-- Automation review needed:
- Add `series` before publishing.
- Confirm title and speaker.
-->
```

This respects the current schema because drafts may omit `series`.

---

## Implementation tasks

### Task 1: Add automation config skeleton

**Objective:** Add a config file with source URLs and safe defaults.

**Files:**
- Create: `site/scripts/automation.config.json`

**Steps:**
1. Create the JSON config with TODO source URLs.
2. Set `messages.defaultDraft` to `true`.
3. Run `node -e "JSON.parse(require('fs').readFileSync('scripts/automation.config.json','utf8')); console.log('ok')"` from `site/`.
4. Commit after validation.

### Task 2: Add RSS/feed parsing dependency or implement minimal parser

**Objective:** Parse podcast feed items.

**Files:**
- Modify: `site/package.json`
- Modify: `site/package-lock.json`
- Create or modify: `site/scripts/ingest-new-media.ts`

**Recommendation:** Use a small dependency such as `fast-xml-parser` unless dependency count is a concern.

**Verification:**
- Given a feed URL, script prints latest 5 items with title/date/link/guid.

### Task 3: Implement YouTube discovery wrapper

**Objective:** Discover recent videos without duplicating already-known messages.

**Files:**
- Create/modify: `site/scripts/ingest-new-media.ts`

**Approach:**
- Use `yt-dlp --dump-json --flat-playlist <sourceUrl>` for discovery.
- For each candidate, normalize:
  - `youtubeId`
  - `title`
  - `uploadDate`
  - `sourceUrl`
- Ignore titles containing configured excludes.

**Verification:**
- Script prints recent YouTube items and exits without writing when run with `--dry-run`.

### Task 4: Build message matching and slug generation

**Objective:** Convert discoveries into stable target Markdown paths.

**Files:**
- Modify: `site/scripts/ingest-new-media.ts`

**Rules:**
- Prefer date + cleaned title slug.
- If title is generic like `The Table Live`, include YouTube ID in slug.
- Check existing `src/content/messages/*.md` for matching `sourceUrl` or `podcastUrl` before creating.

**Verification:**
- Dry run prints `create`, `update`, or `skip existing` for each item.

### Task 5: Write draft message files

**Objective:** Create public message Markdown safely.

**Files:**
- Modify: `site/scripts/ingest-new-media.ts`
- Create: new `site/src/content/messages/*.md` only when new media exists

**Rules:**
- Default `draft: true`.
- Add `series` only if config confidently provides it.
- Fill `sourceUrl` and `podcastUrl` when available.
- Never overwrite existing title/series/date/speaker.
- Updating existing files may only fill missing `podcastUrl` or `sourceUrl`.

**Verification:**
- `npm run build` passes.

### Task 6: Add package script

**Objective:** Make ingestion runnable by one command.

**Files:**
- Modify: `site/package.json`

Add:

```json
"ingest-media": "node --env-file-if-exists=.env --import tsx scripts/ingest-new-media.ts"
```

**Verification:**
- `npm run ingest-media -- --dry-run` works.

### Task 7: Add scheduled runner

**Objective:** Run ingestion automatically after YouTube/podcast availability windows.

**Options:**
- Hermes cron on Bob
- GitHub Actions scheduled workflow
- Server systemd timer

**Recommendation:** Hermes cron first while still iterating. GitHub Actions later when stable.

**Schedule:**
- Sundays after service upload window, e.g. hourly Sunday afternoon/evening.
- Daily catch-up once per morning.

**Verification:**
- Run once manually.
- Confirm it creates no duplicates.
- Confirm it reports no-op cleanly.

---

## Acceptance criteria

- A new YouTube live video can be discovered without manual URL entry.
- A new podcast episode can be discovered from the feed.
- Matching video/audio becomes one message file, not two duplicates.
- Missing series results in `draft: true`, not a broken build.
- Existing hand-edited message files are not overwritten.
- `npm run build` passes after ingestion.
- The automation is idempotent: running it twice produces no second copy.

---

## Recommended first slice

Do not start with full autopublish.

Start with:

```bash
npm run ingest-media -- --dry-run
npm run ingest-media
npm run build
```

The first implementation should create drafts only. Once we trust matching and naming, we can add a config rule to publish confidently matched items.
