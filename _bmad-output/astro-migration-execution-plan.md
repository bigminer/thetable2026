# Astro Migration Execution Plan

## Purpose

Turn the current spike outcome into a practical migration path from WordPress to Astro without losing the editorial workflow that was validated with Obsidian + Vault CMS.

This plan assumes the current recommendation remains:

- proceed with Astro
- proceed with Obsidian + Vault CMS
- proceed with caveats

## Current Decision State

What is already proven:

- Astro content collections can model the initial proof set
- Obsidian + Vault CMS is a viable editing workflow for `pages`, `series`, and `site`
- editors can create and update content directly in the vault
- the authoring workflow has been hardened enough to continue
- the migration must preserve the visual identity of the current site, not just its content
- the navigation structure and target behavior must remain aligned with the live site

What is not fully settled yet:

- the full WordPress-to-Astro migration mapping for every content type
- the exact launch cutover process

## Recommended Migration Principle

Use WordPress as the migration source, not the long-term CMS.

The source of truth after migration should be:

- Astro project content collections
- Git history
- Obsidian + Vault CMS for editorial work

## Migration Workstreams

### 1. Content Model Finalization

Finalize the content collections that will exist beyond the spike.

Recommended initial collections:

- `pages`
- `series`
- `site`
- `staff`
- `speakers`

Deferred or externalized initially:

- podcast episodes
- events
- forms

Success condition:

- every in-scope content type has an agreed schema, route pattern, and ownership model

### 2. WordPress Content Extraction

Use the WordPress REST API and local WordPress backup to extract:

- pages
- media references
- series-related page content
- navigation structure
- staff or speaker content if present

Working rule:

- prioritize the live public site shape over historical WordPress residue
- only migrate content that is still part of the intended public experience

Success condition:

- there is a clean inventory of what will be migrated, what will be dropped, and what will remain external

### 3. Content Transformation

Convert extracted WordPress content into Astro collection entries.

For each migrated content type:

- map WordPress fields to Astro frontmatter
- move longform body content into Markdown
- normalize slugs
- normalize image references
- preserve public URL structure where possible

Success condition:

- transformed Markdown entries validate against Astro schemas before rendering work begins

### 4. Media Workflow

The media decision is now:

- use local project-managed media
- store images in `site/public/images/`
- store videos in `site/public/video/`
- treat remote WordPress URLs as a temporary spike shortcut only

Field guidance:

- keep `heroImage` for image-based heroes
- keep `heroVideo` as the optional video slot
- keep image-oriented fields explicit so Vault CMS image workflows stay understandable

Success condition:

- required launch media is copied locally and referenced from project-owned paths

### 5. Template Expansion

Expand the current proof-set templates into the broader site.

Recommended order:

1. remaining regular pages
2. homepage refinements
3. staff / leadership pages
4. series cleanup and repeatability checks
5. navigation and footer parity

Success condition:

- the migrated site covers all in-scope public pages that matter for launch

### 6. Style Preservation

Treat style preservation as a parallel workstream, not a final polish pass.

Preserve:

- page composition
- typography character
- color palette
- spacing rhythm
- navigation/footer feel
- desktop and mobile behavior

Working rule:

- the Astro site should feel like the same site, not a new design with reused copy

Success condition:

- migrated pages remain recognizably faithful to the current live site

### 7. Navigation Preservation

Treat navigation as a launch-critical behavior, not a final cleanup item.

Preserve:

- main menu structure
- grouping and label intent
- internal route targets
- external target behavior
- mobile navigation usefulness

Working rule:

- if a menu item exists on the live site, its Astro replacement should lead to the same intended destination and user expectation

Success condition:

- the migrated navigation behaves like the current live navigation, including external destinations such as giving

### 8. External Integrations

Keep these as explicit workstreams instead of burying them inside content migration:

- podcast system-of-record decision
- events display strategy
- forms replacement after migration

Recommended launch posture:

- do not block the main content migration on a perfect long-term events/forms system
- allow pragmatic temporary integrations if public UX remains acceptable
- for the initial migration, form-driven pages may ship as explicit stubs rather than WordPress-form carryovers

Success condition:

- each external dependency has an owner, a source of truth, and a launch plan

### 9. Parity Review

After the site is broadly migrated:

- compare every menu-reachable page against the live site
- verify content hierarchy and route parity
- verify style and visual identity parity
- verify navigation labels, grouping, and targets
- verify mobile and desktop behavior
- verify editors can update representative content safely

Success condition:

- remaining differences are cosmetic or deliberately documented

### 10. Launch Planning

Treat launch as a separate workstream.

Launch tasks:

- confirm hosting target
- confirm DNS/domain control
- confirm SSL handling
- confirm redirect needs
- confirm rollback posture
- confirm preview and approval workflow

Success condition:

- cutover is planned as an operational change, not mixed into ordinary content migration work

## Recommended Implementation Sequence

1. Finalize the long-term content model
2. Copy the chosen media workflow into implementation and begin localizing launch-critical assets
3. Inventory exactly which WordPress content will migrate
4. Build a content transformation script/process for `pages` and `series`
5. Define and apply shared design tokens and style-preservation rules
6. Preserve navigation structure and target behavior while migrating menu-reachable pages
7. Add `staff` and `speakers` if required for the public site
8. Resolve external integrations
9. Perform full parity review
10. Prepare launch and cutover

## Suggested Deliverables

- migration inventory document
- schema mapping document from WordPress to Astro collections
- media workflow document
- style preservation checklist
- navigation preservation checklist
- transformed content set inside `site/src/content/`
- parity checklist against menu-reachable live pages
- launch checklist

## Open Decisions To Resolve Early

- Which content currently in WordPress should be intentionally dropped?
- What is the true podcast source of record?
- What is the launch hosting target?

## Recommendation

Proceed into migration planning and staged implementation.

Do not spend more time proving the editorial model in the abstract. That question has been answered well enough to continue. The next useful work is migration execution design and content movement.
