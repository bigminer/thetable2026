#!/usr/bin/env bash
# Verify E6-S5: Tier 1 source-vs-target page evidence files exist and carry required headings.

set -euo pipefail

EVIDENCE_DIR="migration-data/page-evidence"
REQUIRED_FILES=(
  home.md
  new-here.md
  service-times-locations.md
  lgbt-affirming-church.md
  our-vision.md
  our-story.md
  kids-youth.md
  meetups.md
  giving.md
  contact-us.md
)

REQUIRED_HEADINGS=(
  "## Source"
  "## Target"
  "## Purpose"
  "## Sections"
  "## CTAs"
  "## Media"
  "## Integration"
  "## Known Debt"
  "## Block Recommendations"
)

PASS=0
FAIL=0

check_file() {
  local file="$EVIDENCE_DIR/$1"
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    FAIL=$((FAIL + 1))
    return
  fi
  local missing_headings=()
  for heading in "${REQUIRED_HEADINGS[@]}"; do
    if ! grep -qF "$heading" "$file"; then
      missing_headings+=("$heading")
    fi
  done
  if [[ ${#missing_headings[@]} -eq 0 ]]; then
    echo "OK: $file"
    PASS=$((PASS + 1))
  else
    echo "INCOMPLETE: $file — missing headings: ${missing_headings[*]}"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== E6-S5: page evidence check ==="
for f in "${REQUIRED_FILES[@]}"; do
  check_file "$f"
done

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
exit 0
