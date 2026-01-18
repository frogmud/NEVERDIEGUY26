/**
 * Centralized Balance Configuration
 *
 * All tunable game values in one place for easy iteration.
 * Round 31: Polish & Balance Pass
 *
 * === BALANCE PHILOSOPHY ===
 *
 * CORE DESIGN PILLARS:
 * 1. Meaningful Choices > Optimal Paths - Every decision should feel like a trade-off
 * 2. Skill Expression Through Dice Management - The throw/trade system is the heartbeat
 * 3. Readable Difficulty Curve - Players should FEEL domains getting harder, not hit walls
 * 4. Economy as Pacing Mechanism - Gold controls tempo of power acquisition
 *
 * THE THREE LEVERS:
 * 1. Action Economy - Throws/turn, trades/turn, hand size (never give free actions!)
 * 2. Point Generation - Die values, score multiplier, element bonus (cap multiplicative!)
 * 3. Resource Pressure - Integrity damage, gold costs, satchel capacity
 *
 * RED FLAGS TO WATCH:
 * - "Always X" strategies (remove choice or rebalance)
 * - Empty shops (prices too low or gold too high)
 * - Inventory hoarding (consumables too precious or too weak)
 * - Skip spam (small room rewards too low)
 * - One-shot builds (cap problematic interactions)
 *
 * CURRENT CONCERNS (from senior dev review):
 * - Null Providence (finale) score goal may need tuning if time pressure adds too much
 * - Lucky #7 is powerful; monitor for overuse
 * - Starting gold 0g means players must win events to buy upgrades
 */

import { getDomainPosition } from './domains';

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
 * Capped at 2.0x to prevent runaway at high heat levels
 */
export function applyHeatReward(baseReward: number, heat: number): number {
  const uncapped = Math.pow(WANDERER_EFFECTS.heat.rewardMultiplier, heat);
  const capped = Math.min(uncapped, 2.0); // Cap at 2x max
  return Math.floor(baseReward * capped);
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
  /** Domain multiplier increment (Position 1 = 1x, Position 6 = 1 + 5 * 0.5 = 3.5x) */
  domainMultiplierIncrement: 0.5,
} as const;

// ============================================================
// GOLD CAP (Soft Cap / Hard Cap)
// Prevents late-game gold hoarding and trivializing shop
// ============================================================

export const GOLD_CONFIG = {
  /** Soft cap - diminishing returns above this */
  softCap: 500,
  /** Hard cap - max gold player can have */
  hardCap: 1000,
  /** Gold above soft cap is multiplied by this (0.5 = 50%) */
  diminishingRate: 0.5,
} as const;

/**
 * Calculate actual gold gain with soft/hard cap
 * - Below soft cap: full gold
 * - Above soft cap: diminishing returns
 * - At hard cap: no gold
 */
export function calculateGoldGain(rawGold: number, currentGold: number): number {
  if (currentGold >= GOLD_CONFIG.hardCap) {
    return 0; // At cap, no more gold
  }

  if (currentGold + rawGold <= GOLD_CONFIG.softCap) {
    return rawGold; // Below soft cap, full value
  }

  // Above soft cap: apply diminishing returns
  const belowCap = Math.max(0, GOLD_CONFIG.softCap - currentGold);
  const aboveCap = rawGold - belowCap;
  const diminished = Math.floor(aboveCap * GOLD_CONFIG.diminishingRate);

  return Math.min(
    belowCap + diminished,
    GOLD_CONFIG.hardCap - currentGold // Don't exceed hard cap
  );
}

/**
 * Calculate gold reward for clearing a room
 * Uses domain POSITION (not raw ID) for scaling - ensures progression rewards align
 */
