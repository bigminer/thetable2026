---
title:
series: ""
date:
draft: true
---

Write the message summary or notes here in Markdown.

Use this template for individual sermon, message, or podcast items. Keep frontmatter flat so it works cleanly in the Obsidian property panel.

Optional fields:

- `speaker`
- `sourceUrl`
- `podcastUrl`

Draft workflow:

1. Create the file as a draft.
2. Set `series` with Obsidian's link picker by choosing the related note in `series/`.
3. Add `speaker`, `sourceUrl`, or `podcastUrl` only when needed.
4. Change `draft` to `false`.
5. If the new route still `404`s locally, restart `npm run dev`.
