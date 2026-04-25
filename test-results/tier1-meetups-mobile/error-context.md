# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> meetups
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  Expected an image 390px by 3143px, received 390px by 2737px. 870969 pixels (ratio 0.72 of all image pixels) are different.

  Snapshot: meetups-mobile.png

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
    - heading "MeetUps" [level=1] [ref=e41]
    - generic [ref=e42]:
      - generic [ref=e44]:
        - paragraph [ref=e45]:
          - strong [ref=e46]: The Table MeetUps
        - paragraph [ref=e47]: MeetUps are diverse small groups that extend relationships beyond our Sunday services. They include home groups, book clubs, discipleship groups, and Bible studies. These gatherings offer meaningful connections centered around Christ. Our goal is for these groups to be accessible to everyone, especially new visitors, and demonstrate our values (thoughtful, inclusive, eclectic, communal, and vulnerable).
        - heading "Current Available MeetUps at The Table" [level=2] [ref=e48]
        - heading "Home Groups" [level=3] [ref=e49]
        - paragraph [ref=e50]: Intergenerational groups that meet for relational connection and Christ-centered discussion. Most groups share their highs, lows, and prayer requests and discuss the week's sermon topic.
        - list [ref=e51]:
          - listitem [ref=e52]:
            - strong [ref=e53]: Allen
            - text: "- Wednesdays at 7pm led by Rissa & Scott Marlar"
          - listitem [ref=e54]:
            - strong [ref=e55]: Wylie
            - text: "- Wednesdays at 7pm led by Anna & Becky Barnes"
          - listitem [ref=e56]:
            - strong [ref=e57]: Fate
            - text: "- Monthly on Saturdays led by Aaron & Becky Pearce"
          - listitem [ref=e58]:
            - strong [ref=e59]: Richardson
            - text: "- Thursdays at 7pm led by Charles & Julie Kiser"
        - heading "Affinity Groups" [level=3] [ref=e60]
        - paragraph [ref=e61]: These groups vary in their focus. Check out their descriptions below to learn more.
        - list [ref=e62]:
          - listitem [ref=e63]:
            - strong [ref=e64]: Book Club
            - text: "- 8:00 am Sunday mornings in Wylie. Description: Our MeetUp spends 50% of the time eating and connecting relationally and 50% discussing a chapter of whatever book we're reading (generally progressive Christian theology - nothing crazy academic though). All are welcome. Leader: Brett Tilford."
          - listitem [ref=e65]:
            - strong [ref=e66]: Table Teens
            - text: "- 6:30pm - 8:00pm Sundays. Description: A group for 7th-12th graders in a relaxed atmosphere (includes food, games, song, & Bible discussion). Leaders: Maggie Tilford, Michael Alvarez, and Marisa Martinez."
          - listitem [ref=e67]:
            - strong [ref=e68]: 20-Somethings' Monthly Brunch
            - text: "- Once a month, typically 11am on Sunday in Allen. Description: Anyone post-high school but not yet 30 is welcome for food, games, and fun conversation! Leaders: Christian and Megan Gray Hering."
        - heading "Sprint Groups" [level=3] [ref=e69]
        - paragraph [ref=e70]: These groups meet for a short period of time, like a month. Topics vary by group.
        - list [ref=e71]:
          - listitem [ref=e72]:
            - strong [ref=e73]: Not Your Mama's Sunday School
            - text: "- Sundays at 3pm (runs for several weeks and then takes a break before returning). Description: For all who want to read and discuss the Christian Bible in a way that considers scholarship and welcomes diversity of thought. Leader: Megan Gray Hering."
      - generic [ref=e76]:
        - heading "Interested in attending a MeetUp?" [level=2] [ref=e77]
        - list [ref=e78]:
          - listitem [ref=e79]:
            - generic [ref=e81]: Fill out our interest form here
          - listitem [ref=e82]:
            - generic [ref=e84]: Tell us your ideas here!
      - generic [ref=e86]:
        - heading "How can I pitch in to help get Table MeetUps off the ground?" [level=2] [ref=e87]
        - paragraph [ref=e88]: We are open to starting new groups!
        - heading "Leading" [level=3] [ref=e89]
        - paragraph [ref=e90]: As you can see from the above list, our groups are quite diverse. Your first step is to think about what kind of group you are interested in facilitating. Does this group have a particular focus or meet a particular need or is it more of a home group? Is this an ongoing group or meet for a short season? Next, let us know!
        - heading "Hosting" [level=3] [ref=e91]
        - paragraph [ref=e92]: We are extremely thankful for those who open their houses for a MeetUp to meet. If you have a space and would be willing to participate in a group, let us know!
  - contentinfo [ref=e93]:
    - generic [ref=e94]:
      - paragraph [ref=e95]: The Table Church
      - navigation "Footer navigation" [ref=e96]:
        - list [ref=e97]:
          - listitem [ref=e98]:
            - link "Church Center" [ref=e99] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e100]:
            - link "Planning Center" [ref=e101] [cursor=pointer]:
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