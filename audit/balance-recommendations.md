# Balance Recommendations

Generated: [Awaiting simulation run]

Based on Monte Carlo simulation of 10,000 arena runs analyzing economy, progression, and combat balance.

---

## Critical Issues (P0)

**P0 issues block player progression or break core game loops. Must fix before deployment.**

### [P0-1] TBD
**Issue**: [To be identified after simulation]

**Severity**: P0

**Evidence**:
- [Data points from simulation]

**Recommended Fix**:
- [Specific value adjustments]

**Rationale**:
- [Why this fixes the problem]

**Implementation**:
```typescript
// File: /Users/kevin/atlas-t/NEVERDIEGUY26/apps/web/src/data/balance-config.ts
// Line: TBD
// Change: TBD
```

**Testing**:
- Re-run simulation with adjusted values
- Target: [Specific metric range]

---

## High Priority (P1)

**P1 issues significantly impact player experience but don't block progression.**

### [P1-1] Gold Cap Tuning

**Issue**: Current soft cap (500g) and hard cap (1000g) may not align with actual gold accumulation curves.

**Severity**: P1

**Evidence**:
- Soft cap hit rate: TBD% (target: <20% before Domain 5)
- Hard cap hit rate: TBD% (target: <5% overall)
- Average gold lost to caps: TBD per run

**Recommended Fix**:
```typescript
// Current values
export const GOLD_CONFIG = {
  softCap: 500,
  hardCap: 1000,
  diminishingRate: 0.5,
} as const;

// Recommended values (if soft cap hit >30% before D5)
export const GOLD_CONFIG = {
  softCap: 650,  // +150
  hardCap: 1200, // +200
  diminishingRate: 0.5,
} as const;

// OR (if soft cap hit <10% before D5)
export const GOLD_CONFIG = {
  softCap: 400,  // -100
  hardCap: 800,  // -200
  diminishingRate: 0.5,
} as const;
```

**Rationale**:
- Soft cap should create tension in Domain 4-5, not earlier
- Hard cap should be rarely hit (5% of runs max)
- Diminishing returns should feel like a choice, not a punishment

**Testing**:
- Monitor "avg gold lost to cap" metric
- Ensure 80% of runs stay below soft cap until Domain 4+

---

### [P1-2] Lucky Number #7 Balance

**Issue**: Lucky #7 (Boots) has "always strong" synergy, which may create unfair advantage.

**Severity**: P1

**Evidence**:
- Lucky #7 win rate delta: TBD% vs other numbers
- Lucky #7 avg synergy gold: TBD vs TBD average
- Runs with #7: TBD% higher gold than baseline

**Recommended Fix**:

**Option A**: Nerf Lucky #7 to match other numbers
```typescript
// balance-config.ts, line 297-298
export function getLuckySynergy(ctx: LuckySynergyContext): LuckySynergyLevel {
  const { luckyNumber, protocolRoll, currentDomain } = ctx;

  // REMOVE special case
  // if (luckyNumber === 7) return 'strong';

  // Lucky #7 now follows same rules as others
  if (luckyNumber === currentDomain) return 'strong';
  // ... rest of logic
}
```

**Option B**: Buff other lucky numbers to match #7
```typescript
// Add "always weak" synergy as baseline
export function getLuckySynergy(ctx: LuckySynergyContext): LuckySynergyLevel {
  const { luckyNumber, protocolRoll, currentDomain } = ctx;

  if (luckyNumber === 7) return 'strong'; // Keep special
  if (luckyNumber === currentDomain) return 'strong';
  if (protocolRoll) {
    const rollValues = [protocolRoll.domain, protocolRoll.modifier, protocolRoll.sponsor];
    if (rollValues.includes(luckyNumber)) return 'strong';
    if (rollValues.some(v => Math.abs(v - luckyNumber) === 1)) return 'weak';
  }
  if (Math.abs(luckyNumber - currentDomain) === 1) return 'weak';

  // NEW: Always give at least weak synergy
  return 'weak';
}
```

**Recommended**: Option A (simpler, preserves choice tension)

**Rationale**:
- Lucky numbers should create strategic choices, not auto-wins
- #7 special treatment creates imbalance unless all numbers get perks
- "Always strong" removes domain-specific decision-making

**Testing**:
- Win rate delta should be <5% between lucky numbers
- Synergy gold variance should be <20% between numbers

---

### [P1-3] Time Pressure Tuning

**Issue**: Time pressure system may be too punishing or too lenient.

**Severity**: P1

**Evidence**:
- Average time pressure multiplier: TBD (target: 0.85-0.95)
- % of runs below 0.70 multiplier: TBD% (target: <15%)
- Average turns per room: TBD (target: 4-6 turns)

**Recommended Fix** (if avg multiplier <0.80):
```typescript
// balance-config.ts, line 351-356
export const TIMER_CONFIG: TimerConfig = {
  graceTurns: 3,        // +1 (was 2)
  decayPerTurn: 0.04,   // -0.01 (was 0.05)
  minMultiplier: 0.65,  // +0.05 (was 0.60)
  earlyFinishBonus: 0.10,
};
```

