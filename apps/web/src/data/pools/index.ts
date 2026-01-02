/**
 * Pool Generators for Run Loop
 *
 * Provides deterministic, data-driven item pools for:
 * - Requisition (shop) tiers
 * - Door previews
 * - Anomaly rewards
 * - Starter kits
 *
 * Three-axis filtering:
 * - tier     -> controls RARITY (Common -> Legendary)
 * - domain   -> controls FLAVOR (element affinity, domain-specific items)
 * - tags     -> controls SYSTEM TYPE (operator, requisition, override, audit)
 */

import { getEntitiesByCategory, getEntity, getRelated } from '../wiki';
import type { Item, Rarity, Element, Domain, Wanderer } from '../wiki/types';
import { createSeededRng, type SeededRng } from './seededRng';
import { getDoorChance, DOOR_WEIGHTS, LUCKY_SYNERGY, type LuckySynergyLevel } from '../balance-config';

// Re-export seeded RNG utilities
export { createSeededRng, generateThreadId, getDailySeed } from './seededRng';
export type { SeededRng } from './seededRng';

// Tier to rarity mapping
const TIER_RARITY_MAP: Record<number, Rarity[]> = {
  1: ['Common', 'Uncommon'],
  2: ['Common', 'Uncommon', 'Rare'],
  3: ['Uncommon', 'Rare', 'Epic'],
  4: ['Rare', 'Epic', 'Legendary'],
  5: ['Epic', 'Legendary', 'Unique'],
};

// Item types excluded from requisition pools
const EXCLUDED_ITEM_TYPES = ['Quest', 'Currency'];

// Door preview promise types (not exact loot)
export type DoorPromise =
  | '+Credits'
  | '+Data'
  | 'Rare Issuance'
  | 'Anomaly Chance'
  | 'Wanderer Bias'
  | 'Heat Spike'
  | 'Override';

