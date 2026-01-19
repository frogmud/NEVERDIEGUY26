# Integration Testing Suite - NEVER DIE GUY

Automated playthrough system for validating game state consistency across runs.

## Overview

This suite provides deterministic integration testing for the NEVER DIE GUY roguelike. By using seeded RNG, we can reproduce exact game states and validate:

- State consistency during phase transitions
- Gold cap enforcement (soft cap 500, hard cap 1000)
- Exploration state integration and bounds
- Death state persistence (scar system, grit immunity)
- Domain progression and portal travel
- Memory leak detection

## Files

### 1. `integration-runner.ts`
**Core testing engine**

Simulates complete game runs with deterministic seeds. Provides:
- `PlaythroughRunner` - Executes scenarios and captures state snapshots
- `StateValidator` - Validates invariants (gold cap, HP bounds, etc.)
- `runIntegrationTests()` - Runs all scenarios and returns summary

**Usage:**
```typescript
import { runIntegrationTests } from './integration-runner';

const { scenarios, results, summary } = runIntegrationTests();

console.log(`Passed: ${summary.passed}/${summary.totalRuns}`);
console.log(`Errors: ${summary.errors.length}`);
```

**Key Features:**
- Deterministic playthrough simulation
- State snapshots at each transition
- Validation against critical invariants
- Transition event tracking

### 2. `seed-catalog.md`
**Deterministic test seeds**

Curated collection of seeds for:
- Early death scenarios (all 4 loadouts)
- Mid-game progression tests
- Victory paths (full clear)
- Edge cases (late-start domains, corruption, grit immunity)
- Regression baselines

**Seed Format:**
```
Seed: EARLY1
Loadout: Warrior
Starting Domain: 1 (Earth)
Expected: Early death at Domain 1, Room 2
Trigger: First combat loss, tests grit immunity bypass
Use Case: Validate scar system and death state persistence
```

**Categories:**
- Early Death: EARLY1, EARLY2, EARLY3, EARLY4
- Mid-Game: MID001, MID002, MID003 (gold cap), MID004 (exploration)
- Victory: WIN001, WIN002, WIN003
- Edge Cases: EDGE01-EDGE05
- Baselines: BASE01, BASE02

### 3. `regression-baseline.json`
**Known-good state snapshots**

JSON file containing expected state values for key scenarios. Used for:
- Regression detection (compare current vs baseline)
- CI automation
- Validating fixes

**Structure:**
```json
{
  "baselines": {
    "BASELINE-V1": {
      "seed": "BASE01",
      "snapshots": {
        "run_start": { "gold": 0, "scars": 0, ... },
        "combat_d1r1": { "gold": { "min": 50, "max": 150 }, ... },
        "game_over": { "phase": "game_over", ... }
      }
    }
  },
  "validationRules": {
    "gold": { "softCap": 500, "hardCap": 1000 },
    "scars": { "min": 0, "max": 4 }
  }
}
```

### 4. `integration-findings.md`
**Bug tracker and test results**

Living document that logs:
- Bugs found during testing (with severity P0-P3)
- State consistency violations
- Regression test results
- Memory leak observations

**Finding Template:**
```markdown
### [P0-001] Gold Exceeds Hard Cap
Severity: P0 (Critical)
Seed: MID003
Expected: gold <= 1000
Actual: gold = 1250
Root Cause: calculateGoldGain() not called in reducer
Fix: [Code change]
```

## Quick Start

### Run All Tests
```bash
cd /Users/kevin/atlas-t/NEVERDIEGUY26/audit
npx tsx integration-runner.ts
```

### Run Specific Scenario
```typescript
import { PlaythroughRunner } from './integration-runner';

const runner = new PlaythroughRunner();
const result = runner.runScenario({
  seed: 'EARLY1',
  loadout: 'warrior',
  startingDomain: 1,
  targetOutcome: 'early_death',
  description: 'Warrior early death test',
});

console.log('Errors:', result.errors);
console.log('Final State:', result.snapshots[result.snapshots.length - 1]);
```

