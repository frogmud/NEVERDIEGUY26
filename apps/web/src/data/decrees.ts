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
  'backpack': { rarity: 1, category: 'armor', image: '/assets/items/armor/backpack.svg' },
  'compass': { rarity: 1, category: 'armor', image: '/assets/items/armor/compass.svg' },
  'rations': { rarity: 1, category: 'consumable', image: '/assets/items/consumables/rations.svg' },
  'medkit': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/medkit.svg' },
  'health-potion': { rarity: 1, category: 'consumable', image: '/assets/items/consumables/health-potion.svg' },
  'lucky-clover': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/lucky-clover.svg' },
  'traders-talisman': { rarity: 2, category: 'armor', image: '/assets/items/armor/traders-talisman.svg' },
  'lockpick': { rarity: 1, category: 'quest', image: '/assets/items/quest/lockpick.svg' },
  'shovel': { rarity: 1, category: 'armor', image: '/assets/items/armor/shovel.svg' },
  'stopwatch': { rarity: 2, category: 'armor', image: '/assets/items/armor/stopwatch.svg' },
  'domain-map': { rarity: 1, category: 'quest', image: '/assets/items/quest/domain-map.svg' },

  // ============================================
  // EARTH DOMAIN ITEMS (Domain 1)
  // ============================================
  'malachite': { rarity: 2, category: 'material', image: '/assets/items/materials/malachite.svg' },
  'gold-pebble': { rarity: 1, category: 'material', image: '/assets/items/materials/gold-pebble.svg' },
  'gold-ingot': { rarity: 3, category: 'material', image: '/assets/items/materials/gold-ingot.svg' },
  'iron-boots': { rarity: 2, category: 'armor', image: '/assets/items/armor/iron-boots.svg' },
  'turtle-shell': { rarity: 2, category: 'armor', image: '/assets/items/armor/turtle-shell.svg' },
  'shield-heavy': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/shield-heavy.svg' },
  'melee-crowbar': { rarity: 1, category: 'weapon', image: '/assets/items/weapons/melee-crowbar.svg' },

  // ============================================
  // FROST REACH ITEMS (Domain 2)
  // ============================================
  'frost-crystal': { rarity: 2, category: 'material', image: '/assets/items/materials/frost-crystal.svg' },
  'frost-cluster': { rarity: 3, category: 'material', image: '/assets/items/materials/frost-cluster.svg' },
  'frost-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/frost-salts.svg' },
  'ice-cube': { rarity: 1, category: 'armor', image: '/assets/items/armor/ice-cube.svg' },
  'chronofrost-bomb': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/chronofrost-bomb.svg' },
  'throwable-ice-grenade': { rarity: 2, category: 'weapon', image: '/assets/items/weapons/throwable-ice-grenade.svg' },
  'ranged-ice-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-ice-bow.svg' },
  'sapphire': { rarity: 3, category: 'material', image: '/assets/items/materials/sapphire.svg' },

  // ============================================
  // INFERNUS ITEMS (Domain 3)
  // ============================================
  'ember-fragment': { rarity: 2, category: 'material', image: '/assets/items/materials/ember-fragment.svg' },
  'infernal-crystal': { rarity: 3, category: 'material', image: '/assets/items/materials/infernal-crystal.svg' },
  'infernal-crystal-cluster': { rarity: 4, category: 'material', image: '/assets/items/materials/infernal-crystal-cluster.svg' },
  'infernal-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/infernal-salts.svg' },
  'ruby': { rarity: 3, category: 'material', image: '/assets/items/materials/ruby.svg' },
  'throwable-fire-grenade': { rarity: 2, category: 'weapon', image: '/assets/items/weapons/throwable-fire-grenade.svg' },
  'throwable-molotov': { rarity: 1, category: 'weapon', image: '/assets/items/weapons/throwable-molotov.svg' },
  'ranged-infernal-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-infernal-bow.svg' },
  'ranged-blazecaster': { rarity: 4, category: 'weapon', image: '/assets/items/weapons/ranged-blazecaster.svg' },
  'alchemists-inferno': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/alchemists-inferno.svg' },

  // ============================================
  // SHADOW KEEP ITEMS (Domain 4)
  // ============================================
  'shadow-shard': { rarity: 2, category: 'material', image: '/assets/items/materials/shadow-shard.svg' },
  'shadow-essence': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/shadow-essence.svg' },
  'essence-of-dark': { rarity: 3, category: 'material', image: '/assets/items/materials/essence-of-dark.svg' },
  'blood-vial': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/blood-vial.svg' },
  'glowing-blood-vial': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/glowing-blood-vial.svg' },
  'big-bones': { rarity: 1, category: 'armor', image: '/assets/items/armor/big-bones.svg' },
  'tombstone': { rarity: 2, category: 'armor', image: '/assets/items/armor/tombstone.svg' },
  'ranged-shadow-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-shadow-bow.svg' },
  'melee-shadowblade': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/melee-shadowblade.svg' },
  'soul-charge': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/soul-charge.svg' },

  // ============================================
  // NULL PROVIDENCE ITEMS (Domain 5)
  // ============================================
  'void-crystal': { rarity: 3, category: 'material', image: '/assets/items/materials/void-crystal.svg' },
  'void-cluster': { rarity: 4, category: 'material', image: '/assets/items/materials/void-cluster.svg' },
  'void-orb': { rarity: 3, category: 'material', image: '/assets/items/materials/void-orb.svg' },
  'null-sphere': { rarity: 3, category: 'material', image: '/assets/items/materials/null-sphere.svg' },
  'void-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/void-salts.svg' },
  'essence-of-the-void': { rarity: 4, category: 'consumable', image: '/assets/items/consumables/essence-of-the-void.svg' },
  'amethyst': { rarity: 2, category: 'material', image: '/assets/items/materials/amethyst.svg' },
  'throwable-void-lantern': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/throwable-void-lantern.svg' },
  'throwable-void-mist-bomb': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/throwable-void-mist-bomb.svg' },
  'melee-void-axe': { rarity: 4, category: 'weapon', image: '/assets/items/weapons/melee-void-axe.svg' },
  'melee-axe-of-negation': { rarity: 4, category: 'weapon', image: '/assets/items/weapons/melee-axe-of-negation.svg' },

  // ============================================
  // ABERRANT ITEMS (Domain 6)
  // ============================================
  'ethereal-crystal': { rarity: 3, category: 'material', image: '/assets/items/materials/ethereal-crystal.svg' },
  'ethereal-crystal-cluster': { rarity: 4, category: 'material', image: '/assets/items/materials/ethereal-crystal-cluster.svg' },
  'ethereal-salts': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/ethereal-salts.svg' },
  'cursed-eye': { rarity: 3, category: 'armor', image: '/assets/items/armor/cursed-eye.svg' },
  'cursed-whistle': { rarity: 2, category: 'armor', image: '/assets/items/armor/cursed-whistle.svg' },
  'ranged-aberrant-bow': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-aberrant-bow.svg' },
  'ranged-windcutter': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/ranged-windcutter.svg' },
  'melee-aberrant-edge': { rarity: 3, category: 'weapon', image: '/assets/items/weapons/melee-aberrant-edge.svg' },
  'evolutionary-catalyst': { rarity: 4, category: 'consumable', image: '/assets/items/consumables/evolutionary-catalyst.svg' },

  // ============================================
  // NPC-SPECIFIC ITEMS
  // ============================================
  'stitch-up-cocktail-1-bottle': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/stitch-up-cocktail-1-bottle.svg' },
  'stitch-up-cocktail-2-bottle': { rarity: 3, category: 'consumable', image: '/assets/items/consumables/stitch-up-cocktail-2-bottle.svg' },
  'war-banner': { rarity: 3, category: 'armor', image: '/assets/items/armor/war-banner.svg' },
  'war-horn': { rarity: 2, category: 'armor', image: '/assets/items/armor/war-horn.svg' },
  'king-james-crown': { rarity: 5, category: 'armor', image: '/assets/items/armor/king-james-crown.svg' },
  'maxwells-textbook': { rarity: 3, category: 'quest', image: '/assets/items/quest/maxwells-textbook.svg' },
  'dr-voss-diary': { rarity: 3, category: 'quest', image: '/assets/items/quest/dr-voss-diary.svg' },
  'audio-stream-enhancer': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/audio-stream-enhancer.svg' },
  'beat-booster': { rarity: 2, category: 'consumable', image: '/assets/items/consumables/beat-booster.svg' },
  'aviators': { rarity: 2, category: 'armor', image: '/assets/items/armor/aviators.svg' },
  'rocket-boots': { rarity: 3, category: 'armor', image: '/assets/items/armor/rocket-boots.svg' },
  'hero-boots': { rarity: 2, category: 'armor', image: '/assets/items/armor/hero-boots.svg' },
  'crutch': { rarity: 1, category: 'armor', image: '/assets/items/armor/crutch.svg' },
  'eyepatch': { rarity: 1, category: 'armor', image: '/assets/items/armor/eyepatch.svg' },
  'currency-token': { rarity: 1, category: 'material', image: '/assets/items/materials/currency-token.svg' },
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
  return item?.image || '/assets/items/placeholder.svg';
}

