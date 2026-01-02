import { useState, useCallback, useRef } from 'react';

export interface RollHistoryEntry {
  dice: number[];
  values: number[];
  hits: number;
  score: number;
  type: 'summon' | 'tribute';
}

export interface CurrentRoll {
  dice: number[];
  values: number[];
  hits: number;
  score: number;
}

export interface UseRollHistoryReturn {
  history: RollHistoryEntry[];
  startRoll: (dice: number[], values: number[]) => void;
  recordHit: (score: number) => void;
  finishRoll: (type?: 'summon' | 'tribute') => void;
  addTributeRoll: (dice: number[], values: number[], boost: number) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 10;

export function useRollHistory(): UseRollHistoryReturn {
  const [history, setHistory] = useState<RollHistoryEntry[]>([]);
  const currentRollRef = useRef<CurrentRoll | null>(null);

  // Start tracking a new roll
  const startRoll = useCallback((dice: number[], values: number[]) => {
    currentRollRef.current = {
      dice: [...dice],
      values: [...values],
      hits: 0,
      score: 0,
    };
  }, []);

  // Record a hit during the current roll
  const recordHit = useCallback((score: number) => {
    if (currentRollRef.current) {
      currentRollRef.current.hits += 1;
      currentRollRef.current.score += score;
    }
  }, []);

  // Finish the current roll and add to history
  const finishRoll = useCallback((type: 'summon' | 'tribute' = 'summon') => {
    if (currentRollRef.current) {
      const entry: RollHistoryEntry = {
        ...currentRollRef.current,
        type,
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
      currentRollRef.current = null;
    }
  }, []);

  // Add a tribute roll directly (doesn't use currentRollRef)
  const addTributeRoll = useCallback((dice: number[], values: number[], boost: number) => {
    const entry: RollHistoryEntry = {
      dice,
      values,
      hits: 0,
      score: boost, // Store the multiplier boost as "score" for display
      type: 'tribute',
    };
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    currentRollRef.current = null;
  }, []);

  return {
    history,
    startRoll,
    recordHit,
    finishRoll,
    addTributeRoll,
    clearHistory,
  };
}
