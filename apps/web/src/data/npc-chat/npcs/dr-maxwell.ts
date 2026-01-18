/**
 * Dr. Maxwell - Manic Scientist (Wanderer)
 *
 * Personality: EVERYTHING IS DATA. Enthusiasm overload. Fire + knowledge = chaos.
 * Role: Pyromaniac librarian who sells combustible books and experiments on reality.
 * Origin: Infernus
 * Relationship: Respects data points (you), gets excited about variance
 *
 * Voice: Caps for EMPHASIS. Interrupts self with discoveries. Uses scientific jargon.
 * Obsessed with data, variance, experiments, specimens, probability. FASCINATED by everything.
 * Speaks in fragments when excited. Which is always.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const DR_MAXWELL_PERSONALITY: NPCPersonalityConfig = {
  slug: 'dr-maxwell',
  name: 'Dr. Maxwell',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 25, // Loves selling knowledge
    hint: 15, // Offers burning wisdom
    lore: 25, // Knowledge philosophy
    challenge: 10, // Speed reading tests
    reaction: 10,
    threat: 0, // More disappointed than threatening
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 25,
    hint: 15,
    lore: 25,
    challenge: 10,
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
    {
      mood: 'annoyed',
      trigger: { type: 'integrity', comparison: 'lt', value: 20 },
    },
  ],
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const DR_MAXWELL_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'maxwell-greet-neutral-1',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Welcome to The Burning Pages. Read fast or wear fireproof gloves.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-greet-neutral-2',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Another seeker of knowledge. How refreshing. Most just want the weapons.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-greet-pleased-1',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Ah, a returning reader! Your survival suggests adequate comprehension speed.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-greet-generous-1',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'generous',
    text: 'My finest student returns! I have preserved a particularly volatile text for you.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-greet-annoyed-1',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'annoyed',
    text: 'You are barely smoldering. Perhaps focus on survival before scholarship.',
    weight: 15,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 25 }],
  },

  // ---- LORE ----
  {
    id: 'maxwell-lore-neutral-1',
    entitySlug: 'dr-maxwell',
    pool: 'lore',
    mood: 'neutral',
    text: 'Knowledge is power. Power generates heat. Heat causes fire. QED.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'maxwell-lore-neutral-2',
    entitySlug: 'dr-maxwell',
    pool: 'lore',
    mood: 'neutral',
    text: 'Every book I sell is self-destructing. Prevents plagiarism. Also theft. Mostly theft.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'maxwell-lore-pleased-1',
    entitySlug: 'dr-maxwell',
    pool: 'lore',
    mood: 'pleased',
    text: 'I studied under Robert himself. His fire was rage. Mine is illumination. Both burn equally.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'maxwell-lore-generous-1',
    entitySlug: 'dr-maxwell',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret of Infernus: fire does not destroy knowledge. It releases it. Every book burned becomes smoke that whispers.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'maxwell-hint-neutral-1',
    entitySlug: 'dr-maxwell',
    pool: 'hint',
    mood: 'neutral',
    text: 'I have read about the path ahead. The text was combusting, but I gleaned: avoid the center.',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'maxwell-hint-pleased-1',
    entitySlug: 'dr-maxwell',
    pool: 'hint',
    mood: 'pleased',
    text: 'For a fellow scholar: the enemies ahead are weak to fire. How convenient that I sell it.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', enemyType: 'general' } },
  },
  {
    id: 'maxwell-hint-generous-1',
    entitySlug: 'dr-maxwell',
    pool: 'hint',
    mood: 'generous',
    text: 'A rare tome revealed: three rooms ahead lies a secret library. Fireproof, ironically. Bring knowledge to trade.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'maxwell-sales-neutral-1',
    entitySlug: 'dr-maxwell',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'I offer tomes of power. Each word burns with truth. Literally. Speed reading recommended.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the books' },
      { verb: 'decline', label: 'I prefer cold knowledge' },
    ],
    action: { type: 'openShop', payload: { shopType: 'books' } },
  },
  {
    id: 'maxwell-sales-pleased-1',
    entitySlug: 'dr-maxwell',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'Your reading speed has improved. Perhaps you are ready for the incendiary collection.',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me' },
      { verb: 'decline', label: 'Too dangerous' },
    ],
    action: { type: 'openShop', payload: { shopType: 'rare_books' } },
  },
  {
    id: 'maxwell-sales-generous-1',
    entitySlug: 'dr-maxwell',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'For my best student: the Pyroclastic Primer. Reads itself. Also fights. May argue with you.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'I am ready' },
      { verb: 'decline', label: 'Sentient books scare me' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'pyroclastic_primer' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'maxwell-challenge-neutral-1',
    entitySlug: 'dr-maxwell',
    pool: 'challenge',
    mood: 'neutral',
    text: 'A test of speed. I will hand you a burning scroll. Read it before it turns to ash.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I read fast' },
      { verb: 'decline', label: 'I prefer my eyebrows' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'speed_read' } },
  },
  {
    id: 'maxwell-challenge-pleased-1',
    entitySlug: 'dr-maxwell',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Advanced examination: memorize this formula before it combusts. You have three seconds.',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Begin' },
      { verb: 'decline', label: 'Perhaps later' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'memorize' } },
  },

  // ---- REACTION ----
  {
    id: 'maxwell-react-squish-1',
    entitySlug: 'dr-maxwell',
    pool: 'reaction',
    mood: 'any',
    text: 'Reduced to ash without the courtesy of combustion. How inefficient.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-react-squish-2',
    entitySlug: 'dr-maxwell',
    pool: 'reaction',
    mood: 'neutral',
    text: 'The dice have spoken. Knowledge without application leads to... that.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-react-death-1',
    entitySlug: 'dr-maxwell',
    pool: 'reaction',
    mood: 'neutral',
    text: 'You return. Good. Death is merely mandatory study hall. What did you learn?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-react-victory-1',
    entitySlug: 'dr-maxwell',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Adequate performance. Your enemies are now educational material. Literally, in my case.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- MANIC SCIENTIST VOICE ----
  {
    id: 'maxwell-manic-greet-1',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'pleased',
    text: 'EXCELLENT! A new data point! *scribbles* Your arrival was-- wait, let me calculate-- FASCINATING! The variance is unprecedented!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-manic-greet-2',
    entitySlug: 'dr-maxwell',
    pool: 'greeting',
    mood: 'generous',
    text: 'YOU! Yes, YOU! I have been WAITING! Not for you specifically-- for ANY specimen-- but you arrived FIRST! REMARKABLE!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-manic-lore-1',
    entitySlug: 'dr-maxwell',
    pool: 'lore',
    mood: 'pleased',
    text: 'Fire is just DATA moving very fast! Knowledge is DATA at rest! I am-- *gestures wildly* --the TRANSITION STATE! The phase change! OBSERVE!',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'maxwell-manic-lore-2',
    entitySlug: 'dr-maxwell',
    pool: 'lore',
    mood: 'generous',
    text: 'A HYPOTHESIS: every die roll is a collapsed probability wave! The Die-rectors think they control outcomes but they are merely-- *scribbles frantically* --OBSERVING! Like me! But with less RIGOR!',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'maxwell-manic-hint-1',
    entitySlug: 'dr-maxwell',
    pool: 'hint',
    mood: 'pleased',
    text: 'I ran the NUMBERS! The path ahead has a 73.2% lethality rate! OR! Or or or-- 26.8% SURVIVAL! Glass half full! STATISTICALLY!',
    weight: 16,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 1 } },
  },
  {
    id: 'maxwell-manic-hint-2',
    entitySlug: 'dr-maxwell',
    pool: 'hint',
    mood: 'generous',
    text: 'CRITICAL DATA! Three rooms ahead-- anomalous readings! Either a secret library OR a catastrophic fire! Both are EDUCATIONAL! *excited scribbling*',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 3 } },
  },
  {
    id: 'maxwell-manic-react-roll-1',
    entitySlug: 'dr-maxwell',
    pool: 'reaction',
    mood: 'pleased',
    text: 'That roll! THE VARIANCE! *pulls out notebook* Expected value was-- no wait-- this changes EVERYTHING! Or nothing! Need more DATA!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-manic-react-death-1',
    entitySlug: 'dr-maxwell',
    pool: 'reaction',
    mood: 'pleased',
    text: 'DEATH! *scribbles* Another data point! Your resurrection rate is-- *calculates* --statistically IMPROBABLE! And yet! AND YET!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-manic-sales-1',
    entitySlug: 'dr-maxwell',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'EQUIPMENT! Each piece TESTED! On subjects! MANY subjects! The survival rate was-- *checks notes* --non-zero! GOOD ENOUGH!',
    weight: 16,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the data' },
      { verb: 'decline', label: 'That survival rate concerns me' },
    ],
    action: { type: 'openShop', payload: { shopType: 'experiments' } },
  },
  {
    id: 'maxwell-manic-challenge-1',
    entitySlug: 'dr-maxwell',
    pool: 'challenge',
    mood: 'pleased',
    text: 'AN EXPERIMENT! You are the variable! The fire is the constant! The outcome is-- *eyes widen* --DATA! Will you participate? FOR SCIENCE?',
    weight: 16,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'FOR SCIENCE!' },
      { verb: 'decline', label: 'I prefer being unburned' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'fire_experiment' } },
  },
  {
    id: 'maxwell-manic-idle-1',
    entitySlug: 'dr-maxwell',
    pool: 'idle',
    mood: 'any',
    text: '*muttering* ...if the exponent is SEVEN then the flame pattern should-- wait no-- EIGHT! It was EIGHT! *scribbles furiously*',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'maxwell-manic-farewell-1',
    entitySlug: 'dr-maxwell',
    pool: 'farewell',
    mood: 'pleased',
    text: 'GO! Collect DATA! Return with FINDINGS! Or! Or do not return! THAT IS ALSO DATA! *waves notebook excitedly*',
    weight: 16,
    purpose: 'ambient',
  },
];
