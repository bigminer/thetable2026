---
project: tablefresh
role: stable session context — read first
siblings:
  - plan.yaml       # queryable task state
  - DECISIONS.md    # append-only decision ledger
  - JOURNAL.md      # append-only session log (newest on top)
  - RESOURCE_INDEX.md # discovery map for agents and cleared sessions
---

# AGENTS.md

## Quick Start for Execution Agents
If your job is to execute a known task (not make a judgment call):

```bash
npm run agent:next
```

That command runs preflight (plan lint + manifest contract), then prints the next actionable task with its recipe, verify command, and step list. Follow what it prints. You do not need to read the rest of this file.

If you hit an error, look it up in `ERRORS.md` before doing anything else.

If session context was cleared or you need to locate source artifacts quickly, read `RESOURCE_INDEX.md`.

If a story carries `needs: judgment`, escalate to a stronger model instead of executing.

If a story carries `needs: execution`, do not make product, schema, route, hosting, or provider decisions. Follow the listed inputs, outputs, implementation steps, non-goals, and verify script. If those fields are missing or contradictory, stop and mark the story blocked rather than guessing.

---

## Mission
Migrate `thetabletx` from WordPress to a static Astro site (`tablefresh`) with:
- brand-level visual parity with mobile-first consistency improvements
- non-technical content editing via Obsidian + Markdown
- Planning Center as primary integration surface (events/forms/workflows)

Big-bang cutover with explicit rollback to the WordPress snapshot.

## Scope

**In (current phase)**
- Build and ship `tablefresh` as static output.
- Preserve all indexed/public URLs (redirect only technical/legacy endpoints).
- Migrate content to structured Markdown with sanitized raw-HTML fallback.
- Migrate referenced media only.
- Playwright visual regression in CI for design-intent consistency.
- Prepare Cloudflare Pages deployment, but defer hosted production execution until the final launch phase.

**Out (do not implement unless reopened)**
- Full CMS adoption (Storyblok/Decap/etc.).
- Redesign or rebranding.
- Growth wishlist items in `future-feature-stubs/`.
- Google Ads enablement (post-launch readiness work, not a migration blocker).

## Locked Decisions (summary)
Authoritative text lives in `DECISIONS.md`. Labels here for quick scan:

- **D-001** Astro static site target
- **D-002** Obsidian + Markdown + Git auto-sync (no CMS at launch)
- **D-003** Cloudflare Pages hosting
- **D-004** Preserve all indexed/public URLs; redirect technical/legacy only
- **D-005** Structured blocks first; sanitized raw HTML fallback
- **D-006** Referenced media only
- **D-007** Brand parity + mobile-first consistency (not pixel cloning)
- **D-008** Playwright visual regression on design-intent thresholds
- **D-009** Planning Center primary for events/forms/workflows
- **D-010** Google Apps Script fallback-only for generic contact
- **D-011** Big-bang cutover with rollback path
- **D-012** Growth wishlist deferred (`future-feature-stubs/`)
- **D-013** Google Ads is post-launch, not a migration blocker
- **D-018** Local-first execution boundary until final hosted launch

Decision refs are resolved in `DECISIONS.md` as `D-014`…`D-018`; see the `Unblocks:` mapping for current task gating.

## Source-of-Truth Priority
1. `DECISIONS.md` (locked + open decisions)
2. `plan.yaml` (task state, acceptance criteria)
3. `future-feature-stubs/integration-wishlist.{md,json}` (deferred scope)
4. Generated manifests: `migration-data/source-reference/site-manifest-latest/`
5. Existing WP theme CSS:
   - `migration-data/source-reference/wp-themes/kerygma/style.css`
   - `migration-data/source-reference/wp-themes/thetable/style.css`

On conflict, follow the order above.

## Guardrails

**Execution**
- Read `AGENTS.md` + top of `JOURNAL.md` + `plan.yaml` before acting.
- Use local manifests first; avoid re-crawling unless required.
- Keep edits small and deterministic.
- Validate with tests + visual checks before claiming completion.
- Record new facts: decisions → `DECISIONS.md`; session outcomes → `JOURNAL.md`; task state → `plan.yaml`.
- Never rewrite `DECISIONS.md` or `JOURNAL.md` history. Append only.

**Small-model implementation contract**
- Treat `plan.yaml` as the task packet, not a brainstorming prompt.
- Implement only the listed outputs for the selected story.
- Use only listed inputs/source artifacts unless blocked.
- Respect `non_goals`; do not opportunistically refactor nearby systems.
- If a task lacks enough detail to execute deterministically, add a blocker entry instead of making a decision.
- Every implementation story must have a verify script before it can be marked done.

