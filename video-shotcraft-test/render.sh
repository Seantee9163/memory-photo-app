#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 or newer is required." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 20 )); then
  echo "Node.js 20 or newer is required (found $(node --version))." >&2
  exit 1
fi

if [[ ! -x node_modules/.bin/remotion ]]; then
  npm ci --no-audit --no-fund
fi

mkdir -p output
npm run typecheck
npm run render
test -s output/gold-jewelry-ad-v4-15s.mp4
echo "Rendered $SCRIPT_DIR/output/gold-jewelry-ad-v4-15s.mp4"
