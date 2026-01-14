/**
 * NEVER DIE GUY - Shop System
 *
 * Exports for shop pool generation and economy.
 */

export {
  // Types
  type ShopConfig,
  type ShopSlot,
  type ShopState,
  type ShopRng,
  // Constants
  DEFAULT_SHOP_CONFIG,
  WANDERER_EFFECTS,
  defaultRng,
  // Functions
  getTierPriceMultiplier,
  generateShopPool,
  rerollShop,
  purchaseItem,
  toggleLock,
  highlightSynergies,
} from './shop-pool';
