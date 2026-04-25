# Style Preservation Checklist

## Purpose

Make style preservation a first-class migration requirement.

The goal is not just to move content into Astro. The goal is to preserve the existing visual identity and user experience of `thetabletx.com` closely enough that the migrated site still feels like the same site.

## Style Requirement

The migration should preserve:

- overall page composition
- typography character
- color palette
- spacing rhythm
- button/link treatment
- image treatment
- homepage section order and visual pacing
- mobile and desktop layout behavior

This does not require pixel-perfect reproduction, but it does require recognizably faithful design continuity.

## Source Inputs

Use:

- live site for visual truth
- Playwright screenshots and walkthroughs
- style token extraction from:
  - `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/style/style-tokens.json`
- theme styles from:
  - `/Users/gary/Dev/thetable/wp-content/themes/thetable/`
  - `/Users/gary/Dev/thetable/wp-content/themes/kerygma/`

## Checklist

### 1. Establish Shared Design Tokens

Before broad migration work:

- extract the practical color palette from the live site
- define Astro CSS variables for:
  - primary background
  - text colors
  - accent color
  - muted/supporting tones
  - borders/shadows
- define the typography stack used in the migration

Goal:

- style decisions should be intentional and centralized, not rediscovered page by page

### 2. Preserve Layout Rhythm

For each migrated page, verify:

- section order matches the live page
- major margins and section spacing feel consistent
- text blocks do not become denser or flatter than the live site

### 3. Preserve Homepage Atmosphere

The homepage should retain:

- strong hero treatment
- visual breathing room
- sectional progression
- large-heading emphasis
- media-rich rhythm

Do not reduce the homepage to a generic content page just because the content has migrated.

### 4. Preserve Navigation And Footer Feel

Verify:

- nav placement and hierarchy
- link prominence
- footer density and information layout

These areas shape the identity of the site as much as the content itself.

### 5. Preserve Mobile Behavior

For each key page type:

- homepage
- ordinary page
- series index
- series detail

Check:

- stacking behavior
- button/link readability
- image cropping
- heading scale
- spacing comfort

### 6. Track Intentional Differences

When a visual difference is deliberate:

- document it
- explain why it changed
- confirm it is an improvement, simplification, or unavoidable implementation difference

Do not allow undocumented drift.

### 7. Use Parity Reviews As Design Reviews

When comparing Astro against the live site, check:

- content parity
- route parity
- visual parity

This should be part of the migration acceptance process, not a cosmetic afterthought.

## Completion Standard

Style preservation is acceptable when:

- migrated pages feel recognizably like the current live site
- major layout and color decisions align with the existing brand
- differences are deliberate and documented
- desktop and mobile both preserve the site’s character
