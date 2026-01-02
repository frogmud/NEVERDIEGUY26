// Stat Calculator - Computes final stats from base + modifiers
// Invisible to players but drives all game mechanics

import type { BaseStats, StatModifier, ComputedStats, StatKey } from './types';
import { STAT_KEYS, COMBAT_STAT_KEYS, DEFAULT_BASE_STATS } from './types';

/**
 * Compute final stats from base stats and modifiers
 *
 * Calculation order:
 * 1. Start with base stat
 * 2. Add all flat bonuses
 * 3. Multiply by (1 + sum of percent bonuses)
 *
 * Stacking rules:
 * - Flat bonuses: additive, stack infinitely
 * - Percent bonuses: additive with each other, then multiplicative
 * - Same-source modifiers: only strongest applies (no duplicate stacking)
 */
export function computeStats(
  base: BaseStats,
  modifiers: StatModifier[] = []
): ComputedStats {
  // Start with base stats
  const computed: Record<StatKey, number> = {
    luck: base.luck,
    essence: base.essence,
    grit: base.grit,
    shadow: base.shadow,
    fury: base.fury,
    resilience: base.resilience,
    swiftness: base.swiftness,
  };

  // Group modifiers by stat, then by source (for deduplication)
  const modifiersByStat = groupModifiersByStat(modifiers);

  // Apply modifiers to each stat
  for (const statKey of COMBAT_STAT_KEYS) {
    const statMods = modifiersByStat[statKey] || [];

    // Deduplicate by source (take strongest per source)
    const deduped = deduplicateBySource(statMods);

    // Sum flat and percent bonuses
    let flatTotal = 0;
    let percentTotal = 0;

    for (const mod of deduped) {
      flatTotal += mod.flat || 0;
      percentTotal += mod.percent || 0;
    }

    // Apply: (base + flat) * (1 + percent)
    computed[statKey] = Math.round((computed[statKey] + flatTotal) * (1 + percentTotal));

    // Clamp to reasonable bounds (1-999)
    computed[statKey] = Math.max(1, Math.min(999, computed[statKey]));
  }

  // Derive combat values from computed stats
  return {
    // Copy base stats
    luck: base.luck,
    essence: computed.essence,
    grit: computed.grit,
    shadow: computed.shadow,
    fury: computed.fury,
    resilience: computed.resilience,
    swiftness: computed.swiftness,

    // Derived values
    maxHp: deriveMaxHp(computed.grit, computed.resilience),
    damage: deriveDamage(computed.fury, computed.essence),
    defense: deriveDefense(computed.resilience),
    dodgeChance: deriveDodgeChance(computed.shadow, computed.swiftness),
    critChance: deriveCritChance(base.luck, computed.swiftness),
    critMultiplier: deriveCritMultiplier(base.luck, computed.essence),
    actionSpeed: deriveActionSpeed(computed.swiftness),
    lootBonus: deriveLootBonus(base.luck),
  };
}

/**
 * Group modifiers by stat key
 */
function groupModifiersByStat(modifiers: StatModifier[]): Record<StatKey, StatModifier[]> {
  const grouped: Record<StatKey, StatModifier[]> = {
    luck: [],
    essence: [],
    grit: [],
    shadow: [],
    fury: [],
    resilience: [],
    swiftness: [],
  };

  for (const mod of modifiers) {
    grouped[mod.stat].push(mod);
  }

  return grouped;
}

/**
 * Deduplicate modifiers by source - keep strongest per source
 */
function deduplicateBySource(mods: StatModifier[]): StatModifier[] {
  const bySource: Record<string, StatModifier> = {};

  for (const mod of mods) {
    const existing = bySource[mod.source];
    if (!existing) {
      bySource[mod.source] = mod;
    } else {
      // Keep the stronger one (compare total effective value)
      const existingValue = (existing.flat || 0) + (existing.percent || 0) * 100;
      const newValue = (mod.flat || 0) + (mod.percent || 0) * 100;
      if (newValue > existingValue) {
        bySource[mod.source] = mod;
      }
    }
  }

  return Object.values(bySource);
}

// --- Derived Stat Formulas ---
// These convert raw stats (1-100+) into game-meaningful values

/**
 * Max HP: Based on grit (mixing stat) + resilience
 * Formula: 100 + (grit * 5) + (resilience * 2)
 * Range: ~350 (low) to ~850 (high)
 */
function deriveMaxHp(grit: number, resilience: number): number {
  return Math.round(100 + grit * 5 + resilience * 2);
}

/**
 * Damage: Based on fury + essence bonus
 * Formula: fury * 1.0 + essence * 0.3
 * Range: ~65 (low) to ~130 (high)
 */
function deriveDamage(fury: number, essence: number): number {
  return Math.round(fury * 1.0 + essence * 0.3);
}

/**
 * Defense: Damage reduction based on resilience
 * Formula: resilience * 0.5
 * Range: ~25 (low) to ~50 (high)
 */
function deriveDefense(resilience: number): number {
  return Math.round(resilience * 0.5);
}

/**
 * Dodge Chance: Based on shadow + swiftness bonus
 * Formula: (shadow * 0.4 + swiftness * 0.1) / 100, capped at 0.75
 * Range: 0.10 (low) to 0.50 (high)
 */
function deriveDodgeChance(shadow: number, swiftness: number): number {
  const chance = (shadow * 0.4 + swiftness * 0.1) / 100;
  return Math.min(0.75, Math.max(0, chance));
}

/**
 * Crit Chance: Based on luck + swiftness
 * Formula: (luck * 5 + swiftness * 0.1) / 100, capped at 0.50
 * Range: 0.05 (low) to 0.40 (high)
 */
function deriveCritChance(luck: number, swiftness: number): number {
  const chance = (luck * 5 + swiftness * 0.1) / 100;
  return Math.min(0.50, Math.max(0.05, chance));
}

/**
 * Crit Multiplier: Based on luck + essence
 * Formula: 1.5 + (luck * 0.1) + (essence * 0.005)
 * Range: 1.5x (low) to 2.5x (high)
 */
function deriveCritMultiplier(luck: number, essence: number): number {
  return Math.min(3.0, 1.5 + luck * 0.1 + essence * 0.005);
}

/**
 * Action Speed: Based on swiftness
 * Formula: 50 + swiftness
 * Higher = acts earlier in turn order
 */
function deriveActionSpeed(swiftness: number): number {
  return 50 + swiftness;
}

/**
 * Loot Bonus: Based on luck
 * Formula: luck * 5% (0-35%)
 */
function deriveLootBonus(luck: number): number {
  return luck * 0.05;
}

// --- Utility Functions ---

/**
 * Create base stats with all values set to a single number
 */
export function createUniformStats(value: number, luck: number = 0): BaseStats {
  return {
    luck: luck as BaseStats['luck'],
    essence: value,
    grit: value,
    shadow: value,
    fury: value,
    resilience: value,
    swiftness: value,
  };
}

/**
 * Merge partial stats into default stats
 */
export function mergeStats(partial: Partial<BaseStats>): BaseStats {
  return {
    ...DEFAULT_BASE_STATS,
    ...partial,
  };
}

/**
 * Calculate the total modifier value for a stat
 */
export function getTotalModifier(stat: StatKey, modifiers: StatModifier[]): { flat: number; percent: number } {
  const relevant = modifiers.filter(m => m.stat === stat);
  const deduped = deduplicateBySource(relevant);

  let flat = 0;
  let percent = 0;

  for (const mod of deduped) {
    flat += mod.flat || 0;
    percent += mod.percent || 0;
  }

  return { flat, percent };
}
