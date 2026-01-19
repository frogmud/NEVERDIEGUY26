# NEVER DIE GUY - Combat Audit Findings Report

**Audit Date:** 2026-01-18
**Auditor:** Claude (Combat Auditor)
**Scope:** Combat engine, dice mechanics, scoring, and grid systems

---

## Executive Summary

Audited 7 core combat system files totaling ~2,800 lines of TypeScript. Identified **20 edge cases** across 4 priority levels:

| Priority | Count | Description |
|----------|-------|-------------|
| **P0 (Critical)** | 4 | Game-breaking bugs requiring immediate fixes |
| **P1 (High)** | 5 | Exploitable balance issues or player-impacting bugs |
| **P2 (Medium)** | 3 | Inconsistencies and design decisions needing review |
| **P3 (Low)** | 8 | Polish items and edge cases (mostly working as intended) |

**Overall System Health:** Good architecture with solid state machine design, but several boundary conditions lack validation. Most issues are fixable with minor validation additions.

---

## Critical Findings (P0)

### FINDING-001: Score Can Go Negative
**Severity:** P0 - Critical
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 441

**Description:**
Current score can become negative due to friendly fire penalties, with no floor validation.

**Current Code:**
```typescript
this.state.currentScore += scoreGain; // No floor check
```

**Issue:**
- Friendly hits apply -100 to -250 point penalties (SCORE_MODIFIERS.friendlyHit, friendlyWrongDie)
- Multiple bad throws can drive score deeply negative (-500+)
- Victory condition `currentScore >= targetScore` may never trigger

**Impact:**
Player can become stuck in unwinnable combat if score goes too negative.

**Suggested Fix:**
```typescript
this.state.currentScore = Math.max(0, this.state.currentScore + scoreGain);
```

**Alternative:**
Document that negative scores are intentional punishment mechanic (but add UI warning).

---

### FINDING-002: Pool Recycling Happens After Draw
**Severity:** P0 - Critical
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Lines:** 558-567, 595-602

**Description:**
Pool exhaustion recycling occurs AFTER drawing new hand, causing incomplete hands.

**Current Code:**
```typescript
// Line 558: Draw first
const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
this.state.hand = hand;
this.state.pool = pool;

// Line 563: Then check if pool needs recycling (TOO LATE)
if (this.state.pool.available.length < MAX_HAND_SIZE - ...) {
  this.state.pool.available = this.rng.shuffle([...this.state.pool.exhausted]);
  this.state.pool.exhausted = [];
}
```

**Issue:**
- If pool.available = 0 and pool.exhausted = 10, draw fails to fill hand
- Recycling happens AFTER draw, so player gets 0-2 dice instead of 5
- Same bug exists in trade mechanic (line 595-602)

**Impact:**
Player can end up with incomplete hand (2-3 dice instead of 5), severely disadvantaging them.

**Test Case:**
```typescript
pool = { available: [], exhausted: [d1, d2, d3, d4, d5] }
hand = [held1, held2, unheld1, unheld2, unheld3]
// After discardAndDraw: hand = [held1, held2] (only 2 dice!)
```

**Suggested Fix:**
Move recycling check BEFORE discardAndDraw:
```typescript
// Check and recycle FIRST
if (this.state.pool.available.length < MAX_HAND_SIZE - heldCount) {
  this.state.pool.available = this.rng.shuffle([
    ...this.state.pool.available,
    ...this.state.pool.exhausted
  ]);
  this.state.pool.exhausted = [];
}

// Then draw
const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
```

---

### FINDING-003: Time Pressure Multiplier Uncapped
**Severity:** P0 - Critical (if config corrupted)
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/balance-config.ts`
**Line:** 75

**Description:**
Time pressure multiplier has no upper bound check, allowing values > 1.0 if config is corrupted.

**Current Code:**
```typescript
return Math.max(config.minMultiplier, 1.0 - decay);
```

**Issue:**
- If `decayPerTurn` is negative (data entry error), decay becomes negative
- `1.0 - (-0.15)` = 1.15x multiplier (should be capped at 1.0)
- No upper bound validation

**Impact:**
Config corruption or malicious data injection could give players 2x-10x time bonuses.

**Test Case:**
```typescript
decayPerTurn = -0.05 (corrupted)
turnNumber = 5
decay = (5 - 2) * -0.05 = -0.15
multiplier = 1.0 - (-0.15) = 1.15 (BUG)
```

**Suggested Fix:**
```typescript
return Math.min(1.0, Math.max(config.minMultiplier, 1.0 - decay));
```

---

### FINDING-004: Invalid Domain ID Allowed
**Severity:** P0 - Critical
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 255 (constructor)

**Description:**
Combat engine accepts any domain ID without validation, leading to undefined behavior.

**Current Code:**
```typescript
// Line 61: DOMAIN_ELEMENTS only defines 1-6
const DOMAIN_ELEMENTS: Record<number, Element> = {
  1: 'Earth', 2: 'Ice', 3: 'Fire', 4: 'Death', 5: 'Void', 6: 'Wind',
};

