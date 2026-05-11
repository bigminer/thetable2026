# GitHub Pages Demo QA Review

Target: https://bigminer.github.io/thetable2026/
Date: 2026-05-11
Scope: homepage, navigation, footer, leadership page, Ask page entry, series/podcast routes, major CTA destinations, GitHub Pages base-path behavior, assets, and deployability.
Tester: Hermes Agent automated HTTP/static QA from /home/gary/dev/github/thetable2026

## Executive Summary

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 2 |
| Medium | 1 |
| Low | 0 |
| Total | 3 |

Overall assessment: The GitHub Pages demo mostly serves core static content with assets and base-scoped header/footer links intact, but it is not launch-ready because the Ask route 404s, several Markdown/body links escape the `/thetable2026` base path, and the current repo cannot regenerate the GitHub Pages static build.

## Top Recommended Fixes

1. Decide how the Ask experience should behave on GitHub Pages: either make `/ask/` a static informational/disabled page for the demo, hide the CTA on static deploys, or deploy it somewhere with SSR/API support.
2. Rebase root-relative Markdown/body links for GitHub Pages the same way header/footer routes are rebased, or convert body links to project-aware URL helpers.
3. Fix `npm run build:gh-pages` so the demo can be regenerated from the current repo before relying on it for stakeholder review.

## Findings

### Issue 1: Ask page entry returns the GitHub Pages 404 page

Severity: High
Category: Functional / Deployment
URL: https://bigminer.github.io/thetable2026/ask/

Description:
The requested Ask page entry is unavailable on the GitHub Pages demo. Direct navigation to `/thetable2026/ask/` returns HTTP 404 and serves the site's 404 HTML instead of the Ask UI. This is consistent with the local static GitHub Pages build failing because `src/pages/ask.astro` and `src/pages/api/ask.ts` are server-rendered (`prerender = false`) while `astro.config.gh-pages.mjs` uses `output: 'static'`.

Steps to reproduce:
1. Open https://bigminer.github.io/thetable2026/ask/
2. Observe the HTTP status and rendered page.
3. From the repo, run `cd /home/gary/dev/github/thetable2026/site && npm run build:gh-pages`.

Expected behavior:
The demo should either load the intended Ask page entry or intentionally omit/redirect it with clear demo-safe behavior.

Actual behavior:
The deployed URL returns HTTP 404. The current GitHub Pages build command fails with:

```text
[NoAdapterInstalled] Cannot use server-rendered pages without an adapter.
```

Evidence:
- HTTP check artifact: /home/gary/dev/github/thetable2026/.hermes/qa/github-pages-http-results.json
- Build command tested: `npm run build:gh-pages`

### Issue 2: Some body links escape the `/thetable2026` base path and land on github.io root 404s

Severity: High
Category: Functional
URLs observed:
- https://bigminer.github.io/thetable2026/new-here/
- https://bigminer.github.io/thetable2026/kids-youth/
- https://bigminer.github.io/thetable2026/service-times-locations/

Description:
Most header/footer links are correctly rebased to `/thetable2026/...`, but several content/body links remain root-relative. On GitHub Pages these resolve to `https://bigminer.github.io/...` instead of `https://bigminer.github.io/thetable2026/...`, which sends users to GitHub Pages root 404s.

Steps to reproduce:
1. Open https://bigminer.github.io/thetable2026/new-here/
2. Click the body link that points to `/contact-us/`.
3. Observe navigation to https://bigminer.github.io/contact-us/ and the GitHub Pages 404.
4. Repeat on https://bigminer.github.io/thetable2026/kids-youth/ for `/meetups/`.
5. Repeat on https://bigminer.github.io/thetable2026/service-times-locations/ for `/series/`.

Expected behavior:
Internal body links should stay inside the demo base path:
- https://bigminer.github.io/thetable2026/contact-us/
- https://bigminer.github.io/thetable2026/meetups/
- https://bigminer.github.io/thetable2026/series/

Actual behavior:
The following root URLs return 404:
- https://bigminer.github.io/contact-us/
- https://bigminer.github.io/meetups/
- https://bigminer.github.io/series/

