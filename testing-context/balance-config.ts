/**
 * Centralized Balance Configuration
 *
 * All tunable game values in one place for easy iteration.
 * Round 31: Polish & Balance Pass
 */

// ============================================================
// TIER PROGRESSION
// ============================================================

export const TIER_CONFIG = {
  /** Starting tier for new runs */
  startingTier: 1,
  /** Maximum tier (caps progression) */
  maxTier: 5,
  /** Tier up every N domains cleared (1 = every domain) */
  domainsPerTierUp: 1,
} as const;

/**
 * Calculate tier based on domains cleared
 */
export function getTierForDomain(domainsCleared: number): number {
  const tier = TIER_CONFIG.startingTier + Math.floor(domainsCleared / TIER_CONFIG.domainsPerTierUp);
  return Math.min(tier, TIER_CONFIG.maxTier);
}

// ============================================================
// WANDERER EFFECTS (Favor / Calm / Heat)
// ============================================================

export const WANDERER_EFFECTS = {
  favor: {
    /** Gold bonus per favor token on Accept */
    goldBonus: 50,
    /** Shop discount per favor token (0.15 = 15%) */
    shopDiscount: 0.15,
  },
  calm: {
    /** Reroll cost reduction per calm point (0.20 = 20%) */
    rerollCostReduction: 0.20,
  },
  heat: {
    /** Difficulty multiplier per heat point (1.15 = +15%) */
    difficultyMultiplier: 1.15,
    /** Reward multiplier per heat point (1.20 = +20%) */
    rewardMultiplier: 1.20,
  },
} as const;

/**
 * Calculate shop price with favor discount
 */
export function applyFavorDiscount(basePrice: number, favorTokens: number): number {
  const discount = 1 - (favorTokens * WANDERER_EFFECTS.favor.shopDiscount);
  return Math.max(1, Math.floor(basePrice * Math.max(0.5, discount))); // Min 50% off, min 1 gold
}

/**
 * Calculate reroll cost with calm reduction
 */
export function applyRerollCalmReduction(baseCost: number, calmBonus: number): number {
  const reduction = 1 - (calmBonus * WANDERER_EFFECTS.calm.rerollCostReduction);
  return Math.max(1, Math.floor(baseCost * Math.max(0.2, reduction))); // Min 80% off, min 1 gold
}

/**
 * Calculate difficulty with heat modifier
 */
export function applyHeatDifficulty(baseDifficulty: number, heat: number): number {
  return Math.floor(baseDifficulty * Math.pow(WANDERER_EFFECTS.heat.difficultyMultiplier, heat));
}

/**
 * Calculate reward with heat modifier
 */
export function applyHeatReward(baseReward: number, heat: number): number {
  return Math.floor(baseReward * Math.pow(WANDERER_EFFECTS.heat.rewardMultiplier, heat));
}

// ============================================================
// SHOP PRICING
// ============================================================

export const SHOP_PRICING = {
  /** Price multiplier by tier [tier1, tier2, tier3, tier4, tier5] */
  tierMultiplier: [1.0, 1.2, 1.5, 2.0, 2.5],
  /** Base reroll cost */
  baseRerollCost: 25,
} as const;

/**
 * Get price multiplier for a tier
 */
export function getTierPriceMultiplier(tier: number): number {
  const index = Math.max(0, Math.min(tier - 1, SHOP_PRICING.tierMultiplier.length - 1));
  return SHOP_PRICING.tierMultiplier[index];
}

// ============================================================
// DOOR DISTRIBUTION
// ============================================================

export const DOOR_WEIGHTS = {
  stable: {
    /** Base weight (higher = more common) */
    base: 60,
    /** Weight change per tier (negative = less common at higher tiers) */
    perTier: -5,
    /** Minimum weight */
    min: 30,
  },
  elite: {
    base: 25,
    perTier: 5,
    /** Elite only available after room N */
    minRoom: 1,
  },
  anomaly: {
    base: 15,
    perTier: 0,
  },
} as const;

/**
 * Get door appearance chance for a tier
 */
export function getDoorChance(doorType: keyof typeof DOOR_WEIGHTS, tier: number): number {
  const config = DOOR_WEIGHTS[doorType];
  const weight = config.base + (config.perTier * (tier - 1));
  return Math.max('min' in config ? config.min : 5, weight);
}

// ============================================================
// ENCOUNTER RATES
// ============================================================

