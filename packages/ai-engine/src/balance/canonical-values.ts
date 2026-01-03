/**
 * Canonical Game Values
 *
 * These values are synced from the NEVERDIEGUY26 web app's actual game balance.
 * The sims should use these to match real gameplay.
 *
 * Reference:
 * - /apps/web/src/data/balance-config.ts
 * - /apps/web/src/data/lucky-die/index.ts
 * - /apps/web/src/data/dice/mechanics.ts
 * - /ndg-ds-and-dam/docs/rarity-system.md
 */

// ============================================================
// PROGRESSION STRUCTURE
// ============================================================

/** 6 domains instead of 3 antes */
export const TOTAL_DOMAINS = 6;

/** 3 rooms per domain (normal, elite/normal, boss) */
export const ROOMS_PER_DOMAIN = 3;

/** Total rooms in a full run */
export const TOTAL_ROOMS = TOTAL_DOMAINS * ROOMS_PER_DOMAIN; // 18

/** Domain names and elements */
export type Element = 'Void' | 'Earth' | 'Death' | 'Fire' | 'Ice' | 'Wind';

export interface DomainInfo {
  id: number;
  name: string;
  element: Element;
  tier: number;
  goldMultiplier: number;
}

export const DOMAINS: DomainInfo[] = [
  { id: 1, name: 'Null Providence', element: 'Void', tier: 1, goldMultiplier: 1.0 },
  { id: 2, name: 'Earth', element: 'Earth', tier: 1, goldMultiplier: 1.5 },
  { id: 3, name: 'Shadow Keep', element: 'Death', tier: 2, goldMultiplier: 2.0 },
  { id: 4, name: 'Infernus', element: 'Fire', tier: 3, goldMultiplier: 2.5 },
  { id: 5, name: 'Frost Reach', element: 'Ice', tier: 4, goldMultiplier: 3.0 },
  { id: 6, name: 'Aberrant', element: 'Wind', tier: 5, goldMultiplier: 3.5 },
];

// ============================================================
// LUCKY DIE BONUSES
// ============================================================

/**
 * Lucky Die bonuses when playing in aligned domain
 * Each die is tied to an element/Die-rector
 */
export const LUCKY_DIE_BONUSES = {
  /** +20% gold when using matching die in aligned domain */
  goldBonus: 1.20,

  /** +2 to crit threshold (roll needed for crit) */
  critBonus: 2,

  /** +15% score multiplier in aligned domain */
  domainBonus: 1.15,

  /** -10% shop prices when aligned */
  shopDiscount: 0.90,

  /** +1 starting relationship with aligned NPC */
  relationshipBoost: 1,
};

/** Lucky Die alignments - which die goes with which domain/element */
export type DieSides = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export const LUCKY_DIE_ELEMENT: Record<DieSides, Element> = {
  d4: 'Void',
  d6: 'Earth',
  d8: 'Death',
  d10: 'Fire',
  d12: 'Ice',
  d20: 'Wind',
};

export const LUCKY_DIE_DIRECTOR: Record<DieSides, string> = {
  d4: 'the-one',
  d6: 'peter',
  d8: 'rhea',
  d10: 'alice',
  d12: 'jane',
  d20: 'robert',
};

// ============================================================
// ELEMENT WHEEL (ADVANTAGE/WEAKNESS)
// ============================================================

/**
 * Element advantage wheel: Void -> Earth -> Death -> Fire -> Ice -> Wind -> Void
 * - 1.5x damage when you have advantage
 * - 0.5x damage when at disadvantage
 */
export const ELEMENT_WHEEL: Record<
  Element,
  { beats: Element; weakTo: Element }
> = {
  Void: { beats: 'Earth', weakTo: 'Wind' },
  Earth: { beats: 'Death', weakTo: 'Void' },
  Death: { beats: 'Fire', weakTo: 'Earth' },
  Fire: { beats: 'Ice', weakTo: 'Death' },
  Ice: { beats: 'Wind', weakTo: 'Fire' },
  Wind: { beats: 'Void', weakTo: 'Ice' },
};

export const ELEMENT_MULTIPLIERS = {
  advantage: 1.5,
  neutral: 1.0,
  weakness: 0.5,
};

/**
 * Get element multiplier for attack
 */
