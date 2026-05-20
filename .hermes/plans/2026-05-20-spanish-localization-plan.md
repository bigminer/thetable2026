# Spanish Localization Plan

## Decision summary

This plan makes English the current canonical default locale and Spanish the first additional locale to launch. The site keeps its existing English URLs at the root while Spanish is introduced under `/es/` so the current audience, indexed URLs, and backlinks stay stable.

## 1) Primary locale

Chosen locale priority:

1. `en` — default / canonical locale
2. `es` — first translated locale

Rationale:

- The live site and the current Astro migration are already English-first, so keeping English canonical avoids breaking existing URLs and search indexing.
- Spanish is still prioritized as the first localization effort, but it is not the runtime default yet.
- This lets us launch localization incrementally instead of forcing a full site-language switch before Spanish coverage is complete.

## 2) Route structure

Chosen approach: subdirectory / pathname-prefix strategy.

Implementation shape:

- English canonical pages stay at the root:
  - `/`
  - `/new-here/`
  - `/our-story/`
- Spanish pages live under `/es/`:
  - `/es/`
  - `/es/new-here/`
  - `/es/our-story/`

Why this approach:

- Best SEO fit for a bilingual site: each locale gets stable, crawlable URLs with clear canonical targets.
- Astro supports path-prefix localization cleanly, so this is a low-risk route model.
- It preserves the current English site instead of re-pointing the root to Spanish and forcing redirects on every existing link.
- It avoids the duplication and weak canonical behavior of query-param URLs.
- It avoids the extra DNS/cert/SEO overhead of subdomains.

Root `/` strategy:

- Do not redirect `/` away from English.
- `/` remains the English homepage.
- Spanish has its own homepage at `/es/`.
- If the team later wants explicit English-prefixed URLs for symmetry, add `/en/...` as redirect-only aliases, but do not make that the first rollout.

Example canonical map:

- `/` → English homepage
- `/es/` → Spanish homepage
- `/service-times-locations/` → English page
- `/es/service-times-locations/` → Spanish page

## 3) Translation workflow

Chosen workflow: Weblate-backed Git workflow for non-technical contributors, with GitHub PR review by the site maintainer.

Why Weblate:

- Non-technical contributors can translate in a browser without touching Git.
- It supports review before merge.
- It keeps translation state tied to the repo instead of trapping content in a separate SaaS-only workflow.
- It scales better than ad hoc email/DM translation requests once the site grows beyond a few pages.

Workflow steps:

1. Source content and UI strings are added in English first.
2. A translation sync job extracts new strings and updates the translation source files.
3. Weblate marks new or changed strings as needing translation.
4. Spanish translators translate in Weblate’s browser UI.
5. A bilingual reviewer or designated Spanish-language editor checks terminology and tone.
6. The site maintainer pulls the translation changes back into the repo as a PR or sync commit.
7. The maintainer merges only after CI passes and the translation diff is reviewed.

Ownership:

- Translators: non-technical Spanish contributors / bilingual staff
- Reviewer: designated bilingual editor or ministry stakeholder
- Merge owner: site maintainer / engineering maintainer

How new strings get flagged:

- Any new English string or page copy lands as source-of-truth only.
- The sync job compares source keys to the Spanish catalog and marks missing entries as untranslated.
- CI should fail or warn when required Spanish coverage drops below the agreed threshold for launch-critical pages.
- The PR template should include a translation checklist so missing locales are visible before merge.

Recommended content split:

- Page copy lives in locale-matched content files.
- UI labels / navigation / shared text live in locale catalog files.
- Both should share stable keys so translation diffs stay readable.

## Launch order

1. Finish the localization framework and route rules.
2. Translate the most visible entry pages first:
   - Home
   - New Here
   - Service Times & Location
   - Our Story
   - Our Vision
3. Then translate the remaining informational pages.
4. Only after the first Spanish set is reviewed should implementation expand to the rest of the site.

## Open items for implementation

- Confirm whether `/en/...` aliases are needed at launch or can wait.
- Confirm Weblate hosting choice: self-hosted vs managed.
- Identify the bilingual reviewer who will sign off on Spanish copy.
- Define the initial translation coverage threshold for launch-critical pages.

## Board linkage

This plan answers the open localization questions in kanban task `t_85d9b8b4` and is intended to be the planning artifact referenced before implementation begins.
