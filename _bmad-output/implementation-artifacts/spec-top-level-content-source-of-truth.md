---
title: 'Top-Level Content Source Of Truth'
type: 'refactor'
created: '2026-04-21'
status: 'draft'
context:
  - '/Users/gary/Dev/tablefresh/_bmad-output/project-context.md'
  - '/Users/gary/Dev/tablefresh/README.md'
  - '/Users/gary/Dev/tablefresh/astro.config.mjs'
  - '/Users/gary/Dev/tablefresh/src/content.config.ts'
  - '/Users/gary/Dev/tablefresh/EDITING_GUIDE.md'
  - '/Users/gary/Dev/tablefresh/docs/local-first-workflow.md'
---
<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The site now behaves more like a markdown CMS, but the folder model is still split between `src/content`, `public/media`, and `obsidian/templates`. That makes the contributor workflow feel more technical than it needs to and keeps raising the question of which folder is the real source of truth.

**Approach:** Refactor the project so a top-level `content/` tree becomes the only human-facing source of truth for editable site content. Use Astro-supported configuration, not mirrors or symlinks, so the app reads markdown collections directly from `content/` and the media workflow is simplified without introducing hidden plumbing.

## Boundaries & Constraints

**Always:** Keep a single real source of truth. Avoid generated mirrors, symlink-based indirection, and GitHub-Action-only transforms. Preserve local `npm run dev` and `npm run build` workflows. Preserve existing page and podcast URLs unless a human explicitly approves a URL change. Keep the content manager workflow centered on obvious folders and plain markdown. Use Astro-supported collection and asset configuration rather than custom runtime hacks.

**Ask First:** Any decision that changes public media URLs such as moving from `/media/...` to another path. Any decision to store large raw video files in git rather than external links, thumbnails, transcripts, or metadata. Any scope increase that migrates staff or events into the new top-level model if that work is not required to land the main `content/` source-of-truth refactor.

**Never:** Do not introduce a second content tree, a sync script, or a build/runtime mirror. Do not require symlinks for local development. Do not leave contributors editing one folder while Astro reads another. Do not depend on a hosted workflow to make local development work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Contributor edits a page, series, or message file under top-level `content/` | Astro reads the entry directly and the rendered route updates after local dev refresh or build | Build succeeds with no extra sync step |
| MEDIA_AUTHORING | Contributor adds or updates a photo reference from the approved top-level media area | The image is previewable in Obsidian and resolves correctly on the built site | Invalid paths fail visibly in the edited page or build verification |
| FRESH_CLONE | A developer clones the repo and runs `npm run dev` or `npm run build` | The app works without generating a runtime mirror or creating symlinks | Setup docs point at the real folders if a path assumption breaks |

</frozen-after-approval>

## Code Map

- `astro.config.mjs` -- current Astro config; likely home for `publicDir` and any related source-directory updates
- `src/content.config.ts` -- current collection definitions; needs migration from legacy layout to loader-based collection config
- `src/pages/index.astro` -- homepage currently reads the page entry from the existing content collection
- `src/pages/[...slug].astro` -- generic page route that assumes the current page collection structure
- `src/pages/series/index.astro` -- custom route that reads pages, series, and messages together
- `src/pages/series/[slug].astro` -- series detail route that should continue to read series entries after the move
- `src/pages/podcast/[slug].astro` -- message route that should continue to read message entries after the move
- `src/lib/render-markdown.ts` -- markdown rendering and Obsidian-style embed normalization; may need path adjustments for the new media convention
- `src/content/` -- current markdown collection location to be retired as the primary authoring surface
- `public/media/` -- current static asset location to be evaluated against the new top-level media structure
- `obsidian/templates/` -- current template location to be replaced by a clearer template home under the top-level content model
- `README.md`, `EDITING_GUIDE.md`, `docs/local-first-workflow.md` -- docs that currently teach the old folder layout

## Tasks & Acceptance

**Execution:**
- [ ] `astro.config.mjs` and `src/content.config.ts` -- migrate from the current legacy collection layout to a loader-based `content/` source-of-truth setup -- this is the core runtime refactor that removes `src/content` as the authoring boundary.
- [ ] `content/` -- create the top-level folder structure for editable markdown and templates, including `pages`, `series`, `messages`, and a clear template location -- this gives the content manager one obvious place to work.
- [ ] `src/content/` and `obsidian/templates/` -- move or retire the old authoring paths so contributors are not left with two competing systems -- this prevents workflow drift.
- [ ] `src/pages/index.astro`, `src/pages/[...slug].astro`, `src/pages/series/index.astro`, `src/pages/series/[slug].astro`, and `src/pages/podcast/[slug].astro` -- update collection access assumptions so routes continue to render from the new top-level content entries without behavioral regressions.
- [ ] `src/lib/render-markdown.ts` and the migrated markdown content files -- establish the new media-path convention under top-level content and update embeds/examples accordingly -- this is where editor friendliness and runtime correctness meet.
- [ ] `README.md`, `EDITING_GUIDE.md`, `docs/local-first-workflow.md`, and `_bmad-output/project-context.md` -- rewrite the workflow documentation around the new single-source-of-truth model -- this keeps the mental model aligned with the codebase.
- [ ] `npm run build` and targeted manual page checks -- verify that the refactor preserves routes, renders markdown from top-level content, and does not require a sync phase.

**Acceptance Criteria:**
- Given a contributor edits a page markdown file under the approved top-level `content/` tree, when the local dev server refreshes or the build runs, then the public page updates without editing `src/` content files.
- Given a contributor edits a series or message entry under the approved top-level `content/` tree, when the corresponding route builds, then the archive and detail pages still resolve correctly from that source.
- Given a fresh clone of the repo, when a developer runs `npm run dev` or `npm run build`, then no content mirror, symlink, or GitHub Action preprocessing step is required.
- Given the approved media convention is used, when a markdown file references an image from the top-level content-managed media area, then the image is usable in Obsidian and served correctly on the site.

## Spec Change Log

## Design Notes

The important design constraint is that “top-level `content/`” should mean real source of truth, not a prettier alias for another runtime directory. The implementation should therefore prefer Astro’s collection loaders and supported config knobs over any approach that duplicates or proxies content.

Media needs deliberate handling because Astro’s static asset serving is configured separately from its content collections. The implementation should keep that complexity inside project configuration, not in contributor-facing workflow rules. If preserving the current `/media/...` URL shape forces an awkward folder layout, stop and confirm the tradeoff with the human before finalizing the structure.

## Verification

**Commands:**
- `npm run build` -- expected: succeeds with collections loading from the new top-level `content/` tree
- `npm run dev` -- expected: representative page, series, and podcast routes render correctly from the moved content

**Manual checks (if no CLI):**
- Open representative routes such as `/`, `/our-story/`, `/series/`, `/series/values/`, and `/podcast/thoughtful/` and confirm they still render the migrated markdown and media.
- In Obsidian, confirm the content manager can find templates, markdown entries, and media from the new top-level structure without needing to understand `src/` internals.
