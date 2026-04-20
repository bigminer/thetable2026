#!/usr/bin/env bash
# Verify E4-S3: Playwright visual baselines are configured and stable.

set -euo pipefail

for path in \
  "playwright.config.ts" \
  "tests/visual/templates.spec.ts" \
  "src/pages/debug/templates/series.astro" \
  "src/pages/debug/templates/staff.astro" \
  "src/pages/debug/templates/podcast.astro"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "animations: 'disabled'" \
  "reducedMotion: 'reduce'" \
  "viewport: { width: 1440, height: 1024 }" \
  "viewport: { width: 390, height: 844 }" \
  "toHaveScreenshot" \
  "series-template" \
  "staff-template" \
  "podcast-template"
do
  if ! grep -Fq "$needle" playwright.config.ts tests/visual/templates.spec.ts src/pages/debug/templates/series.astro src/pages/debug/templates/staff.astro src/pages/debug/templates/podcast.astro; then
    echo "fail: missing visual-baseline reference '$needle'"
    exit 1
  fi
done

npm run test:visual

echo "E4-S3 ok (Playwright visual baseline harness configured)"