export function getElementMultiplier(
  attackerElement: Element,
  defenderElement: Element
): number {
  if (ELEMENT_WHEEL[attackerElement].beats === defenderElement) {
    return ELEMENT_MULTIPLIERS.advantage;
  }
  if (ELEMENT_WHEEL[attackerElement].weakTo === defenderElement) {
    return ELEMENT_MULTIPLIERS.weakness;
  }
  return ELEMENT_MULTIPLIERS.neutral;
}

// ============================================================
// DICE CRIT THRESHOLDS
// ============================================================

/**
 * Each die has a different crit threshold
 * Roll >= threshold = critical hit
 */
export const DICE_CRIT_THRESHOLDS: Record<DieSides, number> = {
  d4: 4, // 25% chance (only on max)
  d6: 6, // 17% chance (only on max)
  d8: 7, // 25% chance (7-8)
  d10: 9, // 20% chance (9-10)
  d12: 11, // 17% chance (11-12)
  d20: 18, // 15% chance (18-20)
};

/**
 * Crit damage multiplier
 */
export const CRIT_MULTIPLIER = 2.0;

/**
 * Check if roll is a crit
 */
export function isCrit(die: DieSides, roll: number): boolean {
  return roll >= DICE_CRIT_THRESHOLDS[die];
}

/**
 * Get crit chance for a die
 */
export function getCritChance(die: DieSides): number {
  const faces = parseInt(die.slice(1));
  const threshold = DICE_CRIT_THRESHOLDS[die];
  return (faces - threshold + 1) / faces;
}

// ============================================================
// HEAT / FAVOR / CALM SYSTEM
// ============================================================

export const HEAT_SYSTEM = {
  /** Difficulty multiplier per heat point (exponential) */
  difficultyPerPoint: 1.15,

  /** Reward multiplier per heat point */
  rewardPerPoint: 1.20,

  /** Heat gained from elite door */
  eliteDoorHeat: 1,

  /** Max heat cap */
  maxHeat: 10,
};

export const FAVOR_SYSTEM = {
  /** Bonus gold per favor token */
  goldPerToken: 50,

  /** Shop discount per favor token */
  discountPerToken: 0.15, // -15%

  /** Max favor tokens */
  maxTokens: 5,
};

export const CALM_SYSTEM = {
  /** Reroll cost reduction per calm point */
  rerollReductionPerPoint: 0.20, // -20%

  /** Minimum reroll cost (floor) */
  minRerollCost: 0.20, // 20% of base

  /** Max calm points */
  maxCalm: 4,
};

/**
 * Calculate difficulty multiplier from heat
 */
export function getHeatDifficultyMultiplier(heat: number): number {
  return Math.pow(HEAT_SYSTEM.difficultyPerPoint, heat);
}

/**
 * Calculate reward multiplier from heat
 */
export function getHeatRewardMultiplier(heat: number): number {
  return Math.pow(HEAT_SYSTEM.rewardPerPoint, heat);
}

/**
 * Calculate favor gold bonus
 */
export function getFavorGoldBonus(favorTokens: number): number {
  return favorTokens * FAVOR_SYSTEM.goldPerToken;
}

/**
 * Calculate favor shop discount
 */
export function getFavorShopDiscount(favorTokens: number): number {
  return 1 - favorTokens * FAVOR_SYSTEM.discountPerToken;
}

/**
 * Calculate calm reroll cost multiplier
 */
export function getCalmRerollMultiplier(calmPoints: number): number {
  const reduction = 1 - calmPoints * CALM_SYSTEM.rerollReductionPerPoint;
  return Math.max(CALM_SYSTEM.minRerollCost, reduction);
}

// ============================================================
// TIER PRICE MULTIPLIERS
// ============================================================

export const TIER_PRICE_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.2,
  3: 1.5,
  4: 2.0,
  5: 2.5,
};

/**
 * Get shop price multiplier for tier
 */
export function getTierPriceMultiplier(tier: number): number {
  return TIER_PRICE_MULTIPLIERS[tier] ?? TIER_PRICE_MULTIPLIERS[5];
}

// ============================================================
// GOLD REWARDS
// ============================================================

export const GOLD_REWARDS = {
  /** Base gold per room type */
  base: {
    normal: 50,
    elite: 100,
    boss: 200,
  },

  /** Lucky synergy bonuses */
  luckyAligned: 1.25, // +25% when using aligned die
  luckyWeak: 1.10, // +10% for non-aligned die (weak synergy)
};