### Compare Against Baseline
```typescript
import baseline from './regression-baseline.json';
import { compareSnapshots } from './integration-runner';

const currentSnapshot = result.snapshots.find(s => s.phase === 'game_over');
const baselineSnapshot = baseline.baselines['BASELINE-V1'].snapshots.game_over;

const diffs = compareSnapshots(baselineSnapshot, currentSnapshot);
if (diffs.length > 0) {
  console.error('Regression detected:', diffs);
}
```

## Critical Invariants

The suite validates these invariants on every state transition:

### Gold Cap
```typescript
state.gold >= 0
state.gold <= 1000 (GOLD_CONFIG.hardCap)
// Diminishing returns above 500 (softCap)
```

### Scar System
```typescript
state.scars >= 0
state.scars <= 4
// Game over at 4 scars
if (state.scars >= 4) {
  state.phase = 'game_over'
}
```

### Grit Immunity
```typescript
// ONE-TIME activation only
if (grit >= 20 && !state.gritImmunityUsed) {
  state.gritImmunityUsed = true
  // No scar added
} else {
  state.scars += 1
}
```

### Exploration State
```typescript
state.explorationState.recentTemplateIds.length <= 10
state.explorationState.totalSelections === sum(coordHitCounts)
```

### HP Bounds
```typescript
state.hp >= 0
state.hp <= 100
// NOTE: HP=0 doesn't trigger death (scars do)
```

### Phase Transitions
```typescript
validTransitions = {
  'lobby': ['playing'],
  'playing': ['game_over'],
  'game_over': ['lobby'],
}
```

## Scenario Types

### Early Death
Tests scar accumulation and grit immunity in first few rooms.

**Seeds:** EARLY1-EARLY4
**Coverage:** All 4 loadouts (warrior, rogue, mage, survivor)

### Mid-Game
Tests domain progression, item persistence, heat scaling.

**Seeds:** MID001-MID004
**Coverage:** Multi-domain runs, gold cap, exploration state

### Victory
Tests full 6-domain clear and finale state.

**Seeds:** WIN001-WIN003
**Coverage:** All domains visited, final score accumulation

### Edge Cases
Tests unusual paths and boundary conditions.

**Seeds:** EDGE01-EDGE05
**Coverage:** Late-start domains, corruption, grit immunity chain

## State Snapshot Structure

Each snapshot captures:

```typescript
interface RunSnapshot {
  timestamp: number;
  seed: string;
  phase: string;              // 'lobby' | 'playing' | 'game_over'
  currentDomain: number;      // 1-6
  gold: number;               // 0-1000 (hard cap)
  totalScore: number;
  scars: number;              // 0-4
  hp: number;                 // 0-100
  heat: number;               // Increments per domain
  corruption: number;         // 0-100
  explorationState: {
    visitedCoords: string[];
    coordHitCounts: Record<string, number>;
    templateHitCounts: Record<string, number>;
    recentTemplateIds: string[];  // Max 10
    totalSelections: number;
  };
  visitedDomains: number[];   // Progression tracking
  inventory: {
    powerupsCount: number;
    diceCount: number;
  };
}
```

## Validation Flow

1. **Pre-Transition Snapshot**
   - Capture state before action

2. **Execute Action**
   - Simulate combat, shop, portal, etc.

3. **Post-Transition Snapshot**
   - Capture state after action

4. **Validate Invariants**
   - Check gold cap, scars, HP bounds
   - Verify exploration state
   - Validate phase transitions

5. **Record Findings**
   - Log errors to state.errors[]
   - Track transitions for debugging

6. **Compare to Baseline**
   - Diff against regression-baseline.json
   - Flag critical field mismatches

## Adding New Seeds

1. Choose unique 6-char ID (e.g., `NEW001`)
2. Define scenario:
   ```typescript
   {
     seed: 'NEW001',
     loadout: 'rogue',
     startingDomain: 2,
     targetOutcome: 'mid_game',
     description: 'Test HP damage from portal travel',
   }
   ```
