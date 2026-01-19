# Seed Catalog - Deterministic Test Seeds

Interesting seeds for regression testing, edge case validation, and QA playthroughs.

## How to Use

Each seed generates a deterministic playthrough. Use these for:
- Regression testing - Compare snapshots before/after changes
- Bug reproduction - Isolate specific state transitions
- Edge case validation - Test boundary conditions
- QA verification - Validate fixes

## Seed Format

```
SEED-ID: <6-char hex>
Loadout: <warrior|rogue|mage|survivor>
Starting Domain: <1-6>
Expected Outcome: <early_death|mid_game|victory|edge_case>
Trigger: <what makes this interesting>
```

---

## Early Death Seeds

### EARLY1 - Warrior First Scar
```
Seed: EARLY1
Loadout: Warrior
Starting Domain: 1 (Earth)
Expected: Early death at Domain 1, Room 2
Trigger: First combat loss, tests grit immunity bypass
Use Case: Validate scar system and death state persistence
```

### EARLY2 - Rogue Speed Death
```
Seed: EARLY2
Loadout: Rogue
Starting Domain: 1 (Earth)
Expected: Early death at Domain 1, Room 2
Trigger: High swiftness doesn't prevent death if damage output fails
Use Case: Validates that stat bonuses don't create immunity
```

### EARLY3 - Mage Essence Failure
```
Seed: EARLY3
Loadout: Mage
Starting Domain: 1 (Earth)
Expected: Early death at Domain 1, Room 2
Trigger: Essence-focused build fails without support
Use Case: Tests item-dependent builds in isolation
```

### EARLY4 - Survivor Grit Test
```
Seed: EARLY4
Loadout: Survivor
Starting Domain: 1 (Earth)
Expected: Early death at Domain 1, Room 2
Trigger: Tests 4-scar system and planet destruction
Use Case: Validates scar accumulation and game-over state
```

---

## Mid-Game Seeds

### MID001 - Warrior 3-Domain Clear
```
Seed: MID001
Loadout: Warrior
Starting Domain: 1 (Earth)
Expected: Death after clearing 3 domains
Trigger: Tests domain progression, item persistence, heat scaling
Use Case: Validates domain-to-domain state transitions
```

### MID002 - Rogue Late Start
```
Seed: MID002
Loadout: Rogue
Starting Domain: 6 (Aberrant)
Expected: Death after clearing 3 domains from late start
Trigger: Non-standard domain progression order
Use Case: Validates visitedDomains tracking with alternate routes
```

### MID003 - Gold Cap Test
```
Seed: MID003
Loadout: Survivor
Starting Domain: 1 (Earth)
Expected: Death at Domain 4, gold near hard cap
Trigger: High gold accumulation tests soft/hard cap enforcement
Use Case: Regression test for gold cap (500 soft, 1000 hard)
Validation: Gold should never exceed 1000, diminishing returns above 500
```

### MID004 - Exploration State Stress
```
Seed: MID004
Loadout: Mage
Starting Domain: 1 (Earth)
Expected: Death at Domain 3 with high dialogue diversity
Trigger: Many NPC interactions, tests explorationState integration
Use Case: Validates coord/template hit counts stay bounded
Validation: recentTemplateIds.length <= 10, totalSelections matches hit sums
```

---

## Victory Seeds

### WIN001 - Survivor Full Clear
```
Seed: WIN001
Loadout: Survivor
Starting Domain: 1 (Earth)
Expected: Victory after clearing all 6 domains
Trigger: Baseline victory path, tests full progression
Use Case: Validates complete run from start to finale
Validation: phase='game_over', visitedDomains.length=6, scars<4
```

### WIN002 - Mage High Exploration
```
Seed: WIN002
Loadout: Mage
Starting Domain: 1 (Earth)
Expected: Victory with high exploration bonus diversity
Trigger: Tests exploration bonus calculations throughout run
Use Case: Validates exploration state persists and accumulates correctly
Validation: explorationState.visitedCoords > 20, no duplicate template spam
```

### WIN003 - Warrior Speed Run
```
Seed: WIN003
Loadout: Warrior
Starting Domain: 1 (Earth)
Expected: Victory in minimal turns (early finish bonuses)
Trigger: Tests early finish bonus calculations and gold multipliers
Use Case: Validates bonus gold application
Validation: Check lastRoomBonus on victory screens
```

---

## Edge Case Seeds

### EDGE01 - Shadow Keep Start
```
Seed: EDGE01
Loadout: Warrior
Starting Domain: 4 (Shadow Keep)
Expected: Death at Domain 5 or 6
Trigger: Late-game starting domain (non-standard progression)
Use Case: Tests domain validation and progression from unusual start
Validation: visitedDomains should include [4, 5, ...], not enforce [1, 2, ...]
```

