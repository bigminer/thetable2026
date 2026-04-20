# Evidence: New Here

## Source

- URL: https://thetabletx.com/new-here/
- WP page ID: 1168
- Title: "New Here?"

## Target

- URL: /new-here/
- Local preview: http://localhost:4321/new-here/
- Astro content file: `src/content/pages/new-here.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "New Here?"

## Purpose

Newcomer orientation page. Helps first-time visitors know what to expect at a Sunday service, how to find and park at the venue, and what next steps are available after attending.

## Sections

Source section inventory in page order:

1. **Welcome heading** — "Welcome to The Table"
2. **Plan Your Visit** — Arrive early, greeted by friendly faces, all welcome
3. **Maps & Parking** — Address: 1520 Blackburn Rd., Sachse, TX 75048; Google Maps link
4. **What's Next? The Table Class** — Description of Welcome Class (Sunday afternoons, 3:00–4:30pm, childcare available); prompts visitor to contact for next date
5. **Want Someone to Contact You?** — Soft prompt to reach out via contact form

## CTAs

| Label | Destination | Section |
|---|---|---|
| Click here for a map and directions | https://www.google.com/maps/place/First+United+Methodist+Church+of+Sachse/... | Maps & Parking |
| Welcome to the Table Class | No dedicated URL — described inline | What's Next |
| send us a message | /contact-us/ | What's Next |
| please send us a message | /contact-us/ | Want Someone to Contact You |

## Media

| Asset | Type | URL in Source | Status |
|---|---|---|---|
| Google Maps link | Text link (no embed) | google.com/maps/place/FUMC+Sachse | Present in target as text link |

No embedded map, no images, no video in source.

## Integration

None beyond internal contact link → /contact-us/.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Welcome heading | `hero` typed block — page title, brief welcome copy |
| Plan Your Visit | `text` typed block — short paragraph |
| Maps & Parking | `location` typed block — address + maps link |
| The Table Class | `next_steps` or `text` typed block — description + contact CTA |
| Want Someone to Contact You | `cta` typed block — soft contact prompt |

All sections are plain text with links — good candidate for full typed block conversion. No raw_html should remain after E6-S8.

## Known Debt

- Current target is a `raw_html` block, sanitized. Content matches source accurately.
- No images or embeds needed — conversion to typed blocks is straightforward.
- Google Maps link uses the full coordinate-based URL from source. Verify it still resolves correctly before launch.
