/**
 * Dice Meteor Game Types
 *
 * Core types for the combat system including Play/Hold mechanic.
 */

import type { DieSides, Element } from '../../data/wiki/types';

/**
 * Individual die in the player's hand
 */
export interface HandDie {
  id: string;
  sides: DieSides;
  element: Element;
  color: string;
  /** Whether this die is held (kept for next throw) */
  held: boolean;
  /** Current rolled value (null if not thrown yet) */
  value: number | null;
}

/**
 * Player's dice hand state for Play/Hold mechanic
 */
export interface DiceHand {
  /** Dice currently in hand */
  dice: HandDie[];
  /** Number of throws remaining this room */
  throwsRemaining: number;
  /** Maximum throws per room */
  maxThrows: number;
  /** Whether currently in a throw animation */
  throwing: boolean;
  /** Accumulated score from throws this turn */
  turnScore: number;
}

/**
 * Actions for the Play/Hold mechanic
 */
export type DiceHandAction =
  | { type: 'TOGGLE_HOLD'; dieId: string }
  | { type: 'THROW_DICE' }
  | { type: 'PLAY_HAND' }
  | { type: 'HOLD_AND_DRAW' }
  | { type: 'RESET_HAND' }
  | { type: 'SET_THROWING'; throwing: boolean }
  | { type: 'UPDATE_DIE_VALUE'; dieId: string; value: number };

/**
 * Default dice hand configuration
 */
export const DEFAULT_HAND_SIZE = 5;
export const DEFAULT_MAX_THROWS = 3;

/**
 * Create initial dice hand from player's inventory
 */
export function createInitialHand(dice: Array<{ sides: DieSides; element: Element; color: string }>): DiceHand {
  return {
    dice: dice.slice(0, DEFAULT_HAND_SIZE).map((d, i) => ({
      id: `die-${i}-${Date.now()}`,
      sides: d.sides,
      element: d.element,
      color: d.color,
      held: false,
      value: null,
    })),
    throwsRemaining: DEFAULT_MAX_THROWS,
    maxThrows: DEFAULT_MAX_THROWS,
    throwing: false,
    turnScore: 0,
  };
}

/**
 * Reducer for dice hand state
 */
export function diceHandReducer(state: DiceHand, action: DiceHandAction): DiceHand {
  switch (action.type) {
    case 'TOGGLE_HOLD':
      return {
        ...state,
        dice: state.dice.map((die) =>
          die.id === action.dieId ? { ...die, held: !die.held } : die
        ),
      };

    case 'THROW_DICE':
      if (state.throwsRemaining <= 0) return state;
      return {
        ...state,
        throwsRemaining: state.throwsRemaining - 1,
        throwing: true,
        // Values will be set by UPDATE_DIE_VALUE as dice land
      };

    case 'SET_THROWING':
      return { ...state, throwing: action.throwing };

    case 'UPDATE_DIE_VALUE':
      return {
        ...state,
        dice: state.dice.map((die) =>
          die.id === action.dieId ? { ...die, value: action.value } : die
        ),
      };

    case 'PLAY_HAND':
      // Score is calculated and emitted, then hand resets
      return createInitialHand(
        state.dice.map((d) => ({ sides: d.sides, element: d.element, color: d.color }))
      );

    case 'HOLD_AND_DRAW':
      // Keep held dice, draw new ones for non-held
      return {
        ...state,
        dice: state.dice.map((die) => {
          if (die.held) {
            // Keep held dice but reset their value for re-throw
            return { ...die, value: null };
          }
          // Non-held dice would be replaced from inventory
          // For now, just reset them
          return { ...die, value: null, held: false };
        }),
      };

    case 'RESET_HAND':
      return createInitialHand(
        state.dice.map((d) => ({ sides: d.sides, element: d.element, color: d.color }))
      );

    default:
      return state;
  }
}
