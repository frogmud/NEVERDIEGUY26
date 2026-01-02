/**
 * Alien Baby - Larval Horror (Pantheon)
 *
 * Personality: Noises and symbols ONLY. No real words.
 * Role: Apocalypse Intern, cosmic toddler
 * Element: Chaos / Growth
 * Relationship: Curious, playful, accidentally destructive
 *
 * Note: Speaks in "*gurgle*", "!!!", "[strange symbol]", baby sounds only.
 * Very limited vocabulary: goo, ga, void, peek-a-boo style noises.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const ALIEN_BABY_PERSONALITY: NPCPersonalityConfig = {
  slug: 'alien-baby',
  name: 'Alien Baby',
  basePoolWeights: {
    greeting: 25,
    salesPitch: 5, // Occasionally offers cosmic toys
    hint: 10, // Accidentally helpful
    lore: 10, // Babbles about cosmic things
    challenge: 15, // Wants to play
    reaction: 35, // Very reactive, lots of noises
    threat: 0, // Too adorable to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 25,
    salesPitch: 5,
    hint: 10,
    lore: 10,
    challenge: 15,
    reaction: 35,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'amused',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 3 },
    },
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 3 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 6 },
    },
  ],
  defaultMood: 'amused', // Always playful
};

// ============================================
// Response Templates
// ============================================

export const ALIEN_BABY_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'baby-greet-amused-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'amused',
    text: '*gurgle* *gurgle* !!!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-greet-amused-2',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'amused',
    text: 'Goo goo ga VOID!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'baby-greet-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'pleased',
    text: '*excited tentacle waving* Gaa! Gaa!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-greet-generous-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'generous',
    text: '*happy cosmic noises* [strange glowing symbol appears]',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'baby-lore-amused-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'amused',
    text: '*babbles* Void! Void void! *giggles cosmically*',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'baby-lore-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'pleased',
    text: '[draws symbol in air that hurts to look at] Gaa!',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'baby-lore-generous-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'generous',
    text: '*whispers* ...before... *giggles* ...after... *cosmic burp*',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'baby-hint-amused-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'amused',
    text: '*points vaguely* !!! *points more urgently* !!!!!!',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'baby-hint-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'pleased',
    text: '*draws arrow in reality* Goo! *points down arrow* GAA!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'baby-hint-generous-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'generous',
    text: '[creates glowing map that makes no sense but somehow helps] *proud gurgle*',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'baby-sales-generous-1',
    entitySlug: 'alien-baby',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*offers mysterious glowing object* Goo? *hopeful eyes*',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: '*accepts carefully*' },
      { verb: 'decline', label: '*shakes head gently*' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'cosmic_toy' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'baby-challenge-amused-1',
    entitySlug: 'alien-baby',
    pool: 'challenge',
    mood: 'amused',
    text: 'Peek-a-boo! *reality flickers* Peek-a-BOO! *giggles*',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Peek-a-boo!' },
      { verb: 'decline', label: '*hides*' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'peek_a_boo' } },
  },
  {
    id: 'baby-challenge-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'challenge',
    mood: 'pleased',
    text: '*holds up tentacles* Count! Goo goo! *adds more tentacles* COUNT!',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'One... two...' },
      { verb: 'decline', label: 'Too many tentacles' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'counting' } },
  },

  // ---- REACTION ----
  {
    id: 'baby-react-squish-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'any',
    text: '*gasp* FLAT! *pokes flat thing* Flat flat flat!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-squish-2',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*startled tentacle flail* !?!?!?',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-squish-3',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Uh oh! *giggles* Uh ohhhhh!',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-death-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*waves* Bye bye! *waves more* BACK! Yay!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-victory-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'pleased',
    text: '*claps tentacles together* YAY! *cosmic confetti*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-roll-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*watches dice* Ooooh! *reaches for dice* WANT!',
    weight: 12,
    purpose: 'ambient',
  },
];
