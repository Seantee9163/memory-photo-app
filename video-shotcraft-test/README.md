# Gold jewelry Remotion test

This directory contains every text source needed to reproduce the 15-second test video. The jewelry, lighting, background, and typography are generated with React, CSS, and inline SVG; the render does **not** depend on `product-full.jpg`, `product-macro.jpg`, Base64 data, or files from a temporary Codex workspace.

## Reproduce on Ubuntu

Requirements: Node.js 20 or newer. Remotion downloads its compatible headless browser when necessary. From the repository root, run:

```bash
bash video-shotcraft-test/render.sh
```

The script installs the locked npm dependencies when needed, type-checks the source, and writes:

```text
video-shotcraft-test/output/gold-jewelry-15s.mp4
```

Generated output, browser caches, and dependencies are intentionally ignored by Git. The committed `package-lock.json` makes dependency installation repeatable in GitHub Actions.