// Line 305: Fallback used, but no constructor validation
domainElement: DOMAIN_ELEMENTS[config.domainId] || 'Earth',
```

**Issue:**
- Domain IDs 0, 7-100, negative values all accepted
- Fallback element ('Earth') used, but creates inconsistent game state
- Grid generation, entity scaling all use unchecked domainId

**Impact:**
- Domain 100: Enemy HP = 20 + 100*5 = 520 HP (impossibly hard)
- Domain 0: Uses fallback 'Earth', but breaks UI assumptions

**Suggested Fix:**
```typescript
constructor(config: CombatConfig, rng: SeededRng) {
  // Validate domain ID
  if (config.domainId < 1 || config.domainId > 6) {
    throw new Error(`Invalid domainId: ${config.domainId}. Must be 1-6.`);
  }
  // ... rest of constructor
}
```

---

## High Priority Findings (P1)

### FINDING-005: Pity Timer Farming Exploit
**Severity:** P1 - High
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/dice-hand.ts`
**Line:** 425

**Description:**
Pity timer increments even when only 1 die is thrown, enabling farming.

**Current Code:**
```typescript
} else if (allLowRolls && newHand.some(d => !d.isHeld)) {
  // Increment if all thrown dice were low
  newPityState.consecutiveLowRolls++;
}
```

**Issue:**
- Player can hold 4 dice, throw 1 die repeatedly
- Each low roll on the single die increments pity counter
- After 10 low rolls, all 5 dice get 60%+ boost on next throw
- Allows guaranteed high rolls by gaming the system

**Exploit:**
```
Turn 1: Hold 4 dice, throw 1 (rolls 1/6) -> pity++
Turn 2: Hold 4 dice, throw 1 (rolls 2/6) -> pity++
...
Turn 10: pity triggers, all 5 dice boosted to 60%+ (even held ones?)
```

**Impact:**
Players can farm guaranteed good rolls, breaking intended risk/reward balance.

**Suggested Fix:**
Only increment pity if at least 3+ dice were thrown:
```typescript
const thrownCount = newHand.filter(d => !d.isHeld && d.rollValue !== null).length;

if (allLowRolls && thrownCount >= 3) {
  newPityState.consecutiveLowRolls++;
}
```

---

### FINDING-006: Multiplier Cap Not Enforced
**Severity:** P1 - High
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 593

**Description:**
Trade multiplier can grow unbounded despite COMBAT_CAPS.maxMultiplier existing.

**Current Code:**
```typescript
// Line 593: No cap enforcement
this.state.multiplier += unheldCount;

// balance-config.ts defines cap:
export const COMBAT_CAPS = {
  maxMultiplier: 10,
  // ...
};
```

**Issue:**
- Player with +10 bonus trades (from items) can trade 12 times
- Trading 5 dice each: 1.0 + (5 * 12) = 61x multiplier
- COMBAT_CAPS.maxMultiplier = 10 is defined but never checked

**Impact:**
Player can one-shot bosses with 60x+ multipliers, trivializing combat.

**Test Case:**
```
Base trades: 2
Bonus trades from items: +10
Total: 12 trades

Trade 5 dice each time: 1 + 5 + 5 + ... (12x) = 61x multiplier
Target score 2000 / 61 = 33 raw points needed (trivial)
```

**Suggested Fix:**
```typescript
import { COMBAT_CAPS } from './balance-config';

// In handleEndTurn:
this.state.multiplier = Math.min(
  COMBAT_CAPS.maxMultiplier,
  this.state.multiplier + unheldCount
);
```

---

### FINDING-007: Element Bonus Domain Check Missing
**Severity:** P1 - Medium
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 61-64

