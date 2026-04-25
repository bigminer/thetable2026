# Astro Media Workflow Decision

## Decision

Use local project-managed media as the long-term workflow.

Do not rely on remote WordPress URLs for launch.

## Chosen Structure

Store migrated media in shared project folders inside the Astro app:

- `site/public/images/`
- `site/public/video/`

Use site-relative paths in frontmatter and content where possible.

Examples:

- `/images/home/hero-photo.jpg`
- `/images/series/the-good-book/cover.jpg`
- `/video/home/table-b-roll.mp4`

## Why This Is The Recommendation

This is the best fit for the current migration because it:

- removes dependency on WordPress staying online
- gives the Astro site ownership of all launch-critical assets
- makes bulk migration easier than ad hoc per-entry attachment handling
- gives editors one clear place to understand where media lives
- avoids turning the early migration phase into a file-organization experiment

## Content Field Guidance

Keep media fields explicit.

- use `heroImage` for image-based heroes
- use `heroVideo` for video-based heroes
- use image-named fields for normal image content

Do not overload one field to represent both image and video when a clearer field can exist without breaking the broader Obsidian/Vault CMS flow.

## WordPress Transition Rule

Remote WordPress media URLs are acceptable only as a temporary spike shortcut.

Before larger migration work or launch:

- copy required menu-reachable site media into the Astro project
- update content entries to reference local project-owned paths

## Editor Workflow

For this migration phase, editors should think of media as shared site assets, not per-entry hidden attachments.

Practical rule:

- images go in `site/public/images/`
- videos go in `site/public/video/`
- content frontmatter points to those site-relative paths

## Naming Guidance

Use stable descriptive names.

Examples:

- `home/table-b-roll.mp4`
- `series/god-on-your-spotify/cover.jpg`
- `pages/our-story/jennifer-and-stacy-family.png`

Avoid opaque uploaded filenames when cleaner names are practical.

## Recommendation

Proceed with local shared media folders as the official migration direction.
