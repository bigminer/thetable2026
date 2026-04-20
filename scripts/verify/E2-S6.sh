#!/usr/bin/env bash
# Verify E2-S6: Obsidian templates match approved schema.

set -euo pipefail

for path in \
  obsidian/templates/page.md \
  obsidian/templates/message.md \
  obsidian/templates/staff.md \
  obsidian/templates/event.md \
  EDITING_GUIDE.md
do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in \
  "pages" \
  "messages" \
  "staff" \
  "events" \
  "frontmatter" \
  "Do not use raw_html"
do
  if ! grep -Fq "$needle" obsidian/templates/*.md EDITING_GUIDE.md; then
    echo "fail: missing editor/template reference '$needle'"
    exit 1
  fi
done

npm run build

echo "E2-S6 ok (Obsidian templates match approved schema)"
