# Editing Guide

Use the markdown templates under `obsidian/templates/` when creating or updating content.

## Templates

- `obsidian/templates/page.md` for `pages`
- `obsidian/templates/message.md` for `messages`
- `obsidian/templates/staff.md` for `staff`
- `obsidian/templates/event.md` for `events`

## Rules

- Keep entries frontmatter-only unless a template explicitly includes a body section.
- Use the approved collection names: `pages`, `messages`, `staff`, and `events`.
- Use reference slugs for related entries like series, speakers, staff groups, and event categories.
- Use structured media objects with `src` and `alt` when a template includes a photo or image field.
- Do not use raw_html.

## Pages

- `title` and `url` are required.
- Add `description` when the page needs search copy.
- Put page sections in `blocks` using typed blocks from the approved schema.
- Use `seo` when you need canonical, social preview, or noindex metadata.

## Messages

- `title`, `publishedAt`, and `summary` are required.
- Add `series` when the message belongs to a series.
- Add `speakers` when the message has one or more speakers.
- Use `seo` for canonical and social metadata if needed.

## Staff

- `name`, `role`, and `bio` are required.
- Add `groups` for directory grouping.
- Add `photo` as a structured media object when available.
- Use `draft: true` while preparing an unpublished profile.
- Start from `obsidian/templates/staff.md` and save the entry as `src/content/staff/<slug>.md`.

## Events

- `title`, `startsAt`, and `summary` are required.
- Add `categories` for event archive grouping.
- Add `url`, `location`, and `seo` when they help with public discovery.

## Publish Check

- The frontmatter parses cleanly.
- The build passes with the updated template.
- The file uses the right collection name before you commit.
