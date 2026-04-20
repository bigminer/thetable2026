#!/usr/bin/env bash
# Verify DG0-S6: content model proposal document.
# Exit 0 = valid. 1 = invalid structure. 2 = not ready.

set -euo pipefail

ARTIFACT="migration-data/content-model-proposal.md"

if [ ! -f "$ARTIFACT" ]; then
  echo "not ready: $ARTIFACT does not exist yet"
  exit 2
fi

REQUIRED_SECTIONS=(
  "Collections"
  "Block union"
  "References"
  "Cardinality"
  "URL validation"
  "SEO"
  "Media"
)

missing=()
for section in "${REQUIRED_SECTIONS[@]}"; do
  if ! grep -qi "$section" "$ARTIFACT"; then
    missing+=("$section")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "fail: missing required sections: ${missing[*]}"
  exit 1
fi

echo "DG0-S6 ok (all required sections present)"
