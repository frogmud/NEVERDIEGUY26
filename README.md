# NEVER DIE GUY

A roguelike dice game where you throw meteors at a globe to score points. Balatro meets globe-smashing chaos.

## The Story

You are Guy "Never Die Guy" Smith, The Fixer - a clone sent on intergalactic squabbles by six siblings who control fate.

The Die-rectors resurrect dead planets to harvest materials, then supply those same materials to you as weapons against their siblings. It's a circular economy of destruction and rebirth. You curry favor, trade with survivors, and question whether your immortality is even real anymore.

The meteors you throw? Those are dice. The planets you destroy? They'll be back. The siblings you serve? They all want the same thing: to win.

Welcome to NEVER DIE GUY.

## Current State (v0.5.0 - January 2026)

The core gameplay loop is polished and production-ready:

### Combat System
- **3 throws per turn** - reroll unheld dice up to 3 times
- **Trades** - sacrifice dice for multiplier boosts
- **6 die types** (d4-d20) - each with unique colors and meteor effects
- **Guardians** - orbital enemies that absorb matching dice
- **Draw event bonuses** - straights, triples, and patterns apply score bonuses
- **Skip events** - forfeit difficult rooms (with skip pressure penalty)
- **Inventory limits** - max 8 powerups, 6 upgrades

### Audio System
- **Sound effects** - dice roll, impact, victory, defeat, explosion sounds
- **UI feedback** - click sounds on buttons, holds, and combat actions
- **Music toggle** - background music support (loops at 30% master volume)
- **Persistent settings** - game speed, animations, music saved to localStorage

### Accessibility & Production
- **WCAG touch targets** - 44px minimum on all interactive elements
- **Error boundary** - graceful crash recovery
- **SEO meta tags** - Open Graph, Twitter Cards for social sharing
- **Security headers** - CSP, X-Frame-Options in vercel.json
- **Vercel Analytics** - page views and web vitals tracking

### Visual Polish
- **Overall progress bar** - domain/room/score/gold at top of play area
- **Damage visualization** - localized flash effect + floating damage numbers
- **Meteor targeting** - tight clustering around center reticle
- **Domain-themed planets** - unique colors per domain
- **Fast mode** - timer and animations scale with game speed (0.5x-2x)

### NPC System
- **Domain-bound NPCs** - each domain has its own Die-rector
- **Ambient commentary** - NPCs react to dice rolls, victories, defeats
- **Roll pattern detection** - triples, doubles, straights trigger special dialogue

## Project Structure

```
NEVERDIEGUY26/
├── apps/
│   └── web/                    # React frontend (Vite)
│       ├── src/
│       │   ├── games/          # Game components
│       │   │   ├── globe-meteor/   # 3D globe scene (Three.js)
│       │   │   └── meteor/         # Combat HUD
│       │   ├── screens/        # App screens
│       │   │   └── play/           # PlayHub + CombatTerminal
│       │   ├── contexts/       # State management
│       │   │   ├── RunContext      # Game state machine
│       │   │   ├── SoundContext    # Audio system
│       │   │   └── GameSettingsContext  # Persistent settings
│       │   └── theme/          # DIE/DIE design system
│       └── public/
│
├── packages/
│   └── ai-engine/              # Game logic package
│       ├── src/
│       │   ├── combat/         # Combat engine, dice mechanics
│       │   ├── core/           # Seeded RNG, utilities
│       │   └── npc/            # NPC dialogue triggers
│       └── COMBAT_SYSTEM.md    # Combat documentation
│
├── docs/
│   └── ux/                     # UX documentation
│       ├── GAMEPLAY_LOOP.md    # Full run flow
│       ├── STATE_MACHINE.md    # RunContext state diagram
│       └── SCREEN_INVENTORY.md # Screen registry
│
└── design-system/              # Brand assets, sprites
```

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck
```

## Documentation

- [Combat System](packages/ai-engine/COMBAT_SYSTEM.md) - Dice mechanics, turn flow, scoring
- [Gameplay Loop](docs/ux/GAMEPLAY_LOOP.md) - Full run structure
- [State Machine](docs/ux/STATE_MACHINE.md) - RunContext transitions

## Tech Stack

- **Frontend**: React 19, Vite, MUI 7
- **3D**: Three.js, React Three Fiber, Drei
- **State**: React Context (RunContext, SoundContext, GameSettingsContext)
- **Monorepo**: Turborepo, pnpm workspaces
- **Types**: TypeScript strict mode
- **Audio**: Web Audio API via useSound hook

## Game Modes

1. **Arena** - Solo roguelike, 6 domains x 3 rooms (current focus)
2. **VBots** - Async vs bots on same globe (planned)
3. **1v1** - Real-time multiplayer (planned)

---

*NEVER DIE GUY*
