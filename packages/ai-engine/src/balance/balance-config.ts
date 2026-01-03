/**
 * Balance Configuration System
 *
 * Central tuning knobs for game balance.
 * Used by simulation engines to test different configurations.
 */

export interface BalanceConfig {
  // === PLAYER BASE STATS ===
  player: {
    startingHealth: number;
    startingGold: number;
    baseDamage: number;
    itemSlots: number;
  };

  // === COMBAT SCALING ===
  combat: {
    // Enemy HP = base + (ante * anteMultiplier) + (room * roomMultiplier)
    enemyHPBase: number;
    enemyHPAnteMultiplier: number;
    enemyHPRoomMultiplier: number;

    // Enemy damage = base * (1 + ante * anteScaling)
    enemyDamageBase: number;
    enemyDamageAnteScaling: number;

    // Boss multipliers (applied on top of normal scaling)
    bossHPMultiplier: number;
    bossDamageMultiplier: number;
  };

  // === PLAYER SCALING ===
  scaling: {
    // Base damage grows per ante
    playerDamagePerAnte: number;

    // Dice roll contribution (roll / faces * this)
    diceRollMultiplier: number;

    // How much items matter
    itemFlatDamageMultiplier: number;    // Multiplies flat damage effects
    itemPercentMultiplier: number;        // Multiplies percentage effects

    // Synergy power
    synergyBonus: number;                 // Per synergy pair
    tagSetBonus2: number;                 // 2 items with same tag
    tagSetBonus3: number;                 // 3+ items with same tag
  };

  // === HEALING / SUSTAIN ===
  sustain: {
    restHealPercent: number;              // % of max HP healed at rest
    healItemMultiplier: number;           // Multiplies heal effects
    shieldEffectiveness: number;          // How much shields block
  };

  // === ECONOMY ===
  economy: {
    goldPerRoom: number;                  // Base gold per room clear
    goldVariance: number;                 // Random variance (0-1)
    shopPriceMultiplier: number;          // Higher = more expensive
    eventGoldChance: number;              // Chance of gold from events
  };

  // === CRIT / PROC ===
  rng: {
    baseCritChance: number;
    baseCritMultiplier: number;
    baseProcChance: number;
    luckyNumberBonus: number;             // Extra proc chance when lucky number hits
  };

  // === ROOM DISTRIBUTION ===
  rooms: {
    combatWeight: number;
    shopWeight: number;
    eventWeight: number;
    restWeight: number;
    // Rooms per domain (3 = normal, elite/normal, boss)
    roomsPerDomain: number;
    // Total domains (6 for full run)
    totalDomains: number;
    // Guaranteed shop after each domain boss
    guaranteedDomainShop: boolean;
  };

  // === RISK/REWARD PATH SYSTEM ===
  paths: {
    // Safe path: easier but capped potential
    safeEnemyMultiplier: number;          // 0.8 = 80% enemy stats
    safeRewardMultiplier: number;         // 0.4 = 40% rewards (harsh penalty)
    safeItemChance: number;               // Lower chance for items on safe path
    safeLateGamePenalty: number;          // Enemy boost per domain on safe path
    // Risky path: harder but investment pays off
    riskyEnemyMultiplier: number;         // 1.2 = 120% enemy stats
    riskyRewardMultiplier: number;        // 2.5 = 250% rewards
    riskyRareItemChance: number;          // Chance to find rare+ item on risky path
    riskyExtraItemChance: number;         // Chance for BONUS item drop (survival through power)
    riskyHealBonus: number;               // HP restored after risky combat (% of max)
    // How often each path is chosen (for simulation)
    playerRiskTolerance: number;          // 0-1, higher = more risky choices
  };

  // === TARGET METRICS ===
  targets: {
    overallWinRate: number;               // Target win rate (0.25-0.40)
    // 6-domain survival rates
    domain1SurvivalRate: number;          // Should almost always clear
    domain2SurvivalRate: number;          // Light attrition begins
    domain3SurvivalRate: number;          // Moderate challenge
    domain4SurvivalRate: number;          // Serious difficulty
    domain5SurvivalRate: number;          // Endgame territory
    domain6SurvivalRate: number;          // Final domain
    avgItemsPerRun: number;               // Target item acquisition
  };
}

