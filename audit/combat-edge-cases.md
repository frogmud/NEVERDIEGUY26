# NEVER DIE GUY - Combat System Edge Cases Catalog

**Audit Date:** 2026-01-18
**Auditor:** Claude (Combat Auditor)
**Files Analyzed:** 7 core combat files

## Overview
This document catalogs identified edge cases in the NEVER DIE GUY combat system, including phase transitions, dice mechanics, scoring, and state validation.

---

## P0 - CRITICAL (Game Breaking)

### EC-001: Simultaneous Death (Player + All Enemies)
**Location:** `combat-engine.ts:523-541` (`checkEndConditions()`)
**Description:** If player reaches target score AND runs out of throws in the same action, the victory/defeat state is ambiguous.

**Current Logic:**
```typescript
// Victory: score >= target
if (this.state.currentScore >= this.state.targetScore) {
  this.setPhase('victory');
  return;
}

// Defeat: out of throws
if (this.state.throwsRemaining <= 0) {
  this.setPhase('defeat');
  return;
}
```

**Expected Behavior:** Victory should take precedence (player achieved goal).
**Actual Behavior:** First condition wins (victory), but logic order-dependent.
**Risk:** If conditions are reordered or checked in parallel, could cause inconsistent outcomes.

**Reproduction:**
1. Set targetScore = 500, currentScore = 490
2. Set throwsRemaining = 1
3. Throw dice that score exactly 10 points
4. After throw, throwsRemaining becomes 0 AND score >= target

**Suggested Fix:** Add explicit comment that victory check MUST come first, or add combined condition.

---

### EC-002: Division by Zero in Element Combo Calculation
**Location:** `scoring.ts:238-245` (`calculateElementCombo()`)
**Description:** If dice array is empty, element combo calculation proceeds but should short-circuit.

**Current Logic:**
```typescript
if (maxCount >= 3) {
  const bonusMultiplier = 1 + (maxCount - 2) * 0.25; // 3 = 1.25x, 4 = 1.5x
  return { element: maxElement, diceCount: maxCount, bonusMultiplier };
}
```

**Expected Behavior:** Return early if dice array is empty.
**Actual Behavior:** Currently returns `{ element: null, diceCount: 0, bonusMultiplier: 1.0 }` which is safe, but wastes cycles.
**Risk:** Low (safe fallback exists).

**Reproduction:**
1. Call `calculateElementCombo([])` with empty array
2. Iterates through empty array, returns neutral result

**Suggested Fix:** Add early return: `if (dice.length === 0) return { element: null, diceCount: 0, bonusMultiplier: 1.0 };`

---

### EC-003: Negative Score from Excessive Penalties
**Location:** `combat-engine.ts:428-441` (score calculation in `handleThrow()`)
**Description:** Friendly fire penalties can drive score negative, but no floor validation exists.

**Current Logic:**
```typescript
let scoreGain = 0;
for (const die of thrownDice) {
  const rollValue = die.rollValue || 0;
  const elementBonus = getElementBonus(die.element, this.state.domainId);
  scoreGain += Math.round(rollValue * 10 * elementBonus);
}
scoreGain = Math.round(scoreGain * this.state.multiplier);
scoreGain = Math.round(scoreGain * this.state.timePressureMultiplier);
this.state.currentScore += scoreGain;
```

**Expected Behavior:** currentScore should never go below 0 (or should it? Design decision needed).
**Actual Behavior:** Score can go negative if penalties exceed gains.
**Risk:** Could cause victory condition to never trigger if score goes deeply negative.

**Reproduction:**
1. Set currentScore = 100
2. Hit multiple friendlies with wrong element dice (5x penalty each)
3. Score could drop to -500 or lower

**Suggested Fix:** Either:
- Floor score at 0: `this.state.currentScore = Math.max(0, this.state.currentScore + scoreGain);`
- OR document that negative scores are intentional penalty mechanic

---

### EC-004: Floating Point Precision in Multiplier Stacking
**Location:** `combat-engine.ts:593` (trade multiplier), `balance-config.ts:239`
**Description:** Multiple multipliers stack via `+=` for trades and `*=` for combos, causing floating-point drift.

