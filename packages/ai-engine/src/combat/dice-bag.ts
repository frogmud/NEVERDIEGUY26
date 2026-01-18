/**
 * Dice Bag System - Persistent dice collection across a run
 *
 * Inspired by 8bitskull/dicebag patterns:
 * - Stateful container with unique ID
 * - Draw without replacement (thrown dice consumed)
 * - Trades recycle exhausted dice back to bag
 *
 * NEVER DIE GUY
 */

import type { SeededRng } from '../core/seeded-rng';

// ============================================
// Types (reuse from dice-hand)
// ============================================

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

export type Element = 'Void' | 'Earth' | 'Death' | 'Fire' | 'Ice' | 'Wind';

export type DieRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Die {
  id: string;
  sides: DieSides;
  element: Element;
  rarity: DieRarity;
  isHeld: boolean;
  rollValue: number | null;
}

export interface DieConfig {
  sides: DieSides;
  element: Element;
  rarity?: DieRarity;
}

/**
 * Dice Bag - persistent collection that spans the entire run
 */
export interface DiceBag {
  id: string;                    // Run ID for persistence
  collection: Die[];             // Dice available to draw
  drawn: Die[];                  // Currently in hand
  exhausted: Die[];              // Thrown this event (can be recycled via trade)
  consumed: Die[];               // Permanently used (thrown + event ended)

  // Config
  handSize: number;              // Max hand size (default 5)
}

// ============================================
// Constants
// ============================================

export const DEFAULT_HAND_SIZE = 5;

/**
 * Die to element mapping
 */
export const DIE_ELEMENTS: Record<DieSides, Element> = {
  4: 'Void',
  6: 'Earth',
  8: 'Death',
  10: 'Fire',
  12: 'Ice',
  20: 'Wind',
};

/**
 * Default starting dice for a new run
 * 15 dice total: mix of types and elements
 */
export const DEFAULT_STARTING_DICE: DieConfig[] = [
  // Common d6s (backbone of the bag)
  { sides: 6, element: 'Void', rarity: 'common' },
  { sides: 6, element: 'Void', rarity: 'common' },
  { sides: 6, element: 'Earth', rarity: 'common' },
  { sides: 6, element: 'Earth', rarity: 'common' },
  // d4s (low risk)
  { sides: 4, element: 'Wind', rarity: 'common' },
  { sides: 4, element: 'Death', rarity: 'common' },
  // d8s (medium power)
  { sides: 8, element: 'Fire', rarity: 'common' },
  { sides: 8, element: 'Ice', rarity: 'common' },
  { sides: 8, element: 'Death', rarity: 'common' },
  // d10s (high value)
  { sides: 10, element: 'Void', rarity: 'uncommon' },
  { sides: 10, element: 'Fire', rarity: 'uncommon' },
  // d12 (premium)
  { sides: 12, element: 'Ice', rarity: 'uncommon' },
  { sides: 12, element: 'Void', rarity: 'uncommon' },
  // d20 (rare, high risk/reward)
  { sides: 20, element: 'Wind', rarity: 'rare' },
  { sides: 20, element: 'Void', rarity: 'rare' },
];

// ============================================
// Bag Creation
// ============================================

let dieIdCounter = 0;

/**
 * Create a unique die ID
 */
function createDieId(): string {
  return `die-${Date.now()}-${dieIdCounter++}`;
}

/**
 * Create a die from config
 */
export function createDie(config: DieConfig): Die {
  return {
    id: createDieId(),
    sides: config.sides,
    element: config.element,
    rarity: config.rarity || 'common',
    isHeld: false,
    rollValue: null,
  };
}

/**
 * Create a new dice bag for a run
 */
export function createDiceBag(
  runId: string,
  startingDice: DieConfig[] = DEFAULT_STARTING_DICE,
  handSize: number = DEFAULT_HAND_SIZE
): DiceBag {
  const collection = startingDice.map(createDie);

  return {
    id: runId,
    collection,
    drawn: [],
    exhausted: [],
    consumed: [],
    handSize,
  };
}

// ============================================
// Core Operations
// ============================================

/**
 * Draw dice from collection to fill hand
 * Uses RNG to shuffle before drawing
 */
