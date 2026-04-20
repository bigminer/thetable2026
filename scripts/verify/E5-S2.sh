#!/usr/bin/env bash
# Verify E5-S2: local form integration routes.

set -euo pipefail

for path in \
  src/data/forms.ts \
  src/pages/contact-us.astro \
  src/pages/get-involved.astro \
  src/pages/sign-up-for-our-newsletter.astro
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "Planning Center" \
  "Church Center" \
  "Apps Script" \
  "link-first" \
  "completion"
do
  if ! grep -Fq "$needle" src/data/forms.ts src/pages/contact-us.astro src/pages/get-involved.astro src/pages/sign-up-for-our-newsletter.astro; then
    echo "fail: missing form integration reference '$needle'"
    exit 1
  fi
done

npm run build

for route in contact-us get-involved sign-up-for-our-newsletter; do
  if [ ! -f "dist/$route/index.html" ]; then
    echo "fail: /$route/ route was not emitted"
    exit 1
  fi
done

echo "E5-S2 ok (local form integration routes verified)"