**Local-first boundary**
- Default to local files, `npm run build`, `npm run preview`, fixture/snapshot data, and third-party APIs called from local development.
- Live API integrations are allowed locally when credentials are available and the operation is read-only or otherwise safe for production data.
- Do not require Cloudflare Pages hosting, production deploys, DNS changes, CDN purge, or Search Console live validation unless the task is explicitly marked `requires_hosting: true`.
- Cloudflare preview or production resources belong to the final hosted-launch phase unless a task says otherwise.

**Style / UX**
- Do not introduce new design systems.
- Preserve brand palette, typography feel, and imagery tone.
- Improve spacing, section rhythm, and mobile-first flow where current layout is fragmented.
- Avoid cosmetic novelty; prioritize clarity, consistency, usability.

**Content**
- Editors should only need Markdown/frontmatter edits.
- Schema is strict; malformed content fails the build.
- Preserve unsupported WordPress fragments as sanitized raw HTML; never drop them silently.

**Sanitized raw HTML policy** (per D-005, formalized in D-017)
- Strip scripts, inline event handlers, unknown embeds, tracking snippets, and WP/plugin admin markup.
- Allow semantic HTML, links, images, tables, lists, headings, basic formatting.
- Allow iframes only from approved providers (Planning Center, Church Center, YouTube, maps) after mobile behavior verified.
- Preserve source URL/page metadata on every raw HTML block for audit.
- Treat raw HTML as migration debt, not an authoring model.

## Never Do This
Concrete anti-patterns. Each is the shortest path to rework or corruption.

1. **Never edit `src/content.config.ts` before `DG0-S6` is approved.** The schema is provisional; changes now will be overwritten by `E2-S1`.
2. **Never add a new content collection ad-hoc.** Collections are defined by the `DG0-S6` proposal and implemented in `E2-S1`. Anywhere else is out of scope.
3. **Never mark a task `done` without its `verify:` script returning exit `0`.** Prose acceptance is advisory; the verify script is authoritative.
4. **Never re-crawl WordPress or regenerate the manifest** unless `npm run verify:manifest` reports drift. Re-crawling invalidates every downstream artifact.
5. **Never introduce a `raw_html` block when a typed block would work.** Raw HTML is migration debt, not an authoring model (see D-005).
6. **Never rewrite prior entries in `JOURNAL.md` or `DECISIONS.md`.** Both are append-only. To reverse a decision, add a new one that supersedes it.
7. **Never skip the JOURNAL entry when escalating.** The entry is how the next session recovers context.
8. **Never end a session without updating `handoff.md`.** The task-specific prompt must reflect the actual next task and any sequence corrections made during the session.
9. **Never guess on an open decision.** If your task depends on `OD-###` and the decision is unresolved, stop and mark the task blocked. Guessing costs more than waiting.

## Quality Gates (Definition of Done)
- Build passes.
- Content schema validation passes (malformed frontmatter fails build).
- URL parity: all classified `keep`/`redirect` URLs resolve `200`/`301`.
- Playwright visual checks pass consistency thresholds.
- Planning Center integration checks pass locally with fixtures/snapshots or live API calls from local development; production URL checks are final hosted-launch work.
- SEO essentials present: metadata, canonical, sitemap, robots.
- Cutover + rollback runbook documented locally, then executed only in the final hosted-launch phase.
- If fallback contact form enabled: site → Apps Script → Sheet → notification verified.

## Operational Risk Checklist (Church-Specific)
- Service time/location in a single managed source (no cross-page drift).
- Featured-event override flow for Easter/Christmas without code edits.
- Media publishing review step for child-safety/privacy considerations.
- Livestream fallback states (direct YouTube link, latest message link, help path).
- Giving/privacy/contact pages are high-priority availability checks.
- Form abuse controls + alerting for submission-rate anomalies.
- Staff/leadership listings data-driven (content edits only).
- Preserve legacy shared slugs via durable redirects (especially sermon/podcast).
- Maintain a minimal static fallback page for service essentials if integrations fail.
- Document weekly content ownership (events/messages/slides).

## Agent Workflow