export interface DoorPreview {
  doorType: 'stable' | 'elite' | 'anomaly' | 'audit';
  promises: DoorPromise[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  element?: Element;
  label: string;
}

export interface RequisitionConfig {
  tier: number;
  domain?: string;
  element?: Element;
  count?: number;
  excludeTypes?: string[];
  includeOverride?: boolean; // For audit prep
}

/**
 * Get all items suitable for requisition pools
 */
function getAllRequisitionItems(): Item[] {
  const items = getEntitiesByCategory('items') as Item[];
  return items.filter(
    (item) => item.itemType && !EXCLUDED_ITEM_TYPES.includes(item.itemType)
  );
}

/**
 * Filter items by tier (rarity-based)
 */
function filterByTier(items: Item[], tier: number): Item[] {
  const allowedRarities = TIER_RARITY_MAP[tier] || TIER_RARITY_MAP[3];
  return items.filter((item) => item.rarity && allowedRarities.includes(item.rarity));
}

/**
 * Sort items by element affinity (matching element appears first)
 */
function sortByElementAffinity(items: Item[], element?: Element): Item[] {
  if (!element) return items;
  return [...items].sort((a, b) => {
    const aMatch = a.element === element ? 1 : 0;
    const bMatch = b.element === element ? 1 : 0;
    return bMatch - aMatch;
  });
}

/**
 * Get requisition pool for a tier/domain
 *
 * @param config - Pool configuration
 * @param rng - Seeded RNG for deterministic selection
 * @param luckySynergy - Optional lucky number synergy for tier boost
 * @returns Array of items for the shop
 */
export function getRequisitionPool(
  config: RequisitionConfig,
  rng: SeededRng,
  luckySynergy: LuckySynergyLevel = 'none'
): Item[] {
  const { tier, domain: domainSlug, element, count = 6, excludeTypes = [], includeOverride = false } = config;

  // Apply lucky synergy tier bump (strong synergy = +1 tier for better rarity)
  const effectiveTier = Math.min(5, tier + LUCKY_SYNERGY.rarityBump[luckySynergy]);

  let pool = getAllRequisitionItems();

  // Filter by effective tier (includes synergy bump)
  pool = filterByTier(pool, effectiveTier);

  // Filter out excluded types
  if (excludeTypes.length > 0) {
    pool = pool.filter((item) => !excludeTypes.includes(item.itemType || ''));
  }

  // Sort by element affinity if domain specified
  let domainElement = element;
  if (domainSlug && !domainElement) {
    const domain = getEntity(domainSlug) as Domain | undefined;
    domainElement = domain?.element;
  }
  pool = sortByElementAffinity(pool, domainElement);

  // Fallback: if pool is too small, expand to adjacent tier
  if (pool.length < count) {
    const expandedTier = Math.max(1, tier - 1);
    const expanded = filterByTier(getAllRequisitionItems(), expandedTier);
    pool = [...pool, ...expanded.filter((item) => !pool.includes(item))];
  }

  // Select items deterministically (namespace includes effectiveTier for synergy variation)
  const namespace = `requisition:tier:${effectiveTier}:domain:${domainSlug || 'none'}`;
  let selected = rng.pickN(namespace, pool, count);

  // Add guaranteed Override item for audit prep
  if (includeOverride) {
    const overrideItems = getAllRequisitionItems().filter(
      (item) => item.rarity === 'Epic' || item.rarity === 'Legendary'
    );
    if (overrideItems.length > 0) {
      const override = rng.pick(`${namespace}:override`, overrideItems);
      if (override && !selected.includes(override)) {
        selected = [override, ...selected.slice(0, count - 1)];
      }
    }
  }

  return selected;
}

/**
 * Generate door preview for room selection
 *
 * @param doorType - Type of door
 * @param domainSlug - Current domain
 * @param rng - Seeded RNG
 * @param roomIndex - Current room index
 */
export function getDoorPreview(
  doorType: DoorPreview['doorType'],
  domainSlug: string,
  rng: SeededRng,
  roomIndex: number
): DoorPreview {
  const domain = getEntity(domainSlug) as Domain | undefined;
  const namespace = `doorPreview:${doorType}:room:${roomIndex}`;

  const basePromises: DoorPromise[] = ['+Credits'];

  switch (doorType) {
    case 'stable':
      return {
        doorType,
        promises: ['+Credits', rng.chance(namespace, 30) ? '+Data' : '+Credits'],
        difficulty: 2,
        element: domain?.element,
        label: 'Stable Corridor',
      };

    case 'elite':
      return {
        doorType,
        promises: ['+Credits', 'Rare Issuance', rng.chance(namespace, 40) ? 'Heat Spike' : '+Data'],
        difficulty: 4,
        element: domain?.element,
        label: 'High Heat Sector',
      };

    case 'anomaly':
      return {
        doorType,
        promises: [
          rng.chance(namespace, 50) ? 'Anomaly Chance' : 'Wanderer Bias',
          rng.chance(namespace, 30) ? 'Override' : 'Rare Issuance',
        ],
        difficulty: 3,
        element: domain?.element,
        label: 'Anomaly Node',
      };

    case 'audit':
      return {
        doorType,
        promises: ['Rare Issuance', 'Override', '+Data'],
        difficulty: 5,
        element: domain?.element,
        label: 'Director Audit',
      };

    default:
      return {
        doorType: 'stable',
        promises: basePromises,
        difficulty: 2,
        element: domain?.element,
        label: 'Unknown',
      };
  }
}

/**
 * Get available doors for room selection
 * Round 31: Uses balance config for tier-scaled door weights
 */
export function getAvailableDoors(
  domainSlug: string,
  roomIndex: number,
  tier: number,
  rng: SeededRng
): DoorPreview[] {
  const namespace = `doorSelect:room:${roomIndex}:tier:${tier}`;

  // Always offer stable
  const doors: DoorPreview[] = [getDoorPreview('stable', domainSlug, rng, roomIndex)];

  // Elite door available after minRoom, chance scales with tier (Round 31)
  const eliteChance = getDoorChance('elite', tier);
  if (roomIndex >= DOOR_WEIGHTS.elite.minRoom && rng.chance(namespace + ':elite', eliteChance)) {
    doors.push(getDoorPreview('elite', domainSlug, rng, roomIndex));
  }

  // Anomaly door has tier-scaled chance (Round 31)
  const anomalyChance = getDoorChance('anomaly', tier);
  if (rng.chance(namespace + ':anomaly', anomalyChance)) {
    doors.push(getDoorPreview('anomaly', domainSlug, rng, roomIndex));
  }

  return doors;
}

/**
 * Get starter kit items for thread setup
 */
export interface StarterKit {
  id: string;
  name: string;
  description: string;
  items: Item[];
  perkTag?: string;
}

export function getStarterKits(rng: SeededRng): StarterKit[] {
  const allItems = getAllRequisitionItems();
  const tier1Items = filterByTier(allItems, 1);

  // Kit A: Balanced
  const balancedItems = rng.pickN('starterKit:balanced', tier1Items, 3);

  // Kit B: Aggressive (weapons/consumables)
  const aggressivePool = tier1Items.filter(
    (i) => i.itemType === 'Weapon' || i.itemType === 'Consumable'
  );
  const aggressiveItems =
    aggressivePool.length >= 3
      ? rng.pickN('starterKit:aggressive', aggressivePool, 3)
      : rng.pickN('starterKit:aggressive', tier1Items, 3);

  // Kit C: Defensive (armor/artifacts)
  const defensivePool = tier1Items.filter(
    (i) => i.itemType === 'Armor' || i.itemType === 'Artifact'
  );
  const defensiveItems =
    defensivePool.length >= 3
      ? rng.pickN('starterKit:defensive', defensivePool, 3)
      : rng.pickN('starterKit:defensive', tier1Items, 3);

  return [
    {
      id: 'balanced',
      name: 'Standard Issue',
      description: 'A balanced loadout for any situation',
      items: balancedItems,
      perkTag: 'adaptable',
    },
    {
      id: 'aggressive',
      name: 'Strike Package',
      description: 'Offense-focused gear for fast clears',
      items: aggressiveItems,
      perkTag: 'fury',
    },
    {
      id: 'defensive',
      name: 'Fortified Kit',
      description: 'Defensive gear for longer runs',
      items: defensiveItems,
      perkTag: 'resilience',
    },
  ];
}

/**
 * Get wanderers available for encounters in a domain
 */
export function getWanderersForDomain(domainSlug: string): Wanderer[] {
  const wanderers = getEntitiesByCategory('wanderers') as Wanderer[];

  return wanderers.filter(
    (w) =>
      w.locations?.includes(domainSlug) ||
      w.locations?.includes('mobile') ||
      !w.locations // No locations = appears everywhere
  );
}

/**
 * Get a wanderer for an encounter
 */
export function getEncounterWanderer(
  domainSlug: string,
  sponsorBias: number,
  rng: SeededRng
): Wanderer | undefined {
  const available = getWanderersForDomain(domainSlug);
  if (available.length === 0) return undefined;

  // Sponsor bias affects which wanderer appears
  // sponsorBias 1-6 maps to wanderer index preference
  const namespace = `encounter:domain:${domainSlug}:sponsor:${sponsorBias}`;

  // Sort by sponsor affinity (simple: mod by available count)
  const biasedIndex = (sponsorBias - 1) % available.length;
  const sorted = [
    available[biasedIndex],
    ...available.filter((_, i) => i !== biasedIndex),
  ];

  // Still use RNG for some variance
  return rng.chance(namespace, 70) ? sorted[0] : rng.pick(namespace, sorted);
}

/**
 * Empty state fallback message
 */
export function getEmptyPoolMessage(context: string): string {
  const messages: Record<string, string> = {
    requisition: 'NO ISSUANCE AVAILABLE',
    door: 'CORRIDOR SEALED',
    wanderer: 'SIGNAL LOST',
    loot: 'CACHE CORRUPTED',
    default: 'DATA REDACTED',
  };
  return messages[context] || messages.default;
}
