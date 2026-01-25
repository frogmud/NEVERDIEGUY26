/**
 * Scoring System - Hit resolution, combos, and penalties
 *
 * Calculates score based on:
 * - Enemy squishes: +points with element multiplier
 * - Friendly hits: -points (worse with wrong die element)
 * - Collateral damage: -0.5x points
 * NEVER DIE GUY
 */

import type { Die, Element } from './dice-hand';
import type { Entity } from './combat-engine';

// ============================================
// Score Modifiers
// ============================================

export const SCORE_MODIFIERS = {
  enemySquish: 1.0,           // Full points for enemy kill
  neutralDamage: -0.5,        // Collateral penalty
  friendlyHit: -2.0,          // Significant penalty
  friendlyWrongDie: -5.0,     // Very bad (wrong element die hits friendly)
} as const;

// ============================================
// Element Advantage Wheel
// ============================================

/**
 * Element advantage wheel:
 * Void → Earth → Death → Fire → Ice → Wind → Void
 *
 * Each element beats the next, weak to the previous
 */
const ELEMENT_ORDER: Element[] = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];

/**
 * Get element advantage multiplier
 * - 1.5x if attacker beats defender
 * - 0.5x if attacker is weak to defender
 * - 1.0x if same or neutral
 */
export function getElementMultiplier(attackerElement: Element, defenderElement: Element): number {
  if (attackerElement === defenderElement) return 1.0;

  const attackerIndex = ELEMENT_ORDER.indexOf(attackerElement);
  const defenderIndex = ELEMENT_ORDER.indexOf(defenderElement);

  // Check if attacker beats defender (next in cycle)
  const beatsIndex = (attackerIndex + 1) % ELEMENT_ORDER.length;
  if (defenderIndex === beatsIndex) return 1.5;

  // Check if attacker is weak to defender (previous in cycle)
  const weakToIndex = (attackerIndex - 1 + ELEMENT_ORDER.length) % ELEMENT_ORDER.length;
  if (defenderIndex === weakToIndex) return 0.5;

  return 1.0;
}

// ============================================
// Hit Score Calculation
// ============================================

export interface HitResult {
  score: number;
  isCritical: boolean;
  isFumble: boolean;
  elementMultiplier: number;
  penaltyType: 'none' | 'collateral' | 'friendly' | 'friendly_wrong_die';
  message: string;
}

/**
 * Calculate score for hitting a target with a die
 */
export function calculateHitScore(
  die: Die,
  target: Entity,
  rollValue: number
): HitResult {
  const baseScore = target.basePoints;
  const elementMult = getElementMultiplier(die.element, target.element);

  // Check for critical (max roll) or fumble (1)
  const isCritical = rollValue === die.sides;
  const isFumble = rollValue === 1;

  // Critical doubles, fumble halves
  const critMult = isCritical ? 2.0 : isFumble ? 0.5 : 1.0;

  if (target.type === 'enemy') {
    // Enemy hit: positive score
    const score = Math.round(baseScore * elementMult * critMult * (rollValue / die.sides));

    return {
      score,
      isCritical,
      isFumble,
      elementMultiplier: elementMult,
      penaltyType: 'none',
      message: isCritical
        ? `Critical hit! ${score} points`
        : isFumble
          ? `Glancing blow... ${score} points`
          : `Squished! ${score} points`,
    };
  }

  if (target.type === 'friendly') {
    // Friendly hit: negative score
    // Check if die element matches friendly's element
    const isWrongDie = die.element !== target.element;
    const penaltyMult = isWrongDie
      ? SCORE_MODIFIERS.friendlyWrongDie
      : SCORE_MODIFIERS.friendlyHit;

    const score = Math.round(baseScore * penaltyMult);

    return {
      score,
      isCritical: false,
      isFumble: false,
      elementMultiplier: 1.0,
      penaltyType: isWrongDie ? 'friendly_wrong_die' : 'friendly',
      message: isWrongDie
        ? `Wrong die on friendly! ${score} penalty!`
        : `Friendly fire! ${score} penalty`,
    };
  }

  // Obstacle or neutral target
  return {
    score: Math.round(baseScore * SCORE_MODIFIERS.neutralDamage),
    isCritical: false,
    isFumble: false,
    elementMultiplier: 1.0,
    penaltyType: 'collateral',
    message: 'Collateral damage',
  };
}

// ============================================
// Combo System
// ============================================

export interface ComboResult {
  comboType: 'none' | 'double' | 'triple' | 'mega' | 'ultra';
  multiplier: number;
  bonusScore: number;
}

const COMBO_THRESHOLDS = {
  double: { minHits: 2, multiplier: 1.5 },
  triple: { minHits: 3, multiplier: 2.0 },
  mega: { minHits: 5, multiplier: 3.0 },
  ultra: { minHits: 8, multiplier: 5.0 },
} as const;

/**
 * Calculate combo bonus for multiple hits
 */
