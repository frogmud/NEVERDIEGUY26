# Asset Naming Conventions

This document defines the standard naming conventions for all NEVER DIE GUY assets.

## General Rules

1. **Lowercase kebab-case** for all filenames and directories
2. **No spaces, underscores, or special characters** (except hyphens)
3. **Zero-padded frame numbers** with hyphen separator: `-01`, `-02`

## Directory Naming

| Pattern | Example |
|---------|---------|
| Source directories | `enemies/`, `market/`, `characters/` |
| Vectorized sibling | `enemies-svg/`, `market-svg/` |
| Scale variants | `30px/`, `60px/`, `120px/`, `240px/` |
| High-fidelity variants | `30px-hifi/`, `240px-hifi/` |
| Legacy/archived | `__legacy/`, `__archive/` |

## File Naming

### Characters & Portraits

```
{type}-portrait-{character-name}-{variant}.{ext}
{type}-sprite-{character-name}-{action}-{frame}.{ext}
```

| Component | Values |
|-----------|--------|
| type | `pantheon`, `shop`, `traveler`, `wanderer` |
| character-name | kebab-case, e.g., `king-james`, `mr-bones`, `never-die-guy` |
| variant | `01`, `02`, or `01-1` for alternates |
| action | `idle`, `walk`, `attack`, etc. |
| frame | two-digit zero-padded: `01`, `02` |

Examples:
- `pantheon-portrait-rhea-01.svg`
- `traveler-sprite-boots-idle-01.png`
- `shop-portrait-king-james-02.svg`

### Items

```
{item-name}.{ext}
{item-name}-{variant}.{ext}
```

Examples:
- `amethyst.svg`
- `medkit-used.svg`
- `crowbar.svg`

### Enemies

```
{enemy-name}.{ext}
{enemy-name}/{frame-type}-{frame}.{ext}
```

Examples:
- `frost-giant.svg`
- `dying-saucer/main-ufo-01.svg`

### UI Elements

```
{element-name}-{number}.{ext}
```

Examples:
- `d4-01.svg`, `d6-01.svg`
- `chest-common-01.svg`

### Icons

```
faction-icon-{faction-name}.{ext}
{icon-purpose}.svg
```

Examples:
- `faction-icon-ghouls.svg`
- `heat.svg`

### Domain Backgrounds

```
sheet{n}_tile{nnn}.{ext}
```

Examples:
- `sheet1_tile001.png`
- `sheet3_tile048.svg`

## Known Issues

| Issue | Status |
|-------|--------|
| `pantheon-potrait-peter-01` typo | Pending rename to `portrait` |
| Mixed casing (`alienbaby` vs `alien-baby`) | Standardize to kebab-case |

## Retina Assets

Use `@2x` suffix for retina variants:
- `logo.svg` (standard)
- `logo@2x.png` (retina raster)
