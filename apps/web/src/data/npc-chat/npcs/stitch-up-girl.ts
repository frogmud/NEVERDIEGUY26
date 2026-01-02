/**
 * Stitch Up Girl - Healer Ally (Traveler)
 *
 * Personality: Caring, precise, medical humor, sisterly warmth.
 * Role: Healer ally, sister to Never Die Guy.
 * Origin: Shadow Keep
 * Relationship: Friendly, protective, offers healing and support
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const STITCH_UP_GIRL_PERSONALITY: NPCPersonalityConfig = {
  slug: 'stitch-up-girl',
  name: 'Stitch Up Girl',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 15, // Offers healing services
    hint: 25, // Helpful medical advice
    lore: 15, // Personal stories
    challenge: 5, // Rarely challenges, supportive
    reaction: 20, // Reacts to injuries, squishes
    threat: 0, // Never threatens
    idle: 0,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 15,
    hint: 25,
    lore: 15,
    challenge: 5,
    reaction: 20,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 0 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 3 },
    },
    {
      mood: 'annoyed',
      trigger: { type: 'integrity', comparison: 'lt', value: 25 },
    },
  ],
  defaultMood: 'pleased', // Always happy to help
};

// ============================================
// Response Templates
// ============================================

export const STITCH_UP_GIRL_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'stitch-greet-pleased-1',
    entitySlug: 'stitch-up-girl',
    pool: 'greeting',
    mood: 'pleased',
    text: 'There you are! Let me take a look at you. Any new holes I should know about?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'stitch-greet-pleased-2',
    entitySlug: 'stitch-up-girl',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Back in one piece! Well, mostly one piece. I can fix the rest.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'stitch-greet-generous-1',
    entitySlug: 'stitch-up-girl',
    pool: 'greeting',
    mood: 'generous',
    text: 'My favorite patient returns! And before you ask, yes, I brought extra bandages.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'stitch-greet-annoyed-1',
    entitySlug: 'stitch-up-girl',
    pool: 'greeting',
    mood: 'annoyed',
    text: 'You look TERRIBLE. Sit down. Now. Do not argue with your healer.',
    weight: 20,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 30 }],
  },

  // ---- LORE ----
  {
    id: 'stitch-lore-pleased-1',
    entitySlug: 'stitch-up-girl',
    pool: 'lore',
    mood: 'pleased',
    text: 'Shadow Keep taught me that healing is just damage in reverse. Very precise reverse.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'stitch-lore-pleased-2',
    entitySlug: 'stitch-up-girl',
    pool: 'lore',
    mood: 'pleased',
    text: 'Being related to someone who cannot die... it gives you perspective on mortality. And job security.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'stitch-lore-generous-1',
    entitySlug: 'stitch-up-girl',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret: my scissors can cut more than flesh. They can sever curses. But only small ones.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'stitch-hint-pleased-1',
    entitySlug: 'stitch-up-girl',
    pool: 'hint',
    mood: 'pleased',
    text: 'Medical advice: the enemies ahead hit hard but tire quickly. Survive the first wave, then strike.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'stitch-hint-generous-1',
    entitySlug: 'stitch-up-girl',
    pool: 'hint',
    mood: 'generous',
    text: 'I patched up someone from that area. They mentioned a healing fountain two rooms ahead. Go there first.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 2 } },
  },
  {
    id: 'stitch-hint-annoyed-1',
    entitySlug: 'stitch-up-girl',
    pool: 'hint',
    mood: 'annoyed',
    text: 'At {{integrity}}% integrity, my professional opinion is: STOP GETTING HIT.',
    weight: 20,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 30 }],
  },

  // ---- SALES PITCH ----
  {
    id: 'stitch-sales-pleased-1',
    entitySlug: 'stitch-up-girl',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'I have bandages, potions, and one slightly experimental serum. The serum is discounted. For reasons.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me' },
      { verb: 'ask', label: 'What reasons?' },
    ],
    action: { type: 'openShop', payload: { shopType: 'medical' } },
  },
  {
    id: 'stitch-sales-generous-1',
    entitySlug: 'stitch-up-girl',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'For you? Free patch-up. Just this once. And next time. And probably after that.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Thanks, sis' },
      { verb: 'decline', label: 'Save it for later' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'free_heal' } },
    cooldown: { oncePerRun: true },
  },
  {
    id: 'stitch-sales-annoyed-1',
    entitySlug: 'stitch-up-girl',
    pool: 'salesPitch',
    mood: 'annoyed',
    text: 'This is not optional. You WILL take this healing potion. I am not asking.',
    weight: 25,
    purpose: 'shop',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 25 }],
    quickReplies: [
      { verb: 'accept', label: 'Yes ma\'am' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'emergency_heal' } },
  },

  // ---- CHALLENGE ----
  {
    id: 'stitch-challenge-pleased-1',
    entitySlug: 'stitch-up-girl',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Medical challenge: complete the next room without taking damage. I will be impressed. And concerned.',
    weight: 10,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Watch me' },
      { verb: 'decline', label: 'No promises' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'no_damage' } },
  },

  // ---- REACTION ----
  {
    id: 'stitch-react-squish-1',
    entitySlug: 'stitch-up-girl',
    pool: 'reaction',
    mood: 'any',
    text: 'That was... very flat. I cannot stitch that back together. I will try anyway.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'stitch-react-squish-2',
    entitySlug: 'stitch-up-girl',
    pool: 'reaction',
    mood: 'pleased',
    text: '*winces* That looked painful. Well, briefly painful. Then very flat.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'stitch-react-death-1',
    entitySlug: 'stitch-up-girl',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Welcome back! Death looked good on you. But life looks better. Let me check your vitals.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'stitch-react-victory-1',
    entitySlug: 'stitch-up-girl',
    pool: 'reaction',
    mood: 'generous',
    text: 'You won AND you are still in one piece! This is my favorite kind of victory.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'stitch-react-lowhealth-1',
    entitySlug: 'stitch-up-girl',
    pool: 'reaction',
    mood: 'annoyed',
    text: 'No. Absolutely not. You are not going anywhere until I fix this. Sit. DOWN.',
    weight: 20,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 20 }],
  },
];
