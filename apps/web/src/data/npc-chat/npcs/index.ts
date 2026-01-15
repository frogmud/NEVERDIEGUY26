/**
 * NPC Personality Configs and Templates
 *
 * Central export for all NPC definitions.
 */

// Die-rectors (Pantheon)
export { THE_ONE_PERSONALITY, THE_ONE_TEMPLATES } from './the-one';
export { JOHN_PERSONALITY, JOHN_TEMPLATES } from './john';
export { PETER_PERSONALITY, PETER_TEMPLATES } from './peter';
export { ROBERT_PERSONALITY, ROBERT_TEMPLATES } from './robert';
export { ALICE_PERSONALITY, ALICE_TEMPLATES } from './alice';
export { JANE_PERSONALITY, JANE_TEMPLATES } from './jane';

// Wanderers
export { WILLY_PERSONALITY, WILLY_TEMPLATES } from './willy';
export { MR_BONES_PERSONALITY, MR_BONES_TEMPLATES } from './mr-bones';
export { DR_MAXWELL_PERSONALITY, DR_MAXWELL_TEMPLATES } from './dr-maxwell';
export { KING_JAMES_PERSONALITY, KING_JAMES_TEMPLATES } from './king-james';
export { BOO_G_PERSONALITY, BOO_G_TEMPLATES } from './boo-g';
export { THE_GENERAL_WANDERER_PERSONALITY, THE_GENERAL_WANDERER_TEMPLATES } from './the-general-wanderer';
export { DR_VOSS_PERSONALITY, DR_VOSS_TEMPLATES } from './dr-voss';
export { XTREME_PERSONALITY, XTREME_TEMPLATES } from './xtreme';

// Travelers
export { STITCH_UP_GIRL_PERSONALITY, STITCH_UP_GIRL_TEMPLATES } from './stitch-up-girl';
export { THE_GENERAL_TRAVELER_PERSONALITY, THE_GENERAL_TRAVELER_TEMPLATES } from './the-general-traveler';
export { BODY_COUNT_PERSONALITY, BODY_COUNT_TEMPLATES } from './body-count';
export { BOOTS_PERSONALITY, BOOTS_TEMPLATES } from './boots';
export { CLAUSEN_PERSONALITY, CLAUSEN_TEMPLATES } from './clausen';
export { KEITH_MAN_PERSONALITY, KEITH_MAN_TEMPLATES } from './keith-man';
export { MR_KEVIN_PERSONALITY, MR_KEVIN_TEMPLATES } from './mr-kevin';

// Cosmic Horrors (Pantheon)
export { RHEA_PERSONALITY, RHEA_TEMPLATES } from './rhea';
export { ALIEN_BABY_PERSONALITY, ALIEN_BABY_TEMPLATES } from './alien-baby';
export { ZERO_CHANCE_PERSONALITY, ZERO_CHANCE_TEMPLATES } from './zero-chance';

// ============================================
// Combined Exports
// ============================================

import { THE_ONE_PERSONALITY, THE_ONE_TEMPLATES } from './the-one';
import { JOHN_PERSONALITY, JOHN_TEMPLATES } from './john';
import { PETER_PERSONALITY, PETER_TEMPLATES } from './peter';
import { ROBERT_PERSONALITY, ROBERT_TEMPLATES } from './robert';
import { ALICE_PERSONALITY, ALICE_TEMPLATES } from './alice';
import { JANE_PERSONALITY, JANE_TEMPLATES } from './jane';
import { WILLY_PERSONALITY, WILLY_TEMPLATES } from './willy';
import { MR_BONES_PERSONALITY, MR_BONES_TEMPLATES } from './mr-bones';
import { DR_MAXWELL_PERSONALITY, DR_MAXWELL_TEMPLATES } from './dr-maxwell';
import { KING_JAMES_PERSONALITY, KING_JAMES_TEMPLATES } from './king-james';
import { STITCH_UP_GIRL_PERSONALITY, STITCH_UP_GIRL_TEMPLATES } from './stitch-up-girl';
import { THE_GENERAL_TRAVELER_PERSONALITY, THE_GENERAL_TRAVELER_TEMPLATES } from './the-general-traveler';
import { BODY_COUNT_PERSONALITY, BODY_COUNT_TEMPLATES } from './body-count';
import { BOOTS_PERSONALITY, BOOTS_TEMPLATES } from './boots';
import { CLAUSEN_PERSONALITY, CLAUSEN_TEMPLATES } from './clausen';
import { KEITH_MAN_PERSONALITY, KEITH_MAN_TEMPLATES } from './keith-man';
import { MR_KEVIN_PERSONALITY, MR_KEVIN_TEMPLATES } from './mr-kevin';
import { BOO_G_PERSONALITY, BOO_G_TEMPLATES } from './boo-g';
import { THE_GENERAL_WANDERER_PERSONALITY, THE_GENERAL_WANDERER_TEMPLATES } from './the-general-wanderer';
import { DR_VOSS_PERSONALITY, DR_VOSS_TEMPLATES } from './dr-voss';
import { XTREME_PERSONALITY, XTREME_TEMPLATES } from './xtreme';
import { RHEA_PERSONALITY, RHEA_TEMPLATES } from './rhea';
import { ALIEN_BABY_PERSONALITY, ALIEN_BABY_TEMPLATES } from './alien-baby';
import { ZERO_CHANCE_PERSONALITY, ZERO_CHANCE_TEMPLATES } from './zero-chance';
import { ALL_EXPANDED_TEMPLATES } from './dialogue-expansion';
import { ALL_CHATBASE_EXTRACTED } from './chatbase-extracted';
import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

/**
 * All NPC personality configs
 */
