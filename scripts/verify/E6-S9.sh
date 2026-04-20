#!/usr/bin/env bash
# Verify E6-S9: Integration pages reconcile with source intent.

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

echo "=== giving page checks ==="
check_contains "$INDEX_DIR/giving/index.html" "https://thetabletx.churchcenter.com/giving?open-in-church-center-modal=true"

echo "=== contact-us page checks ==="
check_contains "$INDEX_DIR/contact-us/index.html" "How can we help? If you have a question"
check_not_contains "$INDEX_DIR/contact-us/index.html" "eyebrow\">Mode"
check_not_contains "$INDEX_DIR/contact-us/index.html" "eyebrow\">Completion"

echo "=== get-involved page checks ==="
check_contains "$INDEX_DIR/get-involved/index.html" "Ready to find your place at The Table?"
check_not_contains "$INDEX_DIR/get-involved/index.html" "eyebrow\">Mode"

echo "=== newsletter page checks ==="
check_contains "$INDEX_DIR/sign-up-for-our-newsletter/index.html" "Stay up to date with the latest news"
check_not_contains "$INDEX_DIR/sign-up-for-our-newsletter/index.html" "eyebrow\">Mode"

echo "=== lgbt reconciliation checks ==="
check_contains "$INDEX_DIR/lgbt-affirming-church/index.html" "/contact-us/"
check_not_contains "$INDEX_DIR/lgbt-affirming-church/index.html" "frm_forms"

echo "E6-S9 ok — integration pages reconciled and debug panels removed"
