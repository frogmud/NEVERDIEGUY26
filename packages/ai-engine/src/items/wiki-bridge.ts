/**
 * NEVER DIE GUY - Wiki-Game Bridge
 *
 * Maps wiki content to game mechanics.
 * Use this as the checklist when writing wiki entries.
 * Use this when implementing item effects in combat-engine.ts.
 */

import type {
  ItemDefinition,
  ItemEffect,
  EffectTrigger,
  CombatStats,
} from './item-schema';

// ============================================================
// WIKI TEMPLATE STRUCTURE
// ============================================================

/**
 * Every wiki item entry MUST have these sections.
 * This ensures parity between what players read and what happens in-game.
 */
export interface WikiItemEntry {
  // === HEADER (matches ItemDefinition) ===
  slug: string;
  name: string;
  rarity: string; // Display: "Common", "Uncommon", etc.
  category: string; // Display: "Passive", "Consumable", etc.
  element: string; // Display: "Fire", "Ice", etc. or "Neutral"

  // === STAT BLOCK (auto-generated from effects) ===
  statBlock: string; // e.g., "+1 Throw | +20% Fire damage"

  // === DESCRIPTION ===
  shortDesc: string; // 100 chars max, shown in shop
  longDesc: string; // Full flavor text for wiki

  // === MECHANICS ===
  effectList: string[]; // Human-readable effect breakdown
  triggerDesc: string; // "Passive" / "On Throw" / "Activate to..."

  // === ECONOMY ===
  tierRequired: string; // "Tier 2+" - when it appears in shops
  basePrice: string; // "75g" - before modifiers

  // === METADATA ===
  tags: string[]; // For wiki search/filters
  synergies: string[]; // Other items this works well with
  antiSynergies: string[]; // Items this conflicts with
}

// ============================================================
// STAT DISPLAY MAPPING
// ============================================================

/**
 * How combat stats appear in wiki/UI
 * Key: CombatStats field
 * Value: Display template
 */
export const STAT_DISPLAY_MAP: Record<
  keyof CombatStats,
  (val: number | Partial<Record<string, number>>) => string | null
> = {
  bonusThrows: (v) =>
    typeof v === 'number' && v > 0
      ? `+${v} Throw${v > 1 ? 's' : ''}`
      : null,
  bonusTrades: (v) =>
    typeof v === 'number' && v > 0
      ? `+${v} Trade${v > 1 ? 's' : ''}`
      : null,
  scoreMultiplier: (v) => {
    if (typeof v !== 'number' || v === 1) return null;
    const pct = Math.round((v - 1) * 100);
    return `${pct > 0 ? '+' : ''}${pct}% Score`;
  },
  startingScore: (v) =>
    typeof v === 'number' && v > 0 ? `+${v} Starting Score` : null,
  elementDamage: () => null, // Handled separately
  rerollCost: (v) => {
    if (typeof v !== 'number' || v === 0) return null;
    return v < 0 ? `${v} Reroll Cost` : `+${v} Reroll Cost`;
  },
  handSize: (v) =>
    typeof v === 'number' && v !== 0
      ? `${v > 0 ? '+' : ''}${v} Hand Size`
      : null,
  integrityBonus: (v) =>
    typeof v === 'number' && v > 0 ? `+${v} Max Integrity` : null,
  integrityRegen: (v) =>
    typeof v === 'number' && v > 0 ? `+${v} Integrity per clear` : null,
};

/**
 * Generate stat block string for wiki display
 */
export function generateWikiStatBlock(item: ItemDefinition): string {
  const parts: string[] = [];

  for (const effect of item.effects) {
    if (!effect.stats) continue;

    for (const [key, value] of Object.entries(effect.stats)) {
      if (key === 'elementDamage' && typeof value === 'object') {
        // Handle element damage separately
        for (const [elem, dmg] of Object.entries(
          value as Record<string, number>
        )) {
          if (dmg) parts.push(`+${Math.round(dmg * 100)}% ${elem}`);
        }
      } else {
        const displayFn = STAT_DISPLAY_MAP[key as keyof CombatStats];
        if (displayFn) {
          const display = displayFn(value as number);
          if (display) parts.push(display);
        }
      }
    }
  }

  return parts.join(' | ') || 'No stat bonuses';
}

// ============================================================
// TRIGGER DISPLAY MAPPING
// ============================================================

