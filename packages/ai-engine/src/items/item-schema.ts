/**
 * NEVER DIE GUY - Item Schema
 *
 * Contract between wiki display and combat mechanics.
 * Every purchasable item MUST conform to this schema.
 */

// ============================================================
// CORE ITEM TYPES
// ============================================================

/** Item categories determine where items appear and how they're used */
export type ItemCategory =
  | 'consumable' // Single use, activated manually
  | 'passive' // Always active once acquired
  | 'equipment' // Slotted, one per slot type
  | 'dice' // Special dice added to pool
  | 'charm'; // Stacks, passive bonuses

/** Rarity determines base price, drop rates, and visual treatment */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** Element affinity - matches domain elements for synergy bonuses */
export type ItemElement =
  | 'Neutral'
  | 'Void'
  | 'Earth'
  | 'Death'
  | 'Fire'
  | 'Ice'
  | 'Wind';

// ============================================================
// COMBAT STATS - THE BRIDGE BETWEEN WIKI AND COMBAT
// ============================================================

/**
 * Combat stats that items can modify.
 * Each stat has a DIRECT mechanical effect in combat-engine.ts
 */
export interface CombatStats {
  // === THROW ECONOMY ===
  /** Extra throws per room (base: 3) */
  bonusThrows: number;
  /** Extra trades per room (base: 2) */
  bonusTrades: number;

  // === SCORE MODIFIERS ===
  /** Multiplicative bonus (1.0 = no change, 1.1 = +10%) */
  scoreMultiplier: number;
  /** Flat score added at combat start */
  startingScore: number;

  // === ELEMENT DAMAGE ===
  /** e.g., { Fire: 0.2 } = +20% fire damage */
  elementDamage: Partial<Record<ItemElement, number>>;

  // === DICE MANIPULATION ===
  /** Modifier to reroll cost (negative = cheaper) */
  rerollCost: number;
  /** Modifier to max hand size (base: 5) */
  handSize: number;

  // === SURVIVABILITY ===
  /** Extra max integrity */
  integrityBonus: number;
  /** Integrity restored per room clear */
  integrityRegen: number;
}

/** Default stats - apply these as base, items modify from here */
export const DEFAULT_COMBAT_STATS: CombatStats = {
  bonusThrows: 0,
  bonusTrades: 0,
  scoreMultiplier: 1.0,
  startingScore: 0,
  elementDamage: {},
  rerollCost: 0,
  handSize: 0,
  integrityBonus: 0,
  integrityRegen: 0,
};

// ============================================================
// ITEM EFFECT TYPES
// ============================================================

/** Effect triggers - WHEN does the effect activate? */
export type EffectTrigger =
  | 'passive' // Always active
  | 'on_throw' // When dice are thrown
  | 'on_trade' // When dice are traded
  | 'on_roll_doubles' // When doubles are rolled
  | 'on_roll_triples' // When triples are rolled
  | 'on_room_start' // At start of each room
  | 'on_room_clear' // When room is completed
  | 'on_purchase' // When item is bought
  | 'on_activate'; // Manual activation (consumables)

/** Effect definition - WHAT happens when triggered? */
export interface ItemEffect {
  trigger: EffectTrigger;
  /** Stat modifications */
  stats?: Partial<CombatStats>;
  /** Special effect ID (for unique behaviors) */
  special?: string;
  /** Human-readable for wiki */
  description: string;
  /** Numeric value for scaling effects */
  value?: number;
}

// ============================================================
// MASTER ITEM DEFINITION
// ============================================================

/**
 * The One True Item Interface
 *
 * Every item in the game MUST conform to this structure.
 */
export interface ItemDefinition {
  // === IDENTITY ===
  /** Unique ID, lowercase-kebab-case */
  slug: string;
  /** Display name */
  name: string;
  /** Short flavor text (max 100 chars) */
  description: string;

  // === CLASSIFICATION ===
  category: ItemCategory;
  rarity: ItemRarity;
  element: ItemElement;

  // === ECONOMY ===
  /** Minimum tier to appear in shops (1-5) */
  tier: 1 | 2 | 3 | 4 | 5;
  /** Gold cost before tier multiplier */
  basePrice: number;
  /** Gold received when sold (usually 50% of base) */
  sellValue: number;

  // === EFFECTS ===
  /** All effects this item provides */
  effects: ItemEffect[];

  // === WIKI METADATA ===
  /** For search/filter in wiki */
  wikiTags: string[];
  /** Extended lore text for wiki */
  lore?: string;

  // === VISUAL ===
  /** Asset path or icon name */
  icon: string;
  /** Accent color for UI */
  color?: string;
}

// ============================================================
// RARITY CONFIG - PRICING & DROP RATES
// ============================================================

export interface RarityConfig {
  /** Applied to basePrice */
  priceMultiplier: number;
  /** Higher = more common in pools */
  dropWeight: number;
  /** UI color */
  color: string;
  /** Max items of this rarity per shop refresh */
  maxPerShop: number;
}

