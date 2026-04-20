#!/usr/bin/env bash
# Verify E2-S3: Obsidian Git auto-sync path and schema feedback.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GUIDE="$ROOT/EDITING_GUIDE.md"
TEMPLATE="$ROOT/obsidian/templates/staff.md"
SAMPLE="$ROOT/src/content/staff/lead-pastor.md"

for path in "$GUIDE" "$TEMPLATE" "$SAMPLE" "$ROOT/scripts/validate-content.mjs"; do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "git add src/content/staff/<slug>.md" \
  "git commit -m \"Update staff profile\"" \
  "git push" \
  "Cloudflare Pages" \
  "npm run build" \
  "validator output" \
  "validator"
do
  if ! grep -Fq "$needle" "$GUIDE"; then
    echo "fail: missing guide reference '$needle'"
    exit 1
  fi
done

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

mkdir -p "$tmpdir/repo"
rsync -a --exclude node_modules --exclude dist --exclude .astro --exclude .git "$ROOT"/ "$tmpdir/repo/"
ln -s "$ROOT/node_modules" "$tmpdir/repo/node_modules"

perl -0pi -e 's/^role:.*\n//m' "$tmpdir/repo/src/content/staff/lead-pastor.md"

set +e
output="$(cd "$tmpdir/repo" && npm run build 2>&1)"
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "fail: malformed frontmatter build unexpectedly passed"
  exit 1
fi

if ! grep -Eq 'missing required field "role"|invalid field "role"|staff/lead-pastor.md' <<<"$output"; then
  echo "fail: malformed frontmatter did not surface a clear staff error"
  echo "$output"
  exit 1
fi

echo "E2-S3 ok (sync path and schema feedback validated)"
