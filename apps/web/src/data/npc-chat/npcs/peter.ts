/**
 * Peter - Die-rector of Shadow Keep (Door 3)
 *
 * Personality: DEATH PERSONIFIED. Grave, measured, sardonic about mortality.
 * Domain: Shadow Keep (death, shadows, transition, d8 domain)
 * Relationship: Mr. Bones' boss, philosophical rival to The One (void vs death)
 *
 * Voice: Speaks like someone who has attended every funeral ever held.
 * Dry humor about death. "Everyone dies. This is not a threat. This is weather."
 * Treats mortality as both inevitable and slightly amusing. Not cruel, just...
 * aware. Very, very aware. The shadows whisper to him. He whispers back.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const PETER_PERSONALITY: NPCPersonalityConfig = {
  slug: 'peter',
  name: 'Peter',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0, // Death doesn't sell
    hint: 15,
    lore: 25, // Death philosophy
    challenge: 10, // Tests worthiness
    reaction: 20, // Comments on death frequently
    threat: 20, // Ominous warnings
    idle: 0,
  },
  poolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 15,
    lore: 25,
    challenge: 10,
    reaction: 20,
    threat: 20,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'cryptic',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 2 },
    },
    {
      mood: 'amused',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
    {
      mood: 'threatening',
      trigger: { type: 'integrity', comparison: 'lt', value: 20 },
    },
  ],
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const PETER_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'peter-greet-neutral-1',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Welcome home. Death is not a destination. It is a return address.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'peter-greet-neutral-2',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Ah. Another who walks between. How long will you stay this time?',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'peter-greet-cryptic-1',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'cryptic',
    text: 'The shadow knows your name. It whispered it to me just now.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'peter-greet-amused-1',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'amused',
    text: 'You again. Death keeps such interesting company these days.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'peter-greet-threatening-1',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'threatening',
    text: 'You are close now. I can feel it. One more stumble and we meet properly.',
    weight: 18,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 30 }],
  },

  // ---- LORE ----
  {
    id: 'peter-lore-neutral-1',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'neutral',
    text: 'Shadow Keep is not a prison. It is a waiting room. Everyone passes through eventually.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'peter-lore-neutral-2',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'neutral',
    text: 'Mr. Bones handles the paperwork. I handle... everything else.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'peter-lore-cryptic-1',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'cryptic',
    text: 'The One speaks of void as if it were final. Void is absence. Death is transition. There is a difference.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'peter-lore-cryptic-2',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'cryptic',
    text: 'Every die-roll is a small death. Every result, a resurrection. You practice dying constantly.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'peter-lore-amused-1',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'amused',
    text: 'You want to know the secret of immortality? Die enough times. Eventually, it stops being an event.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'peter-lore-generous-1',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'generous',
    text: 'A truth for you: the first death is free. Every death after is a loan. We always collect eventually.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'peter-hint-neutral-1',
    entitySlug: 'peter',
    pool: 'hint',
    mood: 'neutral',
    text: 'The shadows ahead grow longer. Something waits at {{roomsAhead}} chambers.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague', roomsAhead: 2 } },
  },
  {
    id: 'peter-hint-amused-1',
    entitySlug: 'peter',
    pool: 'hint',
    mood: 'amused',
    text: 'A friendly warning: the next room has killed three travelers today. You would be fourth. Or first to survive.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 1 } },
  },
  {
    id: 'peter-hint-threatening-1',
    entitySlug: 'peter',
    pool: 'hint',
    mood: 'threatening',
    text: 'Your integrity fades. At {{integrity}}, you are more shadow than flesh. One more wound...',
    weight: 20,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 30 }],
  },

  // ---- THREAT ----
  {
    id: 'peter-threat-neutral-1',
    entitySlug: 'peter',
    pool: 'threat',
    mood: 'neutral',
    text: 'Careful. Shadow Keep claims the careless. I have room for more.',
    weight: 15,
    purpose: 'warning',
  },
  {
    id: 'peter-threat-threatening-1',
    entitySlug: 'peter',
    pool: 'threat',
    mood: 'threatening',
    text: 'I see your thread fraying. Soon it will snap. Soon you will join us properly.',
    weight: 18,
    purpose: 'warning',
    conditions: [{ type: 'integrity', comparison: 'lt', value: 25 }],
  },
  {
    id: 'peter-threat-threatening-2',
    entitySlug: 'peter',
    pool: 'threat',
    mood: 'threatening',
    text: 'Death is patient. Death is always patient. But even patience has limits.',
    weight: 15,
    purpose: 'warning',
  },
  {
    id: 'peter-threat-amused-1',
    entitySlug: 'peter',
    pool: 'threat',
    mood: 'amused',
    text: 'You flirt with death often. One day death will flirt back. I look forward to it.',
    weight: 12,
    purpose: 'warning',
  },

  // ---- REACTION ----
  {
    id: 'peter-react-death-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'any',
    text: 'And so you return. The shadow remembers your shape.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'peter-react-death-2',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'amused',
    text: 'Another death? You collect them like coins. I am almost impressed.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'peter-react-squish-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'neutral',
    text: 'The dice fall. The soul rises. The cycle continues.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'peter-react-squish-2',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'amused',
    text: 'Flattened by probability. There are worse ways to go. Not many, but some.',
    weight: 12,
    purpose: 'ambient',
  },

  // ---- CHALLENGE ----
  {
    id: 'peter-challenge-neutral-1',
    entitySlug: 'peter',
    pool: 'challenge',
    mood: 'neutral',
    text: 'A test, then. Not of strength. Of understanding. What is the difference between death and ending?',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'answer', label: 'Death returns' },
      { verb: 'answer', label: 'Ending is final' },
      { verb: 'decline', label: 'I refuse' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'philosophy' } },
  },
  {
    id: 'peter-challenge-amused-1',
    entitySlug: 'peter',
    pool: 'challenge',
    mood: 'amused',
    text: 'You have died many times. But have you ever chosen to die? Shall we find out?',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Show me' },
      { verb: 'decline', label: 'Not today' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'sacrifice' } },
  },

  // ---- DICE ROLL REACTIONS (d8 = Peter's domain) ----
  {
    id: 'peter-dice-doubles-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'amused',
    text: 'Twins falling together. Even dice travel in pairs to the grave.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'peter-dice-triples-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'cryptic',
    text: 'Three of a kind. The shadow stirs. Something notices.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'peter-dice-straight-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'neutral',
    text: 'A sequence. Like a countdown. To what, I wonder.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'peter-dice-d8-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'amused',
    text: 'The octahedron. Eight paths to eight endings. All lead here eventually.',
    weight: 20,
    purpose: 'ambient',
  },

  // ---- DEATH PERSONIFIED VOICE ----
  {
    id: 'peter-death-greet-1',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Everyone comes to Shadow Keep eventually. You are simply... early. Or late. It depends on perspective.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-greet-2',
    entitySlug: 'peter',
    pool: 'greeting',
    mood: 'amused',
    text: 'Ah. A visitor. The living always look so... temporary. It is almost charming.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-lore-1',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'neutral',
    text: 'The One speaks of void as if absence were profound. Void is nothing. Death is everything that was something. There is a difference.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'peter-death-lore-2',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'amused',
    text: 'Mr. Bones thinks he understands death because he is a skeleton. He understands paperwork. I understand endings.',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'peter-death-lore-3',
    entitySlug: 'peter',
    pool: 'lore',
    mood: 'generous',
    text: 'A truth from the shadows: death is not the opposite of life. Birth is the opposite of death. Life is the in-between. You are currently in-between.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'peter-death-hint-1',
    entitySlug: 'peter',
    pool: 'hint',
    mood: 'neutral',
    text: 'The shadows whisper your path. They say... caution. They always say caution. Shadows are pessimists.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'peter-death-hint-2',
    entitySlug: 'peter',
    pool: 'hint',
    mood: 'amused',
    text: 'Ahead lies danger. I know this because ahead always lies danger. Also because I can see the bodies. Fresh ones.',
    weight: 16,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 1 } },
  },
  {
    id: 'peter-death-react-roll-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'neutral',
    text: 'The dice land. Fate is decided. Or fate was always decided, and the dice merely revealed it. I prefer that interpretation.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-react-roll-2',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'amused',
    text: 'An interesting roll. The shadows applaud. *silence* ...They applaud quietly.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-react-death-1',
    entitySlug: 'peter',
    pool: 'reaction',
    mood: 'amused',
    text: 'You died. And now you are here. And now you will leave. Death is a revolving door for you. I find this exhausting to watch.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-threat-1',
    entitySlug: 'peter',
    pool: 'threat',
    mood: 'threatening',
    text: 'Everyone dies. This is not a threat. This is weather. I am merely the forecast.',
    weight: 18,
    purpose: 'warning',
  },
  {
    id: 'peter-death-idle-1',
    entitySlug: 'peter',
    pool: 'idle',
    mood: 'any',
    text: '*listens to shadows* ...Yes. ...No. ...That is inappropriate. *to you* They say hello.',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-idle-2',
    entitySlug: 'peter',
    pool: 'idle',
    mood: 'neutral',
    text: '*counting something invisible* Four hundred and seven today. A slow day. By my standards.',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-farewell-1',
    entitySlug: 'peter',
    pool: 'farewell',
    mood: 'neutral',
    text: 'Go. Live. For now. We will meet again. We always meet again. I have all the time in the world. And beyond.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'peter-death-farewell-2',
    entitySlug: 'peter',
    pool: 'farewell',
    mood: 'amused',
    text: 'Until death. I mean, until we meet again. They are the same thing. Eventually.',
    weight: 16,
    purpose: 'ambient',
  },
];
