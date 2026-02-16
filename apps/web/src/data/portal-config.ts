/**
 * Portal Configuration - Distance-based domain travel system
 *
 * Core mechanic: Portals have randomly rolled distances (1-5 sectors).
 * Farther = more HP damage, but higher score/gold multipliers.
 *
 * The decision: "Can I afford healing after this jump, and is the gold bonus worth it?"
 */

import { getDomainOrder, isFinale, DOMAIN_CONFIGS } from './domains';
import { createSeededRng, type SeededRng } from './pools';

// Re-export isFinale for external use
export { isFinale };

// ============================================
// TYPES
// ============================================

export interface PortalOption {
  domainId: number;
  domainName: string;
  domainSlug: string;
  element: string;
  distance: number;           // 1-5 sectors (randomly rolled)
  travelDamage: number;       // HP cost to travel (0-20)
  scoreMultiplier: number;    // 1.0 to 1.5
  goldMultiplier: number;     // 1.0 to 1.75
  isUnknown?: boolean;        // True for finale (shows "???")
  hasAffinityBonus?: boolean; // True if die-rector affinity applied
}

// ============================================
// DISTANCE TABLE - Non-linear scaling
// ============================================

export const DISTANCE_TABLE: Record<number, { damage: number; score: number; gold: number }> = {
  1: { damage: 0,  score: 1.00, gold: 1.00 },  // Adjacent = safe path
  2: { damage: 8,  score: 1.10, gold: 1.15 },
  3: { damage: 12, score: 1.20, gold: 1.30 },
  4: { damage: 16, score: 1.35, gold: 1.50 },
  5: { damage: 20, score: 1.50, gold: 1.75 },  // Max risk/reward
};

// ============================================
// TRAVEL CONFIG
// ============================================

export const TRAVEL_CONFIG = {
  /** Minimum HP after travel (can't die from travel) */
  minHpAfterTravel: 1,
  /** Favor reduces travel damage (per token) */
  favorDamageReduction: 1,
  /** Base weight for distance roll (higher = more variance) */
  distanceVariance: 2,
} as const;

// ============================================
// PORTAL POOL CONFIG - Funnel pressure
// ============================================

export const PORTAL_POOL_CONFIG: Record<number, { poolSize: number; showCount: number }> = {
  1: { poolSize: 5, showCount: 3 },  // After D1: 5 candidates, show 3
  2: { poolSize: 4, showCount: 3 },  // After D2: 4 candidates, show 3
  3: { poolSize: 3, showCount: 3 },  // After D3: 3 candidates, show all
  4: { poolSize: 2, showCount: 2 },  // After D4: 2 candidates, binary choice
  5: { poolSize: 1, showCount: 1 },  // After D5: 1 forced (finale)
};

// ============================================
// DIE-RECTOR TO DOMAIN MAPPING
// ============================================

const DIRECTOR_DOMAIN_MAP: Record<string, number> = {
  'john': 1,    // Earth
  'jane': 6,    // Aberrant
  'alice': 2,   // Frost Reach
  'robert': 3,  // Infernus
  'peter': 4,   // Shadow Keep
  'the-one': 5, // Null Providence
};

/**
 * Get domain ID for a die-rector
 */
export function getDirectorDomain(directorSlug: string): number | null {
  return DIRECTOR_DOMAIN_MAP[directorSlug] ?? null;
}

// ============================================
// DISTANCE ROLLING
// ============================================

/**
 * Roll weighted distance (1-5) based on favor
 * Higher favor = distance biased toward lower values
 */
export function rollWeightedDistance(
  rng: () => number,
  favorTokens: number = 0
): number {
  // Base weights: slightly favor middle distances
  const baseWeights = [15, 25, 30, 20, 10]; // 1, 2, 3, 4, 5 sectors

  // Favor shifts weight toward lower distances
  // Each favor token adds +5 to distance 1-2, -3 to distance 4-5
  const favorShift = Math.min(favorTokens, 5); // Cap at 5 tokens
  const weights = baseWeights.map((w, i) => {
    if (i < 2) return w + favorShift * 5;      // Boost 1-2 sectors
    if (i > 2) return Math.max(5, w - favorShift * 3); // Reduce 4-5 sectors
    return w; // 3 sectors unchanged
  });

  // Weighted random selection
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;

  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i + 1;
  }

  return 3; // Fallback to middle
}

