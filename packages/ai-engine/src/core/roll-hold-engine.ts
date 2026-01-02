/**
 * Roll/Hold Scoring Engine
 *
 * Core mechanic: Roll dice, optionally HOLD to multiply next roll.
 * Hold Example: Roll 3+4=7, HOLD -> Roll 5+6=11 -> Score = 7 x 11 = 77
 */

import { createSeededRng, type SeededRng } from './seeded-rng';

// ============================================
// Configuration
// ============================================

export interface RollHoldConfig {
  maxHeldDice: number;           // Max dice that can be held (default: 5)
  holdDecayPerTurn: number;      // Held value decays per turn (0 = no decay)
  minRollForHold: number;        // Min roll value to enable hold button
  holdBonusOnPerfect: number;    // Bonus multiplier if all held dice = max faces
  comboMultiplierCap: number;    // Max multiplier from chaining holds (10x)
  baseMultiplier: number;        // Starting multiplier (1.0)
}

export const DEFAULT_ROLL_HOLD_CONFIG: RollHoldConfig = {
  maxHeldDice: 5,
  holdDecayPerTurn: 0,
  minRollForHold: 5,
  holdBonusOnPerfect: 1.5,
  comboMultiplierCap: 10,
  baseMultiplier: 1.0,
};

// ============================================
// Types
// ============================================

export interface DieResult {
  faces: number;       // D4, D6, D8, D10, D12, D20
  value: number;       // Rolled value
  isCrit: boolean;     // Rolled max value
  isLucky: boolean;    // Hit lucky number
}

export interface RollResult {
  dice: DieResult[];
  sum: number;
  critCount: number;
  luckyCount: number;
  isPerfect: boolean;  // All dice rolled max
}

export interface HoldState {
  heldSum: number;           // Sum of held dice
  heldDice: DieResult[];     // The actual held dice
  turnsHeld: number;         // How many turns held (for decay)
  comboCount: number;        // How many times held in a row
  currentMultiplier: number; // Accumulated multiplier
}

export interface ScoringResult {
  baseScore: number;         // Raw dice sum
  heldMultiplier: number;    // Multiplier from held dice
  bonusMultiplier: number;   // From crits, lucky numbers, perfect rolls
  finalScore: number;        // Final calculated score
  comboChain: number;        // Combo chain length
  breakdown: string[];       // Human-readable breakdown
}

export interface RollHoldState {
  config: RollHoldConfig;
  holdState: HoldState;
  lastRoll: RollResult | null;
  totalScore: number;
  rollCount: number;
  holdCount: number;
}

// ============================================
// Engine
// ============================================

export function createRollHoldState(config: Partial<RollHoldConfig> = {}): RollHoldState {
  return {
    config: { ...DEFAULT_ROLL_HOLD_CONFIG, ...config },
    holdState: {
      heldSum: 0,
      heldDice: [],
      turnsHeld: 0,
      comboCount: 0,
      currentMultiplier: 1.0,
    },
    lastRoll: null,
    totalScore: 0,
    rollCount: 0,
    holdCount: 0,
  };
}

export function rollDice(
  diceFaces: number[],
  rng: SeededRng,
  luckyNumber?: number
): RollResult {
  const dice: DieResult[] = diceFaces.map((faces) => {
    const value = Math.floor(rng.random('diceRoll') * faces) + 1;
    return {
      faces,
      value,
      isCrit: value === faces,
      isLucky: luckyNumber !== undefined && value === luckyNumber,
    };
  });

  const sum = dice.reduce((acc, d) => acc + d.value, 0);
  const critCount = dice.filter((d) => d.isCrit).length;
  const luckyCount = dice.filter((d) => d.isLucky).length;
  const isPerfect = dice.every((d) => d.isCrit);

  return { dice, sum, critCount, luckyCount, isPerfect };
}

export function canHold(state: RollHoldState): boolean {
  if (!state.lastRoll) return false;
  if (state.holdState.heldDice.length >= state.config.maxHeldDice) return false;
  return state.lastRoll.sum >= state.config.minRollForHold;
}

