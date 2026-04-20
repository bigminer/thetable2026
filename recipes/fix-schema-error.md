# Recipe: fix a content schema error

## Purpose
Diagnose and fix a failing `npm run build` caused by content-collection validation.

## When to use
- `npm run build` exited non-zero with a Zod, collection, or reference error.
- A new content file was added and the build started failing.

## First: check `ERRORS.md`
Look up the exact error message in `ERRORS.md`. If it is listed, follow the fix there and skip the rest of this recipe.

## Steps

1. Re-run the build and capture the full error:
   ```bash
   npm run build 2>&1 | tail -40
   ```
2. Identify the **file path** and **field name** from the error. Astro errors point to both.
3. Open `src/content.config.ts` and find the schema for the failing collection.
4. Open the failing content file and compare its frontmatter against the schema.
5. Fix the frontmatter (not the schema) in one of three ways:
   - **Missing required field** → add it with a valid value.
   - **Wrong type** → coerce to the right shape (dates as `YYYY-MM-DD`, URLs with scheme, etc.).
   - **Unknown field** → remove it or match a real schema field.
6. Re-run `npm run build`. If it passes, you are done.

## Do NOT edit `src/content.config.ts`
The schema is under change control:
- While `DG0-S6` is open: the schema is provisional. Do not restructure it.
- After `DG0-S6` approved and `E2-S1` implemented: schema changes need a new story, not an in-place edit.

If the error is caused by a genuine schema bug (not a content bug), **stop**. Append a JOURNAL entry flagging the schema defect and mark the blocking task on `DG0-S6` or `E2-S1` as appropriate.

## Verify
```bash
npm run build
```
Expected: exit `0`, no Zod errors.

## If it fails after three attempts
Follow `AGENTS.md` Escalation Protocol:
1. Stop retrying.
2. Append a JOURNAL entry: task ID, error string, files touched, why each attempt failed, what would unblock (a schema change? an absent reference target? a missing field semantic?).
3. Set the task `blocked` in `plan.yaml` with the relevant blocker.

## Common failure branches

- **`Entry "X" does not exist in collection "Y"`** — a `reference()` points to a slug that has no entry. Create the target entry first (add a file to `src/content/<collection>/<slug>.md`), then re-run.
- **`Collection "X" does not exist`** — you referenced a collection that is not registered in `src/content.config.ts`. Do not add one ad-hoc; this is `E2-S1` work.
- **`Expected string, received undefined`** — required frontmatter field missing.
- **`Expected date, received string`** — date field has invalid format. Use `YYYY-MM-DD`.
