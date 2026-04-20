#!/usr/bin/env bash
# Verify E6-S8: Tier 1 content pages satisfy source parity evidence.

set -euo pipefail

INDEX_DIR="dist"

echo "=== build ==="
npm run build

check_contains() {
  local file="$1"
  local phrase="$2"

  if ! grep -Fq "$phrase" "$file"; then
    echo "fail: $file missing expected phrase: $phrase"
    exit 1
  fi
  echo "OK: $phrase"
}

check_not_contains() {
  local file="$1"
  local phrase="$2"

  if grep -Fq "$phrase" "$file"; then
    echo "fail: $file still contains forbidden phrase: $phrase"
    exit 1
  fi
  echo "OK absent: $phrase"
}

echo "=== page content checks ==="
check_contains "$INDEX_DIR/new-here/index.html" "Welcome to The Table"
check_contains "$INDEX_DIR/new-here/index.html" "What's Next? The Table Class"
check_contains "$INDEX_DIR/service-times-locations/index.html" "Sundays at 5pm"
check_contains "$INDEX_DIR/service-times-locations/index.html" "/series/"
check_contains "$INDEX_DIR/our-vision/index.html" "What We Value"
check_contains "$INDEX_DIR/our-vision/index.html" "Women In Leadership"
check_contains "$INDEX_DIR/our-vision/index.html" "What We Believe"
check_contains "$INDEX_DIR/our-story/index.html" "Brett and Maggie Tilford"
check_contains "$INDEX_DIR/our-story/index.html" "/media/our-story/brett-maggie-tilford.jpg"
check_contains "$INDEX_DIR/kids-youth/index.html" "The Kid's Table"
check_contains "$INDEX_DIR/kids-youth/index.html" "/meetups/"
check_contains "$INDEX_DIR/meetups/index.html" "Current Available MeetUps at The Table"
check_contains "$INDEX_DIR/meetups/index.html" "Fill out our interest form here"
check_contains "$INDEX_DIR/meetups/index.html" "Tell us your ideas here!"

echo "=== lgbt content checks ==="
check_contains "$INDEX_DIR/lgbt-affirming-church/index.html" "An LGBTQ-affirming church committed to embodying a welcoming, inclusive, and beautiful expression of Christian faith."
check_contains "$INDEX_DIR/lgbt-affirming-church/index.html" "/media/lgbt/affirming-hero.png"
check_not_contains "$INDEX_DIR/lgbt-affirming-church/index.html" "No Service Dec. 29"
check_not_contains "$INDEX_DIR/kids-youth/index.html" "thetabletx.wpengine.com/meetups/"
check_not_contains "$INDEX_DIR/lgbt-affirming-church/index.html" "thetabletx.wpengine.com/meetups/"

echo "=== scaffold audit ==="
for bad_phrase in \
  "This is the initial content collection scaffold." \
  "scaffold-content" \
  "lorem ipsum"
do
  if find "$INDEX_DIR" -name '*.html' -print0 | xargs -0 grep -Fqi "$bad_phrase" 2>/dev/null; then
    echo "fail: built output contains scaffold phrase: $bad_phrase"
    exit 1
  fi
done

echo "E6-S8 ok — Tier 1 content pages build and content audit passed"
