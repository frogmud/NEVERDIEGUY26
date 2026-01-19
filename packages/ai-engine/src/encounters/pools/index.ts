/**
 * Dialogue Pool Index
 *
 * Aggregates all Die-rector dialogue pools and provides lookup utilities.
 */

import type { DieRectorSlug, EnemyDialoguePool, EncounterType, WeightedDialogue, DialogueCondition, EncounterContext } from '../types';
import { THE_ONE_POOL } from './the-one';
import { RHEA_POOL } from './rhea';
import { KING_JAMES_POOL } from './king-james';
import { ZERO_CHANCE_POOL } from './zero-chance';

// ============================================
// Pool Registry
// ============================================

const DIALOGUE_POOLS: Partial<Record<DieRectorSlug, EnemyDialoguePool>> = {
  'the-one': THE_ONE_POOL,
  'rhea': RHEA_POOL,
  'king-james': KING_JAMES_POOL,
  'zero-chance': ZERO_CHANCE_POOL,
  // TODO: Add remaining Die-rectors
  // 'john': JOHN_POOL,
  // 'peter': PETER_POOL,
  // 'robert': ROBERT_POOL,
  // 'alice': ALICE_POOL,
  // 'jane': JANE_POOL,
};

// ============================================
// Condition Checking
// ============================================

function checkCondition(condition: DialogueCondition, ctx: EncounterContext): boolean {
  let value: number;

  switch (condition.type) {
    case 'corruption':
      value = ctx.corruption;
      break;
    case 'deaths':
      value = ctx.deathCount;
      break;
    case 'health':
      value = ctx.playerHealth;
      break;
    case 'grit':
      value = ctx.grit;
      break;
    case 'favor':
      value = ctx.favorStates[condition.target ?? ''] ?? 0;
      break;
    default:
      return true;
  }

  switch (condition.comparison) {
    case 'gte':
      return value >= condition.value;
    case 'lte':
      return value <= condition.value;
    case 'eq':
      return value === condition.value;
    default:
      return true;
  }
}

// ============================================
// Dialogue Selection
// ============================================

/**
 * Get available dialogue for a specific encounter type
 */
export function getDialoguePool(
  dieRector: DieRectorSlug,
  encounterType: EncounterType,
  ctx: EncounterContext
): WeightedDialogue[] {
  const pool = DIALOGUE_POOLS[dieRector];
  if (!pool) {
    // Fallback to The One if pool doesn't exist
    return getDialoguePool('the-one', encounterType, ctx);
  }

  // Get base pool for encounter type
  let dialogues: WeightedDialogue[];
  switch (encounterType) {
    case 'demand':
      dialogues = pool.demands;
      break;
    case 'observation':
      dialogues = pool.observations;
      break;
    case 'offer':
      dialogues = pool.offers;
      break;
    case 'test':
      dialogues = pool.tests;
      break;
  }

  // Add contextual variants
  if (ctx.playerHealth < 25 && pool.lowHealthVariants) {
    dialogues = [...dialogues, ...pool.lowHealthVariants];
  }
  if (ctx.corruption > 60 && pool.highCorruptionVariants) {
    dialogues = [...dialogues, ...pool.highCorruptionVariants];
  }
  if (ctx.deathCount > 0 && pool.postDeathVariants) {
    dialogues = [...dialogues, ...pool.postDeathVariants];
  }

  // Filter by conditions
  return dialogues.filter(d => {
    if (!d.requires) return true;
    return checkCondition(d.requires, ctx);
  });
}

/**
 * Select a random dialogue from a pool using weighted selection
 */
export function selectDialogue(
  pool: WeightedDialogue[],
  random: () => number
): string {
  if (pool.length === 0) return 'The void speaks silence.';

  const totalWeight = pool.reduce((sum, d) => sum + d.weight, 0);
  let roll = random() * totalWeight;

  for (const dialogue of pool) {
    roll -= dialogue.weight;
    if (roll <= 0) return dialogue.text;
  }

  return pool[pool.length - 1].text;
}

/**
 * Get dialogue for an encounter
 */
export function getEncounterDialogue(
  dieRector: DieRectorSlug,
  encounterType: EncounterType,
  ctx: EncounterContext,
  random: () => number
): string {
  const pool = getDialoguePool(dieRector, encounterType, ctx);
  return selectDialogue(pool, random);
}

// ============================================
// Exports
// ============================================

export { THE_ONE_POOL } from './the-one';
export { RHEA_POOL } from './rhea';
export { KING_JAMES_POOL } from './king-james';
export { ZERO_CHANCE_POOL } from './zero-chance';
