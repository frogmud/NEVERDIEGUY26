/**
 * Willy - Wandering Skeleton Merchant
 *
 * Personality: Cheerful, helpful, loves good deals (for the player).
 * Role: Wanderer who appears in various domains with useful items.
 * Relationship: Friendly to all, extra helpful to repeat customers.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const WILLY_PERSONALITY: NPCPersonalityConfig = {
  slug: 'willy',
  name: 'Willy',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 30,
    hint: 20, // Actually helpful
    lore: 5,
    challenge: 5, // Rarely challenges, more supportive
    reaction: 15,
    threat: 0, // Never threatens
    idle: 5,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 30,
    hint: 20,
    lore: 5,
    challenge: 5,
    reaction: 15,
    threat: 0,
    idle: 5,
  },
  moodTriggers: [
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 2 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 5 },
    },
  ],
  defaultMood: 'pleased', // Always happy to see you
};

// ============================================
// Response Templates
// ============================================

export const WILLY_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'willy-greet-pleased-1',
    entitySlug: 'willy',
    pool: 'greeting',
    mood: 'pleased',
    text: "Oh! A customer! I mean, a friend! I mean, a customer-friend! Welcome, welcome!",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'willy-greet-pleased-2',
    entitySlug: 'willy',
    pool: 'greeting',
    mood: 'pleased',
    text: "{{playerName}}! My favorite person in {{currentDomain}}! Well, only person I've seen today, but still!",
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'willy-greet-generous-1',
    entitySlug: 'willy',
    pool: 'greeting',
    mood: 'generous',
    text: "There you are! I was hoping you'd come by! Got something special tucked away just for you.",
    weight: 18,
    purpose: 'shop',
    action: { type: 'openShop', payload: { showSpecialItems: true } },
  },
  {
    id: 'willy-greet-neutral-1',
    entitySlug: 'willy',
    pool: 'greeting',
    mood: 'neutral',
    text: "Hello there, traveler! Don't mind the bones, they're all mine. Friendly merchant, at your service!",
    weight: 10,
    purpose: 'ambient',
    cooldown: { onceEver: true }, // First meeting only
  },

  // ---- SALES PITCH ----
  {
    id: 'willy-sales-pleased-1',
    entitySlug: 'willy',
    pool: 'salesPitch',
    mood: 'pleased',
    text: "I've got potions, charms, and one slightly cursed sock! The curse is very minor, I promise!",
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me everything' },
      { verb: 'ask', label: 'About that sock...' },
    ],
    action: { type: 'openShop' },
  },
  {
    id: 'willy-sales-pleased-2',
    entitySlug: 'willy',
    pool: 'salesPitch',
    mood: 'pleased',
    text: "You've got {{gold}} gold! I've got items that cost less than that! It's meant to be!",
    weight: 12,
    purpose: 'shop',
    action: { type: 'openShop' },
  },
  {
    id: 'willy-sales-generous-1',
    entitySlug: 'willy',
    pool: 'salesPitch',
    mood: 'generous',
    text: "For my favorite customer? Everything's discounted! Well, almost everything. The sock stays full price.",
    weight: 18,
    purpose: 'shop',
    action: { type: 'openShop', payload: { discount: 15 } },
  },

  // ---- HINT ----
  {
    id: 'willy-hint-pleased-1',
    entitySlug: 'willy',
    pool: 'hint',
    mood: 'pleased',
    text: "Oh! Before you go! That room up ahead? I heard {{hazard}} is acting up. Might want to be careful!",
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'direct', roomsAhead: 1 } },
  },
  {
    id: 'willy-hint-generous-1',
    entitySlug: 'willy',
    pool: 'hint',
    mood: 'generous',
    text: "Secret merchant tip: there's a hidden path two rooms ahead. Look for the loose brick. You didn't hear it from me!",
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 2, type: 'hidden_path' } },
    cooldown: { rooms: 10 },
  },
  {
    id: 'willy-hint-neutral-1',
    entitySlug: 'willy',
    pool: 'hint',
    mood: 'neutral',
    text: "Your integrity is at {{integrity}}. That's... um... is that good? I never know with you living types.",
    weight: 10,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'willy-lore-pleased-1',
    entitySlug: 'willy',
    pool: 'lore',
    mood: 'pleased',
    text: "Being a skeleton merchant isn't so bad! No need to eat, sleep, or worry about health insurance!",
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'willy-lore-neutral-1',
    entitySlug: 'willy',
    pool: 'lore',
    mood: 'neutral',
    text: "I used to be alive, you know. Don't remember much about it. But I remember I loved deals! Some things never change.",
    weight: 10,
    purpose: 'lore',
  },

  // ---- REACTION ----
  {
    id: 'willy-react-purchase-1',
    entitySlug: 'willy',
    pool: 'reaction',
    mood: 'pleased',
    text: "Thank you, thank you! May your pockets stay full and your enemies stay dead! Unlike me! Ha!",
    weight: 15,
    purpose: 'ambient',
    action: { type: 'adjustRelationship', payload: { respect: 2, familiarity: 1 } },
  },
  {
    id: 'willy-react-death-1',
    entitySlug: 'willy',
    pool: 'reaction',
    mood: 'pleased',
    text: "Back again! Death is just a temporary setback, am I right? I should know!",
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'willy-react-lowhealth-1',
    entitySlug: 'willy',
    pool: 'reaction',
    mood: 'pleased',
    text: "Oh my, you look rough! Here, take this health potion. First one's free! ...Okay, half price. ...Fine, 10% off!",
    weight: 15,
    purpose: 'shop',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 30 }],
    quickReplies: [
      { verb: 'accept', label: 'Thanks, Willy' },
      { verb: 'decline', label: "I'll manage" },
    ],
    action: { type: 'offerDeal', payload: { item: 'health_potion', discount: 10 } },
  },

  // ---- CHALLENGE ----
  {
    id: 'willy-challenge-amused-1',
    entitySlug: 'willy',
    pool: 'challenge',
    mood: 'amused',
    text: "Want to play a guessing game? Guess how many bones I have! Winner gets a discount!",
    weight: 10,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'answer', label: '206' },
      { verb: 'answer', label: '207' },
      { verb: 'answer', label: "Lost count?" },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'trivia', reward: 'discount' } },
  },

  // ---- IDLE ----
  {
    id: 'willy-idle-1',
    entitySlug: 'willy',
    pool: 'idle',
    mood: 'any',
    text: "*rattles contentedly*",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'willy-idle-2',
    entitySlug: 'willy',
    pool: 'idle',
    mood: 'pleased',
    text: "*polishes a slightly cursed sock*",
    weight: 10,
    purpose: 'ambient',
  },
];