**Current Logic:**
```typescript
// Trade multiplier (additive)
this.state.multiplier += unheldCount; // 1.0 + 5 = 6.0

// Element combo (multiplicative in scoring.ts)
const bonusMultiplier = 1 + (maxCount - 2) * 0.25; // Can be 1.25, 1.5, 1.75, etc.
```

**Expected Behavior:** Multipliers should accumulate predictably without rounding errors.
**Actual Behavior:** Floating-point arithmetic can cause values like 1.9999999 instead of 2.0.
**Risk:** Edge case where `multiplier === 2.0` check might fail due to precision.

**Reproduction:**
1. Trade 5 dice multiple times: 1.0 + 5 + 5 + 5 = 16.0 (safe)
2. Apply percentage multipliers: 1.25 * 1.5 * 1.75 = 3.28125 (safe)
3. Mix additive and multiplicative: (1.0 + 0.1) * 1.1 * 1.1 = 1.331 vs expected 1.33

**Suggested Fix:** Use `Math.round()` or floor at key checkpoints, or store multipliers as integers (e.g., 125 = 1.25x).

---

## P1 - HIGH (Exploitable Bugs)

### EC-005: Pity Timer Overflow with Held Dice
**Location:** `dice-hand.ts:380-431` (`rollHandWithPity()`)
**Description:** Pity counter increments even if all dice are held (no dice actually rolled).

**Current Logic:**
```typescript
} else if (allLowRolls && newHand.some(d => !d.isHeld)) {
  // Increment if all thrown dice were low
  newPityState.consecutiveLowRolls++;
}
```

**Expected Behavior:** Pity should only increment when dice are actually thrown.
**Actual Behavior:** Check includes `newHand.some(d => !d.isHeld)` which prevents increment if ALL held, but if only 1 die is unheld and rolls low, counter increments.
**Risk:** Player can farm pity by holding 4/5 dice and rerolling 1 die until pity triggers.

**Reproduction:**
1. Hold 4 dice
2. Reroll 1 die repeatedly until it rolls low
3. Pity counter increments each low roll
4. After 10 throws, pity triggers on next roll (guaranteed 60%+ on all dice)

**Suggested Fix:** Only count "all low rolls" if at least 2-3 dice were thrown.

---

### EC-006: Trade with Empty Pool
**Location:** `combat-engine.ts:588-603` (`handleEndTurn()` - trade mechanic)
**Description:** Trading when pool is nearly empty can fail to draw new dice, leaving hand incomplete.

**Current Logic:**
```typescript
const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
this.state.hand = hand;
this.state.pool = pool;

// Recycle exhausted if pool low
if (this.state.pool.available.length < MAX_HAND_SIZE) {
  this.state.pool.available = this.rng.shuffle([...this.state.pool.available, ...this.state.pool.exhausted]);
  this.state.pool.exhausted = [];
}
```

**Expected Behavior:** Trade should always result in full hand (5 dice).
**Actual Behavior:** If pool has 0 available and 0 exhausted, player gets fewer than 5 dice.
**Risk:** Player can end up with 1-2 dice in hand, making victory impossible.

**Reproduction:**
1. Play until pool.available = 2 dice
2. Trade (discard 3 unheld, try to draw 3 new)
3. Only 2 dice available, hand becomes 2 held + 2 new = 4 dice total

**Suggested Fix:** Warn player if trade would result in incomplete hand, or recycle exhausted BEFORE trade.

---

### EC-007: Time Pressure Multiplier Can Exceed 1.0
**Location:** `balance-config.ts:62-76` (`getTimePressureMultiplier()`)
**Description:** During grace period, multiplier is 1.0, but no explicit cap prevents it from going above.

**Current Logic:**
```typescript
if (turnNumber <= config.graceTurns) {
  return 1.0;
}

const decayTurns = turnNumber - config.graceTurns;
const decay = decayTurns * config.decayPerTurn;

return Math.max(config.minMultiplier, 1.0 - decay);
```

**Expected Behavior:** Multiplier should never exceed 1.0 (no time bonus, only penalty).
**Actual Behavior:** Correct implementation, but if `decayPerTurn` is negative (data entry error), multiplier could exceed 1.0.
**Risk:** Low (requires config error), but should be bounds-checked.

**Reproduction:**
1. Set `decayPerTurn = -0.05` (typo or data corruption)
2. Turn 5: decay = 2 * -0.05 = -0.1, multiplier = 1.0 - (-0.1) = 1.1x

