#!/usr/bin/env bash
# Verify E1-S1: Astro production build succeeds.
set -euo pipefail
npm run build
echo "E1-S1 ok (Astro build passed)"