**Description:**
Element bonus function returns 1.0 for undefined domains but doesn't validate range.

**Current Code:**
```typescript
function getElementBonus(dieElement: Element, domainId: number): number {
  const domainElement = DOMAIN_ELEMENTS[domainId];
  if (!domainElement) return 1.0; // Safe fallback
  return dieElement === domainElement ? 1.5 : 1.0;
}
```

**Issue:**
- Safe fallback exists (returns 1.0)
- But allows invalid domains to silently proceed
- Masks configuration errors

**Impact:**
Players in "domain 0" or "domain 99" get neutral bonuses, hiding bugs.

**Suggested Fix:**
Add validation in getElementBonus or reject in constructor (see FINDING-004).

---

### FINDING-008: Draw Events with Zero Dice
**Severity:** P1 - Low
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/draw-events.ts`
**Lines:** 111, 163, 186, 224

**Description:**
All draw event detections filter by `rollValue !== null` but don't short-circuit on empty arrays.

**Current Code:**
```typescript
function detectLuckyStraight(dice: Die[]): DrawEvent | null {
  const rolledDice = dice.filter(d => d.rollValue !== null);
  if (rolledDice.length < 3) return null; // OK
  // ... rest of logic
}
```

**Issue:**
- If all dice are held (rollValue = null for unheld), rolledDice = []
- Code checks `length < 3` so it returns null (safe)
- But wastes cycles iterating empty arrays

**Impact:**
Minor performance waste, no functional bug.

**Suggested Fix:**
Add early return at start of detectDrawEvents:
```typescript
export function detectDrawEvents(hand: Die[]): DrawEvent[] {
  const rolledDice = hand.filter(d => d.rollValue !== null);
  if (rolledDice.length === 0) return [];

  // ... rest of function
}
```

---

### FINDING-009: Friendly Hit Critical Inconsistency
**Severity:** P1 - Design Decision
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/scoring.ts`
**Line:** 109-128

**Description:**
Critical/fumble mechanics apply to enemy hits but not friendly penalties.

**Current Code:**
```typescript
// Enemy hit: applies critMult
const score = Math.round(baseScore * elementMult * critMult * (rollValue / die.sides));

// Friendly hit: NO critMult
const score = Math.round(baseScore * penaltyMult);
```

**Issue:**
- Rolling 20/20 on enemy: 2x damage (critical)
- Rolling 20/20 on friendly: base penalty (no critical)
- Inconsistent - why don't crits double penalties?

**Impact:**
Design inconsistency. Should high rolls on friendlies hurt more?

**Suggested Fix:**
Either:
1. Apply critMult to penalties: `score = Math.round(baseScore * penaltyMult * critMult);`
2. Document that crits only affect enemies (current behavior is intentional)

