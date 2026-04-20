# Recipe: classify a route

## Purpose
Add (or change) one URL's classification in `migration-data/route-classification.json`.

## When to use
- Working through `DG0-S2` for the first time.
- Fixing a misclassified URL flagged by `scripts/verify/DG0-S2.sh`.

## The five classifications
| Value | Meaning |
|---|---|
| `keep` | Astro renders this path directly at the same URL. |
| `redirect` | Durable 301/302 to a new target. `target` field required. |
| `technical` | Legacy/plugin endpoint not represented in the new site (e.g. `/wp-json/*`, MailPoet query URLs). |
| `needs-content` | Public route that requires migrated content extraction — content is not yet available. |
| `needs-integration` | Public route that requires Planning Center, Church Center, or another integration confirmation. |

## Inputs you must have
- **URL** — exact path from the manifest
- **Classification** — one of the five above
- **Target** (if `redirect`) — destination URL
- **Rationale** — one sentence explaining the choice

## Steps

1. Open `migration-data/source-reference/site-manifest-latest/summaries/all-public-urls.json` to confirm the URL exists in the manifest.
2. Open (or create) `migration-data/route-classification.json`. Expected shape is a top-level JSON array of 243 entries.
3. Find the entry whose `url` matches. Add it if classifying for the first time.
4. Set fields:
   ```json
   {
     "url": "<exact-manifest-url>",
     "classification": "<one of the five>",
     "target": "<only if classification is redirect>",
     "rationale": "<one sentence>"
   }
   ```
5. Save.

## Verify
```bash
bash scripts/verify/DG0-S2.sh
```
Expected exit code: `0`.

Intermediate `exit 2` (`not ready`) is expected while you are mid-sweep — the check requires all 243 URLs. Keep going; run again after you think you are done.

## If it fails
- **`expected 243 entries, got N`** — you added or removed rows. The count must match the manifest exactly. If the manifest URL count changed, that is `manifest_contract` drift — run `npm run verify:manifest` first and resolve per its output.
- **`entries have missing or invalid classification`** — typo in the `classification` string. Must be lowercase, one of the five above.
- **`redirect entries lack a target URL`** — you marked an entry `redirect` without `target`.

## Stop condition
- If classifying a URL requires knowing the canonical production domain (`OD-001`), and you cannot determine it from context, **do not guess**. Classify what you can, skip the ambiguous ones, and in the JOURNAL note which URL IDs are blocked on OD-001.
- If a URL is ambiguous even with domain clarity (e.g. unclear whether a `/speakers/...` page is `keep` or `redirect` to Planning Center), route to `needs-integration` and leave the final decision for `DG0-S4`.
