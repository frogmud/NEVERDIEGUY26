import type {
  MarketplaceListing,
  UserBalance,
  MarketplaceOrder,
  GoldTransaction,
  WatchedListing,
  SellerStats,
  UserMarketplaceData,
} from './types';
import { calculateFee } from './types';
import { items } from '../wiki/entities/items';

// Helper to get item by slug
const getItem = (slug: string) => items.find(i => i.slug === slug);

// Mock seller data
const MOCK_SELLERS = [
  { id: 'seller-1', name: 'DragonSlayer99', rating: 4.8, trades: 127, online: true, since: 'Jan 2024' },
  { id: 'seller-2', name: 'LootGoblin', rating: 4.5, trades: 89, online: false, since: 'Mar 2024' },
  { id: 'seller-3', name: 'VoidWalker', rating: 5.0, trades: 234, online: true, since: 'Nov 2023' },
  { id: 'seller-4', name: 'CasualTrader', rating: 4.2, trades: 23, online: false, since: 'Oct 2024' },
  { id: 'seller-5', name: 'RareFinds', rating: 4.9, trades: 456, online: true, since: 'Aug 2023' },
  { id: 'seller-6', name: 'NightBlade', rating: 4.6, trades: 78, online: false, since: 'Jun 2024' },
];

// Create hours/days ago date
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// Mock marketplace listings
export const mockListings: MarketplaceListing[] = [
  // Legendary weapon - high value, buy now only
  {
    id: 'listing-1',
    item: getItem('axe-of-negation')!,
    sellerId: 'seller-3',
    sellerName: 'VoidWalker',
    sellerRating: 5.0,
    sellerTradeCount: 234,
    sellerOnline: true,
    sellerMemberSince: 'Nov 2023',
    buyNowPrice: 4500,
    acceptingOffers: false,
    quantity: 1,
    listedAt: hoursAgo(2),
    status: 'active',
  },
  // Epic material - accepts offers
  {
    id: 'listing-2',
    item: getItem('essence-of-void')!,
    sellerId: 'seller-1',
    sellerName: 'DragonSlayer99',
    sellerRating: 4.8,
    sellerTradeCount: 127,
    sellerOnline: true,
    sellerMemberSince: 'Jan 2024',
    buyNowPrice: 450,
    acceptingOffers: true,
    minimumOffer: 350,
    quantity: 3,
    listedAt: hoursAgo(5),
    status: 'active',
  },
  // Common consumable - cheap, quick sale
  {
    id: 'listing-3',
    item: getItem('potion')!,
    sellerId: 'seller-2',
    sellerName: 'LootGoblin',
    sellerRating: 4.5,
    sellerTradeCount: 89,
    sellerOnline: false,
    sellerMemberSince: 'Mar 2024',
    buyNowPrice: 20,
    acceptingOffers: false,
    quantity: 10,
    listedAt: hoursAgo(1),
    status: 'active',
  },
  // Rare armor - offers only, no buy now
  {
    id: 'listing-4',
    item: {
      slug: 'frost-plate',
      name: 'Frost Plate Armor',
      category: 'items',
      rarity: 'Rare',
      itemType: 'Armor',
      description: 'Heavy armor infused with frost magic. Provides excellent protection against fire.',
      element: 'Ice',
      preferredDice: 12,
      tier: 3,
      level: 30,
    },
    sellerId: 'seller-5',
    sellerName: 'RareFinds',
    sellerRating: 4.9,
    sellerTradeCount: 456,
    sellerOnline: true,
    sellerMemberSince: 'Aug 2023',
    acceptingOffers: true,
    minimumOffer: 1500,
    quantity: 1,
    listedAt: daysAgo(1),
    status: 'active',
  },
  // Epic weapon
  {
    id: 'listing-5',
    item: {
      slug: 'flame-sword',
      name: 'Flame Sword',
      category: 'items',
      rarity: 'Epic',
      itemType: 'Weapon',
      subtype: 'Sword',
      description: 'A blade wreathed in eternal flames. Burns enemies on contact.',
      element: 'Fire',
      preferredDice: 10,
      tier: 4,
      level: 35,
    },
    sellerId: 'seller-6',
    sellerName: 'NightBlade',
    sellerRating: 4.6,
    sellerTradeCount: 78,
    sellerOnline: false,
    sellerMemberSince: 'Jun 2024',
    buyNowPrice: 2800,
    acceptingOffers: true,
    minimumOffer: 2200,
    quantity: 1,
    listedAt: hoursAgo(8),
    status: 'active',
  },
  // Uncommon material bulk
  {
    id: 'listing-6',
    item: {
      slug: 'iron-ore',
      name: 'Iron Ore',
      category: 'items',
      rarity: 'Uncommon',
      itemType: 'Material',
      description: 'Raw iron ore used for crafting weapons and armor.',
      element: 'Earth',
      preferredDice: 6,
      tier: 2,
      level: 10,
    },
    sellerId: 'seller-4',
    sellerName: 'CasualTrader',
    sellerRating: 4.2,
    sellerTradeCount: 23,
    sellerOnline: false,
    sellerMemberSince: 'Oct 2024',
    buyNowPrice: 15,
    acceptingOffers: false,
    quantity: 50,
    listedAt: daysAgo(2),
    status: 'active',
  },
  // Legendary accessory
  {
    id: 'listing-7',
    item: {
      slug: 'ring-of-the-void',
      name: 'Ring of the Void',
      category: 'items',
      rarity: 'Legendary',
      itemType: 'Artifact',
      description: 'A ring that channels void energy. Grants significant power at a cost.',
      element: 'Void',
      preferredDice: 4,
      tier: 5,
      level: 45,
    },
    sellerId: 'seller-3',
    sellerName: 'VoidWalker',
    sellerRating: 5.0,
    sellerTradeCount: 234,
    sellerOnline: true,
    sellerMemberSince: 'Nov 2023',
    buyNowPrice: 8000,
    acceptingOffers: true,
    minimumOffer: 6500,
    quantity: 1,
    listedAt: hoursAgo(3),
    status: 'active',
  },
  // Common food item
  {
    id: 'listing-8',
    item: {
      slug: 'bread',
      name: 'Fresh Bread',
      category: 'items',
      rarity: 'Common',
      itemType: 'Consumable',
      description: 'Freshly baked bread. Restores a small amount of health.',
      element: 'Neutral',
      tier: 1,
      level: 1,
    },
    sellerId: 'seller-2',
    sellerName: 'LootGoblin',
    sellerRating: 4.5,
    sellerTradeCount: 89,
    sellerOnline: false,
    sellerMemberSince: 'Mar 2024',
    buyNowPrice: 5,
    acceptingOffers: false,
    quantity: 25,
    listedAt: hoursAgo(12),
    status: 'active',
  },
  // Rare weapon
  {
    id: 'listing-9',
    item: {
      slug: 'thunder-bow',
      name: 'Thunder Bow',
      category: 'items',
      rarity: 'Rare',
      itemType: 'Weapon',
      subtype: 'Bow',
      description: 'A bow that crackles with lightning. Arrows strike with thunderous force.',
      element: 'Wind',
      preferredDice: 20,
      tier: 3,
      level: 28,
    },
    sellerId: 'seller-1',
    sellerName: 'DragonSlayer99',
    sellerRating: 4.8,
    sellerTradeCount: 127,
    sellerOnline: true,
    sellerMemberSince: 'Jan 2024',
    buyNowPrice: 1800,
    acceptingOffers: true,
    minimumOffer: 1400,
    quantity: 1,
    listedAt: daysAgo(1),
    status: 'active',
  },
  // Epic consumable
  {
    id: 'listing-10',
    item: {
      slug: 'elixir-of-power',
      name: 'Elixir of Power',
      category: 'items',
      rarity: 'Epic',
      itemType: 'Consumable',
      description: 'A powerful elixir that temporarily doubles attack damage.',
      element: 'Neutral',
      tier: 4,
      level: 30,
    },
    sellerId: 'seller-5',
    sellerName: 'RareFinds',
    sellerRating: 4.9,
    sellerTradeCount: 456,
    sellerOnline: true,
    sellerMemberSince: 'Aug 2023',
    buyNowPrice: 350,
    acceptingOffers: false,
    quantity: 5,
    listedAt: hoursAgo(6),
    status: 'active',
  },
  // Uncommon armor
  {
    id: 'listing-11',
    item: {
      slug: 'leather-vest',
      name: 'Reinforced Leather Vest',
      category: 'items',
      rarity: 'Uncommon',
      itemType: 'Armor',
      description: 'A sturdy leather vest reinforced with metal studs.',
      element: 'Earth',
      preferredDice: 6,
      tier: 2,
      level: 15,
    },
    sellerId: 'seller-4',
    sellerName: 'CasualTrader',
    sellerRating: 4.2,
    sellerTradeCount: 23,
    sellerOnline: false,
    sellerMemberSince: 'Oct 2024',
    buyNowPrice: 180,
    acceptingOffers: true,
    minimumOffer: 120,
    quantity: 1,
    listedAt: hoursAgo(18),
    status: 'active',
  },
  // Unique item - offers only
  {
    id: 'listing-12',
    item: {
      slug: 'die-rectors-blessing',
      name: "Die-rector's Blessing",
      category: 'items',
      rarity: 'Unique',
      itemType: 'Artifact',
      description: 'A mysterious artifact blessed by The One. Grants favor with all Die-rectors.',
      element: 'Void',
      preferredDice: 4,
      tier: 6,
      level: 50,
    },
    sellerId: 'seller-3',
    sellerName: 'VoidWalker',
    sellerRating: 5.0,
    sellerTradeCount: 234,
    sellerOnline: true,
    sellerMemberSince: 'Nov 2023',
    acceptingOffers: true,
    minimumOffer: 15000,
    quantity: 1,
    listedAt: hoursAgo(1),
    status: 'active',
  },
];

