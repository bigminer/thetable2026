# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> lgbt-affirming-church
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  Expected an image 1440px by 8248px, received 1440px by 7991px. 10150701 pixels (ratio 0.86 of all image pixels) are different.

  Snapshot: lgbt-affirming-church-desktop.png

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
    - heading "LGBT Affirming Church" [level=1] [ref=e32]
    - generic [ref=e35]:
      - generic [ref=e37]:
        - img "The Table Church LBGT Affirming" [ref=e38]
        - generic [ref=e42]:
          - heading "The Table" [level=2] [ref=e43]
          - heading "An LGBTQ-affirming church committed to embodying a welcoming, inclusive, and beautiful expression of Christian faith." [level=3] [ref=e44]
      - generic [ref=e47]:
        - generic [ref=e51]:
          - heading "GET INVOLVED" [level=1] [ref=e52]
          - paragraph [ref=e53]: Get involved with The Table by joining us at 5pm on Sunday evenings, joining our meetups, participating in our youth ministry, or attending our monthly fellowship at Hat Creek Burgers.
        - generic [ref=e57]:
          - img "worship together" [ref=e59]
          - img "open and affirming" [ref=e61]
          - img "family oriented" [ref=e63]
      - generic [ref=e66]:
        - generic [ref=e69]:
          - heading "WHO WE ARE" [level=1] [ref=e70]
          - paragraph [ref=e71]: At the core of our mission to cultivate a welcoming community, our five key pillars guide us in creating an empowering space where everyone is encouraged to explore their faith and identity with compassion and understanding.
        - list [ref=e75]:
          - listitem [ref=e76]:
            - generic [ref=e77]:
              - heading "Thoughtful" [level=6] [ref=e78]
              - paragraph [ref=e80]: We embody thoughtfulness, ensuring every action reflects our deep respect and understanding for each other's journeys.
          - listitem [ref=e81]:
            - generic [ref=e82]:
              - heading "Inclusive" [level=6] [ref=e83]
              - paragraph [ref=e85]: Our acceptance knows no bounds, championing inclusivity as we welcome all identities and backgrounds with open arms.
          - listitem [ref=e86]:
            - generic [ref=e87]:
              - heading "Eclectic" [level=6] [ref=e88]
              - paragraph [ref=e90]: We value eclecticism and embrace a multitude of perspectives, enriching our community with diverse voices and ideas.
        - list [ref=e94]:
          - listitem [ref=e95]:
            - generic [ref=e96]:
              - heading "Communal" [level=5] [ref=e97]
              - generic [ref=e98]: We foster a strong communal spirit, sharing experiences that bind us closer and uplift our collective spirit
          - listitem [ref=e99]:
            - generic [ref=e100]:
              - heading "Vulnerable" [level=5] [ref=e101]
              - paragraph [ref=e103]: We cultivate deep, authentic connections through open-hearted sharing, fostering a culture of empathy and trust.
      - generic [ref=e105]:
        - img "living in peace" [ref=e110]
        - generic [ref=e115]:
          - heading "YOU BELONG" [level=2] [ref=e116]
          - paragraph [ref=e117]:
            - text: You are a child of God.
            - text: YOU are a child of God.
            - text: This is true on your best day, and it's true on your worst day. You are loved, you are worthy, and you are accepted, just as you are.
      - generic [ref=e118]:
        - generic [ref=e123]:
          - heading "WEEKLY COMMUNION" [level=2] [ref=e124]
          - paragraph [ref=e125]: We gather around The Table to hold communion weekly as a profound expression of our unity and shared faith, reminding us of our connection to one another and our commitment to living out the values of love, inclusion, and grace in our daily lives.
        - img "theTable_values pic2" [ref=e130]
      - generic [ref=e137]:
        - generic [ref=e141]:
          - heading "JOIN US AS YOU ARE" [level=2] [ref=e142]
          - paragraph [ref=e143]: Our commitment to providing both in person and virtual services has expanded our reach, connecting us with a vibrant community of progressive Christians and affirming churches, fostering unity and inclusivity across distances.
        - heading "Join Is In Person or Live Streaming for our Sunday Services" [level=2] [ref=e148]
        - generic:
          - generic:
            - generic:
              - link "The Table Church on Facebook":
                - /url: https://www.facebook.com/TheTableTX/
              - link "The Table Church on Youtube":
                - /url: https://www.youtube.com/@thetabletx7926
      - generic [ref=e154]:
        - heading "REACH OUT TO US" [level=1] [ref=e155]
        - paragraph [ref=e156]:
          - text: We'd love to hear from you and get to know you!
          - text: Send us a message to learn where to start and how to get involved.
      - generic [ref=e158]:
        - generic [ref=e159]:
          - generic [ref=e162]:
            - heading "THE TABLE" [level=3] [ref=e163]
            - generic [ref=e164]:
              - paragraph [ref=e165]:
                - text: 1520 Blackburn Rd
                - text: Sachse, TX 75048
                - text: phone (469) 222-3617
              - heading "Service Time" [level=3] [ref=e166]
              - paragraph [ref=e167]:
                - strong [ref=e168]: Sundays at 5:00 pm
                - text: For more information on
                - link "The Table MeetUps, click here" [ref=e169] [cursor=pointer]:
                  - /url: /meetups/
              - paragraph [ref=e170]:
                - text: The Table meets inside the First United Methodist Church of Sachse.
                - text: See map below for details.
          - iframe [ref=e174]
        - generic [ref=e177]:
          - heading "CONTACT US" [level=3] [ref=e178]
          - paragraph [ref=e179]:
            - text: We'd love to hear from you and get to know you!
            - link "Click here to send us a message" [ref=e180] [cursor=pointer]:
              - /url: /contact-us/
            - text: and someone will be in touch shortly.
      - generic [ref=e182]:
        - generic [ref=e186]:
          - heading "OUR VISION" [level=1] [ref=e187]
          - paragraph [ref=e188]: We exist to shift a generation from reactionary to visionary through the person and work of Jesus.
        - img "The Table Affirming Logo sq" [ref=e193]
  - contentinfo [ref=e194]:
    - generic [ref=e195]:
      - paragraph [ref=e196]: The Table Church
      - navigation "Footer navigation" [ref=e197]:
        - list [ref=e198]:
          - listitem [ref=e199]:
            - link "Church Center" [ref=e200] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e201]:
            - link "Planning Center" [ref=e202] [cursor=pointer]:
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