export function drawHand(bag: DiceBag, rng: SeededRng): DiceBag {
  // Keep held dice in hand
  const heldDice = bag.drawn.filter(d => d.isHeld);
  const drawCount = bag.handSize - heldDice.length;

  if (drawCount <= 0 || bag.collection.length === 0) {
    return bag;
  }

  // Shuffle collection before drawing (fair distribution)
  const shuffled = rng.shuffle([...bag.collection]);

  // Draw from shuffled collection
  const drawn = shuffled.slice(0, drawCount);
  const remaining = shuffled.slice(drawCount);

  // New dice start unheld with no roll value
  const newDice = drawn.map(d => ({
    ...d,
    isHeld: false,
    rollValue: null,
  }));

  return {
    ...bag,
    collection: remaining,
    drawn: [...heldDice, ...newDice],
  };
}

/**
 * Throw dice - moves unheld dice to exhausted
 * Held dice stay in hand (not thrown)
 */
export function throwDice(bag: DiceBag): DiceBag {
  const heldDice = bag.drawn.filter(d => d.isHeld);
  const thrownDice = bag.drawn.filter(d => !d.isHeld);

  return {
    ...bag,
    drawn: heldDice,
    exhausted: [...bag.exhausted, ...thrownDice],
  };
}

/**
 * Trade action - returns exhausted dice to collection
 * This is the "recycle" mechanic (Option C)
 *
 * @param count Number of exhausted dice to return (0 = all)
 */
export function tradeDice(bag: DiceBag, count: number = 0): DiceBag {
  const returnCount = count === 0 ? bag.exhausted.length : Math.min(count, bag.exhausted.length);

  if (returnCount === 0) {
    return bag;
  }

  // Return exhausted dice to collection (reset their state)
  const returned = bag.exhausted.slice(0, returnCount).map(d => ({
    ...d,
    isHeld: false,
    rollValue: null,
  }));
  const stillExhausted = bag.exhausted.slice(returnCount);

  return {
    ...bag,
    collection: [...bag.collection, ...returned],
    exhausted: stillExhausted,
  };
}

/**
 * End event - consumes exhausted dice permanently
 * Called when transitioning between events
 */
export function endEvent(bag: DiceBag): DiceBag {
  // Move exhausted to consumed (permanent)
  // Return drawn (hand) to collection
  const handToCollection = bag.drawn.map(d => ({
    ...d,
    isHeld: false,
    rollValue: null,
  }));

  return {
    ...bag,
    collection: [...bag.collection, ...handToCollection],
    drawn: [],
    consumed: [...bag.consumed, ...bag.exhausted],
    exhausted: [],
  };
}

/**
 * Reset for new event - clears hand, keeps collection
 * Use before drawHand() at event start
 */
export function resetForEvent(bag: DiceBag): DiceBag {
  // Return any drawn dice to collection
  const handToCollection = bag.drawn.map(d => ({
    ...d,
    isHeld: false,
    rollValue: null,
  }));

  return {
    ...bag,
    collection: [...bag.collection, ...handToCollection],
    drawn: [],
    exhausted: [],
  };
}

/**
 * Add dice to the bag (shop purchase, reward, etc.)
 */
export function addDice(bag: DiceBag, dice: Die[]): DiceBag {
  return {
    ...bag,
    collection: [...bag.collection, ...dice],
  };
}

/**
 * Add dice from config (convenience wrapper)
 */
export function addDiceFromConfig(bag: DiceBag, configs: DieConfig[]): DiceBag {
  const newDice = configs.map(createDie);
  return addDice(bag, newDice);
}

/**
 * Remove specific dice from bag (sacrifice, loss, etc.)
 * Searches all pools: collection, drawn, exhausted
 */
export function removeDice(bag: DiceBag, dieIds: string[]): DiceBag {
  const idSet = new Set(dieIds);

  return {
    ...bag,
    collection: bag.collection.filter(d => !idSet.has(d.id)),
    drawn: bag.drawn.filter(d => !idSet.has(d.id)),
    exhausted: bag.exhausted.filter(d => !idSet.has(d.id)),
  };
}

/**
 * Toggle hold status on a die in hand
 */