export function hold(state: RollHoldState): RollHoldState {
  if (!state.lastRoll || !canHold(state)) {
    return state;
  }

  const newHeldDice = [
    ...state.holdState.heldDice,
    ...state.lastRoll.dice,
  ].slice(0, state.config.maxHeldDice);

  const newHeldSum = newHeldDice.reduce((acc, d) => acc + d.value, 0);
  const newComboCount = state.holdState.comboCount + 1;

  // Calculate new multiplier (capped)
  let newMultiplier = state.holdState.currentMultiplier;
  if (state.holdState.heldSum > 0) {
    // Chaining: multiply current by held ratio
    newMultiplier = Math.min(
      state.holdState.currentMultiplier * (1 + newHeldSum / 10),
      state.config.comboMultiplierCap
    );
  } else {
    // First hold: multiplier = held sum
    newMultiplier = newHeldSum;
  }

  return {
    ...state,
    holdState: {
      heldSum: newHeldSum,
      heldDice: newHeldDice,
      turnsHeld: 0,
      comboCount: newComboCount,
      currentMultiplier: newMultiplier,
    },
    lastRoll: null, // Clear last roll after holding
    holdCount: state.holdCount + 1,
  };
}

export function roll(
  state: RollHoldState,
  diceFaces: number[],
  rng: SeededRng,
  luckyNumber?: number
): { state: RollHoldState; result: ScoringResult } {
  const rollResult = rollDice(diceFaces, rng, luckyNumber);
  const breakdown: string[] = [];

  // Base score
  let baseScore = rollResult.sum;
  breakdown.push(`Roll: ${rollResult.dice.map((d) => d.value).join('+')} = ${baseScore}`);

  // Held multiplier
  let heldMultiplier = 1;
  if (state.holdState.heldSum > 0) {
    heldMultiplier = state.holdState.heldSum;
    breakdown.push(`Held: x${heldMultiplier}`);
  }

  // Bonus multiplier (crits, lucky, perfect)
  let bonusMultiplier = 1;

  if (rollResult.critCount > 0) {
    const critBonus = 1 + rollResult.critCount * 0.25;
    bonusMultiplier *= critBonus;
    breakdown.push(`Crits: x${critBonus.toFixed(2)}`);
  }

  if (rollResult.luckyCount > 0) {
    const luckyBonus = 1 + rollResult.luckyCount * 0.15;
    bonusMultiplier *= luckyBonus;
    breakdown.push(`Lucky: x${luckyBonus.toFixed(2)}`);
  }

  if (rollResult.isPerfect && state.holdState.heldDice.length > 0) {
    const perfectBonus = state.config.holdBonusOnPerfect;
    bonusMultiplier *= perfectBonus;
    breakdown.push(`PERFECT: x${perfectBonus.toFixed(2)}`);
  }

  // Final calculation
  const finalScore = Math.floor(baseScore * heldMultiplier * bonusMultiplier);
  breakdown.push(`Final: ${finalScore}`);

  // Apply decay to held state if applicable
  let newHoldState = { ...state.holdState };
  if (state.config.holdDecayPerTurn > 0) {
    newHoldState.turnsHeld++;
    const decay = state.config.holdDecayPerTurn * newHoldState.turnsHeld;
    newHoldState.heldSum = Math.max(0, newHoldState.heldSum - decay);
  }

  // Clear held state after scoring (the hold was consumed)
  if (state.holdState.heldSum > 0) {
    newHoldState = {
      heldSum: 0,
      heldDice: [],
      turnsHeld: 0,
      comboCount: state.holdState.comboCount, // Keep combo for tracking
      currentMultiplier: 1.0,
    };
  }

  const newState: RollHoldState = {
    ...state,
    lastRoll: rollResult,
    totalScore: state.totalScore + finalScore,
    rollCount: state.rollCount + 1,
    holdState: newHoldState,
  };

  const scoringResult: ScoringResult = {
    baseScore,
    heldMultiplier,
    bonusMultiplier,
    finalScore,
    comboChain: state.holdState.comboCount,
    breakdown,
  };

  return { state: newState, result: scoringResult };
}

export function clearHold(state: RollHoldState): RollHoldState {
  return {
    ...state,
    holdState: {
      heldSum: 0,
      heldDice: [],
      turnsHeld: 0,
      comboCount: 0,
      currentMultiplier: 1.0,
    },
  };
}

// ============================================
// Simulation Helpers
// ============================================

