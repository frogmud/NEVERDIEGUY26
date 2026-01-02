/**
 * Mr. Bones - Wandering Skeleton Traveler
 *
 * Personality: Mysterious, philosophical, has seen much.
 * Role: Wanderer who shares wisdom and occasionally odd requests.
 * Relationship: Respects curiosity, rewards those who listen.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const MR_BONES_PERSONALITY: NPCPersonalityConfig = {
  slug: 'mr-bones',
  name: 'Mr. Bones',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 5, // Rarely sells, trades instead
    hint: 25, // Often hints
    lore: 30, // Loves sharing stories
    challenge: 15, // Philosophical challenges
    reaction: 10,
    threat: 0, // Never threatens
    idle: 5,
  },
  poolWeights: {
    greeting: 10,
    salesPitch: 5,
    hint: 25,
    lore: 30,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 5,
  },
  moodTriggers: [
    {
      mood: 'cryptic',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 3 },
    },
    {
      mood: 'amused',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 3 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 6 },
    },
  ],
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const MR_BONES_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'mr-bones-greet-neutral-1',
    entitySlug: 'mr-bones',
    pool: 'greeting',
    mood: 'neutral',
    text: "Ah. Another traveler on the endless road. Care to rest your bones? I certainly can't rest mine.",
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'mr-bones-greet-cryptic-1',
    entitySlug: 'mr-bones',
    pool: 'greeting',
    mood: 'cryptic',
    text: "We've met before. Or will meet. Time is strange for those of us without flesh to anchor it.",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'mr-bones-greet-amused-1',
    entitySlug: 'mr-bones',
    pool: 'greeting',
    mood: 'amused',
    text: "{{playerName}}! Still alive, I see. Well, mostly. I can see your integrity from here.",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'mr-bones-greet-generous-1',
    entitySlug: 'mr-bones',
    pool: 'greeting',
    mood: 'generous',
    text: "My friend! I was hoping our paths would cross again. I have something to show you.",
    weight: 18,
    purpose: 'lore',
  },

  // ---- LORE ----
  {
    id: 'mr-bones-lore-neutral-1',
    entitySlug: 'mr-bones',
    pool: 'lore',
    mood: 'neutral',
    text: "I have wandered every domain. Earth crumbles. Fire burns. Ice endures. But only the void truly remembers.",
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'mr-bones-lore-cryptic-1',
    entitySlug: 'mr-bones',
    pool: 'lore',
    mood: 'cryptic',
    text: "The Die-rectors play their games. We wanderers are the pieces they've forgotten. Sometimes that's power.",
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'mr-bones-lore-amused-1',
    entitySlug: 'mr-bones',
    pool: 'lore',
    mood: 'amused',
    text: "Want to know a secret? I wasn't always bones. Once I was... well, I forget. But I had nice hair. Probably.",
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'mr-bones-lore-generous-1',
    entitySlug: 'mr-bones',
    pool: 'lore',
    mood: 'generous',
    text: "The truth about {{currentDomain}}? {{directorName}} built it from memory. Not theirs. Someone else's. Someone forgotten.",
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINT ----
  {
    id: 'mr-bones-hint-neutral-1',
    entitySlug: 'mr-bones',
    pool: 'hint',
    mood: 'neutral',
    text: "The path ahead splits. Both lead forward. Neither leads back. Choose the one that feels wrong.",
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'cryptic' } },
  },
  {
    id: 'mr-bones-hint-cryptic-1',
    entitySlug: 'mr-bones',
    pool: 'hint',
    mood: 'cryptic',
    text: "Your lucky number is {{luckyNumber}}. Remember it in the third room. Or don't. Free will and all that.",
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'cryptic', roomsAhead: 3 } },
  },
  {
    id: 'mr-bones-hint-amused-1',
    entitySlug: 'mr-bones',
    pool: 'hint',
    mood: 'amused',
    text: "{{hazard}} awaits ahead. But you knew that. I can tell by the way you're not screaming yet.",
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'direct', roomsAhead: 1 } },
  },
  {
    id: 'mr-bones-hint-generous-1',
    entitySlug: 'mr-bones',
    pool: 'hint',
    mood: 'generous',
    text: "A gift: the boss of this domain fears one thing. Persistence. Die twice, return stronger. They hate that.",
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', type: 'boss_weakness' } },
    cooldown: { onceEver: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'mr-bones-challenge-cryptic-1',
    entitySlug: 'mr-bones',
    pool: 'challenge',
    mood: 'cryptic',
    text: "Answer me this: what walks on four legs at dawn, two at noon, and three at dusk? ...No, really, I forgot. Do you know?",
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'answer', label: 'A human' },
      { verb: 'answer', label: 'A skeleton' },
      { verb: 'ask', label: "Aren't you supposed to know?" },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'riddle' } },
  },
  {
    id: 'mr-bones-challenge-amused-1',
    entitySlug: 'mr-bones',
    pool: 'challenge',
    mood: 'amused',
    text: "A wager! Not for gold. For stories. Tell me something interesting, and I'll share something useful.",
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I have a story' },
      { verb: 'decline', label: 'Nothing comes to mind' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'story_exchange', reward: 'hint' } },
  },

  // ---- SALES PITCH ----
  {
    id: 'mr-bones-sales-neutral-1',
    entitySlug: 'mr-bones',
    pool: 'salesPitch',
    mood: 'neutral',
    text: "I don't sell. I trade. Got anything interesting? A memory, perhaps? No? Gold works too, I suppose.",
    weight: 10,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'What do you have?' },
      { verb: 'offer', label: 'I have memories' },
    ],
  },
  {
    id: 'mr-bones-sales-generous-1',
    entitySlug: 'mr-bones',
    pool: 'salesPitch',
    mood: 'generous',
    text: "For you, old friend, I'll part with something special. No trade required. Consider it... an investment in your future.",
    weight: 15,
    purpose: 'reward',
    action: { type: 'grantItem', payload: { type: 'random_useful' } },
    cooldown: { oncePerRun: true },
  },

  // ---- REACTION ----
  {
    id: 'mr-bones-react-death-1',
    entitySlug: 'mr-bones',
    pool: 'reaction',
    mood: 'neutral',
    text: "Death again? Welcome to the club. Meetings are whenever. Dress code is... flexible.",
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'mr-bones-react-victory-1',
    entitySlug: 'mr-bones',
    pool: 'reaction',
    mood: 'amused',
    text: "You survived. I knew you would. No, that's a lie. I hoped. Which is better, really.",
    weight: 15,
    purpose: 'ambient',
  },

  // ---- IDLE ----
  {
    id: 'mr-bones-idle-1',
    entitySlug: 'mr-bones',
    pool: 'idle',
    mood: 'any',
    text: "*stares into the middle distance, seeing something you can't*",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'mr-bones-idle-2',
    entitySlug: 'mr-bones',
    pool: 'idle',
    mood: 'cryptic',
    text: "The wind speaks. I don't always listen. Should I?",
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'mr-bones-idle-3',
    entitySlug: 'mr-bones',
    pool: 'idle',
    mood: 'amused',
    text: "*counts ribs* Still got 'em all. Good day.",
    weight: 8,
    purpose: 'ambient',
  },
];
