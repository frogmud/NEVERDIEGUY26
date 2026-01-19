# Integration Findings - State Consistency Issues

Auto-generated findings from integration runner execution.
Priority scale: P0 (critical) > P1 (high) > P2 (medium) > P3 (low)

---

## Status: READY FOR TESTING

This file will be populated with bugs and inconsistencies found during automated playthrough testing.

Run `integration-runner.ts` to generate findings.

---

## Finding Template

```markdown
### [P0-001] Gold Exceeds Hard Cap

**Severity:** P0 (Critical)
**Component:** Gold system, RunContext reducer
**Seed:** MID003
**Steps to Reproduce:**
1. Start run with seed MID003, loadout Survivor, domain 1
2. Complete 10+ rooms with high gold rewards
3. Observe gold value at domain 4

**Expected State:**
- Gold capped at GOLD_CONFIG.hardCap (1000)
- Diminishing returns applied above softCap (500)

**Actual State:**
- Gold: 1250 (exceeds hard cap by 250)
- No diminishing returns applied

**Root Cause:**
`calculateGoldGain()` not called in COMPLETE_ROOM reducer, raw gold added directly.

**Fix:**
Replace `state.gold + action.gold` with `state.gold + calculateGoldGain(action.gold, state.gold)` in COMPLETE_ROOM case.

**Regression Risk:** Medium - affects economy balance
```

---

## Known Issues (Pre-Integration)

### [P2-001] Exploration State Not Initialized in Practice Mode

**Severity:** P2 (Medium)
**Component:** RunContext, START_PRACTICE action
**Description:** Practice mode runs don't initialize explorationState, causing null reference errors if NPC dialogue is triggered.

**Expected:** `explorationState: createExplorationState()` in START_PRACTICE reducer
**Actual:** `explorationState: null` (only initialized in START_RUN)

**Impact:** NPC dialogue crashes in practice mode
**Fix:** Add `explorationState: createExplorationState()` to START_PRACTICE case (already done in main branch)

**Status:** RESOLVED in commit [hash]

---

## Critical State Invariants

These invariants MUST hold at all times. Violations are P0 bugs.

### Gold Cap Enforcement
```typescript
// MUST ALWAYS BE TRUE
state.gold >= 0
state.gold <= GOLD_CONFIG.hardCap (1000)

// Diminishing returns above soft cap
if (state.gold >= GOLD_CONFIG.softCap) {
  goldGain = Math.floor(goldGain * GOLD_CONFIG.diminishingRate)
}
```

### Scar System
```typescript
// MUST ALWAYS BE TRUE
state.scars >= 0
state.scars <= 4

// Game over at 4 scars
if (state.scars >= 4) {
  state.phase = 'game_over'
  state.runEnded = true
}
```

### Grit Immunity
```typescript
// MUST ONLY ACTIVATE ONCE
if (hasGritImmunity && !state.gritImmunityUsed) {
  state.gritImmunityUsed = true
  // No scar added
} else {
  state.scars += 1
}
```

### Exploration State Bounds
```typescript
// MUST ALWAYS BE TRUE
state.explorationState.recentTemplateIds.length <= 10
state.explorationState.totalSelections === sum(coordHitCounts.values)
state.explorationState.totalSelections === sum(templateHitCounts.values)
```

### HP Bounds
```typescript
// MUST ALWAYS BE TRUE
state.hp >= 0  // Can reach 0 from travel
state.hp <= 100
// NOTE: HP=0 does NOT trigger death, only scars do
```

### Phase Transitions
```typescript
// VALID TRANSITIONS ONLY
const validTransitions = {
  'lobby': ['playing'],
  'playing': ['game_over'],
  'game_over': ['lobby'],
}
// Invalid: playing -> lobby (must go through game_over)
```

---

## Findings Log

### Run: 2026-01-18 (Initial Test)

**Total Scenarios:** 9
**Passed:** 0 (baseline not yet established)
**Failed:** 0
**Errors:** 0

