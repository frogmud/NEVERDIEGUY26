/**
 * useDiceHand - Hook for managing Play/Hold dice mechanic
 *
 * Provides state and actions for the poker-style dice holding system.
 */

import { useReducer, useCallback, useMemo } from 'react';
import type { DieSides, Element } from '../data/wiki/types';
import {
  type DiceHand,
  type DiceHandAction,
  diceHandReducer,
  createInitialHand,
  DEFAULT_MAX_THROWS,
} from '../games/meteor/types';

export interface DiceConfig {
  sides: DieSides;
  element: Element;
  color: string;
}

export interface UseDiceHandOptions {
  /** Initial dice configuration */
  initialDice?: DiceConfig[];
  /** Maximum throws per room (default: 3) */
  maxThrows?: number;
  /** Callback when dice are thrown */
  onThrow?: (diceToThrow: Array<{ id: string; sides: DieSides; element: Element }>) => void;
  /** Callback when hand is played (score locked in) */
  onPlay?: (hand: DiceHand) => void;
}

// Default starting dice
const DEFAULT_DICE: DiceConfig[] = [
  { sides: 4, element: 'Void', color: '#9b59b6' },
  { sides: 6, element: 'Earth', color: '#2ecc71' },
  { sides: 8, element: 'Death', color: '#7f8c8d' },
  { sides: 12, element: 'Fire', color: '#e74c3c' },
  { sides: 20, element: 'Wind', color: '#3498db' },
];

export function useDiceHand(options: UseDiceHandOptions = {}) {
  const {
    initialDice = DEFAULT_DICE,
    maxThrows = DEFAULT_MAX_THROWS,
    onThrow,
    onPlay,
  } = options;

  const [hand, dispatch] = useReducer(
    diceHandReducer,
    initialDice,
    createInitialHand
  );

  // Toggle hold state for a die
  const toggleHold = useCallback((dieId: string) => {
    dispatch({ type: 'TOGGLE_HOLD', dieId });
  }, []);

  // Throw non-held dice
  const throwDice = useCallback(() => {
    if (hand.throwsRemaining <= 0) return;

    // Get dice that will be thrown (not held)
    const diceToThrow = hand.dice
      .filter((d) => !d.held)
      .map((d) => ({ id: d.id, sides: d.sides, element: d.element }));

    dispatch({ type: 'THROW_DICE' });

    // Notify parent component
    if (onThrow && diceToThrow.length > 0) {
      onThrow(diceToThrow);
    }
  }, [hand.dice, hand.throwsRemaining, onThrow]);

  // Update a die's value after it lands
  const updateDieValue = useCallback((dieId: string, value: number) => {
    dispatch({ type: 'UPDATE_DIE_VALUE', dieId, value });
  }, []);

  // Set throwing state
  const setThrowing = useCallback((throwing: boolean) => {
    dispatch({ type: 'SET_THROWING', throwing });
  }, []);

  // Play the current hand (lock in score)
  const playHand = useCallback(() => {
    if (onPlay) {
      onPlay(hand);
    }
    dispatch({ type: 'PLAY_HAND' });
  }, [hand, onPlay]);

  // Hold current dice, draw replacements
  const holdAndDraw = useCallback(() => {
    dispatch({ type: 'HOLD_AND_DRAW' });
  }, []);

  // Reset hand to initial state
  const resetHand = useCallback(() => {
    dispatch({ type: 'RESET_HAND' });
  }, []);

  // Derived state
  const stats = useMemo(() => {
    const heldCount = hand.dice.filter((d) => d.held).length;
    const unheldCount = hand.dice.length - heldCount;
    const hasResults = hand.dice.some((d) => d.value !== null);
    const totalValue = hand.dice.reduce((sum, d) => sum + (d.value ?? 0), 0);

    return {
      heldCount,
      unheldCount,
      hasResults,
      totalValue,
      canThrow: hand.throwsRemaining > 0 && unheldCount > 0 && !hand.throwing,
      canHold: hand.throwsRemaining > 0 && heldCount > 0 && !hand.throwing,
      canPlay: hasResults && !hand.throwing,
    };
  }, [hand]);

  return {
    hand,
    stats,
    toggleHold,
    throwDice,
    updateDieValue,
    setThrowing,
    playHand,
    holdAndDraw,
    resetHand,
  };
}
