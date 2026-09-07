#!/usr/bin/env bash
set -euo pipefail

if ! command -v tailscale >/dev/null 2>&1; then
  echo "tailscale CLI not found. Install/start Tailscale before using npm run dev:tailscale." >&2
  exit 1
fi

TAILSCALE_IP="${TAILSCALE_IP:-$(tailscale ip -4 2>/dev/null | head -n 1)}"
PORT="${PORT:-4321}"

if [[ -z "${TAILSCALE_IP}" ]]; then
  echo "No Tailscale IPv4 address found. Is Tailscale running and logged in?" >&2
  exit 1
fi

echo "Starting Astro dev server on Tailscale: http://${TAILSCALE_IP}:${PORT}/"
exec astro dev --host "${TAILSCALE_IP}" --port "${PORT}"
