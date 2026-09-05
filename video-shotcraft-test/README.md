# Video Shotcraft jewelry renderer

This Remotion project renders vertical jewelry videos and supports both the original approved 15-second test film and the real-product batch workflow.

## Automatic GitHub render

The main workflow is:

```text
Video Shotcraft - Render + iPad Download
```

It can be started manually from GitHub Actions. It also starts automatically when these product inputs change on `main`:

```text
video-shotcraft-test/batch-products.json
video-shotcraft-test/assets/**
video-shotcraft-products/**
```

The workflow installs Node.js/Remotion/ffmpeg, type-checks the renderer, renders the real product catalog, verifies the outputs, and stores the complete result as the `Sean-Video-Shotcraft-Latest` GitHub Actions artifact.

## iPad direct MP4 download

Every successful render also publishes the latest MP4 files to the stable GitHub Release tag:

```text
video-shotcraft-latest
```

Release page:

```text
https://github.com/Seantee9163/memory-photo-app/releases/tag/video-shotcraft-latest
```

Stable direct-download links:

```text
https://github.com/Seantee9163/memory-photo-app/releases/download/video-shotcraft-latest/product-001.mp4
https://github.com/Seantee9163/memory-photo-app/releases/download/video-shotcraft-latest/product-002.mp4
https://github.com/Seantee9163/memory-photo-app/releases/download/video-shotcraft-latest/product-003.mp4
```

On iPad, open the release page and tap an MP4 asset. The Actions artifact remains available as the complete batch archive; the Release assets are the direct MP4 delivery path.

## Local render

Requirements: Node.js 20 or newer. From the repository root, run:

```bash
bash video-shotcraft-test/render.sh
```

The original approved test render is written to:

```text
video-shotcraft-test/output/gold-jewelry-approved-15s.mp4
```
