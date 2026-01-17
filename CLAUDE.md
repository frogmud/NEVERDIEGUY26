# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEVER DIE GUY is a roguelike dice game where you throw meteors at a 3D globe to score points. Balatro-style dice mechanics meet globe-smashing chaos.

**Current Focus:** Polishing the Arena game mode (solo roguelike, 6 domains x 3 rooms).

## Worktree Structure

This repo uses git worktrees for parallel development:
- `NEVERDIEGUY26/` - main branch (production)
- `NEVERDIEGUY26-ux-improvements/` - feat/ux-improvements (UX polish)
- `NEVERDIEGUY26-ai-multiplayer/` - feat/ai-engine-partykit (multiplayer)
- `NEVERDIEGUY26-refactoring/` - chore/code-refactoring (cleanup)

Be mindful of parallel work in other worktrees when making changes.

## Commands

**Important:** Do not run npm/pnpm commands without asking the user first.

```bash
# Development (ask user to run)
pnpm dev          # Run dev server (Turborepo)
pnpm dev:web      # Run web app only

# Build (ask user to run)
pnpm build        # Build all packages
pnpm typecheck    # TypeScript validation

# Simulation scripts (ai-engine package)
pnpm sim:pantheon     # NPC encounter simulation
pnpm sim:chatter      # Pre-game NPC chatter
pnpm sim:extract      # Extract chatbase data
pnpm sim:restock      # Restock NPC dialogue
```

## Architecture

### Monorepo Structure
```
NEVERDIEGUY26/
├── apps/web/              # React frontend (Vite, MUI 7, React 19)
├── packages/ai-engine/    # Combat engine, NPC logic, chatbase
├── packages/shared/       # Shared types and utilities
├── api/                   # Vercel serverless functions
├── design-system/         # Brand assets, sprites (not git tracked)
└── docs/ux/               # UX documentation
```

### Package Dependencies
- `@ndg/web` depends on `@ndg/ai-engine` and `@ndg/shared`
- `@ndg/ai-engine` depends on `@ndg/shared`

### Key React Contexts (apps/web/src/contexts/)
| Context | Purpose |
|---------|---------|
| `RunContext` | Game state machine (phases, panels, scores, combat flow) |
| `SoundContext` | Audio effects (dice roll, impact, victory, defeat) |
| `GameSettingsContext` | Persistent settings (speed, animations, music, masterVolume) |
| `CartContext` | Shop/economy state |
| `NotificationContext` | In-game notifications |
| `AuthContext` | User authentication state |
| `SettingsContext` | App-wide settings |

### Key Components (apps/web/src/screens/play/)
| Component | Purpose |
|-----------|---------|
| `PlayHub` | Main game shell with progress bar + sidebar |
| `Globe3D` | 3D globe rendering (Three.js) |
| `Shop` | In-game item shop |
| `Inventory` | Player inventory management |
| `EventSelection` | Domain/event picker |

### Homepage (apps/web/src/components/)
| Component | Purpose |
|-----------|---------|
| `HomeDashboard` | 2-column homepage with loadout preview + Eternal Stream |
| `Shell` | App shell with nav, provides outlet context |

#### HomeDashboard Layout
```
+------------------------------------------------------------------+
| Top Rail: @player | Score | Multiplayer | Continue? | Gold       |
+------------------------------------------------------------------+
|                              |  Eternal Stream (340px)           |
|     Center Column            |  - Header + Filters               |
|     - 3 Item Cards           |  - Daily Wiki Banner (fixed)      |
|     - Seed Display           |  - NPC Chat Feed (scrolls)        |
|     - Begin Button           |                                   |
|                              |                                   |
+------------------------------------------------------------------+
```

**Layout Patterns:**
- Fixed viewport height: `height: calc(100vh - 64px)` on main container
- Sidebar full height: `height: 100%` with `overflow: hidden`
- Fixed header sections: `flexShrink: 0` to prevent shrinking
- Scrollable inner content: `flex: 1` with `overflowY: auto` and `minHeight: 0`
- Full-width elements in padded containers: use negative margins (`mx: -2`)

### AI Engine Structure (packages/ai-engine/src/)
| Module | Purpose |
|--------|---------|
| `combat/` | Combat engine, dice mechanics, scoring |
| `npcs/` | NPC definitions (pantheon, travelers, wanderers) |
| `core/` | Seeded RNG, memory, relationships, intent detection |
| `personality/` | Mood dynamics, behavioral patterns |
| `social/` | Conversation threading, knowledge system |
| `balance/` | Game balance configuration (canonical values) |
| `economy/` | Gold, trading, pricing systems |
| `items/` | Item definitions and effects |
| `shop/` | Shop inventory and NPC offerings |
| `adapters/` | External system adapters |

