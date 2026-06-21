# NEVER DIE GUY

A roguelike dice game where you throw meteors at a dying world to score. Balatro-style scoring meets intergalactic sibling rivalry.

**Play now:** [neverdieguy.com](https://neverdieguy.com)

## The Story

You are Guy "Never Die Guy" Smith, The Fixer - a clone sent to settle the squabbles of six siblings who control fate. The Die-rectors resurrect dead planets to harvest materials, then hand those same materials back to you as weapons against their rivals. A circular economy of destruction and rebirth.

The meteors you throw are dice. The planets you destroy come back. The siblings you serve all want the same thing: to win. Your immortality? You are a clone of a clone, so that part is up for debate.

## Gameplay

Solo roguelike across six domains, three rooms each. Each turn you roll dice (meteors), reroll what you do not hold, and trade dice for multipliers to clear a score goal before the timer runs out.

- Six die types, each with its own meteor effect
- Guardians that absorb matching dice, draw-pattern bonuses (straights, triples), and skip pressure for forfeited rooms
- Powerups, upgrades, gold, and trading between rooms
- Domain-bound NPCs that react to your rolls, wins, and deaths
- Production wiring: audio, WCAG touch targets, analytics, and security headers

Multiplayer is in development.

## Project Structure

```
apps/
  web/         # React + Vite frontend (screens, 3D globe, contexts, services)
packages/
  ai-engine/   # Combat engine, NPC logic, balance, economy, items
  shared/      # Shared types and utilities
  tokens/      # @neverdieguy/tokens - public design tokens
  ui/          # @neverdieguy/ui - public MUI component library
api/           # Vercel serverless functions (chat, manifest, health, stats)
docs/ux/       # Gameplay loop, state machine, screen inventory
```

## Development

```bash
pnpm install     # install dependencies
pnpm dev         # run dev server
pnpm build       # build all packages
pnpm typecheck   # type check
```

## Tech Stack

- **Frontend:** React 19, Vite, MUI 7, TypeScript (strict)
- **3D:** Three.js, React Three Fiber, Drei
- **State:** React Context (RunContext, SoundContext, GameSettingsContext)
- **NPC dialogue:** Anthropic SDK behind rate-limited serverless functions
- **Monorepo:** Turborepo + pnpm workspaces
- **Deploy:** Vercel (auto-deploy from `main`)

## Documentation

- [Gameplay Loop](docs/ux/GAMEPLAY_LOOP.md) - full run structure
- [State Machine](docs/ux/STATE_MACHINE.md) - RunContext transitions

---

*NEVER DIE GUY*
