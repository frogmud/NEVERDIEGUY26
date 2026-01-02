/**
 * Time-Based Damage System
 *
 * Player HP drains constantly during combat.
 * The Dying Saucer: Speed = Survival
 */

// ============================================
// Configuration
// ============================================

export interface TimeDamageConfig {
  baseDrainPerSecond: number;      // Base HP drain rate (default: 2)
  drainScalingPerAnte: number;     // Additional drain per ante (default: 1)
  pauseDrainOnHold: boolean;       // Does holding pause drain? (default: false)
  bonusTimeOnCrit: number;         // Seconds of drain healed on crit (default: 0.5)
  bonusTimeOnLucky: number;        // Seconds of drain healed on lucky (default: 0.3)

  // Domain modifiers
  domainDrainModifiers: {
    safe: number;                  // 0.5 = half drain
    normal: number;                // 1.0 = standard
    risky: number;                 // 1.5 = 50% faster drain
  };

  // Target score scaling
  baseTargetScore: number;         // Ante 1, Room 1 target (default: 50)
  targetScorePerAnte: number;      // Additional per ante (default: 30)
  targetScorePerRoom: number;      // Additional per room (default: 10)
  bossTargetMultiplier: number;    // Boss room multiplier (default: 2.5)
}

export const DEFAULT_TIME_DAMAGE_CONFIG: TimeDamageConfig = {
  baseDrainPerSecond: 2,
  drainScalingPerAnte: 1,
  pauseDrainOnHold: false,
  bonusTimeOnCrit: 0.5,
  bonusTimeOnLucky: 0.3,
  domainDrainModifiers: {
    safe: 0.5,
    normal: 1.0,
    risky: 1.5,
  },
  baseTargetScore: 50,
  targetScorePerAnte: 30,
  targetScorePerRoom: 10,
  bossTargetMultiplier: 2.5,
};

// ============================================
// Types
// ============================================

export type DomainType = 'safe' | 'normal' | 'risky';

export interface CombatRoom {
  ante: number;          // 1, 2, or 3
  room: number;          // 1, 2, or 3 within ante
  domain: DomainType;    // Risk level chosen
  isBoss: boolean;       // Final boss room?
}

export interface CombatState {
  config: TimeDamageConfig;
  room: CombatRoom;

  // HP tracking
  currentHP: number;
  maxHP: number;

  // Time tracking
  startTime: number;           // Combat start timestamp (ms)
  elapsedSeconds: number;      // Total time elapsed
  pausedSeconds: number;       // Time spent paused (holding)
  drainPaused: boolean;        // Currently paused?

  // Scoring
  currentScore: number;
  targetScore: number;

  // Stats
  critsLanded: number;
  luckyHits: number;
  hpRecoveredFromBonus: number;
}

export interface CombatResult {
  won: boolean;
  finalHP: number;
  finalScore: number;
  targetScore: number;
  timeElapsed: number;
  totalDrain: number;
  hpRecovered: number;
  critsLanded: number;
  luckyHits: number;
}

// ============================================
// Calculations
// ============================================

export function calculateTargetScore(
  room: CombatRoom,
  config: TimeDamageConfig
): number {
  let target =
    config.baseTargetScore +
    (room.ante - 1) * config.targetScorePerAnte +
    (room.room - 1) * config.targetScorePerRoom;

  if (room.isBoss) {
    target *= config.bossTargetMultiplier;
  }

  return Math.floor(target);
}

export function calculateDrainRate(
  room: CombatRoom,
  config: TimeDamageConfig
): number {
  const baseDrain = config.baseDrainPerSecond;
  const anteDrain = (room.ante - 1) * config.drainScalingPerAnte;
  const domainMod = config.domainDrainModifiers[room.domain];

  return (baseDrain + anteDrain) * domainMod;
}

export function calculateDrainForTime(
  seconds: number,
  room: CombatRoom,
  config: TimeDamageConfig
): number {
  const rate = calculateDrainRate(room, config);
  return rate * seconds;
}

// ============================================
// Combat State Management
// ============================================

export function createCombatState(
  room: CombatRoom,
  maxHP: number,
  currentHP: number,
  config: Partial<TimeDamageConfig> = {}
): CombatState {
  const fullConfig = { ...DEFAULT_TIME_DAMAGE_CONFIG, ...config };
  const targetScore = calculateTargetScore(room, fullConfig);

  return {
    config: fullConfig,
    room,
    currentHP,
    maxHP,
    startTime: Date.now(),
    elapsedSeconds: 0,
    pausedSeconds: 0,
    drainPaused: false,
    currentScore: 0,
    targetScore,
    critsLanded: 0,
    luckyHits: 0,
    hpRecoveredFromBonus: 0,
  };
}

export function tickCombat(
  state: CombatState,
  deltaSeconds: number
): CombatState {
  if (state.drainPaused && state.config.pauseDrainOnHold) {
    return {
      ...state,
      pausedSeconds: state.pausedSeconds + deltaSeconds,
    };
  }

  const drain = calculateDrainForTime(deltaSeconds, state.room, state.config);
  const newHP = Math.max(0, state.currentHP - drain);

  return {
    ...state,
    currentHP: newHP,
    elapsedSeconds: state.elapsedSeconds + deltaSeconds,
  };
}

