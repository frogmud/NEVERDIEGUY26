/**
 * Intervention System - Die-rector Blessings & Scorns
 *
 * Generates intervention events when players cross favor thresholds.
 * Handles rivalry sympathy logic.
 *
 * NEVER DIE GUY
 */

import type { DieSides } from '../combat/balance-config';
import {
  type FavorState,
  type PlayerFavorMap,
  getAffinity,
  getRivals,
  getDierectorForDie,
  DIERECTOR_PERSONALITY,
} from './favor-system';

// ============================================
// INTERVENTION TYPES
// ============================================

export type InterventionType =
  | 'BLESSING'           // BLESSED threshold crossed
  | 'SCORN'              // SCORNED threshold crossed
  | 'RIVALRY_SYMPATHY';  // Rival noticed scorn, offers aid

/**
 * Intervention effect on gameplay
 */
export interface InterventionEffect {
  type: 'shop_discount' | 'shop_penalty' | 'element_boost' | 'element_nerf' | 'dice_floor' | 'crit_downgrade';
  value: number;
  description: string;
}

/**
 * Broadcast-ready intervention event
 */
export interface InterventionEvent {
  id: string;
  type: InterventionType;
  dierectorSlug: string;
  playerId: string;
  playerName: string;
  message: string;
  effects: InterventionEffect[];
  timestamp: number;
}

// ============================================
// DIE-RECTOR DISPLAY NAMES
// ============================================

const DIERECTOR_DISPLAY: Record<string, { name: string; element: string; die: string }> = {
  'the-one': { name: 'The One', element: 'Void', die: 'd4' },
  'john': { name: 'John', element: 'Earth', die: 'd6' },
  'peter': { name: 'Peter', element: 'Death', die: 'd8' },
  'robert': { name: 'Robert', element: 'Fire', die: 'd10' },
  'alice': { name: 'Alice', element: 'Ice', die: 'd12' },
  'jane': { name: 'Jane', element: 'Wind', die: 'd20' },
};

// ============================================
// COMMENTARY TEMPLATES
// ============================================

const BLESSING_TEMPLATES: Record<string, string[]> = {
  'the-one': [
    '{name} smiles upon {player}. The Void acknowledges.',
    'The One\'s gaze settles on {player}. Existence confirmed.',
    '{player} has earned The One\'s attention. The d4 glows faintly.',
  ],
  'john': [
    'John nods at {player}. The foundation strengthens.',
    '{player}\'s efficiency pleases John. Earth responds.',
    'John marks {player} for improvement.',
  ],
  'peter': [
    'Peter\'s ledger favors {player}. Death remembers kindness.',
    '{player} is written in favorable ink.',
    'Peter grants {player} a stay.',
  ],
  'robert': [
    'Robert\'s flame burns warm for {player}.',
    '{player} has earned Robert\'s respect. Fire approves.',
    'The Inferno smiles upon {player}.',
  ],
  'alice': [
    'Alice\'s ice preserves {player}\'s fortune.',
    'Time slows for {player}. Alice approves.',
    '{player} has earned Alice\'s patience.',
  ],
  'jane': [
    'Jane\'s winds favor {player}. Chaos smiles.',
    '{player} amuses Jane. The Storm giggles.',
    'Jane spins fortune toward {player}.',
  ],
};

const SCORN_TEMPLATES: Record<string, string[]> = {
  'the-one': [
    'The One turns away from {player}. Existence... questioned.',
    '{player} is forgotten by the Void.',
    'The One\'s attention drifts from {player}. The d4 feels heavy.',
  ],
  'john': [
    'John\'s calculations exclude {player}. Inefficient.',
    '{player} disappoints John. The earth resists.',
    'John marks {player} for... restructuring.',
  ],
  'peter': [
    'Peter\'s ledger darkens for {player}.',
    '{player}\'s name is written in shadow.',
    'Peter remembers {player}\'s slights. Death is patient.',
  ],
  'robert': [
    'Robert\'s flame burns cold for {player}.',
    '{player} has earned Robert\'s disdain. Fire rejects.',
    'The Inferno turns its back on {player}.',
  ],
  'alice': [
    '{player} is frozen out. Alice withholds.',
    'Time accelerates against {player}. Alice is displeased.',
    'Alice\'s patience runs thin for {player}.',
  ],
  'jane': [
    'Jane\'s winds scatter {player}\'s luck.',
    '{player} bores Jane. Chaos punishes.',
    'Jane spins misfortune toward {player}.',
  ],
};