// ============================================
// Loadout Generation
// ============================================

/**
 * Generate a starting loadout for an NPC + domain combo
 *
 * Picks 3 items from the NPC's pool (global + domain-specific).
 * Same NPC + domain + seed = identical loadout.
 */
export function generateLoadout(npcId: string, domainId: number, seed?: string): StartingLoadout {
  const actualSeed = seed || generateThreadId();
  const rng = createSeededRng(actualSeed);

  // Get NPC's item pool (fallback to willy if unknown NPC)
  const npcPool = NPC_ITEM_POOLS[npcId] || NPC_ITEM_POOLS['willy'];

  // Build available items: global + domain-specific
  const availableItems = [
    ...npcPool.global,
    ...(npcPool.domainSpecific[domainId] || []),
  ];

  // Pick 3 unique items using the RNG's pickN method
  const selectedItems = rng.pickN('loadout-items', availableItems, 3);

  // Calculate quality based on item rarities
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

// ============================================
// Item Display Name
// ============================================

/**
 * Convert item slug to display name
 * e.g., 'health-potion' -> 'Health Potion'
 */
export function getItemName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================
// Seed-Based Item Buffs (Balatro-style)
// ============================================

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemBuff {
  stat: string;
  value: number;
  isPercent: boolean;
}

export interface SeededItemStats {
  rarity: ItemRarity;
  rarityColor: string;
  buffs: ItemBuff[];
  edition: string | null;  // 'foil' | 'holographic' | 'polychrome' | null
  flavorText: string;
}

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

const BUFF_POOLS = {
  damage: ['+5 Damage', '+10 Damage', '+15 Damage', '+20 Damage', '+25% Damage'],
  defense: ['+5 Defense', '+10 Defense', '+15% Defense'],
  luck: ['+5% Luck', '+10% Luck', '+15% Luck'],
  gold: ['+10% Gold', '+20% Gold', '+50 Gold on Kill'],
  crit: ['+5% Crit', '+10% Crit', '+15% Crit'],
  speed: ['+10% Speed', '+20% Speed'],
  lifesteal: ['+5% Lifesteal', '+10% Lifesteal'],
  thorns: ['+5 Thorns', '+10 Thorns'],
};

const EDITIONS = ['Foil', 'Holographic', 'Polychrome', 'Negative'];

const FLAVOR_TEXTS = [
  'Smells faintly of victory.',
  'Previously owned by a guy who died.',
  'Surprisingly heavy for its size.',
  'The previous owner left a note: "Good luck."',
  'Inscribed: "Property of NEVER DIE GUY"',
  'Warm to the touch.',
  'Makes a satisfying sound when shaken.',
  'Probably cursed. Probably fine.',
  'Found in a dumpster behind the arena.',
  'Legend says it grants immortality. Legend lies.',
  'Certified pre-owned.',
  'Batteries not included.',
  'Handle with existential dread.',
  'May contain traces of souls.',
];

/**
 * Generate seed-based stats for an item instance
 * Same seed + item = identical stats
 */
export function generateItemStats(itemSlug: string, seed: string, index: number): SeededItemStats {
  const rng = createSeededRng(`${seed}-${itemSlug}-${index}`);
  const baseItem = LOADOUT_ITEMS[itemSlug];
  const baseRarity = baseItem?.rarity || 1;

  // Roll for rarity upgrade based on base rarity
  const rarityRoll = rng.random('rarity-roll');
  let rarity: ItemRarity = 'common';
  if (baseRarity >= 4 || rarityRoll > 0.95) {
    rarity = 'legendary';
  } else if (baseRarity >= 3 || rarityRoll > 0.85) {
    rarity = 'epic';
  } else if (baseRarity >= 2 || rarityRoll > 0.65) {
    rarity = 'rare';
  } else if (rarityRoll > 0.35) {
    rarity = 'uncommon';
  }

  // Generate buffs based on rarity
  const numBuffs = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : rarity === 'rare' ? 2 : 1;
  const buffCategories = Object.keys(BUFF_POOLS) as (keyof typeof BUFF_POOLS)[];
  const selectedCategories = rng.pickN('buff-cats', buffCategories, numBuffs);

  const buffs: ItemBuff[] = selectedCategories.map(cat => {
    const pool = BUFF_POOLS[cat];
    const buffStr = rng.pick(`buff-${cat}`, pool) || pool[0];
    const isPercent = buffStr.includes('%');
    const value = parseInt(buffStr.match(/\d+/)?.[0] || '0', 10);
    return { stat: cat, value, isPercent };
  });

  // Roll for special edition (rare)
  const editionRoll = rng.random('edition-roll');
  let edition: string | null = null;
  if (rarity === 'legendary' && editionRoll > 0.5) {
    edition = rng.pick('edition', EDITIONS) || null;
  } else if (rarity === 'epic' && editionRoll > 0.8) {
    edition = rng.pick('edition', EDITIONS) || null;
  }

  // Pick flavor text
  const flavorText = rng.pick('flavor', FLAVOR_TEXTS) || FLAVOR_TEXTS[0];

  return {
    rarity,
    rarityColor: RARITY_COLORS[rarity],
    buffs,
    edition,
    flavorText,
  };
}
