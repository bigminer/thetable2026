# Live Site Menu Inventory

## Purpose

Record the pages reachable from the live `https://thetabletx.com/` main menu so the Astro + `vaultcms` spike can use a concrete, public-site-grounded seed set.

## Verification Method

- Source site: `https://thetabletx.com/`
- Navigation source: homepage main menu (`nav#top-menu`)
- Verification method:
  - Extract menu structure from the live homepage HTML
  - Use Playwright CLI to open each internal menu-linked page in a fresh browser session
  - Confirm returned page URL and page title for each page

## Notes

- This inventory is limited to pages reachable from the main menu system.
- The homepage itself is part of the proof set even though it is not a separate menu target.
- The `Giving` menu item points to an external Church Center URL and is not part of the internal Astro page inventory.
- The homepage is Playwright-accessible, but its direct `open` command can hang before exiting cleanly because of the site's heavier embed/script behavior. DOM snapshots still work.

## Homepage

- `https://thetabletx.com/`
- Title: `The Table Church | We are a church community that values thoughtfulness in how we approach faith, life, and people around us.`
- Status: verified with Playwright snapshot access
- Use in spike:
  - include as one of the three proof targets
  - use as the primary visual and content parity reference for homepage work

## Internal Menu-Reachable Pages

| Menu Group | Menu Label | URL | Verified Title |
| --- | --- | --- | --- |
| Top Level | New Here? | `https://thetabletx.com/new-here/` | `New Here? | The Table Church` |
| Who We Are | Our Story | `https://thetabletx.com/our-story/` | `Our Story | The Table Church` |
| Who We Are | Our Vision & Values | `https://thetabletx.com/our-vision/` | `Our Vision & Values | The Table Church` |
| Who We Are | Our Leadership | `https://thetabletx.com/leadership/` | `Leadership | The Table Church` |
| Service | Service Time & Location | `https://thetabletx.com/service-times-locations/` | `Service Time & Location | The Table Church` |
| Service | Message Series | `https://thetabletx.com/series/` | `Series | The Table Church` |
| Join In! | MeetUps | `https://thetabletx.com/meetups/` | `MeetUps | The Table Church` |
| Join In! | Kids & Youth | `https://thetabletx.com/kids-youth/` | `Kids & Youth | The Table Church` |
| Join In! | Community Meals | `https://thetabletx.com/community-meal/` | `Community Meals | The Table Church` |
| Join In! | Get Involved | `https://thetabletx.com/get-involved/` | `Get Involved | The Table Church` |
| Connect With Us | Sign Up for Our Newsletter | `https://thetabletx.com/sign-up-for-our-newsletter/` | `Sign Up for Our Newsletter | The Table Church` |
| Connect With Us | Contact Us | `https://thetabletx.com/contact-us/` | `Contact Us | The Table Church` |
| Top Level | Get Involved | `https://thetabletx.com/get-involved/` | `Get Involved | The Table Church` |

## External Menu Target

| Menu Group | Menu Label | URL | Notes |
| --- | --- | --- | --- |
| Top Level | Giving | `https://thetabletx.churchcenter.com/giving?open-in-church-center-modal=true` | External Church Center destination; not an internal Astro page |

## Recommended Spike Seed Set

Use this inventory to drive seed content selection:

1. Homepage: `https://thetabletx.com/`
2. Representative page:
   - `https://thetabletx.com/our-story/`
3. Series proof target:
   - use `https://thetabletx.com/series/` as the collection/index reference
   - use one or more live series detail pages linked from the homepage or series index as schema examples

## Chosen Seed Pages

### Representative Page

- URL: `https://thetabletx.com/our-story/`
- Title: `Our Story | The Table Church`
- Why this page:
  - contains substantial real editorial copy rather than sparse placeholder content
  - includes an inline image in the main content body
  - includes sidebar/supporting content that helps test page layout fidelity
  - is a better proof of a text-and-image page model than a lighter landing page

### Series Reference Pages

- Series index:
  - URL: `https://thetabletx.com/series/`
  - Title: `Series | The Table Church`
  - Use as the collection/index reference

- Primary series detail example:
  - URL: `https://thetabletx.com/series/the-good-book/`
  - Title: `The Good Book: Fresh Insights Into an Ancient Text | Series | The Table Church`
  - Why:
    - includes featured artwork
    - includes series description text
    - includes external subscription links
    - includes episode rows with message title, speaker, and linked detail pages

- Secondary series detail example:
  - URL: `https://thetabletx.com/series/advent-2025/`
  - Title: `Advent 2025 | Series | The Table Church`
  - Why:
    - provides a second live series example so the schema is not overfit to a single page
    - helps verify whether the same visible structure is consistent across recent series entries

## Follow-Up

- Capture screenshots for desktop and mobile parity review when the Astro spike is ready.
- Use the chosen pages above as the default seed set unless later evidence shows they are unrepresentative.
