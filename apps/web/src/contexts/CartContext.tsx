/**
 * Cart Context - Manages shopping cart state for the Market
 *
 * Fictional currency, no auth friction needed.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Item, Shop, InventoryItem } from '../data/wiki/types';

// Cart item includes the item, shop source, and quantity
export interface CartItem {
  item: Item;
  shop: Shop;
  inventoryEntry: InventoryItem;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Item, shop: Shop, inventoryEntry: InventoryItem) => void;
  removeItem: (itemSlug: string, shopSlug: string) => void;
  updateQuantity: (itemSlug: string, shopSlug: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Item, shop: Shop, inventoryEntry: InventoryItem) => {
    setItems((prev) => {
      // Check if item from same shop already in cart
      const existingIndex = prev.findIndex(
        (ci) => ci.item.slug === item.slug && ci.shop.slug === shop.slug
      );

      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      // Add new item
      return [...prev, { item, shop, inventoryEntry, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemSlug: string, shopSlug: string) => {
    setItems((prev) =>
      prev.filter((ci) => !(ci.item.slug === itemSlug && ci.shop.slug === shopSlug))
    );
  }, []);

  const updateQuantity = useCallback((itemSlug: string, shopSlug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemSlug, shopSlug);
      return;
    }

    setItems((prev) =>
      prev.map((ci) =>
        ci.item.slug === itemSlug && ci.shop.slug === shopSlug
          ? { ...ci, quantity }
          : ci
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, ci) => {
      const price = typeof ci.inventoryEntry.price === 'number' ? ci.inventoryEntry.price : 0;
      return sum + price * ci.quantity;
    }, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, ci) => sum + ci.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
