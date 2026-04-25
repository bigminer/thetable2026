# Vault CMS Spike Plan

## Purpose

Prove that an Astro plus `vaultcms` workflow can support the real editorial needs of `thetabletx.com` before deeper migration and hosting work begins.

This spike is not a full migration. It is a framework validation exercise.

## Why This Spike Exists

The project should not invest heavily in hosting, cutover, or full content migration until the editorial model is credible for non-technical staff. The spike should answer whether `vaultcms` can support multiple real content types in a way that feels durable, not just impressive in a narrow demo.

## Source Documents

- [astro-migration-brief.md](/Users/gary/Dev/table-cms-vault/_bmad-output/astro-migration-brief.md)
- WordPress backup and extracted materials in `/Users/gary/Dev/thetable`

## Core Question

Can Astro plus `vaultcms` provide a Markdown-centered workflow that preserves the current site experience while remaining usable for non-technical administrative staff across multiple content types?

## Spike Objectives

- Validate that `vaultcms` works for more than one content shape
- Confirm that the editing model feels close to editing a text document
- Verify that Astro content structures can express the needed fields cleanly
- Preserve high visual fidelity for the chosen proof set
- Learn which content should be authored in Markdown and which should stay external

## In-Scope Proof Set

The spike must include these three proof targets:

1. A `series` content type
2. One representative text-and-image page
3. The default landing page / homepage

## Seed Content Selection

The source set for this spike should be derived from the live site navigation, not chosen arbitrarily from the WordPress backup.

- Use Playwright to navigate `https://thetabletx.com/`
- Visit each page reachable from the main menu system
- Record the menu-reachable page inventory in the spike notes
- Choose the representative page and homepage comparisons from that live inventory
- Use the current live site's `series` presentation and fields as the baseline for the initial `series` schema

This keeps the spike anchored to the public site that actually matters rather than historical WordPress residue.

## Build Targets

The spike should produce a working Astro implementation that demonstrates:

- content schemas for the three proof targets
- Markdown-authored content following the closest practical `vaultcms` pattern
- image handling that is credible for editor use
- layout fidelity strong enough to judge whether the migration approach is viable

## Visual Parity Standard

The spike does not need pixel-perfect parity with the live site. It does need strong content and layout parity that is grounded in direct comparison against the current production site.

- Use Playwright to capture the current live site's menu-reachable pages as reference material
- Compare the spike output against the corresponding live pages on desktop and mobile
- Prioritize matching content, structure, hierarchy, and overall layout behavior over pixel-level exactness
- Document any intentional differences in a short "known differences" note so the spike cannot pass on vague impressions alone

## Content Expectations By Proof Target

### 1. Series

The `series` model should support editing:

- title
- description
- image
- linked episodes
- speaker
- scripture
- dates
- related visible metadata

The purpose of this proof target is to validate structured content with references, media, and multiple field types.

The initial `series` schema should follow the current live site's visible structure and terminology as closely as practical. Do not invent extra abstraction unless the live site's field shape forces it.

### 2. Representative Page

The chosen page should include:

- rich text
- one or more images
- layout fidelity that matters visually

The exact page model should follow the cleanest `vaultcms` pattern rather than a custom schema invented too early.

### 3. Homepage

The homepage should validate the highest-risk layout and content editing path on the site. The internal authoring structure can be single-document or modular, depending on the best `vaultcms` pattern, but the public result should closely match the live site.

## Explicitly Out Of Scope

To keep the spike honest and small, these items are not required for success:

- full domain cutover planning
- final DNS or WP Engine transition work
- complete podcast integration
- complete event integration
- final form replacement
- migration of all pages or all historical content

Events and forms may be stubbed, simplified, or represented with placeholders if needed.

## Success Criteria

The spike succeeds if all of the following are true:

- The three proof targets render with strong visual fidelity relative to the current site
- The three proof targets preserve the live site's content and layout intent without requiring pixel-perfect reproduction
- The content model feels repeatable across additional site sections
- A non-technical editor could plausibly maintain the modeled content in the chosen workflow
- The `series` type does not feel awkward or overengineered
- The homepage can be edited without creating a fragile custom one-off system
- The spike produces a clear recommendation on what belongs in Markdown versus external integrations

## Failure Criteria

The spike should be considered a failure or warning signal if:

- `vaultcms` works well only for a single page shape
- the content structures become confusing or brittle across content types
- editors would need too much knowledge of file structure, frontmatter, or Git mechanics
- the homepage requires unnatural workarounds
- structured content like `series` becomes harder to manage than it is worth

## Questions The Spike Must Answer

- How does `vaultcms` recommend structuring pages?
- How does `vaultcms` recommend structuring homepage content?
- How does `vaultcms` recommend handling images and media?
- Which content types are best authored in Markdown?
- Which content types should be integrated from external systems?
- Does the resulting workflow feel safe for administrative staff?
- Does the implementation path appear scalable to the rest of the site?
- Does the initial `series` schema match the way the current site already presents series information?

## Validation Checklist

Before the spike is considered complete, confirm:

- the homepage can be edited without special-case code hidden outside the content model
- the representative page can mix rich text and images cleanly
- the `series` model can express real metadata without awkward frontmatter sprawl
- the proof targets have been compared against the live site using Playwright-based reference capture and walkthroughs
- at least one editor flow is prepared for local validation once the local site is running:
  - edit content
  - preview changes
  - publish or deploy changes
- the public output is close enough to the live site that further fidelity work feels incremental, not architectural

## Recommended Implementation Order

1. Review `vaultcms` documentation and examples
2. Use Playwright to inventory the menu-reachable live pages and capture parity references
3. Define the minimum Astro content collections needed for the proof set
4. Derive the initial `series` schema from the current live site's visible series structure
5. Build the `series` content type
6. Build the representative text-and-image page
7. Build the homepage
8. Capture editorial workflow notes while building
9. Perform local editor validation once the site is runnable
10. Summarize findings and make a go/no-go recommendation

## Required Inputs

- Current live site for visual reference: `https://thetabletx.com/`
- Local WordPress backup: `/Users/gary/Dev/thetable`
- Extracted migration data, especially `/Users/gary/Dev/thetable/migration-data/site-manifest-latest`
- Playwright-based inventory of the pages reachable from the live site's menu system

## Deliverables

The spike should produce:

- a minimal Astro implementation of the three proof targets
- the initial content model used by the proof set
- notes on the `vaultcms` editing workflow
- a short findings summary
- a launch recommendation for the migration approach
- a recommendation:
  - proceed with `vaultcms`
  - proceed with caveats
  - do not proceed
- a short note describing known differences between the spike output and the live site

## Suggested Artifact Paths

To keep the work inspectable, prefer capturing spike outputs in:

- implementation work inside the Astro project workspace
- findings and decisions in `/Users/gary/Dev/table-cms-vault/_bmad-output/`
- any source inventories or extracted references linked from `/Users/gary/Dev/thetable/index.md`

## Decision Rule

Do not move into full migration planning until this spike answers whether the editorial framework is genuinely viable across multiple content types.
