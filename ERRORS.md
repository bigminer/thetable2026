# ERRORS

Known error strings → diagnosis → fix. Find your error message; follow the instructions.
If the error is not listed, fall back to the relevant recipe in `recipes/` or follow `AGENTS.md` Escalation Protocol.

---

## Astro content collection errors

### `Collection "X" does not exist`
- Cause: you referenced a collection name not registered in `src/content.config.ts`.
- Fix: **do not add the collection ad-hoc.** Adding collections is `E2-S1` work and must match the approved `DG0-S6` proposal. If no such collection is planned, your frontmatter or code reference is wrong.

### `Entry "X" does not exist in collection "Y"`
- Cause: a `reference('Y')` field points to a slug that has no entry.
- Fix: create the target entry first (`src/content/Y/X.md`), then re-run the build.

### `Expected string, received undefined` (Zod)
- Cause: a required frontmatter field is missing.
- Fix: open the file named in the error, add the field. See `recipes/fix-schema-error.md`.

### `Expected date, received string` (Zod)
- Cause: a date field has an invalid or unquoted value.
- Fix: use ISO `YYYY-MM-DD`. Do not use `03/14/2025` or free-form strings.

### `Invalid url` (Zod)
- Cause: a field typed as `z.string().url()` got a value without scheme (e.g. `example.com` instead of `https://example.com`).
- Fix: include `https://`.

---

## plan.yaml / tooling errors

### `plan.yaml has no tasks[] array`
- Cause: the file is malformed or truncated.
- Fix: `git diff plan.yaml` and restore the missing content. Run `npm run plan:lint` until clean.

### `cycle in blocked_by: X -> Y -> X`
- Cause: tasks have a circular dependency.
- Fix: break the cycle. Decide which task produces the artifact and which consumes it; the consumer's `blocked_by` should reference the producer, not vice versa.

### `task T.unblocks[U] is not reciprocated by U.blocked_by`
- Cause: `T.unblocks: [U]` without `U.blocked_by: [T]`.
- Fix: add `T` to `U.blocked_by`, or remove `U` from `T.unblocks` if the dependency is not real.

### `verify script missing at scripts/verify/X.sh`
- Cause: a `verify:` path in `plan.yaml` does not exist.
- Fix: either write the script (follow `scripts/verify/README.md` conventions) or remove the `verify:` line until the script is ready.

### `manifest checksum drift detected`
- Cause: the WordPress manifest snapshot changed since the contract was pinned.
- Fix: decide whether the change is intended. If yes: update `plan.yaml.manifest_contract`, re-fire `DG0-S2`, flag downstream artifacts stale in `JOURNAL.md`. If no: investigate before continuing.

---

## System dependency errors

### `yq is required (brew install yq)`
- Fix: `brew install yq`.

### `jq: command not found`
- Fix: `brew install jq`.

### `npm ERR! code ENOENT` during install
- Fix: confirm Node version matches `package.json.engines` (`node >=22.12.0`). Use `nvm use` if available.

---

## Process errors

### "I do not know what task to do"
- Fix: run `npm run agent:next`. It prints the next actionable task, its recipe, and its verify command.

### "I exceeded my budget"
- Fix: follow `AGENTS.md` Escalation Protocol. Do not continue retrying.

### "The verify script returned exit 2"
- Meaning: artifact not yet produced. The task is not ready to be verified.
- Fix: this is normal mid-task. Keep going. Re-run verify when you think the artifact is complete.

### "The verify script returned exit 1"
- Meaning: artifact exists but is invalid.
- Fix: read the verify output; it names the specific failure. Fix, re-run, do not mark the task `done` until exit is `0`.
