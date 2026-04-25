# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1.spec.ts >> our-vision
- Location: tests/visual/tier1.spec.ts:27:3

# Error details

```
Error: expect(Buffer).toMatchSnapshot(expected) failed

  Expected an image 390px by 5361px, received 390px by 4724px. 1491107 pixels (ratio 0.72 of all image pixels) are different.

  Snapshot: our-vision-mobile.png

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
    - heading "Our Vision & Values" [level=1] [ref=e41]
    - generic [ref=e42]:
      - generic [ref=e45]:
        - paragraph [ref=e46]:
          - strong [ref=e47]: The Table exists to shift a generation from reactionary to visionary through the person and work of Jesus.
        - paragraph [ref=e48]: In a country where Christianity is coming to be seen more as a place of exclusion and hate, The Table longs to embody a different way. A way that is inclusive and affirming of all people regardless of ethnic background, gender identity, age, or sexual orientation. A way that seeks to live out a beautiful Christian faith. We'd love to have you join us on the journey.
      - generic [ref=e49]:
        - heading "What We Value" [level=2] [ref=e51]
        - generic [ref=e52]:
          - article [ref=e53]:
            - generic [ref=e54]: "01"
            - heading "Thoughtful" [level=3] [ref=e56]
            - paragraph [ref=e57]: We are a community that values thoughtfulness in how we approach faith, life, and the people around us. We are ok with taking things a bit slowly. We think it through, weighing the cost of our words and the implications of our actions. To be thoughtful means that there are no questions or issues that we are unwilling to tackle. Instead, we seek to mirror both the calm and the depth of Christ for whom nothing was off-limits.
          - article [ref=e58]:
            - generic [ref=e59]: "02"
            - heading "Inclusive" [level=3] [ref=e61]
            - paragraph [ref=e62]: We are a radically inclusive community. The reactionary mind is constantly searching for an enemy to exclude, but we keep searching for new people to bring to the table. We keep stretching, stretching, stretching the definitions of who might be valued and welcomed into God's kingdom. No matter what socioeconomic bracket, racial identity, sexual identity, mental facility, or moral standing, we want to create a tent big enough to hold everyone.
          - article [ref=e63]:
            - generic [ref=e64]: "03"
            - heading "Eclectic" [level=3] [ref=e66]
            - paragraph [ref=e67]: Radical inclusivity means that we want to live into the tension that "difference" creates and celebrate the beautiful chaos of it all. This means we are a remarkably eclectic community. We think there's beauty in bringing unexpected people, ideas, and traditions of Christianity together because it's in that place of creative tension that new life happens. That's why we want and need people of differing theologies, politics, personalities, and giftedness in one community. Sure, it's uncomfortable at times, but we're all better off for it because without the new and different we cannot stretch and grow.
          - article [ref=e68]:
            - generic [ref=e69]: "04"
            - heading "Communal" [level=3] [ref=e71]
            - paragraph [ref=e72]: We are a church devoted to the principles of communion. To participate in communion is to lean into the mystery of Christ's present nearness. As a communal church, we are committed to being present to one another. To allow the depth that is fostered in being in communion with one another to resonate out into the world around us. We believe that to be in communion with one another is to participate in the reparative, restorative, renewing life of Christ.
          - article [ref=e73]:
            - generic [ref=e74]: "05"
            - heading "Vulnerable" [level=3] [ref=e76]
            - paragraph [ref=e77]: We are a church committed to vulnerability as it is the linchpin to all of our other values. It takes vulnerability to be introspective in the way that thoughtfulness requires. It takes vulnerability to allow the risks and challenges in the way inclusivity requires. It takes vulnerability to do the work of synthesizing eclectic ideas and making room for the ways our assumptions will be challenged when we do that. And it takes vulnerability to foster the kind of depth and relational intimacy that communion inspires.
      - generic [ref=e79]:
        - heading "LGBTQI+ and One Level of Membership" [level=2] [ref=e80]
        - paragraph [ref=e81]: When we started the Table one of our primary motives was to offer a place where gay, lesbian, bisexual, transgender, queer, and intersex folks could be not only welcomed, but full participants in every aspect of the life of the church - whether that's leading a small group, preaching a sermon, or serving as an elder/staff member. In short, at The Table we only recognize one level of church membership regardless of a person's race, gender, gender identity (i.e. their own internal sense of gender), or sexual orientation. We look forward to the day when this belief is such a given in our world that churches no longer have to dedicate a part of their site to name it. However, in the meantime, we felt it was important that we state unequivocally where we stand. To summarize...
        - list [ref=e82]:
          - listitem [ref=e83]: Can a queer person be on staff? Yes.
          - listitem [ref=e84]: Can a queer person serve as pastor? Yes.
          - listitem [ref=e85]: Can a queer person be married? Yes.
          - listitem [ref=e86]: Will your pastor conduct gay weddings? Yes.
        - heading "Women In Leadership" [level=2] [ref=e87]
        - paragraph [ref=e88]: "Similarly, women have often been sidelined when it came to full participation in the life and particularly the leadership of Christian churches. At The Table, we long for that to change, thus in our community women are free to lead in any and every area of the church community: including preaching sermons, leading teams, and serving in any and all staff and elder/lead positions (including the role of senior pastor). To summarize..."
        - list [ref=e89]:
          - listitem [ref=e90]: Can a woman serve on the elder leadership team? Yes.
          - listitem [ref=e91]: Can a woman preach sermons on Sundays? Yes.
          - listitem [ref=e92]: Can a woman be on staff? Yes.
          - listitem [ref=e93]: Can a woman serve as the lead pastor of The Table? Yes.
        - heading "What We Believe" [level=2] [ref=e94]
        - list [ref=e95]:
          - listitem [ref=e96]:
            - emphasis [ref=e97]: We believe
            - text: in God as unending perfect relationship - simple yet multiple, one and yet three - Father, Son, and Spirit.
          - listitem [ref=e98]:
            - emphasis [ref=e99]: We believe
            - text: that the Son, Jesus Christ, became flesh. He lived, breathed, and walked among us and that through his life of love a new way of being human has been made available to all people - rich and poor, black and white, gay and straight, male and female.
          - listitem [ref=e100]:
            - emphasis [ref=e101]: We believe
            - text: that death has stolen into the world through sin, turning us into strangers of God, one another, and even ourselves. Yet, through the death and resurrection of the Son we are now reconciled to the Father.
          - listitem [ref=e102]:
            - emphasis [ref=e103]: We believe
            - text: that in communion we re-encounter the crucified and resurrected one.
          - listitem [ref=e104]:
            - emphasis [ref=e105]: We believe
            - text: that through baptism we go down into death and then are raised alive in Christ by the Spirit.
          - listitem [ref=e106]:
            - emphasis [ref=e107]: We believe
            - text: that the church is an essential means of grace in our lives, for it's in community that we see ourselves more truly and learn to patiently bear with those very different than ourselves.
          - listitem [ref=e108]:
            - emphasis [ref=e109]: We believe
            - text: that Scripture is given to guide and instruct us in how to live a life of love, and that the ultimate goal of this sacred text is to point us to Christ.
          - listitem [ref=e110]:
            - emphasis [ref=e111]: We believe
            - text: that while all creation groans waiting for the day of its redemption, at Christ' return all things and all people will be made new.
          - listitem [ref=e112]:
            - emphasis [ref=e113]: We believe
            - text: that in a reactionary, bitter, and angry world, we are called to introduce people to the visionary path of Jesus. A path marked by kindness, justice, and peace-making.
  - contentinfo [ref=e114]:
    - generic [ref=e115]:
      - paragraph [ref=e116]: The Table Church
      - navigation "Footer navigation" [ref=e117]:
        - list [ref=e118]:
          - listitem [ref=e119]:
            - link "Church Center" [ref=e120] [cursor=pointer]:
              - /url: https://thetabletx.churchcenter.com
          - listitem [ref=e121]:
            - link "Planning Center" [ref=e122] [cursor=pointer]:
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