// Mock user balance
export const mockUserBalance: UserBalance = {
  gold: 15000,
};

// Get listing by ID
export function getListingById(id: string): MarketplaceListing | undefined {
  return mockListings.find(l => l.id === id);
}

// Get similar listings (same item type or element)
export function getSimilarListings(listing: MarketplaceListing, limit = 4): MarketplaceListing[] {
  return mockListings
    .filter(l =>
      l.id !== listing.id &&
      l.status === 'active' &&
      (l.item.itemType === listing.item.itemType || l.item.element === listing.item.element)
    )
    .slice(0, limit);
}

// Format time ago
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else {
    return 'Just now';
  }
}

// Get listings by seller
export function getListingsBySeller(sellerId: string): MarketplaceListing[] {
  return mockListings.filter(l => l.sellerId === sellerId && l.status === 'active');
}

// Get seller stats
export function getSellerStats(sellerId: string): SellerStats | undefined {
  const seller = MOCK_SELLERS.find(s => s.id === sellerId);
  if (!seller) return undefined;

  const sellerListings = mockListings.filter(l => l.sellerId === sellerId);
  const activeListings = sellerListings.filter(l => l.status === 'active').length;

  return {
    sellerId: seller.id,
    sellerName: seller.name,
    rating: seller.rating,
    tradeCount: seller.trades,
    memberSince: seller.since,
    online: seller.online,
    activeListings,
    totalSales: seller.trades,
    totalEarned: seller.trades * 850, // Fake average
    avgResponseTime: seller.online ? '< 1 hour' : '< 24 hours',
  };
}

