# TableFresh

Static Astro migration target for `thetabletx`.

For agent work or context-cleared sessions, start with:

1. `handoff.md` — current task and recovery notes.
2. `RESOURCE_INDEX.md` — discovery map for source artifacts, contracts, scripts, and verification.
3. `AGENTS.md` — stable guardrails and workflow.
4. `plan.yaml` — authoritative task state and acceptance criteria.

## Common Commands

```bash
npm run plan:lint
npm run verify:manifest
npm run agent:next
npm run media:extract:dry-run
npm run build
```

## Source Model

The original WordPress content is database-backed. This repository uses copied local references and migrated static content instead of depending on the WordPress database at runtime:

- `migration-data/source-reference/site-manifest-latest/` contains the local source manifest snapshot.
- `migration-data/source-reference/assets/` contains local source-reference copies of migrated assets.
- `src/content/` contains migrated Markdown content.
- `public/media/` contains site-facing migrated media.
- `migration-data/asset-copy-manifest.json` maps each migrated asset from original source URL to source-reference copy and destination copy.

Media retrieval is intentionally referenced-only:

```bash
npm run media:extract:dry-run # report active and source-only WordPress upload URLs
npm run media:check           # fail on unmanaged active media
npm run media:extract         # copy active unmanaged media and rewrite references
```

Source-only URLs from WordPress snapshots are not copied automatically; they become migration scope only when active Astro content uses them.
