# NEVER DIE GUY

A roguelike dice game where you throw meteors at a globe to score points. Balatro meets globe-smashing chaos.

## Current State (January 2026)

The core gameplay loop is functional with polished UX:

### Combat System
- **3 throws per turn** - reroll unheld dice up to 3 times
- **Trades** - sacrifice dice for multiplier boosts
- **6 die types** (d4-d20) - each with unique colors and meteor effects
- **Guardians** - orbital enemies that absorb matching dice
- **Target scores** - scale with domain (1-6) and room difficulty

### Audio & Settings
- **Sound effects** - dice roll, impact, victory, defeat sounds
- **Persistent settings** - game speed, animations, music saved to localStorage
- **Adjustable game speed** - 0.5x to 2x animation speed

### Visual Polish
- **Overall progress bar** - domain/room/score/gold at top of play area
- **Damage visualization** - localized flash effect + floating damage numbers
- **Meteor targeting** - tight clustering around center reticle
- **Domain-themed planets** - unique colors per domain

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