const RIVALRY_SYMPATHY_TEMPLATES: Record<string, Record<string, string[]>> = {
  // When player is scorned by X, rival Y notices
  'robert': {
    'alice': [
      'Alice observes Robert\'s scorn of {player}. The ice glimmers with opportunity.',
      'Robert rejects {player}. Alice feels cold satisfaction... and curiosity.',
    ],
  },
  'alice': {
    'robert': [
      'Robert watches Alice dismiss {player}. Fire finds this... interesting.',
      'Alice freezes {player} out. Robert considers warming them.',
    ],
  },
  'john': {
    'peter': [
      'Peter\'s judgment weighs on {player}. John calculates alternatives.',
      'Peter writes {player} off. John sees potential inefficiency to exploit.',
    ],
  },
  'peter': {
    'john': [
      'John rejects {player}\'s work. Peter notes this in the ledger.',
      '{player} fails John\'s standards. Peter finds this... amusing.',
    ],
  },
  'the-one': {
    'rhea': [
      'The One forgets {player}. Ancient Rhea stirs with interest.',
      'Void abandons {player}. The Horror watches.',
    ],
  },
};

// ============================================
// EFFECT DEFINITIONS
// ============================================

const BLESSING_EFFECTS: Record<string, InterventionEffect[]> = {
  'the-one': [
    { type: 'element_boost', value: 0.25, description: 'Void damage +25%' },
    { type: 'dice_floor', value: 2, description: 'd4 cannot roll below 2' },
  ],
  'john': [
    { type: 'shop_discount', value: 0.15, description: 'Earth items -15%' },
    { type: 'element_boost', value: 0.20, description: 'Earth damage +20%' },
  ],
  'peter': [
    { type: 'element_boost', value: 0.25, description: 'Death damage +25%' },
    { type: 'shop_discount', value: 0.10, description: 'Death items -10%' },
  ],
  'robert': [
    { type: 'element_boost', value: 0.30, description: 'Fire damage +30%' },
  ],
  'alice': [
    { type: 'element_boost', value: 0.25, description: 'Ice damage +25%' },
    { type: 'shop_discount', value: 0.15, description: 'Ice items -15%' },
  ],
  'jane': [
    { type: 'element_boost', value: 0.25, description: 'Wind damage +25%' },
  ],
};

const SCORN_EFFECTS: Record<string, InterventionEffect[]> = {
  'the-one': [
    { type: 'element_nerf', value: -0.25, description: 'Void damage -25%' },
  ],
  'john': [
    { type: 'shop_penalty', value: 0.25, description: 'Earth items +25%' },
    { type: 'element_nerf', value: -0.15, description: 'Earth damage -15%' },
  ],
  'peter': [
    { type: 'element_nerf', value: -0.25, description: 'Death damage -25%' },
    { type: 'shop_penalty', value: 0.20, description: 'Death items +20%' },
  ],
  'robert': [
    { type: 'element_nerf', value: -0.25, description: 'Fire damage -25%' },
    { type: 'crit_downgrade', value: 1, description: 'd10 crits downgraded by 1' },
  ],
  'alice': [
    { type: 'element_nerf', value: -0.25, description: 'Ice damage -25%' },
    { type: 'shop_penalty', value: 0.25, description: 'Ice items +25%' },
  ],
  'jane': [
    { type: 'element_nerf', value: -0.20, description: 'Wind damage -20%' },
  ],
};

// ============================================
// INTERVENTION GENERATION
// ============================================

let interventionIdCounter = 0;

/**
 * Generate unique intervention ID
 */
function generateInterventionId(): string {
  return `int_${Date.now()}_${++interventionIdCounter}`;
}

/**
 * Pick random template from array
 */
function pickTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Fill template with player name
 */
function fillTemplate(template: string, playerName: string, dierectorSlug: string): string {
  const display = DIERECTOR_DISPLAY[dierectorSlug];
  return template
    .replace(/{player}/g, playerName)
    .replace(/{name}/g, display?.name ?? dierectorSlug);
}

