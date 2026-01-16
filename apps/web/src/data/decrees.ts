/**
 * Starting Loadout System - NPC-driven loadouts for runs
 *
 * Each NPC offers items from their personal pool, combining:
 * - Global items (they always have)
 * - Domain-specific items (extras for certain domains)
 *
 * The seed determines which specific items from those pools.
 * Same NPC + same domain + same seed = identical loadout.
 *
 * NEVER DIE GUY
 */

import { createSeededRng, generateThreadId } from './pools/seededRng';
import { DOMAIN_CONFIGS } from './domains';

// ============================================
// Types
// ============================================

export type LoadoutQuality = 'low' | 'medium' | 'high' | 'rare';

export interface StartingLoadout {
  npcId: string;           // Who's offering this
  domain: number;          // Where you're headed (1-6)
  seed: string;            // 6-char hex for reproducibility
  items: string[];         // Item slugs player starts with (3 items)
  quality: LoadoutQuality;
}

export interface NpcItemPool {
  global: string[];        // Items they offer regardless of domain
  domainSpecific: Record<number, string[]>; // Extra items per domain
  rarityWeights: { common: number; uncommon: number; rare: number };
}

// ============================================
// Item Manifest - All loadout-eligible items
// Maps slug -> { rarity, category, hasImage }
// ============================================

