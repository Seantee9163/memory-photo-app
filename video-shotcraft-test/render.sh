#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PRODUCT_ASSET="public/product.png"
if [[ ! -f "$PRODUCT_ASSET" ]]; then
  echo "Refusing to render: provide a real, high-resolution jewelry asset at $SCRIPT_DIR/$PRODUCT_ASSET." >&2
  echo "SVG, CSS, React, canvas, and other procedural jewelry substitutes are not accepted." >&2
  exit 2
fi

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe is required to verify product image resolution." >&2
  exit 1
fi

DIMENSIONS="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$PRODUCT_ASSET")"
WIDTH="${DIMENSIONS%x*}"
HEIGHT="${DIMENSIONS#*x}"
if [[ ! "$WIDTH" =~ ^[0-9]+$ || ! "$HEIGHT" =~ ^[0-9]+$ ]] || (( WIDTH < 1080 || HEIGHT < 1080 )); then
  echo "Refusing to render: product.png must be at least 1080x1080 (found ${DIMENSIONS:-unknown})." >&2
  exit 2
fi

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
test -s output/gold-jewelry-15s.mp4
echo "Rendered $SCRIPT_DIR/output/gold-jewelry-15s.mp4"
