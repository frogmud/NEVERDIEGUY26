# NEVER DIE GUY

A roguelike dice game where you throw meteors at a globe to score points. Balatro meets globe-smashing chaos.

## Milestone: Combat System (January 2026)

The core Balatro-style dice combat loop is now functional:

- **3 throws per turn** - reroll unheld dice up to 3 times
- **3 holds per room** - strategic resource across entire combat
- **6 die types** (d4-d20) - each with unique elements and visual effects
- **Target scores** - scale with domain and room difficulty
- **Visual feedback** - meteors, impacts, reticles on 3D globe

## Project Structure

```
NEVERDIEGUY26/
├── apps/
│   └── web/                    # React frontend (Vite)
│       ├── src/
│       │   ├── games/          # Game components
│       │   │   ├── globe-meteor/   # 3D globe scene
│       │   │   └── meteor/         # Combat HUD
│       │   ├── screens/        # App screens
│       │   │   └── play/           # Play hub + combat
│       │   ├── contexts/       # State management
│       │   └── theme/          # DIE/DIE design system
│       └── public/
│
├── packages/
│   └── ai-engine/              # Game logic package
│       ├── src/
│       │   ├── combat/         # Combat engine, dice, grid
│       │   ├── core/           # Seeded RNG, utilities
│       │   └── npc/            # NPC dialogue (future)
│       └── COMBAT_SYSTEM.md    # Combat documentation
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
- [Changelog](CHANGELOG.md) - Version history and milestones

## Tech Stack

- **Frontend**: React 19, Vite, MUI 7
- **3D**: Three.js, React Three Fiber, Drei
- **State**: React Context + custom hooks
- **Monorepo**: Turborepo, pnpm workspaces
- **Types**: TypeScript strict mode

## Game Modes (Planned)

1. **Arena** - Solo roguelike, 3 domains x 3 rooms
2. **VBots** - Async vs bots on same globe
3. **1v1** - Real-time multiplayer

---

*NEVER DIE GUY*
