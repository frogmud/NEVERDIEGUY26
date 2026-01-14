/**
 * Item System Exports
 */
export {
  // Types
  type ItemCategory,
  type ItemRarity,
  type ItemElement,
  type CombatStats,
  type EffectTrigger,
  type ItemEffect,
  type ItemDefinition,
  type RarityConfig,
  // Constants
  DEFAULT_COMBAT_STATS,
  RARITY_CONFIG,
  // Functions
  calculateShopPrice,
  validateItem,
  generateStatBlock,
  mergeItemStats,
} from './item-schema';
