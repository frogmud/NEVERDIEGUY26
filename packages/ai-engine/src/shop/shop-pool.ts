/**
 * NEVER DIE GUY - Shop Pool Generation
 *
 * Weighted item selection for shop inventory.
 * Links item-schema types to balance-config economy.
 */

import type {
  ItemDefinition,
  ItemRarity,
  ItemCategory,
  ItemElement,
} from '../items/item-schema';
import { RARITY_CONFIG, calculateShopPrice } from '../items/item-schema';

// ============================================================
// SHOP CONFIGURATION
// ============================================================

export interface ShopConfig {
  /** Number of item slots in shop */
  slotCount: number;

  /** Guaranteed slot distribution by category */
  guaranteedSlots: Partial<Record<ItemCategory, number>>;

  /** Rarity weight overrides by tier (higher tier = better items) */
  rarityBoosts: Record<number, Partial<Record<ItemRarity, number>>>;

  /** Element bias based on current domain (0-1, higher = more matching) */
  elementBias: number;

  /** Reroll cost formula */
  baseRerollCost: number;
}

export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  slotCount: 6,

  // Always show at least 1 passive and 1 consumable
  guaranteedSlots: {
    passive: 1,
    consumable: 1,
  },

  // Higher tiers boost rare+ drop rates
  rarityBoosts: {
    1: {},
    2: { uncommon: 5 },
    3: { uncommon: 10, rare: 5 },
    4: { rare: 10, epic: 3 },
    5: { rare: 15, epic: 5, legendary: 2 },
  },

  elementBias: 0.3, // 30% chance to force domain element match
  baseRerollCost: 25,
};

// ============================================================
// SHOP SLOT DEFINITION
// ============================================================

export interface ShopSlot {
  item: ItemDefinition;
  price: number;
  sold: boolean;
  locked: boolean; // Locked items persist through rerolls
  highlighted: boolean; // UI hint for good synergy
}

export interface ShopState {
  slots: ShopSlot[];
  rerollCost: number;
  rerollCount: number; // How many times rerolled this shop
  tier: number;
  domainElement: ItemElement;
}

// ============================================================
// RNG INTERFACE
// ============================================================

export interface ShopRng {
  random: () => number;
  shuffle: <T>(arr: T[]) => T[];
}

/**
 * Default RNG using Math.random
 */
export const defaultRng: ShopRng = {
  random: () => Math.random(),
  shuffle: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },
};

// ============================================================
// WANDERER EFFECTS (for calm bonus)
// ============================================================

export const WANDERER_EFFECTS = {
  calm: {
    rerollCostReduction: 0.2, // 20% reduction per calm token
  },
};

/**
 * Get tier price multiplier
 */
export function getTierPriceMultiplier(tier: number): number {
  const multipliers = [1.0, 1.2, 1.5, 2.0, 2.5];
  return multipliers[Math.min(tier - 1, 4)];
}

// ============================================================
// POOL GENERATION ALGORITHM
// ============================================================

interface WeightedItem {
  item: ItemDefinition;
  weight: number;
}

/**
 * Build weighted pool from available items
 */
function buildWeightedPool(
  items: ItemDefinition[],
  tier: number,
  domainElement: ItemElement,
  config: ShopConfig,
  rng: ShopRng
): WeightedItem[] {
  const tierBoosts = config.rarityBoosts[tier] || {};

  return items.map((item) => {
    // Base weight from rarity
    let weight = RARITY_CONFIG[item.rarity].dropWeight;

    // Tier boosts
    weight += tierBoosts[item.rarity] || 0;

    // Element bias
    if (item.element === domainElement && rng.random() < config.elementBias) {
      weight *= 1.5;
    }

    // Neutral items always available
    if (item.element === 'Neutral') {
      weight *= 1.2;
    }

    return { item, weight };
  });
}

/**
 * Select item using weighted random
 */
function selectWeighted(pool: WeightedItem[], rng: ShopRng): WeightedItem | null {
  if (pool.length === 0) return null;

  const totalWeight = pool.reduce((sum, wp) => sum + wp.weight, 0);
  let roll = rng.random() * totalWeight;

  for (const wp of pool) {
    roll -= wp.weight;
    if (roll <= 0) return wp;
  }

  return pool[pool.length - 1];
}

/**
 * Create a shop slot from an item
 */
function createSlot(
  item: ItemDefinition,
  tier: number,
  favorTokens: number
): ShopSlot {
  return {
    item,
    price: calculateShopPrice(item, tier, favorTokens),
    sold: false,
    locked: false,
    highlighted: false,
  };
}

/**
 * Generate shop inventory from item catalog
 *
 * Algorithm:
 * 1. Filter items by tier requirement
 * 2. Apply guaranteed category slots
 * 3. Fill remaining with weighted random selection
 * 4. Apply element bias for domain synergy
 * 5. Calculate prices with all modifiers
 */
