# Evidence: Contact Us

## Source

- URL: https://thetabletx.com/contact-us/
- WP page ID: 692
- Title: "Contact Us"

## Target

- URL: /contact-us/
- Local preview: http://localhost:4321/contact-us/
- Astro route: `src/pages/contact-us.astro` (standalone page, not in content collection)
- Target title: "Contact Us"

## Purpose

Primary contact entry point for visitors and community members. Allows anyone with a question or connection request to reach the church. Source uses an inline WP form; target routes through Apps Script fallback (D-010).

## Sections

Source section inventory in page order:

1. **Intro copy** — "How can we help? If you have a question or need to connect with someone from The Table TX, we'd love to hear from you. Please just fill out the form and someone will be in contact with you shortly. We look forward to hearing from you!"
2. **Contact form** — Fields: First Name *, Last Name *, Email *, Phone, Message. reCAPTCHA. Submit button. Hidden honeypot field.

## CTAs

| Label | Destination | Section |
|---|---|---|
| Submit (form) | WP Gravity Forms → must replace with Apps Script | Contact form |

Target CTAs:
- "Send a message" → Apps Script URL (env var `GOOGLE_APPS_SCRIPT_CONTACT_URL`, falls back to `mailto:hello@thetabletx.com`)
- "Open Church Center" → https://thetabletx.churchcenter.com (secondary, not in source)

## Media

None. Form only.

## Integration

- **Apps Script fallback** (D-010): Target is configured with `mode: 'fallback'` and `destination: 'Apps Script'`. Primary CTA points to the Apps Script deployment URL (or `mailto:` fallback if env var is unset).
- Source uses WP Gravity Forms with reCAPTCHA — this cannot be ported directly; the Apps Script route is the correct replacement per D-010.

## Visual Review

- Desktop: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture
- Mobile: NOT YET REVIEWED — pending E6-S6 Playwright baseline capture

## Block Recommendations

The target is a standalone Astro page. It currently renders the form title, a note, and CTA buttons — but does **not** render the source intro paragraph ("How can we help? If you have a question..."). This intro text should be added to match the source's communication intent.

No `raw_html` is needed for this page — all content is short copy + a form handoff.

## Known Debt

- **Missing intro copy**: The source intro paragraph ("How can we help? If you have a question or need to connect...") is not rendered in the target. The target shows only the form title and a short note. The intro copy should be added to `contact-us.astro` before launch.
- Apps Script deployment URL (`GOOGLE_APPS_SCRIPT_CONTACT_URL`) must be configured in the production environment before launch. Currently falls back to `mailto:`.
- Target adds a secondary "Open Church Center" button not present in the source — confirm this is desired.
- reCAPTCHA is not implemented in the target. Spam protection for the Apps Script form endpoint should be verified (Apps Script can validate server-side, or a honeypot field can be used).
- No visual parity evidence yet (E6-S6 prerequisite).
