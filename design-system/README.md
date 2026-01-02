# NDG Design System and Digital Asset Management

Canonical source for NEVER DIE GUY brand assets, design tokens, and digital assets.

## Status

**In Progress** - Sprite linework cleanup underway. See `manifest.json` for details.

## Structure

```
ndg-ds-and-dam/
├── tokens/           # Design tokens (JSON)
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── radius.json
│   └── semantic.json
├── docs/             # Documentation
│   ├── colors.md
│   ├── typography.md
│   ├── rarity-system.md
│   ├── asset-guidelines.md
│   └── brand-guidelines.md
├── brand/            # Brand assets
│   ├── logos/
│   └── fonts/
├── assets/           # Game assets
│   ├── characters/
│   ├── enemies/
│   ├── items/
│   ├── market/
│   ├── domains/
│   ├── factions/
│   └── ...
├── nav/              # Navigation icons
├── illustrations/    # Menu SVGs
├── lottie/           # Animations
└── icons/            # System icons
```

## Quick Reference

### Colors
- Primary: `#E90441`
- Secondary: `#00e5ff`
- Background: `#0a0a0a`

### Fonts
- Primary: Inter
- Mono: IBM Plex Mono
- Gaming: m6x11plus

### Rarity
Common (gray) -> Uncommon (green) -> Rare (blue) -> Epic (purple) -> Legendary (orange) -> Unique (pink)

## Documentation

- [Colors](docs/colors.md)
- [Typography](docs/typography.md)
- [Rarity System](docs/rarity-system.md)
- [Asset Guidelines](docs/asset-guidelines.md)
- [Brand Guidelines](docs/brand-guidelines.md)

## Usage

This directory is the canonical source. `ndg26z` and other apps should reference assets from here.

Import tokens:
```javascript
import colors from 'ndg-ds-and-dam/tokens/colors.json';
```

## Asset Inventory

See `manifest.json` for complete asset inventory and current status.
