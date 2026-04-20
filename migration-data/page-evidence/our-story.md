# Evidence: Our Story

## Source

- URL: https://thetabletx.com/our-story/
- WP page ID: 1099
- Title: "Our Story"

## Target

- URL: /our-story/
- Local preview: http://localhost:4321/our-story/
- Astro content file: `src/content/pages/our-story.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "Our Story"

## Purpose

Narrative origin story of the church. Explains the meaning behind the name "The Table," describes the founding community in 2019, and introduces lead pastors Brett and Maggie Tilford. Builds trust and humanizes the church for new visitors and potential members.

## Sections

Source section inventory in page order:

1. **Mission tagline** — "The Table exists to shift a generation from reactionary to visionary through the person and work of Jesus." (H2 display)
2. **The Table metaphor** — Extended meditation on what a table symbolizes: family, community, food, love, listening, knowing, honest speech, the unforced rhythms of grace, and ultimately the Lord's Table (H3 italic block)
3. **Founding story** — "At The Table, that's the Jesus we've come to love. That's why in November of 2019 twenty-nine adults from the Collin and Dallas County area set out to create a community..." Includes the founding heart (everyone welcome: black/white, gay/straight, male/female, rich/poor).
4. **Lead pastor photo** — Brett and Maggie Tilford (image from WP uploads)
5. **Leadership bio** — Brett and Maggie Tilford: lead at The Table, live in Sachse TX with three kids (Eve, Dax, Oak), married 18 years, love Jesus and inclusive Christianity.

## CTAs

None. Content-only page.

## Media

| Asset | Type | URL in Source | Status |
|---|---|---|---|
| Brett and Maggie Tilford photo | Image | https://thetabletx.wpengine.com/wp-content/uploads/2020/04/Brett-and-Maggie-Tilford-300x200.jpg | References WP origin domain — needs local copy |

Image also has srcset referencing:
- https://thetabletx.com/wp-content/uploads/2020/04/Brett-and-Maggie-Tilford-300x200.jpg (300w)
- https://thetabletx.com/wp-content/uploads/2020/04/Brett-and-Maggie-Tilford-272x182.jpg (272w)
- https://thetabletx.com/wp-content/uploads/2020/04/Brett-and-Maggie-Tilford.jpg (500w — original)

## Integration

None.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Mission tagline | `statement` typed block |
| Table metaphor | `text` typed block — italic display paragraph |
| Founding story | `text` typed block — narrative paragraph |
| Pastor photo | `image` typed block — local path + alt text |
| Leadership bio | `text` typed block or `staff_bio` typed block |

Good candidate for typed block conversion. Two text blocks + one image block + one statement block would fully replace the current raw_html.

## Known Debt

- Current target is a `raw_html` block, sanitized. All content is present.
- **Image uses WP origin domain** (`thetabletx.wpengine.com`): the `src` references an external WP URL. The image must be downloaded and placed in `public/media/` (e.g., `public/media/brett-maggie-tilford.jpg`) and the reference updated before launch. See D-006 (referenced media only) and media audit rule in parity contract.
- Image alt text in source is "Brett and Maggie Tilford" — preserve this.
- No visual parity evidence yet (E6-S6 prerequisite).
