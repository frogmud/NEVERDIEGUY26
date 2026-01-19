# Combat System Audit - NEVER DIE GUY

**Audit Date:** 2026-01-18
**Status:** Complete
**Auditor:** Claude (Combat Auditor)

## Overview

This directory contains a comprehensive audit of the NEVER DIE GUY combat system, focusing on edge cases, bugs, and potential exploits in the dice roguelike mechanics.

## Files

### 1. `combat-edge-cases.md`
**Catalog of 20 identified edge cases** organized by priority (P0-P3):
- P0 (Critical): 4 game-breaking bugs
- P1 (High): 5 exploitable balance issues
- P2 (Medium): 3 design inconsistencies
- P3 (Low): 8 polish items (mostly working as intended)

Each edge case includes:
- Description and expected vs actual behavior
- Risk level assessment
- Reproduction steps
- Suggested fixes

### 2. `combat-test-harness.ts`
**Automated test suite** that programmatically validates each edge case:
- Uses seeded RNG for deterministic testing
- Tests boundary values, state transitions, and validation logic
- Outputs pass/fail for each test with color-coded results
- Exit code 0 (all pass) or 1 (failures detected)

**Run with:**
```bash
npx ts-node audit/combat-test-harness.ts
```

### 3. `combat-findings.md`
**Executive summary** of bugs and issues with:
- Detailed descriptions and file/line locations
- Code snippets showing current implementation
- Impact assessment and exploitation scenarios
- Suggested fixes with code examples
- Prioritized action plan for fixes

---

## Quick Reference: Critical Issues

### P0 - Fix Immediately

| Finding | File | Line | Issue |
|---------|------|------|-------|
| FINDING-001 | `combat-engine.ts` | 441 | Score can go negative |
| FINDING-002 | `combat-engine.ts` | 558-567 | Pool recycles after draw (too late) |
| FINDING-003 | `balance-config.ts` | 75 | Time multiplier uncapped |
| FINDING-004 | `combat-engine.ts` | 255 | Invalid domain IDs accepted |

### P1 - Fix This Sprint

| Finding | File | Line | Issue |
|---------|------|------|-------|
| FINDING-005 | `dice-hand.ts` | 425 | Pity timer farming exploit |
| FINDING-006 | `combat-engine.ts` | 593 | Multiplier cap not enforced |

---

## Files Analyzed

| File | LOC | Purpose |
|------|-----|---------|
| `combat-engine.ts` | 668 | Main combat state machine |
| `balance-config.ts` | 517 | Time pressure, heat, caps |
| `scoring.ts` | 349 | Element wheel, hit resolution |
| `dice-hand.ts` | 432 | Dice mechanics, pity system |
| `dice-bag.ts` | 498 | Persistent dice collection |
| `grid-generator.ts` | 323 | Room generation |
| `draw-events.ts` | 332 | Special pattern detection |

**Total:** ~3,119 lines analyzed

---

## Combat System Architecture

### Phase Flow
```
init → draw → select → throw → resolve → enemy_turn → check_end → (victory | defeat)
```

### Key Mechanics
- **Throws:** 3 per combat (finite pool, never resets)
- **Trades:** 2 per combat (swap dice, boost multiplier)
- **Pity Timer:** Prevents 10+ consecutive low rolls
- **Time Pressure:** Multiplier decays after grace turns (2-3 turns)
- **Element Wheel:** Void → Earth → Death → Fire → Ice → Wind (cyclic)

### State Validation Gaps
- Score can go negative (no floor)
- Multiplier can exceed cap (not enforced)
- Pool recycling happens too late (after draw fails)
- Domain ID not validated (accepts 0, 100, etc.)

---

## Test Results Summary

Expected results when running test harness:

| Priority | Tests | Expected Pass | Expected Fail |
|----------|-------|---------------|---------------|
| P0       | 4     | 2             | 2             |
| P1       | 6     | 1             | 5             |
| P2       | 1     | 0             | 1             |
| P3       | 3     | 2             | 1             |
| **Total** | **14** | **5**         | **9**         |

**Note:** Failures are EXPECTED - they validate that bugs exist. Test harness is for verification, not validation.

---

## Action Plan

### Week 1: Critical Fixes (P0)
1. Add score floor: `Math.max(0, currentScore + scoreGain)`
2. Move pool recycling before `discardAndDraw()` calls
3. Cap time pressure: `Math.min(1.0, Math.max(minMult, 1.0 - decay))`
4. Validate domainId: `if (id < 1 || id > 6) throw Error()`

### Week 2: High Priority (P1)
5. Enforce multiplier cap using `COMBAT_CAPS.maxMultiplier`
6. Fix pity farming: require 3+ dice thrown to increment
7. Document critical hit design decision (penalties vs bonuses)

### Week 3: Polish (P2-P3)
8. Optimize floating-point rounding (single `Math.round()`)
9. Add inline comments for design decisions
10. Create integration tests for edge cases

---

## Integration Testing Recommendations

Add tests for:
1. **Simultaneous conditions:** Victory + defeat on same throw
2. **Pool exhaustion:** Empty available, full exhausted
3. **Multiplier stacking:** Trades + combos + time pressure
4. **Invalid inputs:** Domain 0, 100, negative values
5. **Boundary values:** Score = 0, 1, MAX_INT
6. **Pity edge cases:** 0 dice, 1 die, 5 dice thrown

---

## Related Documentation

- `/Users/kevin/atlas-t/NEVERDIEGUY26/docs/ux/GAMEPLAY_LOOP.md` - Full run structure
- `/Users/kevin/atlas-t/NEVERDIEGUY26/docs/ux/STATE_MACHINE.md` - RunContext transitions
- `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/README.md` - AI engine overview

---

## Audit Methodology

1. **Static Analysis:** Read all source files, identify validation gaps
2. **Boundary Testing:** Check min/max values, edge cases
3. **State Machine Review:** Validate phase transitions and conditions
4. **Exploit Hunting:** Look for player-abusable mechanics
5. **Documentation:** Catalog findings with reproduction steps

---

## Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0       | 4     | Critical bugs that can break game flow or cause undefined behavior |
| P1       | 5     | Exploitable bugs that affect balance or player experience |
| P2       | 3     | Balance issues or inconsistencies that should be addressed |
| P3       | 8     | Edge cases and polish items, mostly working as intended |

**Total Edge Cases Identified:** 20
**Require Code Fixes:** 10
**Require Documentation:** 10
**Working as Intended:** 8

---

**Audit Complete**

Questions about this audit? Review detailed findings in:
- `combat-edge-cases.md` (detailed catalog)
- `combat-findings.md` (executive summary)
- `combat-test-harness.ts` (automated tests)