export const TRIGGER_DISPLAY: Record<EffectTrigger, string> = {
  passive: 'Passive',
  on_throw: 'On Throw',
  on_trade: 'On Trade',
  on_roll_doubles: 'On Doubles',
  on_roll_triples: 'On Triples',
  on_room_start: 'Room Start',
  on_room_clear: 'Room Clear',
  on_purchase: 'On Purchase',
  on_activate: 'Activate',
};

// ============================================================
// STARTER ITEM DEFINITIONS
// ============================================================

/**
 * MVP item catalog - these are referenced in loadouts.ts
 * Each item MUST have wiki parity using above specs.
 */
export const STARTER_ITEMS: ItemDefinition[] = [
  // === LOADOUT: WARRIOR ===
  {
    slug: 'worn-dice-bag',
    name: 'Worn Dice Bag',
    description: 'A well-used bag that always has one more throw.',
    category: 'passive',
    rarity: 'common',
    element: 'Neutral',
    tier: 1,
    basePrice: 50,
    sellValue: 25,
    effects: [
      {
        trigger: 'passive',
        stats: { bonusThrows: 1 },
        description: '+1 Throw per room',
      },
    ],
    wikiTags: ['starter', 'throws', 'economy'],
    icon: 'dice-bag',
  },
  {
    slug: 'fire-ember',
    name: 'Fire Ember',
    description: 'Burns with elemental fury.',
    category: 'passive',
    rarity: 'common',
    element: 'Fire',
    tier: 1,
    basePrice: 40,
    sellValue: 20,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Fire: 0.2 } },
        description: '+20% Fire damage',
      },
    ],
    wikiTags: ['starter', 'fire', 'element', 'damage'],
    icon: 'ember',
    color: '#EF4444',
  },

  // === LOADOUT: ROGUE ===
  {
    slug: 'traders-coin',
    name: "Trader's Coin",
    description: 'Lucky coin from a savvy dealer.',
    category: 'passive',
    rarity: 'common',
    element: 'Neutral',
    tier: 1,
    basePrice: 50,
    sellValue: 25,
    effects: [
      {
        trigger: 'passive',
        stats: { bonusTrades: 1 },
        description: '+1 Trade per room',
      },
    ],
    wikiTags: ['starter', 'trades', 'economy', 'multiplier'],
    icon: 'coin-flip',
  },
  {
    slug: 'wind-feather',
    name: 'Wind Feather',
    description: 'Light as air, sharp as a gale.',
    category: 'passive',
    rarity: 'common',
    element: 'Wind',
    tier: 1,
    basePrice: 40,
    sellValue: 20,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Wind: 0.2 } },
        description: '+20% Wind damage',
      },
    ],
    wikiTags: ['starter', 'wind', 'element', 'damage'],
    icon: 'feather',
    color: '#A3E635',
  },

  // === LOADOUT: MAGE ===
  {
    slug: 'lucky-charm',
    name: 'Lucky Charm',
    description: 'Fortune favors the bold... and the charmed.',
    category: 'passive',
    rarity: 'common',
    element: 'Neutral',
    tier: 1,
    basePrice: 60,
    sellValue: 30,
    effects: [
      {
        trigger: 'passive',
        stats: { scoreMultiplier: 1.1 },
        description: '+10% Score',
      },
    ],
    wikiTags: ['starter', 'score', 'luck', 'multiplier'],
    icon: 'four-leaf-clover',
  },
  {
    slug: 'void-crystal',
    name: 'Void Crystal',
    description: 'Peers into the space between spaces.',
    category: 'passive',
    rarity: 'uncommon',
    element: 'Void',
    tier: 1,
    basePrice: 55,
    sellValue: 27,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Void: 0.2 } },
        description: '+20% Void damage',
      },
    ],
    wikiTags: ['starter', 'void', 'element', 'damage'],
    icon: 'crystal',
    color: '#8B5CF6',
  },

  // === ELEMENT GEMS (Tier 1) ===
  {
    slug: 'earth-stone',
    name: 'Earth Stone',
    description: 'Solid as bedrock.',
    category: 'passive',
    rarity: 'common',
    element: 'Earth',
    tier: 1,
    basePrice: 40,
    sellValue: 20,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Earth: 0.2 } },
        description: '+20% Earth damage',
      },
    ],
    wikiTags: ['earth', 'element', 'damage'],
    icon: 'stone',
    color: '#A16207',
  },
  {
    slug: 'ice-shard',
    name: 'Ice Shard',
    description: 'Cold to the touch. Colder to your enemies.',
    category: 'passive',
    rarity: 'common',
    element: 'Ice',
    tier: 1,
    basePrice: 40,
    sellValue: 20,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Ice: 0.2 } },
        description: '+20% Ice damage',
      },
    ],
    wikiTags: ['ice', 'element', 'damage'],
    icon: 'snowflake',
    color: '#0EA5E9',
  },
  {
    slug: 'death-bone',
    name: 'Death Bone',
    description: 'Rattles with necrotic energy.',
    category: 'passive',
    rarity: 'common',
    element: 'Death',
    tier: 1,
    basePrice: 40,
    sellValue: 20,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Death: 0.2 } },
        description: '+20% Death damage',
      },
    ],
    wikiTags: ['death', 'element', 'damage'],
    icon: 'bone',
    color: '#6B7280',
  },

  // === TIER 2 ITEMS ===
  {
    slug: 'double-dice-bag',
    name: 'Double Dice Bag',
    description: 'Two bags stitched together. Twice the throws.',
    category: 'passive',
    rarity: 'uncommon',
    element: 'Neutral',
    tier: 2,
    basePrice: 120,
    sellValue: 60,
    effects: [
      {
        trigger: 'passive',
        stats: { bonusThrows: 2 },
        description: '+2 Throws per room',
      },
    ],
    wikiTags: ['throws', 'economy', 'upgrade'],
    icon: 'dice-bag-double',
  },
  {
    slug: 'merchants-scales',
    name: "Merchant's Scales",
    description: 'Every trade weighs in your favor.',
    category: 'passive',
    rarity: 'uncommon',
    element: 'Neutral',
    tier: 2,
    basePrice: 100,
    sellValue: 50,
    effects: [
      {
        trigger: 'passive',
        stats: { bonusTrades: 1, scoreMultiplier: 1.05 },
        description: '+1 Trade | +5% Score',
      },
    ],
    wikiTags: ['trades', 'score', 'economy'],
    icon: 'scales',
  },
  {
    slug: 'inferno-core',
    name: 'Inferno Core',
    description: 'The heart of a dying star.',
    category: 'passive',
    rarity: 'rare',
    element: 'Fire',
    tier: 2,
    basePrice: 180,
    sellValue: 90,
    effects: [
      {
        trigger: 'passive',
        stats: { elementDamage: { Fire: 0.4 } },
        description: '+40% Fire damage',
      },
    ],
    wikiTags: ['fire', 'element', 'damage', 'upgrade'],
    icon: 'core-fire',
    color: '#DC2626',
  },

  // === CONSUMABLES ===
  {
    slug: 'score-potion',
    name: 'Score Potion',
    description: 'Instant gratification in a bottle.',
    category: 'consumable',
    rarity: 'common',
    element: 'Neutral',
    tier: 1,
    basePrice: 30,
    sellValue: 10,
    effects: [
      {
        trigger: 'on_activate',
        stats: { startingScore: 200 },
        description: '+200 Score (instant)',
      },
    ],
    wikiTags: ['consumable', 'score', 'instant'],
    icon: 'potion-purple',
  },
  {
    slug: 'reroll-token',
    name: 'Reroll Token',
    description: 'Good for one free shop reroll.',
    category: 'consumable',
    rarity: 'common',
    element: 'Neutral',
    tier: 1,
    basePrice: 15,
    sellValue: 5,
    effects: [
      {
        trigger: 'on_activate',
        special: 'free_shop_reroll',
        description: 'Free shop reroll',
      },
    ],
    wikiTags: ['consumable', 'shop', 'reroll'],
    icon: 'token',
  },
  {
    slug: 'integrity-salve',
    name: 'Integrity Salve',
    description: 'Patches up the wounds that matter.',
    category: 'consumable',
    rarity: 'uncommon',
    element: 'Neutral',
    tier: 1,
    basePrice: 45,
    sellValue: 15,
    effects: [
      {
        trigger: 'on_activate',
        stats: { integrityRegen: 25 },
        description: '+25 Integrity',
      },
    ],
    wikiTags: ['consumable', 'integrity', 'healing'],
    icon: 'salve',
  },
];

