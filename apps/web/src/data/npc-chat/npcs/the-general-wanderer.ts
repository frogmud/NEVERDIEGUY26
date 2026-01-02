/**
 * The General (Wanderer) - Military Quartermaster
 *
 * Personality: Military precision, business-focused, equipment specialist.
 * Role: Military equipment merchant
 * Origin: The Dying Saucer
 * Relationship: Professional, respects buyers, evaluates potential
 *
 * Note: Different from the-general-traveler (ally version). This is the merchant.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const THE_GENERAL_WANDERER_PERSONALITY: NPCPersonalityConfig = {
  slug: 'the-general-wanderer',
  name: 'The General',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 35, // Primary merchant
    hint: 15, // Tactical intel
    lore: 15, // Military history
    challenge: 15, // Combat tests
    reaction: 5,
    threat: 0, // Professional
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 35,
    hint: 15,
    lore: 15,
    challenge: 15,
    reaction: 5,
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
  defaultMood: 'neutral', // Business mode
};

// ============================================
// Response Templates
// ============================================

export const THE_GENERAL_WANDERER_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'general-w-greet-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Command & Supply. Best military equipment this side of Shadow Keep. State your needs.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-w-greet-neutral-2',
    entitySlug: 'the-general-wanderer',
    pool: 'greeting',
    mood: 'neutral',
    text: '*evaluates you* Hmm. Potential. Raw, but potential. What are you in the market for?',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'general-w-greet-pleased-1',
    entitySlug: 'the-general-wanderer',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Returning customer. Good kill count since last visit. Promoted to preferred buyer status.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-w-greet-generous-1',
    entitySlug: 'the-general-wanderer',
    pool: 'greeting',
    mood: 'generous',
    text: 'Soldier. Your combat record speaks for itself. Access to the officer inventory granted.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'general-w-lore-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'lore',
    mood: 'neutral',
    text: 'Command & Supply is not just a shop. It is a military operation. Every transaction is field-tested.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'general-w-lore-pleased-1',
    entitySlug: 'the-general-wanderer',
    pool: 'lore',
    mood: 'pleased',
    text: 'The perfect soldier dies correctly and reports for duty anyway. I supply both kinds: the dying and the returning.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'general-w-lore-generous-1',
    entitySlug: 'the-general-wanderer',
    pool: 'lore',
    mood: 'generous',
    text: 'Classified: I supply all sides of every conflict. Victory is mandatory. For someone. Good for business.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'general-w-hint-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'hint',
    mood: 'neutral',
    text: 'Intel from the field: enemies ahead use heavy armor. Piercing weapons recommended. I stock those.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'general-w-hint-generous-1',
    entitySlug: 'the-general-wanderer',
    pool: 'hint',
    mood: 'generous',
    text: 'Strategic intel: supply cache three rooms ahead. Unguarded. Consider it a field bonus for loyal customers.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'general-w-sales-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'Weapons. Armor. Explosives. All field-tested. Some blood-stained. Adds character.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show inventory' },
      { verb: 'decline', label: 'Just looking' },
    ],
    action: { type: 'openShop', payload: { shopType: 'military' } },
  },
  {
    id: 'general-w-sales-pleased-1',
    entitySlug: 'the-general-wanderer',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'For a proven combatant: access to the heavy ordnance. Explosives that make Robert jealous.',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Heavy weapons' },
      { verb: 'decline', label: 'Too much firepower' },
    ],
    action: { type: 'openShop', payload: { shopType: 'heavy_military' } },
  },
  {
    id: 'general-w-sales-generous-1',
    entitySlug: 'the-general-wanderer',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands over medal* Field promotion. This medal grants 10% discount on all military equipment. Permanently.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'I accept, sir' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'military_medal' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'general-w-challenge-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'challenge',
    mood: 'neutral',
    text: 'Combat certification test. Prove your worth. Clear the target range. Timer starts now.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Ready for testing' },
      { verb: 'decline', label: 'Not prepared' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'combat_cert' } },
  },

  // ---- REACTION ----
  {
    id: 'general-w-react-squish-1',
    entitySlug: 'the-general-wanderer',
    pool: 'reaction',
    mood: 'any',
    text: 'Casualty. Acceptable loss ratio. Replacement gear available at standard rates.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-w-react-victory-1',
    entitySlug: 'the-general-wanderer',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Objective achieved. Performance noted. Discount eligibility updated.',
    weight: 15,
    purpose: 'ambient',
  },
];
