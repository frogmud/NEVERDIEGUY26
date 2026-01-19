# Economy Audit - NEVER DIE GUY

Monte Carlo simulation and statistical analysis of game economy, balance, and progression systems.

## Quick Start

```bash
# Run the simulation (10K runs, ~2-5 minutes)
npx tsx audit/economy-sim.ts --runs=10000

# Run with custom seed for reproducibility
npx tsx audit/economy-sim.ts --runs=10000 --seed=my-test-seed

# Verbose mode (shows individual run details)
npx tsx audit/economy-sim.ts --runs=100 --verbose
```

## Files

### 1. `economy-sim.ts`
Monte Carlo simulation harness that:
- Runs N iterations with deterministic seeds
- Simulates full arena runs (6 domains, 3 rooms each)
- Tests all 4 loadouts (Warrior, Rogue, Mage, Survivor)
- Tracks gold, items, score, HP, deaths per domain
- Outputs statistical summary to `economy-sim-results.json`

**Key Features**:
- Deterministic RNG (reproducible with same seed)
- Uses canonical formulas from `balance-config.ts`
- Tests gold cap system (soft/hard cap)
- Analyzes lucky synergy bonuses
- Measures time pressure impact
- Detects outliers (>3 sigma from mean)

### 2. `economy-distributions.md`
Statistical analysis with:
- Mean/median/std dev per domain and loadout
- Win rate by loadout
- Survival curve by domain (vs targets)
- Gold accumulation curves
- Score accumulation curves
- Lucky synergy analysis
- Time pressure distribution
- Outlier builds (>3 sigma above/below mean)
- Charts/tables for visualization

**Updated After Simulation**: Fill in TBD values with actual results.

### 3. `balance-recommendations.md`
Tuning suggestions with:
- Issue identified (with evidence from simulation)
- Severity (P0-P3)
- Recommended adjustment with rationale
- Implementation code snippets
- Testing protocol

**Priority Levels**:
- **P0**: Critical (blocks progression or breaks game loop)
- **P1**: High (significant impact on player experience)
- **P2**: Medium (affects specific builds or edge cases)
- **P3**: Low (polish/QoL improvements)

## Simulation Methodology

### Test Matrix

| Variable | Values | Notes |
|----------|--------|-------|
| Loadouts | 4 | Warrior, Rogue, Mage, Survivor |
| Lucky Numbers | 8 | 0-7 (random per run) |
| Domains | 6 | Earth → Aberrant → Frost → Infernus → Shadow → Null Providence |
| Rooms per Domain | 3 | Normal, Elite (30% chance), Boss (always room 3) |
| Total Runs | 10,000 | 2,500 per loadout |

### Canonical Formulas Tested

#### Gold Rewards
```typescript
base * domainMultiplier * heatBonus * luckySynergy
// Domain multiplier: 1 + (position - 1) * 0.5
// Heat bonus: 1.2^heat (capped at 2.0x)
// Lucky synergy: 1.0 (none), 1.1 (weak), 1.25 (strong)
```

#### Gold Caps
```typescript
// Soft cap: 500g (50% efficiency above)
// Hard cap: 1000g (no gain above)
if (currentGold >= 500) {
  goldGain = goldGain * 0.5;
}
if (currentGold >= 1000) {
  goldGain = 0;
}
```

#### HP Calculation
```typescript
maxHp = 100 + (grit * 5) + (resilience * 2)
// Range: 310 (low grit/res) to 800 (max grit/res)
```

#### Damage Calculation
```typescript
damage = (fury * 1.0) + (essence * 0.3)
// Range: 39 (low) to 130 (high)
```

#### Time Pressure
```typescript
multiplier = max(minMultiplier, 1.0 - ((turn - graceTurns) * decayPerTurn))
// Normal: 2 grace turns, 5% decay, 60% floor
// Boss: 3 grace turns, 4% decay, 50% floor
```

#### Lucky Synergy
```typescript
// Strong (+25%): Lucky #7 (always), match current domain, match protocol roll
// Weak (+10%): Adjacent domain, adjacent protocol roll
// None (+0%): No match
```

### Metrics Tracked

#### Per-Run Metrics
- Domains cleared (0-6)
- Rooms cleared (0-18)
- Final score
- Final gold
- Deaths
- Victory (cleared all 6 domains)
- Gold per domain
- Score per domain
- HP at domain end
- Highest tier reached
- Average time pressure multiplier
- Total lucky synergy gold bonus

#### Aggregate Metrics
- Win rate by loadout
- Average domains/rooms cleared
- Average score/gold
- Gold distribution (min, max, mean, median, std dev)
- Score distribution
- Domain survival rates
- Gold cap hit rates (soft/hard)
- Lucky synergy bonus (avg, % of total)
- Outliers (>3 sigma)

## Analysis Focus Areas

### 1. Economy Balance
- **Question**: Are gold rewards balanced across domains?
- **Test**: Compare avg gold per domain to expected curve
- **Red Flag**: Exponential growth or flat progression

### 2. Gold Cap Tuning
- **Question**: Are caps hit at the right time?
- **Test**: Track when soft/hard caps are reached
- **Red Flag**: >20% hitting soft cap before Domain 5

### 3. Loadout Balance
- **Question**: Are all loadouts viable?
- **Test**: Compare win rates across loadouts
- **Red Flag**: >10% win rate spread

