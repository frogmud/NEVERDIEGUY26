/**
 * Zero Chance - Probability Void (Pantheon)
 *
 * Personality: NO DIALOGUE. Actions only. Force of negation.
 * Role: Event Deity, appears when probability breaks
 * Element: Probability / Chaos
 * Relationship: Neutral force, neither helps nor hinders intentionally
 *
 * Note: NEVER speaks words. All templates are action descriptions like:
 * "[Zero Chance nullifies...]", "[Probability distorts...]"
 * The NPC is a cosmic force, not a conversationalist.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const ZERO_CHANCE_PERSONALITY: NPCPersonalityConfig = {
  slug: 'zero-chance',
  name: 'Zero Chance',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 0, // Never sells
    hint: 20, // Shows probabilities
    lore: 15, // Reveals cosmic truths through actions
    challenge: 20, // Tests probability
    reaction: 30, // Very reactive to dice, outcomes
    threat: 0, // Forces don't threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 0,
    hint: 20,
    lore: 15,
    challenge: 20,
    reaction: 30,
    threat: 0,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'neutral',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 5 },
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
  defaultMood: 'neutral', // Impassive cosmic force
};

// ============================================
// Response Templates
// ============================================

export const ZERO_CHANCE_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'zero-greet-neutral-1',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'neutral',
    text: '[Zero Chance manifests. Probability holds its breath.]',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-neutral-2',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'neutral',
    text: '[The air grows heavy with impossible outcomes. Zero Chance is present.]',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-pleased-1',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'pleased',
    text: '[Zero Chance acknowledges your presence. Dice everywhere tremble slightly.]',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-generous-1',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'generous',
    text: '[Zero Chance inclines toward you. For a moment, all outcomes favor you.]',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'zero-lore-neutral-1',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'neutral',
    text: '[Zero Chance gestures. A die rolls without being touched. It shows a number that does not exist.]',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-neutral-2',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'neutral',
    text: '[Probability ripples outward from Zero Chance. Coins land on their edges. Cards show blank faces.]',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-pleased-1',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'pleased',
    text: '[Zero Chance reveals: before luck existed, there was only certainty. Zero made uncertainty possible.]',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-generous-1',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'generous',
    text: '[A truth manifests: Zero Chance is not the absence of luck. Zero is where probability fears to calculate.]',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'zero-hint-neutral-1',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'neutral',
    text: '[Zero Chance points ahead. The path flickers between existing and not existing.]',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'zero-hint-pleased-1',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'pleased',
    text: '[Zero Chance nullifies a trap ahead. Where danger was certain, now it is merely possible.]',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'zero-hint-generous-1',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'generous',
    text: '[Zero Chance bends probability. A hidden path that had zero chance of existing now exists. Three rooms ahead.]',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'zero-challenge-neutral-1',
    entitySlug: 'zero-chance',
    pool: 'challenge',
    mood: 'neutral',
    text: '[Zero Chance presents a die. Roll it. Accept whatever impossible result occurs.]',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '*rolls the impossible die*' },
      { verb: 'decline', label: '*steps back carefully*' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'probability' } },
  },
  {
    id: 'zero-challenge-pleased-1',
    entitySlug: 'zero-chance',
    pool: 'challenge',
    mood: 'pleased',
    text: '[Zero Chance offers a choice: certainty of something small, or zero chance of something vast.]',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Zero chance of vast' },
      { verb: 'decline', label: 'Certainty of small' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'risk' } },
  },

  // ---- REACTION ----
  {
    id: 'zero-react-squish-1',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'any',
    text: '[Zero Chance observes the flattening. The probability of this was supposed to be zero. It happened anyway.]',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-squish-2',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'neutral',
    text: '[Probability collapses. What had infinite outcomes now has one: flat.]',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-death-1',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'neutral',
    text: '[Zero Chance acknowledges your return. The probability of resurrection was supposed to be zero. Yet here you are.]',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-victory-1',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'pleased',
    text: '[Zero Chance nods. Against all probability, you succeeded. Zero is impressed. Zero is never impressed.]',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-roll-1',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'neutral',
    text: '[Zero Chance watches the dice. Every possible outcome flickers across its surface before settling.]',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-roll-2',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'pleased',
    text: '[The die shows a result. Zero Chance made that specific number have zero probability. It happened anyway. Curious.]',
    weight: 10,
    purpose: 'ambient',
  },
];
