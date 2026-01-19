/**
 * Domain-Enemy-DieRector Mapping
 *
 * Maps game domains to their ruling Die-rectors and enemy types.
 * Enemies are vessels - Die-rectors speak through them.
 */

import type { DieRectorSlug, EnemyType } from './types';

// ============================================
// Domain Configuration
// ============================================

export interface DomainConfig {
  id: number;
  name: string;
  dieRector: DieRectorSlug;
  enemies: EnemyType[];
  color: string;
  voiceFilter: 'void' | 'stone' | 'shadow' | 'flame' | 'frost' | 'static';
}

export const DOMAIN_CONFIG: Record<number, DomainConfig> = {
  1: {
    id: 1,
    name: 'Null Providence',
    dieRector: 'the-one',
    enemies: ['nullspawn', 'voidling', 'echo'],
    color: '#1a1a2e',
    voiceFilter: 'void',
  },
  2: {
    id: 2,
    name: 'The Foundations',
    dieRector: 'john',
    enemies: ['golem', 'construct', 'machine'],
    color: '#4a3728',
    voiceFilter: 'stone',
  },
  3: {
    id: 3,
    name: 'The Threshold',
    dieRector: 'peter',
    enemies: ['shade', 'watcher', 'gate-thing'],
    color: '#2d2d44',
    voiceFilter: 'shadow',
  },
  4: {
    id: 4,
    name: 'The Furnace',
    dieRector: 'robert',
    enemies: ['ember-beast', 'burnling', 'ash-form'],
    color: '#8b2500',
    voiceFilter: 'flame',
  },
  5: {
    id: 5,
    name: 'Frost Reach',
    dieRector: 'alice',
    enemies: ['frost-spawn', 'crystal', 'frozen-one'],
    color: '#4a6fa5',
    voiceFilter: 'frost',
  },
  6: {
    id: 6,
    name: 'The Aberrant',
    dieRector: 'jane',
    enemies: ['mutant', 'shifter', 'aberration'],
    color: '#4a0080',
    voiceFilter: 'static',
  },
};

// ============================================
// Die-rector Metadata
// ============================================

export interface DieRectorMeta {
  slug: DieRectorSlug;
  name: string;
  title: string;
  domain?: number;
  isTrinity: boolean;
  color: string;
  // Voice characteristics for filtering
  voiceStyle: 'cold' | 'warm' | 'echoing' | 'burning' | 'sharp' | 'shifting' | 'absolute' | 'watching' | 'void';
}

export const DIE_RECTOR_META: Record<DieRectorSlug, DieRectorMeta> = {
  'the-one': {
    slug: 'the-one',
    name: 'The One',
    title: 'Keeper of the Void',
    domain: 1,
    isTrinity: false,
    color: '#1a1a2e',
    voiceStyle: 'cold',
  },
  'john': {
    slug: 'john',
    name: 'John',
    title: 'The Foundation',
    domain: 2,
    isTrinity: false,
    color: '#4a3728',
    voiceStyle: 'warm',
  },
  'peter': {
    slug: 'peter',
    name: 'Peter',
    title: 'The Gatekeeper',
    domain: 3,
    isTrinity: false,
    color: '#2d2d44',
    voiceStyle: 'echoing',
  },
  'robert': {
    slug: 'robert',
    name: 'Robert',
    title: 'The Burning',
    domain: 4,
    isTrinity: false,
    color: '#8b2500',
    voiceStyle: 'burning',
  },
  'alice': {
    slug: 'alice',
    name: 'Alice',
    title: 'The Frozen',
    domain: 5,
    isTrinity: false,
    color: '#4a6fa5',
    voiceStyle: 'sharp',
  },
  'jane': {
    slug: 'jane',
    name: 'Jane',
    title: 'The Aberrant',
    domain: 6,
    isTrinity: false,
    color: '#4a0080',
    voiceStyle: 'shifting',
  },
  // The Unholy Trinity - special antagonists
  'rhea': {
    slug: 'rhea',
    name: 'Rhea',
    title: 'Queen of Never',
    isTrinity: true,
    color: '#2a0a2a',
    voiceStyle: 'absolute',
  },
  'king-james': {
    slug: 'king-james',
    name: 'King James',
    title: 'The Undying',
    isTrinity: true,
    color: '#1a1a1a',
    voiceStyle: 'watching',
  },
  'zero-chance': {
    slug: 'zero-chance',
    name: 'Zero Chance',
    title: 'The Never',
    isTrinity: true,
    color: '#0a0a0a',
    voiceStyle: 'void',
  },
};

// ============================================
// Enemy Metadata
// ============================================

export interface EnemyMeta {
  type: EnemyType;
  name: string;
  channelStrength: 'weak' | 'medium' | 'strong';
  // How much the voice filter distorts their speech
  filterIntensity: number; // 0-1
}