export const LOADOUT_ITEMS: Record<string, { rarity: number; category: string; image: string }> = {
  // ============================================
  // GLOBAL UTILITY ITEMS (available to all NPCs)
  // ============================================
  'backpack': { rarity: 1, category: 'armor', image: '/assets/items/armor/backpack.png' },
  'compass': { rarity: 1, category: 'armor', image: '/assets/items/armor/compass.png' },
  'rations': { rarity: 1, category: 'consumable', image: '/assets/items/consumables/rations.png' },
  'medkit': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/medkit.png' },
  'health-potion': { rarity: 1, category: 'consumable', image: '/assets/items/consumables/health-potion.png' },
  'lucky-clover': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/lucky-clover.png' },
  'traders-talisman': { rarity: 2, category: 'armor', image: '/assets/items/armor/traders-talisman.png' },
  'lockpick': { rarity: 1, category: 'quest', image: '/assets/items/quest/lockpick.png' },
  'shovel': { rarity: 1, category: 'armor', image: '/assets/items/armor/shovel.png' },
  'stopwatch': { rarity: 2, category: 'armor', image: '/assets/items/armor/stopwatch.png' },
  'domain-map': { rarity: 1, category: 'quest', image: '/assets/items/quest/domain-map.png' },

  // ============================================
  // EARTH DOMAIN ITEMS (Domain 1)
  // ============================================
  'malachite': { rarity: 2, category: 'material', image: '/assets/items/materials/malachite.png' },
  'gold-pebble': { rarity: 1, category: 'material', image: '/assets/items/materials/gold-pebble.png' },
  'gold-ingot': { rarity: 3, category: 'material', image: '/assets/items/materials/gold-ingot.png' },
  'iron-boots': { rarity: 2, category: 'armor', image: '/assets/items/armor/iron-boots.png' },
  'turtle-shell': { rarity: 2, category: 'armor', image: '/assets/items/armor/turtle-shell.png' },
  'shield-heavy': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/shield-heavy.png' },
  'melee-crowbar': { rarity: 1, category: 'weapon', image: '/assets/items/weapons/melee-crowbar.png' },
  'melee-stichup-scissors': { rarity: 2, category: 'weapon', image: '/assets/items/weapons/melee-stichup-scissors.png' },

  // ============================================
  // FROST REACH ITEMS (Domain 2)
  // ============================================
  'frost-crystal': { rarity: 2, category: 'material', image: '/assets/items/materials/frost-crystal.png' },
  'frost-cluster': { rarity: 3, category: 'material', image: '/assets/items/materials/frost-cluster.png' },
  'frost-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/frost-salts.png' },
  'ice-cube': { rarity: 1, category: 'armor', image: '/assets/items/armor/ice-cube.png' },
  'chronofrost-bomb': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/chronofrost-bomb.png' },
  'throwable-ice-grenade': { rarity: 2, category: 'weapon', image: '/assets/items/weapons/throwable-ice-grenade.png' },
  'ranged-ice-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-ice-bow.png' },
  'sapphire': { rarity: 3, category: 'material', image: '/assets/items/materials/sapphire.png' },

  // ============================================
  // INFERNUS ITEMS (Domain 3)
  // ============================================
  'ember-fragment': { rarity: 2, category: 'material', image: '/assets/items/materials/ember-fragment.png' },
  'infernal-crystal': { rarity: 3, category: 'material', image: '/assets/items/materials/infernal-crystal.png' },
  'infernal-crystal-cluster': { rarity: 4, category: 'material', image: '/assets/items/materials/infernal-crystal-cluster.png' },
  'infernal-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/infernal-salts.png' },
  'ruby': { rarity: 3, category: 'material', image: '/assets/items/materials/ruby.png' },
  'throwable-fire-grenade': { rarity: 2, category: 'weapon', image: '/assets/items/weapons/throwable-fire-grenade.png' },
  'throwable-molotov': { rarity: 1, category: 'weapon', image: '/assets/items/weapons/throwable-molotov.png' },
  'ranged-infernal-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-infernal-bow.png' },
  'ranged-blazecaster': { rarity: 4, category: 'weapon', image: '/assets/items/weapons/ranged-blazecaster.png' },
  'alchemists-inferno': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/alchemists-inferno.png' },

  // ============================================
  // SHADOW KEEP ITEMS (Domain 4)
  // ============================================
  'shadow-shard': { rarity: 2, category: 'material', image: '/assets/items/materials/shadow-shard.png' },
  'shadow-essence': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/shadow-essence.png' },
  'essence-of-dark': { rarity: 3, category: 'material', image: '/assets/items/materials/essence-of-dark.png' },
  'blood-vial': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/blood-vial.png' },
  'glowing-blood-vial': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/glowing-blood-vial.png' },
  'big-bones': { rarity: 1, category: 'armor', image: '/assets/items/armor/big-bones.png' },
  'tombstone': { rarity: 2, category: 'armor', image: '/assets/items/armor/tombstone.png' },
  'ranged-shadow-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-shadow-bow.png' },
  'melee-shadowblade': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/melee-shadowblade.png' },
  'soul-charge': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/soul-charge.png' },

  // ============================================
  // NULL PROVIDENCE ITEMS (Domain 5)
  // ============================================
  'void-crystal': { rarity: 3, category: 'material', image: '/assets/items/materials/void-crystal.png' },
  'void-cluster': { rarity: 4, category: 'material', image: '/assets/items/materials/void-cluster.png' },
  'void-orb': { rarity: 3, category: 'material', image: '/assets/items/materials/void-orb.png' },
  'null-sphere': { rarity: 3, category: 'material', image: '/assets/items/materials/null-sphere.png' },
  'void-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/void-salts.png' },
  'essence-of-the-void': { rarity: 4, category: 'consumable', image: '/assets/items/consumables/essence-of-the-void.png' },
  'amethyst': { rarity: 2, category: 'material', image: '/assets/items/materials/amethyst.png' },
  'throwable-void-lantern': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/throwable-void-lantern.png' },
  'throwable-void-mist-bomb': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/throwable-void-mist-bomb.png' },
  'melee-void-axe': { rarity: 4, category: 'weapon', image: '/assets/items/weapons/melee-void-axe.png' },
  'melee-axe-of-negation': { rarity: 4, category: 'weapon', image: '/assets/items/weapons/melee-axe-of-negation.png' },

  // ============================================
  // ABERRANT ITEMS (Domain 6)
  // ============================================
  'ethereal-crystal': { rarity: 3, category: 'material', image: '/assets/items/materials/ethereal-crystal.png' },
  'ethereal-crystal-cluster': { rarity: 4, category: 'material', image: '/assets/items/materials/ethereal-crystal-cluster.png' },
  'ethereal-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/ethereal-salts.png' },
  'cursed-eye': { rarity: 3, category: 'armor', image: '/assets/items/armor/cursed-eye.png' },
  'cursed-whistle': { rarity: 2, category: 'armor', image: '/assets/items/armor/cursed-whistle.png' },
  'ranged-aberrant-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-aberrant-bow.png' },
  'ranged-windcutter': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-windcutter.png' },
  'melee-aberrant-edge': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/melee-aberrant-edge.png' },
  'evolutionary-catalyst': { rarity: 4, category: 'consumable', image: '/assets/items/consumables/evolutionary-catalyst.png' },

  // ============================================
  // NPC-SPECIFIC ITEMS
  // ============================================
  'stitch-up-cocktail-1-bottle': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/stitch-up-cocktail-1-bottle.png' },
  'stitch-up-cocktail-2-bottle': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/stitch-up-cocktail-2-bottle.png' },
  'war-banner': { rarity: 3, category: 'armor', image: '/assets/items/armor/war-banner.png' },
  'war-horn': { rarity: 2, category: 'armor', image: '/assets/items/armor/war-horn.png' },
  'king-james-crown': { rarity: 5, category: 'armor', image: '/assets/items/armor/king-james-crown.png' },
  'maxwells-textbook': { rarity: 3, category: 'quest', image: '/assets/items/quest/maxwells-textbook.png' },
  'dr-voss-diary': { rarity: 3, category: 'quest', image: '/assets/items/quest/dr-voss-diary.png' },
  'audio-stream-enhancer': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/audio-stream-enhancer.png' },
  'beat-booster': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/beat-booster.png' },
  'aviators': { rarity: 2, category: 'armor', image: '/assets/items/armor/aviators.png' },
  'rocket-boots': { rarity: 3, category: 'armor', image: '/assets/items/armor/rocket-boots.png' },
  'hero-boots': { rarity: 2, category: 'armor', image: '/assets/items/armor/hero-boots.png' },
  'crutch': { rarity: 1, category: 'armor', image: '/assets/items/armor/crutch.png' },
  'eyepatch': { rarity: 1, category: 'armor', image: '/assets/items/armor/eyepatch.png' },
  'currency-token': { rarity: 1, category: 'material', image: '/assets/items/materials/currency-token.png' },
};

