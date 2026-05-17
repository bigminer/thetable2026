# The Table Vault Guide

This folder is the Obsidian vault root for the Astro migration spike.

## Open This Folder In Obsidian

Open this directory as the vault:

```text
site/src/content
```

When Vault CMS opens:

1. Run `Vault CMS: Open Wizard`.
2. Let it detect the Astro collections already present here.
3. Confirm `pages`, `series`, `messages`, and `site` as the content groups to work from.

## Where Content Lives

- `pages/`
  Use for regular content pages like `our-story.md`.
- `series/`
  Use for sermon series entries like `the-good-book.md`. These entries describe the series only.
- `messages/`
  Use for individual sermon, message, and podcast items. These display on their series page.
- `site/`
  Use for homepage and other singleton-style site content like `homepage.md`.

## What This Spike Is Proving

- Astro content collections can replace the current WordPress content model.
- Obsidian + Vault CMS can edit the content without turning the site into a developer-only workflow.
- The homepage is the hardest editorial test, but it is now a real `site` collection entry rather than an empty placeholder.

## Suggested First Checks

- Open `_bases/Home.base` from the Home icon and confirm the content groups look sane.
- Open `site/homepage.md` and verify the homepage frontmatter feels understandable.
- Open `pages/our-story.md`, `series/the-good-book.md`, and a message entry to compare the editing experience for different content types.

Homepage fields worth knowing:

- `contactActionLabel` and `contactActionUrl` control the homepage contact CTA.
- `mapEmbedUrl` controls the homepage directions or map embed.

Series fields worth knowing:

- `title`, `description`, artwork fields like `featuredImage`, optional dates, and `draft` describe the series.
- Do not maintain nested `episodes[]` lists in series frontmatter. Individual messages now live in `messages/` so the Obsidian property panel stays flat.
- Add optional series fields such as `featuredImage` only when they are actually used.

Message fields worth knowing:

- `series` connects the message to its parent series. Use Obsidian's link picker to choose the series note, such as `[Lent 2025](../series/lent-2025.md)`.
- `date` controls message ordering.
- `sourceUrl` is the YouTube video URL when available.
- `podcastUrl` is the specific Spotify or podcast-platform episode URL when available.
- `speaker` is optional and should be added only when needed.
- Message files are listed on their series page.

## One-series media automation

The first media-ingestion automation pass is intentionally limited to one series:

- scope slug: `the-good-book`
- config file: `site/scripts/automation.config.json`
- dry-run summary: `npm run automation:dry-run`
- scoped pairing report: `npm run automation:ingest-one-series`

The ingest script reads the scoped YouTube + podcast feeds, reports matches and gaps, and stays dry-run-safe until both `defaults.writeContentFiles` is explicitly changed and the operator runs `npm run automation:ingest-one-series -- --write`.

Because `yt-dlp` is unavailable here and the live YouTube uploads RSS feed is shallow, historical Good Book backfill also falls back to the repo transcript archive at `site/scripts/transcripts/content`, still bounded to this one series.

This follows the Vault CMS model documented for Astro: content stays as plain Markdown in the repo, content types line up with folders under `src/content`, and flat frontmatter works better with Obsidian properties than deeply nested YAML.

## Publishing Notes

This repo still uses normal Git for version control. Inside Obsidian, Vault CMS is only the editing layer; Astro remains the site build layer.

## What Stays External

Some links and embeds are intentionally not converted into local pages:

- Church Center giving and forms
- YouTube embeds and channel links
- Facebook and other social links
- map links or map embeds used for directions
- temporary contact, newsletter, and get-involved form flows while the migration replaces WordPress

Keep those as documented external dependencies so they do not get mistaken for missing local routes.

## Need Help?

- Vault CMS docs: [docs.vaultcms.org](https://docs.vaultcms.org)
- Astro + Vault CMS guide: [docs.astro.build/en/guides/cms/vault-cms/](https://docs.astro.build/en/guides/cms/vault-cms/)