**Recommended Fix** (if avg multiplier >0.95):
```typescript
// balance-config.ts, line 351-356
export const TIMER_CONFIG: TimerConfig = {
  graceTurns: 2,
  decayPerTurn: 0.07,   // +0.02 (was 0.05)
  minMultiplier: 0.50,  // -0.10 (was 0.60)
  earlyFinishBonus: 0.15, // +0.05 (was 0.10)
};
```

**Rationale**:
- Grace period should feel like "free turns," decay should create urgency
- Min multiplier floor prevents total score loss
- Players should feel time pressure in 60% of rooms, not 90%

**Testing**:
- Monitor "avg turns per room" and "% below 0.70 multiplier"
- Ensure time pressure is noticeable but not punishing

---

## Medium Priority (P2)

**P2 issues affect specific builds or edge cases.**

### [P2-1] Loadout Balance

**Issue**: One or more loadouts may significantly outperform others.

**Severity**: P2

**Evidence**:
- Win rates: Warrior TBD%, Rogue TBD%, Mage TBD%, Survivor TBD%
- Target: All within 10% of each other (45-55% win rate)
- Actual spread: TBD%

**Recommended Fix**: [To be determined after identifying underperformer]

**Example** (if Rogue <35% win rate):
```typescript
// loadouts.ts, line 31-39
{
  id: 'rogue',
  name: 'Rogue',
  description: 'Fast, crit-focused',
  playstyle: 'Speed & Crits',
  icon: 'BoltSharp',
  items: [],
  statBonus: {
    swiftness: 30,  // +5 (was 25)
    shadow: 25,     // +5 (was 20)
    fury: 15        // +5 (was 10)
  },
}
```

**Rationale**:
- All loadouts should be viable for first-time players
- Stat bonuses should create distinct playstyles without hard-locking builds

**Testing**:
- Re-run simulation with adjusted bonuses
- Target: <10% win rate spread between loadouts

---

### [P2-2] Domain Survival Curve

**Issue**: Domain survival rates may not match intended difficulty curve.

**Severity**: P2

**Evidence**:

| Domain | Target | Actual | Delta |
|--------|--------|--------|-------|
| 1      | 95%    | TBD%   | TBD%  |
| 2      | 85%    | TBD%   | TBD%  |
| 3      | 70%    | TBD%   | TBD%  |
| 4      | 55%    | TBD%   | TBD%  |
| 5      | 40%    | TBD%   | TBD%  |
| 6      | 25%    | TBD%   | TBD%  |

**Recommended Fix**: [To be determined after identifying drop-off points]

**Example** (if Domain 3 survival is 55% instead of 70%):
```typescript
// Reduce Domain 3 score goals or increase gold rewards
// balance-config.ts, calculateGoldReward function
// Increase domain multiplier for D3
const domainMultiplier = domain === 3
  ? 2.5  // Special boost for D3
  : 1 + (position - 1) * GOLD_REWARDS.domainMultiplierIncrement;
```

**Rationale**:
- Survival curve should feel like smooth ramp, not cliff
- Major drop-offs (>20% survival loss) indicate difficulty spike

**Testing**:
- Monitor domain-by-domain survival rates
- Look for deltas >15% from target

---

### [P2-3] Heat Scaling

**Issue**: Heat system (elite doors) may create runaway difficulty or be ignored.

**Severity**: P2

**Evidence**:
- Average heat per run: TBD (target: 1-2)
- Win rate delta with heat >3: TBD% (target: -20% to -30%)
- % of runs taking elite doors: TBD% (target: 40-60%)

**Recommended Fix** (if heat ignored):
```typescript
// balance-config.ts, line 73-76
heat: {
  difficultyMultiplier: 1.15,
  rewardMultiplier: 1.30,  // +0.10 (was 1.20) - more reward for risk
}
```

**Recommended Fix** (if heat too punishing):
```typescript
// balance-config.ts, line 73-76
heat: {
  difficultyMultiplier: 1.10,  // -0.05 (was 1.15)
  rewardMultiplier: 1.20,
}
```

**Rationale**:
- Heat should be a meaningful risk/reward choice
- 40-60% of runs should take at least 1 elite door
- High heat (3+) should be rare but viable

**Testing**:
- Monitor elite door selection rate
- Check win rate delta for heat levels

---

## Low Priority (P3)

**P3 issues are polish/quality-of-life improvements.**

### [P3-1] Gold Reward Formula Clarity

**Issue**: Domain multiplier formula may be unintuitive.

**Severity**: P3

**Evidence**:
- Current formula: `1 + (position - 1) * 0.5`
- Position 1 = 1x, Position 6 = 3.5x
- May not be clear to players

