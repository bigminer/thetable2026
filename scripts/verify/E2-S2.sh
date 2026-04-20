#!/usr/bin/env bash
# Verify E2-S2: staff editing guide and template.

set -euo pipefail

TEMPLATE="obsidian/templates/staff.md"
GUIDE="EDITING_GUIDE.md"
SAMPLE="src/content/staff/lead-pastor.md"

for path in "$TEMPLATE" "$GUIDE" "$SAMPLE"; do
  if [ ! -f "$path" ]; then
    echo "not ready: $path does not exist yet"
    exit 2
  fi
done

for needle in "name:" "role:" "bio:" "photo:" "order:" "draft:"; do
  if ! grep -Fq "$needle" "$TEMPLATE"; then
    echo "fail: missing template field '$needle'"
    exit 1
  fi
done

for needle in "obsidian/templates/staff.md" "src/content/staff/<slug>.md" "npm run build" "bio" "draft: true"; do
  if ! grep -Fq "$needle" "$GUIDE"; then
    echo "fail: missing guide reference '$needle'"
    exit 1
  fi
done

npm run build

echo "E2-S2 ok (staff template and editing guide validated)"