export function calculateCombo(hitCount: number, baseScore: number): ComboResult {
  if (hitCount >= 8) {
    return {
      comboType: 'ultra',
      multiplier: COMBO_THRESHOLDS.ultra.multiplier,
      bonusScore: Math.round(baseScore * (COMBO_THRESHOLDS.ultra.multiplier - 1)),
    };
  }
  if (hitCount >= 5) {
    return {
      comboType: 'mega',
      multiplier: COMBO_THRESHOLDS.mega.multiplier,
      bonusScore: Math.round(baseScore * (COMBO_THRESHOLDS.mega.multiplier - 1)),
    };
  }
  if (hitCount >= 3) {
    return {
      comboType: 'triple',
      multiplier: COMBO_THRESHOLDS.triple.multiplier,
      bonusScore: Math.round(baseScore * (COMBO_THRESHOLDS.triple.multiplier - 1)),
    };
  }
  if (hitCount >= 2) {
    return {
      comboType: 'double',
      multiplier: COMBO_THRESHOLDS.double.multiplier,
      bonusScore: Math.round(baseScore * (COMBO_THRESHOLDS.double.multiplier - 1)),
    };
  }

  return {
    comboType: 'none',
    multiplier: 1.0,
    bonusScore: 0,
  };
}

// ============================================
// Element Combo (3+ same element dice)
// ============================================

export interface ElementComboResult {
  element: Element | null;
  diceCount: number;
  bonusMultiplier: number;
}

/**
 * Calculate element combo bonus when throwing 3+ dice of same element
 */
export function calculateElementCombo(dice: Die[]): ElementComboResult {
  // Early return for empty arrays (optimization)
  if (dice.length === 0) {
    return { element: null, diceCount: 0, bonusMultiplier: 1.0 };
  }

  const counts: Record<Element, number> = {
    Void: 0,
    Earth: 0,
    Death: 0,
    Fire: 0,
    Ice: 0,
    Wind: 0,
  };

  for (const die of dice) {
    counts[die.element]++;
  }

  // Find highest element count
  let maxElement: Element | null = null;
  let maxCount = 0;

  for (const [element, count] of Object.entries(counts) as [Element, number][]) {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  }

  if (maxCount >= 3) {
    // Bonus increases with more matching dice
    const bonusMultiplier = 1 + (maxCount - 2) * 0.25; // 3 = 1.25x, 4 = 1.5x, 5 = 1.75x

    return {
      element: maxElement,
      diceCount: maxCount,
      bonusMultiplier,
    };
  }

  return {
    element: null,
    diceCount: 0,
    bonusMultiplier: 1.0,
  };
}

// ============================================
// Turn Summary
// ============================================

export interface TurnSummary {
  rawScore: number;
  comboBonus: number;
  elementBonus: number;
  penalties: number;
  finalScore: number;
  hitResults: HitResult[];
  comboResult: ComboResult;
  elementComboResult: ElementComboResult;
}

/**
 * Calculate complete turn summary from all hits
 */
export function calculateTurnSummary(
  hitResults: HitResult[],
  dice: Die[]
): TurnSummary {
  // Sum up raw scores (positive and negative)
  let rawScore = 0;
  let penalties = 0;

  for (const hit of hitResults) {
    if (hit.score >= 0) {
      rawScore += hit.score;
    } else {
      penalties += hit.score;
    }
  }

  // Count enemy hits for combo
  const enemyHits = hitResults.filter(h => h.penaltyType === 'none').length;
  const comboResult = calculateCombo(enemyHits, rawScore);

  // Calculate element combo
  const elementComboResult = calculateElementCombo(dice);

  // Calculate final score
  const comboBonus = comboResult.bonusScore;
  const elementBonus = Math.round(rawScore * (elementComboResult.bonusMultiplier - 1));
  const finalScore = rawScore + comboBonus + elementBonus + penalties;

  return {
    rawScore,
    comboBonus,
    elementBonus,
    penalties,
    finalScore,
    hitResults,
    comboResult,
    elementComboResult,
  };
}

// ============================================
// Score Goal Calculation
// ============================================

/**
 * Calculate target score for a room based on domain and type
 */
export function calculateTargetScore(
  domainId: number,
  roomType: 'normal' | 'elite' | 'boss'
): number {
  const baseScore = 1000;
  const domainMultiplier = Math.pow(1.5, domainId - 1);
  const roomMultipliers = { normal: 1.0, elite: 1.5, boss: 2.0 };

  return Math.round(baseScore * domainMultiplier * roomMultipliers[roomType]);
}

/**
 * Calculate gold reward for completing a room
 */
export function calculateGoldReward(
  score: number,
  targetScore: number,
  domainId: number,
  roomType: 'normal' | 'elite' | 'boss'
): number {
  const baseGold = { normal: 50, elite: 100, boss: 200 };
  const domainMultiplier = 1 + (domainId - 1) * 0.2;

  // Bonus for exceeding target
  const overage = Math.max(0, score - targetScore);
  const overageBonus = Math.floor(overage / 100);

  return Math.round(baseGold[roomType] * domainMultiplier) + overageBonus;
}
