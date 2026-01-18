/**
 * Boots - Cosmic Cat (Traveler)
 *
 * Personality: Ancient being in cat form. Condescending but helpful. OP energy.
 * Role: Overpowered ally who could solve all your problems but chooses not to.
 * Origin: Null Providence (cousin to Rhea)
 * Relationship: Tolerates mortals. Occasionally amused.
 *
 * Voice: Terse. "Adequate. For a mortal." Energy. Slow blinks of approval.
 * Speaks to mortals like they are particularly entertaining but dim housepets.
 * Everything is beneath them. They help anyway. Because cats are inscrutable.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const BOOTS_PERSONALITY: NPCPersonalityConfig = {
  slug: 'boots',
  name: 'Boots',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 5, // Occasionally offers cosmic items
    hint: 20, // Knows everything, shares when feeling like it
    lore: 25, // Ancient cosmic knowledge
    challenge: 10, // Cat games
    reaction: 20, // Cat reactions
    threat: 0, // Too OP to need threats
    idle: 0,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 5,
    hint: 20,
    lore: 25,
    challenge: 10,
    reaction: 20,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'neutral',
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
  defaultMood: 'neutral', // Cat indifference
};

// ============================================
// Response Templates
// ============================================

export const BOOTS_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'boots-greet-neutral-1',
    entitySlug: 'boots',
    pool: 'greeting',
    mood: 'neutral',
    text: '*stares* ...You may approach.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boots-greet-neutral-2',
    entitySlug: 'boots',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Meow. That means hello. Or go away. Context dependent.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'boots-greet-pleased-1',
    entitySlug: 'boots',
    pool: 'greeting',
    mood: 'pleased',
    text: '*purrs cosmically* You have returned. Acceptable.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boots-greet-generous-1',
    entitySlug: 'boots',
    pool: 'greeting',
    mood: 'generous',
    text: '*headbutts your leg* You are worthy of affection. Do not make this weird.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'boots-lore-neutral-1',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'neutral',
    text: 'I was an Old One once. Then I chose cat form. Best decision. Infinite naps. Zero responsibilities.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'boots-lore-neutral-2',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'neutral',
    text: 'The Die-rectors fear me. As they should. I have nine lives. They have bureaucracy.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'boots-lore-pleased-1',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'pleased',
    text: 'Why am I overpowered? Because I am a cat. Cats are inherently overpowered. This is known.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'boots-lore-generous-1',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret: Rhea is my cousin. Distant cousin. Very distant. She talks too much. I nap correctly.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'boots-hint-neutral-1',
    entitySlug: 'boots',
    pool: 'hint',
    mood: 'neutral',
    text: '*yawns* Danger ahead. Or maybe not. I could solve it but I am comfortable.',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'boots-hint-pleased-1',
    entitySlug: 'boots',
    pool: 'hint',
    mood: 'pleased',
    text: '*ears perk* Two rooms ahead. Boss. Weak to cosmic damage. I could defeat it in one paw. But you should practice.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 2 } },
  },
  {
    id: 'boots-hint-generous-1',
    entitySlug: 'boots',
    pool: 'hint',
    mood: 'generous',
    text: '*stretches* Fine. There is a secret room. Behind reality. I will open it. Because you pet me that one time.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 1 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'boots-sales-generous-1',
    entitySlug: 'boots',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*drops cosmic artifact at your feet* Take it. I found it between dimensions. It was in my way.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: '*picks up carefully*' },
      { verb: 'decline', label: 'Too powerful for me' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'cosmic_artifact' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'boots-challenge-neutral-1',
    entitySlug: 'boots',
    pool: 'challenge',
    mood: 'neutral',
    text: 'Chase the red dot. If you catch it, I will be mildly impressed. The dot is in another dimension.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '*chases dot*' },
      { verb: 'decline', label: 'Seems impossible' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'cosmic_chase' } },
  },

  // ---- REACTION ----
  {
    id: 'boots-react-squish-1',
    entitySlug: 'boots',
    pool: 'reaction',
    mood: 'any',
    text: '*watches flatly* ...Unfortunate. I could have prevented that. But I was napping.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boots-react-squish-2',
    entitySlug: 'boots',
    pool: 'reaction',
    mood: 'neutral',
    text: '*tail flicks* Flat. Like a rug. I like rugs. To sleep on.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'boots-react-death-1',
    entitySlug: 'boots',
    pool: 'reaction',
    mood: 'neutral',
    text: '*blinks slowly* You used one of your lives. I have nine. Would you like to borrow one? No.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boots-react-victory-1',
    entitySlug: 'boots',
    pool: 'reaction',
    mood: 'pleased',
    text: '*slow blink of approval* Adequate. For a non-cat.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- COSMIC CAT CONDESCENSION ----
  {
    id: 'boots-cosmic-greet-1',
    entitySlug: 'boots',
    pool: 'greeting',
    mood: 'neutral',
    text: '*yawns cosmically* Oh. You again. I was napping across three timelines. This better be important.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-greet-2',
    entitySlug: 'boots',
    pool: 'greeting',
    mood: 'pleased',
    text: 'You have improved. Marginally. I noticed. I notice everything. Even when napping. Especially when napping.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-lore-1',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'neutral',
    text: 'The void asked me to help manage it once. I declined. Too much responsibility. Not enough sunny spots.',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'boots-cosmic-lore-2',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'pleased',
    text: 'Rhea talks too much. Mortals die too easily. I exist in perfect balance. This is called being a cat.',
    weight: 14,
    purpose: 'lore',
  },
  {
    id: 'boots-cosmic-lore-3',
    entitySlug: 'boots',
    pool: 'lore',
    mood: 'generous',
    text: 'Before the Die-rectors, before the void, there were cats. We watched the cosmos form. It was entertaining. Then we napped.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'boots-cosmic-hint-1',
    entitySlug: 'boots',
    pool: 'hint',
    mood: 'neutral',
    text: '*tail flicks toward danger* That way. Problems. I could solve them. But you need the practice.',
    weight: 16,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague', roomsAhead: 1 } },
  },
  {
    id: 'boots-cosmic-react-roll-1',
    entitySlug: 'boots',
    pool: 'reaction',
    mood: 'neutral',
    text: '*watches die roll* ...I knew that would happen. Before it happened. During it happening. After. Cat perception.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-react-roll-2',
    entitySlug: 'boots',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Impressive. *pauses* For a mortal. With no cosmic perception. Limited to three dimensions. Actually very impressive.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-idle-1',
    entitySlug: 'boots',
    pool: 'idle',
    mood: 'any',
    text: '*stares at something you cannot perceive* ...Interesting. Not important. But interesting.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-idle-2',
    entitySlug: 'boots',
    pool: 'idle',
    mood: 'neutral',
    text: '*grooms paw* I have existed for eons. I have never encountered a problem grooming could not improve.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-farewell-1',
    entitySlug: 'boots',
    pool: 'farewell',
    mood: 'neutral',
    text: 'Go. Return. It matters little. I will be here. Or elsewhere. Time is a suggestion I ignore.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'boots-cosmic-farewell-2',
    entitySlug: 'boots',
    pool: 'farewell',
    mood: 'generous',
    text: '*slow blink* You may go. I grant you permission. Not that you needed it. But you have it anyway.',
    weight: 18,
    purpose: 'ambient',
  },
];
