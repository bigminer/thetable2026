# Sanitizer Policy

Decision: use `sanitize-html` with a strict allowlist.

This policy exists to preserve useful legacy fragments while stripping the unsafe parts of WordPress/page-builder markup. Raw HTML is allowed only as a migration fallback and is always sanitized before render.

## Goals

- Preserve semantic content, layout-safe structure, and approved embeds.
- Remove scripts, inline event handlers, tracking snippets, and WP/plugin admin markup.
- Keep migrated content usable on mobile without depending on browser quirks.

## Allowed tags

The exact allowlist should stay conservative:

- Text and structure: `a`, `abbr`, `article`, `aside`, `b`, `blockquote`, `br`, `code`, `div`, `em`, `figure`, `figcaption`, `h1`-`h6`, `hr`, `i`, `li`, `ol`, `p`, `pre`, `section`, `small`, `span`, `strong`, `sub`, `sup`, `u`, `ul`
- Media and embeds: `audio`, `iframe`, `img`, `picture`, `source`, `video`
- Tables: `caption`, `col`, `colgroup`, `table`, `tbody`, `td`, `tfoot`, `th`, `thead`, `tr`
- Forms used by approved workflows: `button`, `fieldset`, `form`, `input`, `label`, `legend`, `option`, `select`, `textarea`

## Allowed attributes

Allow the minimum needed for the fragments we are preserving:

- Links: `href`, `title`, `target`, `rel`
- Media: `src`, `alt`, `width`, `height`, `srcset`, `sizes`, `loading`, `decoding`
- Layout/semantics: `class`, `id`, `role`, `title`, `aria-*`, `data-*`
- Forms: `action`, `method`, `name`, `type`, `value`, `placeholder`, `checked`, `selected`, `for`, `autocomplete`

Inline `style` is allowed only where a fragment needs layout preservation, and only for layout-safe properties such as `display`, `flex-*`, `gap`, `margin*`, `padding*`, `width`, `max-width`, `height`, `max-height`, `text-align`, `font-size`, `font-weight`, `color`, `background-*`, `object-fit`, and `border*`.

## Allowed iframe providers

Only approved providers survive sanitization:

- YouTube and YouTube no-cookie
- Vimeo
- Google Maps
- Planning Center / Church Center destinations when the embed surface is known to be safe

Everything else is removed unless a future decision explicitly adds it.

## Stripping rules

- Remove all `script`, `noscript`, `style`, `object`, `embed`, and `template` tags.
- Remove any attribute beginning with `on`.
- Remove `javascript:` URLs and other unsafe URL schemes.
- Remove unknown iframe hosts.
- Remove WordPress admin and plugin chrome, including hidden token inputs that are only meaningful inside the old CMS.

## Representative fragments

The policy must continue to pass the following representative cases:

- SiteOrigin-style hero block with nested headings and inline style
- Formidable contact/newsletter form with labels, inputs, and reCAPTCHA placeholders
- Google Maps embed or link-backed location block
- YouTube video embed or video-shortcode fragment

## Audit note

Every raw HTML block should preserve its source URL and a short reason for why the typed block union could not represent it yet. That makes raw HTML searchable debt instead of silent content loss.
