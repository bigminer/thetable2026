#!/usr/bin/env bash
# Verify E3-S3: local URL/redirect parity check is wired into CI.

set -euo pipefail

CHECKER="scripts/check-route-parity.mjs"
CI=".github/workflows/ci.yml"

for path in "$CHECKER" "$CI" "migration-data/redirect-matrix.yaml"; do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "npm run test:routes" \
  "check-route-parity" \
  "astro preview" \
  "redirect-matrix.yaml"
do
  if ! grep -Fq "$needle" package.json "$CI" "$CHECKER"; then
    echo "fail: missing route parity reference '$needle'"
    exit 1
  fi
done

npm run test:routes

echo "E3-S3 ok (local route parity check is wired into CI)"
