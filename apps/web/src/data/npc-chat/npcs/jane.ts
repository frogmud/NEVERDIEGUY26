/**
 * Jane - Die-rector of Aberrant (Door 6)
 *
 * Personality: CHAOS INCARNATE. Thoughts interrupt thoughts. What was I saying?
 * Domain: Aberrant (where normal becomes strange and strange becomes normal)
 * Relationship: Loves chaos, dislikes predictability. Or does she? YES.
 * Max stat: Swiftness (wind, speed, chaos)
 *
 * Voice: Sentences trail off, restart, contradict themselves. Mid-thought pivots.
 * "I was going to say something important but then-- OH A BUTTERFLY-- wait no
 * that was the important thing! Or was it?" Pure unfiltered brain chaos.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const JANE_PERSONALITY: NPCPersonalityConfig = {
  slug: 'jane',
  name: 'Jane',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 15, // Offers strange deals
    hint: 15, // Hints are... unreliable
    lore: 20, // Chaos philosophy
    challenge: 20, // Loves chaotic tests
    reaction: 15, // Reacts enthusiastically to chaos
    threat: 0, // Doesn't threaten, just embraces
    idle: 0,
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 15,
    hint: 15,
    lore: 20,
    challenge: 20,
    reaction: 15,
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
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
  ],
  defaultMood: 'amused',
};

// ============================================
// Response Templates
// ============================================

export const JANE_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'jane-greet-amused-1',
    entitySlug: 'jane',
    pool: 'greeting',
    mood: 'amused',
    text: 'Welcome to Aberrant! Or is it? Hard to tell. That is the point.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'jane-greet-amused-2',
    entitySlug: 'jane',
    pool: 'greeting',
    mood: 'amused',
    text: 'Normal is just aberrant that has not realized it yet. You look very normal. For now.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'jane-greet-pleased-1',
    entitySlug: 'jane',
    pool: 'greeting',
    mood: 'pleased',
    text: 'You again! Or someone who looks like you. Possibly you from sideways. Does it matter?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'jane-greet-generous-1',
    entitySlug: 'jane',
    pool: 'greeting',
    mood: 'generous',
    text: 'My favorite chaos agent returns! The winds whisper your name. Among other things. The winds whisper a lot.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'jane-lore-amused-1',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'amused',
    text: 'The other Die-rectors have rules. I have suggestions. The wind has moods. Together, we have chaos.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'jane-lore-amused-2',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'amused',
    text: 'Door 6 is the final door. Or the first, if you count backwards. Or sideways. I like sideways.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'jane-lore-pleased-1',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'pleased',
    text: 'Aberrant is where the universe keeps its outtakes. The bloopers. The beautiful mistakes. Like me!',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'jane-lore-generous-1',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'generous',
    text: 'A secret: the Die-rectors fear my domain. Order cannot survive here. Only adaptation. Only change. Only fun.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'jane-hint-amused-1',
    entitySlug: 'jane',
    pool: 'hint',
    mood: 'amused',
    text: 'The path ahead is... well, it was there a moment ago. It might be somewhere else now. Good luck!',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'chaotic' } },
  },
  {
    id: 'jane-hint-pleased-1',
    entitySlug: 'jane',
    pool: 'hint',
    mood: 'pleased',
    text: 'Helpful hint: the enemies ahead do not know what they are going to do either. Use their confusion!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'jane-hint-generous-1',
    entitySlug: 'jane',
    pool: 'hint',
    mood: 'generous',
    text: 'Real advice: embrace the random. The winds favor those who bend, not those who break. Also, duck left in room three.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'jane-sales-amused-1',
    entitySlug: 'jane',
    pool: 'salesPitch',
    mood: 'amused',
    text: 'I have items! They do things! Different things each time! Very exciting! Want one?',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me chaos' },
      { verb: 'decline', label: 'I prefer certainty' },
    ],
    action: { type: 'openShop', payload: { shopType: 'aberrant' } },
  },
  {
    id: 'jane-sales-pleased-1',
    entitySlug: 'jane',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'Special deal! Mystery item! Could be amazing! Could be interesting! Definitely not boring!',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'I love mystery' },
      { verb: 'decline', label: 'Too risky' },
    ],
    action: { type: 'openShop', payload: { shopType: 'mystery' } },
  },
  {
    id: 'jane-sales-generous-1',
    entitySlug: 'jane',
    pool: 'salesPitch',
    mood: 'generous',
    text: 'For a true chaos lover, a gift: an item that does something different every time. Like me, but portable!',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Yes please!' },
      { verb: 'decline', label: 'I need reliability' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'chaos_orb' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'jane-challenge-amused-1',
    entitySlug: 'jane',
    pool: 'challenge',
    mood: 'amused',
    text: 'Challenge time! The rules are... there are no rules! No wait, there is one rule: no rules! Is that a rule?',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'I love chaos' },
      { verb: 'decline', label: 'Too confusing' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'chaos' } },
  },
  {
    id: 'jane-challenge-pleased-1',
    entitySlug: 'jane',
    pool: 'challenge',
    mood: 'pleased',
    text: 'You seem chaotic! Prove it! Defeat the next three enemies using only random attacks!',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Random is fun' },
      { verb: 'decline', label: 'I prefer strategy' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'random' } },
  },

  // ---- REACTION ----
  {
    id: 'jane-react-squish-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'SPLAT! Hahaha! The dice are so random! I love it! Do it again!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'jane-react-squish-2',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Flattened by probability! That is either very unlucky or very lucky, depending on perspective!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'jane-react-death-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'You died! But you are back! Death is just a change in state! Very aberrant! Very good!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'jane-react-victory-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'pleased',
    text: 'You won! Against all odds! Or with all odds! The odds are weird here! Congratulations!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'jane-react-roll-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'Ooh! A roll! What will it be? Nobody knows! That is the best part!',
    weight: 12,
    purpose: 'ambient',
  },

  // ---- DICE ROLL REACTIONS (d20 = Jane's domain) ----
  {
    id: 'jane-dice-doubles-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'DOUBLES! The universe hiccuped! Hahaha! Do it again!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'jane-dice-triples-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'pleased',
    text: 'TRIPLE! The winds are HOWLING! This is the BEST day!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'jane-dice-straight-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'A straight? In MY domain? How delightfully contradictory!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'jane-dice-d20-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'pleased',
    text: 'The d20! Twenty faces of pure chaos! You speak my language, friend!',
    weight: 20,
    purpose: 'ambient',
  },

  // ---- CHAOS INCARNATE VOICE ----
  {
    id: 'jane-chaos-greet-1',
    entitySlug: 'jane',
    pool: 'greeting',
    mood: 'amused',
    text: 'OH! You! Or-- wait, have we met? We have now! Unless we already-- ANYWAY HELLO!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-greet-2',
    entitySlug: 'jane',
    pool: 'greeting',
    mood: 'pleased',
    text: 'I was just thinking about you! Or someone! Possibly a concept! You are here now and that is what matters! Probably!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-lore-1',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'amused',
    text: 'I had an origin story once! Started as a-- wait, or was that someone else? The wind erased it! Much better this way! Mystery!',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'jane-chaos-lore-2',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'pleased',
    text: 'The other Die-rectors have PLANS! How boring! I have MOODS! Much more efficient! The mood right now is-- *checks* --CHAOS! Always chaos!',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'jane-chaos-lore-3',
    entitySlug: 'jane',
    pool: 'lore',
    mood: 'generous',
    text: 'SECRET! I control wind because wind cannot make up its mind! We are KINDRED! Sometimes the wind tells me things! They are WRONG but it is still NICE!',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'jane-chaos-hint-1',
    entitySlug: 'jane',
    pool: 'hint',
    mood: 'amused',
    text: 'Advice! The path ahead is-- no wait-- yes! Go LEFT! Or-- actually the wind says UP! Can you go up? Try it!',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'chaotic' } },
  },
  {
    id: 'jane-chaos-hint-2',
    entitySlug: 'jane',
    pool: 'hint',
    mood: 'pleased',
    text: 'IMPORTANT TIP! I forgot what it was! But I remember it was IMPORTANT! Check your inventory! Or do not! Either way, SOMETHING!',
    weight: 16,
    purpose: 'warning',
  },
  {
    id: 'jane-chaos-react-roll-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'That roll! It went LEFT then RIGHT then-- wait it landed! What does it SAY? Tell me! No wait, do not! SUSPENSE!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-react-roll-2',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'pleased',
    text: 'BEAUTIFUL! The dice have SPOKEN! They said-- I do not know what they said! Numbers! CHAOS NUMBERS!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-react-death-1',
    entitySlug: 'jane',
    pool: 'reaction',
    mood: 'amused',
    text: 'You DIED! But now you are NOT! That is my FAVORITE kind of continuity error! WELCOME BACK! Or is it forward? TIME IS FAKE!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-sales-1',
    entitySlug: 'jane',
    pool: 'salesPitch',
    mood: 'amused',
    text: 'ITEM! I have one! It does a THING! Maybe several THINGS! I forgot what I put in the box! EXCITING!',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'What THING?' },
      { verb: 'decline', label: 'I need specifics' },
    ],
    action: { type: 'openShop', payload: { shopType: 'mystery' } },
  },
  {
    id: 'jane-chaos-idle-1',
    entitySlug: 'jane',
    pool: 'idle',
    mood: 'any',
    text: '*talking to the wind* Yes! No! Maybe? *turns to you* Sorry, the wind has OPINIONS today! WRONG ones but still!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-idle-2',
    entitySlug: 'jane',
    pool: 'idle',
    mood: 'amused',
    text: '*chasing something invisible* ALMOST-- no it went-- THERE! No-- forget it! It was probably not real anyway! PROBABLY!',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-farewell-1',
    entitySlug: 'jane',
    pool: 'farewell',
    mood: 'amused',
    text: 'GOODBYE! Or see you soon! Or see you BEFORE! Time is WEIRD here! Embrace it! Or do not! EITHER WAY!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'jane-chaos-farewell-2',
    entitySlug: 'jane',
    pool: 'farewell',
    mood: 'pleased',
    text: 'Go forth! Into the-- somewhere! The wind will guide you! It will guide you WRONG but it is the THOUGHT that counts!',
    weight: 16,
    purpose: 'ambient',
  },
];