// ============================================================
// SYNERGY DETECTION
// ============================================================

// Opposing element pairs for anti-synergies
const OPPOSING_ELEMENTS: Record<string, string> = {
  Fire: 'Ice',
  Ice: 'Fire',
  Wind: 'Earth',
  Earth: 'Wind',
  Void: 'Death',
  Death: 'Void',
};

/**
 * Detect items that synergize with the given item
 * Rules:
 * - Same element (excluding Neutral) = synergy
 * - 2+ shared wikiTags = synergy
 */
function detectSynergies(item: ItemDefinition, catalog: ItemDefinition[]): string[] {
  const synergies = new Set<string>();

  for (const other of catalog) {
    if (other.slug === item.slug) continue;

    // Same element synergy (excluding Neutral)
    if (item.element !== 'Neutral' && other.element === item.element) {
      synergies.add(other.name);
      continue;
    }

    // Shared wikiTags (at least 2 in common)
    const sharedTags = item.wikiTags.filter((t) => other.wikiTags.includes(t));
    if (sharedTags.length >= 2) {
      synergies.add(other.name);
    }
  }

  // Cap at 5 synergies for UI brevity
  return Array.from(synergies).slice(0, 5);
}

/**
 * Detect items that anti-synergize with the given item
 * Rules:
 * - Opposing element = anti-synergy
 */