// Mock order history (past purchases by current user)
export const mockOrders: MarketplaceOrder[] = [
  {
    id: 'order-1',
    transactionId: 'TXN-M8X7K2-A3B1',
    listing: {
      id: 'sold-1',
      item: {
        slug: 'shadow-dagger',
        name: 'Shadow Dagger',
        category: 'items',
        rarity: 'Rare',
        itemType: 'Weapon',
        subtype: 'Dagger',
        description: 'A dagger that phases through armor.',
        element: 'Death',
        preferredDice: 8,
        tier: 3,
        level: 25,
      },
      sellerId: 'seller-6',
      sellerName: 'NightBlade',
      sellerRating: 4.6,
      sellerTradeCount: 75,
      sellerOnline: false,
      sellerMemberSince: 'Jun 2024',
      buyNowPrice: 1200,
      acceptingOffers: false,
      quantity: 1,
      listedAt: daysAgo(5),
      status: 'sold',
    },
    buyerId: 'current-user',
    buyerName: 'You',
    itemPrice: 1200,
    fee: calculateFee(1200),
    totalPaid: 1200 + calculateFee(1200),
    purchasedAt: daysAgo(3),
    status: 'completed',
  },
  {
    id: 'order-2',
    transactionId: 'TXN-P4N2Q9-X7C3',
    listing: {
      id: 'sold-2',
      item: getItem('health-potion') || {
        slug: 'health-potion',
        name: 'Health Potion',
        category: 'items',
        rarity: 'Common',
        itemType: 'Consumable',
        description: 'Restores health.',
        tier: 1,
        level: 1,
      },
      sellerId: 'seller-2',
      sellerName: 'LootGoblin',
      sellerRating: 4.5,
      sellerTradeCount: 88,
      sellerOnline: false,
      sellerMemberSince: 'Mar 2024',
      buyNowPrice: 20,
      acceptingOffers: false,
      quantity: 5,
      listedAt: daysAgo(8),
      status: 'sold',
    },
    buyerId: 'current-user',
    buyerName: 'You',
    itemPrice: 100, // 5 x 20
    fee: calculateFee(100),
    totalPaid: 100 + calculateFee(100),
    purchasedAt: daysAgo(7),
    status: 'completed',
  },
  {
    id: 'order-3',
    transactionId: 'TXN-K9L5M2-B8D4',
    listing: {
      id: 'sold-3',
      item: {
        slug: 'mystic-amulet',
        name: 'Mystic Amulet',
        category: 'items',
        rarity: 'Epic',
        itemType: 'Artifact',
        description: 'An amulet humming with arcane energy.',
        element: 'Void',
        preferredDice: 4,
        tier: 4,
        level: 38,
      },
      sellerId: 'seller-3',
      sellerName: 'VoidWalker',
      sellerRating: 5.0,
      sellerTradeCount: 230,
      sellerOnline: true,
      sellerMemberSince: 'Nov 2023',
      buyNowPrice: 3200,
      acceptingOffers: true,
      minimumOffer: 2800,
      quantity: 1,
      listedAt: daysAgo(12),
      status: 'sold',
    },
    buyerId: 'current-user',
    buyerName: 'You',
    itemPrice: 3200,
    fee: calculateFee(3200),
    totalPaid: 3200 + calculateFee(3200),
    purchasedAt: daysAgo(10),
    status: 'completed',
  },
];

