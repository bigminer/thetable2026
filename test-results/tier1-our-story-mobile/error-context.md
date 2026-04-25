# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> our-story
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  Expected an image 390px by 2207px, received 390px by 1966px. 616622 pixels (ratio 0.72 of all image pixels) are different.

  Snapshot: our-story-mobile.png

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
            - button "Who We Are" [expanded] [ref=e11] [cursor=pointer]:
              - generic [ref=e12]: Who We Are
              - generic [ref=e13]: ▾
            - list [ref=e14]:
              - listitem [ref=e15]:
                - link "Our Story" [ref=e16] [cursor=pointer]:
                  - /url: /our-story/
              - listitem [ref=e17]:
                - link "Our Vision & Values" [ref=e18] [cursor=pointer]:
                  - /url: /our-vision/
              - listitem [ref=e19]:
                - link "Our Leadership" [ref=e20] [cursor=pointer]:
                  - /url: /leadership/
              - listitem [ref=e21]:
                - link "Staff" [ref=e22] [cursor=pointer]:
                  - /url: /staff/
          - listitem [ref=e23]:
            - button "Service" [ref=e24] [cursor=pointer]:
              - generic [ref=e25]: Service
              - generic [ref=e26]: ▾
          - listitem [ref=e27]:
            - button "Join In!" [ref=e28] [cursor=pointer]:
              - generic [ref=e29]: Join In!
              - generic [ref=e30]: ▾
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
    - heading "Our Story" [level=1] [ref=e41]
    - generic [ref=e42]:
      - heading "The Table exists to shift a generation from reactionary to visionary through the person and work of Jesus." [level=2] [ref=e46]
      - generic [ref=e48]:
        - paragraph [ref=e49]:
          - emphasis [ref=e50]: What is a table a picture of in your mind? To us, its a picture of family, of community, of food and love. It's a picture of a place where enemies can begin to listen and understand one another, a place where we can know and be known. Where we can seek to understand and be understood. It's a place where we learn how to speak honestly and be our true selves and seek the truth. It's a place where we can learn the unforced rhythms of grace. And if you place the table in the context of a church, then the table becomes more than simply a regular table. It becomes the table of the Lord Jesus. The Jesus who died and rose again to heal and restore us. The one who said "this is my body" and "this is my blood." The Jesus who brings us back into relationship with the one He called Father. The Jesus who confronts our sin, and reveals our addictions. The Jesus who in the cross revealed both the judgment and mercy of God to all humankind.
        - paragraph [ref=e51]: "At The Table, that's the Jesus we've come to love. That's why in November of 2019 twenty-nine adults from the Collin and Dallas County area set out to create a community committed to a thoughtful, inclusive, eclectic, communal, and vulnerable expression of Christian faith. Our heart was that everyone have a seat at the table: whether black or white, gay or straight, male or female, rich or poor. And our prayer is that in that messy place of community, honesty, and vulnerability Jesus would meet us and that we would never be the same."
      - generic [ref=e53]:
        - figure [ref=e54]:
          - img "Brett and Maggie Tilford" [ref=e55]
        - generic [ref=e56]:
          - heading "Brett and Maggie Tilford" [level=2] [ref=e57]
          - paragraph [ref=e58]: Brett and Maggie Tilford lead at The Table and live in Sachse, TX with their three kids Eve, Dax, and Oak. They have been married for 18 years and, although they have wildly different tastes in Netflix shows, they make a great team since they both love Jesus and helping others discover a more thoughtful, inclusive, and beautiful Christianity.
  - contentinfo [ref=e59]:
    - generic [ref=e60]:
      - paragraph [ref=e61]: The Table Church
      - navigation "Footer navigation" [ref=e62]:
        - list [ref=e63]:
          - listitem [ref=e64]:
            - link "Church Center" [ref=e65] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e66]:
            - link "Planning Center" [ref=e67] [cursor=pointer]:
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