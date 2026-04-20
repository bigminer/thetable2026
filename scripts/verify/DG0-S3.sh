#!/usr/bin/env bash
# Verify DG0-S3: source extraction notes.
# Exit 0 = valid. 1 = invalid. 2 = not ready.

set -euo pipefail

ARTIFACT="migration-data/source-extraction-notes.md"

if [ ! -f "$ARTIFACT" ]; then
  echo "not ready: $ARTIFACT does not exist yet"
  exit 2
fi

required=(
  "Homepage"
  "Standard Page"
  "Podcast Detail"
  "Series"
  "Speaker"
  "Staff"
  "Event Category"
  "Form Newsletter"
  "Author"
  "Blog"
  "Staff Group"
)

missing=()
for heading in "${required[@]}"; do
  if ! grep -qi "^## ${heading}$" "$ARTIFACT"; then
    missing+=("$heading")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "fail: missing required family sections: ${missing[*]}"
  exit 1
fi

echo "DG0-S3 ok (all representative families documented)"
