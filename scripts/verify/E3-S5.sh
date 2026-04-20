#!/usr/bin/env bash
# Verify E3-S5: data-driven navigation and local link validation.

set -euo pipefail

NAV="src/data/navigation.ts"

if [ ! -f "$NAV" ]; then
  echo "not ready: $NAV does not exist yet"
  exit 2
fi

for needle in \
  "mainNavigation" \
  "footerNavigation" \
  "external" \
  "route-classification"
do
  if ! grep -Fq "$needle" "$NAV" scripts/validate-content.mjs; then
    echo "fail: missing navigation validation reference '$needle'"
    exit 1
  fi
done

if grep -Fq "/author/" "$NAV" || grep -Fq "mailpoet_page" "$NAV"; then
  echo "fail: technical routes must not appear in navigation"
  exit 1
fi

for route in \
  "/new-here/" \
  "/service-times-locations/" \
  "/our-vision/" \
  "/our-story/" \
  "/kids-youth/" \
  "/meetups/" \
  "/giving/" \
  "/contact-us/"
do
  if ! grep -Fq "$route" "$NAV"; then
    echo "fail: expected main navigation route missing: $route"
    exit 1
  fi
done

npm run build

for label in \
  "New Here" \
  "Service" \
  "Vision" \
  "Story" \
  "Kids &amp; Youth" \
  "MeetUps" \
  "Giving" \
  "Contact"
do
  if ! grep -Fq "$label" dist/index.html; then
    echo "fail: built homepage is missing visible navigation label: $label"
    exit 1
  fi
done

echo "E3-S5 ok (navigation is data-driven and locally validated)"
