# Verify scripts

Each story in `plan.yaml` may declare a `verify:` path pointing here. An agent treating a story as "done" must run its verify script and see a clean exit before updating `plan.yaml`.

## Exit code convention

| Code | Meaning        | What the agent should do                                           |
|------|----------------|--------------------------------------------------------------------|
| `0`  | Passed         | Update the story status to `done`.                                 |
| `1`  | Failed         | Artifact exists but is invalid. Fix the artifact, re-run.          |
| `2`  | Not ready      | Artifact missing; task is not yet actionable at this stage.        |

## Running

```bash
bash scripts/verify/<TASK-ID>.sh
# or, for the manifest contract:
bash scripts/verify/manifest.sh
```

## Adding a verify script

1. Create `scripts/verify/<TASK-ID>.sh`, `chmod +x`.
2. Start with `set -euo pipefail`.
3. Follow the exit-code convention above.
4. Reference it from the story: `verify: scripts/verify/<TASK-ID>.sh`.
5. `npm run plan:lint` warns if a referenced verify script is missing.