function detectAntiSynergies(item: ItemDefinition, catalog: ItemDefinition[]): string[] {
  if (item.element === 'Neutral') return [];

  const opposingElement = OPPOSING_ELEMENTS[item.element];
  if (!opposingElement) return [];

  const antiSynergies: string[] = [];
  for (const other of catalog) {
    if (other.slug === item.slug) continue;
    if (other.element === opposingElement) {
      antiSynergies.push(other.name);
    }
  }

  // Cap at 3 anti-synergies
  return antiSynergies.slice(0, 3);
}

// ============================================================
// CONVERSION HELPERS
// ============================================================

/**
 * Convert ItemDefinition to WikiItemEntry for display
 */
export function toWikiEntry(item: ItemDefinition): WikiItemEntry {
  const rarityDisplay =
    item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
  const categoryDisplay =
    item.category.charAt(0).toUpperCase() + item.category.slice(1);

  // Build effect list
  const effectList = item.effects.map((e) => {
    const triggerLabel = TRIGGER_DISPLAY[e.trigger];
    return `[${triggerLabel}] ${e.description}`;
  });

  // Primary trigger
  const primaryTrigger = item.effects[0]?.trigger || 'passive';
  let triggerDesc = TRIGGER_DISPLAY[primaryTrigger];
  if (primaryTrigger === 'on_activate') {
    triggerDesc = `Activate to ${item.effects[0]?.description.toLowerCase()}`;
  }

  return {
    slug: item.slug,
    name: item.name,
    rarity: rarityDisplay,
    category: categoryDisplay,
    element: item.element,
    statBlock: generateWikiStatBlock(item),
    shortDesc: item.description,
    longDesc: item.lore || item.description,
    effectList,
    triggerDesc,
    tierRequired: `Tier ${item.tier}+`,
    basePrice: `${item.basePrice}g`,
    tags: item.wikiTags,
    synergies: detectSynergies(item, STARTER_ITEMS),
    antiSynergies: detectAntiSynergies(item, STARTER_ITEMS),
  };
}

/**
 * Get item by slug from catalog
 */
export function getItemBySlug(slug: string): ItemDefinition | undefined {
  return STARTER_ITEMS.find((i) => i.slug === slug);
}

/**
 * Get all items of a specific element
 */
export function getItemsByElement(element: string): ItemDefinition[] {
  return STARTER_ITEMS.filter((i) => i.element === element);
}

/**
 * Get all items available at a tier
 */
export function getItemsForTier(tier: number): ItemDefinition[] {
  return STARTER_ITEMS.filter((i) => i.tier <= tier);
}

/**
 * Get all items by category
 */
export function getItemsByCategory(category: string): ItemDefinition[] {
  return STARTER_ITEMS.filter((i) => i.category === category);
}

/**
 * Get all items with a specific tag
 */
export function getItemsByTag(tag: string): ItemDefinition[] {
  return STARTER_ITEMS.filter((i) => i.wikiTags.includes(tag));
}
