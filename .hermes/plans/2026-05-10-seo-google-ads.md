# SEO + Google Ads Plan

**Goal:** Make the new Astro site discoverable for people searching for a church near Sachse/Garland/Murphy/Wylie/Richardson, while giving Google Ads clean landing pages and conversion tracking.

**Current site status:** Basic page titles and meta descriptions exist through `src/layouts/Layout.astro`, but the site does not yet appear to have full canonical tags, Open Graph/Twitter metadata, sitemap generation, robots.txt, structured data, Google Search Console verification, Google Analytics/Tag Manager, or Google Ads conversion tracking wired in.

---

## Organic SEO priorities

### 1. Technical SEO foundation

Add or verify:
- canonical URL tags on every public page
- Open Graph metadata for share previews
- Twitter card metadata
- sitemap.xml
- robots.txt
- proper 404 behavior
- noindex for experimental/private pages such as `/ask/` unless intentionally public
- stable redirects from old WordPress URLs where needed
- page speed checks after launch

Likely files:
- `site/src/layouts/Layout.astro`
- `site/astro.config.mjs`
- `site/public/robots.txt`
- route/page files under `site/src/pages/`

### 2. Local church SEO

Target searches:
- church in Sachse TX
- inclusive church near Sachse
- progressive church near Garland / Murphy / Wylie
- church for people hurt by church
- Sunday evening church near me
- LGBTQ affirming church near Sachse / Garland
- non-denominational church Sachse, if accurate

Needed landing pages/content:
- `/new-here/`
- `/service-times-locations/`
- `/what-sundays-are-like/`
- `/kids-youth/`
- `/meetups/`
- `/our-vision/`

Add page-specific titles/descriptions for each.

### 3. Structured data

Add JSON-LD for:
- `Church` or `LocalBusiness`/`Place`
- name: The Table
- address
- service time
- website URL
- social links
- geo coordinates if available

Potentially add event structured data later for special services or gatherings.

### 4. Google Business Profile

This is outside the repo but important:
- confirm NAP consistency: name, address, phone
- website URL points to new Astro domain after launch
- service time is accurate
- photos are current
- categories are appropriate
- reviews strategy exists but is not manipulative

---

## Google Ads priorities

### 1. Start with search ads, not display

Recommended campaign type:
- Search campaign only
- Local radius around Sachse/Garland/Murphy/Wylie/Richardson
- Phrase/exact match at first
- Avoid broad match until conversion data exists

Possible ad groups:

1. Church near me
   - church near me
   - church in Sachse TX
   - church near Garland TX
   - Sunday evening church

2. Inclusive / affirming church
   - inclusive church near me
   - LGBTQ affirming church near Sachse
   - progressive church near Garland

3. Deconstructing / church hurt
   - church for people hurt by church
   - safe church near me
   - progressive Christian church

4. Families / kids
   - church with kids ministry near Sachse
   - family church near me

### 2. Landing pages

Do not send all ads to the homepage.

Recommended landing pages:
- `/new-here/` for general church searches
- `/what-sundays-are-like/` for first-time visitor searches
- `/kids-youth/` for family/kids searches
- `/our-vision/` or a future dedicated affirming/inclusive page for inclusion-related searches

Each ad landing page should answer:
- where are you?
- when do you meet?
- what will it feel like?
- what about kids?
- what should I wear?
- will I be pressured?
- how do I plan a visit or contact someone?

### 3. Conversion tracking

Track meaningful actions, not vanity metrics.

Recommended conversions:
- click “Get directions” / map link
- click “Plan a visit” if added
- click email/contact form
- click newsletter signup
- click Church Center / giving should not be an ad conversion unless intentional
- phone tap on mobile

Implementation options:
- Google Tag Manager container in `Layout.astro`
- Google Analytics 4
- Google Ads conversion tags through GTM

Do not hardcode secrets. Use public measurement IDs only, preferably from environment variables or site config.

### 4. Negative keywords

Add negatives early:
- table restaurant
- furniture
- dining table
- periodic table
- jobs
- lyrics
- free money
- catholic mass, if not relevant
- baptist, methodist, etc. only if those mismatches waste spend

---

## Implementation tasks

### Task 1: SEO audit

Check generated pages for:
- title
- meta description
- canonical
- OG image
- noindex
- sitemap/robots

Command:

```bash
cd /home/gary/dev/github/thetable2026/site
npm run build
```

Then inspect `dist` output or run a local crawler.

### Task 2: Upgrade layout SEO

Modify `site/src/layouts/Layout.astro` to accept:
- `canonicalPath`
- `noindex`
- `image`
- maybe `type`

Add:
- canonical link
- `robots` meta when noindex
- og:title
- og:description
- og:url
- og:site_name
- og:type
- og:image when available
- twitter:card

### Task 3: Add sitemap/robots

Add Astro sitemap integration or a small generated sitemap route.

Preferred if dependency acceptable:
- `@astrojs/sitemap`

Also add:
- `site/public/robots.txt`

### Task 4: Add church JSON-LD

Add a reusable component or layout block for organization/church structured data.

Data source should come from homepage/site content where possible:
- address
- phone
- serviceTime
- socialLinks

### Task 5: Add ads/analytics configuration hook

Add optional GTM/GA IDs through env/site config.

Rules:
- Do not break local dev when unset.
- Do not include private credentials.
- Keep no tracking on local if desired.

### Task 6: Build landing page copy pass

Review these pages for search intent:
- `/new-here/`
- `/what-sundays-are-like/`
- `/service-times-locations/`
- `/kids-youth/`
- `/our-vision/`

Make sure each has a unique title and description.

### Task 7: Ads launch checklist

Before spending money:
- Search Console verified
- GA4 installed
- Google Ads linked to GA4
- conversion events tested
- landing pages mobile-checked
- negative keyword list loaded
- daily budget capped
- location targeting restricted

---

## Recommended order

1. Finish technical SEO foundation before ads.
2. Add Search Console + sitemap.
3. Improve landing pages.
4. Add GA4/GTM and conversion tracking.
5. Launch very small Google Search campaign.
6. Review search terms weekly and add negatives.

---

## Decisions needed

- Final canonical domain: `https://thetabletx.com` or another URL?
- Do we want Google Tag Manager, or direct GA4/Ads tags?
- Which ad landing page should be the primary one: `/new-here/` or `/what-sundays-are-like/`?
- Monthly ad budget and radius.
- Whether to create a dedicated “inclusive church near Sachse” landing page, or keep that language in existing pages.