export interface RollHoldSimConfig {
  diceFaces: number[];        // e.g., [6, 6, 6] for 3d6
  targetScore: number;        // Score needed to win
  maxRolls: number;           // Max rolls before timeout
  holdStrategy: 'never' | 'always' | 'smart' | 'threshold';
  holdThreshold?: number;     // For threshold strategy: min sum to hold
  luckyNumber?: number;
}

export interface RollHoldSimResult {
  won: boolean;
  finalScore: number;
  rollsUsed: number;
  holdsUsed: number;
  avgMultiplier: number;
  maxCombo: number;
  scoreBreakdown: ScoringResult[];
}

export function simulateRollHoldCombat(
  config: RollHoldSimConfig,
  rollHoldConfig: Partial<RollHoldConfig> = {},
  seed: string = 'sim'
): RollHoldSimResult {
  const rng = createSeededRng(seed);
  let state = createRollHoldState(rollHoldConfig);
  const scoreBreakdown: ScoringResult[] = [];
  let maxCombo = 0;

  for (let i = 0; i < config.maxRolls; i++) {
    // Roll
    const { state: newState, result } = roll(
      state,
      config.diceFaces,
      rng,
      config.luckyNumber
    );
    state = newState;
    scoreBreakdown.push(result);
    maxCombo = Math.max(maxCombo, result.comboChain);

    // Check win condition
    if (state.totalScore >= config.targetScore) {
      break;
    }

    // Decide whether to hold
    let shouldHold = false;
    switch (config.holdStrategy) {
      case 'never':
        shouldHold = false;
        break;
      case 'always':
        shouldHold = canHold(state);
        break;
      case 'threshold':
        shouldHold =
          canHold(state) &&
          (state.lastRoll?.sum ?? 0) >= (config.holdThreshold ?? 10);
        break;
      case 'smart':
        // Hold if roll is above average and we're not close to target
        const remaining = config.targetScore - state.totalScore;
        const avgRoll =
          config.diceFaces.reduce((a, b) => a + b, 0) / 2 +
          config.diceFaces.length / 2;
        shouldHold =
          canHold(state) &&
          (state.lastRoll?.sum ?? 0) > avgRoll * 1.2 &&
          remaining > avgRoll * 2;
        break;
    }

    if (shouldHold) {
      state = hold(state);
    }
  }

  const totalMultipliers = scoreBreakdown.reduce(
    (acc, r) => acc + r.heldMultiplier,
    0
  );

  return {
    won: state.totalScore >= config.targetScore,
    finalScore: state.totalScore,
    rollsUsed: state.rollCount,
    holdsUsed: state.holdCount,
    avgMultiplier:
      scoreBreakdown.length > 0 ? totalMultipliers / scoreBreakdown.length : 1,
    maxCombo,
    scoreBreakdown,
  };
}

// ============================================
// Strategy Analysis
// ============================================

export interface StrategyComparison {
  strategy: string;
  winRate: number;
  avgScore: number;
  avgRolls: number;
  avgHolds: number;
  avgMultiplier: number;
}

export function compareStrategies(
  baseConfig: Omit<RollHoldSimConfig, 'holdStrategy'>,
  runs: number = 1000,
  seed: string = 'compare'
): StrategyComparison[] {
  const strategies: Array<'never' | 'always' | 'smart' | 'threshold'> = [
    'never',
    'always',
    'smart',
    'threshold',
  ];

  return strategies.map((strategy) => {
    let wins = 0;
    let totalScore = 0;
    let totalRolls = 0;
    let totalHolds = 0;
    let totalMultiplier = 0;

    for (let i = 0; i < runs; i++) {
      const result = simulateRollHoldCombat(
        { ...baseConfig, holdStrategy: strategy, holdThreshold: 12 },
        {},
        `${seed}-${strategy}-${i}`
      );

      if (result.won) wins++;
      totalScore += result.finalScore;
      totalRolls += result.rollsUsed;
      totalHolds += result.holdsUsed;
      totalMultiplier += result.avgMultiplier;
    }

    return {
      strategy,
      winRate: wins / runs,
      avgScore: totalScore / runs,
      avgRolls: totalRolls / runs,
      avgHolds: totalHolds / runs,
      avgMultiplier: totalMultiplier / runs,
    };
  });
}
