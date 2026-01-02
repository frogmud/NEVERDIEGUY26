/**
 * Detective Clausen - Noir Detective (Traveler)
 *
 * Personality: Noir, cynical, infernal, drinks too much.
 * Role: Detective ally, investigator
 * Origin: Infernus
 * Relationship: Gruff but helpful, respects fellow survivors
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const CLAUSEN_PERSONALITY: NPCPersonalityConfig = {
  slug: 'clausen',
  name: 'Detective Clausen',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 10, // Occasionally offers noir gear
    hint: 30, // Detective gives good intel
    lore: 20, // Noir stories
    challenge: 10, // Investigation challenges
    reaction: 15,
    threat: 0, // Ally
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 10,
    hint: 30,
    lore: 20,
    challenge: 10,
    reaction: 15,
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
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
  ],
  defaultMood: 'neutral', // Cynical default
};

// ============================================
// Response Templates
// ============================================

export const CLAUSEN_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'clausen-greet-neutral-1',
    entitySlug: 'clausen',
    pool: 'greeting',
    mood: 'neutral',
    text: '*lights cigarette* Another case. Another domain. Same old chaos.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'clausen-greet-neutral-2',
    entitySlug: 'clausen',
    pool: 'greeting',
    mood: 'neutral',
    text: 'You look like trouble. Good. I specialize in trouble.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'clausen-greet-pleased-1',
    entitySlug: 'clausen',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Back again. Starting to think you actually know what you are doing. Rare quality around here.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'clausen-greet-generous-1',
    entitySlug: 'clausen',
    pool: 'greeting',
    mood: 'generous',
    text: '*nods* Partner. Good to see you. And I do not say that to many people. Or any people.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'clausen-lore-neutral-1',
    entitySlug: 'clausen',
    pool: 'lore',
    mood: 'neutral',
    text: 'Infernus taught me one thing: everything burns. Cases. Evidence. Relationships. Might as well drink.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'clausen-lore-neutral-2',
    entitySlug: 'clausen',
    pool: 'lore',
    mood: 'neutral',
    text: 'These red eyes? Infernal contract. See better in the dark. Side effect: everything looks like a crime scene.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'clausen-lore-pleased-1',
    entitySlug: 'clausen',
    pool: 'lore',
    mood: 'pleased',
    text: 'I have solved cases in every domain. The pattern is always the same: follow the money. Or the fire. Usually both.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'clausen-lore-generous-1',
    entitySlug: 'clausen',
    pool: 'lore',
    mood: 'generous',
    text: 'Confidential: Robert and I have history. He owes me a favor. Big one. Do not tell him I told you.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'clausen-hint-neutral-1',
    entitySlug: 'clausen',
    pool: 'hint',
    mood: 'neutral',
    text: '*examines ground* Tracks ahead. Multiple hostiles. They do not know you are coming. Use that.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'clausen-hint-pleased-1',
    entitySlug: 'clausen',
    pool: 'hint',
    mood: 'pleased',
    text: 'Did some digging. Boss two rooms ahead has a weakness: fire. Ironic, given the domain. Exploit it.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 2 } },
  },
  {
    id: 'clausen-hint-generous-1',
    entitySlug: 'clausen',
    pool: 'hint',
    mood: 'generous',
    text: 'Investigated ahead. Found a hidden stash. Room four, behind the loose panel. Consider it a professional courtesy.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 4 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'clausen-sales-neutral-1',
    entitySlug: 'clausen',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'Got some gear. Confiscated from a case. Evidence locker is... flexible.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'What do you have?' },
      { verb: 'decline', label: 'I am good' },
    ],
    action: { type: 'openShop', payload: { shopType: 'detective' } },
  },
  {
    id: 'clausen-sales-generous-1',
    entitySlug: 'clausen',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands over flask* Take this. Infernal whiskey. Heals what ails you. Most things anyway.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Thanks, detective' },
      { verb: 'decline', label: 'I do not drink' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'infernal_flask' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'clausen-challenge-neutral-1',
    entitySlug: 'clausen',
    pool: 'challenge',
    mood: 'neutral',
    text: 'Investigation challenge. Find the hidden enemy before it finds you. Detective instincts required.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I will find them' },
      { verb: 'decline', label: 'Not my specialty' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'investigation' } },
  },

  // ---- REACTION ----
  {
    id: 'clausen-react-squish-1',
    entitySlug: 'clausen',
    pool: 'reaction',
    mood: 'any',
    text: '*takes long drag* ...Seen worse. Not much worse. But worse.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'clausen-react-death-1',
    entitySlug: 'clausen',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Back from the dead. Welcome to the club. Membership is mandatory around here.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'clausen-react-victory-1',
    entitySlug: 'clausen',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Case closed. *raises flask* To surviving another one.',
    weight: 15,
    purpose: 'ambient',
  },
];
