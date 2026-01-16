/**
 * Boss Types - Definitions for boss encounters
 *
 * Zone 1: Normal combat (intact planet)
 * Zone 2: Mini-boss / Elite (damaged planet or black hole effect)
 * Zone 3: Die-rector boss (domain's pantheon member)
 *
 * The hearts system is a presentation layer over existing score mechanics:
 * - currentScore >= targetScore = WIN (score goes UP)
 * - bossHP - currentScore <= 0 = WIN (HP goes DOWN, displayed as hearts)
 */

import type { Element } from './wiki/types';

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

export interface BossDefinition {
  slug: string;
  name: string;
  title: string;              // Display title (e.g., "Die-rector of Infernus")
  sprite: string;             // Primary sprite path
  portrait: string;           // For dialogue/intro
  maxHearts: number;          // Visual hearts (e.g., 5 hearts)
  hpPerHeart: number;         // Score needed to deplete 1 heart
  element: Element;
  weakToDice?: DieSides[];    // Bonus damage from these (1.5x)
  resistantToDice?: DieSides[]; // Reduced damage (0.75x)

  // Visual
  scale: number;              // Sprite size multiplier
  tint?: string;              // Optional color tint for effects

  // Dialogue triggers
  introDialogue?: string;
  lowHpDialogue?: string;     // < 2 hearts remaining
  defeatDialogue?: string;
}

// Die-rector boss definitions for each domain (Zone 3)
export const DIE_RECTOR_BOSSES: Record<number, BossDefinition> = {
  // Domain 1: Null Providence - The One (d4, Void)
  1: {
    slug: 'the-one',
    name: 'The One',
    title: 'Die-rector of Null Providence',
    sprite: '/assets/characters/pantheon/theone/pantheon-sprite-theone-idle01.svg',
    portrait: '/assets/characters/portraits/120px/pantheon-portrait-theone-01.svg',
    maxHearts: 4,
    hpPerHeart: 500,  // 4 x 500 = 2000 total
    element: 'Void',
    weakToDice: [20],  // Wind (d20) beats Void
    resistantToDice: [6], // Void resists Earth (d6)
    scale: 1.2,
    tint: '#8b5cf6', // Purple void
    introDialogue: 'Before two, there was one. Before one, there was nothing. I remember nothing.',
    lowHpDialogue: 'You exist because I allow the concept of existence.',
    defeatDialogue: 'Roll. Remind yourself what singular focus means.',
  },

  // Domain 2: Earth - John (d6, Earth/Stone)
  2: {
    slug: 'john',
    name: 'John',
    title: 'Die-rector of Earth',
    sprite: '/assets/characters/pantheon/john/pantheon-sprite-john-idle-01.svg',
    portrait: '/assets/characters/portraits/120px/pantheon-portrait-john-01.svg',
    maxHearts: 5,
    hpPerHeart: 600,  // 5 x 600 = 3000 total
    element: 'Earth',
    weakToDice: [4],   // Void (d4) beats Earth
    resistantToDice: [8], // Earth resists Death (d8)
    scale: 1.3,
    tint: '#84cc16', // Green earth
    introDialogue: 'Everything can be improved. Everything WILL be improved.',
    lowHpDialogue: 'Your flesh is temporary. My modifications are eternal.',
    defeatDialogue: 'Roll the die. Let me show you what efficiency means.',
  },

  // Domain 3: Shadow Keep - Peter (d8, Life/Death)
  3: {
    slug: 'peter',
    name: 'Peter',
    title: 'Die-rector of Shadow Keep',
    sprite: '/assets/characters/pantheon/peter/pantheon-sprite-peter-idle-01.svg',
    portrait: '/assets/characters/portraits/120px/pantheon-portrait-peter-01.svg',
    maxHearts: 5,
    hpPerHeart: 700,  // 5 x 700 = 3500 total
    element: 'Death',
    weakToDice: [6],   // Earth (d6) beats Death
    resistantToDice: [10], // Death resists Fire (d10)
    scale: 1.25,
    tint: '#6366f1', // Indigo shadow
    introDialogue: 'Death is but a door. I hold the key.',
    lowHpDialogue: 'The shadows have whispered of your coming.',
    defeatDialogue: 'Roll the die, traveler. Let fate decide your blessing... or curse.',
  },

  // Domain 4: Infernus - Robert (d10, Fire)
  4: {
    slug: 'robert',
    name: 'Robert',
    title: 'Die-rector of Infernus',
    sprite: '/assets/characters/pantheon/robert/pantheon-sprite-robert-idle-01.svg',
    portrait: '/assets/characters/portraits/120px/pantheon-portrait-robert-01.svg',
    maxHearts: 6,
    hpPerHeart: 800,  // 6 x 800 = 4800 total
    element: 'Fire',
    weakToDice: [8],   // Death (d8) beats Fire
    resistantToDice: [12], // Fire resists Ice (d12)
    scale: 1.35,
    tint: '#ef4444', // Red fire
    introDialogue: 'Everything burns eventually. I just accelerate the schedule.',
    lowHpDialogue: 'Your resistance is fuel for my domain.',
    defeatDialogue: 'Roll. Let us see if you burn bright or burn out.',
  },

  // Domain 5: Frost Reach - Alice (d12, Time/Ice)
  5: {
    slug: 'alice',
    name: 'Alice',
    title: 'Die-rector of Frost Reach',
    sprite: '/assets/characters/pantheon/alice/pantheon-sprite-alice-idle-02.svg',
    portrait: '/assets/characters/portraits/120px/pantheon-portrait-alice-01.svg',
    maxHearts: 6,
    hpPerHeart: 900,  // 6 x 900 = 5400 total
    element: 'Ice',
    weakToDice: [10],  // Fire (d10) beats Ice
    resistantToDice: [20], // Ice resists Wind (d20)
    scale: 1.3,
    tint: '#22d3ee', // Cyan ice
    introDialogue: 'Time is a river. I am the dam.',
    lowHpDialogue: 'Yesterday, tomorrow, now—all happen at my convenience.',
    defeatDialogue: 'Roll. Watch how quickly eternity passes.',
  },

  // Domain 6: Aberrant - Jane (d20, Air/Wind)
  6: {
    slug: 'jane',
    name: 'Jane',
    title: 'Die-rector of Aberrant',
    sprite: '/assets/characters/pantheon/jane/pantheon-sprite-jane-idle-01.svg',
    portrait: '/assets/characters/portraits/120px/pantheon-portrait-jane-01.svg',
    maxHearts: 7,
    hpPerHeart: 1000, // 7 x 1000 = 7000 total
    element: 'Wind',
    weakToDice: [12],  // Ice (d12) beats Wind
    resistantToDice: [4], // Wind resists Void (d4)
    scale: 1.4,
    tint: '#a78bfa', // Purple wind/chaos
    introDialogue: 'Normal is just aberrant that hasn\'t realized it yet.',
    lowHpDialogue: 'Breathe deep. Taste the chaos in the air.',
    defeatDialogue: 'Roll. Let abnormality find its perfect form.',
  },
};

