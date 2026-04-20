#!/usr/bin/env bash
# Verify E6-S3: final hosted launch checklist + rollback drill.

set -euo pipefail

DOC="migration-data/launch-checklist.md"
HOSTED_LOG="migration-data/hosted-launch-log.md"

for path in \
  "$DOC" \
  "astro.config.mjs" \
  "src/pages/index.astro" \
  "src/pages/giving.astro" \
  "src/pages/robots.txt.ts" \
  "src/pages/sitemap.xml.ts"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

if [ ! -f "$HOSTED_LOG" ]; then
  echo "not ready: $HOSTED_LOG does not exist yet"
  echo "E6-S3 is final hosted-launch work. Do not create this log until the approved launch window."
  exit 2
fi

for needle in \
  "approved launch window" \
  "Cloudflare Pages production" \
  "DNS switch" \
  "CDN purge" \
  "key routes verified" \
  "rollback path verified"
do
  if ! grep -Fq "$needle" "$HOSTED_LOG"; then
    echo "fail: missing hosted launch log reference '$needle'"
    exit 1
  fi
done

for needle in \
  "Cutover" \
  "Rollback" \
  "Staging Rehearsal" \
  "Cloudflare Pages" \
  "thetabletx.com" \
  "thetabletx.org" \
  "DNS switch" \
  "CDN purge" \
  "key routes" \
  "local preview rehearsal"
do
  if ! grep -Fq "$needle" "$DOC"; then
    echo "fail: missing checklist reference '$needle'"
    exit 1
  fi
done

npm run build

PREVIEW_LOG="$(mktemp)"
cleanup() {
  if [ -n "${PREVIEW_PID:-}" ] && kill -0 "$PREVIEW_PID" >/dev/null 2>&1; then
    kill "$PREVIEW_PID" >/dev/null 2>&1 || true
    wait "$PREVIEW_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$PREVIEW_LOG"
}
trap cleanup EXIT

npm run preview -- --host 127.0.0.1 --port 4321 --strictPort >"$PREVIEW_LOG" 2>&1 &
PREVIEW_PID=$!

wait_for_url() {
  local url="$1"
  for _ in $(seq 1 60); do
    if curl --fail --silent --show-error "$url" >/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "fail: timed out waiting for $url"
  return 1
}

wait_for_url http://127.0.0.1:4321/

for route in / /giving/ /robots.txt /sitemap.xml /debug/planning-center/; do
  wait_for_url "http://127.0.0.1:4321$route"
done

if ! grep -Fq '<link rel="canonical" href="https://thetabletx.com/">' dist/index.html; then
  echo "fail: canonical link missing from home page"
  exit 1
fi

if ! grep -Fq 'Disallow: /debug/' dist/robots.txt; then
  echo "fail: robots.txt is missing the debug route guard"
  exit 1
fi

echo "E6-S3 ok (final hosted launch log and local build verified)"
