# Recipe: implement approved content schema

## Purpose
Replace the provisional content collections with the schema shape approved in `migration-data/content-model-proposal.md`.

## Inputs
- `migration-data/content-model-proposal.md`
- `src/content.config.ts`
- Existing sample content under `src/content/`

## Steps

1. Open `migration-data/content-model-proposal.md` and copy its collection names, block names, reference relationships, SEO fields, and media rules exactly.
2. Update `src/content.config.ts`.
3. Define these collections: `pages`, `messages`, `series`, `speakers`, `staff`, `staff-groups`, `events`, `event-categories`.
4. Define these block types: `markdown`, `hero`, `feature_grid`, `card_grid`, `columns`, `image_grid`, `video_embed`, `form_embed`, `map_embed`, `quote`, `staff_spotlight`, `series_feature`, `event_feature`, `social_links`, `raw_html`.
5. Keep `raw_html` strict: it must require `sanitized: true`, `source.url`, and `source.reason`.
6. Add the shared SEO fields: `title`, `description`, `canonical`, `noindex`, `ogImage`, `twitterCard`, `jsonLd`.
7. Use `reference()` only for relationships named in the proposal.
8. Adjust existing sample content only enough for `npm run build` to pass.

## Non-goals
- Do not migrate the full WordPress content set.
- Do not add routes.
- Do not add hosted integrations.
- Do not invent new collections or block types.

## Verify
```bash
bash scripts/verify/E2-S1.sh
```

Expected exit code: `0`.

## If it fails
- Missing collection or block type: add the exact missing schema item from the proposal.
- Build fails on sample content: update only the sample entry fields needed to match the new schema.
- Missing decision or ambiguous field shape: stop, append a `JOURNAL.md` blocker entry, and mark `E2-S1` blocked.
