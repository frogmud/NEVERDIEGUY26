/**
 * Boo G - Spectral MC (Wanderer)
 *
 * Personality: Ghostly rapper, music-obsessed, speaks in rhymes sometimes.
 * Role: Music merchant, spectral entertainer
 * Origin: Aberrant
 * Relationship: Friendly, loves an audience
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const BOO_G_PERSONALITY: NPCPersonalityConfig = {
  slug: 'boo-g',
  name: 'Boo G',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 25, // Music equipment
    hint: 10, // Occasional tips
    lore: 20, // Ghost music history
    challenge: 15, // Rap battles
    reaction: 10,
    threat: 0, // Too chill to threaten
    idle: 5,
    farewell: 5,
  },
  poolWeights: {
    greeting: 20,
    salesPitch: 25,
    hint: 10,
    lore: 20,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 5,
    farewell: 5,
  },
  moodTriggers: [
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 0 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
  ],
  defaultMood: 'pleased', // Always performing
};

// ============================================
// Response Templates
// ============================================

export const BOO_G_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'boog-greet-pleased-1',
    entitySlug: 'boo-g',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Yo yo YO! Welcome to B\'s Hits! Where the beats are spectral and the bass drops through dimensions!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boog-greet-pleased-2',
    entitySlug: 'boo-g',
    pool: 'greeting',
    mood: 'pleased',
    text: 'BOO! *laughs* Gets \'em every time! That\'s my name AND what I do! Double meaning, baby!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'boog-greet-generous-1',
    entitySlug: 'boo-g',
    pool: 'greeting',
    mood: 'generous',
    text: 'My favorite fan returns! *ghost high-five* The crowd goes wild! ...That\'s you. You are the crowd.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'boog-lore-pleased-1',
    entitySlug: 'boo-g',
    pool: 'lore',
    mood: 'pleased',
    text: 'They said I couldn\'t drop beats after death. Now I drop beats that make the living drop DEAD! Metaphorically! Mostly!',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'boog-lore-pleased-2',
    entitySlug: 'boo-g',
    pool: 'lore',
    mood: 'pleased',
    text: 'Death couldn\'t stop my flow, just gave it echo! Now my voice carries through dimensions! Best career move ever!',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'boog-lore-generous-1',
    entitySlug: 'boo-g',
    pool: 'lore',
    mood: 'generous',
    text: 'Real talk: Jane loves my chaos beats. We collab sometimes. Aberrant raves are LEGENDARY. You should come!',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'boog-hint-pleased-1',
    entitySlug: 'boo-g',
    pool: 'hint',
    mood: 'pleased',
    text: 'Yo, heads up! The enemies ahead HATE loud music! Bring the noise and they fall apart! Trust the ghost!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'boog-hint-generous-1',
    entitySlug: 'boo-g',
    pool: 'hint',
    mood: 'generous',
    text: 'Secret show intel: there\'s a hidden venue two rooms ahead. Backstage pass territory. VIP access for my fans!',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 2 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'boog-sales-pleased-1',
    entitySlug: 'boo-g',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'Music gear! Spectral speakers! Ghost-written lyrics! Equipment that slaps in ANY dimension!',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the gear' },
      { verb: 'decline', label: 'Not my style' },
    ],
    action: { type: 'openShop', payload: { shopType: 'music' } },
  },
  {
    id: 'boog-sales-generous-1',
    entitySlug: 'boo-g',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands you headphones* Spectral cans! Hear music from OTHER dimensions! Also useful for ignoring annoying NPCs!',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'Thanks, Boo!' },
      { verb: 'decline', label: 'I like my reality' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'spectral_headphones' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'boog-challenge-pleased-1',
    entitySlug: 'boo-g',
    pool: 'challenge',
    mood: 'pleased',
    text: 'RAP BATTLE! You versus me! Winner gets bragging rights! Loser gets... also bragging rights! No losers in music!',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Drop the beat' },
      { verb: 'decline', label: 'I cannot rhyme' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'rap_battle' } },
  },

  // ---- REACTION ----
  {
    id: 'boog-react-squish-1',
    entitySlug: 'boo-g',
    pool: 'reaction',
    mood: 'any',
    text: 'OOF! That was a DROP! Like a bass drop! But flatter! Much flatter!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boog-react-death-1',
    entitySlug: 'boo-g',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Back from the dead! Like me! Except I STAYED dead and just kept performing! Work ethic!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boog-react-victory-1',
    entitySlug: 'boo-g',
    pool: 'reaction',
    mood: 'pleased',
    text: '*drops victory beat* THE CROWD GOES WILD! *crowd noises* (that was me making crowd noises)',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- HINTS (Additional) ----
  {
    id: 'boog-hint-pleased-2',
    entitySlug: 'boo-g',
    pool: 'hint',
    mood: 'pleased',
    text: "Pro tip from the ghost host: rhythm is EVERYTHING. Watch the beat, throw on tempo, maximize damage! That's bars AND advice!",
    weight: 14,
    purpose: 'warning',
  },
  {
    id: 'boog-hint-pleased-3',
    entitySlug: 'boo-g',
    pool: 'hint',
    mood: 'pleased',
    text: 'Yo, I see you struggling! Switch up your flow! Different dice, different vibes. Variety is the spice of afterlife!',
    weight: 13,
    purpose: 'warning',
  },
  {
    id: 'boog-hint-generous-2',
    entitySlug: 'boo-g',
    pool: 'hint',
    mood: 'generous',
    text: 'Real recognize real. You got potential! Check the shop - I stashed something special for performers who GET IT.',
    weight: 17,
    purpose: 'warning',
  },

  // ---- IDLE ----
  {
    id: 'boog-idle-pleased-1',
    entitySlug: 'boo-g',
    pool: 'idle',
    mood: 'pleased',
    text: '*beatboxes quietly* Boots and cats and boots and cats... Never gets old! NEVER!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'boog-idle-pleased-2',
    entitySlug: 'boo-g',
    pool: 'idle',
    mood: 'pleased',
    text: "*adjusts spectral turntables* The silence between beats? That's where the MAGIC lives, baby!",
    weight: 11,
    purpose: 'ambient',
  },
  {
    id: 'boog-idle-generous-1',
    entitySlug: 'boo-g',
    pool: 'idle',
    mood: 'generous',
    text: '*nods to music only he can hear* Yeah... this track SLAPS. Wrote it in 1847. Still fresh!',
    weight: 16,
    purpose: 'ambient',
  },

  // ---- FAREWELL ----
  {
    id: 'boog-farewell-pleased-1',
    entitySlug: 'boo-g',
    pool: 'farewell',
    mood: 'pleased',
    text: "Peace out! Keep the rhythm alive! Or dead! Both work! I'm proof!",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'boog-farewell-generous-1',
    entitySlug: 'boo-g',
    pool: 'farewell',
    mood: 'generous',
    text: "You've been a LEGENDARY crowd! *throws ghost confetti* Come back for the encore! There's ALWAYS an encore!",
    weight: 18,
    purpose: 'ambient',
  },
];
