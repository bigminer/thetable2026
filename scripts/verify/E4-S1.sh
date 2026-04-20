#!/usr/bin/env bash
# Verify E4-S1: shared layout primitives used by home and one standard page.

set -euo pipefail

for path in \
  "src/layouts/BaseLayout.astro" \
  "src/pages/index.astro" \
  "src/pages/debug/planning-center/index.astro"
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  ".page" \
  ".content-block" \
  ".content-block__inner" \
  ".button" \
  "content-block--hero" \
  "Planning Center samples" \
  "Planning Center samples"
do
  if ! grep -Fq "$needle" src/layouts/BaseLayout.astro src/pages/index.astro src/components/ContentBlocks.astro src/pages/debug/planning-center/index.astro; then
    echo "fail: missing shared-primitive reference '$needle'"
    exit 1
  fi
done

npm run build

if ! grep -Fq 'class="page page--content"' dist/index.html; then
  echo "fail: homepage is missing shared page primitives"
  exit 1
fi

if ! grep -Fq 'content-block--hero' dist/index.html; then
  echo "fail: homepage is missing hero primitives"
  exit 1
fi

if ! grep -Fq 'class="page stack"' dist/debug/planning-center/index.html; then
  echo "fail: planning-center index is missing shared page primitives"
  exit 1
fi

if ! grep -Fq 'class="button button--secondary"' dist/debug/planning-center/index.html; then
  echo "fail: planning-center index is missing CTA primitives"
  exit 1
fi

echo "E4-S1 ok (shared layout primitives applied)"
