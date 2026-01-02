import { useState, useEffect, useCallback } from 'react';
import {
  type PlayerData,
  type StashItem,
  loadPlayerData,
  savePlayerData,
  addToStash as addToStashFn,
  removeFromStash as removeFromStashFn,
  addGold as addGoldFn,
  spendGold as spendGoldFn,
  sellItem as sellItemFn,
  recordRunComplete as recordRunCompleteFn,
  findInStash,
  getStashQuantity,
} from '../data/player/storage';

export interface UsePlayerDataReturn {
  // Data
  playerData: PlayerData;
  stash: StashItem[];
  gold: number;

  // Stash operations
  addToStash: (itemSlug: string, quantity?: number) => void;
  removeFromStash: (itemId: string, quantity?: number) => void;
  hasItem: (itemSlug: string) => boolean;
  getItemQuantity: (itemSlug: string) => number;

  // Gold operations
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  canAfford: (amount: number) => boolean;

  // Item transactions
  sellItem: (itemId: string, price: number, quantity?: number) => void;

  // Run lifecycle
  recordRunComplete: (won: boolean, goldEarned: number) => void;

  // Utility
  reload: () => void;
}

export function usePlayerData(): UsePlayerDataReturn {
  const [playerData, setPlayerData] = useState<PlayerData>(loadPlayerData);

  // Auto-save whenever playerData changes
  useEffect(() => {
    savePlayerData(playerData);
  }, [playerData]);

  // Stash operations
  const addToStash = useCallback((itemSlug: string, quantity: number = 1) => {
    setPlayerData((prev) => addToStashFn(prev, itemSlug, quantity));
  }, []);

  const removeFromStash = useCallback((itemId: string, quantity: number = 1) => {
    setPlayerData((prev) => removeFromStashFn(prev, itemId, quantity));
  }, []);

  const hasItem = useCallback(
    (itemSlug: string) => findInStash(playerData, itemSlug) !== undefined,
    [playerData]
  );

  const getItemQuantity = useCallback(
    (itemSlug: string) => getStashQuantity(playerData, itemSlug),
    [playerData]
  );

  // Gold operations
  const addGold = useCallback((amount: number) => {
    setPlayerData((prev) => addGoldFn(prev, amount));
  }, []);

  const spendGold = useCallback((amount: number): boolean => {
    let success = false;
    setPlayerData((prev) => {
      const result = spendGoldFn(prev, amount);
      if (result) {
        success = true;
        return result;
      }
      return prev;
    });
    return success;
  }, []);

  const canAfford = useCallback(
    (amount: number) => playerData.gold >= amount,
    [playerData.gold]
  );

  // Item transactions
  const sellItem = useCallback((itemId: string, price: number, quantity: number = 1) => {
    setPlayerData((prev) => sellItemFn(prev, itemId, price, quantity));
  }, []);

  // Run lifecycle
  const recordRunComplete = useCallback((won: boolean, goldEarned: number) => {
    setPlayerData((prev) => recordRunCompleteFn(prev, won, goldEarned));
  }, []);

  // Utility
  const reload = useCallback(() => {
    setPlayerData(loadPlayerData());
  }, []);

  return {
    playerData,
    stash: playerData.stash,
    gold: playerData.gold,

    addToStash,
    removeFromStash,
    hasItem,
    getItemQuantity,

    addGold,
    spendGold,
    canAfford,

    sellItem,
    recordRunComplete,

    reload,
  };
}
