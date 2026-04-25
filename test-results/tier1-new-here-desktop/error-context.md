# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> new-here
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  Expected an image 1440px by 1301px, received 1440px by 1625px. 1681248 pixels (ratio 0.72 of all image pixels) are different.

  Snapshot: new-here-desktop.png

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "The Table Church" [ref=e4] [cursor=pointer]:
        - /url: /
      - button "Toggle light/dark mode" [ref=e5] [cursor=pointer]: ◑
      - navigation "Main navigation" [ref=e6]:
        - list [ref=e7]:
          - listitem [ref=e8]:
            - link "New Here?" [ref=e9] [cursor=pointer]:
              - /url: /new-here/
          - listitem [ref=e10]:
            - button "Who We Are" [ref=e11] [cursor=pointer]:
              - generic [ref=e12]: Who We Are
              - generic [ref=e13]: ▾
          - listitem [ref=e14]:
            - button "Service" [ref=e15] [cursor=pointer]:
              - generic [ref=e16]: Service
              - generic [ref=e17]: ▾
          - listitem [ref=e18]:
            - button "Join In!" [ref=e19] [cursor=pointer]:
              - generic [ref=e20]: Join In!
              - generic [ref=e21]: ▾
          - listitem [ref=e22]:
            - link "Giving" [ref=e23] [cursor=pointer]:
              - /url: /giving/
          - listitem [ref=e24]:
            - button "Connect With Us" [ref=e25] [cursor=pointer]:
              - generic [ref=e26]: Connect With Us
              - generic [ref=e27]: ▾
          - listitem [ref=e28]:
            - link "Get Involved" [ref=e29] [cursor=pointer]:
              - /url: /get-involved/
  - main [ref=e30]:
    - generic [ref=e31]:
      - generic [ref=e34]:
        - heading "New Here?" [level=1] [ref=e35]
        - paragraph [ref=e36]: Welcome to The Table
      - generic [ref=e38]:
        - heading "Plan Your Visit" [level=3] [ref=e39]
        - paragraph [ref=e40]: Plan to arrive a few minutes early to find a seat and expect to be greeted by smiling, friendly faces! All are welcome here at The Table and we hope you feel comfortable joining us.
        - heading "Maps & Parking" [level=2] [ref=e41]
        - paragraph [ref=e42]: "Parking is available directly in front of the church building and we are located at:"
        - paragraph [ref=e43]: 1520 Blackburn Rd. Sachse, TX 75048
        - paragraph [ref=e44]:
          - link "Click here for a map and directions" [ref=e45] [cursor=pointer]:
            - /url: https://www.google.com/maps/place/First+United+Methodist+Church+of+Sachse/@32.9811548,-96.6117338,17z/data=!3m1!4b1!4m6!3m5!1s0x864c1c9046284965:0x1856018e2d9d4980!8m2!3d32.9811548!4d-96.6091589!16s%2Fg%2F1tgx6_qj?entry=ttu
        - heading "What's Next? The Table Class" [level=2] [ref=e46]
        - paragraph [ref=e47]: "If you have been coming to The Table for a few weeks and have begun to ask the questions: \"What's next?\", \"Where can I find out more?\", or \"How do I join this community?\""
        - paragraph [ref=e48]:
          - text: The answer to all of those questions can be found at our
          - strong [ref=e49]: Welcome to the Table Class
          - text: .
        - paragraph [ref=e50]:
          - text: These classes are typically held on Sunday afternoons from 3:00pm-4:30pm and childcare will be available. Feel free to
          - link "send us a message" [ref=e51] [cursor=pointer]:
            - /url: /contact-us/
          - text: to find out when the next class will be offered.
        - heading "Want Someone to Contact You?" [level=2] [ref=e52]
        - paragraph [ref=e53]:
          - text: If you would like someone to contact you,
          - link "please send us a message" [ref=e54] [cursor=pointer]:
            - /url: /contact-us/
          - text: and we will be in touch.
  - contentinfo [ref=e55]:
    - generic [ref=e56]:
      - paragraph [ref=e57]: The Table Church
      - navigation "Footer navigation" [ref=e58]:
        - list [ref=e59]:
          - listitem [ref=e60]:
            - link "Church Center" [ref=e61] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e62]:
            - link "Planning Center" [ref=e63] [cursor=pointer]:
              - /url: https://planningcenter.com
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Tier 1 visual consistency spec.
  5  |  *
  6  |  * Diffs each Tier 1 page on the local Astro preview against the committed
  7  |  * baselines in tests/visual/production-baselines/.
  8  |  *
  9  |  * This is currently a warning-only consistency harness owned by E6-S10. The relaxed
  10 |  * threshold records current design drift without blocking non-visual gates.
  11 |  */
  12 | 
  13 | const TIER1_PAGES = [
  14 |   { slug: 'home', path: '/' },
  15 |   { slug: 'new-here', path: '/new-here/' },
  16 |   { slug: 'service-times-locations', path: '/service-times-locations/' },
  17 |   { slug: 'lgbt-affirming-church', path: '/lgbt-affirming-church/' },
  18 |   { slug: 'our-vision', path: '/our-vision/' },
  19 |   { slug: 'our-story', path: '/our-story/' },
  20 |   { slug: 'kids-youth', path: '/kids-youth/' },
  21 |   { slug: 'meetups', path: '/meetups/' },
  22 |   { slug: 'giving', path: '/giving/' },
  23 |   { slug: 'contact-us', path: '/contact-us/' },
  24 | ];
  25 | 
  26 | for (const pg of TIER1_PAGES) {
  27 |   test(`${pg.slug}`, async ({ page }, testInfo) => {
  28 |     const device = testInfo.project.name; // 'desktop' or 'mobile'
  29 |     const baselineName = `${pg.slug}-${device}.png`;
  30 | 
  31 |     await page.goto(pg.path, { waitUntil: 'load' });
  32 |     await page.addStyleTag({
  33 |       content: `
  34 |         *,
  35 |         *::before,
  36 |         *::after {
  37 |           animation-duration: 0s !important;
  38 |           animation-delay: 0s !important;
  39 |           transition-duration: 0s !important;
  40 |           transition-delay: 0s !important;
  41 |         }
  42 |       `,
  43 |     });
  44 | 
  45 |     const screenshot = await page.screenshot({ fullPage: true });
> 46 |     expect(screenshot).toMatchSnapshot(baselineName, {
     |                        ^ Error: expect(Buffer).toMatchSnapshot(expected) failed
  47 |       maxDiffPixelRatio: 0.6, // Relaxed from 0.05 to accommodate current Astro design drift
  48 |     });
  49 |   });
  50 | }
  51 | 
```