// ============================================
// PORTAL GENERATION
// ============================================

/**
 * Generate available portals after clearing a domain
 *
 * @param currentDomain - Domain just cleared
 * @param visitedDomains - Domains already visited (can't revisit)
 * @param favorTokens - Favor tokens (reduce distance rolls)
 * @param directorAffinity - Die-rector slug for affinity bonus (or null)
 * @param seed - RNG seed for deterministic generation
 */
export function getAvailablePortals(
  currentDomain: number,
  visitedDomains: number[],
  favorTokens: number = 0,
  directorAffinity: string | null = null,
  seed: string = ''
): PortalOption[] {
  const rng = createSeededRng(seed || `portal-${currentDomain}-${Date.now()}`);
  const domainOrder = getDomainOrder();

  // Get pool config for current domain
  const poolConfig = PORTAL_POOL_CONFIG[currentDomain] || { poolSize: 3, showCount: 3 };

  // Find all unvisited domains (except current and finale until 5 are cleared)
  const clearedCount = visitedDomains.length;
  const finaleId = domainOrder[domainOrder.length - 1]; // Null Providence

  // Available candidates: all domains not visited, not current
  // Finale only appears once 5 domains have been cleared (visited)
  let candidates = domainOrder.filter(id =>
    id !== currentDomain &&
    !visitedDomains.includes(id) &&
    (id !== finaleId || clearedCount >= 5)
  );

  // If 5+ domains cleared, only finale is available
  if (clearedCount >= 5) {
    candidates = [finaleId];
  }

  // Shuffle and take showCount using rng.shuffle
  const shuffled = rng.shuffle('portal:candidates', candidates);
  const selected = shuffled.slice(0, poolConfig.showCount);

  // Get affinity domain for bonus
  const affinityDomain = directorAffinity ? getDirectorDomain(directorAffinity) : null;

  // Generate portal options with random distances
  return selected.map(domainId => {
    const config = DOMAIN_CONFIGS[domainId];
    const isFinalePortal = isFinale(domainId);

    // Roll distance (or unknown for finale)
    // Create a random function wrapper for rollWeightedDistance
    const distanceRng = () => rng.random(`portal:distance:${domainId}`);
    let distance = rollWeightedDistance(distanceRng, favorTokens);
    let hasAffinityBonus = false;

    // Apply die-rector affinity bonus (-1 distance)
    if (affinityDomain === domainId && distance > 1) {
      distance -= 1;
      hasAffinityBonus = true;
    }

    // Get stats from distance table
    const stats = DISTANCE_TABLE[distance] || DISTANCE_TABLE[3];

    // Apply favor damage reduction
    const baseDamage = stats.damage;
    const favorReduction = favorTokens * TRAVEL_CONFIG.favorDamageReduction;
    const travelDamage = Math.max(0, baseDamage - favorReduction);

    return {
      domainId,
      domainName: config?.name || `Domain ${domainId}`,
      domainSlug: config?.slug || `domain-${domainId}`,
      element: config?.element || 'Neutral',
      distance: isFinalePortal ? 0 : distance, // 0 = unknown for finale
      travelDamage: isFinalePortal ? 0 : travelDamage,
      scoreMultiplier: isFinalePortal ? 1 : stats.score,
      goldMultiplier: isFinalePortal ? 1 : stats.gold,
      isUnknown: isFinalePortal,
      hasAffinityBonus,
    };
  });
}

/**
 * Resolve finale portal distance (called when player commits)
 * Returns 1-5 sectors randomly
 */
export function resolveFinaleDistance(
  rng: () => number,
  favorTokens: number = 0
): { distance: number; travelDamage: number; scoreMultiplier: number; goldMultiplier: number } {
  const distance = rollWeightedDistance(rng, favorTokens);
  const stats = DISTANCE_TABLE[distance];

  // Apply favor damage reduction
  const favorReduction = favorTokens * TRAVEL_CONFIG.favorDamageReduction;
  const travelDamage = Math.max(0, stats.damage - favorReduction);

  return {
    distance,
    travelDamage,
    scoreMultiplier: stats.score,
    goldMultiplier: stats.gold,
  };
}

/**
 * Calculate HP after travel (can't die from travel)
 */
export function calculateHpAfterTravel(currentHp: number, travelDamage: number): number {
  return Math.max(TRAVEL_CONFIG.minHpAfterTravel, currentHp - travelDamage);
}
