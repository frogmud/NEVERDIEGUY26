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

### Priority 1: QA & Testing
- [x] QA audit issues resolved (see /codex/RESOLVED.md)
- [x] Victory deadlock fixed
- [x] Economy multipliers wired in (heat bonus)
- [x] Wiki cleaned (removed dead domains, items, links)
- [ ] Test full Arena run end-to-end (6 domains, 3 rooms each)
- [ ] Mobile responsiveness pass on key screens (Home, Play, Wiki)

### Priority 2: Deployment
- [x] TypeScript build passing
- [x] Vercel deployment configured (auto-deploys on push to main)
- [x] Asset optimization (removed unused backgrounds)
- [x] Multiplayer routes hidden until backend ready
- [x] Anthropic SDK dynamic import (fixes Vercel cold start)
- [x] Clean up root public/ folder (removed from git, 250MB saved)
- [x] API security hardening (rate limiting, CORS, input validation)
- [ ] Custom domain setup (if applicable)

### Priority 3: Nice-to-Have (Post-Deploy)
- [ ] Victory screen timing stats
- [ ] Mobile sidebar collapse
- [ ] Leaderboard/high score persistence
- [ ] Tutorial/onboarding flow

## Session Notes - Jan 16, 2026

### QA Cleanup Complete (Latest)
Based on /codex audit files, all critical issues addressed:

**Critical Bugs Fixed:**
- Victory deadlock - Score now captured at win moment before decay continues
- Timer display mismatch - Launch UI shows correct 20s base (was showing 45s)

**Wiki Cleanup:**
- Removed non-core domains (the-dying-saucer, the-board-room)
- Cleaned dead domain links (bone-yard, crystal-caverns, frozen-wastes, thunder-spire)
- Fixed shop locations that referenced removed domains
- Removed 15 items with missing SVG assets from artifacts.ts

**Economy Wiring:**
- Heat multiplier now applies to gold rewards (+20% per heat level)
- Reroll cost uses balance-config (25g base with calm reduction, was hardcoded 50g)
- Telemetry now logs actual variant-adjusted target scores

**Code Quality:**
- Fixed Anthropic SDK dynamic import for Vercel deployment
- Updated stale comments (variant multipliers, starting gold)

**Asset Status:**
- `apps/web/public/assets` is canonical (Vite serves from here)
- Root `public/assets/` is legacy - safe to delete post-deployment

### Earlier This Session
1. **Code Quality Audit** - Passed (0 console.logs, 0 type issues)
2. **Hide Multiplayer Routes** - Commented out ReplayList/TournamentBracket until backend ready
3. **NPC Chat Refinement** - Live Claude AI refinement with NPC personas (dynamic import)
4. **Volume Controls** - Added masterVolume to GameSettingsContext, Audio section in Settings
5. **Homepage fixes** - Fixed item load/unload flicker, updated "grunt" to "click to continue"

### Next Session Priorities
1. **Full Run Testing** - Play complete 6-domain run to verify all systems work together
2. **Mobile Layout** - Sidebar collapse/drawer for screens < 900px
3. **Victory Stats Timing** - Add event timing tracking (optional enhancement)

## Session Notes - Jan 17, 2026

### Deployment Optimization
- **Removed 250MB legacy `/public` folder** from git tracking (was causing 45min build timeouts)
- **Added to .gitignore**: `/public/`, `/codex/`, `/design-system/assets/`, `/design-system/assets-pixelart/`
- Verified `apps/web/public/` (canonical assets) still tracked (4,176 files)
- Local `.turbo/cache/` can be deleted to save 13GB disk space

### API Security Hardening (Code Review Feedback)
**Server-side (`api/`):**
- `claude-refine.ts`: Lower temp (0.7), 5s timeout, env-configurable model (`CLAUDE_MODEL`)
- `chat.ts`: CORS locked to allowed origins, input validation (npcSlug/pool), rate limiting (60 req/min/IP)
- `lookup.ts`: Session deduplication (tracks last 5 entries per NPC per session, 30min TTL)
- `chatbase-data.ts`: Cached `getTotalEntryCount()` for performance

**Client-side (`apps/web/src/services/chatbase.ts`):**
- 3s fetch timeout with AbortController
- Fallback deduplication (tracks last 5 responses)
- Per-NPC fallback overrides (stitch-up-girl, mr-bones, willy, boo-g, the-general, dr-maxwell)
- `useLookupDialogue` React hook (returns fallback immediately, updates on API response)
- Error classification (4xx = bug, 5xx = retry)
- Stub functions marked with TODO comments

### Homepage Chat (Carousel Vibes)
- Removed "click anywhere to keep chatting" prompt
- After user asks question and NPC responds, ambient chat pauses permanently
- User can still ask more questions via input (not blocked)

### Thread Selectors Refactor
- Added constants to `gameConfig.ts`: `EVENTS_PER_DOMAIN`, `BOSS_THRESHOLD`, `INTEGRITY_THRESHOLDS`
- Fixed all magic numbers in `threadSelectors.ts`
- `getLedgerEventCounts` now dynamic (handles unknown event types)
- Consistent nullish coalescing (`??` instead of `||`)
- `protocolRoll` properly typed as nullable in `ThreadSnapshot`
- Removed dead code guard in `getLoadoutHash`

### NPC Chat Permutation Simulator
- Refactored `packages/ai-engine/scripts/lib/` with shared utilities (CLI, output, simulation, npc-adapter)
- Created `npc-chat-permutations.ts` for multi-NPC conversation generation
- Memory-efficient hyperbolic mode (can run indefinitely without OOM)
- All 15 NPCs have specific dialogue templates
- Deduplication built-in (normalizes names to `{{TARGET}}`)
