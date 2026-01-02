# Colors

Design tokens for the NEVER DIE GUY color system. Source: `tokens/colors.json`

## Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary | `#E90441` | Primary actions, brand accent (pinky red) |
| secondary | `#00e5ff` | Links, interactive elements (cyan) |
| success | `#30d158` | Positive states, online status (Apple green) |
| error | `#ff453a` | Errors, destructive actions (Apple red) |
| warning | `#ffd60a` | Warnings, pending states (Apple yellow) |

## Backgrounds

Dark mode only. Three elevation levels:

| Token | Hex | Usage |
|-------|-----|-------|
| background.default | `#0a0a0a` | App background |
| background.paper | `#1a1a1a` | Card surfaces |
| background.elevated | `#242424` | Inputs, elevated elements |

## Text

| Token | Value | Usage |
|-------|-------|-------|
| text.primary | `#ffffff` | Primary text |
| text.secondary | `rgba(255,255,255,0.7)` | Secondary, captions |
| text.disabled | `rgba(255,255,255,0.5)` | Disabled states |

## Border

- `rgba(255,255,255,0.12)` - Subtle dividers, input borders

## Game Colors

### Dice Types
Each die type has a signature color:

| Die | Color | Hex |
|-----|-------|-----|
| d4 | Deep Orange | `#ff5722` |
| d6 | Green | `#4caf50` |
| d8 | Blue | `#2196f3` |
| d10 | Purple | `#9c27b0` |
| d12 | Orange | `#ff9800` |
| d20 | Pink | `#e91e63` |

### Combo Types
Score multipliers in gameplay:

| Combo | Color | Hex |
|-------|-------|-----|
| Pair | Green | `#4caf50` |
| Trips | Blue | `#2196f3` |
| Quads | Purple | `#9c27b0` |
| Straight | Orange | `#ff9800` |

### NPC Tiers
Enemy/NPC difficulty indicators:

| Tier | Color | Hex |
|------|-------|-----|
| Common | Gray | `#9e9e9e` |
| Rare | Blue | `#2196f3` |
| Elite | Purple | `#9c27b0` |
| Boss | Orange | `#ff9800` |

### UI Specific

| Token | Hex | Usage |
|-------|-----|-------|
| gold | `#c4a000` | Credits/currency |
| epic | `#a855f7` | Epic rarity (alt purple) |
| anomaly | `#ec4899` | Anomaly door type |
| stable | `#6b7280` | Stable/neutral states |

## Accessibility Notes

- Primary (`#E90441`) passes WCAG AA on dark backgrounds
- All text colors maintain 4.5:1 contrast ratio minimum
- Rarity colors tested for color-blind friendly distinction
