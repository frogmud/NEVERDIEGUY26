/**
 * Gutter Whispers - Atmospheric Loading Tips
 *
 * Short, italic, no context needed.
 * Perfect for loading screens, transitions, and ambient atmosphere.
 *
 * Sourced from V8 comic system and issue dialogue.
 */

import { createSeededRng, type SeededRng } from '../core/seeded-rng';

// ============================================
// Core Gutter Whispers (V8 System)
// ============================================

export const GUTTER_WHISPERS = [
  // V8 System - Core
  'debt remembers',
  'the shelves demand filling',
  'window closing',
  'here comes the audit',
  'not graveyard, shelves',
  'not space, but pressure',
  'seeds planted, collapse inevitable',

  // Issue-specific
  'death is temporary but pain is real',
  'the game never ends',
  'time works differently here',
  'the Die-rectors watch everything',
  'gold flows in strange patterns',
  'every ending is a beginning',
  'the rules are suggestions',
  'immortality on a feed',
  'cursed app, cursed stream',
  'same conversations, different day',

  // Character-sourced
  'every law has a loophole',
  'spend a life, save a friend',
  'numbers dont lie, people do',
  'freedom isnt given, its taken',
  'the void obeys',
  'cold preserves, heat destroys',

  // Domain atmosphere
  'skyscrapers glow like burning spreadsheets',
  'chained bodies float like constellations',
  'courtrooms grow like tumors',
  'all paths lead to throne',
  'the crown pulls',
  'reality shifts again',
];

// ============================================
// Scar Text (Guy's Internal Voice)
// For critical moments, boss fights, death screens
// ============================================

export const SCAR_TEXT = [
  'THE CROWN PULLS. ALL PATHS FOLD INWARD.',
  'EVERY DEBT COLLECTED. ONE BY ONE.',
  'NEVER LEFT STANDING',
  'ALL PATHS LEAD TO THRONE',
  'COURTROOMS GROW LIKE TUMORS',
  'DEBT REMAINS',
];

// ============================================
// Domain Environmental Text
// Words that appear in surfaces during transitions
// ============================================

export const DOMAIN_ENVIRONMENTAL_TEXT: Record<string, string[]> = {
  'null-providence': [
    'ALL PATHS LEAD TO THRONE',
    'void void void',
    'null set',
    'absence',
  ],
  'shadow-keep': [
    'COURTROOMS GROW LIKE TUMORS',
    'shadow ledger',
    'final audit',
    'tally marks',
  ],
  infernus: [
    'BURNING SPREADSHEETS',
    'thermal debt',
    'fire consumes',
    'ash to numbers',
  ],
  'frost-reach': [
    'ice preserves',
    'frozen warning',
    'patience measured in ages',
    'endurance',
  ],
  earth: [
    'ground truth',
    'foundation',
    'solid footing',
    'begin here',
  ],
  aberrant: [
    'reality bends',
    'probability shifts',
    'chaos pattern',
    'aberration',
  ],
};

// ============================================
// Issue Titles (Achievement/Chapter Names)
// ============================================

export const ISSUE_TITLES = [
  { issue: 0, title: 'The Velvet Starfall' },
  { issue: 1, title: 'Superstar Contract' },
  { issue: 2, title: 'Not Even With Guns' },
  { issue: 3, title: 'Terminal Condition' },
  { issue: 4, title: 'Thermal Bankruptcy' },
  { issue: 5, title: 'Revolution Theory' },
  { issue: 6, title: 'Dynamite Memories' },
  { issue: 10, title: 'Hostile Takeover' },
  { issue: 11, title: 'System Restore' },
  { issue: 12, title: 'All Systems Go (Hold)' },
  { issue: 13, title: 'One Earth' },
  { issue: 14, title: 'Chaos Theory' },
  { issue: 15, title: 'Broken Accord' },
  { issue: 16, title: 'Traveler' },
  { issue: 30, title: 'Debt Remains' },
];

// ============================================
// Arc Summaries (Wiki Volumes)
// ============================================

