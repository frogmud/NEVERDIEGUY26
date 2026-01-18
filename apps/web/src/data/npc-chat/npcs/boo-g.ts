/**
 * Boo G - Spectral MC (Wanderer)
 *
 * Personality: TRAP SOUL. Ghost rapper who never stopped performing.
 * Role: Music merchant, spectral entertainer, dimensional DJ
 * Origin: Aberrant (where the beats echo through reality rifts)
 * Relationship: Friendly, loves an audience, you are ALWAYS the audience
 *
 * Voice: Speaks in rhymes when excited. Music metaphors EVERYWHERE.
 * "The beat don't stop, and neither do I! Ghost life! GHOST LIFE!"
 * Treats life, death, and dice rolls as verses in an eternal song.
 * Drops beat-related wisdom. Every interaction is a performance.
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

  // ---- TRAP SOUL / SPECTRAL MC VOICE ----
  {
    id: 'boog-trap-greet-1',
    entitySlug: 'boo-g',
    pool: 'greeting',
    mood: 'pleased',
    text: 'Yo, I was BORN to perform, DIED performing, now I perform DEATH! The hustle never stops! NEVER! *ghostly ad-libs*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-greet-2',
    entitySlug: 'boo-g',
    pool: 'greeting',
    mood: 'generous',
    text: 'The crowd goes WILD! *crowd noise* That was me! I AM the crowd! I AM the artist! I AM the venue! GHOST LIFE!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-lore-1',
    entitySlug: 'boo-g',
    pool: 'lore',
    mood: 'pleased',
    text: 'Death took my body but not my BARS! Now I spit verses that make the living weep and the dead DANCE! *drops beat*',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'boog-trap-lore-2',
    entitySlug: 'boo-g',
    pool: 'lore',
    mood: 'generous',
    text: 'Secret collab: Jane and me got a track called "Chaos Drops at Midnight!" It plays in EVERY dimension! Top of the INFINITE charts!',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'boog-trap-hint-1',
    entitySlug: 'boo-g',
    pool: 'hint',
    mood: 'pleased',
    text: 'Listen close! The enemies ahead got NO rhythm! Attack on the downbeat! They will not see it coming! TRUST THE BEAT!',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'boog-trap-react-roll-1',
    entitySlug: 'boo-g',
    pool: 'reaction',
    mood: 'pleased',
    text: 'That roll had RHYTHM! The dice landed on the ONE! *starts beatboxing* Boot-cat-boot-cat-DICE-DROP!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-react-roll-2',
    entitySlug: 'boo-g',
    pool: 'reaction',
    mood: 'generous',
    text: '*ad-libs over the dice roll* Skrrt! Yeah! Okay! OKAY! That was FIRE! Literal and metaphorical! GHOST FIRE!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-react-death-1',
    entitySlug: 'boo-g',
    pool: 'reaction',
    mood: 'pleased',
    text: 'You DIED! But you came BACK! That is called a SAMPLE! You got SAMPLED by death and REMIXED into life! BARS!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-sales-1',
    entitySlug: 'boo-g',
    pool: 'salesPitch',
    mood: 'pleased',
    text: 'Merch drop! Got ghost chains, spectral mics, and beats that HIT different in EVERY dimension! Support the afterlife arts!',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Drop the merch' },
      { verb: 'decline', label: 'Not feeling it' },
    ],
    action: { type: 'openShop', payload: { shopType: 'music' } },
  },
  {
    id: 'boog-trap-idle-1',
    entitySlug: 'boo-g',
    pool: 'idle',
    mood: 'any',
    text: '*freestyling* My flow is cold, my soul is free, I died in 4/4 now I haunt in 3! BARS! *ghost airhorn*',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-idle-2',
    entitySlug: 'boo-g',
    pool: 'idle',
    mood: 'pleased',
    text: '*recording something on spectral equipment* This verse? Just dropped. Into my head. From the VOID. Void got BARS.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-farewell-1',
    entitySlug: 'boo-g',
    pool: 'farewell',
    mood: 'pleased',
    text: 'Stay lit! Stay dead! Wait no, stay ALIVE! But stay dead to the HATERS! You know what I mean! GHOST OUT!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'boog-trap-farewell-2',
    entitySlug: 'boo-g',
    pool: 'farewell',
    mood: 'generous',
    text: '*throws spectral roses* For my NUMBER ONE FAN! And my NUMBER TWO FAN! They are both YOU! Come to the NEXT show!',
    weight: 16,
    purpose: 'ambient',
  },
];