3. Run scenario and capture snapshots
4. Document in `seed-catalog.md`
5. Add to regression baseline if valuable

## CI Integration

### Phase 1: Local Testing (Current)
```bash
pnpm test:integration:local
```
- Runs all scenarios
- Generates findings.md
- No CI blocking

### Phase 2: Regression Detection (Next)
```bash
pnpm test:integration:ci
```
- Compares snapshots to baseline
- Fails on critical field mismatches
- Blocks PR merge on P0 violations

### Phase 3: Continuous Monitoring (Future)
- Track state metrics over time
- Auto-update baseline on intentional changes
- Alert on unexpected state growth (memory leaks)

## Memory Leak Detection

The suite monitors object growth for:

### Exploration State
- `visitedCoords` - Expected: <30 per run
- `coordHitCounts` - Expected: <30 entries
- `templateHitCounts` - Expected: <100 entries
- `recentTemplateIds` - Expected: <=10 always

### Transition History
- `state.transitions` - Expected: ~18-30 per run (3 rooms * 6 domains)

### Snapshot Array
- `state.snapshots` - Expected: ~24-36 per run
- **Risk:** Low (test-only, not production)

## Debugging Tips

### Reproduce Exact State
```typescript
const result = runner.runScenario({
  seed: 'EXACT_SEED',
  loadout: 'survivor',
  startingDomain: 1,
  targetOutcome: 'mid_game',
  description: 'Debug session',
});

// Inspect snapshots
result.snapshots.forEach(snap => {
  console.log(snap.phase, snap.gold, snap.scars);
});

// Check transitions
result.transitions.forEach(trans => {
  console.log(trans.from, '->', trans.to, trans.goldBefore, '->', trans.goldAfter);
});
```

### Validate Specific Invariant
```typescript
import { StateValidator } from './integration-runner';

const validator = new StateValidator();
validator.validateGoldCap(1250, 'debug-check');
validator.validateExplorationState(state.explorationState, 'debug-check');

if (validator.hasErrors()) {
  console.error(validator.getErrors());
}
```

### Compare Before/After
```typescript
const before = result.snapshots.find(s => s.phase === 'playing');
const after = result.snapshots.find(s => s.phase === 'game_over');

console.log('Gold delta:', after.gold - before.gold);
console.log('Scars delta:', after.scars - before.scars);
```

## Known Limitations

1. **No UI Testing**
   - Tests state logic only, not React components

2. **Simplified Combat**
   - Uses randomInt for outcomes, not full combat engine

3. **No Network Calls**
   - NPC dialogue and API endpoints not tested

4. **Deterministic Only**
   - Real player behavior has more variance

## Future Enhancements

- [ ] Add AI-driven playthrough (simulate smart player decisions)
- [ ] Integrate with Phaser combat engine for realistic dice throws
- [ ] Add visual diff viewer for state snapshots
- [ ] Auto-generate seed catalog from interesting runs
- [ ] Performance benchmarking (playthrough speed)
- [ ] Multiplayer state sync testing

## Troubleshooting

### Error: "Unknown loadout"
- Check loadout ID matches LOADOUT_PRESETS (warrior/rogue/mage/survivor)

### Error: "Invalid domain"
- Verify domain ID is 1-6
- Check domain order follows portal pools

### Snapshots not captured
- Ensure `takeSnapshot()` called after state changes
- Check snapshot array length

### Gold cap violations
- Verify `calculateGoldGain()` called in all reducers
- Check GOLD_CONFIG values (softCap: 500, hardCap: 1000)

### Exploration state errors
- Verify `createExplorationState()` called on START_RUN
- Check `recordSelection()` called after dialogue choices

## Contact

For questions or contributions:
- Lead: INTEGRATION-RUNNER
- Repo: /Users/kevin/atlas-t/NEVERDIEGUY26
- Docs: /audit/README.md

---

**Last Updated:** 2026-01-18
**Version:** 1.0.0