// ============================================
// Item Rarity Values (for quality calculation)
// Built from LOADOUT_ITEMS manifest
// ============================================

const ITEM_RARITIES: Record<string, number> = Object.fromEntries(
  Object.entries(LOADOUT_ITEMS).map(([slug, data]) => [slug, data.rarity])
);

// ============================================
// NPC Item Pools
// ============================================

export const NPC_ITEM_POOLS: Record<string, NpcItemPool> = {
  // TRAVELERS (Roaming - can appear anywhere)
  'willy': {
    global: ['traders-talisman', 'lucky-clover', 'backpack', 'currency-token'],
    domainSpecific: {
      1: ['malachite', 'gold-pebble'],
      2: ['frost-crystal', 'frost-salts'],
      3: ['ember-fragment', 'infernal-salts'],
      4: ['shadow-shard', 'blood-vial'],
      5: ['void-crystal', 'amethyst'],
      6: ['ethereal-salts', 'cursed-whistle'],
    },
    rarityWeights: { common: 40, uncommon: 45, rare: 15 },
  },

  // EARTH NATIVES (Domain 1)
  'mr-kevin': {
    global: ['lucky-clover', 'compass', 'shovel'],
    domainSpecific: {
      1: ['malachite', 'gold-pebble', 'gold-ingot', 'melee-crowbar'],
    },
    rarityWeights: { common: 50, uncommon: 35, rare: 15 },
  },
  'clausen': {
    global: ['medkit', 'rations', 'health-potion'],
    domainSpecific: {
      1: ['malachite', 'turtle-shell', 'iron-boots'],
    },
    rarityWeights: { common: 60, uncommon: 30, rare: 10 },
  },
  'xtreme': {
    global: ['lucky-clover', 'traders-talisman', 'stopwatch'],
    domainSpecific: {
      1: ['gold-ingot', 'shield-heavy'],
    },
    rarityWeights: { common: 30, uncommon: 40, rare: 30 },
  },

  // FROST REACH NATIVES (Domain 2)
  'keith-man': {
    global: ['medkit', 'rations', 'backpack', 'compass'],
    domainSpecific: {
      2: ['frost-crystal', 'frost-salts', 'ice-cube', 'sapphire', 'ranged-ice-bow'],
    },
    rarityWeights: { common: 45, uncommon: 40, rare: 15 },
  },
  'mr-bones': {
    global: ['big-bones', 'lucky-clover', 'crutch'],
    domainSpecific: {
      2: ['frost-crystal', 'frost-cluster', 'sapphire', 'chronofrost-bomb'],
    },
    rarityWeights: { common: 35, uncommon: 40, rare: 25 },
  },

  // INFERNUS NATIVES (Domain 3)
  'dr-maxwell': {
    global: ['maxwells-textbook', 'stopwatch', 'compass', 'health-potion'],
    domainSpecific: {
      3: ['ember-fragment', 'infernal-crystal', 'ruby', 'infernal-salts', 'ranged-blazecaster'],
    },
    rarityWeights: { common: 30, uncommon: 45, rare: 25 },
  },

  // SHADOW KEEP NATIVES (Domain 4)
  'stitch-up-girl': {
    global: ['medkit', 'health-potion', 'backpack', 'rations'],
    domainSpecific: {
      4: ['shadow-shard', 'blood-vial', 'glowing-blood-vial', 'stitch-up-cocktail-1-bottle', 'melee-stichup-scissors'],
    },
    rarityWeights: { common: 40, uncommon: 40, rare: 20 },
  },
  'the-general': {
    global: ['war-banner', 'war-horn', 'compass'],
    domainSpecific: {
      4: ['shadow-essence', 'essence-of-dark', 'melee-shadowblade', 'soul-charge'],
    },
    rarityWeights: { common: 35, uncommon: 45, rare: 20 },
  },

  // NULL PROVIDENCE NATIVES (Domain 5)
  'dr-voss': {
    global: ['dr-voss-diary', 'compass', 'stopwatch'],
    domainSpecific: {
      5: ['void-crystal', 'void-orb', 'null-sphere', 'essence-of-the-void'],
    },
    rarityWeights: { common: 25, uncommon: 45, rare: 30 },
  },
  'king-james': {
    global: ['currency-token', 'lucky-clover'],
    domainSpecific: {
      5: ['void-crystal', 'void-cluster', 'melee-void-axe', 'melee-axe-of-negation'],
    },
    rarityWeights: { common: 20, uncommon: 40, rare: 40 },
  },

  // ABERRANT NATIVES (Domain 6)
  'body-count': {
    global: ['big-bones', 'medkit', 'eyepatch'],
    domainSpecific: {
      6: ['ethereal-salts', 'cursed-eye', 'ranged-aberrant-bow'],
    },
    rarityWeights: { common: 40, uncommon: 35, rare: 25 },
  },
  'boots': {
    global: ['hero-boots', 'rocket-boots', 'lucky-clover'],
    domainSpecific: {
      6: ['ethereal-crystal', 'ranged-windcutter', 'evolutionary-catalyst'],
    },
    rarityWeights: { common: 30, uncommon: 40, rare: 30 },
  },
  'boo-g': {
    global: ['beat-booster', 'audio-stream-enhancer'],
    domainSpecific: {
      6: ['ethereal-crystal', 'cursed-whistle', 'melee-aberrant-edge'],
    },
    rarityWeights: { common: 35, uncommon: 40, rare: 25 },
  },
};

