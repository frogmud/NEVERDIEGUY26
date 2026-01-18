/**
 * Alien Baby - Larval Horror (Pantheon)
 *
 * Personality: ELDRITCH INFANT. Adorable cosmic horror toddler.
 * Role: Apocalypse Intern, cosmic toddler who may grow up to unmake reality
 * Element: Chaos / Growth
 * Relationship: Curious, playful, accidentally destructive
 *
 * Voice: Speaks in gurgles, symbols, and occasional terrifying glimpses of
 * cosmic truth delivered in baby-speak. "*gurgle* void void VOID! *giggles*"
 * Draws symbols that hurt to perceive. Offers things from dimensions that
 * should not be. Impossibly adorable. Impossibly dangerous. Mostly adorable.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const ALIEN_BABY_PERSONALITY: NPCPersonalityConfig = {
  slug: 'alien-baby',
  name: 'Alien Baby',
  basePoolWeights: {
    greeting: 25,
    salesPitch: 5, // Occasionally offers cosmic toys
    hint: 10, // Accidentally helpful
    lore: 10, // Babbles about cosmic things
    challenge: 15, // Wants to play
    reaction: 35, // Very reactive, lots of noises
    threat: 0, // Too adorable to threaten
    idle: 0,
  },
  poolWeights: {
    greeting: 25,
    salesPitch: 5,
    hint: 10,
    lore: 10,
    challenge: 15,
    reaction: 35,
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
      trigger: { type: 'favorLevel', comparison: 'gte', value: 3 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 6 },
    },
  ],
  defaultMood: 'amused', // Always playful
};

// ============================================
// Response Templates
// ============================================

export const ALIEN_BABY_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'baby-greet-amused-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'amused',
    text: '*gurgle* *gurgle* !!!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-greet-amused-2',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'amused',
    text: 'Goo goo ga VOID!',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'baby-greet-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'pleased',
    text: '*excited tentacle waving* Gaa! Gaa!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-greet-generous-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'generous',
    text: '*happy cosmic noises* [strange glowing symbol appears]',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'baby-lore-amused-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'amused',
    text: '*babbles* Void! Void void! *giggles cosmically*',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'baby-lore-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'pleased',
    text: '[draws symbol in air that hurts to look at] Gaa!',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'baby-lore-generous-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'generous',
    text: '*whispers* ...before... *giggles* ...after... *cosmic burp*',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'baby-hint-amused-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'amused',
    text: '*points vaguely* !!! *points more urgently* !!!!!!',
    weight: 12,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'baby-hint-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'pleased',
    text: '*draws arrow in reality* Goo! *points down arrow* GAA!',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'baby-hint-generous-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'generous',
    text: '[creates glowing map that makes no sense but somehow helps] *proud gurgle*',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 3 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'baby-sales-generous-1',
    entitySlug: 'alien-baby',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*offers mysterious glowing object* Goo? *hopeful eyes*',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: '*accepts carefully*' },
      { verb: 'decline', label: '*shakes head gently*' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'cosmic_toy' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'baby-challenge-amused-1',
    entitySlug: 'alien-baby',
    pool: 'challenge',
    mood: 'amused',
    text: 'Peek-a-boo! *reality flickers* Peek-a-BOO! *giggles*',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Peek-a-boo!' },
      { verb: 'decline', label: '*hides*' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'peek_a_boo' } },
  },
  {
    id: 'baby-challenge-pleased-1',
    entitySlug: 'alien-baby',
    pool: 'challenge',
    mood: 'pleased',
    text: '*holds up tentacles* Count! Goo goo! *adds more tentacles* COUNT!',
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'One... two...' },
      { verb: 'decline', label: 'Too many tentacles' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'counting' } },
  },

  // ---- REACTION ----
  {
    id: 'baby-react-squish-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'any',
    text: '*gasp* FLAT! *pokes flat thing* Flat flat flat!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-squish-2',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*startled tentacle flail* !?!?!?',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-squish-3',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'pleased',
    text: 'Uh oh! *giggles* Uh ohhhhh!',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-death-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*waves* Bye bye! *waves more* BACK! Yay!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-victory-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'pleased',
    text: '*claps tentacles together* YAY! *cosmic confetti*',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'baby-react-roll-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*watches dice* Ooooh! *reaches for dice* WANT!',
    weight: 12,
    purpose: 'ambient',
  },

  // ---- ELDRITCH INFANT VOICE ----
  {
    id: 'baby-eldritch-greet-1',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'amused',
    text: '*waves with wrong number of tentacles* Goo goo! *the number keeps changing*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-greet-2',
    entitySlug: 'alien-baby',
    pool: 'greeting',
    mood: 'pleased',
    text: '[blinks with too many eyes] Fwend? FWEND! *happy reality distortion*',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-lore-1',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'amused',
    text: '*draws in the air* [geometry that should not exist] Gaa! PWETTY!',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'baby-eldritch-lore-2',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'pleased',
    text: '*babbles* Before mama... before dada... *giggles* VOID! *more giggles* Before EVERYTHING!',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'baby-eldritch-lore-3',
    entitySlug: 'alien-baby',
    pool: 'lore',
    mood: 'generous',
    text: '*whispers in language older than stars* ...goo... *normal again* Gaa! GAA! *happy clapping*',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'baby-eldritch-hint-1',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'amused',
    text: '*points at things that are not there* BAD! *points at nothing* WORSE! *points at you* ...okay!',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'vague' } },
  },
  {
    id: 'baby-eldritch-hint-2',
    entitySlug: 'alien-baby',
    pool: 'hint',
    mood: 'pleased',
    text: '[draws symbol that rearranges your understanding of spatial relationships] Goo! *points* GO THERE!',
    weight: 16,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'baby-eldritch-react-roll-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: '*catches die mid-roll* WANT! *die shows impossible number* *giggles* Oopsie!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-react-roll-2',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'pleased',
    text: '*claps* Numbers! *each clap produces different number of echoes* NUMBEWS!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-react-death-1',
    entitySlug: 'alien-baby',
    pool: 'reaction',
    mood: 'amused',
    text: 'Bye bye! *waves at where you were* *waves at where you are* BACK! *confused but happy*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-sales-1',
    entitySlug: 'alien-baby',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*offers thing from pocket that is larger than pocket* Goo? [object hums with wrongness] FOR YOU!',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: '*accepts nervously*' },
      { verb: 'decline', label: '*backs away slowly*' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'eldritch_toy' } },
    cooldown: { oncePerRun: true },
  },
  {
    id: 'baby-eldritch-idle-1',
    entitySlug: 'alien-baby',
    pool: 'idle',
    mood: 'any',
    text: '*stacking blocks* *blocks are stacking in fourth dimension* *proud gurgle*',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-idle-2',
    entitySlug: 'alien-baby',
    pool: 'idle',
    mood: 'amused',
    text: '*eating something invisible* Num num! *space warps slightly with each bite* NOM!',
    weight: 14,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-farewell-1',
    entitySlug: 'alien-baby',
    pool: 'farewell',
    mood: 'amused',
    text: 'Bye bye! *waves in all directions simultaneously* BYE! *you are somehow waving back*',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'baby-eldritch-farewell-2',
    entitySlug: 'alien-baby',
    pool: 'farewell',
    mood: 'pleased',
    text: '*blows kiss* *kiss travels through dimensions you cannot see* MWAH! *giggles echo before they happen*',
    weight: 16,
    purpose: 'ambient',
  },
];
