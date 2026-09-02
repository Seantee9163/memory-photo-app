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
test -s output/Sean-Gold-Jewelry-V2.mp4

mkdir -p output/keyframes
for spec in "0.5s:15" "3s:90" "6.5s:195" "10s:300" "14s:420"; do
  label="${spec%%:*}"
  frame="${spec##*:}"
  npx remotion still src/index.ts GoldJewelry15s "output/keyframes/${label}.png" --frame="$frame"
done

echo "Rendered $SCRIPT_DIR/output/Sean-Gold-Jewelry-V2.mp4 and five keyframes"
