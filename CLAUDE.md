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

### Week of Jan 16 - Bullet Mode & QOL
- **Bullet Mode Timing**: Events 20s (was 45s), 3 throws (was 5), 1 trade
- **Event Variants**: Swift (0.6x), Standard (1x), Grueling (1.5x) difficulty
- **Victory Screen**: Categorized stats (Combat/Progress/Performance/Economy)
- **Run Tracking**: Total time, avg event time, fastest event, variant breakdown
- **Best Roll Tracking**: Tracks highest single throw score per run
- **Pause Menu**: Prominent Resume button, Fast Mode toggle (1x/2x speed)
- **Info Modal**: Domain element (+50% bonus tip), event difficulty, active bonuses
- **Sidebar**: Event variant displayed with color-coded border during play
- **Boss Phase**: Die-rector bosses in zone 3 with hearts-based HP display
- **Domain Inventory**: Items expire on domain clear (Common/Uncommon), persist (Epic+)
- **Shop Redesign**: Illustration-first minimal UI
- **Asset Cleanup**: Removed ~1500 unused photorealistic backgrounds

### Week of Jan 9-14 - Homepage & Polish
- Homepage character chatter with animated sprites and ambient dialogue
- Custom NPC/domain welcome headlines (e.g., "Mr. Bones contemplates Frost Reach")
- Domain/seed picker dropdown (click headline to change domain or edit seed)
- Player reactions: grunt, hmph, ignore (with NPC personality-based responses)
- Wiki base stat tooltips on hover (explains each stat)
- Wiki sprite zoom on hover (1.4x) and click (full modal view)
- Skeleton loaders for homepage on load/refresh
- Quick question chips for prebaked FAQ responses

### Week of Jan 2-8 - Core Systems
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
- Dice reticle colors match toolbar dice colors

## Current Game Balance

| Setting | Value |
|---------|-------|
| Event Duration | 20s base |
| Throws per Event | 3 |
| Trades per Event | 1 |
| Grace Period | 3s |
| Domains | 6 |
| Rooms per Domain | 3 |
| Target Run Length | 3-5 min |

### Event Variants
- **Swift**: 0.6x goal, 0.6x timer (12s), 0.6x gold
- **Standard**: 1.0x all (20s)
- **Grueling**: 1.5x goal, 1.5x timer (30s), 1.8x gold

## Next Steps (Deployment Prep)

### Priority 1: Final Polish
- [x] Homepage polish (headlines, reactions, skeletons)
- [x] Wiki improvements (stat tooltips, sprite zoom)
- [x] Bullet mode timing rebalance
- [x] Victory screen stats overhaul
- [x] Pause menu QOL (Resume, Fast Mode)
- [x] Info modal improvements
- [ ] Test full Arena run end-to-end (6 domains, 3 rooms each)
- [ ] Mobile responsiveness pass on key screens (Home, Play, Wiki)

### Priority 2: Deployment
- [x] TypeScript build passing
- [x] Vercel deployment configured (auto-deploys on push to main)
- [x] Asset optimization (removed unused backgrounds)
- [ ] Custom domain setup (if applicable)
- [ ] Production environment variables audit

### Priority 3: Nice-to-Have
- [x] Add more NPC ambient dialogue variety
- [x] Boss phase with Die-rectors
- [x] Domain-scoped inventory system
- [ ] Leaderboard/high score persistence
- [ ] Sound effects volume controls in settings
- [ ] Tutorial/onboarding flow for new players
