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
- Phaser canvas: 3D sphere with NPCs
- Controls: Dice selection, Summon, Tribute, Skip
- Sidebar: Score, goal, summons remaining, roll history

**Core Mechanics:**
- Select dice from inventory
- **Summon**: Throw dice at sphere, damage NPCs
- **Tribute**: Boost multiplier (costs dice)
- Combo detection for bonus points
- Win: Reach score goal
- Lose: Exhaust all summons

### Play/Hold Mechanic (New)

**Poker-Style Dice Holding:**
```
[Dice in hand: d4 d6 d8 d12 d20]
         |
[Toggle which to hold]
         |
[THROW] -> Throw non-held dice
         |
[Results shown]
         |
[PLAY] -> Lock in score, end turn
   or
[HOLD] -> Keep selected dice, draw replacements
```

**State:**
```typescript
interface DiceHand {
  dice: Die[];           // Current 5-die hand
  held: boolean[];       // Toggle state per die
  thrown: Die[];         // Results of last throw
  throwsRemaining: number; // Limit per room (default 3)
}
```

**Actions:**
- `toggleHold(index)` - Mark die to keep
- `throwDice()` - Throw non-held dice at sphere
- `playHand()` - Lock in current score
- `holdAndDraw()` - Keep held, draw new dice for rest

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

- `/apps/web/src/contexts/RunContext.tsx` - State machine
- `/apps/web/src/games/meteor/scenes/MeteorScene.ts` - Combat logic
- `/apps/web/src/games/meteor/components/ControlsPanel.tsx` - Dice controls
- `/apps/web/src/data/domains.ts` - Domain configs
- `/apps/web/src/games/meteor/gameConfig.ts` - Event templates