export function toggleHold(bag: DiceBag, dieId: string): DiceBag {
  const dieIndex = bag.drawn.findIndex(d => d.id === dieId);
  if (dieIndex === -1) return bag;

  const newDrawn = [...bag.drawn];
  newDrawn[dieIndex] = {
    ...newDrawn[dieIndex],
    isHeld: !newDrawn[dieIndex].isHeld,
  };

  return {
    ...bag,
    drawn: newDrawn,
  };
}

/**
 * Roll all unheld dice in hand
 */
export function rollHand(bag: DiceBag, rng: SeededRng): DiceBag {
  const newDrawn = bag.drawn.map(die => {
    if (die.isHeld) {
      return die; // Keep held dice as-is
    }
    return {
      ...die,
      rollValue: rng.roll(`roll-${die.id}`, die.sides),
    };
  });

  return {
    ...bag,
    drawn: newDrawn,
  };
}

// ============================================
// Bag Analysis
// ============================================

/**
 * Get total dice count across all pools
 */
export function getTotalDiceCount(bag: DiceBag): number {
  return bag.collection.length + bag.drawn.length + bag.exhausted.length;
}

/**
 * Get dice available to draw
 */
export function getAvailableCount(bag: DiceBag): number {
  return bag.collection.length;
}

/**
 * Get current hand
 */
export function getHand(bag: DiceBag): Die[] {
  return bag.drawn;
}

/**
 * Get hand total roll value
 */
export function getHandTotal(bag: DiceBag): number {
  return bag.drawn.reduce((sum, d) => sum + (d.rollValue || 0), 0);
}

/**
 * Get held dice count
 */
export function getHeldCount(bag: DiceBag): number {
  return bag.drawn.filter(d => d.isHeld).length;
}

/**
 * Get unheld dice in hand
 */
export function getUnheldDice(bag: DiceBag): Die[] {
  return bag.drawn.filter(d => !d.isHeld);
}

/**
 * Get exhausted dice (can be recycled via trade)
 */
export function getExhaustedCount(bag: DiceBag): number {
  return bag.exhausted.length;
}

/**
 * Get consumed dice (permanently used)
 */
export function getConsumedCount(bag: DiceBag): number {
  return bag.consumed.length;
}

/**
 * Check if bag is empty (no dice left anywhere except consumed)
 */
export function isBagEmpty(bag: DiceBag): boolean {
  return getTotalDiceCount(bag) === 0;
}

/**
 * Check if can draw more dice
 */
export function canDraw(bag: DiceBag): boolean {
  return bag.collection.length > 0 && bag.drawn.length < bag.handSize;
}

/**
 * Check if can trade (has exhausted dice to recycle)
 */
export function canTrade(bag: DiceBag): boolean {
  return bag.exhausted.length > 0;
}

/**
 * Get bag summary for UI display
 */
export function getBagSummary(bag: DiceBag): {
  inBag: number;
  inHand: number;
  exhausted: number;
  consumed: number;
  total: number;
} {
  return {
    inBag: bag.collection.length,
    inHand: bag.drawn.length,
    exhausted: bag.exhausted.length,
    consumed: bag.consumed.length,
    total: getTotalDiceCount(bag) + bag.consumed.length,
  };
}

/**
 * Group dice by sides for UI display
 */
export function groupBySides(dice: Die[]): Record<DieSides, Die[]> {
  const groups: Record<DieSides, Die[]> = {
    4: [],
    6: [],
    8: [],
    10: [],
    12: [],
    20: [],
  };

  for (const die of dice) {
    groups[die.sides].push(die);
  }

  return groups;
}

/**
 * Group dice by element for UI display
 */
export function groupByElement(dice: Die[]): Record<Element, Die[]> {
  const groups: Record<Element, Die[]> = {
    Void: [],
    Earth: [],
    Death: [],
    Fire: [],
    Ice: [],
    Wind: [],
  };

  for (const die of dice) {
    groups[die.element].push(die);
  }

  return groups;
}

/**
 * Group dice by rarity for UI display
 */
export function groupByRarity(dice: Die[]): Record<DieRarity, Die[]> {
  const groups: Record<DieRarity, Die[]> = {
    common: [],
    uncommon: [],
    rare: [],
    legendary: [],
  };

  for (const die of dice) {
    groups[die.rarity].push(die);
  }

  return groups;
}
