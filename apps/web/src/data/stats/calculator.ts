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

    // Deduplicate by source (take strongest per source, using base value for comparison)
    const deduped = deduplicateBySource(statMods, computed[statKey]);

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
 * Requires base stat value to correctly compare flat vs percent bonuses
 */
function deduplicateBySource(mods: StatModifier[], baseValue: number): StatModifier[] {
  const bySource: Record<string, StatModifier> = {};

  for (const mod of mods) {
    const existing = bySource[mod.source];
    if (!existing) {
      bySource[mod.source] = mod;
    } else {
      // Compare actual effective value given the base stat
      // For base=100: +10 flat = 10 value, +10% = 10 value (equal)
      // For base=200: +10 flat = 10 value, +10% = 20 value (percent wins)
      const existingValue = (existing.flat || 0) + baseValue * (existing.percent || 0);
      const newValue = (mod.flat || 0) + baseValue * (mod.percent || 0);
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
 * Max HP: Based on grit (primary) + resilience (minor)
 * Formula: 100 + (grit * 5) + (resilience * 2)
 *
 * Practical ranges (with default stats ~50):
 * - Low (grit 30, res 30): ~310 HP
 * - Mid (grit 50, res 50): ~450 HP (default)
 * - High (grit 100, res 100): ~800 HP
 *
 * Grit is the HP stat (2.5:1 efficiency vs resilience)
 */
function deriveMaxHp(grit: number, resilience: number): number {
  return Math.round(100 + grit * 5 + resilience * 2);
}

/**
 * Damage: Based on fury (primary) + essence (minor)
 * Formula: fury * 1.0 + essence * 0.3
 *
 * Practical ranges (with default stats ~50):
 * - Low (fury 30, ess 30): ~39
 * - Mid (fury 50, ess 50): ~65 (default)
 * - High (fury 100, ess 100): ~130
 */
function deriveDamage(fury: number, essence: number): number {
  return Math.round(fury * 1.0 + essence * 0.3);
}

/**
 * Defense: Flat damage reduction based on resilience
 * Formula: resilience * 0.5
 *
 * Practical ranges (with default stats ~50):
 * - Low (res 30): ~15
 * - Mid (res 50): ~25 (default)
 * - High (res 100): ~50
 *
 * Note: Actual damage reduction uses diminishing returns formula:
 * reduction = defense / (defense + 100)
 */
function deriveDefense(resilience: number): number {
  return Math.round(resilience * 0.5);
}

/**
 * Dodge Chance: Based on shadow (primary) + swiftness (minor)
 * Formula: (shadow * 0.4 + swiftness * 0.1) / 100, capped at 0.50
 *
 * Practical ranges (with default stats ~50):
 * - Low (shadow 30, swift 30): ~15%
 * - Mid (shadow 70, swift 70): ~35%
 * - High (shadow 100, swift 100): ~50% (cap)
 *
 * Shadow is the dodge stat (4:1 efficiency vs swiftness)
 */
function deriveDodgeChance(shadow: number, swiftness: number): number {
  const chance = (shadow * 0.4 + swiftness * 0.1) / 100;
  return Math.min(0.50, Math.max(0, chance));
}

/**
 * Crit Chance: Based on luck (primary) + swiftness (minor)
 * Formula: (luck * 5 + swiftness * 0.1) / 100, capped at 0.50
 *
 * Practical ranges:
 * - luck 0, swift 50: ~5% (floor)
 * - luck 3, swift 50: ~20%
 * - luck 7, swift 100: ~45%
 *
 * BALANCE NOTE: Luck is 50x more efficient than swiftness for crit chance.
 * This is intentional - luck (die affinity) is the primary crit stat,
 * swiftness provides only a minor boost. Crit builds should invest in luck.
 */
function deriveCritChance(luck: number, swiftness: number): number {
  const chance = (luck * 5 + swiftness * 0.1) / 100;
  return Math.min(0.50, Math.max(0.05, chance));
}

/**
 * Crit Multiplier: Based on luck (primary) + essence (minor)
 * Formula: 1.5 + (luck * 0.1) + (essence * 0.005), capped at 3.0
 *
 * Practical ranges:
 * - luck 0, ess 50: 1.75x
 * - luck 3, ess 50: 2.05x
 * - luck 7, ess 100: 2.70x
 */
function deriveCritMultiplier(luck: number, essence: number): number {
  return Math.min(3.0, 1.5 + luck * 0.1 + essence * 0.005);
}

/**
 * Action Speed: Based on swiftness
 * Formula: 50 + swiftness
 * Higher = acts earlier in turn order
 *
 * Practical ranges:
 * - Low (swift 30): 80
 * - Mid (swift 50): 100 (default)
 * - High (swift 100): 150
 */
function deriveActionSpeed(swiftness: number): number {
  return 50 + swiftness;
}

/**
 * Loot Bonus: Based on luck only
 * Formula: luck * 5% (0% to 35%)
 *
 * Practical ranges:
 * - luck 0: 0%
 * - luck 3: 15%
 * - luck 7: 35%
 */
function deriveLootBonus(luck: number): number {
  return luck * 0.05;
}

// --- Validation ---

/**
 * Validate base stats are within expected bounds
 * @returns Array of error messages (empty if valid)
 */
export function validateBaseStats(stats: BaseStats): string[] {
  const errors: string[] = [];

  // Luck must be 0-7 (LuckyNumber type)
  if (stats.luck < 0 || stats.luck > 7) {
    errors.push(`luck must be 0-7, got ${stats.luck}`);
  }

  // Combat stats must be 1-999
  for (const key of COMBAT_STAT_KEYS) {
    const value = stats[key];
    if (value < 1 || value > 999) {
      errors.push(`${key} must be 1-999, got ${value}`);
    }
  }

  return errors;
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
 * @param baseValue - Base stat value for dedup comparison (default 50)
 */
export function getTotalModifier(
  stat: StatKey,
  modifiers: StatModifier[],
  baseValue: number = 50
): { flat: number; percent: number } {
  const relevant = modifiers.filter(m => m.stat === stat);
  const deduped = deduplicateBySource(relevant, baseValue);

  let flat = 0;
  let percent = 0;

  for (const mod of deduped) {
    flat += mod.flat || 0;
    percent += mod.percent || 0;
  }

  return { flat, percent };
}
