# NEVER DIE GUY - Combat System

## Major Milestone: Balatro-Style Dice Combat

**Date:** January 2, 2026
**Status:** Core mechanics implemented and functional

---

## Overview

The combat system is a turn-based dice game inspired by Balatro's hold/play mechanics. Players draw 5 dice from a pool, can hold some between throws, and try to reach a target score within limited turns.

---

## Core Mechanics

### The Turn Structure

```
TURN START
    |
    v
[DRAW] --> Draw 5 dice from pool (held dice stay)
    |
    v
[SELECT] <--+
    |       |
    | Hold/unhold dice
    |       |
    v       |
[THROW] ----+ (if throws remaining)
    |
    | Roll unheld dice only
    | Decrement throwsRemaining
    |
    v
[RESOLVE] (when throws = 0 or player ends)
    |
    | Calculate score from hand
    | Add to currentScore
    |
    v
[ENEMY_TURN]
    |
    v
[CHECK_END]
    |
    +--> Victory (score >= target)
    +--> Defeat (no turns left)
    +--> Continue (start new turn)
```

### Throws Per Turn

- **3 throws per turn** (Balatro-style)
- Each Roll consumes 1 throw
- Held dice keep their values between throws
- Unheld dice get new random values
- Player can end turn early to score current hand

### Holds Per Room

- **3 holds per room** (not per turn!)
- Holding a die costs 1 hold
- Unholding is always free
- Strategic resource across entire combat

### Scoring

- Current: `handTotal * 10` per turn
- Target score varies by domain/room type:
  - Domain multiplier: `1.5^(domainId - 1)`
  - Room multipliers: normal=1.0, elite=1.5, boss=2.0

---

## Dice System

### Die Types

| Die  | Sides | Element | Color   |
|------|-------|---------|---------|
| d4   | 4     | Void    | Purple  |
| d6   | 6     | Earth   | Green   |
| d8   | 8     | Death   | Red     |
| d10  | 10    | Fire    | Orange  |
| d12  | 12    | Ice     | Blue    |
| d20  | 20    | Wind    | Pink    |

### Die Interface

```typescript
interface Die {
  id: string;
  sides: DieSides;      // 4 | 6 | 8 | 10 | 12 | 20
  element: Element;     // Void | Earth | Death | Fire | Ice | Wind
  isHeld: boolean;      // Currently held?
  rollValue: number | null;  // null until rolled
}
```

### Pool Management

- Pool size: 15 dice (configurable)
- Distribution: 2-3 of each die type
- Exhausted dice recycle when pool empties

---

## Combat State

```typescript
interface CombatState {
  phase: CombatPhase;
  grid: GridState;
  entities: EntityMap;

  // Dice system
  pool: DicePool;
  hand: Die[];
  holdsRemaining: number;    // Per room (3 total)
  throwsRemaining: number;   // Per turn (3, resets each turn)

  // Scoring
  targetScore: number;
  currentScore: number;
  turnsRemaining: number;    // Turns left in combat
  turnNumber: number;

  // Tracking
  enemiesSquished: number;
  friendlyHits: number;

  // Config
  domainId: number;
  roomType: 'normal' | 'elite' | 'boss';
}
```

---

## Commands

```typescript
type CombatCommand =
  | { type: 'TOGGLE_HOLD'; dieId: string }  // Hold/unhold a die
  | { type: 'THROW' }                        // Roll unheld dice
  | { type: 'END_TURN' }                     // End turn, score hand
  | { type: 'TARGET_CELL'; row: number; col: number };  // Future
```

---

## UI Components

### CombatHUD

The main combat interface showing:
- **Throws indicator**: 3 dots showing throws remaining this turn
- **Holds indicator**: 3 dots showing holds remaining this room
- **Dice hand**: 5 dice with hold toggles
- **Action toolbar**: Roll | Bless-Curse | End

### CombatTerminal

Inline combat view that connects:
- CombatEngine (game logic)
- GlobeScene (3D visualization)
- CombatHUD (UI controls)

### Visual Feedback

- **Reticle**: Pulsing target on globe during draw/select
- **Meteors**: Projectiles shower down on throw
- **Impacts**: Explosions with shockwaves on hit
- **Dice animations**: Staggered pop-in (150ms apart)

---

## Architecture

```
@ndg/ai-engine (package)
├── combat/
│   ├── combat-engine.ts   # CombatEngine class, state machine
│   ├── dice-hand.ts       # Die types, pool, hand management
│   ├── grid-generator.ts  # Procedural room generation
│   ├── scoring.ts         # Score calculation
│   └── index.ts           # Exports

apps/web
├── games/meteor/components/
│   └── CombatHUD.tsx      # UI for dice + actions
├── screens/play/components/
│   └── CombatTerminal.tsx # Connects engine to visuals
└── contexts/
    └── RunContext.tsx     # Run state management
```

---

## Key Functions

### rollHand (dice-hand.ts)

```typescript
// Only rolls UNHELD dice - held dice keep their values
export function rollHand(hand: Die[], rng: SeededRng): Die[] {
  return hand.map((die) => {
    if (die.isHeld) return die;  // Keep held dice
    return {
      ...die,
      rollValue: rng.roll(`roll-${die.id}-${Date.now()}`, die.sides),
    };
  });
}
```

### handleThrow (combat-engine.ts)

```typescript
private handleThrow(): void {
  if (this.state.throwsRemaining <= 0) return;

  this.state.hand = rollHand(this.state.hand, this.rng);
  this.state.throwsRemaining--;
  this.setPhase('throw');

  setTimeout(() => {
    if (this.state.throwsRemaining > 0) {
      this.setPhase('select');  // More throws available
    } else {
      this.resolveThrow();       // Auto-end turn
    }
  }, 500);
}
```

---

## Future Enhancements

- [ ] Element combos (3+ same element = bonus)
- [ ] Grid-based targeting (aim at specific cells)
- [ ] Entity damage from dice rolls
- [ ] Bless/Curse modifiers
- [ ] Visual feedback for hits on globe
- [ ] Angle-based attack bonuses (rotate globe for advantage)

---

## Testing

To test the combat system:

1. Navigate to `/play`
2. Click "New Run"
3. Combat auto-starts with first zone
4. Try: Roll -> Hold some dice -> Roll again -> End turn

Verify:
- Throws indicator decreases on each Roll
- Held dice keep their values
- Unheld dice get new values
- Score increases on End
- Turn advances after scoring

---

*NEVER DIE GUY - Data is eternal*