export const RARITY_CONFIG: Record<ItemRarity, RarityConfig> = {
  common: {
    priceMultiplier: 1.0,
    dropWeight: 50,
    color: '#9CA3AF', // Gray
    maxPerShop: 3,
  },
  uncommon: {
    priceMultiplier: 1.5,
    dropWeight: 30,
    color: '#22C55E', // Green
    maxPerShop: 2,
  },
  rare: {
    priceMultiplier: 2.5,
    dropWeight: 15,
    color: '#3B82F6', // Blue
    maxPerShop: 2,
  },
  epic: {
    priceMultiplier: 4.0,
    dropWeight: 4,
    color: '#A855F7', // Purple
    maxPerShop: 1,
  },
  legendary: {
    priceMultiplier: 8.0,
    dropWeight: 1,
    color: '#F59E0B', // Gold
    maxPerShop: 1,
  },
};

// ============================================================
// PRICE CALCULATION
// ============================================================

/** Tier multipliers for shop pricing */
const TIER_PRICE_MULTIPLIERS = [1.0, 1.2, 1.5, 2.0, 2.5];

/**
 * Calculate final shop price for an item
 *
 * Formula: basePrice x rarityMultiplier x tierMultiplier x (1 - favorDiscount)
 */
export function calculateShopPrice(
  item: ItemDefinition,
  shopTier: number,
  favorTokens: number = 0
): number {
  const rarityMult = RARITY_CONFIG[item.rarity].priceMultiplier;
  const tierMult = TIER_PRICE_MULTIPLIERS[Math.min(shopTier - 1, 4)];

  // Favor discount: 15% per token, max 50% off
  const favorDiscount = Math.min(favorTokens * 0.15, 0.5);

  const finalPrice = item.basePrice * rarityMult * tierMult * (1 - favorDiscount);

  return Math.max(1, Math.floor(finalPrice));
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/** Validate an item definition - call this when loading data */
export function validateItem(item: unknown): item is ItemDefinition {
  if (!item || typeof item !== 'object') return false;

  const i = item as Partial<ItemDefinition>;

  // Required fields
  if (!i.slug || typeof i.slug !== 'string') return false;
  if (!i.name || typeof i.name !== 'string') return false;
  if (!i.category) return false;
  if (!i.rarity) return false;
  if (typeof i.basePrice !== 'number') return false;
  if (!Array.isArray(i.effects)) return false;

  return true;
}

/**
 * Generate wiki-ready stat block from item effects
 */
export function generateStatBlock(item: ItemDefinition): string {
  const lines: string[] = [];

  for (const effect of item.effects) {
    if (effect.stats) {
      const s = effect.stats;
      if (s.bonusThrows) lines.push(`+${s.bonusThrows} Throw${s.bonusThrows > 1 ? 's' : ''}`);
      if (s.bonusTrades) lines.push(`+${s.bonusTrades} Trade${s.bonusTrades > 1 ? 's' : ''}`);
      if (s.scoreMultiplier && s.scoreMultiplier !== 1) {
        const pct = Math.round((s.scoreMultiplier - 1) * 100);
        lines.push(`${pct > 0 ? '+' : ''}${pct}% Score`);
      }
      if (s.startingScore) lines.push(`+${s.startingScore} Starting Score`);

      // Element damage
      for (const [elem, val] of Object.entries(s.elementDamage || {})) {
        if (val) lines.push(`+${Math.round(val * 100)}% ${elem} damage`);
      }
    }

    // Special effects get their description
    if (effect.special) {
      lines.push(effect.description);
    }
  }

  return lines.join(' | ');
}

/**
 * Merge item effects into cumulative combat stats
 */
export function mergeItemStats(items: ItemDefinition[]): CombatStats {
  const merged: CombatStats = { ...DEFAULT_COMBAT_STATS, elementDamage: {} };

  for (const item of items) {
    for (const effect of item.effects) {
      if (effect.trigger !== 'passive' || !effect.stats) continue;

      const s = effect.stats;
      if (s.bonusThrows) merged.bonusThrows += s.bonusThrows;
      if (s.bonusTrades) merged.bonusTrades += s.bonusTrades;
      if (s.scoreMultiplier) merged.scoreMultiplier *= s.scoreMultiplier;
      if (s.startingScore) merged.startingScore += s.startingScore;
      if (s.rerollCost) merged.rerollCost += s.rerollCost;
      if (s.handSize) merged.handSize += s.handSize;
      if (s.integrityBonus) merged.integrityBonus += s.integrityBonus;
      if (s.integrityRegen) merged.integrityRegen += s.integrityRegen;

      // Merge element damage
      for (const [elem, val] of Object.entries(s.elementDamage || {})) {
        const key = elem as ItemElement;
        merged.elementDamage[key] = (merged.elementDamage[key] || 0) + (val || 0);
      }
    }
  }

  return merged;
}
