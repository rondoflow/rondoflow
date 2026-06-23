---
name: generate-edit-images-model-fallback
description: "Nano Banana Pro with auto model fallback — generate/edit images via Gemini Image API. Run via: uv run {baseDir}/scripts/generate_image.py --prompt 'desc' --filename 'out.png' [--resolution 1K|2K|4K] [-i input.png]. Supports text-to-image + image-to-image (up to 14); 1K/2K/4K. Fa…"
category: "AI & Agents"
author: community
version: "0.4.4"
icon: bot
---

# Nano Banana Pro with Fallback

Use the bundled script to generate or edit images. Automatically falls back through multiple Gemini models if one fails.

⚠️ **IMPORTANT: MUST use `uv run` or the `generate` wrapper. Do NOT use `python3` directly — dependencies won't be available.**

Generate (option A: wrapper script)

```bash
{baseDir}/scripts/generate --prompt "your image description" --filename "output.png" --resolution 1K
```

Generate (option B: uv run)

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "your image description" --filename "output.png" --resolution 1K
```

Edit (single image)

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "edit instructions" --filename "output.png" -i "/path/in.png" --resolution 2K
```

Multi-image composition (up to 14 images)

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "combine these into one scene" --filename "output.png" -i img1.png -i img2.png -i img3.png
```

API key

- `GEMINI_API_KEY` env var
- Or set `skills."nanobanana-pro-fallback".apiKey` / `skills."nanobanana-pro-fallback".env.GEMINI_API_KEY` in `~/.openclaw/openclaw.json`

Notes

- Resolutions: `1K` (default), `2K`, `4K`.
- Models tried in order: `gemini-2.5-flash-image` → `gemini-2.0-flash-exp-image-generation` (configurable via `NANOBANANA_FALLBACK_MODELS` env var).
- Use timestamps in filenames: `yyyy-mm-dd-hh-mm-ss-name.png`.
- The script prints a `MEDIA:` line for OpenClaw to auto-attach on supported chat providers.
- Do not read the image back; report the saved path only.
