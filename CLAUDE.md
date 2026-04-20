# CLAUDE.md — TableFresh Project

## Session Start (required)

Before doing any work in this project:

1. Read `handoff.md` — it contains the current session prompt and the exact next task.
2. Read `RESOURCE_INDEX.md` — it maps source artifacts, migration contracts, scripts, and recovery references.
3. Read `AGENTS.md` — it contains guardrails, locked decisions, and the agent workflow.
4. Run `npm run plan:lint` — fix `plan.yaml` if it reports errors before continuing.
5. Run `npm run verify:manifest` — confirm local source-reference artifacts are valid.
6. Run `node scripts/agent-next.mjs` — confirms the active task and its inputs/outputs/acceptance criteria.

Do not begin implementation until these steps are complete.

## Session End (required)

After completing any meaningful work:

1. Update `plan.yaml` — set the completed task to `done`, unblock any tasks whose `blocked_by` list is now cleared.
2. Append a `JOURNAL.md` entry (newest on top) — what changed, what was learned, exact next step, open questions.
3. Update `handoff.md` — advance the task-specific prompt to the next task, and reflect any new context (decisions, scope changes, sequence corrections) in the recovery sequence.
4. Record any new decisions in `DECISIONS.md` (append only — never edit prior entries).

## Implementation Plan

`plan.yaml` is the authoritative task packet. It is not a suggestion.

- Implement only the listed outputs for the selected task.
- Use only the listed inputs unless blocked.
- Respect `non_goals` — do not opportunistically improve nearby systems.
- Do not mark a task `done` without its `verify:` script returning exit `0`.
- If a task lacks enough detail to execute deterministically, add a `status: blocked` entry rather than guessing.

## Source-of-Truth Order

1. `DECISIONS.md`
2. `plan.yaml`
3. `handoff.md` (session handoff context)
4. `JOURNAL.md` (recent session history)
5. `RESOURCE_INDEX.md` (discovery map)
6. `migration-data/source-reference/site-manifest-latest/` (WordPress source manifest)
