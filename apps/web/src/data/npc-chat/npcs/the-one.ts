/**
 * The One - Die-rector of Null Providence
 *
 * Personality: Cryptic, all-knowing, speaks in riddles about the void.
 * Domain: Null Providence (nothingness, existential themes)
 * Relationship: Starts neutral, respects persistence over flattery
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const THE_ONE_PERSONALITY: NPCPersonalityConfig = {
  slug: 'the-one',
  name: 'The One',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 5, // Rarely sells, more cryptic
    hint: 20,
    lore: 30, // Loves lore
    challenge: 15,
    reaction: 10,
    threat: 0, // Never threatens directly
    idle: 5,
    farewell: 5,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 5,
    hint: 20,
    lore: 30,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 5,
    farewell: 5,
  },
  moodTriggers: [
    {
      mood: 'cryptic',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 3 },
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

export const THE_ONE_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'the-one-greet-neutral-1',
    entitySlug: 'the-one',
    pool: 'greeting',
    mood: 'neutral',
    text: 'You return to the void. The void has missed you.',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'the-one-greet-cryptic-1',
    entitySlug: 'the-one',
    pool: 'greeting',
    mood: 'cryptic',
    text: 'The patterns align. Or perhaps they merely pretend to.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'the-one-greet-cryptic-2',
    entitySlug: 'the-one',
    pool: 'greeting',
    mood: 'cryptic',
    text: 'Another who seeks. Few find. None keep.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'the-one-greet-pleased-1',
    entitySlug: 'the-one',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Ah, {{playerName}}. Your persistence... echoes.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'the-one-lore-cryptic-1',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'cryptic',
    text: 'Before the domains were six, they were one. Before they were one, they were none. Consider which came first.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'the-one-lore-cryptic-2',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'cryptic',
    text: 'The Die-rectors play a game within a game. You are both piece and player. Does this trouble you?',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'the-one-lore-neutral-1',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'neutral',
    text: 'Null Providence exists between all domains. It is not a place. It is an absence.',
    weight: 10,
    purpose: 'lore',
  },
  {
    id: 'the-one-lore-pleased-1',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'pleased',
    text: 'You wish to understand the nature of things. Very well. Data persists. Meat decays. Choose your vessel.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'the-one-lore-generous-1',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'generous',
    text: 'The truth you seek: there was no first death. There was only the first return. Everything before was prologue.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'the-one-hint-cryptic-1',
    entitySlug: 'the-one',
    pool: 'hint',
    mood: 'cryptic',
    text: 'The path forward is behind you. Or perhaps the other way around.',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'the-one-hint-neutral-1',
    entitySlug: 'the-one',
    pool: 'hint',
    mood: 'neutral',
    text: 'In {{currentDomain}}, the {{hazard}} tests resolve. Your integrity sits at {{integrity}}. Draw your own conclusions.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'cryptic' } },
  },
  {
    id: 'the-one-hint-pleased-1',
    entitySlug: 'the-one',
    pool: 'hint',
    mood: 'pleased',
    text: 'A direct truth, since you have earned it: the next chamber favors those who wait.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'direct', roomsAhead: 1 } },
  },

  // ---- CHALLENGE ----
  {
    id: 'the-one-challenge-cryptic-1',
    entitySlug: 'the-one',
    pool: 'challenge',
    mood: 'cryptic',
    text: 'A question, then. Not for reward, but for knowing: what persists when all else fails?',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'answer', label: 'Data' },
      { verb: 'answer', label: 'Memory' },
      { verb: 'decline', label: 'Refuse to answer' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'riddle' } },
  },
  {
    id: 'the-one-challenge-amused-1',
    entitySlug: 'the-one',
    pool: 'challenge',
    mood: 'amused',
    text: 'You have grown bold. Shall we see how bold? A wager: your lucky number against mine.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Accept the wager' },
      { verb: 'decline', label: 'Another time' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'luckyNumber' } },
  },

  // ---- REACTION ----
  {
    id: 'the-one-react-death-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'any',
    text: 'Death again. How familiar it must feel by now.',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'the-one-react-victory-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'pleased',
    text: 'You have returned from {{currentDomain}}. {{directorName}} will remember.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- DICE ROLL REACTIONS (d4 = The One's domain) ----
  {
    id: 'the-one-dice-doubles-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'Twins. The void recognizes symmetry.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'the-one-dice-triples-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Three... as it was meant to be. The pattern reveals itself.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'the-one-dice-straight-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'amused',
    text: 'A sequence. How orderly. How... expected.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'the-one-dice-d4-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'The smallest die carries the deepest truths.',
    weight: 20,
    purpose: 'ambient',
  },

  // ---- IDLE ----
  {
    id: 'the-one-idle-1',
    entitySlug: 'the-one',
    pool: 'idle',
    mood: 'any',
    text: '...',
    weight: 20,
    purpose: 'ambient',
  },
  {
    id: 'the-one-idle-2',
    entitySlug: 'the-one',
    pool: 'idle',
    mood: 'cryptic',
    text: 'The void watches. It always watches.',
    weight: 10,
    purpose: 'ambient',
  },

  // ---- FAREWELL ----
  {
    id: 'the-one-farewell-1',
    entitySlug: 'the-one',
    pool: 'farewell',
    mood: 'cryptic',
    text: 'Go. Return. The cycle continues regardless.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'the-one-farewell-2',
    entitySlug: 'the-one',
    pool: 'farewell',
    mood: 'neutral',
    text: 'Until the next iteration. They are all the same, and none.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'the-one-farewell-3',
    entitySlug: 'the-one',
    pool: 'farewell',
    mood: 'pleased',
    text: 'You persist. That is... something. Perhaps the only thing.',
    weight: 18,
    purpose: 'ambient',
  },
];
