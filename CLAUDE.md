# Claude Code — Project Guide

This project's full agent guidance is in [AGENTS.md](AGENTS.md). Read it before making any changes.

Key points for quick reference:

- **Goal**: migrate `thetabletx.com` from WordPress to Astro while preserving the live site's public experience.
- **Stack**: plain Astro, server output, Node standalone adapter, deployed on Render. No CMS, no database.
- **App root**: the repository root — there is no `site/` subdirectory.
- **Pages**: one `.astro` file per route in `src/pages`. Page copy is edited in the component, not in Markdown.
- **Collections**: only `series` and `messages`, under `src/content`, schemas in `src/content.config.ts`.
- **Shared facts**: `src/config/site.ts` and `src/config/navigation.ts` — change those, not individual pages.
- **Build**: `npm run build`, then `npm start`. Dev: `npm run dev -- --host 127.0.0.1`. Verify: `npm test` and `npm run test:smoke`.
- **Current phase**: parity review and migration execution, not schema expansion.

The Obsidian + Vault CMS content layer was deliberately removed. Keep the structure lean; do not reintroduce a content-management abstraction without an explicit decision.
