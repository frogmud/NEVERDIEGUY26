# CLAUDE.md - NEVER DIE GUY

Project instructions for Claude Code when working in this repository.

## Project Overview

NEVER DIE GUY is a roguelike dice game where you throw meteors at a 3D globe to score points. Balatro-style dice mechanics meet globe-smashing chaos.

**Current Focus:** Polishing the Arena game mode (solo roguelike, 6 domains x 3 rooms).

## Architecture

### Monorepo Structure
```
NEVERDIEGUY26/
├── apps/web/          # React frontend (Vite, MUI 7)
├── packages/ai-engine/  # Combat engine, NPC logic
├── design-system/     # Brand assets, sprites
├── api/               # Vercel serverless functions
└── docs/              # UX documentation
```

### Key Contexts (React)
- **RunContext** - Game state machine (phases, panels, scores)
- **SoundContext** - Audio effects (dice roll, impact, victory, defeat)
- **GameSettingsContext** - Persistent settings (speed, animations, music)

### Key Components
- **PlayHub** - Main game shell with progress bar + sidebar
- **CombatTerminal** - 3D globe, HUD reticle, combat flow
- **PlaySidebar** - Phase-aware tabs (Game, Bag, Settings)
- **CombatHUD** - Dice hand, throw/trade buttons

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

## Common Tasks

### Running Dev Server
Ask user to run: `pnpm dev`

### Building
Ask user to run: `pnpm build`

### Creating PRs
Use gh CLI to create PRs with clear descriptions.

## Documentation

- [Gameplay Loop](docs/ux/GAMEPLAY_LOOP.md) - Full run structure
- [State Machine](docs/ux/STATE_MACHINE.md) - RunContext transitions
- [Screen Inventory](docs/ux/SCREEN_INVENTORY.md) - Component registry
- [Combat System](packages/ai-engine/COMBAT_SYSTEM.md) - Dice mechanics

## Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance, cleanup
- `docs/` - Documentation updates

## Recent Changes (January 2026)

- Homepage character chatter with animated sprites and ambient dialogue
- Welcome message with random player ID (neverdieguy#####)
- Chrome cleanup: Help/Settings/About in top bar, removed notifications/avatar
- Footer cleanup: removed sitemap, renamed Design System to "Bones"
- Fixed meteor crater black artifacts (ImpactEffect)
- Removed "Play As" buttons from wiki
- Sound effects system (SoundContext)
- Persistent game settings (GameSettingsContext)
- Overall progress bar at top of play area
- Meteor targeting fix (hits center reticle)
- NPC domain-bound filtering
- Damage visualization (flash + floating numbers)
- Context-aware NPC chat with character name filtering
- Roll-value-scaled explosion effects (intensity varies by roll)
- Die-type-specific impact patterns (triangle, diamond, star, etc.)
- Throw button debouncing (disabled during throw/resolve phases)

## Next Steps (Deployment Prep)

### Priority 1: Final Polish
- [ ] Merge PR #11 (homepage polish and chrome cleanup)
- [ ] Test full Arena run end-to-end (6 domains, 3 rooms each)
- [ ] Verify all wiki pages load without broken images
- [ ] Mobile responsiveness pass on key screens (Home, Play, Wiki)

### Priority 2: Deployment
- [ ] Run `pnpm build` and fix any TypeScript errors
- [ ] Configure Vercel deployment settings
- [ ] Set up environment variables for production
- [ ] Domain setup (if applicable)

### Priority 3: Nice-to-Have
- [ ] Add more NPC ambient dialogue variety
- [ ] Leaderboard/high score persistence
- [ ] Sound effects volume controls in settings
- [ ] Tutorial/onboarding flow for new players
