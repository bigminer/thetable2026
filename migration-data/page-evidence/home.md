# Evidence: Home

## Source

- URL: https://thetabletx.com/
- WP page ID: 1737 (internal slug: `homepage-updates-draft`)
- Title: "Home Page Updates" (internal WP label; rendered title is "The Table Church")

## Target

- URL: /
- Local preview: http://localhost:4321/
- Astro content file: `src/content/pages/home.md`
- Astro route: `src/pages/index.astro`
- Target title: "The Table Church"

## Purpose

Primary entry point for new and returning visitors. Sets brand identity (LGBTQ-affirming progressive Christian church in Sachse, TX), communicates service time, introduces the five core values, provides newcomer messaging, drives streaming/in-person attendance, surfaces recent messages, and provides a contact path.

## Sections

Source section inventory in page order (SiteOrigin page builder layout, ID pg-1737-*):

1. **Hero** — "Come Join Us / Service Each Sunday @ 5PM" (H1/H2 headline pair)
2. **Tagline** — "An LGBTQ-affirming church committed to embodying a welcoming, inclusive, and beautiful expression of Christian faith." (H2 editor block)
3. **Story/Video** — "WE CELEBRATE EVERY STORY" heading + YouTube video embed (https://youtu.be/xbtuP_UITPo)
4. **Who We Are / Five Pillars** — Section heading "WHO WE ARE" with five value cards: Thoughtful, Inclusive, Eclectic, Communal, Vulnerable (each with short descriptor)
5. **You Belong** — "You are a child of God. YOU are a child of God. This is true on your best day, and it's true on your worst day. You are loved, you are worthy, and you are accepted, just as you are."
6. **Weekly Communion** — "WEEKLY COMMUNION" heading + paragraph explaining weekly communion practice
7. **Join Us / Streaming** — "JOIN US AS YOU ARE" heading + in-person and live-streaming CTA
8. **Get Involved** — "GET INVOLVED" heading + list of engagement paths (Sunday 5pm, meetups, youth ministry, Hat Creek Burgers fellowship)
9. **Recent Messages** — "RECENT MESSAGES" heading + list of recent sermon series titles (Advent 2025, The End: It's Just a New Beginning, The Good Book, Cultivating Calm, Enchanted, Lent 2025)
10. **Contact Footer / Location** — "REACH OUT TO US" heading + address (1520 Blackburn Rd, Sachse TX 75048) + phone (469-222-3617) + service time (Sundays 5pm) + MeetUps note + Google Map embed
11. **Contact Form** — "CONTACT US" WP Gravity Forms/reCAPTCHA form (First Name, Last Name, Email, Phone, Message fields)
12. **Vision Tagline** — "OUR VISION: We exist to shift a generation from reactionary to visionary through the person and work of Jesus."

## CTAs

| Label | Destination | Section |
|---|---|---|
| Join In Person or Live Streaming | Sunday services at FUMC Sachse / Facebook / YouTube | Join Us |
| Facebook live stream | https://www.facebook.com/TheTableTX/ | Join Us |
| YouTube live stream | https://www.youtube.com/channel/UC4C3HWTMx34ec7QJ5hkhtwg | Join Us |
| Sunday service (Get Involved) | Service at 5pm FUMC Sachse | Get Involved |
| Meetups (Get Involved) | /meetups/ | Get Involved |
| Youth ministry (Get Involved) | /kids-youth/ | Get Involved |
| Hat Creek fellowship (Get Involved) | No URL in source | Get Involved |
| Recent message links | /series/ or individual series slugs | Recent Messages |
| For more information on MeetUps | /meetups/ | Contact Footer |
| See map | Google Maps embed | Contact Footer |
| Submit (contact form) | WP Gravity Forms / reCAPTCHA → apps script replacement needed | Contact Form |

## Media

| Asset | Type | URL in Source | Status |
|---|---|---|---|
| YouTube video | Video embed | https://youtu.be/xbtuP_UITPo | Needs YouTube embed block in target |
| Google Map | Map embed | Embedded in footer section | Not yet present in target |
| Contact form | Form | WP Gravity Forms with reCAPTCHA | Must be replaced with Apps Script fallback |

## Integration

- **Live streaming**: Links to Facebook and YouTube embed/channel pages. No embed required — text links are sufficient.
- **Contact form**: Source uses WP Gravity Forms. Target must use Apps Script fallback (D-010). Form fields: First Name, Last Name, Email, Phone, Message.
- **Recent Messages**: Should integrate with `messages` content collection or link to /series/. Currently shown as a static list in source.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

| Section | Recommendation |
|---|---|
| Hero | `hero` typed block — headline, subheadline, service time |
| Tagline | `text` typed block — single paragraph |
| Story/Video | `video` typed block — YouTube URL + section heading |
| Five Pillars | `value_list` typed block — name + descriptor per pillar |
| You Belong | `statement` typed block — display quote |
| Weekly Communion | `statement` typed block — heading + paragraph |
| Join Us / Streaming | `cta` typed block — heading + links |
| Get Involved | `cta_list` typed block — heading + link list |
| Recent Messages | Dynamic render from `messages` collection — not raw_html |
| Contact Footer | `location` typed block — address, phone, service time, map embed |
| Contact Form | `form` typed block — Apps Script endpoint |
| Vision Tagline | `statement` typed block — one line |

## Known Debt

- Current target is a single `raw_html` block containing the full SiteOrigin page builder HTML dump (33,695 chars). No typed blocks have been implemented.
- Contact form uses WP Gravity Forms with reCAPTCHA — must be replaced before launch.
- Google Map embed is included in the raw HTML but not modeled as a typed block.
- "Recent Messages" is a static list in the source — target should render from `messages` collection.
- YouTube embed uses `<video>` shortcode format from WP — needs a proper `<iframe>` embed in target.
- No visual parity evidence yet (E6-S6 prerequisite).
