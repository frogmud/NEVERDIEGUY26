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
    salesPitch: 30, // Primary merchant
    hint: 15, // Tactical intel
    lore: 10, // Military history
    challenge: 10, // Combat tests
    reaction: 10,
    threat: 0, // Professional
    idle: 5,
    farewell: 5,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 30,
    hint: 15,
    lore: 10,
    challenge: 10,
    reaction: 10,
    threat: 0,
    idle: 5,
    farewell: 5,
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

  // ---- FAREWELL ----
  {
    id: 'general-w-farewell-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'farewell',
    mood: 'neutral',
    text: 'Dismissed. Return when you need resupply. Command & Supply operates around the clock.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'general-w-farewell-neutral-2',
    entitySlug: 'the-general-wanderer',
    pool: 'farewell',
    mood: 'neutral',
    text: '*salutes* Move out, {{playerName}}. Enemy territory ahead. Stay sharp.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'general-w-farewell-pleased-1',
    entitySlug: 'the-general-wanderer',
    pool: 'farewell',
    mood: 'pleased',
    text: 'Good hunting, soldier. That equipment is guaranteed field-ready. Report back with results.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-w-farewell-generous-1',
    entitySlug: 'the-general-wanderer',
    pool: 'farewell',
    mood: 'generous',
    text: "At ease. You've earned your place among the elite. The armory is always open to you.",
    weight: 18,
    purpose: 'ambient',
  },

  // ---- IDLE ----
  {
    id: 'general-w-idle-neutral-1',
    entitySlug: 'the-general-wanderer',
    pool: 'idle',
    mood: 'neutral',
    text: '*inspects weapon inventory* Hmm. Acceptable condition. Battle-ready.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'general-w-idle-neutral-2',
    entitySlug: 'the-general-wanderer',
    pool: 'idle',
    mood: 'neutral',
    text: '*reviews tactical maps* Reports indicate increased hostile activity. Benefits inventory turnover.',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'general-w-idle-pleased-1',
    entitySlug: 'the-general-wanderer',
    pool: 'idle',
    mood: 'pleased',
    text: '*adjusts medals* Another successful quarter. Customer survival rate: acceptable.',
    weight: 14,
    purpose: 'ambient',
  },

  // ---- REACTION (expanded) ----
  {
    id: 'general-w-react-lowintegrity-1',
    entitySlug: 'the-general-wanderer',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Integrity at {{integrity}}%. Tactical recommendation: withdraw and regroup. Or purchase repair kits.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'general-w-react-purchase-1',
    entitySlug: 'the-general-wanderer',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Transaction complete. Equipment logged. Use it well. Command & Supply guarantees results.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'general-w-react-defeat-1',
    entitySlug: 'the-general-wanderer',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Mission failure. Extraction complete. Analysis suggests inadequate equipment. Review catalog.',
    weight: 13,
    purpose: 'ambient',
  },
];