export const ENCOUNTER_RATES = {
  /** Base chance for wanderer encounter (%) */
  baseChance: 20,
  /** Additional chance per skip pressure (%) */
  skipPressureBonus: 15,
  /** Maximum encounter chance (%) */
  maxChance: 80,
  /** Aggressive NPC bonus per skip pressure (%) */
  aggressiveBonus: 10,
} as const;

/**
 * Calculate encounter chance with skip pressure
 */
export function getEncounterChance(skipPressure: number): number {
  const chance = ENCOUNTER_RATES.baseChance + (skipPressure * ENCOUNTER_RATES.skipPressureBonus);
  return Math.min(chance, ENCOUNTER_RATES.maxChance);
}

// ============================================================
// GOLD REWARDS
// ============================================================

export const GOLD_REWARDS = {
  /** Base gold by reward tier [tier0, tier1, tier2, tier3] */
  byTier: [0, 50, 100, 200],
  /** Domain multiplier increment (Domain 1 = 1x, Domain 6 = 1 + 5 * 0.5 = 3.5x) */
  domainMultiplierIncrement: 0.5,
} as const;

/**
 * Calculate gold reward for clearing a room
 */
export function calculateGoldReward(
  rewardTier: number,
  domain: number,
  heat: number = 0,
  luckySynergy: 'strong' | 'weak' | 'none' = 'none'
): number {
  const base = GOLD_REWARDS.byTier[rewardTier] || GOLD_REWARDS.byTier[1];
  const domainMultiplier = 1 + (domain - 1) * GOLD_REWARDS.domainMultiplierIncrement;
  let reward = Math.floor(base * domainMultiplier);

  // Apply heat bonus
  reward = applyHeatReward(reward, heat);

  // Apply lucky synergy bonus
  reward = Math.floor(reward * LUCKY_SYNERGY.gold[luckySynergy]);

  return reward;
}

// ============================================================
// LUCKY NUMBER SYNERGY
// ============================================================

export const LUCKY_SYNERGY = {
  gold: {
    strong: 1.25, // +25% gold
    weak: 1.10,   // +10% gold
    none: 1.0,
  },
  rarityBump: {
    strong: 1, // +1 tier for pool selection
    weak: 0,
    none: 0,
  },
} as const;

export type LuckySynergyLevel = 'strong' | 'weak' | 'none';

export interface LuckySynergyContext {
  luckyNumber: number;
  protocolRoll?: { domain: number; modifier: number; sponsor: number };
  currentDomain: number;
}

/**
 * Calculate lucky number synergy based on Protocol Roll and current domain.
 * - Lucky #7 (Boots) always has strong synergy
 * - Match current domain = strong, adjacent = weak
 * - Match any Protocol Roll value = strong, adjacent = weak
 */
export function getLuckySynergy(ctx: LuckySynergyContext): LuckySynergyLevel {
  const { luckyNumber, protocolRoll, currentDomain } = ctx;

  // Lucky #7 always strong (Boots special)
  if (luckyNumber === 7) return 'strong';

  // Check domain match first
  if (luckyNumber === currentDomain) return 'strong';

  // Check protocol roll match (strongest wins)
  if (protocolRoll) {
    const rollValues = [protocolRoll.domain, protocolRoll.modifier, protocolRoll.sponsor];
    if (rollValues.includes(luckyNumber)) return 'strong';

    // Check for weak synergy (adjacent values)
    for (const val of rollValues) {
      if (Math.abs(val - luckyNumber) === 1) return 'weak';
    }
  }

  // Check adjacent domain
  if (Math.abs(luckyNumber - currentDomain) === 1) return 'weak';

  return 'none';
}

// ============================================================
// INTEGRITY (Health System)
// ============================================================

export const INTEGRITY_CONFIG = {
  /** Starting integrity */
  max: 100,
  /** Damage on room failure */
  failureDamage: 25,
  /** Damage on encounter loss */
  encounterLossDamage: 15,
  /** Recovery on domain clear */
  domainClearRecovery: 10,
} as const;

// ============================================================
// EXPORT ALL FOR EASY ACCESS
// ============================================================

export const BALANCE = {
  tier: TIER_CONFIG,
  wanderer: WANDERER_EFFECTS,
  shop: SHOP_PRICING,
  doors: DOOR_WEIGHTS,
  encounters: ENCOUNTER_RATES,
  gold: GOLD_REWARDS,
  integrity: INTEGRITY_CONFIG,
  lucky: LUCKY_SYNERGY,
} as const;