// === PRESETS ===

export const PRESET_BRUTAL: BalanceConfig = {
  player: {
    startingHealth: 100,
    startingGold: 50,
    baseDamage: 20,
    itemSlots: 5,
  },
  combat: {
    enemyHPBase: 50,
    enemyHPAnteMultiplier: 30,
    enemyHPRoomMultiplier: 15,
    enemyDamageBase: 15,
    enemyDamageAnteScaling: 0.5,
    bossHPMultiplier: 3.0,
    bossDamageMultiplier: 1.5,
  },
  scaling: {
    playerDamagePerAnte: 10,
    diceRollMultiplier: 1.0,
    itemFlatDamageMultiplier: 1.0,
    itemPercentMultiplier: 1.0,
    synergyBonus: 0.15,
    tagSetBonus2: 0.10,
    tagSetBonus3: 0.20,
  },
  sustain: {
    restHealPercent: 0.25,
    healItemMultiplier: 1.0,
    shieldEffectiveness: 1.0,
  },
  economy: {
    goldPerRoom: 15,
    goldVariance: 0.3,
    shopPriceMultiplier: 1.0,
    eventGoldChance: 0.3,
  },
  rng: {
    baseCritChance: 0.05,
    baseCritMultiplier: 1.5,
    baseProcChance: 0.10,
    luckyNumberBonus: 0.15,
  },
  rooms: {
    combatWeight: 4,
    shopWeight: 2,
    eventWeight: 2,
    restWeight: 1,
    roomsPerDomain: 3,
    totalDomains: 6,
    guaranteedDomainShop: false,
  },
  paths: {
    safeEnemyMultiplier: 0.85,
    safeRewardMultiplier: 0.35,
    safeItemChance: 0.50,
    safeLateGamePenalty: 0.05,
    riskyEnemyMultiplier: 1.15,
    riskyRewardMultiplier: 2.2,
    riskyRareItemChance: 0.25,
    riskyExtraItemChance: 0.30,
    riskyHealBonus: 0.12,
    playerRiskTolerance: 0.3,
  },
  targets: {
    overallWinRate: 0.25,
    domain1SurvivalRate: 0.90,
    domain2SurvivalRate: 0.80,
    domain3SurvivalRate: 0.65,
    domain4SurvivalRate: 0.50,
    domain5SurvivalRate: 0.38,
    domain6SurvivalRate: 0.28,
    avgItemsPerRun: 4,
  },
};

// Balanced preset - the target
export const PRESET_BALANCED: BalanceConfig = {
  player: {
    startingHealth: 100,
    startingGold: 75,
    baseDamage: 25,
    itemSlots: 5,
  },
  combat: {
    enemyHPBase: 30,
    enemyHPAnteMultiplier: 20,
    enemyHPRoomMultiplier: 10,
    enemyDamageBase: 8,
    enemyDamageAnteScaling: 0.3,
    bossHPMultiplier: 2.5,
    bossDamageMultiplier: 1.3,
  },
  scaling: {
    playerDamagePerAnte: 15,
    diceRollMultiplier: 1.5,
    itemFlatDamageMultiplier: 1.5,
    itemPercentMultiplier: 1.3,
    synergyBonus: 0.25,
    tagSetBonus2: 0.15,
    tagSetBonus3: 0.30,
  },
  sustain: {
    restHealPercent: 0.35,
    healItemMultiplier: 1.5,
    shieldEffectiveness: 1.2,
  },
  economy: {
    goldPerRoom: 20,
    goldVariance: 0.25,
    shopPriceMultiplier: 0.85,
    eventGoldChance: 0.4,
  },
  rng: {
    baseCritChance: 0.08,
    baseCritMultiplier: 1.75,
    baseProcChance: 0.15,
    luckyNumberBonus: 0.20,
  },
  rooms: {
    combatWeight: 3,
    shopWeight: 2,
    eventWeight: 2,
    restWeight: 2,
    roomsPerDomain: 3,
    totalDomains: 6,
    guaranteedDomainShop: true,
  },
  paths: {
    safeEnemyMultiplier: 0.80,
    safeRewardMultiplier: 0.40,
    safeItemChance: 0.60,
    safeLateGamePenalty: 0.04,
    riskyEnemyMultiplier: 1.20,
    riskyRewardMultiplier: 2.5,
    riskyRareItemChance: 0.30,
    riskyExtraItemChance: 0.35,
    riskyHealBonus: 0.15,
    playerRiskTolerance: 0.5,
  },
  targets: {
    overallWinRate: 0.30,
    domain1SurvivalRate: 0.95,
    domain2SurvivalRate: 0.88,
    domain3SurvivalRate: 0.75,
    domain4SurvivalRate: 0.60,
    domain5SurvivalRate: 0.48,
    domain6SurvivalRate: 0.35,
    avgItemsPerRun: 5,
  },
};