export const ENEMY_META: Record<EnemyType, EnemyMeta> = {
  // Void enemies
  'nullspawn': { type: 'nullspawn', name: 'Nullspawn', channelStrength: 'weak', filterIntensity: 0.8 },
  'voidling': { type: 'voidling', name: 'Voidling', channelStrength: 'medium', filterIntensity: 0.6 },
  'echo': { type: 'echo', name: 'Echo', channelStrength: 'strong', filterIntensity: 0.3 },

  // Earth enemies
  'golem': { type: 'golem', name: 'Golem', channelStrength: 'weak', filterIntensity: 0.8 },
  'construct': { type: 'construct', name: 'Construct', channelStrength: 'medium', filterIntensity: 0.6 },
  'machine': { type: 'machine', name: 'Machine', channelStrength: 'strong', filterIntensity: 0.3 },

  // Shadow enemies
  'shade': { type: 'shade', name: 'Shade', channelStrength: 'weak', filterIntensity: 0.8 },
  'watcher': { type: 'watcher', name: 'Watcher', channelStrength: 'medium', filterIntensity: 0.6 },
  'gate-thing': { type: 'gate-thing', name: 'Gate-Thing', channelStrength: 'strong', filterIntensity: 0.3 },

  // Fire enemies
  'ember-beast': { type: 'ember-beast', name: 'Ember Beast', channelStrength: 'weak', filterIntensity: 0.8 },
  'burnling': { type: 'burnling', name: 'Burnling', channelStrength: 'medium', filterIntensity: 0.6 },
  'ash-form': { type: 'ash-form', name: 'Ash Form', channelStrength: 'strong', filterIntensity: 0.3 },

  // Ice enemies
  'frost-spawn': { type: 'frost-spawn', name: 'Frost Spawn', channelStrength: 'weak', filterIntensity: 0.8 },
  'crystal': { type: 'crystal', name: 'Crystal', channelStrength: 'medium', filterIntensity: 0.6 },
  'frozen-one': { type: 'frozen-one', name: 'Frozen One', channelStrength: 'strong', filterIntensity: 0.3 },

  // Chaos enemies
  'mutant': { type: 'mutant', name: 'Mutant', channelStrength: 'weak', filterIntensity: 0.8 },
  'shifter': { type: 'shifter', name: 'Shifter', channelStrength: 'medium', filterIntensity: 0.6 },
  'aberration': { type: 'aberration', name: 'Aberration', channelStrength: 'strong', filterIntensity: 0.3 },

  // Corrupted enemies (special - can channel any Trinity member)
  'claimed-one': { type: 'claimed-one', name: 'Claimed One', channelStrength: 'medium', filterIntensity: 0.5 },
  'marked': { type: 'marked', name: 'Marked', channelStrength: 'strong', filterIntensity: 0.4 },
  'consumed': { type: 'consumed', name: 'Consumed', channelStrength: 'strong', filterIntensity: 0.2 },
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get the Die-rector for a given domain
 */
export function getDieRectorForDomain(domain: number): DieRectorSlug {
  return DOMAIN_CONFIG[domain]?.dieRector ?? 'the-one';
}

/**
 * Get all enemies for a domain
 */
export function getEnemiesForDomain(domain: number): EnemyType[] {
  return DOMAIN_CONFIG[domain]?.enemies ?? [];
}

/**
 * Get domain color
 */
export function getDomainColor(domain: number): string {
  return DOMAIN_CONFIG[domain]?.color ?? '#1a1a2e';
}

/**
 * Get Die-rector color
 */
export function getDieRectorColor(slug: DieRectorSlug): string {
  return DIE_RECTOR_META[slug]?.color ?? '#1a1a2e';
}

/**
 * Check if a Die-rector is part of the Trinity
 */
export function isTrinityMember(slug: DieRectorSlug): boolean {
  return DIE_RECTOR_META[slug]?.isTrinity ?? false;
}

/**
 * Get Trinity members (for high corruption encounters)
 */
export function getTrinityMembers(): DieRectorSlug[] {
  return ['rhea', 'king-james', 'zero-chance'];
}

/**
 * Pick a random enemy from a domain using seeded random
 */
export function pickEnemyForDomain(domain: number, random: () => number): EnemyType {
  const enemies = getEnemiesForDomain(domain);
  if (enemies.length === 0) return 'nullspawn';
  const index = Math.floor(random() * enemies.length);
  return enemies[index];
}

/**
 * Get voice filter intensity for an enemy
 * Lower = clearer Die-rector voice, Higher = more garbled
 */
export function getFilterIntensity(enemy: EnemyType): number {
  return ENEMY_META[enemy]?.filterIntensity ?? 0.5;
}
