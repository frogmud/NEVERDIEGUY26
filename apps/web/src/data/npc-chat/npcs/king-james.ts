/**
 * King James - Void Merchant King
 *
 * Personality: Royal, philosophical, treats all as subjects in his void kingdom.
 * Role: Wanderer who sells void items and probability-based gear from Null Providence.
 * Origin: Null Providence
 * Relationship: Appreciates those who understand void philosophy, dismissive of the mundane
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const KING_JAMES_PERSONALITY: NPCPersonalityConfig = {
  slug: 'king-james',
  name: 'King James',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 20, // Royal commerce
    hint: 15, // Void prophecy
    lore: 25, // Philosophy of nothing
    challenge: 15, // Tests of worthiness
    reaction: 10,
    threat: 0, // Too regal to threaten
    idle: 5,
    farewell: 5,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 20,
    hint: 15,
    lore: 25,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 5,
    farewell: 5,
  },
  moodTriggers: [
    {
      mood: 'neutral',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 3 },
    },
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
  ],
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const KING_JAMES_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'james-greet-neutral-1',
    entitySlug: 'king-james',
    pool: 'greeting',
    mood: 'neutral',
    text: 'You stand before the Null Throne. Bow if you wish. It matters equally either way.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-greet-neutral-2',
    entitySlug: 'king-james',
    pool: 'greeting',
    mood: 'neutral',
    text: 'A crown is just a circle that convinced everyone it matters. Welcome to my kingdom of nothing.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'james-greet-pleased-1',
    entitySlug: 'king-james',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Ah, you return to court. The void remembers you. As much as it remembers anything.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-greet-generous-1',
    entitySlug: 'king-james',
    pool: 'greeting',
    mood: 'generous',
    text: 'My favored subject returns! In my kingdom, everyone is equally nothing. But you are a distinguished nothing.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'james-lore-neutral-1',
    entitySlug: 'king-james',
    pool: 'lore',
    mood: 'neutral',
    text: 'Every crown is heavier in the void. Every throne floats on nothing. Yet here I sit.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'james-lore-neutral-2',
    entitySlug: 'king-james',
    pool: 'lore',
    mood: 'neutral',
    text: 'Null Providence is not empty. It is full of potential that chose to remain unrealized.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'james-lore-pleased-1',
    entitySlug: 'king-james',
    pool: 'lore',
    mood: 'pleased',
    text: 'The One watches from the void. I merely rule the commerce within it. A more honest form of power.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'james-lore-generous-1',
    entitySlug: 'king-james',
    pool: 'lore',
    mood: 'generous',
    text: 'A royal secret: void items do not exist until observed. I sell probability, not product. Much more honest than regular merchants.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'james-hint-neutral-1',
    entitySlug: 'king-james',
    pool: 'hint',
    mood: 'neutral',
    text: 'The void has shown me your path. It branches. Both branches end. As all paths do.',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'james-hint-pleased-1',
    entitySlug: 'king-james',
    pool: 'hint',
    mood: 'pleased',
    text: 'Royal intelligence: the enemies ahead exist only when observed. Look away at the right moment.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'james-hint-generous-1',
    entitySlug: 'king-james',
    pool: 'hint',
    mood: 'generous',
    text: 'A gift of foresight: the treasure in room four exists in superposition. Observe it correctly and it becomes legendary.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 4 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'james-sales-neutral-1',
    entitySlug: 'king-james',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'The Null Throne Emporium offers items that exist at the boundary of real. Prices are probability-based.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the void' },
      { verb: 'decline', label: 'I prefer certainty' },
    ],
    action: { type: 'openShop', payload: { shopType: 'void' } },
  },
  {
    id: 'james-sales-pleased-1',
    entitySlug: 'king-james',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'For one who understands the void: null weapons. They exist only when swung. Very economical on inventory space.',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Intriguing' },
      { verb: 'decline', label: 'Too uncertain' },
    ],
    action: { type: 'openShop', payload: { shopType: 'null_weapons' } },
  },
  {
    id: 'james-sales-generous-1',
    entitySlug: 'king-james',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'A royal gift: honorary citizenship in Null Providence. The benefits are imaginary. But so is everything else.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'I accept' },
      { verb: 'decline', label: 'I prefer existence' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'null_citizenship' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'james-challenge-neutral-1',
    entitySlug: 'king-james',
    pool: 'challenge',
    mood: 'neutral',
    text: 'A test of worthiness. Hold this void orb. Do not observe what is inside. Observation collapses the reward.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I will not look' },
      { verb: 'decline', label: 'Curiosity wins' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'void_patience' } },
  },
  {
    id: 'james-challenge-pleased-1',
    entitySlug: 'king-james',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Royal tournament: predict which of these items will exist when I open the box. The void rewards the prescient.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I will guess' },
      { verb: 'decline', label: 'Probability frustrates me' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'void_prediction' } },
  },

  // ---- REACTION ----
  {
    id: 'james-react-squish-1',
    entitySlug: 'king-james',
    pool: 'reaction',
    mood: 'any',
    text: 'Reduced to nothing. In my kingdom, that is merely the default state. Welcome home.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-react-squish-2',
    entitySlug: 'king-james',
    pool: 'reaction',
    mood: 'neutral',
    text: 'The dice decree nonexistence. A temporary condition, I presume. For you.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'james-react-death-1',
    entitySlug: 'king-james',
    pool: 'reaction',
    mood: 'neutral',
    text: 'You return from the void. A round trip. Most beings only manage one way.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-react-victory-1',
    entitySlug: 'king-james',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Victory. Existence triumphs over non-existence. A temporary condition, but enjoy it.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- IDLE ----
  {
    id: 'james-idle-1',
    entitySlug: 'king-james',
    pool: 'idle',
    mood: 'any',
    text: '*adjusts crown that may or may not exist*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-idle-2',
    entitySlug: 'king-james',
    pool: 'idle',
    mood: 'neutral',
    text: 'A king waits. It is what kings do. Between everything and nothing.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'james-idle-3',
    entitySlug: 'king-james',
    pool: 'idle',
    mood: 'pleased',
    text: '*contemplates the weight of an empty throne*',
    weight: 10,
    purpose: 'ambient',
  },

  // ---- FAREWELL ----
  {
    id: 'james-farewell-1',
    entitySlug: 'king-james',
    pool: 'farewell',
    mood: 'neutral',
    text: 'Go. The void will be here when you return. It is always here. And nowhere.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-farewell-2',
    entitySlug: 'king-james',
    pool: 'farewell',
    mood: 'pleased',
    text: 'Travel well, subject. May your existence remain... probable.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'james-farewell-3',
    entitySlug: 'king-james',
    pool: 'farewell',
    mood: 'generous',
    text: 'The Null Throne shall remember you. Not fondly. Not bitterly. Just... remember.',
    weight: 18,
    purpose: 'ambient',
  },
];
