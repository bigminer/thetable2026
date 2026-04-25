# Claude Code — Project Guide

This project's full agent guidance is in [AGENTS.md](AGENTS.md). Read it before making any changes.

Key points for quick reference:

- **Goal**: migrate `thetabletx.com` from WordPress to Astro while preserving the live site's public experience.
- **Stack**: Astro + Vault CMS (Obsidian-based editing, no CMS server or database).
- **Content root**: `site/src/content` — also the Obsidian vault root.
- **Build**: `cd site && npm run build` (or `npm run dev -- --host 127.0.0.1`).
- **Current phase**: parity review and migration execution, not schema expansion.

When in doubt, every decision must satisfy both sides: the public site feels like the live WordPress site, and the content stays editable through Obsidian + Vault CMS. If those goals conflict, surface the tradeoff before adding complexity.