**Recommendation:** Document as intentional (crits are "good luck", shouldn't punish player harder).

---

## Medium Priority Findings (P2)

### FINDING-010: Floating Point Multiplier Precision
**Severity:** P2 - Medium
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Lines:** 436-439

**Description:**
Score calculations use chained `Math.round()` which can accumulate rounding errors.

**Current Code:**
```typescript
scoreGain = Math.round(scoreGain * this.state.multiplier);
scoreGain = Math.round(scoreGain * this.state.timePressureMultiplier);
```

**Issue:**
- `Math.round(Math.round(100 * 1.25) * 1.5)` != `Math.round(100 * 1.25 * 1.5)`
- First: round(125 * 1.5) = round(187.5) = 188
- Second: round(100 * 1.875) = round(187.5) = 188
- In this case they match, but edge cases exist

**Impact:**
Players may lose 1-2 points per throw due to rounding (minimal but feels unfair).

**Suggested Fix:**
Apply all multipliers first, then round once:
```typescript
const totalMultiplier = this.state.multiplier * this.state.timePressureMultiplier;
scoreGain = Math.round(scoreGain * totalMultiplier);
```

---

### FINDING-011: Simultaneous Victory/Defeat Order-Dependent
**Severity:** P2 - Medium
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Lines:** 527-536

**Description:**
Victory and defeat conditions are checked sequentially, making order critical.

**Current Code:**
```typescript
// Line 527: Victory first
if (this.state.currentScore >= this.state.targetScore) {
  this.setPhase('victory');
  return;
}

// Line 533: Defeat second
if (this.state.throwsRemaining <= 0) {
  this.setPhase('defeat');
  return;
}
```

**Issue:**
- If both conditions are true (score met, throws exhausted), victory wins
- Order matters - if defeat check came first, player would lose
- No explicit comment documenting this precedence

**Impact:**
Works correctly, but fragile. Refactoring could break precedence.

**Suggested Fix:**
Add comment documenting precedence:
```typescript
// IMPORTANT: Victory check MUST come before defeat check
// If player reaches target on final throw, they win
if (this.state.currentScore >= this.state.targetScore) {
  this.setPhase('victory');
  return;
}
```

**Alternative:** Explicit combined check:
```typescript
const reachedTarget = this.state.currentScore >= this.state.targetScore;
const outOfThrows = this.state.throwsRemaining <= 0;

if (reachedTarget && outOfThrows) {
  this.setPhase('victory'); // Explicit precedence
  return;
}
if (reachedTarget) {
  this.setPhase('victory');
  return;
}
if (outOfThrows) {
  this.setPhase('defeat');
  return;
}
```

---

### FINDING-012: Entity HP Scaling Unbounded
**Severity:** P2 - Low
**File:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 210-211

**Description:**
Enemy HP scales with domain ID without upper bound validation.

**Current Code:**
```typescript
hp: 20 + grid.domainId * 5,
maxHp: 20 + grid.domainId * 5,
```

**Issue:**
- Domain 1: 25 HP
- Domain 6: 50 HP
- Domain 100: 520 HP (if invalid domain allowed)
- No cap on HP

**Impact:**
Related to FINDING-004. If invalid domains are allowed, enemy HP explodes.

**Suggested Fix:**
Validate domainId in constructor (FINDING-004 fix handles this).

---

## Low Priority Findings (P3)

### FINDING-013 to FINDING-020: Working as Intended

The following edge cases were identified but are **working as designed**:

| Finding | Description | Status |
|---------|-------------|--------|
| EC-012 | Pity state reset per combat | Correct - new pity created each combat |
| EC-013 | Element wheel symmetry | Correct - balanced 6-element cycle |
| EC-014 | Lucky straight with duplicates | Correct - duplicates filtered before check |
| EC-015 | High roller minimum 2 dice | Correct - design decision documented |
| EC-016 | Cursed hand blocked by positive events | Correct - prevents double punishment |
| EC-017 | Grid RNG determinism | Correct - seeded RNG for reproducibility |
| EC-019 | Draw events exclude held dice | Correct - only thrown dice trigger events |
| EC-002 | Element combo with empty array | Correct - safe fallback returns 1.0 |

**Recommendation:** Add inline comments documenting these design decisions.

---

## Summary Table

| Priority | Findings | Requires Code Fix | Requires Documentation | Working as Intended |
|----------|----------|-------------------|------------------------|---------------------|
| P0       | 4        | 4                 | 0                      | 0                   |
| P1       | 5        | 4                 | 1                      | 0                   |
| P2       | 3        | 2                 | 1                      | 0                   |
| P3       | 8        | 0                 | 8                      | 8                   |
| **Total** | **20**   | **10**            | **10**                 | **8**               |

---

## Recommended Action Plan

### Immediate (This Sprint)
1. Fix FINDING-002: Move pool recycling before draw (P0)
2. Fix FINDING-001: Add score floor validation (P0)
3. Fix FINDING-004: Validate domainId in constructor (P0)
4. Fix FINDING-003: Cap time pressure multiplier (P0)

### High Priority (Next Sprint)
5. Fix FINDING-006: Enforce multiplier cap from COMBAT_CAPS (P1)
6. Fix FINDING-005: Prevent pity farming with held dice (P1)
7. Review FINDING-009: Document critical hit design decision (P1)

### Medium Priority (Backlog)
8. Fix FINDING-010: Optimize floating-point rounding (P2)
9. Document FINDING-011: Victory precedence in comments (P2)

### Low Priority (Documentation)
10. Add inline comments for EC-012 through EC-019 (P3)

---

## Test Coverage Recommendations

Create integration tests for:
1. Simultaneous victory/defeat scenarios
2. Pool exhaustion and recycling timing
3. Multiplier cap enforcement with extreme values
4. Invalid domain ID rejection
5. Negative score boundary
6. Pity timer with varying held dice counts

---

**End of Report**

Generated by Claude Combat Auditor
Date: 2026-01-18
