#!/usr/bin/env bash
# Verify DG0-S4: Planning Center sample routes render in the Astro build.
# Exit 0 = valid. 1 = invalid. 2 = not ready.

set -euo pipefail

EVENTS_HTML="dist/debug/planning-center/events/index.html"
FORMS_HTML="dist/debug/planning-center/forms/index.html"

TMP_LOG=$(mktemp)
trap 'rm -f "$TMP_LOG"' EXIT

if ! npm run build >"$TMP_LOG" 2>&1; then
  cat "$TMP_LOG"
  exit 1
fi

if [ ! -f "$EVENTS_HTML" ] || [ ! -f "$FORMS_HTML" ]; then
  echo "fail: build completed but Planning Center sample pages were not emitted"
  exit 1
fi

if ! grep -qi "Planning Center events sample" "$EVENTS_HTML"; then
  echo "fail: events sample title not found in $EVENTS_HTML"
  exit 1
fi

if ! grep -qi "Planning Center forms sample" "$FORMS_HTML"; then
  echo "fail: forms sample title not found in $FORMS_HTML"
  exit 1
fi

echo "DG0-S4 ok (Planning Center sample routes rendered)"