// Easy mode for testing
export const PRESET_EASY: BalanceConfig = {
  player: {
    startingHealth: 120,
    startingGold: 100,
    baseDamage: 30,
    itemSlots: 6,
  },
  combat: {
    enemyHPBase: 25,
    enemyHPAnteMultiplier: 15,
    enemyHPRoomMultiplier: 8,
    enemyDamageBase: 5,
    enemyDamageAnteScaling: 0.2,
    bossHPMultiplier: 2.0,
    bossDamageMultiplier: 1.2,
  },
  scaling: {
    playerDamagePerAnte: 20,
    diceRollMultiplier: 2.0,
    itemFlatDamageMultiplier: 2.0,
    itemPercentMultiplier: 1.5,
    synergyBonus: 0.35,
    tagSetBonus2: 0.20,
    tagSetBonus3: 0.40,
  },
  sustain: {
    restHealPercent: 0.50,
    healItemMultiplier: 2.0,
    shieldEffectiveness: 1.5,
  },
  economy: {
    goldPerRoom: 25,
    goldVariance: 0.2,
    shopPriceMultiplier: 0.70,
    eventGoldChance: 0.5,
  },
  rng: {
    baseCritChance: 0.12,
    baseCritMultiplier: 2.0,
    baseProcChance: 0.20,
    luckyNumberBonus: 0.25,
  },
  rooms: {
    combatWeight: 2,
    shopWeight: 3,
    eventWeight: 2,
    restWeight: 3,
    roomsPerDomain: 3,
    totalDomains: 6,
    guaranteedDomainShop: true,
  },
  paths: {
    safeEnemyMultiplier: 0.70,
    safeRewardMultiplier: 0.50,
    safeItemChance: 0.70,
    safeLateGamePenalty: 0.02,
    riskyEnemyMultiplier: 1.10,
    riskyRewardMultiplier: 2.0,
    riskyRareItemChance: 0.40,
    riskyExtraItemChance: 0.40,
    riskyHealBonus: 0.20,
    playerRiskTolerance: 0.6,
  },
  targets: {
    overallWinRate: 0.50,
    domain1SurvivalRate: 0.98,
    domain2SurvivalRate: 0.94,
    domain3SurvivalRate: 0.85,
    domain4SurvivalRate: 0.72,
    domain5SurvivalRate: 0.60,
    domain6SurvivalRate: 0.52,
    avgItemsPerRun: 6,
  },
};

