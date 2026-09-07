# Claude Code — Project Guide

This project's full agent guidance is in [AGENTS.md](AGENTS.md). Read it before making any changes.

Key points for quick reference:

- **What this is**: The Table Church's website — a plain Astro site serving `thetabletx.org`. The repository is the source of truth; don't reference an external site for routes, copy, or design.
- **Design**: [design.md](design.md) is the locked visual system — a cream/slate print-poster look, not a web-app look. Read it before writing markup or CSS. Tokens live in `src/styles/tokens.css`.
- **Stack**: plain Astro, server output, Node standalone adapter, deployed on Render. No CMS, no database.
- **App root**: the repository root.
- **Pages**: one `.astro` file per route in `src/pages`. Page copy is edited in the component, not in Markdown.
- **Collections**: only `series` and `messages`, under `src/content`, schemas in `src/content.config.ts`.
- **Shared facts**: `src/config/site.ts` and `src/config/navigation.ts` — change those, not individual pages.
- **Build**: `npm run build`, then `npm start`. Dev: `npm run dev -- --host 127.0.0.1`. Verify: `npm test` and `npm run test:smoke`.
- **Current phase**: verification and content accuracy, not schema expansion.

There is no CMS and no admin UI — content is files in this repository. Keep the structure lean; do not introduce a content-management abstraction without an explicit decision.
