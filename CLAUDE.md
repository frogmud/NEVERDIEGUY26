# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

NEVERDIEGUY26 is the production-ready NEVER DIE GUY monorepo - a dice roguelike with adaptive NPC AI. Built with pnpm workspaces + Turborepo.

## Commands

```bash
# Development (ask user to run)
pnpm dev              # Start all packages in dev mode
pnpm dev:web          # Start web app only (Vite at localhost:5173)

# Build & Typecheck
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages

# AI Simulations (require ANTHROPIC_API_KEY)
pnpm sim:eternal      # Run NPC eternal days simulation
pnpm sim:pantheon     # Run pantheon encounter simulation
pnpm sim:extract      # Extract dialogue logs to chatbase
pnpm sim:chatter      # Pre-game NPC chatter simulation
```

## Architecture

### Monorepo Structure

```
apps/web/           # React 19 + Vite + MUI app (@ndg/web)
packages/
  shared/           # Shared types (@ndg/shared)
  ai-engine/        # NPC AI system (@ndg/ai-engine)
design-system/      # Canonical asset source (not a package)
```

### Web App (`apps/web/`)

**Routing**: React Router v7 with lazy loading. Shell component wraps authenticated routes.

**State Management**: React Context (no Redux)
- `RunContext` - Game state for /play (center panel swapping, combat, zones)
- `AuthContext` - User authentication
- `CartContext` - Shop cart
- `SettingsContext` - User preferences
- `NotificationContext` - Toast notifications

**Theme**: MUI with custom tokens in `src/theme.ts`. Key exports:
- `tokens.colors.primary` (#E90441), `tokens.colors.rarity.*`, `tokens.colors.game.*`
- `RARITY_COLORS`, `ROLE_COLORS`, `STATUS_COLORS` maps

**Screen Organization**:
- `/play/*` - 3D Phaser game (Globe3D, MeteorGame, combat)
- `/wiki/*` - In-game wiki (WikiEntity, FactionLore)
- `/shop/*` - NPC vendor shops
- `/progress/*` - Stats, leaderboard, history

### AI Engine (`packages/ai-engine/`)

Chess tablebase-style NPC dialogue - expensive offline Claude generation, O(1) runtime lookups.

**Core Systems**:
- `src/search/chatbase-lookup.ts` - Instant dialogue retrieval by context hash
- `src/player/player-profile.ts` - 4 archetypes (aggressive/defensive/chaotic/balanced)
- `src/core/response-selector.ts` - MCTS-based strategic response selection
- `src/games/ceelo/` - Cee-lo dice game engine

**Chatbase**: Pre-computed NPC responses in `chatbase/npcs/*.json`, indexed by mood/archetype/debt

### Design System (`design-system/`)

Not a runnable package. Canonical asset source synced to `public/` via `scripts/sync-assets.sh`.

**Vectorization**: Use `scripts/vectorize.sh` with presets: `sprite`, `portrait`, `portrait-hifi`, `icon`, `bw`, `domain-pixel`

## Key Patterns

**Panel Swapping**: /play uses Balatro-style center panel swapping (globe/combat/shop/doors/summary). RunContext manages transitions.

**NPC Categories**: Pantheon (9 gods), Wanderers (8 NPCs), Travelers (7 shopkeepers). Defined in `ai-engine/src/npcs/definitions/`.

**Rarity Tiers**: common/uncommon/rare/epic/legendary/unique with standard color mapping.

## Brand Rules

- **NEVER DIE GUY** is trademarked (no other taglines)
- Dark mode only
- No emojis in code/docs (use MUI icons in React)
- Do not run npm commands without asking - let user run them

## Deployment

Vercel config in `vercel.json`:
- Build: `pnpm build`
- Output: `apps/web/dist`
- Serverless functions: `apps/web/api/**/*.ts`
