# Homepage Decomposition Checklist

## Purpose

Provide a deliberate migration procedure for converting the live WordPress homepage into the Astro `site/homepage.md` content model.

Use this checklist for:

- `https://thetabletx.com/`
- WordPress page ID `1737`
- Astro target `site/src/content/site/homepage.md`

## Why This Needs Its Own Checklist

The homepage is not a normal page migration.

It is a decomposition task:

- the WordPress source is a SiteOrigin/Page Builder layout
- the Astro target is a structured singleton content entry
- media and repeated homepage sections must be mapped intentionally rather than converted wholesale

## Source Inputs

Use:

- `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/api/pages.json`
  - page ID `1737`
- `/Users/gary/Dev/thetable/migration-data/site-manifest-latest/summaries/pages-content.json`
  - page ID `1737`
- live homepage reference:
  - `https://thetabletx.com/`
- local uploads:
  - `/Users/gary/Dev/thetable/wp-content/uploads/`

## Target File

- `site/src/content/site/homepage.md`

## Media Target Locations

- images:
  - `site/public/images/home/`
- video:
  - `site/public/video/home/`

## Checklist

### 1. Confirm The Source Record

- confirm front page in `site-meta.json` points to page ID `1737`
- confirm the live homepage still matches the intended public scope

### 2. Preserve The Existing Astro Homepage Shape

Do not invent a new homepage schema unless the migration clearly requires it.

Target fields already exist for:

- `heroTitle`
- `heroSubtitle`
- `heroImage`
- `heroVideo`
- `intro`
- `welcomeTitle`
- `welcomeVideoUrl`
- `valuesIntro`
- `values[]`
- `featureSections[]`
- `communityTitle`
- `communityBody`
- `communityImages[]`
- `contactTitle`
- `contactBody`
- `addressLines[]`
- `serviceTime`
- `meetupsUrl`
- `socialLinks[]`

### 3. Extract Hero Section

From the homepage source, identify:

- main headline
- subheadline
- hero visual treatment

Then:

- set `heroTitle`
- set `heroSubtitle`
- decide whether the hero should use:
  - `heroImage`, or
  - `heroVideo`

Current preferred behavior:

- if the public homepage uses the b-roll video, copy it locally into:
  - `site/public/video/home/`
- point `heroVideo` at the local project path

### 4. Extract Intro Statement

Identify the homepage statement block immediately under the hero.

Set:

- `intro`

Keep this as a concise statement, not a full HTML block.

### 5. Extract Welcome / Video Section

Identify:

- welcome heading
- embedded or linked welcome video

Set:

- `welcomeTitle`
- `welcomeVideoUrl`

If the source remains a YouTube-hosted video:

- keep the YouTube URL external

### 6. Extract Values Section

Identify:

- values heading/introduction
- each visible value item

Set:

- `valuesIntro`
- `values[]`

For each value item:

- `title`
- `body`

Do not carry over SiteOrigin icon/layout noise into content fields.

### 7. Extract Repeated Feature Sections

Identify each repeated feature row that combines:

- heading
- supporting copy
- image

Map them into:

- `featureSections[]`

For each item:

- copy the image locally into `site/public/images/home/`
- set `image`
- set `imageAlt`
- set `title`
- set `body`

### 8. Extract Community / Get Involved Section

Identify:

- section heading
- supporting copy
- supporting image set

Set:

- `communityTitle`
- `communityBody`
- `communityImages[]`

For each image:

- copy locally into `site/public/images/home/`
- set `src`
- set `alt`

### 9. Extract Contact / Footer Callout Band

Identify:

- contact heading
- contact supporting copy
- address
- service time
- meetups link
- social links

Set:

- `contactTitle`
- `contactBody`
- `addressLines[]`
- `serviceTime`
- `meetupsUrl`
- `socialLinks[]`

### 10. Decide What Stays Out Of Body Markdown

Do not dump homepage layout content into the Markdown body just because it exists in WordPress.

Keep the body section for:

- small supporting narrative content only

Do not keep:

- SiteOrigin wrappers
- form markup
- layout scaffolding
- widget decoration markup

### 11. Localize Launch-Critical Media

Before calling the migration complete:

- copy homepage b-roll video locally if it is part of the launch homepage
- copy launch-critical homepage images locally
- replace any remaining launch-critical WordPress media URLs in the homepage entry

### 12. Validate The Homepage Locally

- set `draft: false`
- run the local Astro site
- verify the homepage renders with:
  - hero media
  - intro
  - welcome/video section
  - values
  - feature sections
  - community section
  - contact band

If the route or media behaves unexpectedly:

- restart `npm run dev`

### 13. Perform Live Parity Review

Compare Astro homepage against the live homepage:

- section order
- content hierarchy
- key headings
- visual rhythm
- launch-critical images/video

Record intentional differences.

## Completion Standard

The homepage migration is complete when:

- `site/src/content/site/homepage.md` uses the agreed schema cleanly
- launch-critical homepage media is local to the Astro project
- the local homepage renders correctly
- the result is recognizably faithful to the live homepage
