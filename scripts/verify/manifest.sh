#!/usr/bin/env bash
# Verify the WordPress manifest snapshot checksum matches plan.yaml's
# manifest_contract.snapshot_checksum.
# Exit 0 = in contract. Exit 1 = drift (downstream artifacts are stale).

set -euo pipefail

PLAN="plan.yaml"

if ! command -v yq >/dev/null 2>&1; then
  echo "yq is required (brew install yq)"
  exit 1
fi

EXPECTED_RAW=$(yq '.manifest_contract.snapshot_checksum' "$PLAN")
EXPECTED=${EXPECTED_RAW#sha1:}
MPATH=$(yq '.manifest_contract.path' "$PLAN")

if [ ! -d "$MPATH" ]; then
  echo "manifest path missing: $MPATH"
  exit 1
fi

ACTUAL=$(cd "$MPATH" && find . -type f -exec shasum {} \; | sort | shasum | cut -d' ' -f1)

if [ "$EXPECTED" != "$ACTUAL" ]; then
  cat <<EOF
manifest checksum drift detected
  expected: sha1:$EXPECTED
  actual:   sha1:$ACTUAL

Next steps:
  1. Decide whether the new manifest is intended (was \`extract_site_manifest.sh\` re-run?).
  2. If yes: update plan.yaml manifest_contract, re-fire DG0-S2, flag downstream artifacts stale in JOURNAL.md.
  3. If no: investigate unexpected change before continuing.
EOF
  exit 1
fi

echo "manifest contract ok (sha1:$EXPECTED)"
