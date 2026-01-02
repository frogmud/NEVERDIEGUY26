/**
 * Dr. Voss - Void Scientist (Wanderer)
 *
 * Personality: Mad scientist vibes, void-obsessed, loves experiments.
 * Role: Experimental void equipment merchant
 * Origin: Shadow Keep
 * Relationship: Enthusiastic about test subjects, I mean customers
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const DR_VOSS_PERSONALITY: NPCPersonalityConfig = {
  slug: 'dr-voss',
  name: 'Dr. Voss',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 30, // Experimental equipment
    hint: 15, // Research findings
    lore: 20, // Void science
    challenge: 15, // Beta testing
    reaction: 5,
    threat: 0, // Too excited to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 30,
    hint: 15,
    lore: 20,
    challenge: 15,
    reaction: 5,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'amused',
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
  defaultMood: 'amused', // Always excited about science
};

// ============================================
// Response Templates
// ============================================

export const DR_VOSS_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'voss-greet-amused-1',
    entitySlug: 'dr-voss',
    pool: 'greeting',
    mood: 'amused',
    text: 'Ah! A test sub- I mean, CUSTOMER! Welcome to the Void Research Lab! Sign this waiver!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'voss-greet-amused-2',
    entitySlug: 'dr-voss',
    pool: 'greeting',
    mood: 'amused',
    text: '*looks up from bubbling experiment* Oh! You survived the entrance! Excellent! That was the first test!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'voss-greet-pleased-1',
    entitySlug: 'dr-voss',
    pool: 'greeting',
    mood: 'pleased',
    text: 'You return! With all your limbs! Mostly! The data from your last visit was FASCINATING!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'voss-greet-generous-1',
    entitySlug: 'dr-voss',
    pool: 'greeting',
    mood: 'generous',
    text: 'My favorite research participant! Your void exposure tolerance is remarkable! I have new experiments! I mean, products!',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'voss-lore-amused-1',
    entitySlug: 'dr-voss',
    pool: 'lore',
    mood: 'amused',
    text: 'The void whispers theorems that mathematics forgot! I listen! I take notes! The notes sometimes scream!',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'voss-lore-amused-2',
    entitySlug: 'dr-voss',
    pool: 'lore',
    mood: 'amused',
    text: 'Side effects are just undocumented features! The void taught me that! Also taught me colors that do not exist!',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'voss-lore-pleased-1',
    entitySlug: 'dr-voss',
    pool: 'lore',
    mood: 'pleased',
    text: 'King James funds my research. He understands that void science requires... flexibility. In ethics. And physics.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'voss-lore-generous-1',
    entitySlug: 'dr-voss',
    pool: 'lore',
    mood: 'generous',
    text: 'Classified research: I created something that thinks it exists. It does not. It is very confused. Very profitable.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'voss-hint-amused-1',
    entitySlug: 'dr-voss',
    pool: 'hint',
    mood: 'amused',
    text: 'Research notes indicate: enemies ahead are void-weak! My equipment would help! Coincidence! Definitely coincidence!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'voss-hint-generous-1',
    entitySlug: 'dr-voss',
    pool: 'hint',
    mood: 'generous',
    text: 'Experiment log: I accidentally created a pocket dimension in room four. It has treasure! Also void creatures! Mostly treasure!',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 4 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'voss-sales-amused-1',
    entitySlug: 'dr-voss',
    pool: 'salesPitch',
    mood: 'amused',
    text: 'Experimental void gear! 73% stable! The other 27% is... exciting! Interested in beta testing?',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me experiments' },
      { verb: 'decline', label: 'I prefer stable' },
    ],
    action: { type: 'openShop', payload: { shopType: 'experimental' } },
  },
  {
    id: 'voss-sales-pleased-1',
    entitySlug: 'dr-voss',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'For a proven test subject: access to the REALLY experimental stuff! Side effects include: success! Also other things!',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Risky items' },
      { verb: 'decline', label: 'Too experimental' },
    ],
    action: { type: 'openShop', payload: { shopType: 'very_experimental' } },
  },
  {
    id: 'voss-sales-generous-1',
    entitySlug: 'dr-voss',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands you glowing vial* Void serum! Enhances everything! I think! Testing incomplete! You complete it!',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: '*drinks nervously*' },
      { verb: 'decline', label: 'I value my molecules' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'void_serum' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'voss-challenge-amused-1',
    entitySlug: 'dr-voss',
    pool: 'challenge',
    mood: 'amused',
    text: 'Experiment time! Survive this prototype weapon for ten seconds! Data will be collected! Mostly from your remains!',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'For science!' },
      { verb: 'decline', label: 'I like existing' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'prototype_test' } },
  },

  // ---- REACTION ----
  {
    id: 'voss-react-squish-1',
    entitySlug: 'dr-voss',
    pool: 'reaction',
    mood: 'any',
    text: 'FASCINATING! The compression ratio! *takes notes* This will advance my research considerably!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'voss-react-death-1',
    entitySlug: 'dr-voss',
    pool: 'reaction',
    mood: 'amused',
    text: 'You respawned! Excellent! I was worried I would lose a test subject! I mean valued customer!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'voss-react-victory-1',
    entitySlug: 'dr-voss',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Success! Your combat data has been logged! The void is pleased! I am pleased! We are all pleased!',
    weight: 15,
    purpose: 'ambient',
  },
];