export function generateShopPool(
  allItems: ItemDefinition[],
  tier: number,
  domainElement: ItemElement,
  favorTokens: number = 0,
  calmBonus: number = 0,
  config: ShopConfig = DEFAULT_SHOP_CONFIG,
  rng: ShopRng = defaultRng
): ShopState {
  // Step 1: Filter by tier
  const availableItems = allItems.filter((item) => item.tier <= tier);

  if (availableItems.length === 0) {
    throw new Error(`No items available for tier ${tier}`);
  }

  // Step 2: Build weighted pool
  const weightedPool = buildWeightedPool(
    availableItems,
    tier,
    domainElement,
    config,
    rng
  );

  // Step 3: Fill slots
  const slots: ShopSlot[] = [];
  const usedSlugs = new Set<string>();

  // Guaranteed slots first
  for (const [category, count] of Object.entries(config.guaranteedSlots)) {
    const categoryItems = weightedPool.filter(
      (wp) => wp.item.category === category && !usedSlugs.has(wp.item.slug)
    );

    for (let i = 0; i < (count || 0) && categoryItems.length > 0; i++) {
      const selected = selectWeighted(categoryItems, rng);
      if (selected) {
        usedSlugs.add(selected.item.slug);
        slots.push(createSlot(selected.item, tier, favorTokens));
        // Remove from pool
        const idx = categoryItems.findIndex(
          (ci) => ci.item.slug === selected.item.slug
        );
        if (idx >= 0) categoryItems.splice(idx, 1);
      }
    }
  }

  // Fill remaining slots
  const remainingPool = weightedPool.filter(
    (wp) => !usedSlugs.has(wp.item.slug)
  );

  while (slots.length < config.slotCount && remainingPool.length > 0) {
    const selected = selectWeighted(remainingPool, rng);
    if (selected) {
      usedSlugs.add(selected.item.slug);
      slots.push(createSlot(selected.item, tier, favorTokens));
      const idx = remainingPool.findIndex(
        (rp) => rp.item.slug === selected.item.slug
      );
      if (idx >= 0) remainingPool.splice(idx, 1);
    }
  }

  // Calculate reroll cost with calm bonus
  const calmReduction = 1 - calmBonus * WANDERER_EFFECTS.calm.rerollCostReduction;
  const rerollCost = Math.max(
    1,
    Math.floor(
      config.baseRerollCost * getTierPriceMultiplier(tier) * Math.max(0.2, calmReduction)
    )
  );

  return {
    slots,
    rerollCost,
    rerollCount: 0,
    tier,
    domainElement,
  };
}

// ============================================================
// SHOP OPERATIONS
// ============================================================

/**
 * Reroll shop - keeps locked items, replaces rest
 */
export function rerollShop(
  currentShop: ShopState,
  allItems: ItemDefinition[],
  favorTokens: number,
  calmBonus: number,
  rng: ShopRng = defaultRng
): ShopState {
  const lockedSlots = currentShop.slots.filter((s) => s.locked);
  const lockedSlugs = new Set(lockedSlots.map((s) => s.item.slug));

  // Generate new pool excluding locked items
  const availableItems = allItems.filter(
    (item) => item.tier <= currentShop.tier && !lockedSlugs.has(item.slug)
  );

  const config: ShopConfig = {
    ...DEFAULT_SHOP_CONFIG,
    slotCount: DEFAULT_SHOP_CONFIG.slotCount - lockedSlots.length,
    guaranteedSlots: {}, // No guarantees on reroll
  };

  const newShop = generateShopPool(
    availableItems,
    currentShop.tier,
    currentShop.domainElement,
    favorTokens,
    calmBonus,
    config,
    rng
  );

  // Merge locked slots back in
  const finalSlots = [...lockedSlots, ...newShop.slots];

  // Increase reroll cost for next time (50% increase per reroll)
  const nextRerollCost = Math.floor(
    newShop.rerollCost * (1 + currentShop.rerollCount * 0.5)
  );

  return {
    ...newShop,
    slots: finalSlots,
    rerollCost: nextRerollCost,
    rerollCount: currentShop.rerollCount + 1,
  };
}

/**
 * Purchase item from shop
 */
export function purchaseItem(
  shop: ShopState,
  slotIndex: number,
  playerGold: number
): { success: boolean; newGold: number; shop: ShopState } {
  const slot = shop.slots[slotIndex];

  if (!slot || slot.sold) {
    return { success: false, newGold: playerGold, shop };
  }

  if (playerGold < slot.price) {
    return { success: false, newGold: playerGold, shop };
  }

  const newSlots = [...shop.slots];
  newSlots[slotIndex] = { ...slot, sold: true };

  return {
    success: true,
    newGold: playerGold - slot.price,
    shop: { ...shop, slots: newSlots },
  };
}

/**
 * Toggle lock on a slot
 */
export function toggleLock(shop: ShopState, slotIndex: number): ShopState {
  const slot = shop.slots[slotIndex];
  if (!slot || slot.sold) return shop;

  const newSlots = [...shop.slots];
  newSlots[slotIndex] = { ...slot, locked: !slot.locked };

  return { ...shop, slots: newSlots };
}

// ============================================================
// SYNERGY DETECTION (for highlighting)
// ============================================================

/**
 * Mark items with synergy to player's current build
 */
export function highlightSynergies(
  shop: ShopState,
  playerItems: ItemDefinition[],
  domainElement: ItemElement
): ShopState {
  const playerElements = new Set(playerItems.map((i) => i.element));

  const newSlots = shop.slots.map((slot) => {
    let highlighted = false;

    // Domain element match
    if (slot.item.element === domainElement) {
      highlighted = true;
    }

    // Build synergy (player already has items of same element)
    if (
      playerElements.has(slot.item.element) &&
      slot.item.element !== 'Neutral'
    ) {
      highlighted = true;
    }

    return { ...slot, highlighted };
  });

  return { ...shop, slots: newSlots };
}