// Risk/Reward preset - the new target design
// Focus: meaningful path choices, 7+ items, chaotic stacking, 30% win rate
export const PRESET_RISK_REWARD: BalanceConfig = {
  player: {
    startingHealth: 100,
    startingGold: 80,
    baseDamage: 20,
    itemSlots: 8, // More slots for chaotic stacking
  },
  combat: {
    enemyHPBase: 35,
    enemyHPAnteMultiplier: 18,
    enemyHPRoomMultiplier: 8,
    enemyDamageBase: 10,
    enemyDamageAnteScaling: 0.35,
    bossHPMultiplier: 2.8,
    bossDamageMultiplier: 1.4,
  },
  scaling: {
    playerDamagePerAnte: 12,
    diceRollMultiplier: 1.2,
    itemFlatDamageMultiplier: 0.7, // Individual items weaker
    itemPercentMultiplier: 0.8,    // But more items = more power
    synergyBonus: 0.35,            // Strong synergy rewards
    tagSetBonus2: 0.20,
    tagSetBonus3: 0.40,
  },
  sustain: {
    restHealPercent: 0.30,
    healItemMultiplier: 1.2,
    shieldEffectiveness: 1.0,
  },
  economy: {
    goldPerRoom: 22,
    goldVariance: 0.25,
    shopPriceMultiplier: 0.70, // Cheaper shops
    eventGoldChance: 0.45,
  },
  rng: {
    baseCritChance: 0.10,
    baseCritMultiplier: 1.8,
    baseProcChance: 0.18,
    luckyNumberBonus: 0.22,
  },
  rooms: {
    combatWeight: 3,
    shopWeight: 3, // More shops for item flow
    eventWeight: 2,
    restWeight: 2,
    roomsPerDomain: 3,
    totalDomains: 6,
    guaranteedDomainShop: true,
  },
  paths: {
    safeEnemyMultiplier: 0.80,    // 80% enemy stats (nerfed from 70%)
    safeRewardMultiplier: 0.40,   // 40% rewards (harsh penalty)
    safeItemChance: 0.55,         // Lower item chance on safe path
    safeLateGamePenalty: 0.05,    // +5% enemy stats per domain on safe
    riskyEnemyMultiplier: 1.15,   // 115% enemy stats (less punishing)
    riskyRewardMultiplier: 2.5,   // 250% rewards (high risk, high reward)
    riskyRareItemChance: 0.35,    // 35% rare+ item chance
    riskyExtraItemChance: 0.40,   // 40% chance for bonus item (power = survival)
    riskyHealBonus: 0.18,         // 18% HP restored after risky fights
    playerRiskTolerance: 0.5,     // Balanced player simulation
  },
  targets: {
    overallWinRate: 0.30,         // 30% target
    domain1SurvivalRate: 0.95,
    domain2SurvivalRate: 0.88,
    domain3SurvivalRate: 0.75,
    domain4SurvivalRate: 0.60,
    domain5SurvivalRate: 0.48,
    domain6SurvivalRate: 0.35,
    avgItemsPerRun: 7,            // 7+ items target
  },
};

// Export all presets
export const BALANCE_PRESETS = {
  brutal: PRESET_BRUTAL,
  balanced: PRESET_BALANCED,
  easy: PRESET_EASY,
  riskReward: PRESET_RISK_REWARD,
} as const;

export type BalancePresetName = keyof typeof BALANCE_PRESETS;

// === MUTATION HELPERS ===

export function mutateConfig(
  base: BalanceConfig,
  mutations: Partial<{
    player: Partial<BalanceConfig['player']>;
    combat: Partial<BalanceConfig['combat']>;
    scaling: Partial<BalanceConfig['scaling']>;
    sustain: Partial<BalanceConfig['sustain']>;
    economy: Partial<BalanceConfig['economy']>;
    rng: Partial<BalanceConfig['rng']>;
    rooms: Partial<BalanceConfig['rooms']>;
    paths: Partial<BalanceConfig['paths']>;
  }>
): BalanceConfig {
  return {
    ...base,
    player: { ...base.player, ...mutations.player },
    combat: { ...base.combat, ...mutations.combat },
    scaling: { ...base.scaling, ...mutations.scaling },
    sustain: { ...base.sustain, ...mutations.sustain },
    economy: { ...base.economy, ...mutations.economy },
    rng: { ...base.rng, ...mutations.rng },
    rooms: { ...base.rooms, ...mutations.rooms },
    paths: { ...base.paths, ...mutations.paths },
    targets: base.targets,
  };
}

