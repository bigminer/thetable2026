# Astro Migration Brief

## Project

Migrate `https://thetabletx.com/` from WordPress on WP Engine to Astro with Markdown-managed content and a simpler, safer editorial workflow.

## Primary Goals

- Preserve the current public experience as closely as possible
- Make content easier for non-technical administrative staff to manage
- Reduce WordPress maintenance burden, plugin risk, and bot/form exposure
- Preserve current URL structure wherever possible
- Launch only after full validation, then cut over all at once

## Scope Anchor

The source of truth for scope is the current live production site and the pages reachable from the site's navigation, not everything present in the downloaded WordPress folder at `/Users/gary/Dev/thetable`.

## Non-Negotiables

- Public UX should remain nearly identical to the current site
- Navigation should remain effectively the same
- HTTPS must be preserved
- Editorial workflow and CI/CD both need to be strong
- A publish/deploy step after editing is acceptable
- Preview hosting can be public

## Editorial Model

Target editor:

- Administrative staff
- Non-technical
- Comfortable with a text-document-like workflow
- Obsidian plus `vaultcms` is the leading candidate

Editorial goals:

- Editing should feel like working in a document, not navigating WordPress admin
- The system should avoid exposing editors to code, Git complexity, or fragile CMS structure
- Content modeling should follow `vaultcms` conventions where practical rather than inventing custom patterns too early

## Content Strategy

Markdown-authored content should likely include:

- Pages
- Homepage content
- Series
- Staff
- Speakers

External or integrated content should likely include:

- Podcast episodes, ideally pulled from the upstream source instead of manually duplicated
- Events, ideally displayed from an external API/embed or lightweight reference
- Forms, temporarily preserved or simplified for launch, then later replaced with Planning Center and/or Google integrations

## Proof-Of-Framework Requirement

Before deeper migration planning, validate that `vaultcms` works as a real editorial framework for multiple content types, not just a demo page.

Required proof set:

- A `series` content type with editable title, description, image, linked episodes, speaker, scripture, dates, and related metadata
- A representative text-and-image content page
- The default landing page / homepage

Success means:

- These content types can be modeled cleanly in Astro
- Editing them in the chosen `vaultcms` pattern feels viable for non-technical staff
- The framework appears repeatable across the broader site

## Migration Strategy

Recommended sequence:

1. Validate `vaultcms` editorial fit first
2. Define Astro content collections and routing model
3. Rebuild the proof set with high visual fidelity
4. Expand to the remaining page and collection types
5. Add external integrations for podcast, events, and forms
6. Perform parity validation against the live site
7. Launch via full cutover after approval

## Launch Strategy

- Replace WordPress all at once after the Astro site is fully functional
- Use a public preview URL for stakeholder review
- Preserve URLs wherever possible
- Treat DNS/domain cutover as a dedicated launch workstream

## Known Dependencies

- Confirm how `vaultcms` recommends structuring:
  - homepage content
  - page frontmatter/body patterns
  - media management
- Confirm the real podcast system of record
  - current understanding: podcast is associated with Spotify
  - likely need access details from the current owner
- Confirm how WP Engine currently handles:
  - domain registration
  - DNS
  - SSL
  - cutover mechanics
- Confirm how events should be integrated from the current external system
- Confirm future form replacement direction:
  - Planning Center
  - Google Workspace / Google Forms / related APIs

## Risks

- `vaultcms` may look promising for simple pages but fail to scale cleanly across multiple content types
- The WordPress backup may contain noise that distracts from the live-site scope
- Domain/DNS control may complicate launch timing
- Podcast and event integration details may depend on account access not yet available
- Visual parity on the homepage may require more effort than standard content pages

## Immediate Next Step

Build a small Astro + `vaultcms` validation spike focused on:

- one series entry
- one representative text-and-image page
- the homepage

This spike should answer whether the editorial model is viable before deeper infrastructure or cutover planning.