export const ALL_NPC_PERSONALITIES: NPCPersonalityConfig[] = [
  // Pantheon (Die-rectors)
  THE_ONE_PERSONALITY,
  JOHN_PERSONALITY,
  PETER_PERSONALITY,
  ROBERT_PERSONALITY,
  ALICE_PERSONALITY,
  JANE_PERSONALITY,
  // Wanderers
  WILLY_PERSONALITY,
  MR_BONES_PERSONALITY,
  DR_MAXWELL_PERSONALITY,
  KING_JAMES_PERSONALITY,
  BOO_G_PERSONALITY,
  THE_GENERAL_WANDERER_PERSONALITY,
  DR_VOSS_PERSONALITY,
  XTREME_PERSONALITY,
  // Travelers
  STITCH_UP_GIRL_PERSONALITY,
  THE_GENERAL_TRAVELER_PERSONALITY,
  BODY_COUNT_PERSONALITY,
  BOOTS_PERSONALITY,
  CLAUSEN_PERSONALITY,
  KEITH_MAN_PERSONALITY,
  MR_KEVIN_PERSONALITY,
  // Cosmic Horrors (Pantheon)
  RHEA_PERSONALITY,
  ALIEN_BABY_PERSONALITY,
  ZERO_CHANCE_PERSONALITY,
];

/**
 * All response templates
 */
export const ALL_TEMPLATES: ResponseTemplate[] = [
  // Pantheon
  ...THE_ONE_TEMPLATES,
  ...JOHN_TEMPLATES,
  ...PETER_TEMPLATES,
  ...ROBERT_TEMPLATES,
  ...ALICE_TEMPLATES,
  ...JANE_TEMPLATES,
  // Wanderers
  ...WILLY_TEMPLATES,
  ...MR_BONES_TEMPLATES,
  ...DR_MAXWELL_TEMPLATES,
  ...KING_JAMES_TEMPLATES,
  ...BOO_G_TEMPLATES,
  ...THE_GENERAL_WANDERER_TEMPLATES,
  ...DR_VOSS_TEMPLATES,
  ...XTREME_TEMPLATES,
  // Travelers
  ...STITCH_UP_GIRL_TEMPLATES,
  ...THE_GENERAL_TRAVELER_TEMPLATES,
  ...BODY_COUNT_TEMPLATES,
  ...BOOTS_TEMPLATES,
  ...CLAUSEN_TEMPLATES,
  ...KEITH_MAN_TEMPLATES,
  ...MR_KEVIN_TEMPLATES,
  // Cosmic Horrors (Pantheon)
  ...RHEA_TEMPLATES,
  ...ALIEN_BABY_TEMPLATES,
  ...ZERO_CHANCE_TEMPLATES,
  // Expanded Dialogue Pool (450+ additional lines)
  ...ALL_EXPANDED_TEMPLATES,
  // Chatbase-Extracted Dialogue (85+ Claude-generated lines)
  ...ALL_CHATBASE_EXTRACTED,
];

/**
 * Get personality config by slug
 */
export function getPersonality(slug: string): NPCPersonalityConfig | undefined {
  return ALL_NPC_PERSONALITIES.find((p) => p.slug === slug);
}

/**
 * Get all templates for an NPC
 */
export function getTemplatesForNPC(slug: string): ResponseTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.entitySlug === slug);
}

/**
 * NPC Categories
 *
 * Travelers (Friendly) - Former playable characters, allies
 * Wanderers (Neutral) - Merchants, volatile parties
 * Pantheon (Hostile) - Die-rectors and cosmic forces
 *
 * Slug format: For NPCs appearing in multiple categories, use category prefix
 * e.g., 'wanderers/king-james' vs 'pantheon/king-james'
 */
export const NPC_CATEGORIES = {
  // Friendly allies - former playable characters
  travelers: [
    'stitch-up-girl',
    'the-general-traveler',
    'body-count',
    'boots',
    'clausen',
    'keith-man',
    'mr-kevin',
  ],

  // Neutral/volatile - merchants and ambiguous parties
  wanderers: [
    'willy',
    'mr-bones',
    'dr-maxwell',
    'king-james',
    'boo-g',
    'the-general-wanderer',
    'dr-voss',
    'xtreme',
  ],

  // Hostile cosmic forces - Die-rectors and outer realm horrors
  pantheon: [
    'the-one',
    'john',
    'peter',
    'robert',
    'alice',
    'jane',
    'rhea',
    'alien-baby',
    'zero-chance',
    // 'pantheon/king-james', // Board chair version
    // 'pantheon/alien-old-one',
  ],
} as const;

export type NPCCategory = keyof typeof NPC_CATEGORIES;

/**
 * Get NPC category from slug
 */
export function getNPCCategory(slug: string): NPCCategory | undefined {
  if ((NPC_CATEGORIES.travelers as readonly string[]).includes(slug)) return 'travelers';
  if ((NPC_CATEGORIES.wanderers as readonly string[]).includes(slug)) return 'wanderers';
  if ((NPC_CATEGORIES.pantheon as readonly string[]).includes(slug)) return 'pantheon';
  return undefined;
}

/**
 * Check if NPC is a Traveler (friendly)
 */
export function isTraveler(slug: string): boolean {
  return (NPC_CATEGORIES.travelers as readonly string[]).includes(slug);
}

/**
 * Check if NPC is a Wanderer (neutral)
 */
export function isWanderer(slug: string): boolean {
  return (NPC_CATEGORIES.wanderers as readonly string[]).includes(slug);
}

/**
 * Check if NPC is Pantheon (hostile)
 */
export function isPantheon(slug: string): boolean {
  return (NPC_CATEGORIES.pantheon as readonly string[]).includes(slug);
}

/**
 * @deprecated Use isPantheon instead
 */
export function isDirector(slug: string): boolean {
  return isPantheon(slug);
}
