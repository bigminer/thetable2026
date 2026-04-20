# Resource Index

Purpose: fast discovery for agents, humans, and context-cleared sessions. This file points to where the project state lives; it does not replace the source-of-truth files.

## Cleared-Session Recovery

If context was reset, start here:

1. Read `handoff.md` for the exact current task and recent recovery notes.
2. Read this file to locate source artifacts, contracts, and verification scripts.
3. Read `AGENTS.md` for guardrails and execution rules.
4. Run:

```bash
npm run plan:lint
npm run verify:manifest
node scripts/agent-next.mjs
```

If these disagree, use this priority order:

1. `DECISIONS.md`
2. `plan.yaml`
3. `handoff.md`
4. `JOURNAL.md`
5. `RESOURCE_INDEX.md`

## Core Session Files

| Resource | Use |
|---|---|
| `handoff.md` | Current session prompt, exact next task, known debt, recovery commands |
| `AGENTS.md` | Stable operating rules, guardrails, quality gates, source-of-truth priority |
| `plan.yaml` | Authoritative task state, dependencies, acceptance criteria, verify command |
| `DECISIONS.md` | Locked and open decisions; append-only |
| `JOURNAL.md` | Newest-first session log; append-only |
| `ERRORS.md` | Known errors and recovery paths |
| `CLAUDE.md` | Alternate agent startup/end checklist |

## Commands

| Command | Use |
|---|---|
| `npm run agent:next` | Full preflight plus next actionable task |
| `npm run plan:lint` | Validate `plan.yaml` shape and task graph |
| `npm run verify:manifest` | Validate local source-reference manifest checksum |
| `npm run build` | Build Astro static output |
| `npm run media:extract:dry-run` | Discover WordPress upload URLs from active content and local source snapshots |
| `npm run media:check` | Fail if active content references unmanaged WordPress media or managed copies are missing |
| `npm run media:extract` | Copy active unmanaged media into source-reference and public destinations, update manifest, rewrite active references |
| `npm run test:routes` | Route parity checks |
| `npm run test:visual` | Template visual checks |
| `bash scripts/verify/<TASK-ID>.sh` | Authoritative verification for a task |

## Source References

Use local source-reference artifacts first. Do not re-crawl or regenerate unless `npm run verify:manifest` reports drift or a task explicitly requires it.

The original WordPress site is database-backed. The files below are copied snapshots and extracted references from that source, not a live runtime dependency. The Astro site should build from repo-local Markdown, data files, source-reference artifacts, and `public/media`.

Media retrieval is indirect by default: mine the local WordPress API snapshots and active Astro content for referenced `wp-content/uploads` URLs, then copy only active referenced media. Use `npm run media:extract:dry-run` before applying; source-only URLs are reported for audit but are not copied into launch scope automatically.

| Resource | Use |
|---|---|
| `migration-data/source-reference/site-manifest-latest/` | Copied WordPress source manifest used by active migration checks |
| `migration-data/source-reference/site-manifest-latest/README.md` | Manifest contents and generation context |
| `migration-data/source-reference/wp-themes/kerygma/style.css` | Copied WordPress base theme CSS reference |
| `migration-data/source-reference/wp-themes/thetable/style.css` | Copied WordPress child theme CSS reference |
| `migration-data/source-reference/assets/` | Local source-reference copies of migrated media |
| `migration-data/asset-copy-manifest.json` | Mapping from original URL to source-reference copy, served destination, and public path |

The original sibling WordPress tree may be used only as a refresh source:

```bash
cd /Users/gary/Dev/thetable
scripts/extract_site_manifest.sh https://thetabletx.com migration-data/site-manifest-latest

cd /Users/gary/Dev/tablefresh
rm -rf migration-data/source-reference/site-manifest-latest
mkdir -p migration-data/source-reference/site-manifest-latest
cp -R /Users/gary/Dev/thetable/migration-data/site-manifest-latest/. migration-data/source-reference/site-manifest-latest/
```

## Migration Contracts

| Resource | Use |
|---|---|
| `migration-data/original-site-parity-contract.md` | Brand/content/media parity rules, including copied-asset requirements |
| `migration-data/content-model-proposal.md` | Content collection and schema design proposal |
| `migration-data/sanitizer-policy.md` | Raw HTML allow/strip policy |
| `migration-data/redirect-matrix.yaml` | Redirect source of truth |
| `migration-data/route-classification.json` | Keep/redirect route classification |
| `migration-data/launch-checklist.md` | Local launch readiness checklist |
| `future-feature-stubs/integration-wishlist.md` | Deferred growth/integration scope |
| `future-feature-stubs/integration-wishlist.json` | Machine-readable deferred scope |

## Evidence and Audit Data

| Resource | Use |
|---|---|
| `migration-data/page-evidence/` | Tier 1 source-vs-target evidence files |
| `migration-data/source-extraction-notes.md` | Extraction notes and known source caveats |
| `tests/visual/production-baselines/` | Committed production/reference screenshots |
| `tests/visual/tier1.spec.ts` | Tier 1 visual parity harness |
| `tests/visual/templates.spec.ts` | Astro template visual regression harness |

## Site Implementation Map

| Resource | Use |
|---|---|
| `src/content.config.ts` | Astro content schemas |
| `src/content/pages/` | Markdown page content |
| `src/content/messages/` | Message content |
| `src/content/series/` | Series content |
| `src/content/staff/` | Staff content |
| `src/pages/` | Astro route files |
| `src/components/ContentBlocks.astro` | Typed content block renderer |
| `src/layouts/BaseLayout.astro` | Shared page shell |
| `src/data/navigation.ts` | Main navigation source |
| `src/data/forms.ts` | Form integration configuration |
| `public/media/` | Site-facing migrated media |

## Verification Map

| Resource | Use |
|---|---|
| `scripts/verify/README.md` | Verify script conventions |
| `scripts/verify/manifest.sh` | Manifest contract verifier |
| `scripts/verify/E6-S2.sh` | Current next-task verifier for podcast, series, staff routes |
| `scripts/verify/E6-S6.sh` | Production baselines, visual harness, and copied-asset audit |
| `scripts/extract-referenced-media.mjs` | Referenced-media discovery and copy utility |
| `scripts/check-route-parity.mjs` | URL parity checker |
| `scripts/validate-content.mjs` | Content validation helper |
| `scripts/capture-production-baselines.mjs` | Production screenshot capture script; do not run mid-sprint unless instructed |

## Current Known Recovery Notes

- `E6-S2` is the next actionable task unless `node scripts/agent-next.mjs` says otherwise.
- `E6-S10` remains blocked until second-tier routes are reconciled.
- Tier 1 visual parity currently exits as warning-only through `E6-S1`; strict visual reconciliation is deferred to `E6-S10`.
- Planning Center form URLs for `src/content/pages/meetups.md` are still unknown.
- Astro build may print JSON schema generation warnings while still exiting 0.