### API Endpoints (api/)
| Endpoint | Purpose |
|----------|---------|
| `chat.ts` | NPC dialogue with rate limiting (60 req/min/IP) |
| `chat-manifest.ts` | NPC chat configuration |
| `health.ts` | Health check |
| `stats.ts` | Game statistics |
| `_lib/lookup.ts` | Chatbase dialogue lookup |
| `_lib/claude-refine.ts` | AI dialogue refinement |
| `_lib/npc-personas.ts` | NPC personality definitions |

## UI Patterns

### Action Buttons (GameTab / HomeDashboard)
Consistent styling for primary action buttons:
```tsx
sx={{
  minHeight: 80,
  py: 2,
  borderRadius: '12px',
  bgcolor: tokens.colors.primary,  // or background.elevated for secondary
  border: '2px solid ...',
  transition: 'all 150ms ease',
  '&:hover': { transform: 'scale(1.02)' },
}}
// Typography: fontFamily: tokens.fonts.gaming, fontSize: '1.4rem'
// Subtitle: fontSize: '0.85rem', mt: 0.5
```

### Eternal Stream (NPC Chat)
Multi-NPC ambient conversation system on homepage:
- Uses `@ndg/ai-engine` conversation functions (`selectNextSpeaker`, `addConversationTurn`)
- Typewriter effect for new messages (25-50ms per character)
- Messages prepended (newest first)
- Relationship-aware dialogue (30% chance for cross-NPC references)
- Domain-specific NPC participants

### Item Cards with Rarity
```tsx
// Rarity badge colors
Uncommon: bgcolor '#1a4d1a', border '#2d7a2d', text '#6ddf6d'
Common: bgcolor '#444', border '#555', text '#ccc'
```

## Development Rules

### Do NOT:
- Run npm/pnpm commands without asking the user first
- Use emojis in code, docs, or UI (use Material-UI icons instead)
- Add taglines (NEVER DIE GUY is the brand name and tagline)
- Create backup or orphan files

### Do:
- Use TypeScript strict mode
- Follow existing patterns in the codebase
- Keep changes focused and minimal
- Update relevant docs when making significant changes

## Game Balance Constants

Located in `packages/ai-engine/src/balance/balance-config.ts` and `apps/web/src/config/gameConfig.ts`:

| Setting | Value |
|---------|-------|
| Event Duration | 20s base |
| Throws per Event | 3 |
| Trades per Event | 1 |
| Grace Period | 3s |
| Domains | 6 |
| Rooms per Domain | 3 |

### Event Variants
- **Swift**: 0.6x goal, 0.6x timer (12s), 0.6x gold
- **Standard**: 1.0x all (20s)
- **Grueling**: 1.5x goal, 1.5x timer (30s), 1.8x gold

## Documentation

- [Gameplay Loop](docs/ux/GAMEPLAY_LOOP.md) - Full run structure
- [State Machine](docs/ux/STATE_MACHINE.md) - RunContext transitions
- [Screen Inventory](docs/ux/SCREEN_INVENTORY.md) - Component registry
- [Narrative Integration](docs/ux/NARRATIVE_INTEGRATION.md) - NPC dialogue flow

## Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance, cleanup
- `docs/` - Documentation updates

## Asset Locations

- **Canonical assets:** `apps/web/public/assets/` (Vite serves from here)
- **Design system:** `design-system/` (brand assets, sprites - not git tracked)
- **Legacy:** Root `/public/` is deprecated and gitignored

### Common Asset Paths
```
/assets/ui/token.svg              # Score token icon
/assets/ui/currency/coin.png      # Gold coin
/assets/items/quest/diepedia-vol1.svg  # Wiki book
/assets/items/armor/*.svg         # Armor items (hero-cape, king-james-crown, etc.)
/assets/items/consumables/*.svg   # Consumables (health-potion, etc.)
/illustrations/*.svg              # UI illustrations (1v1.svg, newgame.svg, etc.)
/logos/ndg-skull-dome.svg         # Brand logo
```

## Tech Stack

- **Frontend**: React 19, Vite 6, MUI 7, TypeScript 5.8
- **3D**: Three.js 0.182, React Three Fiber, Drei
- **State**: React Context (RunContext, SoundContext, GameSettingsContext)
- **Monorepo**: Turborepo 2.7, pnpm 9.15 workspaces
- **Deployment**: Vercel (serverless functions in `/api`)
- **AI**: Anthropic SDK (dynamic import for Vercel cold start optimization)
