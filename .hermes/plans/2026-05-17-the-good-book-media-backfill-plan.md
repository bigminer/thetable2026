# The Good Book Media Backfill Implementation Plan

> **For Hermes:** Implement this plan task-by-task, starting with one series only.

**Goal:** Backfill and automate weekly sermon video + podcast ingestion for **one series only**: `The Good Book: Fresh Insights Into an Ancient Text`.

**Architecture:** Use the existing dry-run-safe automation scaffold in `site/scripts/automation.config.json` and `site/scripts/automation-dry-run.ts` as the source of truth for inputs and operator reporting. Add a focused ingestion script that pulls from the canonical YouTube uploads RSS feed and podcast RSS feed, filters to the single target series, matches video + episode pairs by week/date/title, and writes draft message Markdown files only when a missing week is confirmed. Keep the first pass intentionally narrow: one series, one backfill window, no auto-publish.

**Tech Stack:** Astro content collections, Node/TypeScript (`tsx`), YouTube uploads RSS + podcast RSS parsing, Markdown frontmatter in `site/src/content/messages/`, Hermes kanban for task tracking.

---

## Scope for the first pass

Target series:
- `site/src/content/series/the-good-book.md`
- Series slug: `the-good-book`

Known source URLs:
- YouTube channel: `https://www.youtube.com/channel/UC4C3HWTMx34ec7QJ5hkhtwg`
- Podcast RSS: `https://anchor.fm/s/1067c248/podcast/rss`

This first pass must **not** attempt the rest of the site-wide catalog. It should only process messages that belong to `the-good-book`.

---

## Task 1: Lock the one-series scope into the config and dry-run report

**Objective:** Make the automation config and dry-run output explicitly say that the first pass targets only `the-good-book`.

**Files:**
- Modify: `site/scripts/automation.config.json`
- Modify: `site/scripts/automation-dry-run.ts`

**Work:**
1. Add a series-scoping field to the config, such as `seriesScope: "the-good-book"` or equivalent.
2. Make the dry-run script print the active series scope.
3. Make the missing-source summary still work when the scope is limited to one series.

**Verification:**
- Run: `npm run automation:dry-run`
- Expected: output shows both source URLs and the active series scope `the-good-book`.

---

## Task 2: Add a focused ingestion script for one series

**Objective:** Create the script that performs podcast RSS parsing and YouTube discovery for the target series only.

**Files:**
- Create: `site/scripts/ingest-new-media.ts`
- Modify: `site/package.json`

**Work:**
1. Add a new npm script, for example `automation:ingest-one-series`, that runs the new ingestion script.
2. In the ingestion script, load `automation.config.json`.
3. Read the `the-good-book` series scope.
4. Fetch and parse the podcast RSS feed.
5. Fetch and normalize YouTube discovery results.
6. Filter both source streams to items that belong to the target series window.

**Verification:**
- Run: `npm run automation:ingest-one-series -- --dry-run`
- Expected: script prints normalized podcast and YouTube items for the target series only.

---

## Task 3: Implement matching + duplicate detection for the target series

**Objective:** Match the weekly podcast and YouTube items and detect whether a message already exists.

**Files:**
- Modify: `site/scripts/ingest-new-media.ts`
- Read: `site/src/content/messages/*.md`
- Read: `site/src/content/series/the-good-book.md`

**Work:**
1. Match items by week/date and cleaned title.
2. Generate a stable slug from date + cleaned title.
3. Search existing `site/src/content/messages/` entries for the same slug or matching source URLs.
4. Skip anything already present.
5. Report ambiguous weeks instead of guessing.

**Verification:**
- Run the ingest script twice in dry-run mode.
- Expected: the second run reports no duplicate work.

---

## Task 4: Write draft message files only

**Objective:** Write new Markdown content files for confirmed missing weeks in draft state.

**Files:**
- Modify: `site/scripts/ingest-new-media.ts`
- Create or modify: `site/src/content/messages/*.md`

**Work:**
1. Generate Markdown frontmatter that matches the existing message shape.
2. Set `draft: true` for every generated file.
3. Preserve any existing human-edited content by refusing to overwrite it.
4. Include `series: the-good-book` and the matched `sourceUrl` / `podcastUrl` when known.

**Verification:**
- Run the script once in write mode for the approved backfill window.
- Expected: only new draft files are created, and no existing message file is overwritten.

---

## Task 5: Add a backfill report for the missing week range

**Objective:** Show the missing weekly range before any writing happens.

**Files:**
- Modify: `site/scripts/ingest-new-media.ts`
- Optionally modify: `site/scripts/automation-dry-run.ts`

**Work:**
1. Detect the latest published message for `the-good-book`.
2. Compare that with current source data.
3. Print the missing weeks as a backfill plan.
4. Make the script exit cleanly when nothing is missing.

**Verification:**
- Run: `npm run automation:ingest-one-series -- --dry-run`
- Expected: the script prints a clear gap report for `the-good-book`.

---

## Task 6: Wire in safety checks and documentation

**Objective:** Make the first pass safe for review and easy to correct.

**Files:**
- Modify: `site/src/content/_GUIDE.md`
- Modify: `site/editor-templates/message-template.md` if needed
- Modify: `site/README.md` or a nearby automation note if needed

**Work:**
1. Document that the first automation pass is limited to one series.
2. State that dry-run mode is the default until review is complete.
3. Note where the source URLs live and how to change the series scope later.

**Verification:**
- Read the updated docs and confirm they clearly say the first pass is only for `the-good-book`.

---

## Suggested execution order

1. Update config + dry-run report.
2. Build the one-series ingest script.
3. Add matching and duplicate detection.
4. Add draft file writing.
5. Add backfill gap reporting.
6. Document the one-series constraint.

---

## Done means

- The pipeline runs only for `the-good-book`.
- Dry-run output is clear and safe.
- Missing weeks are enumerated before writing.
- Draft files are created only for confirmed gaps.
- Running the process twice does not create duplicates.

---

## Notes

- Do **not** broaden this to all series yet.
- Do **not** publish anything automatically.
- Keep manual review in the loop until the first series looks correct.
