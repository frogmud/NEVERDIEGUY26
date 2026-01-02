import { useState, useMemo, useCallback } from 'react';
import type { MeteorScene } from '../games/meteor/MeteorScene';

// Dice types available with their colors
const DICE_TYPES = [
  { sides: 4, color: '#8B4513' },
  { sides: 6, color: '#CD853F' },
  { sides: 8, color: '#9B59B6' },
  { sides: 10, color: '#27AE60' },
  { sides: 12, color: '#2980B9' },
  { sides: 20, color: '#C4A000' },
] as const;

export interface DieInfo {
  id: string;
  sides: number;
  color: string;
}

export interface UseDiceSelectionReturn {
  availableDice: DieInfo[];
  selectedDice: string[];
  selectedDiceObjects: DieInfo[];
  toggleDice: (dieId: string) => void;
  clearSelection: () => void;
}

export function useDiceSelection(
  diceInventory: Record<string, number>,
  sceneRef: React.RefObject<MeteorScene | null>,
  disabled: boolean = false
): UseDiceSelectionReturn {
  const [selectedDice, setSelectedDice] = useState<string[]>([]);

  // Build available dice array from inventory (expanded with indices)
  const availableDice = useMemo(() => {
    return Object.entries(diceInventory)
      .flatMap(([dieKey, count]) => {
        const sides = parseInt(dieKey.replace('d', ''));
        const diceType = DICE_TYPES.find((d) => d.sides === sides);
        return Array.from({ length: count }, (_, i) => ({
          id: `${dieKey}_${i}`,
          sides,
          color: diceType?.color || '#888',
        }));
      })
      .sort((a, b) => a.sides - b.sides);
  }, [diceInventory]);

  // Get selected dice objects
  const selectedDiceObjects = useMemo(() => {
    return selectedDice
      .map((id) => availableDice.find((d) => d.id === id))
      .filter((d): d is DieInfo => d !== undefined);
  }, [selectedDice, availableDice]);

  // Helper to safely update scene reticle
  const updateSceneReticle = useCallback(
    (selectedSides: number[]) => {
      const scene = sceneRef.current;
      if (scene && typeof scene.setSelectedDice === 'function') {
        try {
          scene.setSelectedDice(selectedSides);
        } catch (e) {
          // Scene may not be fully initialized yet, ignore
          console.debug('Scene reticle update deferred:', e);
        }
      }
    },
    [sceneRef]
  );

  // Toggle dice selection
  const toggleDice = useCallback(
    (dieId: string) => {
      if (disabled) return;

      setSelectedDice((prev) => {
        const newSelection = prev.includes(dieId)
          ? prev.filter((id) => id !== dieId)
          : [...prev, dieId];

        // Update reticle in scene with actual dice sides
        const selectedSides = newSelection
          .map((id) => availableDice.find((d) => d.id === id)?.sides)
          .filter((s): s is number => s !== undefined);
        updateSceneReticle(selectedSides);

        return newSelection;
      });
    },
    [disabled, availableDice, updateSceneReticle]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedDice([]);
    updateSceneReticle([]);
  }, [updateSceneReticle]);

  return {
    availableDice,
    selectedDice,
    selectedDiceObjects,
    toggleDice,
    clearSelection,
  };
}