**Recommended Fix**: Consider exponential scaling for late domains
```typescript
// balance-config.ts, line 242-261
export function calculateGoldReward(
  rewardTier: number,
  domain: number,
  heat: number = 0,
  luckySynergy: 'strong' | 'weak' | 'none' = 'none'
): number {
  const base = GOLD_REWARDS.byTier[rewardTier] || GOLD_REWARDS.byTier[1];
  const position = getDomainPosition(domain);

  // Option A: Current linear (1.0, 1.5, 2.0, 2.5, 3.0, 3.5)
  const domainMultiplier = 1 + (position - 1) * 0.5;

  // Option B: Exponential (1.0, 1.4, 1.9, 2.7, 3.8, 5.3)
  // const domainMultiplier = Math.pow(1.4, position - 1);

  let reward = Math.floor(base * domainMultiplier);
  reward = applyHeatReward(reward, heat);
  reward = Math.floor(reward * LUCKY_SYNERGY.gold[luckySynergy]);
  return reward;
}
```

**Rationale**:
- Exponential feels more rewarding in late game
- Linear is simpler to understand and predict
- Current system works if gold caps are tuned correctly

**Testing**:
- Compare avg gold per domain with both formulas
- Ensure exponential doesn't hit caps too early

---

### [P3-2] Integrity Recovery Tuning

**Issue**: Domain clear recovery (+10 HP) may be too low to matter.

**Severity**: P3

**Evidence**:
- Average HP remaining per domain: TBD
- % of runs where recovery matters: TBD%
- Recovery as % of max HP: ~2-5% depending on loadout

**Recommended Fix**:
```typescript
// balance-config.ts, line 332
domainClearRecovery: 25,  // +15 (was 10) - ~5% of max HP
```

**Rationale**:
- Recovery should feel like a reward, not a rounding error
- 25 HP = 1 room's worth of damage for most loadouts
- Creates incentive to push for domain clear instead of fluming

**Testing**:
- Monitor how often recovery prevents death in next domain
- Ensure it doesn't trivialize later domains

---

## Formula Edge Cases

### Issue: Gold Cap Diminishing Returns

**Current Formula** (`calculateGoldGain`):
```typescript
// Apps/web/src/data/balance-config.ts, line 219-237
const belowCap = Math.max(0, GOLD_CONFIG.softCap - currentGold);
const aboveCap = rawGold - belowCap;
const diminished = Math.floor(aboveCap * GOLD_CONFIG.diminishingRate);
return Math.min(belowCap + diminished, GOLD_CONFIG.hardCap - currentGold);
```

**Edge Case**: Player at 499g earning 200g should get:
- Below cap: 1g (full value)
- Above cap: 199g * 0.5 = 99g (diminished)
- Total: 100g

**Test Cases**:
| Current Gold | Raw Gold | Expected Result | Formula Check |
|--------------|----------|-----------------|---------------|
| 0            | 100      | 100             | TBD           |
| 450          | 100      | 75 (50+25)      | TBD           |
| 500          | 100      | 50              | TBD           |
| 950          | 100      | 50              | TBD           |
| 1000         | 100      | 0               | TBD           |

**Recommendation**: Test these edge cases in simulation to ensure formula behaves correctly.

---

### Issue: Time Pressure Floor

**Current Formula** (`getTimePressureMultiplier`):
```typescript
// Apps/web/src/data/balance-config.ts, line 387-401
const decayTurns = turnNumber - config.graceTurns;
const decay = decayTurns * config.decayPerTurn;
return Math.max(config.minMultiplier, 1.0 - decay);
```

**Edge Case**: Normal room with 15 turns should be:
- Grace: 2 turns (1.0x)
- Decay: 13 turns * 0.05 = 0.65 decay
- Result: max(0.60, 1.0 - 0.65) = 0.60 (floor)

**Test Cases**:
| Room Type | Turn # | Expected Multiplier | Formula Check |
|-----------|--------|---------------------|---------------|
| Normal    | 1      | 1.00                | TBD           |
| Normal    | 2      | 1.00 (grace)        | TBD           |
| Normal    | 3      | 0.95                | TBD           |
| Normal    | 10     | 0.60 (floor)        | TBD           |
| Boss      | 3      | 1.00 (grace)        | TBD           |
| Boss      | 10     | 0.72                | TBD           |
| Boss      | 20     | 0.50 (floor)        | TBD           |

**Recommendation**: Verify floors are hit at reasonable turn counts (8-10 turns for normal, 15-20 for boss).

---

## Testing Protocol

After implementing recommendations:

1. **Re-run simulation** with adjusted values
2. **Compare metrics** to baseline:
   - Win rate by loadout
   - Survival rate by domain
   - Gold accumulation curve
   - Time pressure distribution
3. **Verify targets**:
   - All loadouts within 10% win rate
   - Domain survival curve matches targets (±10%)
   - Soft cap hit <20% before Domain 5
   - Lucky number variance <5% win rate
4. **Edge case testing**:
   - Test gold cap formula with extreme values
   - Test time pressure floor with long combats
   - Test lucky synergy with all combinations

---

## Next Steps

1. **Run simulation**: `npx tsx audit/economy-sim.ts --runs=10000`
2. **Analyze results**: Review economy-distributions.md
3. **Prioritize fixes**: Start with P0, then P1
4. **Iterate**: Re-run simulation after each major change
5. **Document**: Update this file with actual findings

---

## Notes

- All file paths are absolute from project root
- All line numbers reference current state (pre-changes)
- Recommended values are starting points, not final
- Always test changes in isolation before combining
- Consider player perception: 10% buff may feel like 50% to players
