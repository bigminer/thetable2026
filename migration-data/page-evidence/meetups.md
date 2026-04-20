# Evidence: MeetUps

## Source

- URL: https://thetabletx.com/meetups/
- WP page ID: 1065
- Title: "MeetUps"

## Target

- URL: /meetups/
- Local preview: http://localhost:4321/meetups/
- Astro content file: `src/content/pages/meetups.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "MeetUps"

## Purpose

Directory of all available small groups (MeetUps). Helps visitors and members find appropriate community beyond Sunday services. Also explains how to start or host a group. Three group categories: Home Groups (geographic), Affinity Groups (interest-based), Sprint Groups (short-term).

## Sections

Source section inventory in page order:

1. **Page intro** — "The Table MeetUps" bold + overview of what MeetUps are (small groups extending relationships beyond Sunday)
2. **Purpose statement** — Goal of accessibility, especially for new visitors; demonstrating church values
3. **Current Available MeetUps** — Bold header
4. **Home Groups** — Intergenerational relational/Christ-centered discussion groups
   - Allen: Wednesdays 7pm — Rissa & Scott Marlar
   - Wylie: Wednesdays 7pm — Anna & Becky Barnes
   - Fate: Monthly Saturdays — Aaron & Becky Pearce
   - Richardson: Thursdays 7pm — Charles & Julie Kiser
5. **Affinity Groups** — Interest-focused groups
   - Book Club: 8am Sundays in Wylie — Leader: Brett Tilford
   - Table Teens: 6:30–8:00pm Sundays — Leaders: Maggie Tilford, Michael Alvarez, Marisa Martinez
   - 20-Somethings' Monthly Brunch: Monthly Sundays ~11am in Allen — Leaders: Christian and Megan Gray Hering
6. **Sprint Groups** — Short-term groups
   - Not Your Mama's Sunday School: Sundays 3pm (runs for several weeks) — Leader: Megan Gray Hering
7. **MeetUp interest CTA** — "Interested in attending a MeetUp? Fill out our interest form here." (link missing in source — Planning Center form URL needed)
8. **How to pitch in** — Section explaining how to lead or host a group
9. **Leading** — Guidance on proposing a new group
10. **Hosting** — Guidance on opening your home/space
11. **Facilitating/hosting CTA** — "Tell us your ideas here!" (link missing in source — Planning Center form URL needed)

## CTAs

| Label | Destination | Section |
|---|---|---|
| Fill out our interest form here | MISSING — Planning Center form URL not present in source | Interest CTA |
| Tell us your ideas here | MISSING — Planning Center form URL not present in source | Facilitating CTA |

**Note**: Both form URLs are absent from the WP source content. These are Planning Center forms that were likely managed externally. The actual URLs must be sourced from the Planning Center dashboard before these CTAs can be live.

## Media

None. No images, video, or embeds in source.

## Integration

- Two Planning Center forms: MeetUp interest signup and MeetUp host/facilitator proposal. Both form URLs are currently unknown and must be retrieved from Planning Center dashboard.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Intro + purpose | `text` typed block |
| Home Groups list | `group_list` or `text` typed block — name, schedule, location, leader per group |
| Affinity Groups list | `group_list` or `text` typed block |
| Sprint Groups list | `group_list` or `text` typed block |
| Interest form CTA | `cta` typed block — link to Planning Center form |
| How to pitch in | `text` typed block — with two sub-sections |
| Facilitating CTA | `cta` typed block — link to Planning Center form |

This page has more structural complexity than others but is still all text. The group listings are good candidates for a `group_list` typed block (name, schedule, location, leader fields). Main blocker for typed block conversion is the missing Planning Center form URLs.

## Known Debt

- Current target is a `raw_html` block, sanitized. Content matches source accurately.
- **Missing Planning Center form URLs**: Both the interest signup form and the host/facilitator form lack URLs in the source. These must be retrieved from the Planning Center dashboard and added before launch. Mark as integration dependency.
- MeetUp schedules (days, times, leaders) may be stale — data was last updated in the WP source at unknown date. Editors should verify current group listings before launch.
- No visual parity evidence yet (E6-S6 prerequisite).
