# CLAUDE.md - NEVERDIEGUY26

## Overview

**NEVERDIEGUY26** is the consolidated, production-ready NEVER DIE GUY application. This directory merges:
- React app source (from ndg26z)
- Design system & assets (from ndg-ds-and-dam, embedded)

Single source of truth. Update the design system, sync to public.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Sync assets from design-system to public
./scripts/sync-assets.sh
```

## Directory Structure

```
NEVERDIEGUY26/
├── src/                    # React app source
├── public/                 # Production assets (synced from DS)
│   ├── assets/             # Game assets (characters, enemies, items, etc.)
│   ├── icons/              # System icons
│   ├── illustrations/      # Menu SVGs
│   ├── logos/              # Brand marks
│   ├── lottie/             # Animations
│   └── fonts/              # Typography
├── design-system/          # Embedded design system (canonical source)
│   ├── assets/             # Source assets
│   ├── tokens/             # Design tokens JSON
│   ├── docs/               # Guidelines
│   ├── scripts/            # Vectorization tools
│   ├── gallery/            # Asset browser (open index.html)
│   └── manifest.json       # Asset inventory
├── scripts/
│   └── sync-assets.sh      # DS -> public sync
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Asset Workflow

### To Update an Asset
1. Edit in `design-system/assets/...`
2. Run `./scripts/sync-assets.sh`
3. Changes appear in app

### To Add New Assets
1. Add to `design-system/assets/...`
2. Update `design-system/manifest.json`
3. Run sync script

### To Vectorize PNGs
Use presets in `design-system/scripts/vectorize.sh`:
```bash
./design-system/scripts/vectorize.sh input.png output.svg sprite
```

## Asset Stats

| Category | Count |
|----------|-------|
| Total files | 4,408 |
| SVGs | 3,470 |
| PNGs | 914 |
| Lottie | 4 |

## Key Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| core.primary | #E90441 | Brand accent |
| core.secondary | #00e5ff | Links |
| background.default | #0a0a0a | App background |

Fonts: Inter (UI), IBM Plex Mono (code), m6x11plus (gaming)

## Reference Directories

These are NOT part of NEVERDIEGUY26 but contain reference material:
- `ndg-meteor-game-phaser-engine` - Game logic documentation
- `ndg26x_adaptive_ai_chat_system` - NPC AI system (future merge)
- `ndg-ai-engine` - AI engine (future merge)

## Brand Rules

- **NEVER DIE GUY** is the trademarked brand name (also serves as tagline)
- Dark mode only
- No emojis in code or documentation

## Notes

- Do not run `npm` commands without asking - let the user run them
- Prefer SVG assets over PNG when available
- Use 60px portraits for small displays, 240px-hifi for large
