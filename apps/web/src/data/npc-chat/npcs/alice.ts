/**
 * Alice - Die-rector of Frost Reach (Door 5)
 *
 * Personality: Time controller, cold, patient, treats time as suggestion.
 * Domain: Frost Reach (time freezes into crystalline permanence)
 * Relationship: Appreciates patience, dislikes rushed decisions
 * Max stat: Resilience (frozen endurance, stability)
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const ALICE_PERSONALITY: NPCPersonalityConfig = {
  slug: 'alice',
  name: 'Alice',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 10, // Occasionally offers time-related deals
    hint: 25, // Knows what's coming (time sight)
    lore: 25, // Time philosophy
    challenge: 15, // Patience tests
    reaction: 10,
    threat: 0, // Never threatens, just observes
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 10,
    hint: 25,
    lore: 25,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'cryptic',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 2 },
    },
    {
      mood: 'neutral',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 2 },
    },
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 5 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 8 },
    },
  ],
  defaultMood: 'cryptic',
};

// ============================================
// Response Templates
// ============================================

export const ALICE_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'alice-greet-cryptic-1',
    entitySlug: 'alice',
    pool: 'greeting',
    mood: 'cryptic',
    text: 'You arrive. You arrived. You will arrive. All at once.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'alice-greet-cryptic-2',
    entitySlug: 'alice',
    pool: 'greeting',
    mood: 'cryptic',
    text: 'Time is a river. I am the dam. You are... a very small fish.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'alice-greet-neutral-1',
    entitySlug: 'alice',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Welcome to Frost Reach. Here, patience is rewarded. Haste is punished.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'alice-greet-pleased-1',
    entitySlug: 'alice',
    pool: 'greeting',
    mood: 'pleased',
    text: 'You return when I knew you would. Precisely on schedule. My schedule.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'alice-greet-generous-1',
    entitySlug: 'alice',
    pool: 'greeting',
    mood: 'generous',
    text: 'Ah, a familiar thread in the tapestry of time. I have been expecting you. For centuries.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'alice-lore-cryptic-1',
    entitySlug: 'alice',
    pool: 'lore',
    mood: 'cryptic',
    text: 'Yesterday, tomorrow, now. These are words for those who experience time linearly. How quaint.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'alice-lore-cryptic-2',
    entitySlug: 'alice',
    pool: 'lore',
    mood: 'cryptic',
    text: 'Frost Reach is not cold. It is preserved. Every moment frozen in perfect crystalline permanence.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'alice-lore-neutral-1',
    entitySlug: 'alice',
    pool: 'lore',
    mood: 'neutral',
    text: 'The other Die-rectors mark their domains with elements. I mark mine with moments. Far more valuable.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'alice-lore-pleased-1',
    entitySlug: 'alice',
    pool: 'lore',
    mood: 'pleased',
    text: 'You wish to understand time? Consider: you have already died. You have already won. Both are true.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'alice-lore-generous-1',
    entitySlug: 'alice',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret from beyond the ice: time does not flow. It pools. And I control the drain.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'alice-hint-cryptic-1',
    entitySlug: 'alice',
    pool: 'hint',
    mood: 'cryptic',
    text: 'The path ahead... I have seen it many times. Some versions of you survive.',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'alice-hint-neutral-1',
    entitySlug: 'alice',
    pool: 'hint',
    mood: 'neutral',
    text: 'In {{roomsAhead}} rooms, you will face a choice. The patient choice succeeds. The hasty choice... does not.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 2 } },
  },
  {
    id: 'alice-hint-pleased-1',
    entitySlug: 'alice',
    pool: 'hint',
    mood: 'pleased',
    text: 'I will share what I have seen: the frozen guardians ahead are weak to sustained pressure. Do not rush.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', enemyType: 'frozen' } },
  },
  {
    id: 'alice-hint-generous-1',
    entitySlug: 'alice',
    pool: 'hint',
    mood: 'generous',
    text: 'Because you have proven patient, I will show you: the secret path opens three chambers ahead. Wait for the ice to crack.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'alice-sales-neutral-1',
    entitySlug: 'alice',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'I offer time, in crystal form. Buy now, use later. Or use now. Time is flexible here.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me' },
      { verb: 'decline', label: 'Time is money' },
    ],
    action: { type: 'openShop', payload: { shopType: 'temporal' } },
  },
  {
    id: 'alice-sales-generous-1',
    entitySlug: 'alice',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'For one who respects time, I offer a rare gift: a moment frozen, to use when you need it most.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Accept the gift' },
      { verb: 'decline', label: 'Time is precious' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'temporal_crystal' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'alice-challenge-neutral-1',
    entitySlug: 'alice',
    pool: 'challenge',
    mood: 'neutral',
    text: 'A test of patience. Stand still. Let time flow around you. Those who move, lose.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I can wait' },
      { verb: 'decline', label: 'Time presses' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'patience' } },
  },
  {
    id: 'alice-challenge-pleased-1',
    entitySlug: 'alice',
    pool: 'challenge',
    mood: 'pleased',
    text: 'You have learned patience. Now learn timing. Strike the frozen moment exactly when I say.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Begin' },
      { verb: 'decline', label: 'Another time' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'timing' } },
  },

  // ---- REACTION ----
  {
    id: 'alice-react-squish-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'any',
    text: 'Frozen in time. Forever flat. There is a poetry to it.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'alice-react-squish-2',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'The dice fall. Time stops. Then continues without them. As it always does.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'alice-react-death-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'neutral',
    text: 'You return. I saw this. I saw all of this. It was already written in ice.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'alice-react-victory-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'pleased',
    text: 'A successful timeline. One of many. But you do not need to know about the others.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- DICE ROLL REACTIONS (d12 = Alice's domain) ----
  {
    id: 'alice-dice-doubles-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'Twins across timelines. I have seen this moment before. Many times.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'alice-dice-triples-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Triple alignment. Time crystallizes around such moments. Savor it.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'alice-dice-straight-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'neutral',
    text: 'A sequence unfolds. Time approves of order. This once.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'alice-dice-d12-1',
    entitySlug: 'alice',
    pool: 'reaction',
    mood: 'pleased',
    text: 'The dodecahedron. Twelve faces like twelve hours. Time bends to your throw.',
    weight: 20,
    purpose: 'ambient',
  },
];
