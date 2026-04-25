# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> contact-us
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  1426962 pixels (ratio 0.97 of all image pixels) are different.

  Snapshot: contact-us-desktop.png

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
            - button "Connect With Us" [expanded] [ref=e25] [cursor=pointer]:
              - generic [ref=e26]: Connect With Us
              - generic [ref=e27]: ▾
            - list [ref=e28]:
              - listitem [ref=e29]:
                - link "Sign Up for Our Newsletter" [ref=e30] [cursor=pointer]:
                  - /url: /sign-up-for-our-newsletter/
              - listitem [ref=e31]:
                - link "Contact Us" [ref=e32] [cursor=pointer]:
                  - /url: /contact-us/
          - listitem [ref=e33]:
            - link "Get Involved" [ref=e34] [cursor=pointer]:
              - /url: /get-involved/
  - main [ref=e35]:
    - generic [ref=e36]:
      - paragraph [ref=e37]: Contact
      - heading "Contact Us" [level=1] [ref=e38]
      - paragraph [ref=e39]: How can we help? If you have a question or need to connect with someone from The Table TX, we'd love to hear from you. Please just fill out the form and someone will be in contact with you shortly. We look forward to hearing from you!
      - generic [ref=e40]:
        - link "Send a message" [ref=e41] [cursor=pointer]:
          - /url: mailto:hello@thetabletx.com
        - link "Open Church Center" [ref=e42] [cursor=pointer]:
          - /url: https://thetabletx.churchcenter.com
  - contentinfo [ref=e43]:
    - generic [ref=e44]:
      - paragraph [ref=e45]: The Table Church
      - navigation "Footer navigation" [ref=e46]:
        - list [ref=e47]:
          - listitem [ref=e48]:
            - link "Church Center" [ref=e49] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e50]:
            - link "Planning Center" [ref=e51] [cursor=pointer]:
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