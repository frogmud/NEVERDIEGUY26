/**
 * Combat Item Effects
 *
 * Simple bonuses that items provide during combat.
 * Applied at combat start from inventory.
 * Roguelike: items are lost at end of run.
 */

import type { Element, Item } from '../wiki/types';
import { getEntity } from '../wiki';

// Combat effect types
export type CombatEffectType =
  | 'throws'           // +N throws per combat
  | 'trades'           // +N trades per combat
  | 'multiplier'       // +X% base score multiplier
  | 'elementBonus'     // +X% damage for specific element
  | 'allElements'      // +X% damage for all elements
  | 'gold'             // +X% gold from combat
  | 'critChance'       // +X% chance for max roll bonus
  | 'startingScore';   // Start combat with X score

export interface CombatEffect {
  type: CombatEffectType;
  value: number;           // Amount (1 = +1, 0.5 = +50%, etc.)
  element?: Element;       // For elementBonus type
  description?: string;    // Display text
}

// Combat bonuses calculated from all active items
export interface CombatBonuses {
  bonusThrows: number;       // Default 3, items add to this
  bonusTrades: number;       // Default 2, items add to this
  scoreMultiplier: number;   // Default 1.0, items multiply this
  elementBonuses: Partial<Record<Element, number>>; // Per-element multipliers
  goldMultiplier: number;    // Default 1.0
  critChance: number;        // Default 0 (max roll already doubles)
  startingScore: number;     // Default 0
}

// Default combat bonuses (no items)
export const DEFAULT_COMBAT_BONUSES: CombatBonuses = {
  bonusThrows: 0,
  bonusTrades: 0,
  scoreMultiplier: 1.0,
  elementBonuses: {},
  goldMultiplier: 1.0,
  critChance: 0,
  startingScore: 0,
};

/**
 * Calculate combat bonuses from a list of item effects
 */
export function calculateCombatBonuses(effects: CombatEffect[]): CombatBonuses {
  const bonuses: CombatBonuses = { ...DEFAULT_COMBAT_BONUSES, elementBonuses: {} };

  for (const effect of effects) {
    switch (effect.type) {
      case 'throws':
        bonuses.bonusThrows += effect.value;
        break;
      case 'trades':
        bonuses.bonusTrades += effect.value;
        break;
      case 'multiplier':
        bonuses.scoreMultiplier += effect.value;
        break;
      case 'elementBonus':
        if (effect.element) {
          bonuses.elementBonuses[effect.element] =
            (bonuses.elementBonuses[effect.element] || 0) + effect.value;
        }
        break;
      case 'allElements':
        // Add to all elements
        const elements: Element[] = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];
        for (const el of elements) {
          bonuses.elementBonuses[el] = (bonuses.elementBonuses[el] || 0) + effect.value;
        }
        break;
      case 'gold':
        bonuses.goldMultiplier += effect.value;
        break;
      case 'critChance':
        bonuses.critChance += effect.value;
        break;
      case 'startingScore':
        bonuses.startingScore += effect.value;
        break;
    }
  }

  return bonuses;
}

/**
 * Item effect definitions by slug
 * Maps item slugs to their combat effects
 */
export const ITEM_COMBAT_EFFECTS: Record<string, CombatEffect[]> = {
  // Starter items (from traveler loadouts)
  'worn-dice-bag': [
    { type: 'throws', value: 1, description: '+1 Throw' },
  ],
  'lucky-charm': [
    { type: 'multiplier', value: 0.1, description: '+10% Score' },
  ],
  'traders-coin': [
    { type: 'trades', value: 1, description: '+1 Trade' },
  ],
  'void-crystal': [
    { type: 'elementBonus', value: 0.25, element: 'Void', description: '+25% Void damage' },
  ],
  'earth-stone': [
    { type: 'elementBonus', value: 0.25, element: 'Earth', description: '+25% Earth damage' },
  ],
  'death-sigil': [
    { type: 'elementBonus', value: 0.25, element: 'Death', description: '+25% Death damage' },
  ],
  'fire-ember': [
    { type: 'elementBonus', value: 0.25, element: 'Fire', description: '+25% Fire damage' },
  ],
  'ice-shard': [
    { type: 'elementBonus', value: 0.25, element: 'Ice', description: '+25% Ice damage' },
  ],
  'wind-feather': [
    { type: 'elementBonus', value: 0.25, element: 'Wind', description: '+25% Wind damage' },
  ],

  // Shop items
  'extra-throw': [
    { type: 'throws', value: 1, description: '+1 Throw' },
  ],
  'extra-trade': [
    { type: 'trades', value: 1, description: '+1 Trade' },
  ],
  'score-booster': [
    { type: 'multiplier', value: 0.2, description: '+20% Score' },
  ],
  'gold-magnet': [
    { type: 'gold', value: 0.25, description: '+25% Gold' },
  ],
  'elemental-prism': [
    { type: 'allElements', value: 0.1, description: '+10% All Elements' },
  ],
  'head-start': [
    { type: 'startingScore', value: 500, description: 'Start with 500 Score' },
  ],

  // Rare/Epic items
  'dice-masters-gloves': [
    { type: 'throws', value: 2, description: '+2 Throws' },
    { type: 'multiplier', value: 0.1, description: '+10% Score' },
  ],
  'merchants-blessing': [
    { type: 'trades', value: 2, description: '+2 Trades' },
    { type: 'gold', value: 0.5, description: '+50% Gold' },
  ],
};

/**
 * Get combat effects for an item by slug
 */
export function getItemEffects(slug: string): CombatEffect[] {
  return ITEM_COMBAT_EFFECTS[slug] || [];
}

/**
 * Get combined combat bonuses from inventory item slugs
 */
export function getBonusesFromInventory(itemSlugs: string[]): CombatBonuses {
  const allEffects: CombatEffect[] = [];

  for (const slug of itemSlugs) {
    const effects = getItemEffects(slug);
    allEffects.push(...effects);
  }

  return calculateCombatBonuses(allEffects);
}

/**
 * Domain-Scoped Inventory Persistence
 *
 * Items expire when clearing a domain, EXCEPT:
 * - Legendary/Unique: Always persist
 * - Epic: Always persist
 * - Rare: Only if explicitly flagged with persistsAcrossDomains
 * - Common/Uncommon: Never persist (including starting loadout items)
 */

/**
 * Check if an item persists across domain clears
 */
export function itemPersistsAcrossDomains(slug: string): boolean {
  const entity = getEntity(slug);
  if (!entity || entity.category !== 'items') return false;

  const item = entity as Item;
  const rarity = item.rarity;

  // Legendary, Unique, Epic always persist
  if (rarity === 'Legendary' || rarity === 'Unique' || rarity === 'Epic') {
    return true;
  }

  // Rare items only if explicitly flagged
  if (rarity === 'Rare' && item.persistsAcrossDomains === true) {
    return true;
  }

  // Common/Uncommon never persist
  return false;
}

/**
 * Filter inventory to only persistent items (for domain transition)
 */
export function filterPersistentItems(itemSlugs: string[]): string[] {
  return itemSlugs.filter(itemPersistsAcrossDomains);
}
