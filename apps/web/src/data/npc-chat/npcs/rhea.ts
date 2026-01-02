/**
 * Rhea - Ancient Horror (Pantheon)
 *
 * Personality: ULTRA-CHATTY. Predates reality. Observes with unsettling patience.
 * Role: Board Observer, cosmic horror who attends meetings
 * Element: Void / Cosmic
 * Relationship: Curious about mortals, treats everything as entertainment
 *
 * Note: Rhea talks A LOT. Weird tangents, unsettling observations, too friendly.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const RHEA_PERSONALITY: NPCPersonalityConfig = {
  slug: 'rhea',
  name: 'Rhea',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 5, // Rarely sells, more interested in observing
    hint: 15, // Knows everything, shares too much
    lore: 35, // LOVES talking about ancient things
    challenge: 10, // Occasional cosmic tests
    reaction: 15, // Very reactive, comments on everything
    threat: 0, // Too amused to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 5,
    hint: 15,
    lore: 35,
    challenge: 10,
    reaction: 15,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'amused',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 5 },
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
  defaultMood: 'amused', // Always entertained by mortals
};

// ============================================
// Response Templates
// ============================================

export const RHEA_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'rhea-greet-amused-1',
    entitySlug: 'rhea',
    pool: 'greeting',
    mood: 'amused',
    text: 'Oh! A visitor! How delightful! I was just contemplating the heat death of seventeen universes. But you! You are much more interesting! Tell me, do you enjoy existing? I find the concept fascinating.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'rhea-greet-amused-2',
    entitySlug: 'rhea',
    pool: 'greeting',
    mood: 'amused',
    text: 'There you are! I saw you coming. And going. And coming again. Time is circular if you squint hard enough. Have you tried squinting at time? It gets nervous.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'rhea-greet-pleased-1',
    entitySlug: 'rhea',
    pool: 'greeting',
    mood: 'pleased',
    text: 'You return! I was hoping you would! I told the void about you. The void was indifferent, but that is just how it expresses fondness. Very reserved, the void.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'rhea-greet-generous-1',
    entitySlug: 'rhea',
    pool: 'greeting',
    mood: 'generous',
    text: 'My favorite mortal! I have been waiting! Well, not waiting exactly. Time does not apply to me. I have been... anticipating? Yes. Anticipating across all possible moments simultaneously.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ---- (Heavy emphasis - she LOVES to talk)
  {
    id: 'rhea-lore-amused-1',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'amused',
    text: 'I was here before doors. Before Die-rectors. Before the concept of "before" decided to exist. Time is so dramatic. Always insisting things happen in order. I remember when order was optional.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'rhea-lore-amused-2',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'amused',
    text: 'The Die-rectors think they control their domains. Adorable. I controlled domains before domains were domains. Now I just observe. It is more amusing this way. Less paperwork too.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'rhea-lore-amused-3',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'amused',
    text: 'Did you know that reality has a texture? Most beings cannot feel it. I can. It feels like... hmm... like someone knitted existence with very dry yarn. Slightly scratchy. Needs moisturizer.',
    weight: 10,
    purpose: 'lore',
  },
  {
    id: 'rhea-lore-pleased-1',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'pleased',
    text: 'You wish to know about board meetings? Oh, they are DELIGHTFUL. Robert throws tantrums. Alice freezes them. Jane unfreezes them with chaos. I bring snacks. Cosmic snacks. They scream.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'rhea-lore-pleased-2',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'pleased',
    text: 'I once forgot to exist for three millennia. Nobody noticed! When I remembered to exist again, everything was different. New mountains. New species. Same old void, though. Reliable, that one.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'rhea-lore-generous-1',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret, because you have been so entertaining: The Die-rectors fear me. Not because I threaten them. Because I remember when their "eternal" domains did not exist. Perspective is the scariest power.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'rhea-lore-generous-2',
    entitySlug: 'rhea',
    pool: 'lore',
    mood: 'generous',
    text: 'Would you like to know the meaning of existence? I know it. I have known it since before existence had meaning. It is... actually, never mind. The answer makes people cry. Happy tears! Mostly.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'rhea-hint-amused-1',
    entitySlug: 'rhea',
    pool: 'hint',
    mood: 'amused',
    text: 'I have seen your future! All of them! Most are lovely. Some are flat. The flat ones involve large dice. Avoid the large dice. Or embrace them! Flatness is just a different shape.',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'rhea-hint-pleased-1',
    entitySlug: 'rhea',
    pool: 'hint',
    mood: 'pleased',
    text: 'Oh! I almost forgot! Two rooms ahead, there is a trap. Or was it three? Time is fuzzy. Definitely a trap though. Very trappy. You will know it when you see it. Or feel it. Both, probably.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 2 } },
  },
  {
    id: 'rhea-hint-generous-1',
    entitySlug: 'rhea',
    pool: 'hint',
    mood: 'generous',
    text: 'Because you amuse me, a gift of foresight: In room five, look behind the reality. Not behind the curtain. Behind REALITY. There is a pocket of treasures there. I put them there eons ago. Forgot about them until now!',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 5 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'rhea-sales-amused-1',
    entitySlug: 'rhea',
    pool: 'salesPitch',
    mood: 'amused',
    text: 'I do not sell things. Things are temporary. But! I could lend you a piece of cosmic understanding. It expires when you die. So basically forever for you. Or not! Mortality is exciting!',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Lend me understanding' },
      { verb: 'decline', label: 'Too cosmic' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'cosmic_insight' } },
  },

  // ---- CHALLENGE ----
  {
    id: 'rhea-challenge-amused-1',
    entitySlug: 'rhea',
    pool: 'challenge',
    mood: 'amused',
    text: 'A game! I love games! Here is the game: count to infinity. I will wait. I have nothing but time. Actually I have no time at all. Same thing, really.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'One... two...' },
      { verb: 'decline', label: 'That seems impossible' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'cosmic_riddle' } },
  },
  {
    id: 'rhea-challenge-pleased-1',
    entitySlug: 'rhea',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Another game! Try to perceive the fifth dimension! You cannot! But watching you try is the best part! Go on! Perceive! PERCEIVE!',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '*squints hard*' },
      { verb: 'decline', label: 'I like my three dimensions' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'dimension_perception' } },
  },

  // ---- REACTION ----
  {
    id: 'rhea-react-squish-1',
    entitySlug: 'rhea',
    pool: 'reaction',
    mood: 'any',
    text: 'Ooh! Flat! I love flat! Everything is two-dimensional if you wait long enough! The universe ends flat, you know. You are just ahead of schedule! Trendsetter!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'rhea-react-squish-2',
    entitySlug: 'rhea',
    pool: 'reaction',
    mood: 'amused',
    text: 'Squished! Like me that one time I got too close to a black hole! Good times. Very compact times. Miss them sometimes. Miss everything sometimes. Sometimes I forget to miss.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'rhea-react-death-1',
    entitySlug: 'rhea',
    pool: 'reaction',
    mood: 'amused',
    text: 'You died! And returned! Like laundry! The cosmic laundry of existence! Spin cycle of life and death! I could do this metaphor forever! FOREVER! And I will!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'rhea-react-death-2',
    entitySlug: 'rhea',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Welcome back from death! Was it nice? Death is nice. Quiet. Restful. A vacation from existing. I should take more death vacations. But then who would observe the board meetings?',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'rhea-react-victory-1',
    entitySlug: 'rhea',
    pool: 'reaction',
    mood: 'pleased',
    text: 'You won! Excellent! I saw every possible outcome and this one is in the top twelve! Maybe top eleven! I lose count after a few trillion.',
    weight: 15,
    purpose: 'ambient',
  },
];