### EDGE02 - Corruption Spike
```
Seed: EDGE02
Loadout: Rogue
Starting Domain: 1 (Earth)
Expected: High corruption accumulation (>80)
Trigger: Corruption system stress test
Use Case: Validates corruption state persistence and bounds (0-100)
Validation: corruption <= 100, corruption persists across domains
```

### EDGE03 - Zero Gold Run
```
Seed: EDGE03
Loadout: Survivor
Starting Domain: 1 (Earth)
Expected: Victory without any shop purchases
Trigger: Tests minimal economy path (no gold spending)
Use Case: Validates game is beatable without shop
Validation: runStats.purchases = 0, gold accumulates but unused
```

### EDGE04 - Heat Streak
```
Seed: EDGE04
Loadout: Warrior
Starting Domain: 1 (Earth)
Expected: Death at Domain 4 with heat >= 5
Trigger: High heat accumulation (streak survival)
Use Case: Tests heat scaling and difficulty multipliers
Validation: heat increments per domain, affects score goals
```

### EDGE05 - Grit Immunity Chain
```
Seed: EDGE05
Loadout: Survivor (grit: 20+)
Starting Domain: 1 (Earth)
Expected: Grit immunity activation, then death on second fail
Trigger: Tests grit immunity flag and one-time activation
Use Case: Validates gritImmunityUsed flag prevents double activation
Validation: gritImmunityUsed = true after first activation, death on second fail
```

---

## Regression Baseline Seeds

Use these seeds to create baseline snapshots for CI regression detection.

### BASELINE-V1 - Canonical Full Run
```
Seed: BASE01
Loadout: Survivor
Starting Domain: 1 (Earth)
Expected: Victory after clearing all domains with standard progression
Trigger: Baseline for snapshot comparison
Use Case: Create regression baseline for state transitions
Validation: All state values within expected ranges
Snapshots: run_start, combat_d1r1, combat_d1r2, combat_d1r3, domain_clear_1, ..., game_over
```

### BASELINE-V2 - Canonical Mid-Game
```
Seed: BASE02
Loadout: Warrior
Starting Domain: 1 (Earth)
Expected: Death at Domain 4, Room 2
Trigger: Baseline mid-game death scenario
Use Case: Regression baseline for death state
Validation: scars = 4, phase = 'game_over', gold within cap
```

---

## Integration Test Coverage

### State Transitions Tested
- [x] lobby -> playing (START_RUN)
- [x] playing -> playing (COMPLETE_ROOM, SELECT_PORTAL)
- [x] playing -> game_over (FAIL_ROOM with 4 scars, final domain clear)
- [x] game_over -> lobby (RESET_RUN)

### Gold Cap Scenarios
- [x] Below soft cap (0-500): Full gold gain
- [x] Above soft cap (500-1000): Diminishing returns (50%)
- [x] At hard cap (1000): No gold gain

### Exploration State Integration
- [x] Fresh state on run start
- [x] recordSelection updates visitedCoords, coordHitCounts, templateHitCounts
- [x] recentTemplateIds circular buffer (max 10)
- [x] totalSelections matches sum of hit counts

### Scar/Death System
- [x] 0-3 scars: Continue playing
- [x] 4 scars: Planet destroyed, game over
- [x] Grit immunity (20+ grit): First fail blocked, then death

### Domain Progression
- [x] Earth (1) -> Aberrant (6) -> Frost Reach (2) -> Infernus (3) -> Shadow Keep (4) -> Null Providence (5)
- [x] visitedDomains tracks progression
- [x] Heat increments per domain
- [x] Item persistence (Epic+ survive portal travel)

---

## Memory Leak Watchlist

Seeds that stress state object growth:

1. **WIN002** - High exploration diversity
   - Watch: `explorationState.visitedCoords`, `coordHitCounts`, `templateHitCounts`
   - Expected: Bounded growth (max ~30 coords, ~100 templates per run)

2. **MID003** - High gold accumulation
   - Watch: Gold never exceeds hard cap (1000)
   - Expected: Gold caps at 1000, no unbounded growth

3. **EDGE04** - Heat streak
   - Watch: Heat accumulation
   - Expected: Heat resets on death, increments per domain clear

---

## Seed Generation Tips

To create new deterministic seeds:

1. Choose a 6-character hex ID (e.g., `ABC123`)
2. Select loadout (warrior/rogue/mage/survivor)
3. Choose starting domain (1-6)
4. Define expected outcome
5. Run scenario and capture snapshots
6. Document interesting state transitions
7. Add to regression baseline if valuable

Example:
```typescript
const newSeed: PlaythroughScenario = {
  seed: 'NEW001',
  loadout: 'rogue',
  startingDomain: 2,
  targetOutcome: 'mid_game',
  description: 'Test HP damage calculation from travel',
};
```
