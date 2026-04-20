#!/usr/bin/env bash
# Verify E1-S3: baseline CI workflow and validation gates.

set -euo pipefail

WORKFLOW=".github/workflows/ci.yml"

if [ ! -f "$WORKFLOW" ]; then
  echo "not ready: $WORKFLOW does not exist yet"
  exit 2
fi

for needle in \
  "actions/checkout@v4" \
  "actions/setup-node@v4" \
  "npm run plan:lint" \
  "npm run build"
do
  if ! grep -q "$needle" "$WORKFLOW"; then
    echo "fail: missing workflow reference '$needle'"
    exit 1
  fi
done

npm run plan:lint
npm run build

echo "E1-S3 ok (baseline CI workflow and gates validated)"
