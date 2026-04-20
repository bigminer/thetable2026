#!/usr/bin/env bash
# Verify E6-S2: second-tier route reconciliation (podcast, series, staff).

set -euo pipefail

for path in \
  "src/content/messages" \
  "src/content/series" \
  "src/content/staff" \
  "migration-data/source-extraction-notes.md"
do
  if [ ! -e "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for path in \
  "src/pages/series/index.astro" \
  "src/pages/podcast/[slug].astro" \
  "src/pages/staff/index.astro" \
  "src/pages/staff/[slug].astro"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    echo "E6-S2 still needs second-tier podcast, series, and staff route implementation."
    exit 2
  fi
done

npm run build

for route in \
  "dist/series/index.html" \
  "dist/staff/index.html"
do
  if [ ! -f "$route" ]; then
    echo "fail: missing built second-tier route $route"
    exit 1
  fi
done

echo "E6-S2 ok (second-tier routes build)"