// Mini-boss pool for Zone 2 (per domain)
// These are elite enemies from the domain's enemy pool
export const DOMAIN_MINIBOSSES: Record<number, string[]> = {
  1: ['void-lord', 'shadow-fiend'],           // Null Providence
  2: ['steam-sentry', 'cogwork-guardian'],    // Earth
  3: ['ludwig', 'makora', 'skeleton-knight'], // Shadow Keep
  4: ['flame-demon', 'infernal-golem'],       // Infernus
  5: ['frost-giant-iii', 'ice-wraith'],       // Frost Reach
  6: ['abominable', 'chaos-beast'],           // Aberrant
};

/**
 * Get boss definition for a room
 * @param domainId Domain (1-6)
 * @param zoneNumber Zone within domain (1-3)
 * @returns BossDefinition for zone 3, null for zones 1-2
 */
export function getBossForZone(domainId: number, zoneNumber: number): BossDefinition | null {
  // Only zone 3 has the Die-rector boss
  if (zoneNumber !== 3) return null;
  return DIE_RECTOR_BOSSES[domainId] || null;
}

/**
 * Calculate boss HP from target score
 * Since boss HP = targetScore, hearts are derived from hpPerHeart
 */
export function calculateBossHearts(
  boss: BossDefinition,
  currentScore: number
): { currentHearts: number; hpInCurrentHeart: number } {
  const currentHp = boss.maxHearts * boss.hpPerHeart - currentScore;
  const fullHearts = Math.ceil(currentHp / boss.hpPerHeart);
  const currentHearts = Math.max(0, fullHearts);

  // HP remaining in the current (depleting) heart as percentage 0-1
  const hpInCurrentHeart = currentHearts > 0
    ? (currentHp % boss.hpPerHeart) / boss.hpPerHeart || 1 // || 1 handles exactly full heart
    : 0;

  return { currentHearts, hpInCurrentHeart };
}

/**
 * Get target score for a boss encounter
 * This is the total HP across all hearts
 */
export function getBossTargetScore(boss: BossDefinition): number {
  return boss.maxHearts * boss.hpPerHeart;
}

/**
 * Calculate damage multiplier based on dice weakness/resistance
 */
export function getDamageMultiplier(boss: BossDefinition, dieType: DieSides): number {
  if (boss.weakToDice?.includes(dieType)) return 1.5;
  if (boss.resistantToDice?.includes(dieType)) return 0.75;
  return 1.0;
}
