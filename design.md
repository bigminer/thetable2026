# Design — The Table Church

A locked design system for thetabletx.com. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the system
needs to grow.

The system is derived from The Table's own printed and social graphics — the woodgrain
logo mark, the cream/slate event posters, the Instagram declaration posters, and the
values tee. It is a **print-poster system**, not a web-app system. Cards, pills, drop
shadows, and rounded corners are foreign to it.

## Genre

editorial

## Macrostructure families

- **Manifesto pages** — `/` only, at present.
  Polemical large type, full-bleed colour bands as the divider language, declarations
  before actions. Varies on: hero archetype (H1 marquee / H6 photographic fold).

  *Amended during the rollout:* `/new-here/`, `/plan-your-visit/` and `/our-vision/`
  were originally assigned here. On reading them they are informational, not
  polemical — Manifesto sells agreement, and those pages sell logistics. Forcing the
  shape would have meant rewriting copy the church asked to keep. They ship as Long
  Document instead.

- **Long Document pages** — every prose route: `/new-here/`, `/our-story/`,
  `/our-vision/`, `/leadership/`, `/service-times-locations/`, `/kids-youth/`,
  `/meetups/`, `/get-involved/`, `/community-meal/`, `/merch/`,
  `/plan-your-visit/`, `/what-sundays-are-like/`, `/contact-us/`,
  `/sign-up-for-our-newsletter/`, `/privacy-policy/`, `/404/`.
  Slate masthead band → optional full-bleed figure → cream body. Continuous prose at
  one measure, hairline-ruled section heads, no cards. Varies on: whether a sidebar
  or a photo column is present.

  Two implementations, one look: pages routed through `ContentPage.astro` read
  `src/styles/content-page.css`; hand-built pages use the `.longform` /
  `.longform-mast` classes in `global.css`. Keep the two in step.

- **Ledger pages** — `/series/` and `/series/[slug]/`.
  The row pattern from the church's own "Upcoming Events" graphic: a fixed key
  column on the left, a hairline rule per row, the label on the right. On the index
  the key is the series artwork; on a series page it is the message date.

## Theme

Custom, anchored on the two brand colours plus the recurring orange-red from the feed.

- `--color-paper`        `oklch(94% 0.034 94)`   cream — the default ground
- `--color-paper-2`      `oklch(91% 0.036 94)`   deeper cream — raised areas, inputs
- `--color-band`         `oklch(38% 0.020 200)`  slate-teal — full-bleed section bands
- `--color-band-2`       `oklch(29% 0.018 200)`  deep slate — footer, hero scrim
- `--color-ink`          `oklch(24% 0.016 198)`  primary text on cream
- `--color-ink-2`        `oklch(42% 0.014 198)`  secondary text on cream
- `--color-muted`        `oklch(52% 0.012 198)`  captions, meta
- `--color-rule`         `oklch(78% 0.020 94)`   hairline on cream
- `--color-ink-on-band`  `oklch(94% 0.034 94)`   cream text on slate
- `--color-muted-on-band` `oklch(76% 0.022 96)`  secondary text on slate
- `--color-rule-on-band` `oklch(52% 0.018 200)`  hairline on slate
- `--color-accent`       `oklch(61% 0.166 34)`   orange-red — sampled from the logo mark
- `--color-accent-deep`  `oklch(48% 0.155 32)`   accent at text contrast on cream
- `--color-accent-ink`   `oklch(96% 0.020 94)`   cream, for text sitting on accent
- `--color-focus`        `oklch(63% 0.19 34)`    focus ring only

**Accent budget: ≤ 3% of any viewport.** The accent is a marker — an active nav item,
a rule under a hovered link, a single filled dot closing a statement, a focus ring.
Never a filled button, never a section ground.

**Accent on slate is decorative only.** `--color-accent` at L 61% against
`--color-band` at L 38% does not clear text contrast. On dark bands the accent appears
as a filled dot or a rule, never as type.

## Typography

- **Display**: Big Shoulders Display, weights 400 / 700 / 800, `font-style: normal`.
  Condensed industrial grotesque. Used uppercase with `letter-spacing: 0.01em` at
  display sizes, `0.06em` at label sizes.