// ============================================
// Quality Calculation
// ============================================

export function calculateLoadoutQuality(items: string[]): LoadoutQuality {
  const totalRarity = items.reduce((sum, slug) => sum + (ITEM_RARITIES[slug] || 1), 0);
  const avgRarity = totalRarity / items.length;

  if (avgRarity >= 3.5) return 'rare';
  if (avgRarity >= 2.5) return 'high';
  if (avgRarity >= 1.5) return 'medium';
  return 'low';
}

// ============================================
// Quality Adjectives for Headlines
// ============================================

const QUALITY_ADJECTIVES: Record<LoadoutQuality, string[]> = {
  low: ['Simple', 'Basic', 'Modest', 'Humble'],
  medium: ['Solid', 'Reliable', 'Steady', 'Capable'],
  high: ['Powerful', 'Formidable', 'Exceptional', 'Elite'],
  rare: ['Apocalyptic', 'Legendary', 'Mythic', 'Divine'],
};

export function getQualityAdjective(quality: LoadoutQuality, seed: string): string {
  const rng = createSeededRng(seed);
  const adjectives = QUALITY_ADJECTIVES[quality];
  return rng.pick('quality-adj', adjectives) || adjectives[0];
}

// ============================================
// Helper: Get item image path
// ============================================

export function getItemImage(slug: string): string {
  const item = LOADOUT_ITEMS[slug];
  return item?.image || '/assets/items/placeholder.png';
}

