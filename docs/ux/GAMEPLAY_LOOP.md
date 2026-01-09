# Gameplay Loop

Complete flow documentation for NEVER DIE GUY's roguelike run structure.

## Overview

A single run consists of:
- **6 Domains** (Meadow, Forest, Caverns, Ruins, Shadow Realm, Abyss)
- **3 Zones per Domain** (stable, elite, anomaly)
- **18 total encounters** to complete a full run

## Round 0: Pre-Game

### Entry Points
1. Home screen -> "Play" button
2. Direct navigation to `/play`
3. Resume from saved run (localStorage)

### Lobby Phase
```
centerPanel: 'globe'
phase: 'event_select'
```

**UI State:**
- Globe: Auto-rotating, no zones highlighted
- Sidebar: "New Run" and "Continue" buttons
- Tabs: Game, Bag, Settings

**Actions:**
- **New Run**: Generates first domain, transitions to Zone Select
- **Continue**: Loads saved run state from localStorage

## Round 1-N: Gameplay Loop

### Zone Select Phase
```
centerPanel: 'globe'
phase: 'playing'
```

**UI State:**
- Globe: 3 zones visible with markers
- Sidebar: Zone list (GameTabLaunch), each showing:
  - Zone type icon (stable/elite/anomaly)
  - Tier indicator (T1-T4)
  - Time of day (Afternoon/Night/Dawn)

**Actions:**
- Click zone marker or list item -> Zone highlighted
- "Launch" button -> Transition to Combat

**Zone Generation:**
- Fibonacci sphere distribution for even spacing
- Zone types assigned by position: stable (1st) -> elite (2nd) -> anomaly (3rd/boss)
- Skip penalty: +20% boss difficulty per skipped zone

### Combat Phase
```
centerPanel: 'combat'
```

**UI State:**
- CombatTerminal: 3D globe with guardians, HUD reticle
- Top bar: Turn number, current score / target score, turns remaining
- Progress bar: Domain/room/score/gold (at top of play area)
- Controls: Dice hand, THROW button, TRADE button, hold all toggle
- Sidebar: Score, multiplier, throws/trades remaining, combat feed

**Core Mechanics:**
- 5 dice drawn each turn (d4, d6, d8, d10, d12, d20)
- **THROW**: Throw unheld dice at globe, score points per die value
- **TRADE**: Sacrifice unheld dice for multiplier boost (+1x per die)
- **Guardians**: Orbital enemies that absorb matching dice types
- Win: Reach target score before turns run out
- Lose: Exhaust all turns without reaching target

### Throw/Trade Mechanic

**Balatro-Style Combat:**
```
[Dice in hand: d4 d6 d8 d12 d20]
         |
[Toggle which to hold (click dice)]
         |
[THROW] -> Throw unheld dice at globe
         |    - Meteors spawn and hit reticle
         |    - Score += sum of dice values * multiplier
         |    - Matching dice destroy guardians instead
         |
[TRADE] -> Sacrifice unheld dice for multiplier
         |    - Multiplier += number of dice traded
         |    - Dice removed from hand
         |
[Turn ends] -> New dice drawn, repeat
```

**State (CombatEngine):**
```typescript
interface CombatState {
  hand: Die[];              // Current 5-die hand
  throwsRemaining: number;  // Per turn (default 3)
  holdsRemaining: number;   // Trades available (default 3)
  currentScore: number;     // Accumulated this room
  targetScore: number;      // Goal to beat
  multiplier: number;       // Score multiplier
  turnsRemaining: number;   // Turns left in room
  phase: 'draw' | 'select' | 'throw' | 'resolve' | 'victory' | 'defeat';
}
```

**Actions:**
- `TOGGLE_HOLD(dieId)` - Mark die to keep/throw
- `HOLD_ALL` / `HOLD_NONE` - Bulk selection
- `THROW` - Throw unheld dice, spawn meteors
- `END_TURN` - Trade unheld dice for multiplier

