# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> home
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  Expected an image 1440px by 9631px, received 1440px by 10314px. 13372659 pixels (ratio 0.91 of all image pixels) are different.

  Snapshot: home-desktop.png

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
        - paragraph [ref=e35]: The Table Church
        - heading "Come Join Us" [level=1] [ref=e36]
        - paragraph [ref=e37]: Service Each Sunday @ 5PM
      - paragraph [ref=e40]: An LGBTQ-affirming church committed to embodying a welcoming, inclusive, and beautiful expression of Christian faith.
      - generic [ref=e42]:
        - heading "WE CELEBRATE EVERY STORY" [level=2] [ref=e43]
        - iframe [ref=e45]:
          - generic [active] [ref=f1e1]:
            - generic "YouTube Video Player" [ref=f1e3]
            - generic [ref=f1e5]:
              - generic:
                - generic:
                  - button "Play video" [ref=f1e10] [cursor=pointer]
                  - button "Hide player controls" [ref=f1e12] [cursor=pointer]
                  - generic [ref=f1e14]:
                    - generic [ref=f1e19]:
                      - generic [ref=f1e20]:
                        - link "Welcome to The Table" [ref=f1e21] [cursor=pointer]:
                          - /url: https://www.youtube.com/watch?v=xbtuP_UITPo
                        - link "The Table TX" [ref=f1e22] [cursor=pointer]:
                          - /url: /channel/UC4C3HWTMx34ec7QJ5hkhtwg
                          - generic [ref=f1e23]: The Table TX
                      - generic [ref=f1e24]:
                        - button [ref=f1e25] [cursor=pointer]
                        - generic [ref=f1e27]:
                          - generic: The Table TX
                          - generic: 150 subscribers
                    - generic [ref=f1e28]:
                      - button "Copy link" [ref=f1e31] [cursor=pointer]:
                        - generic [ref=f1e35]:
                          - img
                      - link "Watch on YouTube" [ref=f1e42] [cursor=pointer]:
                        - /url: https://www.youtube.com/watch?v=xbtuP_UITPo
                        - generic [ref=f1e45]:
                          - text: Watch on
                          - img [ref=f1e47]:
                            - generic [ref=f1e49]:
                              - img
      - generic [ref=e46]:
        - generic [ref=e47]:
          - heading "WHO WE ARE" [level=2] [ref=e48]
          - paragraph [ref=e49]: At the core of our mission to cultivate a welcoming community, our five key pillars guide us in creating an empowering space where everyone is encouraged to explore their faith and identity with compassion and understanding.
        - generic [ref=e50]:
          - article [ref=e51]:
            - generic [ref=e52]: "01"
            - heading "Thoughtful" [level=3] [ref=e54]
            - paragraph [ref=e55]: We embody thoughtfulness, ensuring every action reflects our deep respect and understanding for each other's journeys.
          - article [ref=e56]:
            - generic [ref=e57]: "02"
            - heading "Inclusive" [level=3] [ref=e59]
            - paragraph [ref=e60]: Our acceptance knows no bounds, championing inclusivity as we welcome all identities and backgrounds with open arms.
          - article [ref=e61]:
            - generic [ref=e62]: "03"
            - heading "Eclectic" [level=3] [ref=e64]
            - paragraph [ref=e65]: We value eclecticism and embrace a multitude of perspectives, enriching our community with diverse voices and ideas.
          - article [ref=e66]:
            - generic [ref=e67]: "04"
            - heading "Communal" [level=3] [ref=e69]
            - paragraph [ref=e70]: We foster a strong communal spirit, sharing experiences that bind us closer and uplift our collective spirit.
          - article [ref=e71]:
            - generic [ref=e72]: "05"
            - heading "Vulnerable" [level=3] [ref=e74]
            - paragraph [ref=e75]: We cultivate deep, authentic connections through open-hearted sharing, fostering a culture of empathy and trust.
      - generic [ref=e78]:
        - paragraph [ref=e79]: YOU BELONG HERE
        - paragraph [ref=e80]: No exceptions. No fine print.
        - paragraph [ref=e81]: You are a child of God. This is true on your best day, and it's true on your worst day. You are loved, you are worthy, and you are accepted, just as you are.
      - generic [ref=e83]:
        - heading "THIS IS A FULLY AFFIRMING CHURCH" [level=2] [ref=e84]
        - generic [ref=e85]:
          - generic [ref=e86]: Preferred pronouns honored
          - generic [ref=e87]: LGBTQ+ marriages affirmed
          - generic [ref=e88]: LGBTQ+ in all leadership
          - generic [ref=e89]: No exceptions. No fine print.
      - generic [ref=e91]:
        - generic [ref=e92]:
          - heading "WEEKLY COMMUNION" [level=2] [ref=e93]
          - paragraph [ref=e94]: We gather around The Table to hold communion weekly as a profound expression of our unity and shared faith, reminding us of our connection to one another and our commitment to living out the values of love, inclusion, and grace in our daily lives.
        - figure [ref=e95]:
          - img "Weekly communion at The Table Church" [ref=e96]
      - generic [ref=e99]:
        - heading "JOIN US AS YOU ARE" [level=2] [ref=e100]
        - paragraph [ref=e101]: Our commitment to providing both in person and virtual services has expanded our reach, connecting us with a vibrant community of progressive Christians and affirming churches, fostering unity and inclusivity across distances.
        - generic [ref=e102]:
          - link "Facebook live stream" [ref=e103] [cursor=pointer]:
            - /url: https://www.facebook.com/TheTableTX/
          - link "YouTube live stream" [ref=e104] [cursor=pointer]:
            - /url: https://www.youtube.com/channel/UC4C3HWTMx34ec7QJ5hkhtwg
      - generic [ref=e106]:
        - generic [ref=e107]:
          - heading "GET INVOLVED" [level=2] [ref=e108]
          - paragraph [ref=e109]: Get involved with The Table by joining us at 5pm on Sunday evenings, joining our meetups, participating in our youth ministry, or attending our monthly fellowship at Hat Creek Burgers.
          - list [ref=e110]:
            - listitem [ref=e111]:
              - link "Sunday service at 5pm" [ref=e112] [cursor=pointer]:
                - /url: /service-times-locations/
                - generic [ref=e113]: Sunday service at 5pm
            - listitem [ref=e114]:
              - link "MeetUps" [ref=e115] [cursor=pointer]:
                - /url: /meetups/
                - generic [ref=e116]: MeetUps
            - listitem [ref=e117]:
              - link "Youth ministry" [ref=e118] [cursor=pointer]:
                - /url: /kids-youth/
                - generic [ref=e119]: Youth ministry
            - listitem [ref=e120]:
              - generic [ref=e121]:
                - generic [ref=e122]: Hat Creek fellowship
                - generic [ref=e123]: Monthly at Hat Creek Burgers
        - figure [ref=e124]:
          - img "Worship and fellowship at The Table Church" [ref=e125]
      - generic [ref=e128]:
        - heading "RECENT MESSAGES" [level=2] [ref=e129]
        - paragraph [ref=e130]: Recent sermon series from The Table.
        - list [ref=e131]:
          - listitem [ref=e132]:
            - link "Advent 2025" [ref=e133] [cursor=pointer]:
              - /url: /series/
              - generic [ref=e134]: Advent 2025
          - listitem [ref=e135]:
            - 'link "The End: It''s Just a New Beginning" [ref=e136] [cursor=pointer]':
              - /url: /series/
              - generic [ref=e137]: "The End: It's Just a New Beginning"
          - listitem [ref=e138]:
            - 'link "The Good Book: Fresh Insights Into an Ancient Text" [ref=e139] [cursor=pointer]':
              - /url: /series/
              - generic [ref=e140]: "The Good Book: Fresh Insights Into an Ancient Text"
          - listitem [ref=e141]:
            - 'link "Cultivating Calm: Staying Centered In Difficult Times" [ref=e142] [cursor=pointer]':
              - /url: /series/
              - generic [ref=e143]: "Cultivating Calm: Staying Centered In Difficult Times"
          - listitem [ref=e144]:
            - 'link "Enchanted: Reclaiming Sacred Ground in a Disenchanted World" [ref=e145] [cursor=pointer]':
              - /url: /series/
              - generic [ref=e146]: "Enchanted: Reclaiming Sacred Ground in a Disenchanted World"
          - listitem [ref=e147]:
            - link "Lent 2025" [ref=e148] [cursor=pointer]:
              - /url: /series/
              - generic [ref=e149]: Lent 2025
      - generic [ref=e151]:
        - generic [ref=e152]:
          - heading "REACH OUT TO US" [level=2] [ref=e153]
          - paragraph [ref=e154]: We'd love to hear from you and get to know you! Send us a message to learn where to start and how to get involved.
          - generic [ref=e155]:
            - generic [ref=e156]: THE TABLE
            - generic [ref=e157]: 1520 Blackburn Rd
            - generic [ref=e158]: Sachse, TX 75048
            - generic [ref=e159]: (469) 222-3617
            - generic [ref=e160]: Sundays at 5:00 pm
          - paragraph [ref=e161]: The Table meets inside the First United Methodist Church of Sachse. See map below for details.
          - generic [ref=e162]:
            - link "MeetUps details" [ref=e163] [cursor=pointer]:
              - /url: /meetups/
            - link "See map below" [ref=e164] [cursor=pointer]:
              - /url: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3346.860920011535!2d-96.61174262371553!3d32.98107097352899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c0336e0c2f96f%3A0xccaa810b6cf3a509!2sThe%20Table!5e0!3m2!1sen!2sus!4v1711477001971!5m2!1sen!2sus
        - iframe [ref=e166]
      - generic [ref=e168]:
        - generic [ref=e169]:
          - heading "CONTACT US" [level=2] [ref=e170]
          - paragraph [ref=e171]: Send us a message and we will be in touch.
          - paragraph [ref=e172]: How can we help? If you have a question or need to connect with someone from The Table TX, we'd love to hear from you. Please just fill out the form and someone will be in contact with you shortly. We look forward to hearing from you!
        - generic [ref=e173]:
          - generic [ref=e174]:
            - generic [ref=e175]:
              - generic [ref=e176]: First Name
              - textbox "First Name" [ref=e177]
            - generic [ref=e178]:
              - generic [ref=e179]: Last Name
              - textbox "Last Name" [ref=e180]
            - generic [ref=e181]:
              - generic [ref=e182]: Email
              - textbox "Email" [ref=e183]
            - generic [ref=e184]:
              - generic [ref=e185]: Phone
              - textbox "Phone" [ref=e186]
            - generic [ref=e187]:
              - generic [ref=e188]: Message
              - textbox "Message" [ref=e189]
          - generic [ref=e190]:
            - button "Submit" [ref=e191]
            - link "Open Church Center" [ref=e192] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
      - generic [ref=e194]:
        - generic [ref=e195]:
          - heading "OUR VISION" [level=2] [ref=e196]
          - paragraph [ref=e197]: We exist to shift a generation from reactionary to visionary through the person and work of Jesus.
        - figure [ref=e198]:
          - img "The Table Church logo" [ref=e199]
  - contentinfo [ref=e200]:
    - generic [ref=e201]:
      - paragraph [ref=e202]: The Table Church
      - navigation "Footer navigation" [ref=e203]:
        - list [ref=e204]:
          - listitem [ref=e205]:
            - link "Church Center" [ref=e206] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e207]:
            - link "Planning Center" [ref=e208] [cursor=pointer]:
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