import type { Item } from '../types';

// Import all item categories
import { weapons } from './items/weapons';
import { armor } from './items/armor';
import { consumables } from './items/consumables';
import { materials } from './items/materials';
import { artifacts } from './items/artifacts';
import { questItems } from './items/quest-items';

/**
 * NDG Items - Combined from all category files
 *
 * Categories:
 * - weapons.ts (30 items) - Swords, Axes, Bows, Daggers, Staffs, Misc Weapons
 * - armor.ts (11 items) - Shields, Boots, Helmets, Chestplates, Capes
 * - consumables.ts (46 items) - Food, Potions, Medical, Bombs, Misc Consumables
 * - materials.ts (34 items) - Crystals, Salts, Gems, Essences, Resources
 * - artifacts.ts (44 items) - Accessories, Equipment, Unique Items, Cursed Items
 * - quest-items.ts (33 items) - Keys, Books, Currency, Maps, Letters
 *
 * Total: ~198 enriched items
 */

// Combine all items into a single array
export const items: Item[] = [
  ...weapons,
  ...armor,
  ...consumables,
  ...materials,
  ...artifacts,
  ...questItems,
];

// Re-export individual categories for direct access
export { weapons } from './items/weapons';
export { armor } from './items/armor';
export { consumables } from './items/consumables';
export { materials } from './items/materials';
export { artifacts } from './items/artifacts';
export { questItems } from './items/quest-items';

// Helper function to get item by slug
export function getItemBySlug(slug: string): Item | undefined {
  return items.find(item => item.slug === slug);
}

// Helper function to get items by rarity
export function getItemsByRarity(rarity: string): Item[] {
  return items.filter(item => item.rarity === rarity);
}

// Helper function to get items by type
export function getItemsByType(itemType: string): Item[] {
  return items.filter(item => item.itemType === itemType);
}

// Helper function to get items by element
export function getItemsByElement(element: string): Item[] {
  return items.filter(item => item.element === element);
}

// Helper function to get items by tier
export function getItemsByTier(tier: number): Item[] {
  return items.filter(item => item.tier === tier);
}

// Helper function to get items by subtype
export function getItemsBySubtype(subtype: string): Item[] {
  return items.filter(item => item.subtype === subtype);
}