**Suggested Fix:** Add cap: `return Math.min(1.0, Math.max(config.minMultiplier, 1.0 - decay));`

---

### EC-008: Element Multiplier on Non-Existent Domain
**Location:** `combat-engine.ts:47-65` (`DOMAIN_ELEMENTS` and `getElementBonus()`)
**Description:** If domainId is 0, 7, or invalid, `DOMAIN_ELEMENTS[domainId]` returns undefined.

**Current Logic:**
```typescript
const DOMAIN_ELEMENTS: Record<number, Element> = {
  1: 'Earth', 2: 'Ice', 3: 'Fire', 4: 'Death', 5: 'Void', 6: 'Wind',
};

function getElementBonus(dieElement: Element, domainId: number): number {
  const domainElement = DOMAIN_ELEMENTS[domainId];
  if (!domainElement) return 1.0; // Safe fallback
  return dieElement === domainElement ? 1.5 : 1.0;
}
```

**Expected Behavior:** Returns 1.0 for invalid domains (correct).
**Actual Behavior:** Safe fallback exists.
**Risk:** Low (safe), but edge case testing needed.

**Reproduction:**
1. Create combat with `domainId = 0`
2. getElementBonus returns 1.0 (neutral)

**Suggested Fix:** Add validation in combat constructor: `if (domainId < 1 || domainId > 6) throw new Error('Invalid domainId')`

---

### EC-009: Discard and Draw Can Violate Hand Size Invariant
**Location:** `dice-hand.ts:220-256` (`discardAndDraw()`)
**Description:** If pool runs dry during discard/draw, hand can be smaller than MAX_HAND_SIZE.

**Current Logic:**
```typescript
const drawCount = MAX_HAND_SIZE - heldDice.length;
const drawn = pool.available.slice(0, drawCount);
const remaining = pool.available.slice(drawCount);

const newDice = drawn.map((d) => ({ ...d, isHeld: false, rollValue: null }));

return {
  hand: [...resetHeld, ...newDice],
  pool: { available: remaining, exhausted: newExhausted },
};
```

**Expected Behavior:** Hand should always be MAX_HAND_SIZE (5 dice).
**Actual Behavior:** If `drawn.length < drawCount`, hand size will be less than 5.
**Risk:** Player disadvantaged with fewer dice, victory becomes harder.

**Reproduction:**
1. Hold 2 dice, discard 3
2. Pool has only 1 die available
3. Hand becomes 2 held + 1 drawn = 3 total (expected 5)

**Suggested Fix:** Recycle exhausted pool BEFORE drawing, or warn player.

---

## P2 - MEDIUM (Balance Issues)

### EC-010: Critical Hit on Friendly Doubles Penalty
**Location:** `scoring.ts:74-140` (`calculateHitScore()`)
**Description:** Friendly fire penalties don't account for critical/fumble multipliers.

**Current Logic:**
```typescript
if (target.type === 'friendly') {
  const isWrongDie = die.element !== target.element;
  const penaltyMult = isWrongDie ? SCORE_MODIFIERS.friendlyWrongDie : SCORE_MODIFIERS.friendlyHit;
  const score = Math.round(baseScore * penaltyMult);
  // Critical/fumble NOT applied to penalties
  return { score, isCritical: false, isFumble: false, ... };
}
```

**Expected Behavior:** Design decision - should crits double penalties?
**Actual Behavior:** Crits/fumbles only apply to enemy hits.
**Risk:** Low (balance issue, not bug), but inconsistent with enemy logic.

**Reproduction:**
1. Roll max value (20 on d20) against friendly
2. Still get base penalty (-100), not doubled (-200)

**Suggested Fix:** Document design decision or apply critMult to penalties.

---

### EC-011: Multiplier Uncapped from Trades
**Location:** `combat-engine.ts:593` (`handleEndTurn()`)
**Description:** Trade multiplier can grow unbounded if player has many trades available.

**Current Logic:**
```typescript
this.state.multiplier += unheldCount; // No cap
```

**Expected Behavior:** Multiplier should be capped (see `COMBAT_CAPS.maxMultiplier = 10` in balance-config).
**Actual Behavior:** No cap enforcement in combat engine.
**Risk:** Player can achieve 50x multiplier with enough trades, breaking balance.