### Guardians

Guardians are orbital enemies that protect the planet:
- 0-3 guardians spawn per room
- Each has a die type (d4, d6, d8, etc.)
- Throwing a matching die destroys the guardian (no planet damage)
- Unmatched dice hit the planet and score points
- HUD shows which dice target guardians vs planet

### Sound & Visual Feedback

**Sound Effects (SoundContext):**
- `playDiceRoll()` - On throw
- `playImpact()` - On meteor hit
- `playVictory()` - On room complete
- `playDefeat()` - On game over

**Visual Effects:**
- Meteor trails with die-colored streaks
- Impact explosions on globe
- Damage flash at reticle (localized radial gradient)
- Floating damage numbers (+score)
- Victory explosion (nuclear effect)

### Summary Phase
```
centerPanel: 'summary'
```

**UI State:**
- Score earned this room
- Gold earned
- Domain progress (e.g., "Zone 2/3")

**Actions:**
- "Continue" -> Transition to Shop

### Shop Phase
```
centerPanel: 'shop'
```

**UI State:**
- Tier-filtered items from requisition pool
- Gold balance
- Inventory preview

**Modifiers:**
- `favorTokens`: Discount on purchases
- `luckySynergy`: Better rarity chances

**Actions:**
- Purchase items
- "Continue" -> Next phase based on progress

## Progression Rules

### After Shop Continue:

| Condition | Next Phase |
|-----------|------------|
| Zones remain in domain | Zone Select (same domain) |
| Domain cleared (3/3 zones) | Generate next domain -> Zone Select |
| Final domain cleared (6/6) | Game Over (win) |

### Domain Scaling

| Domain | Base Score Goal | Zone 1 (60%) | Zone 2 (100%) | Boss (150%) |
|--------|-----------------|--------------|---------------|-------------|
| Meadow | 3,000 | 1,800 | 3,000 | 4,500 |
| Forest | 4,000 | 2,400 | 4,000 | 6,000 |
| Caverns | 5,000 | 3,000 | 5,000 | 7,500 |
| Ruins | 6,500 | 3,900 | 6,500 | 9,750 |
| Shadow Realm | 8,000 | 4,800 | 8,000 | 12,000 |
| Abyss | 10,000 | 6,000 | 10,000 | 15,000 |

## End States

### Win
- Complete all 6 domains
- GameOverModal shows: Total score, loot summary, run stats
- Return to Home

### Lose
- Exhaust all summons in combat
- GameOverModal shows: Progress reached, final score
- Return to Home

## Auto-Save

Run state saves to localStorage when:
- `phase = 'playing'`
- `phase = 'shop'`

Saved fields:
- `threadId`, `currentDomain`, `roomNumber`
- `gold`, `totalScore`, `tier`
- `inventory`, `runStats`

## Files

**State Management:**
- `/apps/web/src/contexts/RunContext.tsx` - Game state machine
- `/apps/web/src/contexts/SoundContext.tsx` - Audio system
- `/apps/web/src/contexts/GameSettingsContext.tsx` - Persistent settings

**Combat:**
- `/apps/web/src/screens/play/components/CombatTerminal.tsx` - Main combat UI
- `/packages/ai-engine/src/combat/combat-engine.ts` - Combat logic
- `/apps/web/src/games/meteor/components/CombatHUD.tsx` - Dice controls

**Globe & Visuals:**
- `/apps/web/src/games/globe-meteor/GlobeScene.tsx` - 3D scene
- `/apps/web/src/games/globe-meteor/components/MeteorShower.tsx` - Meteor rendering
- `/apps/web/src/games/globe-meteor/components/Guardian.tsx` - Guardian enemies

**Data:**
- `/apps/web/src/data/domains.ts` - Domain configs
- `/apps/web/src/data/npc-chat/triggers.ts` - NPC dialogue triggers
- `/apps/web/src/games/meteor/gameConfig.ts` - Event templates
