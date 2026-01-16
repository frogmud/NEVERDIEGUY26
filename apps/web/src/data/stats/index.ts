// Stats Module - Public API
// Exports all stat types, calculator, and helper functions

export * from './types';
export * from './calculator';

import type { StatKey, StatModifier, BaseStats, ComputedStats } from './types';
import type { DieSides, LuckyNumber } from '../wiki/types';
import { STAT_CONFIG, STAT_KEYS } from './types';
import { DICE_CONFIG } from '../dice/config';

/**
 * Get the stat associated with a die type
 * d4 -> essence, d6 -> grit, d8 -> shadow, etc.
 * @throws Error if die type has no associated stat (should never happen with valid DieSides)
 */
export function getStatForDie(die: DieSides): StatKey {
  const entry = Object.entries(STAT_CONFIG).find(([_, config]) => config.die === die);
  if (!entry) {
    console.warn(`getStatForDie: No stat found for die d${die}, defaulting to essence`);
    return 'essence';
  }
  return entry[0] as StatKey;
}

/**
 * Get the die associated with a stat
 * essence -> d4, grit -> d6, shadow -> d8, etc.
 */
export function getDieForStat(stat: StatKey): DieSides | 0 {
  return STAT_CONFIG[stat].die;
}

/**
 * Check if a die roll triggers a stat bonus
 * Happens when:
 * - Rolling max on any die (e.g., 4 on d4, 20 on d20)
 * - Rolling your lucky number on any die
 * - Rolling on your preferred die (luck matches die's lucky number)
 */
export function checkStatTrigger(
  roll: number,
  die: DieSides,
  luck: LuckyNumber
): { triggered: boolean; stat: StatKey; bonus: number } {
  const dieConfig = DICE_CONFIG.find(d => d.sides === die);
  if (!dieConfig) {
    return { triggered: false, stat: 'essence', bonus: 0 };
  }

  const stat = getStatForDie(die);

  // Max roll trigger (critical)
  if (roll === die) {
    return { triggered: true, stat, bonus: 0.5 }; // 50% bonus
  }

  // Lucky number match (rolling your number on any die)
  if (luck > 0 && roll === luck) {
    return { triggered: true, stat: 'luck', bonus: 0.25 }; // 25% bonus
  }

  // Preferred die match (your lucky number matches the die's lucky number)
  if (luck === dieConfig.luckyNumber) {
    return { triggered: true, stat, bonus: 0.1 }; // 10% bonus on all rolls with this die
  }

  return { triggered: false, stat, bonus: 0 };
}

/**
 * Get stat bonus from a dice roll
 * Returns a multiplier (1.0 = no bonus, 1.5 = 50% bonus)
 */
export function getStatBonusFromRoll(
  roll: number,
  die: DieSides,
  stats: ComputedStats
): number {
  const trigger = checkStatTrigger(roll, die, stats.luck);

  if (!trigger.triggered) {
    return 1.0;
  }

  // Base bonus from trigger
  let bonus = 1.0 + trigger.bonus;

  // Additional bonus from stat value (luck excluded - it's special)
  if (trigger.stat !== 'luck') {
    const statValue = stats[trigger.stat];
    if (typeof statValue === 'number') {
      // Each point of the relevant stat adds 0.1% bonus
      bonus += statValue * 0.001;
    }
  }

  return bonus;
}

/**
 * Roll for critical hit (separate RNG check for testability)
 * @param stats - Computed stats with critChance
 * @param rng - Random function (default Math.random, injectable for tests)
 */
export function rollCrit(stats: ComputedStats, rng: () => number = Math.random): boolean {
  return rng() < stats.critChance;
}

/**
 * Calculate damage with stat bonuses applied (pure calculation, no RNG)
 * @param isCrit - Whether this is a critical hit (caller decides via rollCrit)
 */
export function calculateDamage(
  baseDamage: number,
  roll: number,
  die: DieSides,
  stats: ComputedStats,
  isCrit: boolean = false
): number {
  // Start with base damage + stat damage
  let damage = baseDamage + stats.damage;

  // Apply roll bonus
  const rollBonus = getStatBonusFromRoll(roll, die, stats);
  damage *= rollBonus;

  // Apply critical multiplier if crit
  if (isCrit) {
    damage *= stats.critMultiplier;
  }

  return Math.round(damage);
}

/**
 * Calculate effective dodge chance (pure calculation)
 */
export function getEffectiveDodgeChance(
  attackerStats: ComputedStats,
  defenderStats: ComputedStats
): number {
  // Base dodge chance from defender
  let dodgeChance = defenderStats.dodgeChance;

  // Reduce by attacker's swiftness
  dodgeChance -= attackerStats.swiftness * 0.002;

  // Clamp to reasonable bounds (5% min, 50% practical max given formula)
  return Math.max(0.05, Math.min(0.50, dodgeChance));
}

/**
 * Roll for dodge (separate RNG check for testability)
 * @param rng - Random function (default Math.random, injectable for tests)
 */
export function rollDodge(
  attackerStats: ComputedStats,
  defenderStats: ComputedStats,
  rng: () => number = Math.random
): boolean {
  const dodgeChance = getEffectiveDodgeChance(attackerStats, defenderStats);
  return rng() < dodgeChance;
}

/**
 * @deprecated Use rollDodge instead - kept for backwards compatibility
 */
export function checkDodge(attackerStats: ComputedStats, defenderStats: ComputedStats): boolean {
  return rollDodge(attackerStats, defenderStats);
}

/**
 * Calculate damage reduction from defense
 */
export function calculateDefenseReduction(incomingDamage: number, defense: number): number {
  // Defense reduces damage by a percentage
  // Formula: reduction = defense / (defense + 100)
  // This gives diminishing returns at high defense
  const reduction = defense / (defense + 100);
  return Math.round(incomingDamage * (1 - reduction));
}

/**
 * Get a stat's display name (for any future UI needs)
 */
export function getStatDisplayName(stat: StatKey): string {
  const names: Record<StatKey, string> = {
    luck: 'Luck',
    essence: 'Essence',
    grit: 'Grit',
    shadow: 'Shadow',
    fury: 'Fury',
    resilience: 'Resilience',
    swiftness: 'Swiftness',
  };
  return names[stat];
}

/**
 * Get a stat's color (for effects, particles, etc.)
 */
export function getStatColor(stat: StatKey): string {
  return STAT_CONFIG[stat].color;
}

/**
 * Get all stats sorted by their die tier (d4 first, d20 last)
 */
export function getStatsByDieTier(): StatKey[] {
  return STAT_KEYS.filter(s => s !== 'luck').sort((a, b) => {
    return STAT_CONFIG[a].die - STAT_CONFIG[b].die;
  });
}
