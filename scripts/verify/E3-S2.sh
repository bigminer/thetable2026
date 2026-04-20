#!/usr/bin/env bash
# Verify E3-S2: canonical metadata, sitemap, and robots output.

set -euo pipefail

for path in \
  "astro.config.mjs" \
  "src/layouts/BaseLayout.astro" \
  "src/pages/robots.txt.ts" \
  "src/pages/sitemap.xml.ts"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "site: 'https://thetabletx.com'" \
  "trailingSlash: 'always'" \
  "rel=\"canonical\"" \
  "meta name=\"robots\"" \
  "og:url" \
  "twitter:card" \
  "Disallow: /debug/" \
  "Sitemap: https://thetabletx.com/sitemap.xml" \
  "https://thetabletx.com/"
do
  if ! grep -Fq "$needle" astro.config.mjs src/layouts/BaseLayout.astro src/pages/robots.txt.ts src/pages/sitemap.xml.ts; then
    echo "fail: missing SEO reference '$needle'"
    exit 1
  fi
done

npm run build

if ! grep -Fq '<link rel="canonical" href="https://thetabletx.com/">' dist/index.html; then
  echo "fail: canonical link missing from dist/index.html"
  exit 1
fi

if ! grep -Fq '<meta name="robots" content="index,follow">' dist/index.html; then
  echo "fail: robots meta missing from dist/index.html"
  exit 1
fi

if ! grep -Fq 'https://thetabletx.com/' dist/sitemap.xml; then
  echo "fail: sitemap does not include the canonical home URL"
  exit 1
fi

if ! grep -Fq 'Disallow: /debug/' dist/robots.txt; then
  echo "fail: robots.txt does not disallow debug routes"
  exit 1
fi

echo "E3-S2 ok (canonical metadata, sitemap, and robots validated)"
