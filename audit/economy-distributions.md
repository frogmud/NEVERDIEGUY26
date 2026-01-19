# Economy Distribution Analysis

Generated: [Awaiting simulation run]

## Executive Summary

This document analyzes the statistical distribution of resources, scores, and progression across 10,000 simulated arena runs using Monte Carlo methods. The simulation tests all 4 loadout presets (Warrior, Rogue, Mage, Survivor) across the 6-domain progression system.

## Methodology

- **Runs**: 10,000 Monte Carlo simulations
- **Seed**: Deterministic for reproducibility
- **Loadouts**: Equal distribution (2,500 runs per loadout)
- **Domains**: 6 domains, 3 rooms each (18 total encounters)
- **Variables**: Lucky number (0-7), combat RNG, elite door selection

## Loadout Performance

### Win Rate by Loadout

| Loadout   | Win Rate | Avg Domains | Avg Gold | Avg Score | Avg Deaths |
|-----------|----------|-------------|----------|-----------|------------|
| Warrior   | TBD%     | TBD         | TBD      | TBD       | TBD        |
| Rogue     | TBD%     | TBD         | TBD      | TBD       | TBD        |
| Mage      | TBD%     | TBD         | TBD      | TBD       | TBD        |
| Survivor  | TBD%     | TBD         | TBD      | TBD       | TBD        |

**Expected**: Balanced win rates (40-60% range for all loadouts)

**Actual**: [To be determined after simulation]

### Gold Distribution by Loadout

#### Warrior
- Mean: TBD
- Median: TBD
- Std Dev: TBD
- Min: TBD
- Max: TBD
- 95th Percentile: TBD

#### Rogue
- Mean: TBD
- Median: TBD
- Std Dev: TBD
- Min: TBD
- Max: TBD
- 95th Percentile: TBD

#### Mage
- Mean: TBD
- Median: TBD
- Std Dev: TBD
- Min: TBD
- Max: TBD
- 95th Percentile: TBD

#### Survivor
- Mean: TBD
- Median: TBD
- Std Dev: TBD
- Min: TBD
- Max: TBD
- 95th Percentile: TBD

### Score Distribution by Loadout

[Charts/tables to be generated after simulation]

## Domain Progression Analysis

### Survival Rate by Domain

| Domain | Name            | Expected Survival | Actual Survival | Avg Gold | Avg HP Remaining |
|--------|-----------------|-------------------|-----------------|----------|------------------|
| 1      | Earth           | 95%               | TBD%            | TBD      | TBD              |
| 2      | Aberrant        | 85%               | TBD%            | TBD      | TBD              |
| 3      | Frost Reach     | 70%               | TBD%            | TBD      | TBD              |
| 4      | Infernus        | 55%               | TBD%            | TBD      | TBD              |
| 5      | Shadow Keep     | 40%               | TBD%            | TBD      | TBD              |
| 6      | Null Providence | 25%               | TBD%            | TBD      | TBD              |

**Note**: Expected survival rates are targets from design docs. Significant deviations (>10% off target) indicate balance issues.

### Gold Accumulation Curve

Gold earned per domain (cumulative average):

| Domain | D1  | D2  | D3  | D4  | D5  | D6  |
|--------|-----|-----|-----|-----|-----|-----|
| Gold   | TBD | TBD | TBD | TBD | TBD | TBD |

**Expected Curve**: Linear to exponential growth (50-100-200-350-500-650)

**Actual Curve**: [To be determined]

### Score Accumulation Curve

Score earned per domain (cumulative average):

| Domain | D1   | D2   | D3   | D4   | D5   | D6   |
|--------|------|------|------|------|------|------|
| Score  | TBD  | TBD  | TBD  | TBD  | TBD  | TBD  |

## Gold Cap Analysis

### Soft Cap (500g)

- **Runs hitting soft cap**: TBD (TBD%)
- **Average gold lost to diminishing returns**: TBD per run
- **Domains where cap is typically hit**: TBD

**Expected**: <20% of runs hit soft cap before Domain 5

### Hard Cap (1000g)

- **Runs hitting hard cap**: TBD (TBD%)
- **Average gold lost to hard cap**: TBD per run
- **Earliest domain hitting cap**: TBD

**Expected**: <5% of runs hit hard cap

### Analysis

[To be determined after simulation]

