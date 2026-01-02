# Rarity System

NEVER DIE GUY uses a 6-tier rarity system for items, NPCs, and rewards.

## Tiers

| Tier | Color | Hex | Drop Rate | Description |
|------|-------|-----|-----------|-------------|
| Common | Gray | `#9e9e9e` | ~50% | Basic items, frequent drops |
| Uncommon | Green | `#4caf50` | ~25% | Slight upgrade, minor bonuses |
| Rare | Blue | `#2196f3` | ~15% | Noticeable power increase |
| Epic | Purple | `#9c27b0` | ~7% | Significant abilities |
| Legendary | Orange | `#ff9800` | ~2.5% | Build-defining items |
| Unique | Pink | `#e91e63` | ~0.5% | One-of-a-kind, special effects |

## Usage in Code

Import from tokens:
```json
// tokens/colors.json
"rarity": {
  "common": "#9e9e9e",
  "uncommon": "#4caf50",
  "rare": "#2196f3",
  "epic": "#9c27b0",
  "legendary": "#ff9800",
  "unique": "#e91e63"
}
```

## Visual Guidelines

- Rarity color should be used for:
  - Item name text color
  - Border/glow on item icons
  - Background tint on cards (20% opacity)

- Never use rarity color for body text or large surfaces

## Color-Blind Considerations

The rarity progression uses both hue and brightness:
- Common (gray) is desaturated
- Progression goes cool->warm (green->blue->purple->orange->pink)
- Each tier has distinct brightness value
