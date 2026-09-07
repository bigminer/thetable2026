# Media Ingestion — Remaining Work

Wanted functionality, built as a scoped pilot and never unfenced. The target is that a
new YouTube video results in a pull request — the sermon in the archive, its transcript
available to `/ask` — with a human approving rather than running anything.

Not needed immediately. This records what exists and what standing it up involves.

---

## Two pipelines, not one

They share no files and are often confused for each other.

**Transcript ingestion — working.** `.github/workflows/ingest-transcripts.yml` runs
Mondays at 10:00 UTC: downloads new auto-captions with `yt-dlp`, falls back to Whisper
for videos without them, generates review stubs, enriches titles, detects sermon
bounds, writes AI descriptions, and opens a PR. Output lands in
`data/transcripts/content/` and feeds `/ask`. Nothing from it reaches the website.

**Media ingestion — fenced shut.** `.github/workflows/weekly-media-ingestion.yml` and
`scripts/ingest-new-media.ts` write Astro message files into `src/content/messages/`,
which is what appears on `/series/`. This is the dormant one.

## The four catches

Each was deliberate. All four must be released for anything to happen, and each is a
separate decision.

**1. The workflow forces dry-run.**

```yaml
AUTOMATION_DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && inputs.dry_run || 'true' }}
```

`&&`/`||` in GitHub Actions is a value selector, not boolean logic. When `inputs.dry_run`
is `false` the left side evaluates falsy, so the expression falls through to `'true'`.
Setting the input to false does the same thing as leaving it true. On a schedule the
first condition is false and it is `'true'` anyway.

**2. The workflow cannot persist anything.** `permissions: contents: read`, and there is
no commit, push, or PR step — unlike `ingest-transcripts.yml`, which has
`contents: write`, `pull-requests: write`, and a `create-pull-request` step. Even with
dry-run off, output would be discarded at the end of the run.

**3. The script refuses to write.** `ingest-new-media.ts` throws unless
`defaults.writeContentFiles` is explicitly `true`:

> `Config blocks writes: defaults.writeContentFiles must be explicitly set to true before using --write.`

`scripts/automation.config.json` currently has `writeContentFiles: false`,
`publishToSite: false`, and `runMode: "dry-run-safe"`.

**4. The scope is a finished pilot.** `seriesScope` is pinned to `the-good-book` with a
date range of **2025-09-14 to 2025-10-05**. Both configured sources have null URLs. So
the window closed long ago and the feeds were never filled in.

The schedules also disagree: the config says `0 9 * * 1`, the workflow runs
`0 20 * * 0` and `0 6 * * *`. Those crons have been firing daily since May 2026 and
doing nothing.

## What standing it up involves

- Fix the dry-run expression so the manual input is honoured (`github.event_name == 'workflow_dispatch' && inputs.dry_run == true`, or read the input directly and default in the script).
- Give the workflow `contents: write` and `pull-requests: write` plus a
  `create-pull-request` step, matching `ingest-transcripts.yml`.
- Decide the scope model. The pilot was one series over three weeks; autonomous
  ingestion means no window and no fixed series — that is a config redesign, not an
  edit.
- Fill in the source URLs, or drop the RSS source and discover from the YouTube channel
  the way `ingest-transcripts.yml` already does.
- Set `writeContentFiles: true` only once the PR gate is proven, so the first real run
  produces a reviewable diff rather than a surprise.
- Reconcile the schedules to one place.
- Decide what happens to `draft: true`. The script writes drafts; under a PR-review gate
  the review happens in the PR, so shipping drafts that need a second flip may be one
  gate too many.

Podcast episodes stay out of scope: the feed is hosted on Anchor and the site links to
it rather than generating one, and `ingestPodcastEpisodes: true` in the config predates
that decision.

## Also relevant

`.github/workflows/ingest-transcripts.yml` asks reviewers to fill in
`sermon_start_seconds` and `sermon_end_seconds`, but the stub generator and
`src/lib/sermon-chatbot/corpus.ts` both use `content_start` and `content_end` in
`hh:mm:ss`. The PR instructions are wrong and are tracked separately in `ROADMAP.md`.