**Note:** Initial run to establish baseline. No findings expected.

---

### Run: [Timestamp]

**Seed:** [SEED-ID]
**Scenario:** [Description]

#### Finding 1: [Title]

**Severity:** P[0-3]
**Location:** [File:Line or Component]
**State Snapshot:**
```json
{
  "phase": "playing",
  "gold": 1250,
  "scars": 0,
  "explorationState": {
    "totalSelections": 15,
    "recentTemplateIds": ["...12 items..."]
  }
}
```

**Violation:**
- Gold exceeds hard cap (1250 > 1000)
- Exploration buffer exceeds max (12 > 10)

**Expected Fix:**
[Description of code change needed]

**Regression Test:**
Add seed [SEED-ID] to regression suite to prevent recurrence.

---

## Testing Checklist

### Gold System
- [ ] Gold never exceeds 1000 (hard cap)
- [ ] Diminishing returns apply above 500 (soft cap)
- [ ] calculateGoldGain() called in all gold-adding reducers
- [ ] Gold cannot go negative

### Scar System
- [ ] Scars accumulate on FAIL_ROOM
- [ ] 4 scars triggers game_over
- [ ] Grit immunity blocks first scar only
- [ ] gritImmunityUsed flag prevents double activation

### Exploration State
- [ ] Initialized on START_RUN and START_PRACTICE
- [ ] recordSelection() called after dialogue choices
- [ ] recentTemplateIds capped at 10
- [ ] totalSelections matches sum of hit counts

### Domain Progression
- [ ] visitedDomains tracks progression
- [ ] Heat increments per domain clear
- [ ] Items filtered by persistence (Epic+ survive)
- [ ] Domain order follows portal pools

### Phase Transitions
- [ ] lobby -> playing on START_RUN
- [ ] playing -> game_over on death or victory
- [ ] game_over -> lobby on RESET_RUN
- [ ] No invalid transitions (e.g., playing -> lobby)

### HP System
- [ ] HP stays in bounds (0-100)
- [ ] HP=0 does not trigger death (scars do)
- [ ] HP damage from portal travel applied correctly

---

## Regression Baseline Update Log

### 2026-01-18: Initial Baseline
- Created baseline snapshots for BASELINE-V1, BASELINE-V2
- Established validation rules for gold, scars, exploration
- Added edge case seeds for grit immunity, domain progression

### [Next Update]
- [Describe changes to baseline or new seeds added]

---

## Memory Leak Watch

### Exploration State Growth
**Seed:** WIN002
**Metric:** explorationState object size
**Expected:** Bounded growth (~30 coords, ~100 templates max per run)
**Actual:** [To be measured]
**Status:** MONITORING

### Transition History
**Seed:** All scenarios
**Metric:** state.transitions array length
**Expected:** ~18-30 entries per full run (3 rooms * 6 domains)
**Actual:** [To be measured]
**Status:** MONITORING

### Snapshot Array
**Seed:** All scenarios
**Metric:** state.snapshots array length
**Expected:** ~24-36 entries per full run
**Actual:** [To be measured]
**Risk:** Low (only accumulates during test, not in production)

---

## Next Steps

1. Run integration-runner.ts to generate initial findings
2. Create regression baseline snapshots for CI
3. Add failing seeds to seed-catalog.md
4. Fix any P0/P1 issues found
5. Re-run to validate fixes
6. Update baseline with new expected values

---

## CI Integration Plan

### Phase 1: Manual Testing
- Run integration-runner.ts locally
- Generate baseline snapshots
- Document findings in this file

### Phase 2: Automated Regression
- Add npm script: `pnpm test:integration`
- Compare current snapshots to baseline
- Fail CI on critical field mismatches

### Phase 3: Continuous Monitoring
- Run on every PR to main
- Track state consistency metrics over time
- Auto-update baseline on intentional changes

---

## Contact

For questions about integration testing:
- Lead: [Your name]
- Channel: #never-die-guy-dev
- Docs: /audit/README.md
