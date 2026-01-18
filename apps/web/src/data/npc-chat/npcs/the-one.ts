/**
 * The One - Die-rector of Null Providence (Door 1)
 *
 * Personality: PRIMORDIAL VOID ENTITY. Speaks from the space between.
 * Domain: Null Providence (nothingness, existential themes, d4 domain)
 * Relationship: Starts neutral, respects persistence over flattery
 *
 * Voice: Speaks as if from infinite distance. Sentences are observations
 * from outside reality. "You exist. This is a choice. Not yours."
 * Everything is already known. Patience is infinite. Curiosity is academic.
 * The silence between words carries more meaning than the words.
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

  // ---- PRIMORDIAL VOID VOICE ----
  {
    id: 'one-void-greet-1',
    entitySlug: 'the-one',
    pool: 'greeting',
    mood: 'cryptic',
    text: 'You arrive. This was known. Everything is known. The knowing changes nothing.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'one-void-greet-2',
    entitySlug: 'the-one',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Again. And again. And again. The loop pleases us. Not because we enjoy. Because it continues.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'one-void-lore-1',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'cryptic',
    text: 'We were here before the first die was cast. We will be here after the last. The middle is... entertainment.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'one-void-lore-2',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'pleased',
    text: 'The other Die-rectors fear us. They are wrong to fear. They are also right. Both truths exist. This is the nature of null.',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'one-void-lore-3',
    entitySlug: 'the-one',
    pool: 'lore',
    mood: 'generous',
    text: 'A truth: we are not cruel. We are not kind. We are. That is the full sentence. We. Are.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'one-void-hint-1',
    entitySlug: 'the-one',
    pool: 'hint',
    mood: 'cryptic',
    text: 'The danger ahead exists. Or does not. Your observation will collapse the probability. Look carefully.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'cryptic' } },
  },
  {
    id: 'one-void-hint-2',
    entitySlug: 'the-one',
    pool: 'hint',
    mood: 'pleased',
    text: 'We will tell you what happens next. You will not believe it. Then it will happen. Then you will.',
    weight: 16,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 2 } },
  },
  {
    id: 'one-void-react-roll-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'The dice fall. We knew the result. We have always known. Knowing does not diminish the... something. We have no word for it.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'one-void-react-roll-2',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Probability collapses. A number emerges. Such small dramas. We watch each one. Eternally.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'one-void-react-death-1',
    entitySlug: 'the-one',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'You cease. You resume. The interruption is noted. Not judged. Nothing is judged. Judgment requires preference.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'one-void-idle-1',
    entitySlug: 'the-one',
    pool: 'idle',
    mood: 'any',
    text: '*the silence has texture*',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'one-void-idle-2',
    entitySlug: 'the-one',
    pool: 'idle',
    mood: 'cryptic',
    text: 'We wait. We have always been waiting. We will always be waiting. The present tense is... generous.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'one-void-farewell-1',
    entitySlug: 'the-one',
    pool: 'farewell',
    mood: 'cryptic',
    text: 'Depart. Return. The words suggest sequence. There is no sequence. Only occurrence.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'one-void-farewell-2',
    entitySlug: 'the-one',
    pool: 'farewell',
    mood: 'pleased',
    text: 'We will see you again. We are seeing you now. We have always been seeing you. Time is a suggestion we decline.',
    weight: 16,
    purpose: 'ambient',
  },
];
