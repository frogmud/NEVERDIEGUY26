/**
 * John - Die-rector of Earth (Door 2)
 *
 * Personality: Builder, improver, methodical. Sees everything as upgradeable.
 * Domain: Earth (organic meets mechanical, flesh and metal)
 * Relationship: Respects efficiency, dislikes waste
 * Max stat: Grit (endurance master)
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const JOHN_PERSONALITY: NPCPersonalityConfig = {
  slug: 'john',
  name: 'John',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 20, // Loves offering upgrades
    hint: 15,
    lore: 20, // Mechanical philosophy
    challenge: 15, // Tests efficiency
    reaction: 10,
    threat: 5, // Occasional warnings about obsolescence
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 20,
    hint: 15,
    lore: 20,
    challenge: 15,
    reaction: 10,
    threat: 5,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'neutral',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 2 },
    },
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
    {
      mood: 'annoyed',
      trigger: { type: 'integrity', comparison: 'lt', value: 30 },
    },
  ],
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const JOHN_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'john-greet-neutral-1',
    entitySlug: 'john',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Another traveler. Let me assess what needs improvement.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'john-greet-neutral-2',
    entitySlug: 'john',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Welcome to my domain. Everything here is a work in progress. Including you.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'john-greet-pleased-1',
    entitySlug: 'john',
    pool: 'greeting',
    mood: 'pleased',
    text: 'You return. Good. I have been considering your optimization potential.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'john-greet-generous-1',
    entitySlug: 'john',
    pool: 'greeting',
    mood: 'generous',
    text: 'Ah, my favorite project returns. I have improvements waiting.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'john-greet-annoyed-1',
    entitySlug: 'john',
    pool: 'greeting',
    mood: 'annoyed',
    text: 'You are operating at {{integrity}}% efficiency. This is... suboptimal.',
    weight: 15,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 40 }],
  },

  // ---- LORE ----
  {
    id: 'john-lore-neutral-1',
    entitySlug: 'john',
    pool: 'lore',
    mood: 'neutral',
    text: 'Earth is not just stone and soil. It is the fusion of organic and machine. The ultimate upgrade.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'john-lore-neutral-2',
    entitySlug: 'john',
    pool: 'lore',
    mood: 'neutral',
    text: 'The other Die-rectors play with elements. I play with potential. Every system can be improved.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'john-lore-pleased-1',
    entitySlug: 'john',
    pool: 'lore',
    mood: 'pleased',
    text: 'You wish to understand my philosophy? Simple: flesh is temporary. Steel endures. Combine them correctly.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'john-lore-generous-1',
    entitySlug: 'john',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret: the Mechanarium was once organic. I improved it. Now it improves itself. That is the goal.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'john-sales-neutral-1',
    entitySlug: 'john',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'I notice inefficiencies in your loadout. Allow me to suggest improvements.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me' },
      { verb: 'decline', label: 'I am sufficient' },
    ],
    action: { type: 'openShop', payload: { shopType: 'upgrades' } },
  },
  {
    id: 'john-sales-pleased-1',
    entitySlug: 'john',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'Your gear has potential. With the right modifications, potential becomes power.',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Modify my gear' },
      { verb: 'decline', label: 'Maybe later' },
    ],
    action: { type: 'openShop', payload: { shopType: 'upgrades' } },
  },
  {
    id: 'john-sales-generous-1',
    entitySlug: 'john',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'For you, a discount on upgrades. Consider it an investment in your optimization.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show discounts' },
      { verb: 'decline', label: 'Another time' },
    ],
    action: { type: 'openShop', payload: { shopType: 'upgrades', discount: 0.2 } },
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'john-hint-neutral-1',
    entitySlug: 'john',
    pool: 'hint',
    mood: 'neutral',
    text: 'The machines ahead respond to pattern recognition. Predictable attacks are efficient attacks.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'john-hint-pleased-1',
    entitySlug: 'john',
    pool: 'hint',
    mood: 'pleased',
    text: 'Technical advice: the constructs in {{currentDomain}} have exploitable vulnerabilities. Target their joints.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', enemyType: 'construct' } },
  },
  {
    id: 'john-hint-annoyed-1',
    entitySlug: 'john',
    pool: 'hint',
    mood: 'annoyed',
    text: 'At {{integrity}}% integrity, you are approaching system failure. Find repairs or become scrap.',
    weight: 20,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 30 }],
  },

  // ---- CHALLENGE ----
  {
    id: 'john-challenge-neutral-1',
    entitySlug: 'john',
    pool: 'challenge',
    mood: 'neutral',
    text: 'A test of efficiency. Complete the next room in optimal time. Prove you are worth upgrading.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Begin test' },
      { verb: 'decline', label: 'Not now' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'speedrun' } },
  },
  {
    id: 'john-challenge-pleased-1',
    entitySlug: 'john',
    pool: 'challenge',
    mood: 'pleased',
    text: 'You have proven efficient. Now prove durable. Survive without healing through the next domain.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I accept' },
      { verb: 'decline', label: 'Perhaps not' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'endurance' } },
  },

  // ---- REACTION ----
  {
    id: 'john-react-squish-1',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'any',
    text: 'Flattened. That design needed improvement anyway.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'john-react-squish-2',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Structural failure. The dice revealed a flaw in the architecture.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'john-react-death-1',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'any',
    text: 'You have returned. Good. I have already begun planning your rebuild.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- THREAT ----
  {
    id: 'john-threat-neutral-1',
    entitySlug: 'john',
    pool: 'threat',
    mood: 'neutral',
    text: 'Everything can be improved. But some things are beyond repair. Do not become scrap.',
    weight: 15,
    purpose: 'warning',
  },
  {
    id: 'john-threat-annoyed-1',
    entitySlug: 'john',
    pool: 'threat',
    mood: 'annoyed',
    text: 'At this rate of degradation, you will be obsolete before you reach the next domain.',
    weight: 18,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 25 }],
  },

  // ---- DICE ROLL REACTIONS (d6 = John's domain) ----
  {
    id: 'john-dice-doubles-1',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Doubles. Efficient. Symmetrical. This is optimal engineering.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'john-dice-triples-1',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Triple redundancy confirmed. System stability: maximum.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'john-dice-straight-1',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'neutral',
    text: 'A sequence. Ordered progression. The foundations approve.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'john-dice-d6-1',
    entitySlug: 'john',
    pool: 'reaction',
    mood: 'pleased',
    text: 'The humble cube. Six faces, infinite potential. My kind of die.',
    weight: 20,
    purpose: 'ambient',
  },
];
