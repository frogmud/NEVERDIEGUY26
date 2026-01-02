import type { Item } from '../wiki/types';

// Marketplace listing status
export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled';

// Marketplace listing - a player-listed item for sale/trade
export interface MarketplaceListing {
  id: string;
  item: Item;

  // Seller info
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;        // 0-5 stars
  sellerTradeCount: number;
  sellerOnline?: boolean;
  sellerMemberSince?: string;  // e.g., "Jan 2024"

  // Pricing options
  buyNowPrice?: number;        // Gold amount (if set, instant purchase available)
  acceptingOffers: boolean;    // If true, "Make Offer" button shown
  minimumOffer?: number;       // Optional floor for offers

  // Listing metadata
  quantity: number;
  listedAt: Date;
  expiresAt?: Date;
  status: ListingStatus;
}

// Trade offer (for Phase 2)
export interface TradeOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;

  // Offer can be gold, items, or both
  goldAmount?: number;
  offeredItems?: Item[];

  status: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

// User wallet/inventory balance
export interface UserBalance {
  gold: number;
  // Add other currencies as needed
}

// Marketplace fee configuration
export const MARKETPLACE_FEE_PERCENT = 5; // 5% fee on transactions

export function calculateFee(price: number): number {
  return Math.ceil(price * (MARKETPLACE_FEE_PERCENT / 100));
}

export function calculateTotal(price: number): number {
  return price + calculateFee(price);
}

// Completed order/purchase
export interface MarketplaceOrder {
  id: string;
  transactionId: string;        // e.g., "TXN-ABC123"
  listing: MarketplaceListing;  // Snapshot of listing at purchase time
  buyerId: string;
  buyerName: string;

  // Payment breakdown
  itemPrice: number;
  fee: number;
  totalPaid: number;

  purchasedAt: Date;
  status: 'completed' | 'disputed' | 'refunded';
}

// Transaction for gold ledger
export type TransactionType = 'purchase' | 'sale' | 'fee' | 'deposit' | 'refund';

export interface GoldTransaction {
  id: string;
  type: TransactionType;
  description: string;          // e.g., "Purchased Void Blade from VoidWalker"
  amount: number;               // Positive for income, negative for expenses
  balanceAfter: number;         // Running balance
  relatedOrderId?: string;      // Link to order if applicable
  createdAt: Date;
}

// Watched listing (for watchlist)
export interface WatchedListing {
  listingId: string;
  addedAt: Date;
  notifyOnPriceChange?: boolean;
  notifyOnSold?: boolean;
}

// Seller stats for profile page
export interface SellerStats {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  rating: number;
  tradeCount: number;
  memberSince: string;
  online: boolean;

  // Extended stats
  activeListings: number;
  totalSales: number;
  totalEarned: number;
  avgResponseTime?: string;     // e.g., "< 1 hour"
}

// Current user's marketplace data
export interface UserMarketplaceData {
  balance: UserBalance;
  watchedListings: WatchedListing[];
  orders: MarketplaceOrder[];
  transactions: GoldTransaction[];
  myListingIds: string[];       // IDs of listings created by user
}
