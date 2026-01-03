# NEVER DIE GUY - Changelog

## [0.1.0] - 2026-01-02

### Major Milestone: Balatro-Style Combat System

The core dice combat loop is now functional with proper Balatro-style mechanics.

#### Added

**Combat Engine (@ndg/ai-engine)**
- `throwsRemaining` state - 3 throws per turn, resets each turn
- `holdsRemaining` state - 3 holds per room (strategic resource)
- Proper hold/throw mechanics where held dice keep values
- Turn flow: draw -> select -> throw -> resolve -> enemy -> check

**Dice System**
- 6 die types (d4, d6, d8, d10, d12, d20) with elements
- Dice pool management with exhaustion/recycling
- `rollHand()` only rolls unheld dice

**CombatHUD**
- Throws indicator (3 dots per turn)
- Holds indicator (3 dots per room)
- Staggered dice loading animation (150ms apart)
- Roll button disabled when no throws left
- End button always available for early scoring

**CombatTerminal**
- Inline combat view in PlayHub
- Globe visualization with meteors/impacts
- Reticle targeting during select phase
- Connected to real CombatEngine

**Visual Effects**
- Meteor projectiles with trails
- Impact explosions with shockwaves
- Die-type-specific colors and sizes
- Pulsing target reticle

#### Fixed
- Spam-roll exploit (now limited to 3 throws)
- Hold stacking issue (holds now properly consumed)
- Dice animation overlap with skull logo

#### Technical
- Added `throwsRemaining` to CombatState interface
- Added `throwsRemaining` to RunCombatState interface
- Updated rollHand to preserve held dice values
- Combat phases properly transition

---

## Development Notes

### Architecture

```
@ndg/ai-engine          # Game logic package
├── combat/             # Combat system
├── core/               # Seeded RNG, utilities
└── npc/                # NPC dialogue (future)

apps/web                # React frontend
├── games/              # Game components
├── screens/play/       # Play hub + combat
└── contexts/           # State management
```

### Next Steps

1. Grid-based entity damage from dice
2. Element combo bonuses
3. Bless/Curse modifiers
4. Globe rotation for attack angles
5. Visual hit feedback on enemies

---

*NEVER DIE GUY*
