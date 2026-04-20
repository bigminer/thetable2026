# Evidence: Our Vision & Values

## Source

- URL: https://thetabletx.com/our-vision/
- WP page ID: 1100
- Title: "Our Vision &amp; Values" (decoded: "Our Vision & Values")

## Target

- URL: /our-vision/
- Local preview: http://localhost:4321/our-vision/
- Astro content file: `src/content/pages/our-vision.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "Our Vision & Values"

## Purpose

Communicates the church's complete ideological and theological identity: core mission statement, five community values (with extended explanations), explicit LGBTQI+ affirming stance, Women in Leadership stance, and full doctrinal statement. Important for trust-building with new visitors and church-search SEO.

## Sections

Source section inventory in page order:

1. **Mission statement** — "The Table exists to shift a generation from reactionary to visionary through the person and work of Jesus."
2. **Intro paragraph** — Context on why a different kind of Christianity matters; invites the reader to join the journey
3. **"What We Value"** — Section heading
4. **Thoughtful** (H4 + paragraph) — Reflective, no questions off-limits, mirrors the calm and depth of Christ
5. **Inclusive** (H4 + paragraph) — Radically inclusive, stretching the tent, no exclusions by race/identity/orientation/morality
6. **Eclectic** (H4 + paragraph) — Celebrates difference, tension as creative space, diverse theologies/politics/personalities
7. **Communal** (H4 + paragraph) — Devoted to communion, present to one another, reparative/restorative life of Christ
8. **Vulnerable** (H4 + paragraph) — Linchpin value; vulnerability required by all other values
9. **"LGBTQI+ and One Level of Membership"** — Explicit affirming stance; gay/lesbian/bi/trans/queer/intersex folks welcomed as full participants; Q&A (staff? preach? married? gay weddings?)
10. **"Women In Leadership"** — Full participation of women in all leadership roles; Q&A (elder team? preach? staff? lead pastor?)
11. **"What We Believe"** — 9-point doctrinal list (Trinity, Incarnation, sin/reconciliation, communion, baptism, church, Scripture, redemption, visionary path)

## CTAs

None. This is a content-only page with no outbound CTAs.

## Media

None. Text only. No images, video, embeds, or forms in source.

## Integration

None.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Mission statement | `statement` typed block — single display quote |
| Intro paragraph | `text` typed block |
| Five values (What We Value) | `value_list` typed block — name + extended paragraph per value |
| LGBTQI+ statement | `statement_section` typed block — heading + body + Q&A list |
| Women in Leadership | `statement_section` typed block — heading + body + Q&A list |
| What We Believe | `belief_list` typed block — heading + 9 items |

Content is dense but entirely text — excellent candidate for full typed block conversion with zero raw_html after E6-S8. No missing source data.

## Known Debt

- Current target is a `raw_html` block, sanitized. Content is well-preserved — all sections and text match the source accurately.
- Heading hierarchy in source is inconsistent (H1 for mission statement, H4 for values, H2 for LGBTQI+/Women/Believe sections). Target should normalize heading levels when converting to typed blocks.
- No visual parity evidence yet (E6-S6 prerequisite).
