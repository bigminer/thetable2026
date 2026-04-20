#!/usr/bin/env bash
# Verify E6-S7: homepage rebuild satisfies source parity evidence.

set -euo pipefail

INDEX="dist/index.html"

echo "=== build ==="
npm run build

if [[ ! -f "$INDEX" ]]; then
  echo "fail: missing build output $INDEX"
  exit 1
fi

echo "=== source phrases ==="
for phrase in \
  "Come Join Us" \
  "LGBTQ" \
  "You are a child of God"
do
  if ! grep -Fq "$phrase" "$INDEX"; then
    echo "fail: homepage missing expected phrase: $phrase"
    exit 1
  fi
  echo "OK: $phrase"
done

echo "=== scaffold audit ==="
for bad_phrase in \
  "This is the initial content collection scaffold." \
  "scaffold-content" \
  "lorem ipsum"
do
  if grep -Fqi "$bad_phrase" "$INDEX"; then
    echo "fail: homepage contains scaffold phrase: $bad_phrase"
    exit 1
  fi
done

for bad_class in \
  "panel-layout" \
  "sow-headline" \
  "siteorigin-panels-stretch"
do
  if grep -Fq "$bad_class" "$INDEX"; then
    echo "fail: homepage still contains raw SiteOrigin markup: $bad_class"
    exit 1
  fi
done

if grep -Fq 'type: raw_html' src/content/pages/home.md; then
  if ! grep -Fq 'source:' src/content/pages/home.md; then
    echo "fail: home raw_html block is missing source metadata"
    exit 1
  fi
fi

echo "E6-S7 ok — homepage build and content audit passed"
