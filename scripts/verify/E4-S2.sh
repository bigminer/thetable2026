#!/usr/bin/env bash
# Verify E4-S2: core templates render consistently across viewport-aware layouts.

set -euo pipefail

for path in \
  "src/pages/index.astro" \
  "src/pages/debug/planning-center/index.astro" \
  "src/pages/debug/templates/detail.astro" \
  "src/layouts/BaseLayout.astro"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "class=\"page page--content\"" \
  "ContentBlocks" \
  "content-block--hero" \
  "class=\"panel stack\"" \
  "class=\"grid grid--2\"" \
  "Standard page template" \
  "Planning Center samples"
do
  if ! grep -Fq "$needle" src/pages/index.astro src/components/ContentBlocks.astro src/pages/debug/planning-center/index.astro src/pages/debug/templates/detail.astro src/layouts/BaseLayout.astro; then
    echo "fail: missing core-template reference '$needle'"
    exit 1
  fi
done

npm run build

for path in \
  dist/index.html \
  dist/debug/planning-center/index.html \
  dist/debug/templates/detail/index.html
do
  if [ ! -f "$path" ]; then
    echo "fail: missing built template page $path"
    exit 1
  fi
done

if ! grep -Fq 'class="grid grid--2"' dist/debug/templates/detail/index.html; then
  echo "fail: standard page template is missing the two-column layout"
  exit 1
fi

if ! grep -Fq 'content-block--hero' dist/index.html; then
  echo "fail: homepage is missing the hero template"
  exit 1
fi

if ! grep -Fq 'class="page stack"' dist/debug/planning-center/index.html; then
  echo "fail: planning-center index is missing shared page primitives"
  exit 1
fi

echo "E4-S2 ok (core templates render consistently)"
