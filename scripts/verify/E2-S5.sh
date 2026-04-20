#!/usr/bin/env bash
# Verify E2-S5: content URL validation against route classification.

set -euo pipefail

VALIDATOR="scripts/validate-content.mjs"

if [ ! -f "$VALIDATOR" ]; then
  echo "not ready: $VALIDATOR does not exist yet"
  exit 2
fi

for needle in \
  "migration-data/route-classification.json" \
  "needs-content" \
  "needs-integration" \
  "technical" \
  "route-classification" \
  "unclassified"
do
  if ! grep -Fq "$needle" "$VALIDATOR"; then
    echo "fail: missing URL validation reference '$needle' in $VALIDATOR"
    exit 1
  fi
done

npm run build

echo "E2-S5 ok (content URLs validate against route classification)"