**Reproduction:**
1. Use items to grant +10 bonus trades (total 12 trades)
2. Trade 5 dice each time: 1.0 + 5 + 5 + 5 + ... = 60.0 multiplier
3. One-shot boss with single throw

**Suggested Fix:** Enforce cap: `this.state.multiplier = Math.min(COMBAT_CAPS.maxMultiplier, this.state.multiplier + unheldCount);`

---

### EC-012: Pity Threshold Never Resets Across Combats
**Location:** `dice-hand.ts:337-343` (`createPityState()`)
**Description:** Pity state is created per combat, but if passed between combats, counter persists.

**Current Logic:**
```typescript
export function createPityState(threshold: number = 10): PityState {
  return { consecutiveLowRolls: 0, pityThreshold: threshold, pityTriggered: false };
}
```

**Expected Behavior:** Each combat should start with fresh pity state.
**Actual Behavior:** CombatEngine creates new pity state in constructor (line 291), so this is correct.
**Risk:** Low (working as intended).

**Reproduction:** N/A (not a bug)

**Suggested Fix:** None needed.

---

### EC-013: Element Wheel Asymmetry
**Location:** `scoring.ts:35-58` (`ELEMENT_ORDER` and `getElementMultiplier()`)
**Description:** Element advantage is cyclic (Void > Earth > Death > Fire > Ice > Wind > Void), but no element has inherent advantage.

**Current Logic:**
```typescript
const ELEMENT_ORDER: Element[] = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];

const beatsIndex = (attackerIndex + 1) % ELEMENT_ORDER.length;
if (defenderIndex === beatsIndex) return 1.5;

const weakToIndex = (attackerIndex - 1 + ELEMENT_ORDER.length) % ELEMENT_ORDER.length;
if (defenderIndex === weakToIndex) return 0.5;
```

**Expected Behavior:** Balanced cycle (each element beats 1, loses to 1).
**Actual Behavior:** Correct implementation.
**Risk:** None (working as designed).

**Reproduction:** N/A

**Suggested Fix:** None needed.

---

## P3 - LOW (Polish / Edge Cases)

### EC-014: Lucky Straight Detection with Duplicates
**Location:** `draw-events.ts:110-155` (`detectLuckyStraight()`)
**Description:** Straights use unique values, so rolling [3,3,4,5] doesn't count as straight.

**Current Logic:**
```typescript
const uniqueValues = [...new Set(values)];
// Find longest consecutive sequence in uniqueValues
```

**Expected Behavior:** Duplicates should not break straights (poker-style).
**Actual Behavior:** Duplicates are filtered out before checking.
**Risk:** Low (design decision), but [3,3,4,5] intuitively looks like a straight.

**Reproduction:**
1. Roll d6 x4: [3,3,4,5]
2. uniqueValues = [3,4,5] (length 3)
3. Straight detected (correct behavior, but unintuitive)

**Suggested Fix:** Document that duplicates are allowed (working as intended).

---

### EC-015: High Roller with Single Die
**Location:** `draw-events.ts:161-179` (`detectHighRoller()`)
**Description:** Requires at least 2 dice, so throwing 1 die high never triggers event.

**Current Logic:**
```typescript
if (rolledDice.length < 2) return null;
```

**Expected Behavior:** Design decision - should 1 die count?
**Actual Behavior:** Minimum 2 dice required.
**Risk:** Low (design decision).

**Reproduction:**
1. Hold 4 dice, throw 1
2. Roll max value (20/20)
3. High Roller does not trigger

**Suggested Fix:** Document minimum dice requirement.

---

### EC-016: Cursed Hand Blocked by Positive Events
**Location:** `draw-events.ts:296-300` (`detectDrawEvents()`)
**Description:** Cursed Hand only triggers if NO positive events triggered.

**Current Logic:**
```typescript
// Check for negative event only if no positive events triggered
if (events.length === 0) {
  const cursed = detectCursedHand(hand);
  if (cursed) events.push(cursed);
}
```

**Expected Behavior:** Design decision - should cursed hand cancel other events?
**Actual Behavior:** Cursed hand is mutually exclusive with positive events.
**Risk:** Low (design decision), but player can avoid curse by triggering any positive event.

**Reproduction:**
1. Roll all low values: [1,1,2,2,2] (all below average)
2. But also matches element surge (3x same element)
3. Element surge triggers, cursed hand does not

