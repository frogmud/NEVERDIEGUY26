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
    // Room 3 of each ante has special rules
    ante1FinalRoom: 'combat' | 'event' | 'shop';
    ante2FinalRoom: 'combat' | 'miniboss' | 'event';
    ante3FinalRoom: 'boss';
    // Guaranteed shop at end of each ante
    guaranteedAnteShop: boolean;
  };

  // === RISK/REWARD PATH SYSTEM ===
  paths: {
    // Safe path: easier but lower rewards
    safeEnemyMultiplier: number;          // 0.6 = 60% enemy stats
    safeRewardMultiplier: number;         // 0.5 = 50% rewards
    // Risky path: harder but better rewards
    riskyEnemyMultiplier: number;         // 1.5 = 150% enemy stats
    riskyRewardMultiplier: number;        // 2.0 = 200% rewards
    riskyRareItemChance: number;          // Chance to find rare+ item on risky path
    // How often each path is chosen (for simulation)
    playerRiskTolerance: number;          // 0-1, higher = more risky choices
  };

  // === TARGET METRICS ===
  targets: {
    overallWinRate: number;               // Target win rate (0.25-0.40)
    ante1SurvivalRate: number;            // Should clear ante 1 most of time
    ante2SurvivalRate: number;            // Moderate attrition here
    ante3SurvivalRate: number;            // Final challenge
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
    ante1FinalRoom: 'combat',
    ante2FinalRoom: 'miniboss',
    ante3FinalRoom: 'boss',
    guaranteedAnteShop: false,
  },
  paths: {
    safeEnemyMultiplier: 0.7,
    safeRewardMultiplier: 0.6,
    riskyEnemyMultiplier: 1.4,
    riskyRewardMultiplier: 1.8,
    riskyRareItemChance: 0.15,
    playerRiskTolerance: 0.3,
  },
  targets: {
    overallWinRate: 0.30,
    ante1SurvivalRate: 0.90,
    ante2SurvivalRate: 0.60,
    ante3SurvivalRate: 0.50,
    avgItemsPerRun: 3,
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
    ante1FinalRoom: 'shop',
    ante2FinalRoom: 'event',
    ante3FinalRoom: 'boss',
    guaranteedAnteShop: true,
  },
  paths: {
    safeEnemyMultiplier: 0.6,
    safeRewardMultiplier: 0.5,
    riskyEnemyMultiplier: 1.5,
    riskyRewardMultiplier: 2.0,
    riskyRareItemChance: 0.25,
    playerRiskTolerance: 0.5,
  },
  targets: {
    overallWinRate: 0.30,
    ante1SurvivalRate: 0.95,
    ante2SurvivalRate: 0.70,
    ante3SurvivalRate: 0.45,
    avgItemsPerRun: 4,
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
    ante1FinalRoom: 'shop',
    ante2FinalRoom: 'event',
    ante3FinalRoom: 'boss',
    guaranteedAnteShop: true,
  },
  paths: {
    safeEnemyMultiplier: 0.5,
    safeRewardMultiplier: 0.6,
    riskyEnemyMultiplier: 1.3,
    riskyRewardMultiplier: 1.8,
    riskyRareItemChance: 0.30,
    playerRiskTolerance: 0.6,
  },
  targets: {
    overallWinRate: 0.50,
    ante1SurvivalRate: 0.98,
    ante2SurvivalRate: 0.85,
    ante3SurvivalRate: 0.60,
    avgItemsPerRun: 5,
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
    ante1FinalRoom: 'shop',
    ante2FinalRoom: 'miniboss',
    ante3FinalRoom: 'boss',
    guaranteedAnteShop: true,
  },
  paths: {
    safeEnemyMultiplier: 0.6,     // 60% enemy stats
    safeRewardMultiplier: 0.5,    // 50% rewards
    riskyEnemyMultiplier: 1.5,    // 150% enemy stats
    riskyRewardMultiplier: 2.0,   // 200% rewards
    riskyRareItemChance: 0.25,    // 25% rare+ item chance
    playerRiskTolerance: 0.5,     // Balanced player simulation
  },
  targets: {
    overallWinRate: 0.30,         // 30% target
    ante1SurvivalRate: 0.92,
    ante2SurvivalRate: 0.65,
    ante3SurvivalRate: 0.48,
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
      safeEnemyMultiplier: Math.max(0.3, Math.min(0.9, perturb(config.paths.safeEnemyMultiplier))),
      safeRewardMultiplier: Math.max(0.3, Math.min(0.8, perturb(config.paths.safeRewardMultiplier))),
      riskyEnemyMultiplier: Math.max(1.1, Math.min(2.0, perturb(config.paths.riskyEnemyMultiplier))),
      riskyRewardMultiplier: Math.max(1.5, Math.min(3.0, perturb(config.paths.riskyRewardMultiplier))),
      riskyRareItemChance: Math.max(0.1, Math.min(0.5, perturb(config.paths.riskyRareItemChance))),
      playerRiskTolerance: config.paths.playerRiskTolerance, // Keep fixed for simulation
    },
    targets: config.targets,
  };
}

// === FITNESS CALCULATION ===

export interface SimulationMetrics {
  winRate: number;
  ante1Survival: number;
  ante2Survival: number;
  ante3Survival: number;
  avgRoomsCleared: number;
  avgItemsAcquired: number;
  avgFinalGold: number;
  combatDeathRate: number;
  bossDeathRate: number;
  // New risk/reward metrics
  riskyPathWinRate: number;      // Win rate when taking risky paths
  safePathWinRate: number;       // Win rate when taking safe paths
  avgTensionMoments: number;     // Avg times HP dropped below 20%
  bossDeathPercent: number;      // % of deaths that happen at boss
}

export function calculateFitness(
  metrics: SimulationMetrics,
  targets: BalanceConfig['targets']
): number {
  // Lower is better (like a loss function)
  let fitness = 0;

  // === PRIMARY: Win rate (most important) ===
  fitness += Math.abs(metrics.winRate - targets.overallWinRate) * 100;

  // === ANTE SURVIVAL CURVE ===
  fitness += Math.abs(metrics.ante1Survival - targets.ante1SurvivalRate) * 30;
  fitness += Math.abs(metrics.ante2Survival - targets.ante2SurvivalRate) * 20;
  fitness += Math.abs(metrics.ante3Survival - targets.ante3SurvivalRate) * 15;

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

  return fitness;
}
