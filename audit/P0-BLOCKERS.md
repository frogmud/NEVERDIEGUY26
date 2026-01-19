# P0 Ship Blockers - Must Fix Before Deployment

These 6 issues can cause crashes, data corruption, or prevent game completion.

---

## P0-001: Score Can Go Negative

**Source:** Combat Audit
**File:** `packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 441

### Problem
Friendly fire penalties can drive score below 0, potentially preventing victory condition.

### Current Code
```typescript
this.state.currentScore += scoreGain; // No floor check
```

### Fix
```typescript
this.state.currentScore = Math.max(0, this.state.currentScore + scoreGain);
```

### Reproduction
1. Start combat with friendly NPCs on grid
2. Repeatedly throw dice at friendly targets
3. Observe score going negative (-500+)
4. Victory condition `currentScore >= targetScore` never triggers

### Status
- [ ] Fix applied
- [ ] Typecheck passed
- [ ] Test harness verified

---

## P0-002: Pool Recycling Happens After Draw

**Source:** Combat Audit
**File:** `packages/ai-engine/src/combat/combat-engine.ts`
**Lines:** 558-567, 595-602

### Problem
Pool exhaustion recycling occurs AFTER drawing new hand, causing incomplete hands (2-3 dice instead of 5).

### Current Code (Line 558)
```typescript
// Draw first
const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
this.state.hand = hand;
this.state.pool = pool;

// Then check if pool needs recycling (TOO LATE)
if (this.state.pool.available.length < MAX_HAND_SIZE - ...) {
  this.state.pool.available = this.rng.shuffle([...this.state.pool.exhausted]);
  this.state.pool.exhausted = [];
}
```

### Fix
Move recycling check BEFORE discardAndDraw:
```typescript
// Check and recycle FIRST
const heldCount = this.state.hand.filter(d => d.isHeld).length;
const needed = MAX_HAND_SIZE - heldCount;
if (this.state.pool.available.length < needed) {
  this.state.pool.available = this.rng.shuffle([
    ...this.state.pool.available,
    ...this.state.pool.exhausted
  ]);
  this.state.pool.exhausted = [];
}

// THEN draw
const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
```

### Reproduction
1. Play through several throws until pool.available is nearly empty
2. Hold 2 dice, throw 3
3. Observe hand only has 2 dice after draw (instead of 5)

### Status
- [ ] Fix applied
- [ ] Typecheck passed
- [ ] Test harness verified

---

## P0-003: Time Multiplier Uncapped

**Source:** Combat Audit
**File:** `packages/ai-engine/src/combat/balance-config.ts`
**Line:** 75

### Problem
No upper bound allows >1.0 multipliers if config is corrupted or edge case triggers.

### Current Code
```typescript
const multiplier = Math.max(minMult, 1.0 - decay);
// No upper bound!
```

### Fix
```typescript
const multiplier = Math.min(1.0, Math.max(minMult, 1.0 - decay));
```

### Reproduction
1. Corrupt config to set negative decay value
2. Observe time multiplier exceeding 1.0
3. Scores become inflated

### Status
- [ ] Fix applied
- [ ] Typecheck passed
- [ ] Test harness verified

---

## P0-004: Invalid Domain IDs Accepted

**Source:** Combat Audit
**File:** `packages/ai-engine/src/combat/combat-engine.ts`
**Line:** 255 (constructor)

### Problem
Domain 0 or 100 cause undefined behavior (enemies with 520 HP, wrong element bonuses).

### Current Code
```typescript
constructor(domainId: number, ...) {
  this.domainId = domainId; // No validation
}
```

### Fix
```typescript
constructor(domainId: number, ...) {
  if (domainId < 1 || domainId > 6) {
    throw new Error(`Invalid domain ID: ${domainId}. Must be 1-6.`);
  }
  this.domainId = domainId;
}
```

### Reproduction
1. Call `new CombatEngine(0, ...)` or `new CombatEngine(100, ...)`
2. Observe undefined behavior in enemy HP calculation
3. Element bonuses reference non-existent domain

### Status
- [ ] Fix applied
- [ ] Typecheck passed
- [ ] Test harness verified

---

## P0-005: Infinite Recursion in Eternal Stream

**Source:** AI Stress Audit
**File:** `packages/ai-engine/src/stream/eternal-stream.ts`
**Lines:** 58-73

### Problem
If 'earth' domain is missing/corrupted, `generateDayStream()` creates infinite recursion and stack overflow.

### Current Code
```typescript
const domain = getDomainContext(domainSlug);
if (!domain) {
  // Infinite recursion if 'earth' is also invalid
  return generateDayStream(seed, 'earth', count, config);
}
```

### Fix
```typescript
export function generateDayStream(
  seed: string,
  domainSlug: string,
  count: number,
  config: StreamConfig = DEFAULT_STREAM_CONFIG,
  _recursionDepth: number = 0
): StreamEntry[] {
  // Prevent infinite recursion
  if (_recursionDepth > 2) {
    console.error(`[generateDayStream] Max recursion depth reached for domain: ${domainSlug}`);
    return [];
  }

  const domain = getDomainContext(domainSlug);
  if (!domain) {
    console.warn(`[generateDayStream] Invalid domain: ${domainSlug}, falling back to earth`);
    return generateDayStream(seed, 'earth', count, config, _recursionDepth + 1);
  }
  // ...
}
```

### Reproduction
1. Remove 'earth' from DOMAIN_CONTEXTS
2. Call `generateDayStream('test', 'invalid-domain', 10)`
3. Stack overflow crash

### Status
- [ ] Fix applied
- [ ] Typecheck passed
- [ ] Test harness verified

---

## P0-006: NaN Propagation from Null Stats

**Source:** AI Stress Audit
**File:** `packages/ai-engine/src/core/relationship.ts`

### Problem
Null stat values propagate NaN through calculations, corrupting game state silently.

### Current Code
```typescript
// No null guards
const newValue = previousValue + change;
```

### Fix
```typescript
function modifyStat(
  relationship: NPCRelationship,
  stat: keyof RelationshipStats,
  change: number,
  ...
): { relationship: NPCRelationship; change: ObservedStatChange } {
  const previousValue = relationship.stats[stat] ?? 0; // Null guard
  const validChange = Number.isFinite(change) ? change : 0; // NaN guard
  const newValue = clampStat(stat, previousValue + validChange);
  // ...
}
```

### Reproduction
1. Create relationship with undefined stat
2. Call `modifyStat(relationship, 'respect', 10)`
3. Result is NaN, propagates through game state

### Status
- [ ] Fix applied
- [ ] Typecheck passed
- [ ] Test harness verified

---

## Quick Fix Checklist

```
[x] P0-001: combat-engine.ts:441 - Add Math.max(0, ...) floor
[x] P0-002: combat-engine.ts:558 - Move recycling before draw
[x] P0-003: balance-config.ts:75 - Add Math.min(1.0, ...) cap
[x] P0-004: combat-engine.ts:255 - Add domain ID validation
[x] P0-005: eternal-stream.ts:58 - Add recursion depth limit
[x] P0-006: relationship.ts - Add null/NaN guards

After fixes:
[x] Run: pnpm typecheck
[ ] Run: npx tsx audit/combat-test-harness.ts
[ ] Run: npx tsx audit/ai-stress-harness.ts
[ ] Run: npx tsx audit/run-tests.ts
```

**ALL P0 FIXES APPLIED - Commit: 6f930a6**

---

## Estimated Time
- P0 fixes: 2-3 hours
- Verification: 1 hour
- Total: 3-4 hours