// Mock gold transactions (ledger)
export const mockTransactions: GoldTransaction[] = [
  {
    id: 'txn-1',
    type: 'deposit',
    description: 'Initial gold deposit',
    amount: 20000,
    balanceAfter: 20000,
    createdAt: daysAgo(30),
  },
  {
    id: 'txn-2',
    type: 'purchase',
    description: 'Purchased Mystic Amulet from VoidWalker',
    amount: -3200,
    balanceAfter: 16800,
    relatedOrderId: 'order-3',
    createdAt: daysAgo(10),
  },
  {
    id: 'txn-3',
    type: 'fee',
    description: 'Marketplace fee (5%)',
    amount: -160,
    balanceAfter: 16640,
    relatedOrderId: 'order-3',
    createdAt: daysAgo(10),
  },
  {
    id: 'txn-4',
    type: 'purchase',
    description: 'Purchased Health Potion x5 from LootGoblin',
    amount: -100,
    balanceAfter: 16540,
    relatedOrderId: 'order-2',
    createdAt: daysAgo(7),
  },
  {
    id: 'txn-5',
    type: 'fee',
    description: 'Marketplace fee (5%)',
    amount: -5,
    balanceAfter: 16535,
    relatedOrderId: 'order-2',
    createdAt: daysAgo(7),
  },
  {
    id: 'txn-6',
    type: 'sale',
    description: 'Sold Iron Sword to DragonSlayer99',
    amount: 475, // After seller fee deducted
    balanceAfter: 17010,
    createdAt: daysAgo(5),
  },
  {
    id: 'txn-7',
    type: 'purchase',
    description: 'Purchased Shadow Dagger from NightBlade',
    amount: -1200,
    balanceAfter: 15810,
    relatedOrderId: 'order-1',
    createdAt: daysAgo(3),
  },
  {
    id: 'txn-8',
    type: 'fee',
    description: 'Marketplace fee (5%)',
    amount: -60,
    balanceAfter: 15750,
    relatedOrderId: 'order-1',
    createdAt: daysAgo(3),
  },
  {
    id: 'txn-9',
    type: 'sale',
    description: 'Sold Leather Boots to CasualTrader',
    amount: 190, // After seller fee deducted
    balanceAfter: 15940,
    createdAt: daysAgo(1),
  },
];

// Mock watched listings
export const mockWatchedListings: WatchedListing[] = [
  { listingId: 'listing-1', addedAt: daysAgo(2), notifyOnPriceChange: true },
  { listingId: 'listing-7', addedAt: daysAgo(1), notifyOnSold: true },
  { listingId: 'listing-4', addedAt: hoursAgo(5), notifyOnPriceChange: true },
];

// Mock user's own listings (as a seller)
export const mockMyListingIds = ['listing-6', 'listing-8']; // User is CasualTrader for demo

// Current user ID for demo
export const CURRENT_USER_ID = 'seller-4'; // CasualTrader
export const CURRENT_USER_NAME = 'CasualTrader';

// Combined user marketplace data
export const mockUserMarketplaceData: UserMarketplaceData = {
  balance: mockUserBalance,
  watchedListings: mockWatchedListings,
  orders: mockOrders,
  transactions: mockTransactions,
  myListingIds: mockMyListingIds,
};

// Get watched listings with full data
export function getWatchedListingsWithData(): (WatchedListing & { listing: MarketplaceListing | undefined })[] {
  return mockWatchedListings.map(w => ({
    ...w,
    listing: mockListings.find(l => l.id === w.listingId),
  }));
}

// Get user's own listings
export function getMyListings(): MarketplaceListing[] {
  return mockListings.filter(l => mockMyListingIds.includes(l.id));
}
