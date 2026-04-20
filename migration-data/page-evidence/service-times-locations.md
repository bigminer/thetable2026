# Evidence: Service Times & Location

## Source

- URL: https://thetabletx.com/service-times-locations/
- WP page ID: 1064
- Title: "Service Time & Location"

## Target

- URL: /service-times-locations/
- Local preview: http://localhost:4321/service-times-locations/
- Astro content file: `src/content/pages/service-times-locations.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "Service Time & Location"

## Purpose

Single source of truth for when and where Sunday services are held. Also surfaces live streaming links and the archived messages path. High operational importance — must not drift from other pages that repeat service time/location data.

## Sections

Source section inventory in page order:

1. **Service info** — "The Table meets weekly on Sundays at 5pm at FUMC Sachse"
2. **Live streaming** — Facebook and YouTube links
3. **Hope to see you there** — brief closing line
4. **Archive link** — "Miss a message or want to watch it again? You can watch past messages here."

## CTAs

| Label | Destination | Section |
|---|---|---|
| Facebook (live stream) | https://www.facebook.com/TheTableTX/ | Streaming |
| YouTube (live stream) | https://www.youtube.com/channel/UC4C3HWTMx34ec7QJ5hkhtwg | Streaming |
| watch past messages here | /series/ | Archive |

## Media

None. Text links only. No embedded video, no map embed, no images in source.

## Integration

- Live streaming links are static external URLs (no embed required).
- Archive link points to internal /series/ route.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Service info + streaming | `service_time` typed block — day, time, venue name, streaming links |
| Archive link | `cta` typed block — link to /series/ |

**High priority for typed block conversion.** Service time and location data is referenced from multiple pages (homepage, LGBT landing, contact footer). Converting this page to a `service_time` typed block and sourcing the homepage/footer data from the same record eliminates cross-page drift risk (see Operational Risk Checklist in AGENTS.md).

## Known Debt

- Current target is a `raw_html` block, sanitized. Content matches source accurately.
- Service time data (Sundays 5pm, FUMC Sachse) is duplicated in raw_html on the homepage and LGBT landing page. Single source of truth for service time is an outstanding architecture concern.
- No visual parity evidence yet (E6-S6 prerequisite).
