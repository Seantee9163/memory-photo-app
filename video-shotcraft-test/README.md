# Gold jewelry Remotion test

This project creates a 15-second vertical jewelry film, but **never generates or redraws the jewelry**. The product layer must come from a real, user-supplied, high-resolution transparent PNG. React/Remotion is limited to camera motion, product transform, highlight, background, captions, transitions, and the brand end card.

## Required product material

Place the supplied product cutout at `video-shotcraft-test/public/product.png`. It must be a real product image at least 1080×1080 pixels; use a larger source when the shot zooms in. The file is intentionally not committed. If it is absent or too small, `render.sh` stops before rendering rather than substituting a code-drawn piece of jewelry.

## Reproduce on Ubuntu

Requirements: Node.js 20 or newer. Remotion downloads its compatible headless browser when necessary. From the repository root, run:

```bash
bash video-shotcraft-test/render.sh
```

The script validates the product source, installs the locked npm dependencies when needed, type-checks the source, and writes:

```text
video-shotcraft-test/output/gold-jewelry-15s.mp4
```

Generated output, browser caches, and dependencies are intentionally ignored by Git. The committed `package-lock.json` makes dependency installation repeatable in GitHub Actions.

The composition is 1080×1920 at 30 fps. Rendering uses H.264, CRF 18 high-quality encoding, and the broadly compatible `yuv420p` pixel format.
