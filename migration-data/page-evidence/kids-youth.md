# Evidence: Kids & Youth

## Source

- URL: https://thetabletx.com/kids-youth/
- WP page ID: 1067
- Title: "Kids &amp; Youth" (decoded: "Kids & Youth")

## Target

- URL: /kids-youth/
- Local preview: http://localhost:4321/kids-youth/
- Astro content file: `src/content/pages/kids-youth.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "Kids & Youth"

## Purpose

Describes the church's children's ministry (The Kid's Table) and teen small group (Table Teens). Intended for parents and young people exploring whether the church is a good fit for their family.

## Sections

Source section inventory in page order:

1. **The Kid's Table** — H2 heading
2. **Children's program description** — Unconditional love, dedicated teachers, lessons aligned with church values, intentional inclusion in main worship service (first song), age-range classrooms, background-checked teachers
3. **First-visit instructions** — Greeted by volunteer, shown to age-appropriate classroom
4. **Teens at The Table** — H2 heading
5. **Teen MeetUp description** — Sunday night MeetUp for 7th–12th grade, meets after evening service, includes relationship building, games, music, Bible study, group discussion, food. Adult leaders described as passionate about inclusive safe space.
6. **MeetUps cross-reference** — "Check out our MeetUps page for more details." (link to /meetups/)

## CTAs

| Label | Destination | Section |
|---|---|---|
| Check out our MeetUps page | /meetups/ (source links to old wpengine domain) | Teens section |

**Note**: The source content links to `http://thetabletx.wpengine.com/meetups/` — this is the WP staging domain. The target raw_html block preserves this broken link. Must be corrected to `/meetups/` before launch.

## Media

None. No images, video, or embeds in source.

## Integration

None beyond internal cross-reference to /meetups/.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| The Kid's Table (heading + description) | `program` or `text` typed block — heading + body paragraphs |
| First-visit instructions | `text` typed block — short paragraph |
| Teens at The Table (heading + description) | `program` or `text` typed block — heading + body paragraphs |
| MeetUps cross-reference | `cta` typed block — link to /meetups/ |

Simple two-section structure. Full typed block conversion is achievable in E6-S8.

## Known Debt

- Current target is a `raw_html` block, sanitized. Content matches source accurately.
- **Broken internal link**: MeetUps link in the raw_html references `http://thetabletx.wpengine.com/meetups/` (WP staging domain) — must be corrected to `/meetups/` before launch.
- No visual parity evidence yet (E6-S6 prerequisite).