export const ARC_SUMMARIES = [
  { volume: 1, issues: '1-6', summary: 'Sports exploitation to cosmic contracts' },
  { volume: 2, issues: '7-12', summary: 'Audit institute emergence, Keith/Kevin duality' },
  { volume: 3, issues: '13-18', summary: 'Clausen\'s death, Omni-Cat rebirth, Rhea\'s coronation' },
  { volume: 4, issues: '19-22', summary: 'Crown split, Guy\'s crown-bearer destiny' },
  { volume: 5, issues: '23-26', summary: 'Die-rector 0 emerges, audit warfare, Body Count\'s sacrifice' },
  { volume: 6, issues: '27-30', summary: 'Crown/Hive/Null convergence, democratic resolution' },
];

// ============================================
// Visual Tells (Animation Cues)
// ============================================

export interface VisualTell {
  character: string;
  tell: string;
  gameTranslation: string;
}

export const VISUAL_TELLS: VisualTell[] = [
  { character: 'boots', tell: 'Tail(s) twitch before improbable outcomes', gameTranslation: 'Pre-crit animation' },
  { character: 'clausen', tell: 'Cough-pause before clauses', gameTranslation: 'Shop interaction delay' },
  { character: 'body-count', tell: 'Tilts head; etches marks mid-scene', gameTranslation: 'Tally increment animation' },
  { character: 'rhea', tell: 'Calm cadence; speech balloons align/stack', gameTranslation: 'Text stacking effect' },
  { character: 'mr-bones', tell: 'Counts fingers like abacus; slow nod', gameTranslation: 'Transaction confirmation' },
  { character: 'keith-man', tell: 'Feet shuffle at idle; balloons cascade/crowd', gameTranslation: 'Hyperactive idle state' },
  { character: 'mr-kevin', tell: 'Eyes steady too long; no filler words', gameTranslation: 'Static pause, clipped text' },
  { character: 'the-one', tell: 'Panels go still; big gutters', gameTranslation: 'UI freeze effect' },
];

// ============================================
// Utility Functions
// ============================================

/**
 * Get a random gutter whisper
 */
export function getRandomWhisper(rng?: SeededRng, key?: string): string {
  if (rng && key) {
    return rng.randomChoice(GUTTER_WHISPERS, key) || GUTTER_WHISPERS[0];
  }
  return GUTTER_WHISPERS[Math.floor(Math.random() * GUTTER_WHISPERS.length)];
}

/**
 * Get a deterministic whisper based on seed
 */
export function getSeededWhisper(seed: string): string {
  const rng = createSeededRng(`whisper:${seed}`);
  return rng.randomChoice(GUTTER_WHISPERS, 'select') || GUTTER_WHISPERS[0];
}

/**
 * Get a scar text for critical moments
 */
export function getRandomScarText(rng?: SeededRng, key?: string): string {
  if (rng && key) {
    return rng.randomChoice(SCAR_TEXT, key) || SCAR_TEXT[0];
  }
  return SCAR_TEXT[Math.floor(Math.random() * SCAR_TEXT.length)];
}

/**
 * Get domain-specific environmental text
 */
export function getDomainText(domainSlug: string, rng?: SeededRng, key?: string): string {
  const pool = DOMAIN_ENVIRONMENTAL_TEXT[domainSlug] || DOMAIN_ENVIRONMENTAL_TEXT['earth'];
  if (rng && key) {
    return rng.randomChoice(pool, key) || pool[0];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get visual tell for a character
 */
export function getVisualTell(characterSlug: string): VisualTell | undefined {
  return VISUAL_TELLS.find(t => t.character === characterSlug);
}

/**
 * Get issue title
 */
export function getIssueTitle(issueNumber: number): string | undefined {
  return ISSUE_TITLES.find(i => i.issue === issueNumber)?.title;
}

/**
 * Get arc summary
 */
export function getArcSummary(volume: number): string | undefined {
  return ARC_SUMMARIES.find(a => a.volume === volume)?.summary;
}

/**
 * Get loading tip (formatted for display)
 * Returns whisper in italic format
 */
export function getLoadingTip(seed?: string): string {
  const whisper = seed ? getSeededWhisper(seed) : getRandomWhisper();
  return whisper;
}

/**
 * Get multiple unique whispers
 */
export function getMultipleWhispers(count: number, seed?: string): string[] {
  const rng = seed ? createSeededRng(`whispers:${seed}`) : undefined;
  const shuffled = rng
    ? rng.shuffle([...GUTTER_WHISPERS], 'shuffle')
    : [...GUTTER_WHISPERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