- **Body**: Switzer (Fontshare), weights 400 / 600.
- **Mono**: none. The system has no code or tabular-data surface.
- **Wordmark**: the existing `the-table-written-logo.png`. The brand script is an image,
  not a font. **Do not substitute a script webfont** — no free face matches the mark, and
  a near-miss beside the real logo reads worse than no script at all.
- Type scale anchor: `--text-display: clamp(2.5rem, 7vw + 0.5rem, 5.25rem)`.
  Ratio 1.25 (major third).
- All-caps display line-height floor: `1.02`. Never below `1.0`.

### The justified-caps block — the signature move

The one structural device carried directly from the church's Instagram: an all-caps
display statement set **justified**, so word-gaps stretch to the measure. It is the
system's most recognisable move and its most easily overused.

**One per page, maximum.** The hero statement, or a single mid-page pull-statement —
never both. Requires `hyphens: none` and `text-align: justify` with
`text-align-last: left`. Never applied to body copy, never below 40 rem where the
word-gaps blow out (drops to `text-align: left`).

## Spacing

4-point named scale. Values live in `src/styles/tokens.css`. Pages use named tokens
(`var(--space-lg)`), never raw values. Section padding deliberately varies — the
values band is tighter top than bottom; the visit band is the reverse.

## Texture

A hand-built SVG woodgrain (`--woodgrain`, a data-URI in `tokens.css`) applied as a
`mask-image` over a token-coloured layer, so one asset serves both grounds:

- on cream: `--color-ink` at 0.045 opacity
- on slate: `--color-ink-on-band` at 0.05 opacity

Never as a `background-image` with a baked colour — that breaks token discipline and
prevents the ground from following the palette.