export function applyScore(
  state: CombatState,
  score: number,
  crits: number = 0,
  luckyHits: number = 0
): CombatState {
  let hpRecovered = 0;

  // Bonus HP recovery from crits and lucky hits
  if (crits > 0) {
    const critRecovery = crits * state.config.bonusTimeOnCrit *
      calculateDrainRate(state.room, state.config);
    hpRecovered += critRecovery;
  }

  if (luckyHits > 0) {
    const luckyRecovery = luckyHits * state.config.bonusTimeOnLucky *
      calculateDrainRate(state.room, state.config);
    hpRecovered += luckyRecovery;
  }

  const newHP = Math.min(state.maxHP, state.currentHP + hpRecovered);

  return {
    ...state,
    currentScore: state.currentScore + score,
    currentHP: newHP,
    critsLanded: state.critsLanded + crits,
    luckyHits: state.luckyHits + luckyHits,
    hpRecoveredFromBonus: state.hpRecoveredFromBonus + hpRecovered,
  };
}

export function setPaused(state: CombatState, paused: boolean): CombatState {
  return {
    ...state,
    drainPaused: paused,
  };
}

export function isCombatWon(state: CombatState): boolean {
  return state.currentScore >= state.targetScore;
}

export function isCombatLost(state: CombatState): boolean {
  return state.currentHP <= 0;
}

export function getCombatResult(state: CombatState): CombatResult {
  const totalDrain = calculateDrainForTime(
    state.elapsedSeconds - state.pausedSeconds,
    state.room,
    state.config
  );

  return {
    won: isCombatWon(state),
    finalHP: state.currentHP,
    finalScore: state.currentScore,
    targetScore: state.targetScore,
    timeElapsed: state.elapsedSeconds,
    totalDrain,
    hpRecovered: state.hpRecoveredFromBonus,
    critsLanded: state.critsLanded,
    luckyHits: state.luckyHits,
  };
}

// ============================================
// Simulation
// ============================================

export interface TimeDamageSimConfig {
  room: CombatRoom;
  maxHP: number;
  startingHP: number;
  avgScorePerRoll: number;      // Average score per roll action
  avgRollTime: number;          // Seconds per roll action
  rollVariance: number;         // Score variance (0-1)
  critChance: number;           // Chance of crit per roll
  luckyChance: number;          // Chance of lucky hit per roll
  holdChance: number;           // Chance to hold (adds pause time)
  holdDuration: number;         // Seconds spent holding
}

export interface TimeDamageSimResult {
  won: boolean;
  finalHP: number;
  hpLost: number;
  timeElapsed: number;
  rollsNeeded: number;
  finalScore: number;
  targetScore: number;
  survivalMargin: number;       // HP remaining as % of max
}

export function simulateTimeDamageCombat(
  simConfig: TimeDamageSimConfig,
  damageConfig: Partial<TimeDamageConfig> = {},
  seed: number = Date.now()
): TimeDamageSimResult {
  // Simple seeded random
  let rngState = seed;
  const random = (): number => {
    rngState = (rngState * 1103515245 + 12345) % 2147483648;
    return rngState / 2147483648;
  };

  let state = createCombatState(
    simConfig.room,
    simConfig.maxHP,
    simConfig.startingHP,
    damageConfig
  );

  let rollsNeeded = 0;
  const maxRolls = 100; // Safety limit

  while (!isCombatWon(state) && !isCombatLost(state) && rollsNeeded < maxRolls) {
    rollsNeeded++;

    // Simulate time passing for roll action
    state = tickCombat(state, simConfig.avgRollTime);

    // Check if died during roll
    if (isCombatLost(state)) break;

    // Generate score with variance
    const baseScore = simConfig.avgScorePerRoll;
    const variance = (random() - 0.5) * 2 * simConfig.rollVariance * baseScore;
    const score = Math.max(1, Math.floor(baseScore + variance));

    // Check for crits and lucky hits
    const crits = random() < simConfig.critChance ? 1 : 0;
    const lucky = random() < simConfig.luckyChance ? 1 : 0;

    state = applyScore(state, score, crits, lucky);

    // Maybe hold (adds pause time but no score)
    if (random() < simConfig.holdChance && !isCombatWon(state)) {
      state = setPaused(state, true);
      state = tickCombat(state, simConfig.holdDuration);
      state = setPaused(state, false);
    }
  }

  const result = getCombatResult(state);

  return {
    won: result.won,
    finalHP: result.finalHP,
    hpLost: simConfig.startingHP - result.finalHP,
    timeElapsed: result.timeElapsed,
    rollsNeeded,
    finalScore: result.finalScore,
    targetScore: result.targetScore,
    survivalMargin: result.finalHP / simConfig.maxHP,
  };
}

// ============================================
// Analysis Helpers
// ============================================

export function analyzeRoomDifficulty(
  config: TimeDamageConfig
): Array<{
  ante: number;
  room: number;
  domain: DomainType;
  targetScore: number;
  drainRate: number;
  estimatedTime: number;
  estimatedHPLoss: number;
}> {
  const results: Array<{
    ante: number;
    room: number;
    domain: DomainType;
    targetScore: number;
    drainRate: number;
    estimatedTime: number;
    estimatedHPLoss: number;
  }> = [];

  const domains: DomainType[] = ['safe', 'normal', 'risky'];

  for (let ante = 1; ante <= 3; ante++) {
    for (let room = 1; room <= 3; room++) {
      for (const domain of domains) {
        const isBoss = ante === 3 && room === 3;
        const combatRoom: CombatRoom = { ante, room, domain, isBoss };

        const targetScore = calculateTargetScore(combatRoom, config);
        const drainRate = calculateDrainRate(combatRoom, config);

        // Estimate time based on avg score of 20 per roll, 2 sec per roll
        const avgScorePerSecond = 20 / 2;
        const estimatedTime = targetScore / avgScorePerSecond;
        const estimatedHPLoss = drainRate * estimatedTime;

        results.push({
          ante,
          room,
          domain,
          targetScore,
          drainRate,
          estimatedTime,
          estimatedHPLoss,
        });
      }
    }
  }

  return results;
}