Evidence:
- HTTP check artifact: /home/gary/dev/github/thetable2026/.hermes/qa/github-pages-http-results.json

### Issue 3: Current GitHub Pages static build cannot be regenerated from the repo

Severity: Medium
Category: Deployment
URL/command: /home/gary/dev/github/thetable2026/site, `npm run build:gh-pages`

Description:
The deployed demo appears to be an older static artifact, while the current repo cannot produce a fresh GitHub Pages build. This makes the public demo hard to trust for current parity review and prevents fixes from being verified through the same deploy path.

Steps to reproduce:
1. Run `cd /home/gary/dev/github/thetable2026/site`.
2. Run `npm run build:gh-pages`.
3. Observe the Astro build failure.

Expected behavior:
The GitHub Pages build should complete successfully and produce a deployable static `dist/` for the `/thetable2026` base path.

Actual behavior:
Astro exits with `[NoAdapterInstalled] Cannot use server-rendered pages without an adapter.` because server-rendered Ask/API routes are present under a static output config.

Evidence:
- Command output captured during this review.

## Positive Checks / No Issues Found

- Homepage loaded at https://bigminer.github.io/thetable2026/ with HTTP 200.
- Leadership page loaded at https://bigminer.github.io/thetable2026/leadership/ with HTTP 200.
- Series index loaded at https://bigminer.github.io/thetable2026/series/ with HTTP 200.
- Series detail loaded at https://bigminer.github.io/thetable2026/series/the-good-book/ with HTTP 200.
- Podcast detail loaded at https://bigminer.github.io/thetable2026/podcast/scripture-more-than-a-book-luke-2425-27/ with HTTP 200.
- Major content pages tested with HTTP 200: `/new-here/`, `/our-story/`, `/our-vision/`, `/plan-your-visit/`, `/what-sundays-are-like/`, `/contact-us/`, `/meetups/`, `/kids-youth/`, `/service-times-locations/`.
- Checked 27 discovered static resources/assets; no broken deployed assets were found in the HTTP crawl.
- Major intentional external CTAs sampled successfully returned HTTP 200 or valid redirects: Church Center giving, Church Center forms, YouTube, Spotify/Anchor, Apple Podcasts, and Google Podcasts redirect to YouTube Music.

## Testing Coverage

Pages tested:
- https://bigminer.github.io/thetable2026/
- https://bigminer.github.io/thetable2026/leadership/
- https://bigminer.github.io/thetable2026/ask/
- https://bigminer.github.io/thetable2026/series/
- https://bigminer.github.io/thetable2026/series/the-good-book/
- https://bigminer.github.io/thetable2026/podcast/scripture-more-than-a-book-luke-2425-27/
- https://bigminer.github.io/thetable2026/new-here/
- https://bigminer.github.io/thetable2026/our-story/
- https://bigminer.github.io/thetable2026/our-vision/
- https://bigminer.github.io/thetable2026/plan-your-visit/
- https://bigminer.github.io/thetable2026/what-sundays-are-like/
- https://bigminer.github.io/thetable2026/contact-us/
- https://bigminer.github.io/thetable2026/meetups/
- https://bigminer.github.io/thetable2026/kids-youth/
- https://bigminer.github.io/thetable2026/service-times-locations/

Features tested:
- HTTP availability of scoped routes.
- Static asset availability.
- Header/footer internal links discovered from tested pages.
- Selected body CTA links.
- Sampled major external CTA destinations.
- GitHub Pages build command.

Not tested / limitations:
- Full browser visual and console testing could not be completed in this worker because local Playwright browsers were not installed and `npx playwright install chromium` failed with `Playwright does not support chromium on ubuntu26.04-x64`.
- Mobile visual regressions were not assessed with screenshots for the same reason.
- This was a review-only card; no fixes were implemented.

## Artifacts

- Report: /home/gary/dev/github/thetable2026/.hermes/qa/github-pages-demo-review.md
- HTTP crawl results: /home/gary/dev/github/thetable2026/.hermes/qa/github-pages-http-results.json
- HTTP crawl script: /home/gary/dev/github/thetable2026/.hermes/qa/github-pages-http-check.py
