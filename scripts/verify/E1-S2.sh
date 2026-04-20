#!/usr/bin/env bash
# Verify E1-S2: manual Cloudflare Pages workflow with no auto-production deploy.

set -euo pipefail

WORKFLOW=".github/workflows/pages-deploy.yml"

if [ ! -f "$WORKFLOW" ]; then
  echo "not ready: $WORKFLOW does not exist yet"
  exit 2
fi

for needle in \
  "cloudflare/wrangler-action@v3" \
  "workflow_dispatch" \
  "target:" \
  "preview" \
  "production" \
  "apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}" \
  "accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}" \
  "command: pages deploy dist --project-name=tablefresh --branch=main" \
  "command: pages deploy dist --project-name=tablefresh --branch=\${{ github.ref_name }}" \
  "if: github.event.inputs.target == 'production' && github.ref == 'refs/heads/main'" \
  "if: github.event.inputs.target == 'preview'" \
  "environment: production"
do
  if ! grep -Fq "$needle" "$WORKFLOW"; then
    echo "fail: missing workflow reference '$needle'"
    exit 1
  fi
done

if grep -Eq '^[[:space:]]+push:' "$WORKFLOW"; then
  echo "fail: Cloudflare Pages deploy workflow must not run on push"
  exit 1
fi

npm run build

echo "E1-S2 ok (Cloudflare Pages deploy workflow is manual-only)"
