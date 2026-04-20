#!/usr/bin/env bash
# Verify E2-S4: sample content converted to approved schema.

set -euo pipefail

for dir in \
  src/content/pages \
  src/content/messages \
  src/content/series \
  src/content/speakers \
  src/content/staff \
  src/content/staff-groups \
  src/content/events \
  src/content/event-categories
do
  if [ ! -d "$dir" ]; then
    echo "not ready: $dir does not exist yet"
    exit 2
  fi
  if ! find "$dir" -maxdepth 1 -name '*.md' -print -quit | grep -q .; then
    echo "fail: $dir has no markdown entries"
    exit 1
  fi
done

if [ -d src/content/podcast ] || [ -d src/content/site-pages ]; then
  echo "fail: provisional collection directories still exist"
  exit 1
fi

npm run build

echo "E2-S4 ok (sample content uses approved schema collections)"