## Motion

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out:
  cubic-bezier(0.65, 0, 0.35, 1)`. Durations `--dur-short: 160ms`, `--dur-mid: 240ms`.
- Reveal pattern: **none.** No scroll-triggered entrances anywhere on the site.
- The only animated properties are link underline `transform` and background-colour on
  interactive rows.
- Reduced-motion fallback: all transitions collapse to `0.01ms`.

## Microinteractions stance

- Silent success. No celebratory toasts.
- Focus rings appear instantly — never transitioned.
- Hover affordances always have a matching `:focus-visible` state.
- Nav disclosure works on click and hover on pointer devices, click only on coarse.

## CTA voice

- **Primary**: C3 typographic link — the verb, an arrow, and a rule that thickens and
  turns accent on hover. No box, no fill, no pill.
- **Secondary**: the same, at body size and muted colour.
- **Giving** is the one exception: it may take a bordered chip (C1) because it is a
  transaction, not a reading action. Border, not fill.

## Forms

One shared block, `.site-form` in `global.css`, used by `/contact-us/` and
`/sign-up-for-our-newsletter/`.

- Field and submit share a 44px base height.
- `border-width` never changes between states — state goes to `background-color`,
  `border-color`, and `outline`. Changing border width shifts layout.
- The focus ring is an `outline`, reserved as `2px solid transparent` at rest so
  activating it moves nothing.
- The status line reserves `min-height: 1lh`, so an appearing error does not push
  the page down.
- Disabled is signalled on three channels: `opacity`, `cursor: not-allowed`, and the
  native `disabled` attribute.

## Target sizes

44px minimum on standalone affordances at `48rem` and below, and on any coarse
pointer. **Inline links inside running prose are deliberately exempt** — WCAG 2.5.8
exempts targets whose size is governed by the line-height of surrounding text, and
padding them to 44px destroys the leading. A paragraph whose only content is a link
counts as standalone, not inline.

## Giving

`/giving/` embeds the Church Center giving form inline.

**This is undocumented, not broken.** Planning Center documents a modal, a
direct link, per-fund links, and prefill parameters — no inline embed. It works
because churchcenter.com sends no `X-Frame-Options` and no CSP
`frame-ancestors`, so the page permits framing; their own modal is an iframe
pointed at the same URL. Verified against the live response headers. They could
add a framing policy at any time and this would stop rendering without warning —
the fallback link below is what keeps that from being an outage.

**It does not fit a phone.** Measured: in a 350px frame their layout overflows
and clips — "General" renders as "neral" — because the form needs roughly 480px.
This is the same reason Planning Center's own modal opens a new window on
mobile. So the embed is added only above 544px, by a small inline script. The
markup ships the link; the script swaps in the iframe where it fits. With no
JavaScript, a narrow viewport, or a blocked frame, everyone gets the link, and
the link has always worked. Nothing in the payment path depends on our script.

**Apple Pay does not work in an embedded context.** Planning Center documents
this for their own modal; it applies to any framed context. Card and bank
payment are unaffected. Anyone who wants Apple Pay uses the direct link.

**What we own and what we don't.** The masthead, the ground, the type, the chip,
and the column the form sits in are ours. The form's interior is their markup on
their origin: it cannot be themed, and its own responsive behaviour is theirs
too — at this width the frequency options become a horizontal scroller rather
than wrapping. Do not try to style it.

**One Astro gotcha.** The iframe is created in JS, so it never receives the
build-time `data-astro-cid` attribute that scopes page styles. `.give-frame`
must stay `:global()` or it silently loses its height.

## Known gaps

- `/ask/` (the sermon search tool) was left on its own palette-agnostic CSS. It uses
  `currentColor`, `inherit`, and neutral greys, so it inherits the new type and
  grounds automatically. It is not linked from the nav. Convert it when it ships.
- `.staff-card` portraits are shown at their native colour. The source set is
  inconsistently lit; a uniform treatment would help, but that is a decision about
  the church's own photographs, not a design-system default.

## Per-page allowances

- Manifesto pages MAY use a full-bleed video or photograph as a hero ground, always
  behind a slate scrim at ≥ 0.55 alpha so display type clears contrast.
- Long Document pages: typography only. No enrichment.
- Ledger pages: hairline rules only. No enrichment.

## What pages MUST share

- The wordmark image and its placement in the masthead.
- The two-colour ground system: cream is the default, slate is the emphasis. A page
  that is all-cream or all-slate has lost the rhythm.
- Big Shoulders Display for every heading; Switzer for every paragraph.
- The CTA voice — typographic links, never filled buttons.
- Hairline rules as the only divider inside a ground; full-bleed band changes as the
  only divider between grounds.
- Zero rounded corners. Zero drop shadows. `--radius: 0` is a real token and it is 0.

## What pages MAY differ on

- Macrostructure within the page-type family.
- Hero archetype on Manifesto pages (H1 marquee / H6 photographic fold).
- Section padding rhythm.
- Whether the page opens on cream or on slate.

## Exports

Drop-in formats for re-using this system.

### tokens.css

The canonical file is `src/styles/tokens.css`, imported by
`src/styles/global.css` and carries every `--color-*`, `--font-*`, `--space-*`,
`--text-*`, `--ease-*`, `--dur-*`, `--rule-*`, `--z-*` and `--radius` token.

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:   oklch(94% 0.034 94);
  --color-band:    oklch(38% 0.020 200);
  --color-ink:     oklch(24% 0.016 198);
  --color-accent:  oklch(61% 0.166 34);
  --font-display:  "Big Shoulders Display", "Arial Narrow", sans-serif;
  --font-body:     "Switzer", ui-sans-serif, sans-serif;
  --spacing-md:    1rem;
  --text-md:       1.25rem;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper":  { "$value": "oklch(94% 0.034 94)",  "$type": "color" },
    "band":   { "$value": "oklch(38% 0.020 200)", "$type": "color" },
    "ink":    { "$value": "oklch(24% 0.016 198)", "$type": "color" },
    "accent": { "$value": "oklch(61% 0.166 34)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Big Shoulders Display", "$type": "fontFamily" },
    "body":    { "$value": "Switzer", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:         94%  0.034 94;
  --foreground:         24%  0.016 198;
  --primary:            61%  0.166 34;
  --primary-foreground: 96%  0.020 94;
  --muted:              91%  0.036 94;
  --muted-foreground:   52%  0.012 198;
  --border:             78%  0.020 94;
  --input:              78%  0.020 94;
  --ring:               63%  0.19  34;
  --radius:             0px;
}
```