If soft cap is hit frequently before Domain 4, it may be too low. If hard cap is never reached, it may be unnecessary.

## Lucky Synergy Analysis

### Gold Bonus Distribution

- **Average lucky synergy bonus per run**: TBD gold
- **Percent of total gold from synergy**: TBD%
- **Runs with strong synergy (25%)**: TBD (TBD%)
- **Runs with weak synergy (10%)**: TBD (TBD%)
- **Runs with no synergy**: TBD (TBD%)

### Synergy by Lucky Number

| Lucky # | Avg Synergy Gold | Strong Synergy % | Win Rate Delta |
|---------|------------------|------------------|----------------|
| 0       | TBD              | TBD%             | TBD%           |
| 1       | TBD              | TBD%             | TBD%           |
| 2       | TBD              | TBD%             | TBD%           |
| 3       | TBD              | TBD%             | TBD%           |
| 4       | TBD              | TBD%             | TBD%           |
| 5       | TBD              | TBD%             | TBD%           |
| 6       | TBD              | TBD%             | TBD%           |
| 7       | TBD              | TBD%             | TBD%           |

**Expected**: Lucky #7 (Boots) should have highest synergy gold due to "always strong" bonus.

## Time Pressure Analysis

### Average Time Pressure Multiplier

| Loadout   | Avg Multiplier | % Runs Below 0.70 |
|-----------|----------------|-------------------|
| Warrior   | TBD            | TBD%              |
| Rogue     | TBD            | TBD%              |
| Mage      | TBD            | TBD%              |
| Survivor  | TBD            | TBD%              |

**Expected**: Average multiplier should be 0.85-0.95 (most runs finish within grace + 2-3 turns)

**Grace Period**: 2 turns (normal), 3 turns (boss)
**Decay Rate**: 5% per turn (normal), 4% per turn (boss)
**Floor**: 60% (normal), 50% (boss)

### Time Pressure by Domain

[Chart showing average multiplier by domain]

**Expected**: Later domains should have slightly lower multipliers due to increased difficulty.

## Outlier Analysis

### High Performers (>3 sigma above mean gold)

| Loadout | Lucky # | Gold | Score | Domains | Notes |
|---------|---------|------|-------|---------|-------|
| TBD     | TBD     | TBD  | TBD   | TBD     | TBD   |

### Low Performers (>3 sigma below mean gold)

| Loadout | Lucky # | Gold | Score | Domains | Notes |
|---------|---------|------|-------|---------|-------|
| TBD     | TBD     | TBD  | TBD   | TBD     | TBD   |

### Auto-Win Builds

Runs with >95% win rate given specific conditions:

- [To be identified after simulation]

**Expected**: No single combination should guarantee victory. Any build with >90% win rate indicates broken synergy.

### Dead-End Builds

Runs with <10% win rate given specific conditions:

- [To be identified after simulation]

**Expected**: All loadouts should be viable. <20% win rate indicates underpowered archetype.

## HP Economy Analysis

### HP Loss per Domain

| Domain | Avg HP Lost | Avg HP Remaining | Deaths per 1000 Runs |
|--------|-------------|------------------|----------------------|
| 1      | TBD         | TBD              | TBD                  |
| 2      | TBD         | TBD              | TBD                  |
| 3      | TBD         | TBD              | TBD                  |
| 4      | TBD         | TBD              | TBD                  |
| 5      | TBD         | TBD              | TBD                  |
| 6      | TBD         | TBD              | TBD                  |

**HP Baseline**:
- Warrior: ~620 HP (grit 70, resilience 65)
- Rogue: ~410 HP (grit 50, resilience 50)
- Mage: ~510 HP (grit 60, resilience 65)
- Survivor: ~590 HP (grit 70, resilience 65)

**Expected**: Average HP should decline linearly, with recovery (+10 per domain) slowing the curve.

## Key Findings (Post-Simulation)

### Balance Issues

[To be identified]

### Snowball Mechanics

[To be identified]

Snowball indicators:
- Win rate correlation with early gold
- Exponential scaling in later domains
- Rich-get-richer feedback loops

### Degenerate Strategies

[To be identified]

### Dead Zones

[To be identified]

Failure points:
- Domains with >30% drop in survival rate
- Loadouts with <30% overall win rate
- Lucky numbers with <15% win rate delta

## Recommendations

[To be generated after simulation - see balance-recommendations.md]