// Random perturbation for genetic algorithm
export function perturbConfig(
  config: BalanceConfig,
  intensity: number = 0.1,
  rng: () => number = Math.random
): BalanceConfig {
  const perturb = (value: number) => {
    const delta = (rng() - 0.5) * 2 * intensity * value;
    return Math.max(0.01, value + delta);
  };

  return {
    ...config,
    player: {
      startingHealth: Math.round(perturb(config.player.startingHealth)),
      startingGold: Math.round(perturb(config.player.startingGold)),
      baseDamage: Math.round(perturb(config.player.baseDamage)),
      itemSlots: config.player.itemSlots, // Keep fixed
    },
    combat: {
      enemyHPBase: Math.round(perturb(config.combat.enemyHPBase)),
      enemyHPAnteMultiplier: Math.round(perturb(config.combat.enemyHPAnteMultiplier)),
      enemyHPRoomMultiplier: Math.round(perturb(config.combat.enemyHPRoomMultiplier)),
      enemyDamageBase: Math.round(perturb(config.combat.enemyDamageBase)),
      enemyDamageAnteScaling: perturb(config.combat.enemyDamageAnteScaling),
      bossHPMultiplier: perturb(config.combat.bossHPMultiplier),
      bossDamageMultiplier: perturb(config.combat.bossDamageMultiplier),
    },
    scaling: {
      playerDamagePerAnte: Math.round(perturb(config.scaling.playerDamagePerAnte)),
      diceRollMultiplier: perturb(config.scaling.diceRollMultiplier),
      itemFlatDamageMultiplier: perturb(config.scaling.itemFlatDamageMultiplier),
      itemPercentMultiplier: perturb(config.scaling.itemPercentMultiplier),
      synergyBonus: perturb(config.scaling.synergyBonus),
      tagSetBonus2: perturb(config.scaling.tagSetBonus2),
      tagSetBonus3: perturb(config.scaling.tagSetBonus3),
    },
    sustain: {
      restHealPercent: Math.min(1, perturb(config.sustain.restHealPercent)),
      healItemMultiplier: perturb(config.sustain.healItemMultiplier),
      shieldEffectiveness: perturb(config.sustain.shieldEffectiveness),
    },
    economy: config.economy,
    rng: {
      baseCritChance: Math.min(0.5, perturb(config.rng.baseCritChance)),
      baseCritMultiplier: perturb(config.rng.baseCritMultiplier),
      baseProcChance: Math.min(0.5, perturb(config.rng.baseProcChance)),
      luckyNumberBonus: perturb(config.rng.luckyNumberBonus),
    },
    rooms: config.rooms,
    paths: {
      safeEnemyMultiplier: Math.max(0.70, Math.min(0.90, perturb(config.paths.safeEnemyMultiplier))),
      safeRewardMultiplier: Math.max(0.30, Math.min(0.55, perturb(config.paths.safeRewardMultiplier))),
      safeItemChance: Math.max(0.40, Math.min(0.75, perturb(config.paths.safeItemChance))),
      safeLateGamePenalty: Math.max(0.02, Math.min(0.10, perturb(config.paths.safeLateGamePenalty))),
      riskyEnemyMultiplier: Math.max(1.05, Math.min(1.30, perturb(config.paths.riskyEnemyMultiplier))),
      riskyRewardMultiplier: Math.max(2.0, Math.min(3.5, perturb(config.paths.riskyRewardMultiplier))),
      riskyRareItemChance: Math.max(0.20, Math.min(0.50, perturb(config.paths.riskyRareItemChance))),
      riskyExtraItemChance: Math.max(0.25, Math.min(0.55, perturb(config.paths.riskyExtraItemChance))),
      riskyHealBonus: Math.max(0.10, Math.min(0.30, perturb(config.paths.riskyHealBonus))),
      playerRiskTolerance: config.paths.playerRiskTolerance, // Keep fixed for simulation
    },
    targets: config.targets,
  };
}

// === FITNESS CALCULATION ===

export interface SimulationMetrics {
  winRate: number;
  // 6-domain survival rates
  domain1Survival: number;
  domain2Survival: number;
  domain3Survival: number;
  domain4Survival: number;
  domain5Survival: number;
  domain6Survival: number;
  avgRoomsCleared: number;
  avgItemsAcquired: number;
  avgFinalGold: number;
  combatDeathRate: number;
  bossDeathRate: number;
  // Risk/reward metrics
  riskyPathWinRate: number;      // Win rate when taking risky paths
  safePathWinRate: number;       // Win rate when taking safe paths
  avgTensionMoments: number;     // Avg times HP dropped below 20%
  bossDeathPercent: number;      // % of deaths that happen at boss
  // Element advantage tracking
  elementAdvantageWins: number;  // Wins with element advantage
  elementDisadvantageWins: number; // Wins despite disadvantage
  // Lucky Die tracking
  luckyDieAlignedRuns: number;   // Runs where Lucky Die matched domain
  luckyDieGoldBonus: number;     // Total gold bonus from Lucky Die
}

