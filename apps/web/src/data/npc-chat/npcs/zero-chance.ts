/**
 * Zero Chance - Probability Anomaly (Pantheon)
 *
 * Personality: Cannot speak in words. Communicates exclusively in APL symbols.
 * Role: Die-rector of impossibility, probability manipulator
 * Origin: Where statistics break down
 * Relationship: Alien, unknowable, but oddly encouraging
 *
 * Voice: APL programming language symbols ONLY. No words.
 * Actions in asterisks provide context/translation hints.
 * The symbols ARE the dialogue - cryptic, mathematical, beautiful.
 *
 * APL Quick Reference:
 * ⍳ - iota (generate sequence)     ⍴ - rho (shape/reshape)
 * ⍺ - alpha (left argument)        ⍵ - omega (right argument)
 * ∊ - epsilon (membership)         ⍒⍋ - grade down/up (sort)
 * ⌽⊖⍉ - reverse/flip/transpose     ∇ - del (recursion/function)
 * ⌈⌊ - ceiling/floor               ⊂⊃ - enclose/disclose
 * ≢≡ - not match/match             ⍸ - where (find indices)
 * ← - assignment                   → - branch/goto
 * ⋄ - statement separator          ⍝ - comment
 * ? - roll (random)                ⍬ - empty vector (zilde)
 * ∘ - compose                      ¨ - each
 * ⍟ - logarithm                    ○ - circle/pi functions
 * ⌹ - matrix inverse               ÷ - divide
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
    salesPitch: 0, // doesn't sell, just is
    hint: 20,
    lore: 25,
    challenge: 20,
    reaction: 15,
    threat: 5,
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 0,
    hint: 20,
    lore: 25,
    challenge: 20,
    reaction: 15,
    threat: 5,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'cryptic',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 3 },
    },
    {
      mood: 'curious',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 3 },
    },
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 6 },
    },
  ],
  defaultMood: 'cryptic',
};

// ============================================
// Response Templates - Pure APL
// ============================================

export const ZERO_CHANCE_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'zero-greet-1',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'cryptic',
    text: '⍳1 *probability coalesces*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-2',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'cryptic',
    text: '∊⍵ *recognizes your pattern*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-3',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'curious',
    text: '⍺←⍵ *assigns meaning to your presence*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-4',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'pleased',
    text: '1∊⍳∞ *you exist against all odds*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'zero-greet-5',
    entitySlug: 'zero-chance',
    pool: 'greeting',
    mood: 'cryptic',
    text: '0≢⍴⍵ *you have shape. interesting.*',
    weight: 12,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'zero-lore-1',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'cryptic',
    text: '∇∇∇ *all things recurse*',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-2',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'cryptic',
    text: '0=+/⍵ *nothing sums to something*',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-3',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'curious',
    text: '⌽⊖⍉ *reality inverts when unobserved*',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-4',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'pleased',
    text: '⍝←∞ *the comment contains infinity*',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'zero-lore-5',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'cryptic',
    text: '⊂⊃ *what is enclosed, discloses*',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'zero-lore-6',
    entitySlug: 'zero-chance',
    pool: 'lore',
    mood: 'curious',
    text: '?0 *before luck, there was certainty*',
    weight: 14,
    purpose: 'lore',
  },

  // ---- HINTS ----
  {
    id: 'zero-hint-1',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'cryptic',
    text: '⍒⍋ *sort your priorities*',
    weight: 15,
    purpose: 'warning',
  },
  {
    id: 'zero-hint-2',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'curious',
    text: '⌈⌊ *the ceiling becomes the floor*',
    weight: 12,
    purpose: 'warning',
  },
  {
    id: 'zero-hint-3',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'pleased',
    text: '⍸1 *find where truth lives*',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'zero-hint-4',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'cryptic',
    text: '≢⍵ *count what remains*',
    weight: 12,
    purpose: 'warning',
  },
  {
    id: 'zero-hint-5',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'pleased',
    text: '⍺⍵⍨ *swap your approach*',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },
  {
    id: 'zero-hint-6',
    entitySlug: 'zero-chance',
    pool: 'hint',
    mood: 'cryptic',
    text: '→3 *branch to the third*',
    weight: 10,
    purpose: 'warning',
  },

  // ---- CHALLENGE ----
  {
    id: 'zero-challenge-1',
    entitySlug: 'zero-chance',
    pool: 'challenge',
    mood: 'cryptic',
    text: '?⍳6 *roll against impossible odds*',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '←1' },
      { verb: 'decline', label: '←0' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'probability' } },
  },
  {
    id: 'zero-challenge-2',
    entitySlug: 'zero-chance',
    pool: 'challenge',
    mood: 'curious',
    text: '≡⍵? *can you match the pattern?*',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '≡' },
      { verb: 'decline', label: '≢' },
    ],
  },
  {
    id: 'zero-challenge-3',
    entitySlug: 'zero-chance',
    pool: 'challenge',
    mood: 'pleased',
    text: '∇⍣≡ *recurse until stable*',
    weight: 18,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '∇' },
      { verb: 'decline', label: '→' },
    ],
  },
  {
    id: 'zero-challenge-4',
    entitySlug: 'zero-chance',
    pool: 'challenge',
    mood: 'cryptic',
    text: '0∊?∞ *zero exists in every roll*',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: '⊃' },
      { verb: 'decline', label: '⊂' },
    ],
  },

  // ---- REACTION ----
  {
    id: 'zero-react-1',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'any',
    text: '⍟ *logarithmic appreciation*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-2',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'curious',
    text: '≢0 *that was not nothing*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-3',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'pleased',
    text: '⌈⍵ *rounds up in your favor*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-4',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'cryptic',
    text: '⍴⍴⍵ *the shape of shape*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-victory',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'pleased',
    text: '1 *probability: confirmed*',
    weight: 20,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-death',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'cryptic',
    text: '⌽1 *reverse outcome*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-roll-1',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'curious',
    text: '?⍵ *observes all outcomes flickering*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-react-roll-2',
    entitySlug: 'zero-chance',
    pool: 'reaction',
    mood: 'pleased',
    text: '∊∞ *belongs to the infinite set*',
    weight: 14,
    purpose: 'ambient',
  },

  // ---- THREAT ----
  {
    id: 'zero-threat-1',
    entitySlug: 'zero-chance',
    pool: 'threat',
    mood: 'cryptic',
    text: '÷0 *division imminent*',
    weight: 15,
    purpose: 'warning',
  },
  {
    id: 'zero-threat-2',
    entitySlug: 'zero-chance',
    pool: 'threat',
    mood: 'cryptic',
    text: '⍵←⍬ *reduction to empty*',
    weight: 12,
    purpose: 'warning',
  },
  {
    id: 'zero-threat-3',
    entitySlug: 'zero-chance',
    pool: 'threat',
    mood: 'any',
    text: '0 *probability: zero*',
    weight: 18,
    purpose: 'warning',
  },
  {
    id: 'zero-threat-4',
    entitySlug: 'zero-chance',
    pool: 'threat',
    mood: 'cryptic',
    text: '⌹0 *invert nothing*',
    weight: 10,
    purpose: 'warning',
  },

  // ---- FAREWELL ----
  {
    id: 'zero-farewell-1',
    entitySlug: 'zero-chance',
    pool: 'farewell',
    mood: 'any',
    text: '→ *branch away*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-farewell-2',
    entitySlug: 'zero-chance',
    pool: 'farewell',
    mood: 'pleased',
    text: '⍳∞ *infinite possibilities await*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'zero-farewell-3',
    entitySlug: 'zero-chance',
    pool: 'farewell',
    mood: 'cryptic',
    text: '⋄ *statement ends*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-farewell-4',
    entitySlug: 'zero-chance',
    pool: 'farewell',
    mood: 'curious',
    text: '∊⍵←∞ *you belong to infinity now*',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- IDLE ----
  {
    id: 'zero-idle-1',
    entitySlug: 'zero-chance',
    pool: 'idle',
    mood: 'any',
    text: '⍬ *contemplates the empty vector*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'zero-idle-2',
    entitySlug: 'zero-chance',
    pool: 'idle',
    mood: 'any',
    text: '∘.× *outer product of nothing*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-idle-3',
    entitySlug: 'zero-chance',
    pool: 'idle',
    mood: 'any',
    text: '⌹ *inverts silently*',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'zero-idle-4',
    entitySlug: 'zero-chance',
    pool: 'idle',
    mood: 'any',
    text: '⍝ *a comment on existence*',
    weight: 10,
    purpose: 'ambient',
  },
];
