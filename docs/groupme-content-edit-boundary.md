# GroupMe website content edit boundary

`npm run content:check -- <base-commit>` is the local validation gate for a staff content request. It compares the committed branch with the recorded base and permits only:

- Markdown files under `src/content/` (without raw HTML or `javascript:` links).
- Visible-text edits to existing Astro pages, with page structure and frontmatter preserved.

It rejects `/ask`, API routes, new pages, deletions, symlinks, layout or attribute changes, expressions, scripts, styles, and all other repository paths. Run it from the website checkout after the request branch is committed and before opening or updating the PR. The exact base must be an ancestor commit supplied by the workflow.

This guard defines the staff content scope; it does not grant Hermes tools or GitHub access, validate GroupMe membership, provide a security boundary against a repository administrator, or change the running GroupMe service. The website and operations changes remain separate review tracks.
