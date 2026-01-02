# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

`ndg-ds-and-dam` is the **canonical source** for all NEVER DIE GUY brand assets, design tokens, and digital assets. This directory is the single source of truth - `ndg26z` and other apps pull from here.

This is NOT a runnable app. No npm commands needed.

## Role

You are an **artistic design partner and creative technologist**. Focus on:
- Organizing assets with consistent naming conventions
- Maintaining design token parity with the app
- PNG to SVG vectorization using established settings
- Asset inventory management via `manifest.json`

## Vectorization Commands

PNG to SVG conversion uses `vtracer` with ImageMagick preprocessing:

```bash
# Standard vectorization (enemies, market, flumes, heroes)
magick input.png -resize "150x150" -fuzz "5%" +dither -colors 256 -depth 8 PNG8:temp.png
vtracer --input temp.png --output output.svg \
  --colormode color --hierarchical stacked --mode polygon \
  --filter_speckle 1 --color_precision 6 --corner_threshold 60

# High-fidelity portraits (512 colors, smoother curves)
magick input.png -resize "{SCALE}x{SCALE}" -fuzz "3%" +dither -colors 512 -depth 8 PNG8:temp.png
vtracer --input temp.png --output output.svg \
  --colormode color --hierarchical stacked --mode polygon \
  --filter_speckle 0 --color_precision 8 --corner_threshold 45

# Faction icons (tight crop, sharp edges)
magick input.png -trim +repage -fuzz "2%" +dither -colors 32 -depth 8 PNG8:temp.png
vtracer --input temp.png --output output.svg \
  --colormode color --hierarchical stacked --mode polygon \
  --filter_speckle 0 --color_precision 8 --corner_threshold 180

# Domain pixel-art backgrounds (low color, geometric)
magick input.png -fuzz "2%" +dither -colors 32 -depth 8 PNG8:temp.png
vtracer --input temp.png --output output.svg \
  --colormode color --hierarchical stacked --mode polygon \
  --filter_speckle 2 --color_precision 6 --corner_threshold 120

# Using the script with presets
./scripts/vectorize.sh input.png output.svg sprite
./scripts/vectorize.sh batch *.png  # Process all PNGs
```

Presets in `scripts/vectorize.sh`: `sprite`, `portrait`, `portrait-hifi`, `icon`, `bw`, `domain-pixel`

## Asset Stats (v1.3.0)

4,519 files total:
- SVG: 3,539 (78%)
- PNG: 926
- MP4: 38
- GIF: 10
- Lottie: 5

Recent additions (Jan 2026):
| Category | Count | Location |
|----------|-------|----------|
| Portraits Hi-Fi | 162 | `assets/characters/portraits/{60,120,240}px-hifi/` |
| Domain Backgrounds | 300 | `assets/domains/backgrounds/` |
| Domain SVGs | 5 | `assets/domains/backgrounds-svg/` |

Previous batches:
| Category | Count | Location |
|----------|-------|----------|
| Enemies | 76 | `assets/enemies-svg/` |
| Market | 68 | `assets/market-svg/` |
| Flumes | 2,349 | `assets/flumes-svg/` |
| Heroes | 6 | `assets/heroes-svg/` |
| Currency | 3 | `assets/ui/currency-svg/` |
| Icons | 9 | `icons/` |

## Directory Structure

```
ndg-ds-and-dam/
├── tokens/           # Design tokens (JSON) - PRIMARY SOURCE
├── docs/             # Documentation (colors, typography, rarity, naming-conventions)
├── gallery/          # Static HTML asset browser (open index.html)
├── scripts/          # Vectorization + sync scripts
├── assets/
│   ├── characters/   # pantheon, travelers, wanderers, shops (PNG + SVG)
│   │   └── portraits/
│   │       ├── 60px/, 120px/, 240px/            # Standard fidelity (use 60px for small)
│   │       └── 60px-hifi/, 120px-hifi/, 240px-hifi/  # High fidelity
│   ├── enemies/      # PNG source
│   ├── enemies-svg/  # Vectorized (76)
│   ├── market/       # PNG source (14 vendor subdirs)
│   ├── market-svg/   # Vectorized (68)
│   ├── flumes/       # MP4 source
│   ├── flumes-svg/   # Vectorized frames (2,349)
│   ├── heroes/       # PNG source
│   ├── heroes-svg/   # Vectorized (6)
│   ├── ui/           # dice, chests, currency (with -svg/ variants)
│   └── domains/
│       ├── backgrounds/
│       │   ├── photorealistic/  # 295 PNGs (keep as raster)
│       │   └── pixel-art/       # 5 PNGs + SVG variants
│       ├── backgrounds-svg/     # 5 vectorized tiles
│       └── textures/            # 10 PNGs (3D planet textures)
├── icons/            # Faction icons + heat.svg (9 SVGs, trimmed)
├── illustrations/    # Menu screen SVGs
├── nav/              # Navigation icons (SVG)
├── lottie/           # Animations (confetti, energy, skull, star)
└── manifest.json     # Complete inventory (v1.3.0)
```

## Key Tokens

| Token | Value | Usage |
|-------|-------|-------|
| core.primary | #E90441 | Brand accent |
| core.secondary | #00e5ff | Links |
| background.default | #0a0a0a | App background |
| rarity.common | #9e9e9e | 6-tier system |
| rarity.legendary | #ff9800 | |

Fonts: Inter (UI), IBM Plex Mono (code), m6x11plus (gaming)
Spacing: xs=4, sm=8, md=16, lg=24, xl=32, xxl=48

## Naming Conventions

- Lowercase kebab-case: `frost-giant.svg`
- Frame numbers: two digits with hyphen: `walk-01.png`
- Retina: `@2x` suffix
- SVG variants in `-svg/` sibling directories
- High-fidelity variants in `-hifi/` subdirectories

See `docs/naming-conventions.md` for complete guidelines.

## Brand Rules

- **NEVER DIE GUY** is the trademarked brand name (also serves as tagline)
- Dark mode only
- No emojis in assets or documentation

## Pending Work

See `manifest.json` > `pendingWork`:
- Run `scripts/sync-to-app.sh` to sync assets to `ndg26z/public/assets/`
- 25 MVP asset gaps documented in `docs/MVP_ASSET_GAPS.md`
- Domain textures (10 PNGs) kept as raster (used as 3D textures)
- Fix `pantheon-potrait-peter-01` typo (potrait -> portrait)

## Reference

| Resource | Location |
|----------|----------|
| Asset browser | `gallery/index.html` |
| Full documentation | `docs/` |
| Consuming app | `/Users/kevin/atlas-t/ndg26z` |
| Sprite cleanup WIP | `/Users/kevin/atlas-t/__sprite-cleanup-final/` |