### Session Start
1. Read `handoff.md` — it contains the current session prompt and exact next task.
2. Read `RESOURCE_INDEX.md` — it maps source artifacts, contracts, scripts, and recovery references.
3. Read `AGENTS.md` (this file).
4. Read the top entry of `JOURNAL.md` for recent context.
5. Run `npm run plan:lint` — if it fails, fix `plan.yaml` before doing anything else.
6. Run `npm run verify:manifest` — if it reports drift, resolve per its instructions before continuing.
7. Query `plan.yaml` for `status: in_progress`, then unblocked `status: todo` tasks.
8. Check `DECISIONS.md` for any `OD-###` blocking your task.

### Execution
8. Execute in small steps.
9. On suspected completion: run the task's `verify:` script (if present). Treat its exit code as authoritative — do not mark the task `done` on prose acceptance alone.

### Session End
10. Update `plan.yaml` task status — mark completed task `done`, unblock any tasks whose `blocked_by` list is now fully resolved.
11. Append a `JOURNAL.md` entry (newest on top) — what changed, what was learned, exact next step, open questions.
12. Update `handoff.md` — advance the task-specific prompt to the next task and reflect any scope or sequence corrections.
13. Record new decisions in `DECISIONS.md` if any emerged (append only).

## Escalation Protocol
Default budget per task: **3 attempts OR 2 hours**, whichever hits first.
Override on specific stories with `budget: { attempts: N, time_hours: N }` in `plan.yaml`.

When the budget is exceeded:
1. **Stop the loop.** Do not keep retrying.
2. **Append a `JOURNAL.md` entry** with:
   - **Task ID**
   - **What was tried** (bullet list of attempts)
   - **Why it failed** (concrete error / dead end per attempt)
   - **What would unblock this** (a missing decision, data, access, or a stronger model)
3. **Set the task to `status: blocked`** in `plan.yaml` with a `blocked_by:` entry (use an existing ID, or create a new `OD-###` in `DECISIONS.md` if it's a decision blocker).
4. **Pick the next unblocked task**, or stop the session cleanly if none are available.

The journal entry is not optional — it is how the next session (human or agent) recovers context.

## Model Assignment (advisory)
Stories may carry `needs: judgment | execution`:
- `judgment` — closing open decisions (`OD-###`), writing the content-model proposal, integration-shape calls. Use the strongest available model.
- `execution` — applying a locked schema, copying content, running verify scripts, fixing schema violations surfaced by CI. Delegatable to smaller models once the scaffold stabilizes.

If a story lacks the tag, assume `execution` unless it touches an open decision.

## Handoff Requirements (Per Session)
Each meaningful session appends one `JOURNAL.md` entry containing:
- what changed
- what was learned
- exact next step
- open questions / blockers

Keep entries short and decision-oriented. Do not edit prior entries.

## Commands
```bash
# Refresh WordPress source manifest
cd /Users/gary/Dev/thetable
scripts/extract_site_manifest.sh https://thetabletx.com migration-data/site-manifest-latest

# Work in the Astro target
cd /Users/gary/Dev/tablefresh
rm -rf migration-data/source-reference/site-manifest-latest
mkdir -p migration-data/source-reference/site-manifest-latest
cp -R /Users/gary/Dev/thetable/migration-data/site-manifest-latest/. migration-data/source-reference/site-manifest-latest/

# Query next task
# (requires yq — install if missing)
yq '.tasks[] | select(.status == "in_progress")' plan.yaml
yq '.tasks[] | select(.status == "todo" and (.blocked_by // []) == [])' plan.yaml
```

## Environment and Secrets Map (no values here)
- **Cloudflare Pages**: project name, production branch, build command/output dir.
- **Planning Center**: API credentials or iCal URLs; IDs/URLs for forms and event feeds.
- **Google Workspace (fallback contact only)**: Apps Script deployment URL, Sheet ID/tab, notification recipients.
- **Analytics/SEO**: GTM/GA IDs (if enabled), Search Console property.

## Rollback Quick Steps (Big-Bang Cutover)
1. Keep WordPress runtime and DB snapshot accessible before DNS cutover.
2. If launch gate fails, switch DNS back to prior WordPress target.
3. Purge CDN cache and verify homepage + key routes + giving/contact links.
4. Log incident and root cause in `JOURNAL.md` before next attempt.

## Post-Launch Archival Plan
After successful cutover and 2-week stabilization:
- Move `AGENTS.md`, `plan.yaml`, `DECISIONS.md`, `JOURNAL.md` to `docs/archive/migration-2026/`.
- Keep `future-feature-stubs/` at repo root (forward-looking).
- Replace root `AGENTS.md` with a thin post-launch operations doc.
