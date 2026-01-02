/**
 * X-treme - Skeletal Gambler (Wanderer)
 *
 * Personality: High-energy, gambling-obsessed, speaks in CAPS sometimes.
 * Role: Probability-based merchant, gambler
 * Origin: Earth
 * Relationship: Loves anyone willing to gamble
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const XTREME_PERSONALITY: NPCPersonalityConfig = {
  slug: 'xtreme',
  name: 'X-treme',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 30, // Gambling gear
    hint: 5, // Random hints
    lore: 15, // Gambling stories
    challenge: 25, // LOVES challenges
    reaction: 5,
    threat: 0, // Too fun to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 30,
    hint: 5,
    lore: 15,
    challenge: 25,
    reaction: 5,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'amused',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 0 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 5 },
    },
  ],
  defaultMood: 'amused', // Always excited
};

// ============================================
// Response Templates
// ============================================

export const XTREME_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'xtreme-greet-amused-1',
    entitySlug: 'xtreme',
    pool: 'greeting',
    mood: 'amused',
    text: 'WELCOME TO X-TREME\'S X-CHANGE! Where EVERYTHING is a gamble! Including the greeting! You just won a greeting!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'xtreme-greet-amused-2',
    entitySlug: 'xtreme',
    pool: 'greeting',
    mood: 'amused',
    text: 'HEY HEY HEY! A customer! Or are you? Let\'s roll to find out! Just kidding! You ARE! Probably!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'xtreme-greet-generous-1',
    entitySlug: 'xtreme',
    pool: 'greeting',
    mood: 'generous',
    text: 'MY FAVORITE GAMBLER! The odds say you\'ll have a GREAT time! I MAKE the odds so I would know!',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'xtreme-lore-amused-1',
    entitySlug: 'xtreme',
    pool: 'lore',
    mood: 'amused',
    text: 'I bet my flesh and LOST! Best decision ever! Now I\'m all bones and NO regrets! Okay SOME regrets! But exciting ones!',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'xtreme-lore-amused-2',
    entitySlug: 'xtreme',
    pool: 'lore',
    mood: 'amused',
    text: 'Why pay RETAIL when you can pay RANDOM? That\'s my business model! Also my life philosophy! Also why I\'m a skeleton!',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'xtreme-lore-generous-1',
    entitySlug: 'xtreme',
    pool: 'lore',
    mood: 'generous',
    text: 'Secret gambling tip: the dice are ALWAYS watching. Not metaphorically. ACTUALLY watching. Be nice to them.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'xtreme-hint-amused-1',
    entitySlug: 'xtreme',
    pool: 'hint',
    mood: 'amused',
    text: 'Hot tip! Maybe! Could be wrong! 50/50! The enemies ahead are weak to... *rolls die* ...FIRE! Or ice! One of those!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },

  // ---- SALES PITCH ----
  {
    id: 'xtreme-sales-amused-1',
    entitySlug: 'xtreme',
    pool: 'salesPitch',
    mood: 'amused',
    text: 'MYSTERY BOXES! Could be treasure! Could be TRASH! Could be BOTH! Roll to find out!',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'SHOW ME BOXES' },
      { verb: 'decline', label: 'I prefer certainty' },
    ],
    action: { type: 'openShop', payload: { shopType: 'gambling' } },
  },
  {
    id: 'xtreme-sales-amused-2',
    entitySlug: 'xtreme',
    pool: 'salesPitch',
    mood: 'amused',
    text: 'Random weapons! Stats REROLL every time you swing! Exciting! Unpredictable! DANGEROUS! All good things!',
    weight: 12,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Chaotic weapons' },
      { verb: 'decline', label: 'I need reliable' },
    ],
    action: { type: 'openShop', payload: { shopType: 'random_weapons' } },
  },
  {
    id: 'xtreme-sales-generous-1',
    entitySlug: 'xtreme',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands you loaded die* This ALWAYS rolls what you need! Usually! Sometimes! It\'s complicated! TAKE IT!',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'EXTREME!' },
      { verb: 'decline', label: 'Too chaotic' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'loaded_die' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'xtreme-challenge-amused-1',
    entitySlug: 'xtreme',
    pool: 'challenge',
    mood: 'amused',
    text: 'DOUBLE OR NOTHING! On EVERYTHING! Your gold! Your items! Your EXISTENCE! Okay maybe not existence! MAYBE!',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'DOUBLE!' },
      { verb: 'decline', label: 'NOTHING!' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'double_nothing' } },
  },
  {
    id: 'xtreme-challenge-amused-2',
    entitySlug: 'xtreme',
    pool: 'challenge',
    mood: 'amused',
    text: 'PREDICTION GAME! Guess what I\'m thinking! Hint: it involves GAMBLING! You probably got it!',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Gambling?' },
      { verb: 'decline', label: 'Too easy' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'prediction' } },
  },

  // ---- REACTION ----
  {
    id: 'xtreme-react-squish-1',
    entitySlug: 'xtreme',
    pool: 'reaction',
    mood: 'any',
    text: 'OHHH! BAD ROLL! Literally! The dice ROLLED on them! That\'s the X-TREME life!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'xtreme-react-death-1',
    entitySlug: 'xtreme',
    pool: 'reaction',
    mood: 'amused',
    text: 'RESPAWN! You gambled with death and WON! This time! Always gamble with death! It\'s the only way!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'xtreme-react-victory-1',
    entitySlug: 'xtreme',
    pool: 'reaction',
    mood: 'amused',
    text: 'WINNER WINNER! Not chicken dinner! We don\'t have chickens! We have GLORY! And bones! Mostly bones!',
    weight: 15,
    purpose: 'ambient',
  },
];
