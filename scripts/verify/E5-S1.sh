#!/usr/bin/env bash
# Verify E5-S1: local Planning Center events adapter and event surfaces.

set -euo pipefail

for path in \
  src/lib/planning-center/events.ts \
  src/data/planning-center/events.fixture.json \
  src/pages/events/index.astro \
  "src/pages/events/category/[slug].astro"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "events.fixture.json" \
  "Planning Center" \
  "last-known-good" \
  "scheduled rebuild" \
  "category"
do
  if ! grep -Fq "$needle" src/lib/planning-center/events.ts src/pages/events/index.astro "src/pages/events/category/[slug].astro" migration-data/*.md; then
    echo "fail: missing events integration reference '$needle'"
    exit 1
  fi
done

npm run build

if [ ! -f dist/events/index.html ]; then
  echo "fail: /events/ route was not emitted"
  exit 1
fi

echo "E5-S1 ok (events adapter and local event surfaces verified)"
