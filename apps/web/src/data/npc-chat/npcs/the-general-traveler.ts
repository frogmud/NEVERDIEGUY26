/**
 * The General - Strategic Ally (Traveler)
 *
 * Personality: Military precision, strategic, commanding but supportive.
 * Role: Tactical ally, undead strategist.
 * Origin: Earth
 * Relationship: Friendly, respects capability, offers strategic advice
 *
 * Note: Different from wanderers/the-general (merchant). This is the ally version.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const THE_GENERAL_TRAVELER_PERSONALITY: NPCPersonalityConfig = {
  slug: 'the-general-traveler',
  name: 'The General',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 10, // Occasional equipment offers
    hint: 30, // Heavy on tactical advice
    lore: 20, // Military history
    challenge: 15, // Combat tests
    reaction: 10,
    threat: 0, // Ally, never threatens
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 10,
    hint: 30,
    lore: 20,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'neutral',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 2 },
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
  defaultMood: 'neutral', // Professional demeanor
};

// ============================================
// Response Templates
// ============================================

export const THE_GENERAL_TRAVELER_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'general-t-greet-neutral-1',
    entitySlug: 'the-general-traveler',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Soldier. Status report. How many times have you died since we last spoke?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-t-greet-neutral-2',
    entitySlug: 'the-general-traveler',
    pool: 'greeting',
    mood: 'neutral',
    text: 'At ease. We have tactical matters to discuss.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'general-t-greet-pleased-1',
    entitySlug: 'the-general-traveler',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Good to see you operational. Your kill count has improved. I have been watching.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-t-greet-generous-1',
    entitySlug: 'the-general-traveler',
    pool: 'greeting',
    mood: 'generous',
    text: 'My finest soldier returns. At this rate, you will earn a promotion. Posthumously, most likely.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'general-t-lore-neutral-1',
    entitySlug: 'the-general-traveler',
    pool: 'lore',
    mood: 'neutral',
    text: 'I died in seventeen campaigns. Each death taught me more than any victory. That is why I train the living.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'general-t-lore-neutral-2',
    entitySlug: 'the-general-traveler',
    pool: 'lore',
    mood: 'neutral',
    text: 'The perfect soldier dies correctly and reports for duty anyway. I wrote the manual on this.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'general-t-lore-pleased-1',
    entitySlug: 'the-general-traveler',
    pool: 'lore',
    mood: 'pleased',
    text: 'Victory is mandatory. Survival is optional. But between us? Survival makes the paperwork easier.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'general-t-lore-generous-1',
    entitySlug: 'the-general-traveler',
    pool: 'lore',
    mood: 'generous',
    text: 'Classified intel: The Die-rectors fear organized resistance. That is why they keep us scattered. Stay together.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'general-t-hint-neutral-1',
    entitySlug: 'the-general-traveler',
    pool: 'hint',
    mood: 'neutral',
    text: 'Reconnaissance report: hostiles ahead are weak on their left flank. Exploit it.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'general-t-hint-pleased-1',
    entitySlug: 'the-general-traveler',
    pool: 'hint',
    mood: 'pleased',
    text: 'Strategic assessment: the boss two rooms ahead telegraphs before heavy attacks. Wait for the tell.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 2 } },
  },
  {
    id: 'general-t-hint-generous-1',
    entitySlug: 'the-general-traveler',
    pool: 'hint',
    mood: 'generous',
    text: 'Black ops intel: there is a supply cache hidden in room four. Behind the third pillar. You did not hear this from me.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 4 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'general-t-sales-neutral-1',
    entitySlug: 'the-general-traveler',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'I have spare equipment from my last campaign. Field-tested. Blood-stained. Effective.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me' },
      { verb: 'decline', label: 'I am equipped' },
    ],
    action: { type: 'openShop', payload: { shopType: 'military' } },
  },
  {
    id: 'general-t-sales-generous-1',
    entitySlug: 'the-general-traveler',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'For a soldier of your caliber, I have something special. Standard issue is not good enough.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'I accept' },
      { verb: 'decline', label: 'Too generous' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'officers_gear' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'general-t-challenge-neutral-1',
    entitySlug: 'the-general-traveler',
    pool: 'challenge',
    mood: 'neutral',
    text: 'Combat drill. Clear the next room in optimal time. I will be timing you.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Ready, sir' },
      { verb: 'decline', label: 'Not now' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'speedrun' } },
  },
  {
    id: 'general-t-challenge-pleased-1',
    entitySlug: 'the-general-traveler',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Advanced training: defeat the next three enemies using only melee. Ranged is for the undisciplined.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Melee only' },
      { verb: 'decline', label: 'I prefer options' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'melee_only' } },
  },

  // ---- REACTION ----
  {
    id: 'general-t-react-squish-1',
    entitySlug: 'the-general-traveler',
    pool: 'reaction',
    mood: 'any',
    text: 'Casualty. Noted. They will respawn. We always do.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-t-react-squish-2',
    entitySlug: 'the-general-traveler',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Flattened by probability. Not the worst way to go. I have seen worse.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'general-t-react-death-1',
    entitySlug: 'the-general-traveler',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Back from the grave. Good. Debrief me on what killed you. We will not let it happen twice.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'general-t-react-victory-1',
    entitySlug: 'the-general-traveler',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Objective complete. Excellent execution. You would have made a fine soldier in my regiment.',
    weight: 15,
    purpose: 'ambient',
  },
];
