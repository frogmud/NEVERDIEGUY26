---
name: ndg-sprite-vectorizer
description: Vectorize PNG (and other raster) art into clean, hard-edged SVGs using the proven NDG ImageMagick-preprocess + vtracer recipe. Use when the user wants to convert sprites, portraits, icons, or any raster art to SVG, batch-convert a folder of PNGs, or reproduce the "vector output sets" from the design-system asset pipeline. Bundles a self-contained vectorize.sh with tuned presets; does NOT depend on the asset-cms TS module.
---

# NDG Sprite Vectorizer

Turn raster art into crisp SVGs with the recipe that produced the design-system vector sets.
The quality comes from a two-step pipeline, not vtracer alone:

1. **ImageMagick preprocess** — merge near-identical colors (`-fuzz`) and quantize the palette
   (`+dither -colors N`). This is what prevents banding and keeps the SVG small. Skipping it is
   the #1 cause of bloated, noisy output.
2. **vtracer trace** — convert the cleaned raster to stacked color polygons/splines.

The bundled `scripts/vectorize.sh` does both in one call and supports batch mode.

## When to use
- "Vectorize these PNGs", "convert sprite/portrait/icon to SVG", "batch-convert this folder".
- Reproducing the design-system asset pipeline (`design-system/scripts/*vectorize*.sh`).
NOT for: pushing art into Figma (that is the Figma MCP / Sprite Frame flow), or raster cleanup
without vectorizing.

## Dependencies (check first)
Both are required; neither is installed by default on this machine.
- **ImageMagick 7** (`magick`): `brew install imagemagick`
- **vtracer** (`vtracer`): `cargo install vtracer` (needs Rust; `brew install rust` or rustup),
  or `pip install vtracer` for the Python build, or `brew install vtracer` if the formula exists.

The script checks for both and prints install hints if missing. Do not blind-run on a machine
without them; confirm with `command -v magick vtracer` first.

## Usage
```bash
SK=NEVERDIEGUY26/.claude/skills/ndg-sprite-vectorizer/scripts/vectorize.sh

# single file, default 'sprite' preset, output next to input
"$SK" hero.png

# pick preset + explicit output
"$SK" hero.png hero.svg portrait

# override the quantized color count (any preset)
NDG_COLORS=24 "$SK" hero.png

# resize before tracing (smaller raster = simpler SVG)
NDG_RESIZE=150x150 "$SK" hero.png

# batch a whole folder -> mirror into an output dir
"$SK" batch ./pngs ./svgs crisp
```

## Presets (preprocess + trace tuned together)
| Preset | Best for | Palette | Trace feel |
|--------|----------|---------|-----------|
| `pixel` | dense/detailed pixel-art sprites where small features (text, jewelry, eyes) must survive | 256, fuzz 1%, 3x point upscale | `filter_speckle 0`, full fidelity. Use this for small (<=128px) detailed sprites |
| `sprite` (default) | larger/simpler game sprites | 256, fuzz 5% | hard polygon edges, full color |
| `crisp` | the "ultra-crisp / glitchy" archival look | 32, fuzz 10% | max fidelity, sharp corners (the smart-reduce recipe) |
| `portrait` | character portraits, illustration | 512, fuzz 3% | smooth splines, organic |
| `icon` | UI icons (auto-trims transparent border) | 32, fuzz 2% | simplified poster |
| `poster` | merch, bold graphics | 16, fuzz 8% | few colors, bold shapes |
| `minimal` | thumbnails, favicons, abstract | 8 | aggressive simplification |
| `bw` | line/silhouette | n/a | black & white, no preprocess |

Full flag-by-flag breakdown and file-size expectations: `references/presets.md`.

## Workflow
1. Confirm `magick` and `vtracer` exist; if not, surface the install commands and stop.
2. Pick a preset from the user's intent (sprite vs portrait vs icon vs merch). Default `sprite`.
3. Run on ONE representative file first, report the output size + color count, eyeball it.
4. If good, batch the rest. If too noisy -> fewer colors / higher preset; if too flat -> `portrait`
   or raise `NDG_COLORS`.

## Gotchas
- `+dither` (plus, disables dithering) is intentional — dithering scatters pixels and explodes the
  trace. Keep it off for clean art.
- Lower color count = smaller, bolder SVG; higher = more faithful, larger. Tune `NDG_COLORS` before
  changing presets.
- `icon` auto-runs `-trim +repage` to crop transparent margins; do not use it for art where the
  canvas/padding matters.
- vtracer reads PNG/JPG; for other formats let ImageMagick handle it (the preprocess step already
  normalizes to PNG8 before tracing).
- No emojis in output filenames or generated content (NDG house rule).

## Provenance
Recipes consolidated from the design-system asset pipeline:
`design-system/scripts/vectorize.sh`, `smart-reduce-vectorize.sh`, `reduce-colors-vectorize.sh`,
and `demos/vtracer-showcase/README.md`. This skill is the standalone, reusable version.
