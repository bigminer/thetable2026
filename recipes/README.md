# Recipes

Imperative, single-task guides for execution-class agents.

Each recipe is self-contained: read one file, do one thing, run one verify. You do not need to read `AGENTS.md`, `plan.yaml`, or `DECISIONS.md` to execute a recipe unless it tells you to.

## Index

| Recipe | Use when |
|---|---|
| [add-redirect.md](add-redirect.md) | A URL is classified `redirect` and needs to land in `public/_redirects`. |
| [build-route-matrix.md](build-route-matrix.md) | Local route expectations need to be generated from `route-classification.json`. |
| [classify-route.md](classify-route.md) | A URL in the manifest needs (or needs to change) its entry in `route-classification.json`. |
| [fix-schema-error.md](fix-schema-error.md) | `npm run build` failed with a content-collection / Zod / reference error. |
| [implement-content-schema.md](implement-content-schema.md) | The approved content-model proposal needs to be implemented in `src/content.config.ts`. |

Per-content-type recipes (add-page, add-podcast-episode, add-speaker, etc.) are intentionally deferred until DG0-S6 locks the schema. Writing them against the provisional schema would force rewrites.

## Convention

Every recipe has:
1. **Purpose** — one line.
2. **When to use** — bullets.
3. **Steps** — numbered, imperative.
4. **Verify** — exact command + expected exit code.
5. **If it fails** — known failure branches and what to do.
6. **Stop condition** — when to escalate per `AGENTS.md` Escalation Protocol instead of retrying.
