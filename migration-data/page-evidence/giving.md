# Evidence: Giving

## Source

- URL: https://thetabletx.com/giving/
- WP page ID: 1062
- Title: "Giving"

## Target

- URL: /giving/
- Local preview: http://localhost:4321/giving/
- Astro route: `src/pages/giving.astro` (standalone page, not in content collection)
- Target title: "Giving"

## Purpose

Single-action page that routes visitors to the church's online giving platform (Planning Center / Church Center). Minimal copy; the sole intent is to hand off to the giving transaction flow.

## Sections

Source section inventory in page order:

1. **Give Now link** — Single paragraph: `<a href="https://thetabletx.churchcenter.com/giving?open-in-church-center-modal=true">Give Now</a>`

That is the entirety of source content. No headline, no explanatory copy, no secondary sections.

## CTAs

| Label | Destination | Section |
|---|---|---|
| Give Now | https://thetabletx.churchcenter.com/giving?open-in-church-center-modal=true | Sole content |

## Media

None.

## Integration

- **Planning Center / Church Center**: The giving transaction is handled entirely by Church Center. The source uses a `?open-in-church-center-modal=true` query parameter to trigger the modal on the Church Center site.
- Target currently links to `https://thetabletx.churchcenter.com/giving` (without the modal param). Both URLs lead to giving; the modal param preference can be confirmed with the church.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

The target `giving.astro` is already a standalone Astro page with a hero section, primary CTA ("Open Church Center Giving"), and secondary CTA ("Open Church Center"). This is an improvement over the bare source link. No `raw_html` is needed.

The target adds copy not in the source ("Give through Church Center," lede text about the route staying on the public site). This is acceptable scaffolding text. It should be reviewed by the church before launch to confirm the language matches their intent.

## Known Debt

- Source has no headline or explanatory copy — the target's hero copy is scaffolding added during Astro build, not sourced from the WP original. Church should confirm the target copy before launch.
- The target includes a secondary "Open Church Center" button not present in the source — this is an addition. Confirm with church.
- Modal query param (`?open-in-church-center-modal=true`) is present in source CTA URL but absent from the target CTA href. Behavior difference should be confirmed.
- No visual parity evidence yet (E6-S6 prerequisite).
