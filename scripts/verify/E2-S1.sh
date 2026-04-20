#!/usr/bin/env bash
# Verify E2-S1: approved content collection schemas.

set -euo pipefail

CONFIG="src/content.config.ts"

if [ ! -f "$CONFIG" ]; then
  echo "not ready: $CONFIG does not exist yet"
  exit 2
fi

for needle in \
  "pages" \
  "messages" \
  "series" \
  "speakers" \
  "staff" \
  "staff-groups" \
  "events" \
  "event-categories" \
  "markdown" \
  "hero" \
  "feature_grid" \
  "card_grid" \
  "columns" \
  "image_grid" \
  "video_embed" \
  "form_embed" \
  "map_embed" \
  "quote" \
  "staff_spotlight" \
  "series_feature" \
  "event_feature" \
  "social_links" \
  "raw_html" \
  "canonical" \
  "ogImage" \
  "twitterCard" \
  "jsonLd" \
  "reference("
do
  if ! grep -Fq "$needle" "$CONFIG"; then
    echo "fail: missing schema reference '$needle' in $CONFIG"
    exit 1
  fi
done

npm run build

echo "E2-S1 ok (approved content schema implemented)"
