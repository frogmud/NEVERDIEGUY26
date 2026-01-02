// Dice Favor System - Links dice rolls to Die-rector favor effects
import type { LuckyNumber } from '../wiki/types';
import { pantheon } from '../wiki/entities/pantheon';
import { DICE_CONFIG, getDiceConfig } from './config';

// Favor effect from a Die-rector
export interface FavorEffect {
  dierector: string;
  dierectorSlug: string;
  effect: string;
  roll: number;
  domain: string;
  element: string;
}

// Check if a die is the user's preferred die based on lucky number
export function isPreferredDie(diceSides: number, luckyNumber: LuckyNumber): boolean {
  // 0 = None - no preferred dice
  if (luckyNumber === 0) return false;

  // 7 = All dice are preferred
  if (luckyNumber === 7) return true;

  // Check if this die matches the user's lucky number
  const config = getDiceConfig(diceSides);
  return config?.luckyNumber === luckyNumber;
}

// Get the Die-rector for a specific die
export function getDierectorForDie(diceSides: number) {
  const config = getDiceConfig(diceSides);
  if (!config) return null;

  const dierector = pantheon.find(p => p.slug === config.dierector);
  return dierector || null;
}

// Get favor message for a specific roll on a die
export function getFavorEffect(diceSides: number, roll: number): FavorEffect | null {
  const config = getDiceConfig(diceSides);
  if (!config) return null;

  const dierector = pantheon.find(p => p.slug === config.dierector);
  if (!dierector) return null;

  const favor = dierector.favorEffects?.find(f => f.roll === roll);
  if (!favor) return null;

  return {
    dierector: dierector.name,
    dierectorSlug: dierector.slug,
    effect: favor.effect,
    roll,
    domain: config.domain,
    element: config.element,
  };
}

// Check if a roll triggers the user's lucky number blessing
// (rolling your lucky number on your preferred die)
export function checkLuckyRoll(
  diceSides: number,
  roll: number,
  luckyNumber: LuckyNumber
): FavorEffect | null {
  // Must be preferred die
  if (!isPreferredDie(diceSides, luckyNumber)) return null;

  // For lucky number 7 (all), any matching roll on any die triggers
  // For specific lucky numbers, roll must match the die's lucky number
  const config = getDiceConfig(diceSides);
  if (!config) return null;

  // Check if the roll value matches the die's associated lucky number
  // e.g., rolling a 2 on d6 (John's die) when your lucky number is 2
  if (luckyNumber !== 7 && roll !== luckyNumber) return null;

  // For lucky 7, trigger on any roll that matches the die's lucky number
  if (luckyNumber === 7 && roll !== config.luckyNumber) return null;

  return getFavorEffect(diceSides, roll);
}

// Get Dierector blessing for summoning duplicate dice
// When 2+ of the same die type are selected, the Die-rector grants a bonus
export interface DierectorBlessing {
  dierector: string;
  dierectorSlug: string;
  sides: number;
  count: number;
  bonusMultiplier: number;
  domain: string;
  element: string;
}

export function getDierectorBlessing(sides: number, count: number): DierectorBlessing | null {
  if (count < 2) return null;

  const config = getDiceConfig(sides);
  if (!config) return null;

  const dierector = pantheon.find(p => p.slug === config.dierector);
  if (!dierector) return null;

  // Bonus: +0.25x per duplicate (2 dice = +0.5x, 3 dice = +0.75x, etc.)
  const bonusMultiplier = count * 0.25;

  return {
    dierector: dierector.name,
    dierectorSlug: dierector.slug,
    sides,
    count,
    bonusMultiplier,
    domain: config.domain,
    element: config.element,
  };
}

// Check if roll is a 1 (for reroll mechanic on preferred dice)
export function shouldReroll(
  roll: number,
  diceSides: number,
  luckyNumber: LuckyNumber,
  hasRerolled: boolean
): boolean {
  // Only reroll 1s
  if (roll !== 1) return false;

  // Only on preferred dice
  if (!isPreferredDie(diceSides, luckyNumber)) return false;

  // Only reroll once
  if (hasRerolled) return false;

  return true;
}