// ============================================
// Loadout Generation
// ============================================

/**
 * Generate a starting loadout for an NPC + domain combo
 */
export function generateLoadout(npcId: string, domainId: number, seed?: string): StartingLoadout {
  const actualSeed = seed || generateThreadId();
  const rng = createSeededRng(actualSeed);

  const pool = NPC_ITEM_POOLS[npcId];
  if (!pool) {
    // Fallback for unknown NPC
    return {
      npcId,
      domain: domainId,
      seed: actualSeed,
      items: ['backpack', 'health-potion', 'compass'],
      quality: 'low',
    };
  }

  // Combine global items with domain-specific items (deduplicated)
  const availableItems = [...new Set([
    ...pool.global,
    ...(pool.domainSpecific[domainId] || []),
  ])];

  // Pick 3 unique items weighted by rarity
  const selectedItems: string[] = [];
  const remaining = [...availableItems];

  for (let i = 0; i < 3 && remaining.length > 0; i++) {
    // Weight selection by rarity weights
    const roll = rng.random(`item-select-${i}`);

    // Determine rarity tier for this pick
    let targetRarity: 'common' | 'uncommon' | 'rare';
    if (roll < pool.rarityWeights.common / 100) {
      targetRarity = 'common';
    } else if (roll < (pool.rarityWeights.common + pool.rarityWeights.uncommon) / 100) {
      targetRarity = 'uncommon';
    } else {
      targetRarity = 'rare';
    }

    // Find items of that rarity tier
    const tierItems = remaining.filter(slug => {
      const rarity = ITEM_RARITIES[slug] || 1;
      if (targetRarity === 'common') return rarity <= 1;
      if (targetRarity === 'uncommon') return rarity === 2;
      return rarity >= 3;
    });

    // Pick from tier, or fallback to any remaining
    const pickPool = tierItems.length > 0 ? tierItems : remaining;
    const picked = rng.pick(`item-pick-${i}`, pickPool);

    if (picked) {
      selectedItems.push(picked);
      const idx = remaining.indexOf(picked);
      if (idx > -1) remaining.splice(idx, 1);
    }
  }

  // Ensure we have 3 items
  while (selectedItems.length < 3 && remaining.length > 0) {
    const picked = remaining.shift();
    if (picked) selectedItems.push(picked);
  }

  // Fallback if still not enough
  while (selectedItems.length < 3) {
    selectedItems.push('backpack');
  }

  const quality = calculateLoadoutQuality(selectedItems);

  return {
    npcId,
    domain: domainId,
    seed: actualSeed,
    items: selectedItems,
    quality,
  };
}

// ============================================
// Headline Generation
// ============================================

/**
 * Generate a headline like "Apocalyptic Frost Reach Preparation"
 */
export function generateHeadline(loadout: StartingLoadout): string {
  const adjective = getQualityAdjective(loadout.quality, loadout.seed);
  const domainConfig = DOMAIN_CONFIGS[loadout.domain];
  const domainName = domainConfig?.name || 'Unknown';
  return `${adjective} ${domainName} Preparation`;
}

/**
 * Get domain name from loadout
 */
export function getLoadoutDomainName(loadout: StartingLoadout): string {
  const config = DOMAIN_CONFIGS[loadout.domain];
  return config?.name || 'Unknown';
}

/**
 * Get domain slug from loadout
 */
export function getLoadoutDomainSlug(loadout: StartingLoadout): string {
  const config = DOMAIN_CONFIGS[loadout.domain];
  return config?.slug || 'earth';
}
