# DECISIONS

Append-only ledger for the TableFresh migration.
Locked decisions (`D-###`) and retired decision refs (`OD-###`) have stable IDs — other docs reference them, never duplicate their content.

Do not rewrite history. To reverse a decision, add a new `D-###` entry that supersedes the old one (mark the old one `superseded_by:`).

---

## Locked Decisions

### D-001 — Migration target
**Decided:** 2026-04-18
WordPress → Astro static site in `tablefresh`.

### D-002 — Content management approach
**Decided:** 2026-04-18
No full CMS at launch. Obsidian + Markdown + frontmatter schemas + Git auto-sync.

### D-003 — Hosting
**Decided:** 2026-04-18
Cloudflare Pages is the production deployment target.

### D-004 — URL policy
**Decided:** 2026-04-18
Preserve all indexed/public URLs. Redirect only technical/legacy template endpoints.

### D-005 — Content transformation
**Decided:** 2026-04-18
Structured block mapping first. Unsupported fragments kept via sanitized raw HTML fallback (policy defined by OD-004).

### D-006 — Media migration
**Decided:** 2026-04-18
Referenced assets only. No full uploads-library migration.

### D-007 — Design target
**Decided:** 2026-04-18
Brand parity + mobile-first consistency improvements. Not pixel-for-pixel cloning.

### D-008 — Visual QA
**Decided:** 2026-04-18
Playwright visual regression required. Thresholds enforce design-intent consistency, not exact pixel duplication.

### D-009 — Integration priority
**Decided:** 2026-04-18
Planning Center is primary for events/forms/workflows. Church Center behavior preserved.

### D-010 — Fallback form handling
**Decided:** 2026-04-18
Google Apps Script + Sheets is fallback-only for general contact when no Planning Center workflow fits.

### D-011 — Cutover strategy
**Decided:** 2026-04-18
Big-bang cutover with explicit rollback path to the WordPress snapshot.

### D-012 — Growth wishlist scope
**Decided:** 2026-04-18
Captured in `future-feature-stubs/` and explicitly out of launch scope.

### D-013 — Google Ads scope
**Decided:** 2026-04-18
No existing Google Ads integration assumed. Ads enablement is post-launch readiness work, not a migration blocker.

### D-014 — Canonical production domain
**Decided:** 2026-04-18
`thetabletx.com` is the canonical production host. `thetabletx.org` redirects to it, sitemap and Search Console track the `.com` host, and rollback DNS points to the existing WordPress origin.

### D-015 — Planning Center event source
**Decided:** 2026-04-18
Planning Center API is the primary event source. Static builds fetch on deploy or schedule, keep a last-known-good snapshot if the source is unavailable, and do not treat iCal as canonical.

### D-016 — Planning Center form integration mode
**Decided:** 2026-04-18
Use link-first forms by default. Embed only when inline completion materially helps the workflow; otherwise send users to the Planning Center or Church Center destination. Generic contact remains the Apps Script fallback.

### D-017 — Raw HTML sanitizer policy
**Decided:** 2026-04-18
Use `sanitize-html` with a strict allowlist. Keep semantic text, lists, tables, media, forms, and approved embeds; strip scripts, inline event handlers, WP/plugin admin markup, and unapproved iframe providers.

### D-018 — Local-first execution boundary
**Decided:** 2026-04-18
Complete migration work locally by default: static builds, content/schema validation, route checks, visual regression, and integration work should run against local files, `astro preview`, fixtures, snapshots, or third-party APIs called from local development. Hosted resources are deferred until explicitly required by a final hosted-launch task. Do not promote Cloudflare Pages production, change DNS, purge CDN cache, or run Search Console live validation before that phase. Live third-party API work is allowed locally when credentials are available and the operation is read-only or otherwise safe for production data.

---

## Retired Decision Refs

### OD-001 — Canonical production domain
**Status:** closed
**Superseded by:** D-014

### OD-002 — Planning Center event source
**Status:** closed
**Superseded by:** D-015

### OD-003 — Planning Center form integration mode
**Status:** closed
**Superseded by:** D-016

### OD-004 — Raw HTML sanitizer policy
**Status:** closed
**Superseded by:** D-017