export function calculateGoldReward(
  rewardTier: number,
  domain: number,
  heat: number = 0,
  luckySynergy: 'strong' | 'weak' | 'none' = 'none'
): number {
  const base = GOLD_REWARDS.byTier[rewardTier] || GOLD_REWARDS.byTier[1];
  const position = getDomainPosition(domain);
  const domainMultiplier = 1 + (position - 1) * GOLD_REWARDS.domainMultiplierIncrement;
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
// TIME PRESSURE SYSTEM
// Creates urgency during combat - score multiplier decays after grace period
// ============================================================

export interface TimerConfig {
  /** Turns before decay starts (grace period) */
  graceTurns: number;
  /** Score multiplier reduction per turn after grace (-5% = 0.05) */
  decayPerTurn: number;
  /** Minimum multiplier floor (can't go below 60%) */
  minMultiplier: number;
  /** Bonus multiplier per unused turn on victory (+10% = 0.10) */
  earlyFinishBonus: number;
}

export const TIMER_CONFIG: TimerConfig = {
  graceTurns: 2,
  decayPerTurn: 0.05,
  minMultiplier: 0.60,
  earlyFinishBonus: 0.10,
};

/**
 * Room-type specific overrides for timer config
 * - Elite: Slightly lower floor (0.55)
 * - Boss: More grace (3 turns), slower decay, lower floor (0.50)
 */
export const TIMER_CONFIG_BY_ROOM: Record<
  'normal' | 'elite' | 'boss',
  Partial<TimerConfig>
> = {
  normal: {},
  elite: { minMultiplier: 0.55 },
  boss: { graceTurns: 3, decayPerTurn: 0.04, minMultiplier: 0.50 },
};

export type RoomType = 'normal' | 'elite' | 'boss';

/**
 * Get merged timer config for a room type
 */
export function getTimerConfigForRoom(roomType: RoomType): TimerConfig {
  return { ...TIMER_CONFIG, ...TIMER_CONFIG_BY_ROOM[roomType] };
}

/**
 * Calculate time pressure multiplier for current turn
 * @param turnNumber - Current turn (1-indexed)
 * @param roomType - Room type for config lookup
 * @returns Multiplier between minMultiplier and 1.0
 */
export function getTimePressureMultiplier(
  turnNumber: number,
  roomType: RoomType = 'normal'
): number {
  const config = getTimerConfigForRoom(roomType);

  if (turnNumber <= config.graceTurns) {
    return 1.0;
  }

  const decayTurns = turnNumber - config.graceTurns;
  const decay = decayTurns * config.decayPerTurn;

  return Math.max(config.minMultiplier, 1.0 - decay);
}

/**
 * Calculate early finish bonus multiplier
 * @param turnsRemaining - Unused turns at victory
 * @returns Bonus multiplier (1.0 = no bonus, 1.3 = 30% bonus)
 */
export function getEarlyFinishBonus(turnsRemaining: number): number {
  return 1.0 + turnsRemaining * TIMER_CONFIG.earlyFinishBonus;
}

/**
 * Check if currently in grace period
 */
export function isInGracePeriod(
  turnNumber: number,
  roomType: RoomType = 'normal'
): boolean {
  const config = getTimerConfigForRoom(roomType);
  return turnNumber <= config.graceTurns;
}

// ============================================================
// ITEM PERSISTENCE (Portal Travel)
// Items below Epic rarity expire when teleporting between domains
// ============================================================

export const ITEM_PERSISTENCE = {
  /** Rarities that survive teleport */
  persistentRarities: ['Epic', 'Legendary', 'Unique'] as const,
  /** Rarities that expire on teleport */
  expiringRarities: ['Common', 'Uncommon', 'Rare'] as const,
  /** Special flag for Rare items that persist (quest items, etc.) */
  persistFlaggedRare: true,
} as const;

export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Unique';

/**
 * Check if an item survives portal travel
 * Epic+ always survives, Rare can survive if flagged
 */
export function isItemPersistent(rarity: ItemRarity, hasPersistFlag?: boolean): boolean {
  if ((ITEM_PERSISTENCE.persistentRarities as readonly string[]).includes(rarity)) {
    return true;
  }
  if (rarity === 'Rare' && hasPersistFlag && ITEM_PERSISTENCE.persistFlaggedRare) {
    return true;
  }
  return false;
}

/**
 * Filter inventory to only persistent items (for portal travel)
 */
export function filterPersistentItems<T extends { rarity: ItemRarity; persistFlag?: boolean }>(
  items: T[]
): T[] {
  return items.filter(item => isItemPersistent(item.rarity, item.persistFlag));
}

/**
 * Get items that will expire on portal travel (for UI warning)
 */
export function getExpiringItems<T extends { rarity: ItemRarity; persistFlag?: boolean }>(
  items: T[]
): T[] {
  return items.filter(item => !isItemPersistent(item.rarity, item.persistFlag));
}

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
  goldCap: GOLD_CONFIG,
  integrity: INTEGRITY_CONFIG,
  lucky: LUCKY_SYNERGY,
  timer: TIMER_CONFIG,
  itemPersistence: ITEM_PERSISTENCE,
} as const;
