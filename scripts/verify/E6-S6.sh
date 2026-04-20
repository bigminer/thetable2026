#!/usr/bin/env bash
# Verify E6-S6: production baselines, tier1 spec, hardened verifiers, and media audit.

set -euo pipefail

FAIL=0
fail() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

BASELINE_DIR="tests/visual/production-baselines"
TIER1_SLUGS=(home new-here service-times-locations lgbt-affirming-church our-vision our-story kids-youth meetups giving contact-us)

# ── 1. Production baselines exist for all Tier 1 pages at both viewports ─────
echo "=== checking production baselines ==="
for slug in "${TIER1_SLUGS[@]}"; do
  for device in desktop mobile; do
    f="$BASELINE_DIR/${slug}-${device}.png"
    if [[ ! -f "$f" ]]; then
      fail "missing baseline: $f"
    else
      echo "OK: $f"
    fi
  done
done

# ── 2. tier1.spec.ts exists ───────────────────────────────────────────────────
if [[ ! -f "tests/visual/tier1.spec.ts" ]]; then
  fail "missing: tests/visual/tier1.spec.ts"
else
  echo "OK: tests/visual/tier1.spec.ts"
fi

# ── 3. E6-S5 verifier passes ─────────────────────────────────────────────────
echo "=== E6-S5 evidence check ==="
bash scripts/verify/E6-S5.sh || fail "E6-S5 verifier failed"

# ── 4. E6-S1 verifier is hardened (scaffold phrase must not be REQUIRED) ─────
# The old bad pattern required the scaffold phrase to be present in the build output.
# The new hardened verifier bans it instead. Check that the old positive assertion is gone.
if grep -q "grep -Fq 'This is the initial content collection scaffold" scripts/verify/E6-S1.sh; then
  fail "E6-S1 verifier still positively requires scaffold phrase in dist output"
else
  echo "OK: E6-S1 verifier does not require scaffold phrase"
fi

# ── 5. media audit: every file in public/media/ must be referenced ────────────
echo "=== media audit ==="
MEDIA_AUDIT_FAIL=0
while IFS= read -r -d '' asset; do
  basename_only=$(basename "$asset")
  if ! grep -qrF "$basename_only" src/ 2>/dev/null; then
    fail "unreferenced media asset: $asset (not found in src/)"
    MEDIA_AUDIT_FAIL=$((MEDIA_AUDIT_FAIL + 1))
  else
    echo "OK: $asset is referenced"
  fi
done < <(find public/media -type f -print0 2>/dev/null)

if [[ $MEDIA_AUDIT_FAIL -eq 0 ]] && [[ -d public/media ]]; then
  echo "media audit: all assets in public/media/ are referenced"
fi

# ── 6. asset copy manifest: every migrated asset has source and destination ──
echo "=== asset copy manifest ==="
if [[ ! -f migration-data/asset-copy-manifest.json ]]; then
  fail "missing asset copy manifest: migration-data/asset-copy-manifest.json"
else
  npm run media:check || fail "referenced media extraction check failed"
  node <<'NODE' || fail "asset copy manifest check failed"
import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('migration-data/asset-copy-manifest.json', 'utf8'));
if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) {
  throw new Error('asset copy manifest has no assets');
}

for (const asset of manifest.assets) {
  for (const field of ['id', 'sourceUrl', 'sourceReferencePath', 'destinationPath', 'publicPath']) {
    if (!asset[field]) {
      throw new Error(`asset is missing ${field}: ${JSON.stringify(asset)}`);
    }
  }
  if (!fs.existsSync(asset.sourceReferencePath)) {
    throw new Error(`missing sourceReferencePath for ${asset.id}: ${asset.sourceReferencePath}`);
  }
  if (!fs.existsSync(asset.destinationPath)) {
    throw new Error(`missing destinationPath for ${asset.id}: ${asset.destinationPath}`);
  }
  const publicReference = asset.publicPath.startsWith('/') ? asset.publicPath : `/${asset.publicPath}`;
  const content = [
    ...fs.readdirSync('src/content/pages').map((name) => `src/content/pages/${name}`),
    ...fs.readdirSync('src/content/series').map((name) => `src/content/series/${name}`),
    ...fs.readdirSync('src/content/staff').map((name) => `src/content/staff/${name}`),
    ...fs.readdirSync('src/content/speakers').map((name) => `src/content/speakers/${name}`),
  ];
  const referenced = content.some((path) => fs.readFileSync(path, 'utf8').includes(publicReference));
  if (!referenced) {
    throw new Error(`publicPath is not referenced by content for ${asset.id}: ${publicReference}`);
  }
}

console.log(`asset copy manifest ok (${manifest.assets.length} assets)`);
NODE
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
if [[ $FAIL -gt 0 ]]; then
  echo "E6-S6 FAILED ($FAIL check(s) failed)"
  exit 1
fi
echo "E6-S6 ok — baselines, tier1 spec, verifiers, and media audit all passed"
