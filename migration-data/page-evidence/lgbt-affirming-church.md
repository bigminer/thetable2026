# Evidence: LGBT Affirming Church

## Source

- URL: https://thetabletx.com/lgbt-affirming-church/
- WP page ID: 1651
- Title: "LGBT Affirming Church"

## Target

- URL: /lgbt-affirming-church/
- Local preview: http://localhost:4321/lgbt-affirming-church/
- Astro content file: `src/content/pages/lgbt-affirming-church.md`
- Astro route: `src/pages/[...slug].astro`
- Target title: "LGBT Affirming Church"

## Purpose

SEO-targeted landing page for LGBTQ+ individuals searching for an affirming church in the DFW area. Mirrors the homepage's brand messaging but is structured to rank for "LGBTQ affirming church" queries. Repeats key value propositions, contact path, and service info. High-priority page for brand identity and discoverability.

## Sections

Source section inventory in page order (SiteOrigin page builder layout, ID pg-1651-*):

1. **Hero** — Parallax background image (The-Table-Affirming-Hero-e1710999564241.png) + "The Table" H2 + "An LGBTQ-affirming church committed to embodying a welcoming, inclusive, and beautiful expression of Christian faith." H3
2. **Get Involved** — "GET INVOLVED" heading + engagement paths (Sunday 5pm, meetups, youth ministry, Hat Creek Burgers fellowship)
3. **Who We Are / Five Pillars** — "WHO WE ARE" heading + five value cards (Thoughtful, Inclusive, Eclectic, Communal, Vulnerable)
4. **You Belong** — "You are a child of God..." statement
5. **Weekly Communion** — "WEEKLY COMMUNION" heading + paragraph
6. **Join Us / Streaming** — "JOIN US AS YOU ARE" heading + in-person/live-streaming CTA
7. **Contact Footer / Location** — "REACH OUT TO US" heading + address (1520 Blackburn Rd, Sachse TX 75048) + phone (469-222-3617) + service time (Sundays 5pm) + stale service notice ("No Service Dec. 29. Services will resume Jan. 5th!") + MeetUps note + Google Map embed
8. **Contact Form** — "CONTACT US" WP Gravity Forms form (First Name, Last Name, Email, Phone, Message) + reCAPTCHA
9. **Vision Tagline** — "OUR VISION: We exist to shift a generation from reactionary to visionary through the person and work of Jesus."

## CTAs

| Label | Destination | Section |
|---|---|---|
| Get Involved — Sunday 5pm | Service at FUMC Sachse | Get Involved |
| Get Involved — Meetups | /meetups/ | Get Involved |
| Get Involved — Youth | /kids-youth/ | Get Involved |
| Get Involved — Hat Creek | No URL in source | Get Involved |
| Join In Person or Live Streaming | Facebook/YouTube | Join Us |
| Facebook live stream | https://www.facebook.com/TheTableTX/ | Join Us |
| YouTube live stream | https://www.youtube.com/channel/UC4C3HWTMx34ec7QJ5hkhtwg | Join Us |
| For more information on MeetUps | /meetups/ | Contact Footer |
| Submit (contact form) | WP Gravity Forms → must replace with Apps Script | Contact Form |

## Media

| Asset | Type | URL in Source | Status |
|---|---|---|---|
| Hero background image | Image (parallax) | https://thetabletx.com/wp-content/uploads/2024/03/The-Table-Affirming-Hero-e1710999564241.png | Must be copied to public/media/ |
| Google Map | Map embed | Embedded in footer section | Not modeled as typed block in target |
| Contact form | Form | WP Gravity Forms + reCAPTCHA | Must be replaced with Apps Script fallback |

## Integration

- **Contact form**: Source uses WP Gravity Forms. Target must use Apps Script fallback (D-010). Same fields as homepage contact form.
- **Live streaming**: Same Facebook/YouTube links as homepage.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Hero | `hero` typed block — background image, headline pair |
| Get Involved | `cta_list` typed block — heading + link list |
| Five Pillars | `value_list` typed block — shared with homepage if possible |
| You Belong | `statement` typed block |
| Weekly Communion | `statement` typed block |
| Join Us / Streaming | `cta` typed block |
| Contact Footer | `location` typed block — address, phone, service time, map |
| Contact Form | `form` typed block — Apps Script endpoint |
| Vision Tagline | `statement` typed block |

## Known Debt

- Current target is a single `raw_html` block containing the full SiteOrigin HTML dump (29,450 chars). No typed blocks have been implemented.
- **Stale service notice**: Source contains "No Service Dec. 29. Services will resume Jan. 5th!" — this is expired content and must be removed before launch.
- Hero image references live WP origin URL — must be mirrored to `public/media/` before launch.
- Contact form uses WP Gravity Forms + reCAPTCHA — must be replaced.
- Google Map is embedded in raw HTML but not accessible as a typed block.
- This page shares most of its section structure with the homepage — typed block components should be reusable across both.