/**
 * Generate intervention event for threshold crossing
 */
export function generateIntervention(
  dierectorSlug: string,
  playerId: string,
  playerName: string,
  newState: FavorState
): InterventionEvent | null {
  if (newState === 'NEUTRAL') return null;

  const isBlessing = newState === 'BLESSED';
  const templates = isBlessing
    ? BLESSING_TEMPLATES[dierectorSlug]
    : SCORN_TEMPLATES[dierectorSlug];

  if (!templates || templates.length === 0) return null;

  const template = pickTemplate(templates);
  const message = fillTemplate(template, playerName, dierectorSlug);
  const effects = isBlessing
    ? BLESSING_EFFECTS[dierectorSlug] ?? []
    : SCORN_EFFECTS[dierectorSlug] ?? [];

  return {
    id: generateInterventionId(),
    type: isBlessing ? 'BLESSING' : 'SCORN',
    dierectorSlug,
    playerId,
    playerName,
    message,
    effects: [...effects],
    timestamp: Date.now(),
  };
}

/**
 * Check for rivalry sympathy intervention
 *
 * When a player is SCORNED by Die-rector A,
 * check if any rival of A wants to intervene.
 */
export function checkRivalrySympathy(
  scornedBySlug: string,
  playerId: string,
  playerName: string,
  favorMap: PlayerFavorMap
): InterventionEvent | null {
  const rivals = getRivals(scornedBySlug);

  for (const rivalSlug of rivals) {
    // Rival must not also scorn the player
    const rivalFavor = favorMap.favors[rivalSlug];
    if (!rivalFavor || rivalFavor.state === 'SCORNED') continue;

    // Get sympathy templates
    const templates = RIVALRY_SYMPATHY_TEMPLATES[scornedBySlug]?.[rivalSlug];
    if (!templates || templates.length === 0) continue;

    // 40% chance of sympathy intervention
    if (Math.random() > 0.4) continue;

    const template = pickTemplate(templates);
    const message = fillTemplate(template, playerName, rivalSlug);

    // Sympathy grants minor blessing effect from rival
    const effects: InterventionEffect[] = [
      { type: 'element_boost', value: 0.10, description: `${DIERECTOR_DISPLAY[rivalSlug]?.name ?? rivalSlug} offers minor aid` },
    ];

    return {
      id: generateInterventionId(),
      type: 'RIVALRY_SYMPATHY',
      dierectorSlug: rivalSlug,
      playerId,
      playerName,
      message,
      effects,
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * Get active effects for a player from all Die-rectors
 */
export function getActiveEffects(
  favorMap: PlayerFavorMap
): InterventionEffect[] {
  const effects: InterventionEffect[] = [];

  for (const [slug, favor] of Object.entries(favorMap.favors)) {
    if (favor.state === 'BLESSED') {
      effects.push(...(BLESSING_EFFECTS[slug] ?? []));
    } else if (favor.state === 'SCORNED') {
      effects.push(...(SCORN_EFFECTS[slug] ?? []));
    }
  }

  return effects;
}

/**
 * Calculate net element multiplier from effects
 */
export function calculateElementMultiplier(
  effects: InterventionEffect[],
  element: string
): number {
  let multiplier = 1.0;

  for (const effect of effects) {
    if (effect.type === 'element_boost' || effect.type === 'element_nerf') {
      // Check if this effect applies to the element
      // Effect descriptions contain element name
      if (effect.description.toLowerCase().includes(element.toLowerCase())) {
        multiplier += effect.value;
      }
    }
  }

  return Math.max(0.5, multiplier); // Floor at 50%
}

/**
 * Calculate shop price modifier from effects
 */
export function calculateShopModifier(
  effects: InterventionEffect[],
  itemElement: string
): number {
  let modifier = 1.0;

  for (const effect of effects) {
    if (effect.type === 'shop_discount') {
      if (effect.description.toLowerCase().includes(itemElement.toLowerCase())) {
        modifier -= effect.value;
      }
    } else if (effect.type === 'shop_penalty') {
      if (effect.description.toLowerCase().includes(itemElement.toLowerCase())) {
        modifier += effect.value;
      }
    }
  }

  return Math.max(0.5, modifier); // Floor at 50% discount
}
