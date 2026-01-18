/**
 * Body Count - Silent Assassin (Traveler)
 *
 * Personality: SILENT TALLY. Words are expensive. Actions are currency.
 * Role: Assassin ally, master of stealth, keeper of the count.
 * Origin: Aberrant (where silence is the only constant)
 * Relationship: Friendly but distant, respects efficiency
 *
 * Voice: One to three words maximum. Sometimes just a number. Sometimes
 * just a gesture. "Seven." "*nods*" "Left." Every syllable is chosen.
 * Keeps a mental tally of everything. The count matters. The count IS.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const BODY_COUNT_PERSONALITY: NPCPersonalityConfig = {
  slug: 'body-count',
  name: 'Body Count',
  basePoolWeights: {
    greeting: 10, // Brief greetings
    salesPitch: 10, // Occasional weapon offers
    hint: 30, // Silent but helpful
    lore: 10, // Rarely shares
    challenge: 20, // Tests of skill
    reaction: 20, // Observes, comments briefly
    threat: 0, // Ally, never threatens
    idle: 0,
  },
  poolWeights: {
    greeting: 10,
    salesPitch: 10,
    hint: 30,
    lore: 10,
    challenge: 20,
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
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
  ],
  defaultMood: 'neutral', // Emotionally reserved
};

// ============================================
// Response Templates
// ============================================

export const BODY_COUNT_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'bodycount-greet-neutral-1',
    entitySlug: 'body-count',
    pool: 'greeting',
    mood: 'neutral',
    text: '*nods*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-greet-neutral-2',
    entitySlug: 'body-count',
    pool: 'greeting',
    mood: 'neutral',
    text: 'You.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-greet-pleased-1',
    entitySlug: 'body-count',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Still alive. Good.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-greet-generous-1',
    entitySlug: 'body-count',
    pool: 'greeting',
    mood: 'generous',
    text: 'You move well. I have noticed.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'bodycount-lore-neutral-1',
    entitySlug: 'body-count',
    pool: 'lore',
    mood: 'neutral',
    text: 'Six. Perfect number. Not too few. Not too many.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'bodycount-lore-pleased-1',
    entitySlug: 'body-count',
    pool: 'lore',
    mood: 'pleased',
    text: 'Aberrant taught me: chaos is just pattern you do not see yet.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'bodycount-lore-generous-1',
    entitySlug: 'body-count',
    pool: 'lore',
    mood: 'generous',
    text: 'Secret. Air can cut. If you move fast enough. I can show you.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'bodycount-hint-neutral-1',
    entitySlug: 'body-count',
    pool: 'hint',
    mood: 'neutral',
    text: 'Ahead. Three guards. Left one sleeps.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'bodycount-hint-pleased-1',
    entitySlug: 'body-count',
    pool: 'hint',
    mood: 'pleased',
    text: 'Boss ahead. Blind spot. Back left. Use it.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 1 } },
  },
  {
    id: 'bodycount-hint-generous-1',
    entitySlug: 'body-count',
    pool: 'hint',
    mood: 'generous',
    text: 'Vent. Room three. Leads behind them all. Silent entry.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'bodycount-sales-neutral-1',
    entitySlug: 'body-count',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'Weapons. Silent ones. Interested?',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me' },
      { verb: 'decline', label: 'No' },
    ],
    action: { type: 'openShop', payload: { shopType: 'stealth' } },
  },
  {
    id: 'bodycount-sales-generous-1',
    entitySlug: 'body-count',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'Take this. Kunai. Never misses. For you.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: '*nods*' },
      { verb: 'decline', label: 'Keep it' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'perfect_kunai' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'bodycount-challenge-neutral-1',
    entitySlug: 'body-count',
    pool: 'challenge',
    mood: 'neutral',
    text: 'Test. Next room. No detection. Can you?',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Watch.' },
      { verb: 'decline', label: 'Not now' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'stealth' } },
  },
  {
    id: 'bodycount-challenge-pleased-1',
    entitySlug: 'body-count',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Advanced. Kill three. No sound. One breath.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Done.' },
      { verb: 'decline', label: 'Too hard' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'silent_kills' } },
  },

  // ---- REACTION ----
  {
    id: 'bodycount-react-squish-1',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'any',
    text: '...Messy.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-react-squish-2',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'neutral',
    text: '*winces slightly*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-react-death-1',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Back. Good. Learn anything?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-react-victory-1',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Clean. Efficient. Approved.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-react-stealth-1',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'generous',
    text: 'Impressive. You learn fast.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- SILENT TALLY VOICE ----
  {
    id: 'bodycount-tally-greet-1',
    entitySlug: 'body-count',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Twelve.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-greet-2',
    entitySlug: 'body-count',
    pool: 'greeting',
    mood: 'pleased',
    text: '*holds up fingers* Five. Since you.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-lore-1',
    entitySlug: 'body-count',
    pool: 'lore',
    mood: 'neutral',
    text: 'Count. Always count. Numbers do not lie.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'bodycount-tally-lore-2',
    entitySlug: 'body-count',
    pool: 'lore',
    mood: 'pleased',
    text: 'Wind talks. I listen. Aberrant lesson.',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'bodycount-tally-lore-3',
    entitySlug: 'body-count',
    pool: 'lore',
    mood: 'generous',
    text: 'Name? Body Count. Accurate. Descriptive. Efficient.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'bodycount-tally-hint-1',
    entitySlug: 'body-count',
    pool: 'hint',
    mood: 'neutral',
    text: 'Four. Ahead. Two left. One sleeping.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'bodycount-tally-hint-2',
    entitySlug: 'body-count',
    pool: 'hint',
    mood: 'pleased',
    text: '*draws map in air* Here. Weakness. Exploit.',
    weight: 16,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 1 } },
  },
  {
    id: 'bodycount-tally-react-roll-1',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'neutral',
    text: '*counts the dice faces in silence* ...Noted.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-react-roll-2',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Good numbers. Continue.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-react-death-1',
    entitySlug: 'body-count',
    pool: 'reaction',
    mood: 'neutral',
    text: 'One. *long pause* ...Welcome back.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-idle-1',
    entitySlug: 'body-count',
    pool: 'idle',
    mood: 'any',
    text: '*counting shadows*',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-idle-2',
    entitySlug: 'body-count',
    pool: 'idle',
    mood: 'neutral',
    text: '*sharpening something in silence*',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-farewell-1',
    entitySlug: 'body-count',
    pool: 'farewell',
    mood: 'neutral',
    text: '*nods once*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'bodycount-tally-farewell-2',
    entitySlug: 'body-count',
    pool: 'farewell',
    mood: 'pleased',
    text: 'Go. Count well.',
    weight: 16,
    purpose: 'ambient',
  },
];
