# Asset Guidelines

Naming conventions and format requirements for NEVER DIE GUY assets.

## Naming Conventions

### General Rules
- All lowercase
- Hyphens for word separation (kebab-case)
- No spaces or special characters
- Descriptive, semantic names

### Patterns

| Asset Type | Pattern | Example |
|------------|---------|---------|
| Items | `{item-name}.{ext}` | `iron-boots.svg` |
| Sprites | `sprite-{name}-{NN}.png` | `sprite-boo-g-01.png` |
| Portraits | `{character-name}.png` | `alice.png` |
| Navigation | `{name}.svg` | `play.svg` |
| Dice | `d{sides}-{variant}.png` | `d20-01.png` |
| Factions | `faction-{name}.{ext}` | `faction-flame-wardens.svg` |
| Domains | `{domain-name}.png` | `infernus.png` |
| Trophies | `{trophy-name}.gif` | `ember-heart.gif` |
| Lottie | `{name}.lottie` | `confetti.lottie` |

### Frame Numbers
- Two digits with hyphen: `-01`, `-02`, etc.
- Animation frames: `walk-01.png` through `walk-04.png`

### Retina Variants
- Suffix with `@2x`: `amethyst@2x.png`
- Only used for materials currently

## File Formats

| Format | Use Case |
|--------|----------|
| SVG | Icons, illustrations, scalable UI |
| PNG | Sprites, portraits, raster UI |
| GIF | Animated trophies |
| MP4 | Videos (cursed compression: 160x90, 8fps) |
| Lottie | UI animations |
| TTF | Fonts |

## Dimensions

| Asset Type | Size |
|------------|------|
| Sprites (normal) | 100x100 |
| Portraits | 256x256 |
| Dice faces | 64x64 |
| Nav icons | 24x24 |
| Illustrations | Variable (SVG) |

## Directory Structure

```
brand/          # Logos, fonts
assets/         # Game assets (characters, items, etc.)
nav/            # Navigation icons
illustrations/  # Menu SVGs
lottie/         # Animations
icons/          # System icons
tokens/         # Design tokens (JSON)
docs/           # Documentation
```

## Work In Progress

Sprite linework cleanup in progress. See `manifest.json` for status.
Current sprites at 100x100, ready for animation keyframing.
