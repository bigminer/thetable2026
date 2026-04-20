#!/usr/bin/env bash
# Verify DG0-S2: route classification artifact.
# Exit 0 = valid. 1 = invalid. 2 = not ready.

set -euo pipefail

ARTIFACT="migration-data/route-classification.json"

if [ ! -f "$ARTIFACT" ]; then
  echo "not ready: $ARTIFACT does not exist yet"
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required (brew install jq)"
  exit 1
fi

EXPECTED_URL_COUNT=243
VALID_CLASSES='["keep","redirect","technical","needs-content","needs-integration"]'

LENGTH=$(jq 'length' "$ARTIFACT")
if [ "$LENGTH" -ne "$EXPECTED_URL_COUNT" ]; then
  echo "fail: expected $EXPECTED_URL_COUNT entries, got $LENGTH"
  exit 1
fi

MISSING_CLASS=$(jq --argjson valid "$VALID_CLASSES" \
  '[.[] | select((.classification // "") as $c | ($valid | index($c)) == null)] | length' \
  "$ARTIFACT")
if [ "$MISSING_CLASS" -ne 0 ]; then
  echo "fail: $MISSING_CLASS entries have missing or invalid classification"
  exit 1
fi

REDIRECT_NO_TARGET=$(jq \
  '[.[] | select(.classification == "redirect" and ((.target // "") == ""))] | length' \
  "$ARTIFACT")
if [ "$REDIRECT_NO_TARGET" -ne 0 ]; then
  echo "fail: $REDIRECT_NO_TARGET redirect entries lack a target URL"
  exit 1
fi

echo "DG0-S2 ok ($LENGTH URLs classified)"