**Suggested Fix:** Document mutual exclusivity.

---

### EC-017: Grid Generation RNG Determinism
**Location:** `grid-generator.ts:99-136` (`generateGrid()`)
**Description:** Grid is seeded, so same seed = same grid layout every time.

**Current Logic:**
```typescript
const pattern = DOMAIN_PATTERNS[domainId] || DOMAIN_PATTERNS[1];
// Uses rng.random() to place obstacles
```

**Expected Behavior:** Reproducible grids for same seed.
**Actual Behavior:** Correct (seeded RNG used).
**Risk:** None (working as intended).

**Reproduction:**
1. Create two combats with same seed and domainId
2. Grids are identical

**Suggested Fix:** None needed.

---

### EC-018: Entity HP Overflow
**Location:** `combat-engine.ts:210-216` (entity generation)
**Description:** Enemy HP scales with domain: `hp: 20 + grid.domainId * 5`.

**Current Logic:**
```typescript
hp: 20 + grid.domainId * 5,
maxHp: 20 + grid.domainId * 5,
```

**Expected Behavior:** Domain 1 = 25 HP, Domain 6 = 50 HP.
**Actual Behavior:** Correct.
**Risk:** None, but no upper bound check (what if domainId = 100?).

**Reproduction:**
1. Create combat with domainId = 100
2. Enemy HP = 20 + 100*5 = 520 HP

**Suggested Fix:** Clamp domainId to valid range (1-6) in constructor.

---

### EC-019: Draw Events with No Rolled Dice
**Location:** `draw-events.ts:110+` (all detection functions)
**Description:** All events filter by `d.rollValue !== null`, so held dice are excluded.

**Current Logic:**
```typescript
const rolledDice = dice.filter(d => d.rollValue !== null);
if (rolledDice.length < 3) return null; // Most events need 3+ dice
```

**Expected Behavior:** Events should only consider thrown dice.
**Actual Behavior:** Correct.
**Risk:** None (working as intended).

**Reproduction:**
1. Hold all 5 dice (no throws)
2. No draw events trigger

**Suggested Fix:** None needed.

---

### EC-020: Pool Exhaustion During Combat
**Location:** `combat-engine.ts:563-567` (pool recycling)
**Description:** If pool runs out during combat, exhausted dice are recycled.

**Current Logic:**
```typescript
if (this.state.pool.available.length < MAX_HAND_SIZE - this.state.hand.filter(d => d.isHeld).length) {
  this.state.pool.available = this.rng.shuffle([...this.state.pool.exhausted]);
  this.state.pool.exhausted = [];
}
```

**Expected Behavior:** Exhausted dice recycled when needed.
**Actual Behavior:** Correct, but check happens AFTER draw, not before.
**Risk:** If pool is empty before draw, hand will be incomplete (see EC-009).

**Reproduction:**
1. pool.available = 0, pool.exhausted = 5
2. Try to draw 5 dice
3. Draw fails (0 available), THEN pool recycles
4. Hand is empty instead of 5 dice

**Suggested Fix:** Check and recycle BEFORE drawing: move recycling logic before `discardAndDraw()`.

---

## Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0       | 4     | Critical bugs that can break game flow or cause undefined behavior |
| P1       | 5     | Exploitable bugs that affect balance or player experience |
| P2       | 3     | Balance issues or inconsistencies that should be addressed |
| P3       | 8     | Edge cases and polish items, mostly working as intended |

**Total Edge Cases Identified:** 20

---

## Recommendations

1. **Immediate Fixes (P0):**
   - Add score floor validation (EC-003)
   - Document victory precedence over defeat (EC-001)
   - Validate domainId range in constructor (EC-008)

2. **High Priority (P1):**
   - Fix pool recycling order (EC-020, EC-009)
   - Enforce multiplier cap from COMBAT_CAPS (EC-011)
   - Prevent pity farming with held dice (EC-005)

3. **Balance Review (P2):**
   - Decide if critical hits should affect penalties (EC-010)
   - Cap time pressure multiplier explicitly (EC-007)

4. **Documentation (P3):**
   - Document draw event behavior (EC-014, EC-015, EC-016)
   - Clarify held dice exclusion from events (EC-019)

---

**End of Report**
