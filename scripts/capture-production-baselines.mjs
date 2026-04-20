#!/usr/bin/env node
/**
 * Capture production baselines from thetabletx.com for all Tier 1 pages.
 * Saves PNG files to tests/visual/production-baselines/{slug}-{device}.png.
 *
 * Run once (or when production site changes significantly):
 *   node scripts/capture-production-baselines.mjs
 *
 * These committed fixtures are the visual parity contract per E6-S6 acceptance.
 */

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = join(__dirname, '..', 'tests', 'visual', 'production-baselines');
const BASE_URL = 'https://thetabletx.com';

const TIER1_PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'new-here', path: '/new-here/' },
  { slug: 'service-times-locations', path: '/service-times-locations/' },
  { slug: 'lgbt-affirming-church', path: '/lgbt-affirming-church/' },
  { slug: 'our-vision', path: '/our-vision/' },
  { slug: 'our-story', path: '/our-story/' },
  { slug: 'kids-youth', path: '/kids-youth/' },
  { slug: 'meetups', path: '/meetups/' },
  { slug: 'giving', path: '/giving/' },
  { slug: 'contact-us', path: '/contact-us/' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

mkdirSync(BASELINE_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  for (const pg of TIER1_PAGES) {
    const url = `${BASE_URL}${pg.path}`;
    const filename = `${pg.slug}-${vp.name}.png`;
    const filepath = join(BASELINE_DIR, filename);

    process.stdout.write(`Capturing ${filename} from ${url} ... `);
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    // Let deferred images/JS settle briefly
    await page.waitForTimeout(1500);

    // Disable animations for stable screenshots
    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }`,
    });

    const screenshot = await page.screenshot({ fullPage: true });
    writeFileSync(filepath, screenshot);
    console.log('ok');
  }

  await context.close();
}

await browser.close();
console.log(`\nBaselines saved to ${BASELINE_DIR}`);