export function calculateFitness(
  metrics: SimulationMetrics,
  targets: BalanceConfig['targets']
): number {
  // Lower is better (like a loss function)
  let fitness = 0;

  // === PRIMARY: Win rate (most important) ===
  fitness += Math.abs(metrics.winRate - targets.overallWinRate) * 100;

  // === 6-DOMAIN SURVIVAL CURVE ===
  // Early domains weighted higher (should almost always clear)
  fitness += Math.abs(metrics.domain1Survival - targets.domain1SurvivalRate) * 35;
  fitness += Math.abs(metrics.domain2Survival - targets.domain2SurvivalRate) * 30;
  fitness += Math.abs(metrics.domain3Survival - targets.domain3SurvivalRate) * 25;
  fitness += Math.abs(metrics.domain4Survival - targets.domain4SurvivalRate) * 20;
  fitness += Math.abs(metrics.domain5Survival - targets.domain5SurvivalRate) * 15;
  fitness += Math.abs(metrics.domain6Survival - targets.domain6SurvivalRate) * 10;

  // === ITEM ACQUISITION (weight 15) ===
  // Target: 7+ items per run for chaotic stacking
  fitness += Math.abs(metrics.avgItemsAcquired - targets.avgItemsPerRun) * 15;

  // === PATH DIVERSITY (weight 10) ===
  // Risky path should have higher ceiling (35-40% win rate)
  // Safe path should have lower floor (20-25% win rate)
  const riskyTarget = 0.375; // Middle of 35-40%
  const safeTarget = 0.225;  // Middle of 20-25%
  fitness += Math.abs(metrics.riskyPathWinRate - riskyTarget) * 10;
  fitness += Math.abs(metrics.safePathWinRate - safeTarget) * 10;

  // Risky should beat safe by meaningful margin
  const pathSpread = metrics.riskyPathWinRate - metrics.safePathWinRate;
  if (pathSpread < 0.10) {
    fitness += (0.10 - pathSpread) * 30; // Penalize if paths too similar
  }

  // === TENSION MOMENTS (weight 8) ===
  // Target: at least 1 close call per run (HP < 20%)
  const tensionTarget = 1.0;
  if (metrics.avgTensionMoments < tensionTarget) {
    fitness += (tensionTarget - metrics.avgTensionMoments) * 8;
  } else if (metrics.avgTensionMoments > 3.0) {
    // Too many = frustrating, not tense
    fitness += (metrics.avgTensionMoments - 3.0) * 4;
  }

  // === BOSS GATEKEEPER (weight 5) ===
  // Boss should be 30-40% of deaths (meaningful final challenge)
  const bossDeathTarget = 0.35; // Middle of 30-40%
  fitness += Math.abs(metrics.bossDeathPercent - bossDeathTarget) * 5;

  // Penalize if combat is too deadly overall
  if (metrics.combatDeathRate > 0.7) {
    fitness += (metrics.combatDeathRate - 0.7) * 50;
  }

  // === ELEMENT ADVANTAGE (weight 8) ===
  // Element advantage should meaningfully impact win rate
  // Target: 15-20% more wins when aligned
  const elementSpread = metrics.elementAdvantageWins - metrics.elementDisadvantageWins;
  if (elementSpread < 0.15) {
    fitness += (0.15 - elementSpread) * 8;
  }

  // === LUCKY DIE (weight 5) ===
  // Lucky Die alignment should provide noticeable gold bonus
  // Target: at least +15% gold when aligned
  if (metrics.luckyDieAlignedRuns > 0) {
    const avgBonus = metrics.luckyDieGoldBonus / metrics.luckyDieAlignedRuns;
    if (avgBonus < 0.15) {
      fitness += (0.15 - avgBonus) * 5;
    }
  }

  return fitness;
}
