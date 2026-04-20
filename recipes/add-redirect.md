# Recipe: add a redirect

## Purpose
Add (or change) a 301/302 redirect so a legacy URL sends traffic to its new target.

## When to use
- A URL is classified `redirect` in `migration-data/route-classification.json`.
- A one-off legacy URL needs to return 301 to a new path.

## Inputs you must have
- **Source path** — the legacy path (e.g. `/old-sermons/2022/`)
- **Target** — the destination URL or path
- **Rationale** — one sentence for the classification file

## Steps

1. Open `public/_redirects` (create the file if it does not exist).
2. Append exactly one line:
   ```
   <source-path>  <target>  301
   ```
   - Use `301` for permanent, `302` for temporary.
   - Wildcard with `:splat`: `/old-series/*  /series/:splat  301`
   - Do not add comments on the same line.
3. Open `migration-data/route-classification.json`. Find the entry where `url` matches the source.
4. Set these fields:
   ```json
   {
     "classification": "redirect",
     "target": "<target>",
     "rationale": "<one-sentence reason>"
   }
   ```
5. Save both files.

## Verify
```bash
bash scripts/verify/DG0-S2.sh
```
Expected exit code: `0`.

## If it fails
- **`redirect entries lack a target URL`** — step 4 missed the `target` field or left it empty.
- **`expected 243 entries, got N`** — the classification file has the wrong count. Do not add/remove entries; reconcile against `migration-data/source-reference/site-manifest-latest/summaries/all-public-urls.json`.
- **`entries have missing or invalid classification`** — the `classification` value is not one of `keep | redirect | technical | needs-content | needs-integration`. Fix the typo.

## Stop condition
- If the target URL depends on `OD-001` (canonical production domain) and that decision is still open: **do not guess**. Stop, append a JOURNAL entry, and mark the task blocked on OD-001.
