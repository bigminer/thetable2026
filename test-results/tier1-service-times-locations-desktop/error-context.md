# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> service-times-locations
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  1432957 pixels (ratio 0.98 of all image pixels) are different.

  Snapshot: service-times-locations-desktop.png

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
            - button "Service" [expanded] [ref=e15] [cursor=pointer]:
              - generic [ref=e16]: Service
              - generic [ref=e17]: ▾
            - list [ref=e18]:
              - listitem [ref=e19]:
                - link "Service Time & Location" [ref=e20] [cursor=pointer]:
                  - /url: /service-times-locations/
              - listitem [ref=e21]:
                - link "Message Series" [ref=e22] [cursor=pointer]:
                  - /url: /series/
          - listitem [ref=e23]:
            - button "Join In!" [ref=e24] [cursor=pointer]:
              - generic [ref=e25]: Join In!
              - generic [ref=e26]: ▾
          - listitem [ref=e27]:
            - link "Giving" [ref=e28] [cursor=pointer]:
              - /url: /giving/
          - listitem [ref=e29]:
            - button "Connect With Us" [ref=e30] [cursor=pointer]:
              - generic [ref=e31]: Connect With Us
              - generic [ref=e32]: ▾
          - listitem [ref=e33]:
            - link "Get Involved" [ref=e34] [cursor=pointer]:
              - /url: /get-involved/
  - main [ref=e35]:
    - heading "Service Time & Location" [level=1] [ref=e37]
    - generic [ref=e40]:
      - paragraph [ref=e41]:
        - text: The Table meets weekly on Sundays at 5pm at FUMC Sachse and is currently providing live streaming services on both
        - link "Facebook" [ref=e42] [cursor=pointer]:
          - /url: https://www.facebook.com/TheTableTX/
        - text: and
        - link "YouTube" [ref=e43] [cursor=pointer]:
          - /url: https://www.youtube.com/channel/UC4C3HWTMx34ec7QJ5hkhtwg
        - text: .
      - paragraph [ref=e44]: Hope to see you there!
      - paragraph [ref=e45]:
        - text: Miss a message or want to watch it again? You can
        - link "watch past messages here" [ref=e46] [cursor=pointer]:
          - /url: /series/
        - text: .
  - contentinfo [ref=e47]:
    - generic [ref=e48]:
      - paragraph [ref=e49]: The Table Church
      - navigation "Footer navigation" [ref=e50]:
        - list [ref=e51]:
          - listitem [ref=e52]:
            - link "Church Center" [ref=e53] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e54]:
            - link "Planning Center" [ref=e55] [cursor=pointer]:
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