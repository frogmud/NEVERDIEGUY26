# NEVER DIE GUY - Testing Context

You're helping QA a browser-based roguelike dice game. Balatro meets globe-smashing chaos.

## Game Structure

**Arena Mode (Solo Roguelike)**
- 6 Domains x 3 Rooms each = 18 total encounters
- Each room: hit target score using limited throws
- Shop between rooms to spend gold on items

**Core Loop**
1. Start with 5 dice (hand) + 3 throws + 3 trades per room
2. Select dice to throw (unheld) or keep (held)
3. THROW: Roll unheld dice, add to score (roll value x 10 x element bonus x multiplier)
4. TRADE: Swap unheld dice for new ones, add count to multiplier
5. Hit target score = Victory, 0 throws remaining with score < target = Defeat

## Key Files Included

| File | Purpose |
|------|---------|
| `combat-engine.ts` | Core combat logic, throw/trade mechanics, win/lose detection |
| `RunContext.tsx` | React state machine, game phases, progression |
| `gameConfig.ts` | Domain definitions, scoring constants |
| `domains.ts` | 6 domain configs (Earth, Frost Reach, Infernus, Shadow Keep, Null Providence, Aberrant) |
| `loadouts.ts` | Starting dice configurations |
| `balance-config.ts` | Economy tuning (prices, rewards, multipliers) |

## Win/Lose Conditions

**Victory**: `currentScore >= targetScore`
**Defeat**: `throwsRemaining <= 0` AND score not met

Note: Trades don't add to score directly - only throws do. So 0 throws = game over regardless of trades remaining.

## Scoring Formula

```
scoreGain = sum(rollValue * 10 * elementBonus) * multiplier
```

- Element bonus: 1.5x if die element matches domain
- Multiplier: Starts at 1, increases by traded dice count per trade
- Multiplier resets to 1 after each throw

## Economy

- Gold earned per room: `floor(score / 10) + (tier * 10)`
- Target score per room: `tier * 1000` (tier 1 = 1000, tier 2 = 2000, etc.)
- Shop items: Priced by rarity + tier multiplier

## Test Categories Needed

1. **Score calculations** - Verify dice roll -> score math
2. **Win/lose conditions** - Target reached = victory, throws exhausted = defeat
3. **Gold rewards** - Consistent earnings per room/domain
4. **Item effects** - Bonuses apply correctly
5. **Progression** - Domain/room transitions work
6. **Edge cases** - 0 throws with exact score, trading all dice, etc.

## Current Known Issues

- [ ] Continue after final victory (domain 6) may not trigger properly
- [ ] Telemetry logging not yet implemented
- [ ] Need timer with pressure decay multiplier

## Domains

1. Earth (Neutral) - Starting zone
2. Frost Reach (Ice)
3. Infernus (Fire)
4. Shadow Keep (Death)
5. Null Providence (Void)
6. Aberrant (Wind)

Each domain has 3 rooms (events) to clear before advancing.