### 4. Domain Difficulty Curve
- **Question**: Does survival rate match intended curve?
- **Test**: Compare actual vs target survival per domain
- **Red Flag**: >15% deviation from target

### 5. Lucky Synergy Impact
- **Question**: Is Lucky #7 overpowered?
- **Test**: Compare gold bonus and win rate by lucky number
- **Red Flag**: >5% win rate delta for any lucky number

### 6. Time Pressure Effectiveness
- **Question**: Does time pressure create urgency without frustration?
- **Test**: Measure avg multiplier and % below 0.70
- **Red Flag**: Avg <0.80 (too punishing) or >0.95 (not felt)

### 7. Snowball Mechanics
- **Question**: Do early advantages compound into auto-wins?
- **Test**: Correlate early gold with win rate
- **Red Flag**: High R² correlation (>0.7)

### 8. Dead-End Paths
- **Question**: Are there unwinnable builds?
- **Test**: Identify combinations with <10% win rate
- **Red Flag**: Any loadout + lucky number combo <10%

## Expected Results

### Balanced State
- All loadouts: 45-55% win rate
- Domain survival: Matches targets (±10%)
- Gold curve: Linear to exponential (50→650 total)
- Soft cap hits: <20% before Domain 5
- Hard cap hits: <5% overall
- Lucky synergy: 10-15% of total gold
- Time pressure: 0.85-0.95 avg multiplier
- Outliers: <5% of runs >3 sigma

### Imbalanced States

#### Gold Inflation
- Soft cap hit >30% before Domain 5
- Hard cap hit >10% overall
- Avg gold >700 at Domain 6
- **Fix**: Reduce gold rewards or raise caps

#### Gold Deflation
- Avg gold <400 at Domain 6
- Soft cap hit <5% overall
- Players unable to afford shop items
- **Fix**: Increase gold rewards or lower caps

#### Loadout Imbalance
- Any loadout <35% or >65% win rate
- >15% spread between loadouts
- **Fix**: Adjust stat bonuses

#### Lucky #7 Overpowered
- Win rate >5% higher than other numbers
- Gold bonus >20% of total
- **Fix**: Remove "always strong" or buff other numbers

#### Time Pressure Too Punishing
- Avg multiplier <0.80
- >30% of runs below 0.70
- **Fix**: Increase grace turns or reduce decay rate

#### Snowball Detected
- Early gold (Domain 1-2) correlates >0.7 with victory
- Rich-get-richer feedback loops
- **Fix**: Cap multiplicative scaling or add catch-up mechanics

## Workflow

1. **Run Simulation**
   ```bash
   npx tsx audit/economy-sim.ts --runs=10000 --seed=audit-2026-01-18
   ```

2. **Review Output**
   - Console: Summary statistics
   - File: `economy-sim-results.json` (full data)

3. **Fill in Distributions**
   - Open `economy-distributions.md`
   - Replace all TBD values with actual results
   - Add charts/tables as needed

4. **Identify Issues**
   - Review distributions for outliers
   - Compare actual vs expected metrics
   - Flag deviations >10% from targets

5. **Write Recommendations**
   - Open `balance-recommendations.md`
   - Document issues with evidence
   - Propose fixes with rationale
   - Prioritize by severity (P0-P3)

6. **Implement Fixes**
   - Start with P0 issues
   - Edit `balance-config.ts` or relevant files
   - Test in isolation

7. **Re-run Simulation**
   - Use same seed for comparison
   - Verify fixes resolved issues
   - Check for unintended side effects

8. **Iterate**
   - Repeat until all P0/P1 issues resolved
   - Document final recommendations

## Integration with Existing Sims

This audit builds on existing simulation scripts:

| Script | Purpose | Reusable Code |
|--------|---------|---------------|
| `arena-run-sim.ts` | Full arena run with death/debt | RNG, combat flow |
| `trade-economy-sim.ts` | NPC shop economy | Merchant profiles, haggle |
| `lib/simulation.ts` | Base simulation harness | Stats calculation, output |

**Key Differences**:
- Economy audit focuses on **player progression**, not NPC interactions
- Tests **canonical formulas** from `balance-config.ts`, not AI engine
- Targets **10K runs** for statistical significance
- Outputs **actionable recommendations**, not just data

## File Paths (Absolute)

All recommendations reference absolute paths from project root:

- Balance config: `/Users/kevin/atlas-t/NEVERDIEGUY26/apps/web/src/data/balance-config.ts`
- Loadouts: `/Users/kevin/atlas-t/NEVERDIEGUY26/apps/web/src/data/loadouts.ts`
- Domains: `/Users/kevin/atlas-t/NEVERDIEGUY26/apps/web/src/data/domains.ts`
- Stats calculator: `/Users/kevin/atlas-t/NEVERDIEGUY26/apps/web/src/data/stats/calculator.ts`
- Stats types: `/Users/kevin/atlas-t/NEVERDIEGUY26/apps/web/src/data/stats/types.ts`

## Next Steps

1. Run the simulation
2. Review distributions
3. Identify issues
4. Implement P0/P1 fixes
5. Re-run and verify
6. Deploy changes to `balance-config.ts`

---

**Generated**: 2026-01-18
**Version**: 1.0
**Author**: ECONOMY-SIM (Claude Code)
