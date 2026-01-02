/**
 * Keith Man - Speedster (Traveler)
 *
 * Personality: Fast-talking, time-dilated, dapper speedster.
 * Role: Speedster ally, time manipulator
 * Origin: Frost Reach
 * Relationship: Friendly, enthusiastic, talks fast
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const KEITH_MAN_PERSONALITY: NPCPersonalityConfig = {
  slug: 'keith-man',
  name: 'Keith Man',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 10, // Speed items
    hint: 25, // Scouts ahead FAST
    lore: 20, // Time philosophy
    challenge: 15, // Speed challenges
    reaction: 10,
    threat: 0, // Too fast to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 10,
    hint: 25,
    lore: 20,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 0 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
  ],
  defaultMood: 'pleased', // Always energetic
};

// ============================================
// Response Templates
// ============================================

export const KEITH_MAN_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'keith-greet-pleased-1',
    entitySlug: 'keith-man',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Hey-hi-hello! Good-to-see-you! Been-waiting! Well-not-waiting-exactly-time-is-relative!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'keith-greet-pleased-2',
    entitySlug: 'keith-man',
    pool: 'greeting',
    mood: 'pleased',
    text: '*appears in blur* Oh! There you are! I checked six rooms while waiting for you to blink!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'keith-greet-generous-1',
    entitySlug: 'keith-man',
    pool: 'greeting',
    mood: 'generous',
    text: 'FRIEND! *vibrating with excitement* I scouted ahead! And behind! And sideways through time! You are going to LOVE what I found!',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'keith-lore-pleased-1',
    entitySlug: 'keith-man',
    pool: 'lore',
    mood: 'pleased',
    text: 'Time is just... suggestion? Frost Reach taught me that! Alice freezes it! I stretch it! Same energy, different style!',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'keith-lore-pleased-2',
    entitySlug: 'keith-man',
    pool: 'lore',
    mood: 'pleased',
    text: 'Being fast is great! Downside? Everyone else seems SO. SLOW. But I love you all anyway! Slowly!',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'keith-lore-generous-1',
    entitySlug: 'keith-man',
    pool: 'lore',
    mood: 'generous',
    text: 'Secret speed tip! Time dilation works both ways! Slow down enemies by speeding up yourself! Physics hates this trick!',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'keith-hint-pleased-1',
    entitySlug: 'keith-man',
    pool: 'hint',
    mood: 'pleased',
    text: 'Just-ran-ahead! Three enemies! Left-one-is-fastest! Take-him-first! I-would-but-you-need-practice!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'keith-hint-generous-1',
    entitySlug: 'keith-man',
    pool: 'hint',
    mood: 'generous',
    text: 'Okay-okay-okay! Scouted EVERYTHING! Boss in room four has a two-second wind-up before big attack! Dodge left! Or right! I checked both timelines!',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 4 } },
  },
  {
    id: 'keith-hint-generous-2',
    entitySlug: 'keith-man',
    pool: 'hint',
    mood: 'generous',
    text: '*appears holding treasure* Found-this-in-future! Brought-it-back! Time-theft-is-technically-legal!',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 1 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'keith-sales-pleased-1',
    entitySlug: 'keith-man',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'Speed-gear! Makes-you-fast! Well-faster! Well-less-slow! Interested?!',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me!' },
      { verb: 'decline', label: 'Too fast for me' },
    ],
    action: { type: 'openShop', payload: { shopType: 'speed' } },
  },
  {
    id: 'keith-sales-generous-1',
    entitySlug: 'keith-man',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands you boots* Chrono-sneakers! Borrowed from my past self! He will not miss them! He has spares!',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Thanks!' },
      { verb: 'decline', label: 'Time paradox concerns' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'chrono_sneakers' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'keith-challenge-pleased-1',
    entitySlug: 'keith-man',
    pool: 'challenge',
    mood: 'pleased',
    text: 'RACE! You-and-me! To-the-end-of-the-room! I-will-go-slow! Well-slower! Ready-set-GO!',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '*starts running*' },
      { verb: 'decline', label: 'I will lose' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'speed_race' } },
  },

  // ---- REACTION ----
  {
    id: 'keith-react-squish-1',
    entitySlug: 'keith-man',
    pool: 'reaction',
    mood: 'any',
    text: 'Oh-no-oh-no-oh-no! I-could-have-saved-them! If-I-was-slightly-faster! Which-is-impossible-but-still!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'keith-react-death-1',
    entitySlug: 'keith-man',
    pool: 'reaction',
    mood: 'pleased',
    text: 'You-are-back! Death-is-just-a-speed-bump! Get-it? Speed? Because-I-am-fast?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'keith-react-victory-1',
    entitySlug: 'keith-man',
    pool: 'reaction',
    mood: 'pleased',
    text: 'VICTORY! *runs victory lap around room* AGAIN! *another lap* CELEBRATION!',
    weight: 15,
    purpose: 'ambient',
  },
];