/**
 * Calculate gold reward for clearing a room
 */
export function calculateGoldReward(
  roomType: 'normal' | 'elite' | 'boss',
  domain: number,
  heat: number,
  luckyDie?: DieSides
): number {
  // Base gold for room type
  let gold = GOLD_REWARDS.base[roomType];

  // Domain multiplier (1.0x -> 3.5x)
  const domainInfo = DOMAINS.find((d) => d.id === domain);
  if (domainInfo) {
    gold *= domainInfo.goldMultiplier;
  }

  // Heat reward bonus
  gold *= getHeatRewardMultiplier(heat);

  // Lucky Die synergy
  if (luckyDie && domainInfo) {
    const dieElement = LUCKY_DIE_ELEMENT[luckyDie];
    if (dieElement === domainInfo.element) {
      gold *= GOLD_REWARDS.luckyAligned;
    } else {
      gold *= GOLD_REWARDS.luckyWeak;
    }
  }

  return Math.round(gold);
}

// ============================================================
// SCORE GOALS (synced with meteor engine)
// ============================================================

export const SCORE_GOALS = {
  /**
   * Base score goal per room (from meteor engine)
   * This is the foundation - much higher than before to create real challenge
   */
  baseGoal: 1000,

  /**
   * Domain multiplier - exponential scaling per domain
   * Domain 1: 1000, Domain 2: 1500, Domain 3: 2250, etc.
   */
  domainMultiplier: 1.5,

  /**
   * Room multiplier within domain
   * Room 1: 1x, Room 2: 1.25x, Room 3: 1.5625x
   */
  roomMultiplier: 1.25,

  /** Elite room score multiplier (on top of base) */
  eliteMultiplier: 1.5,

  /** Boss room score multiplier (on top of base) */
  bossMultiplier: 2.0,
};

/**
 * Calculate score goal for a room (matches meteor engine formula)
 */
export function calculateScoreGoal(
  domain: number,
  roomNumber: number,
  roomType: 'normal' | 'elite' | 'boss',
  heat: number
): number {
  // Base goal
  let goal = SCORE_GOALS.baseGoal;

  // Domain scaling (exponential)
  goal *= Math.pow(SCORE_GOALS.domainMultiplier, domain - 1);

  // Room scaling within domain (exponential)
  goal *= Math.pow(SCORE_GOALS.roomMultiplier, roomNumber - 1);

  // Room type multiplier
  if (roomType === 'elite') {
    goal *= SCORE_GOALS.eliteMultiplier;
  } else if (roomType === 'boss') {
    goal *= SCORE_GOALS.bossMultiplier;
  }

  // Heat difficulty
  goal *= getHeatDifficultyMultiplier(heat);

  return Math.round(goal);
}

// ============================================================
// SPAWN COUNTS
// ============================================================

export const SPAWN_COUNTS = {
  normal: { min: 3, max: 5 },
  elite: { min: 4, max: 6 },
  boss: { min: 1, max: 1 }, // Boss is solo
};

/**
 * Get spawn count range for room type
 */
export function getSpawnCountRange(
  roomType: 'normal' | 'elite' | 'boss'
): { min: number; max: number } {
  return SPAWN_COUNTS[roomType];
}

// ============================================================
// SURVIVAL RATE TARGETS (6 domains)
// ============================================================

export const DOMAIN_SURVIVAL_TARGETS = {
  domain1: 0.95, // Should almost always clear domain 1
  domain2: 0.88, // Light attrition begins
  domain3: 0.75, // Moderate challenge
  domain4: 0.60, // Serious difficulty
  domain5: 0.48, // Endgame territory
  domain6: 0.35, // Final domain, target ~30% win rate
};

// ============================================================
// HELPER: Get domain info by number
// ============================================================

export function getDomainInfo(domainNumber: number): DomainInfo | undefined {
  return DOMAINS.find((d) => d.id === domainNumber);
}

export function getDomainElement(domainNumber: number): Element | undefined {
  return getDomainInfo(domainNumber)?.element;
}

export function getDomainTier(domainNumber: number): number {
  return getDomainInfo(domainNumber)?.tier ?? 1;
}

export function isLuckyDieAligned(die: DieSides, domain: number): boolean {
  const domainElement = getDomainElement(domain);
  return domainElement ? LUCKY_DIE_ELEMENT[die] === domainElement : false;
}
