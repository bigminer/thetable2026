# Weekly media ingestion scheduler

Chosen scheduler: GitHub Actions.

Why GitHub Actions instead of Hermes cron:
- the repo already uses GitHub Actions for scheduled ingestion work
- run logs are visible in the same CI system operators already check
- the schedule is repo-local and easy to review/change alongside the code
- manual `workflow_dispatch` runs give us a safe test path before flipping any production source URLs

Schedule:
- Sunday post-service run: `0 20 * * 0` UTC
- Daily catch-up run: `0 6 * * *` UTC

Trigger logic:
- scheduled runs default to dry-run mode while source URLs are still being finalized
- manual runs can opt into write mode once the config is ready
- the runner uses the scoped `the-good-book` automation config from `scripts/automation.config.json`

Safety rules:
- if there is nothing new in scope, the script prints `Nothing to do.` and exits 0
- dry-run mode is supported by the `--dry-run` flag and the `AUTOMATION_DRY_RUN=1` env var
- write mode remains blocked unless `defaults.writeContentFiles` is intentionally enabled in the config
- repeated runs over the same window are idempotent because existing content is detected before any write step

Operator output:
- dry-run: concise summary plus the pair report
- no-op: single short line
- write mode: concise write summary only

Current implementation entry point:
- `scripts/ingest-new-media.ts`
- GitHub Actions workflow: `.github/workflows/weekly-media-ingestion.yml`
