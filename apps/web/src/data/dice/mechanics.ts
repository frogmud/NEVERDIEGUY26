// Dice Mechanics - Game logic helpers for dice roguelike
import type { Element, DieSides } from '../wiki/types';
import { DICE_CONFIG, getDiceConfig } from './config';

// Element advantage wheel: Void → Earth → Death → Fire → Ice → Wind → Void
// Each element beats the next (+50% damage), is weak to previous (-50% damage)
const ELEMENT_WHEEL: Element[] = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];

/**
 * Get element advantage multiplier
 * @returns 1.5 for advantage, 0.5 for disadvantage, 1.0 for neutral
 */
export function getElementMultiplier(attacker: Element, defender: Element): number {
  if (attacker === 'Neutral' || defender === 'Neutral') return 1.0;
  if (attacker === defender) return 1.0;

  const attackerIndex = ELEMENT_WHEEL.indexOf(attacker);
  const defenderIndex = ELEMENT_WHEEL.indexOf(defender);

  if (attackerIndex === -1 || defenderIndex === -1) return 1.0;

  // Attacker beats the element after it in the wheel
  const beatsIndex = (attackerIndex + 1) % ELEMENT_WHEEL.length;
  if (defenderIndex === beatsIndex) return 1.5; // Advantage

  // Attacker is weak to the element before it in the wheel
  const weakToIndex = (attackerIndex - 1 + ELEMENT_WHEEL.length) % ELEMENT_WHEEL.length;
  if (defenderIndex === weakToIndex) return 0.5; // Disadvantage

  return 1.0; // Neutral
}

/**
 * Get the element that the given element beats
 */
export function getElementAdvantage(element: Element): Element | null {
  if (element === 'Neutral') return null;
  const index = ELEMENT_WHEEL.indexOf(element);
  if (index === -1) return null;
  return ELEMENT_WHEEL[(index + 1) % ELEMENT_WHEEL.length];
}

/**
 * Get the element that the given element is weak to
 */
export function getElementWeakness(element: Element): Element | null {
  if (element === 'Neutral') return null;
  const index = ELEMENT_WHEEL.indexOf(element);
  if (index === -1) return null;
  return ELEMENT_WHEEL[(index - 1 + ELEMENT_WHEEL.length) % ELEMENT_WHEEL.length];
}

/**
 * Get dice tier for damage scaling (1-6)
 */
export function getDiceTier(sides: DieSides): number {
  const config = getDiceConfig(sides);
  return config?.tier ?? 1;
}

/**
 * Get dice element
 */
export function getDiceElement(sides: DieSides): Element {
  const config = getDiceConfig(sides);
  return config?.element ?? 'Neutral';
}

/**
 * Get die that beats the given die (via element wheel)
 */
export function getDiceAdvantage(sides: DieSides): DieSides | null {
  const element = getDiceElement(sides);
  const weakTo = getElementWeakness(element);
  if (!weakTo) return null;
  const config = DICE_CONFIG.find(d => d.element === weakTo);
  return config?.sides ?? null;
}

/**
 * Get die that the given die beats (via element wheel)
 */
export function getDiceWeakness(sides: DieSides): DieSides | null {
  const element = getDiceElement(sides);
  const beats = getElementAdvantage(element);
  if (!beats) return null;
  const config = DICE_CONFIG.find(d => d.element === beats);
  return config?.sides ?? null;
}

/**
 * Calculate loot bonus based on die used
 * @returns Base loot bonus percentage (0-30)
 */
export function getLootBonus(die: DieSides): number {
  const config = getDiceConfig(die);
  return config?.lootBonus ?? 0;
}

/**
 * Calculate loot bonus with element synergy
 * @returns Bonus percentage with element multiplier
 */
export function getLootBonusWithElement(die: DieSides, itemElement: Element): number {
  const baseBonus = getLootBonus(die);
  const dieElement = getDiceElement(die);
  const multiplier = getElementMultiplier(dieElement, itemElement);
  return Math.round(baseBonus * multiplier);
}

/**
 * Check if roll is a crit for this die
 */
export function isCriticalRoll(die: DieSides, roll: number): boolean {
  const config = getDiceConfig(die);
  if (!config) return false;
  return roll >= config.critThreshold;
}

/**
 * Check if roll is a fumble (always 1)
 */
export function isFumbleRoll(roll: number): boolean {
  return roll === 1;
}

/**
 * Get damage range for a die
 */
export function getDamageRange(die: DieSides): [number, number] {
  const config = getDiceConfig(die);
  return config?.damageRange ?? [1, die];
}

/**
 * Calculate damage with element multiplier
 */
export function calculateDamage(
  roll: number,
  die: DieSides,
  attackerElement: Element,
  defenderElement: Element
): number {
  const baseMultiplier = getElementMultiplier(attackerElement, defenderElement);
  const critMultiplier = isCriticalRoll(die, roll) ? 2.0 : 1.0;
  return Math.round(roll * baseMultiplier * critMultiplier);
}

/**
 * Get all dice that an element is weak to (for enemy weakToDice)
 */
export function getWeakToDice(element: Element): DieSides[] {
  const weakToElement = getElementWeakness(element);
  if (!weakToElement) return [];
  const config = DICE_CONFIG.find(d => d.element === weakToElement);
  return config ? [config.sides] : [];
}

/**
 * Get all dice that an element resists (for enemy resistantToDice)
 */
export function getResistantToDice(element: Element): DieSides[] {
  const beatsElement = getElementAdvantage(element);
  if (!beatsElement) return [];
  const config = DICE_CONFIG.find(d => d.element === beatsElement);
  return config ? [config.sides] : [];
}

/**
 * Get preferred die for a lucky number
 */
export function getPreferredDie(luckyNumber: number): DieSides | null {
  if (luckyNumber < 1 || luckyNumber > 6) return null;
  const config = DICE_CONFIG.find(d => d.luckyNumber === luckyNumber);
  return config?.sides ?? null;
}
