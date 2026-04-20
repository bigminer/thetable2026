# Local-First Workflow

This project is built to stay editable and verifiable locally for as long as possible. The goal is to keep content changes simple for non-technical contributors while avoiding premature hosting or CMS decisions.

## Source of Truth

- `src/content` is the runtime source of truth for the site.
- `obsidian/templates` is the authoring entry point for non-technical contributors.
- `_bmad-output/project-context.md` captures the implementation rules that AI agents should follow.

## Content Editing Flow

1. Start from the relevant Obsidian template.
2. Keep content in frontmatter unless the template explicitly includes a body.
3. Save the entry into the matching collection folder under `src/content`.
4. Prefer typed blocks and structured media objects over raw HTML.
5. Use reference slugs for related content such as series, speakers, staff groups, and event categories.
6. Run `npm run build` locally before considering the change done.

## Integration Flow

- Planning Center events should default to the local fixture snapshot.
- API-backed refreshes should stay optional and should not block local development.
- External services such as Church Center and Google Business should remain links or embedded targets, not content stores.

## Migration Rules

- Treat existing `raw_html` pages as migration leftovers.
- Convert them to typed blocks only when there is a clear, lower-risk replacement.
- Preserve existing URLs and canonical paths unless a deliberate migration requires changes.

## Hosting Policy

- Do not pick a hosting platform until the local workflow is stable.
- Prefer deployment targets that can consume the current static Astro build without introducing a new CMS.
- If hosting is needed later, choose the simplest option that preserves the current markdown-first workflow.

## Practical Guardrails

- Keep routes thin and content-driven.
- Keep integration code in `src/lib`.
- Keep config and simple data in `src/data`.
- Keep assets under `public/media`.
- Avoid adding new infrastructure before the local content model is settled.

