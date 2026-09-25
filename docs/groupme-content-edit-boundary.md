# GroupMe website content edit boundary

`npm run content:check -- <base-commit>` is the local validation gate for a staff content request. It compares the committed branch with the recorded base and permits only:

- Markdown files under `src/content/` (without raw HTML or `javascript:` links).
- Visible-text edits to existing Astro pages.
- Additions of simple, text-only semantic elements (`p`, `span`, `small`, emphasis tags, headings, and lists) to existing Astro pages. A new element may reuse a static class already used by the same element type in that page. Existing elements cannot be removed, reordered, or retagged.

It rejects `/ask`, API routes, new pages, deletions, symlinks, new links and media, arbitrary attributes or classes, expressions, frontmatter changes, scripts, styles, and all other repository paths. Markup permission is limited to presenting staff-approved content within an existing page; it does not permit changing functionality, site design, or CSS layout. Run the guard from the website checkout after the request branch is committed and before opening or updating the PR. The exact base must be an ancestor commit supplied by the workflow.

This guard defines the staff content scope; it does not grant Hermes tools or GitHub access, validate GroupMe membership, provide a security boundary against a repository administrator, or change the running GroupMe service. The website and operations changes remain separate review tracks.
