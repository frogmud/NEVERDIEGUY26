/**
 * Mr. Kevin - Reality Debugger (Traveler)
 *
 * Personality: Meta, sees through reality, debugger vibes.
 * Role: Reality debugger ally, fourth-wall aware
 * Origin: Null Providence
 * Relationship: Friendly, cryptic, knows too much
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const MR_KEVIN_PERSONALITY: NPCPersonalityConfig = {
  slug: 'mr-kevin',
  name: 'Mr. Kevin',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 10, // Debug tools
    hint: 30, // Knows the code
    lore: 25, // Meta knowledge
    challenge: 10, // Debug challenges
    reaction: 10,
    threat: 0, // Too meta to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 10,
    hint: 30,
    lore: 25,
    challenge: 10,
    reaction: 10,
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
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const MR_KEVIN_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'kevin-greet-neutral-1',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Ah. You are here. The probability matrix suggested you would be. It was correct. As usual.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-neutral-2',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'neutral',
    text: '*adjusts transparent glasses* I see you. I see everything. The code is very readable today.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-pleased-1',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Welcome back. Your save state loaded correctly. No corruption detected. This time.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'generous',
    text: 'You. I like your variable values. Very optimized. The One would be proud. If pride existed in the void.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'kevin-lore-neutral-1',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'neutral',
    text: 'This is all a simulation. Or is it? The distinction matters less than you think. Either way, bugs need fixing.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-neutral-2',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'neutral',
    text: 'The One and I... we debug reality together. Partners in quality assurance. Someone has to test existence.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-pleased-1',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'pleased',
    text: 'Null Providence is where reality stores its error logs. I read them. Occasionally I fix them. Mostly I document.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'generous',
    text: 'Classified debug info: the Die-rectors are subroutines. Important ones. But subroutines. Do not tell them. It upsets them.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'kevin-hint-neutral-1',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'neutral',
    text: 'Checked the source. Room ahead has a bug. Enemies spawn at half health. Exploit before hotfix.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'kevin-hint-pleased-1',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'pleased',
    text: 'Found an exploit. Boss in room three has a null pointer in their attack pattern. Stand still for two seconds after their wind-up. They crash.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 3 } },
  },
  {
    id: 'kevin-hint-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'generous',
    text: 'Debug mode activated. Hidden developer room in area five. Walk through the wall that renders slightly wrong. You will know it.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 5 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'kevin-sales-neutral-1',
    entitySlug: 'mr-kevin',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'Debug tools. Useful for finding glitches in reality. Also enemies. Same thing, really.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the tools' },
      { verb: 'decline', label: 'Too meta for me' },
    ],
    action: { type: 'openShop', payload: { shopType: 'debug' } },
  },
  {
    id: 'kevin-sales-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands you a key* Void key. Opens anything. Including concepts. Use responsibly. Or do not. I am not your parent.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'I will be careful' },
      { verb: 'decline', label: 'Too much power' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'void_key' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'kevin-challenge-neutral-1',
    entitySlug: 'mr-kevin',
    pool: 'challenge',
    mood: 'neutral',
    text: 'Debug challenge. Find the bug in the next room before it finds you. Hint: it looks normal but is not.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I will find it' },
      { verb: 'decline', label: 'Bugs scare me' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'debug' } },
  },

  // ---- REACTION ----
  {
    id: 'kevin-react-squish-1',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'any',
    text: 'Entity flattened. Death state triggered. Respawn queued. Standard procedure.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-react-death-1',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Respawn complete. Memory intact. No data loss detected. Good run cycle.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-react-victory-1',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Victory condition met. Performance metrics: acceptable. Logging success to eternal database.',
    weight: 15,
    purpose: 'ambient',
  },
];
