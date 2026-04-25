# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> kids-youth
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  1356309 pixels (ratio 0.92 of all image pixels) are different.

  Snapshot: kids-youth-desktop.png

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
            - button "Join In!" [expanded] [ref=e19] [cursor=pointer]:
              - generic [ref=e20]: Join In!
              - generic [ref=e21]: ▾
            - list [ref=e22]:
              - listitem [ref=e23]:
                - link "MeetUps" [ref=e24] [cursor=pointer]:
                  - /url: /meetups/
              - listitem [ref=e25]:
                - link "Kids & Youth" [ref=e26] [cursor=pointer]:
                  - /url: /kids-youth/
              - listitem [ref=e27]:
                - link "Community Meals" [ref=e28] [cursor=pointer]:
                  - /url: /community-meal/
              - listitem [ref=e29]:
                - link "Get Involved" [ref=e30] [cursor=pointer]:
                  - /url: /get-involved/
          - listitem [ref=e31]:
            - link "Giving" [ref=e32] [cursor=pointer]:
              - /url: /giving/
          - listitem [ref=e33]:
            - button "Connect With Us" [ref=e34] [cursor=pointer]:
              - generic [ref=e35]: Connect With Us
              - generic [ref=e36]: ▾
          - listitem [ref=e37]:
            - link "Get Involved" [ref=e38] [cursor=pointer]:
              - /url: /get-involved/
  - main [ref=e39]:
    - heading "Kids & Youth" [level=1] [ref=e41]
    - generic [ref=e44]:
      - heading "The Kid's Table" [level=2] [ref=e45]
      - paragraph [ref=e46]: The Kid's Table is a place where your child will feel the unconditional love of God. We have teachers who are dedicated to not only teaching them about this love but also showing it. We carefully craft our lessons to align with the values of The Table and the Bible. We try to be intentional about including our kids as part of the body of our church and not just keeping them occupied during the service. One of our favorite things about the Kids Table is getting to join in the larger worship service for the first song.
      - paragraph [ref=e47]: When you come for the first time, you will be greeted by a volunteer who will show you where to go for your child's age group. We have several classrooms to accommodate different age ranges. Each classroom is learning similar things, but in a way that makes sense for their age and developmental level. Each teacher is hand-picked for that classroom and has been given a full background check.
      - heading "Teens at The Table" [level=2] [ref=e48]
      - paragraph [ref=e49]: We have a Sunday night MeetUp designed specifically for teens in 7th through 12th grade. This group meets directly after our evening services and includes relationship building, games, music, Bible study, group discussion and, of course, food! Our adult leaders are passionate about pouring into our teenagers and providing a safe space for them to share their lives and develop their faith in an encouraging, authentic, and inclusive atmosphere.
      - paragraph [ref=e50]:
        - link "Check out our MeetUps page" [ref=e51] [cursor=pointer]:
          - /url: /meetups/
        - text: for more details.
  - contentinfo [ref=e52]:
    - generic [ref=e53]:
      - paragraph [ref=e54]: The Table Church
      - navigation "Footer navigation" [ref=e55]:
        - list [ref=e56]:
          - listitem [ref=e57]:
            - link "Church Center" [ref=e58] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e59]:
            - link "Planning Center" [ref=e60] [cursor=pointer]:
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