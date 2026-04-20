#!/usr/bin/env bash
# Verify E5-S3: giving and Church Center links remain functional.

set -euo pipefail

for path in \
  "src/pages/giving.astro" \
  "src/data/navigation.ts"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  '/giving/' \
  'https://thetabletx.churchcenter.com/giving' \
  'https://thetabletx.churchcenter.com' \
  'Giving' \
  'Open Church Center Giving'
do
  if ! grep -Fq "$needle" src/data/navigation.ts src/pages/giving.astro; then
    echo "fail: missing giving reference '$needle'"
    exit 1
  fi
done

npm run build

if ! grep -Fq 'href="/giving/"' dist/index.html; then
  echo "fail: site navigation is missing the giving link"
  exit 1
fi

if ! grep -Fq 'https://thetabletx.churchcenter.com/giving' dist/giving/index.html; then
  echo "fail: giving page does not link to Church Center giving"
  exit 1
fi

if ! grep -Fq 'https://thetabletx.churchcenter.com' dist/giving/index.html; then
  echo "fail: giving page does not link to Church Center"
  exit 1
fi

echo "E5-S3 ok (Church Center / giving links validated)"
