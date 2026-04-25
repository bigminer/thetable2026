# Pages Migration Checklist

## Purpose

Provide a repeatable process for migrating standard menu-reachable WordPress pages into the Astro `pages` collection.

Use this checklist for ordinary page migrations, not for:

- homepage
- series index/detail entries
- pages dominated by forms or embeds

## Target Location

Create or update files in:

- `site/src/content/pages/`

## Use This Checklist For

- `new-here`
- `our-story`
- `our-vision`
- `service-times-locations`
- `meetups`
- `kids-youth`
- `community-meal`
- `get-involved`

Use with caution for:

- `leadership`
- `contact-us`
- `sign-up-for-our-newsletter`

## Source Inputs

For each page, gather:

- page metadata from:
  - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-index.json`
- page HTML from:
  - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-content.json`
- referenced assets from:
  - `/Users/gary/Dev/thetable/wp-content/uploads/`

## Checklist

### 1. Confirm The Page Is In Scope

- Verify the page is reachable from the live site navigation
- Verify it appears in [_bmad-output/astro-migration-inventory.md](/Users/gary/Dev/table-cms-vault/_bmad-output/astro-migration-inventory.md:1)
- Confirm it should be a `pages` collection entry, not `site` or `series`

### 2. Create The Target Markdown File

- Create `site/src/content/pages/<slug>.md`
- Use the filename that should become the route if `slug` is left blank
- Start from [site/editor-templates/page-template.md](/Users/gary/Dev/table-cms-vault/site/editor-templates/page-template.md:1)

### 3. Map Basic Frontmatter

Set:

- `title`
  - from WordPress `title.rendered`
- `description`
  - from WordPress excerpt if useful, otherwise write a short summary manually
- `slug`
  - leave blank to use the filename, or set it explicitly if needed for route parity
- `navTitle`
  - only if the navigation label should differ from the page title
- `draft`
  - use `true` while migrating
  - switch to `false` once content, media, and route are validated

Optional:

- `lede`
  - use the strongest opening statement or summary if the page benefits from it

### 4. Extract Hero Media If The Page Needs It

- Identify whether the WordPress page has a meaningful hero image or header image worth preserving
- Copy the chosen image into:
  - `site/public/images/pages/<page-slug>/`
- Set:
  - `heroImage`
  - `heroImageAlt`

If the page does not meaningfully use hero media:

- leave `heroImage` blank

### 5. Convert Body Content

- Start from `content.rendered`
- remove WordPress layout scaffolding, widget wrappers, and plugin noise
- preserve meaningful:
  - headings
  - paragraphs
  - lists
  - inline images
  - links

Goal:

- produce readable Markdown body content, not a raw HTML dump

### 6. Localize Inline Images

For each inline image kept in the page body:

- find the corresponding source file in `/Users/gary/Dev/thetable/wp-content/uploads/`
- copy it into:
  - `site/public/images/pages/<page-slug>/`
- update the Markdown image reference to the local project path

Do not leave launch-critical inline images pointing at WordPress URLs.

### 7. Decide Whether Sidebar Data Is Needed

Only use `sidebar` when the page clearly benefits from a structured supporting panel.

Good candidates:

- contact details
- service time
- map embed
- supporting vision/callout card
- social embed reference

If needed, map into:

- `sidebar.visionTitle`
- `sidebar.visionBody`
- `sidebar.contactTitle`
- `sidebar.addressLines`
- `sidebar.serviceTime`
- `sidebar.mapEmbedUrl`
- `sidebar.socialTitle`
- `sidebar.socialEmbedUrl`

If not needed:

- omit `sidebar`

### 8. Review Embedded Or External Elements

Before keeping any embed or external form behavior:

- identify whether it is truly launch-critical
- decide whether it should:
  - stay embedded temporarily
  - be replaced with a simpler link
  - be deferred to a later integration workstream

Do not blindly convert plugin-driven form or widget markup into Markdown.

Current migration rule for form-heavy pages:

- convert them into content-complete pages with explicit temporary form stubs
- do not carry over WordPress plugin form implementations into Astro

### 9. Validate The Route

- set `draft: false`
- run the Astro site locally
- verify the route matches the intended live URL
- confirm the page renders without broken local asset references

If a valid new route still 404s locally:

- restart `npm run dev`

### 10. Perform Basic Parity Check

Compare the migrated Astro page against the live WordPress page:

- title and hierarchy
- major text content
- inline images
- supporting/sidebar content
- overall layout intent

Document any intentional differences.

## Do Not Use This Checklist For

- homepage decomposition
- series detail extraction
- pages where most of the value comes from a form plugin workflow

Those should use separate migration procedures.

## Completion Standard

A page migration is complete when:

- the page lives in `site/src/content/pages/`
- required media is local to the Astro project
- the route renders locally
- `draft: false`
- the migrated page is recognizably equivalent to the live page
