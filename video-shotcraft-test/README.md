# Approved gold jewelry film

This Remotion project creates a 15-second, 1080 × 1920, 30 FPS jewelry film from the single approved product photograph. The shot design only pans, scales, fades, shades, and adds a restrained light sweep over that photograph; it does not redraw or regenerate the jewelry.

To keep the attached PNG out of the pull-request binary diff, its **exact bytes** are committed as review-safe Base64 text at `assets/gold-jewelry-approved.png.base64`. The `prerender` script restores those bytes to `public/gold-jewelry-approved.png` before every render. This is lossless packaging—not image generation or modification.

## Render on Ubuntu

Requirements: Node.js 20 or newer. Remotion downloads its compatible headless browser when necessary. From the repository root, run:

```bash
bash video-shotcraft-test/render.sh
```

The script installs the locked npm dependencies when needed, type-checks the source, restores the approved PNG, and writes the H.264 deliverable to:

```text
video-shotcraft-test/output/gold-jewelry-approved-15s.mp4
```

Generated output, browser caches, and dependencies are intentionally ignored by Git. Both manual GitHub Actions workflows render and upload the deliverable as the `Sean-Gold-Jewelry-Approved-01` artifact.
