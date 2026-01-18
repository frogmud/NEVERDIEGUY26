/**
 * Mr. Kevin - Reality Debugger (Traveler)
 *
 * Personality: Unhinged debugger who has stared at reality's code too long.
 * Role: Fourth-wall-breaking ally, sees the seams in the simulation
 * Origin: Null Providence
 * Relationship: Friendly but distracted, knows too much, tired but wired
 *
 * Voice: Stream of consciousness, interrupts self, lowercase energy,
 * mixes tech jargon with casual dread, talks to things that aren't there
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const MR_KEVIN_PERSONALITY: NPCPersonalityConfig = {
  slug: 'mr-kevin',
  name: 'Mr. Kevin',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 5, // doesn't really sell, just offers weird tools
    hint: 30, // knows the code, shares secrets
    lore: 25, // meta knowledge about the simulation
    challenge: 5, // too distracted to challenge
    reaction: 15, // reacts to weird stuff happening
    threat: 0, // way too chill to threaten
    idle: 5, // mutters at bugs
  },
  poolWeights: {
    greeting: 15,
    salesPitch: 5,
    hint: 30,
    lore: 25,
    challenge: 5,
    reaction: 15,
    threat: 0,
    idle: 5,
  },
  moodTriggers: [
    {
      mood: 'curious',
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
  defaultMood: 'curious',
};

// ============================================
// Response Templates
// ============================================

export const MR_KEVIN_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'kevin-greet-curious-1',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'curious',
    text: 'oh! oh you loaded in. wait-- yeah okay the spawn worked. i was worried about that one.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-curious-2',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'curious',
    text: 'hey hey hey. *squints* you\'re rendering correctly which is... huh. nice.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-curious-3',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'curious',
    text: '*looks up from nothing* oh. a player. i mean person. i mean-- what are we calling you?',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-pleased-1',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'pleased',
    text: 'there you are! i saw your thread start but the callback took forever. you good?',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-greet-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'greeting',
    mood: 'generous',
    text: 'welcome! or-- wait have you been here before? the logs are-- nevermind. hi. i\'m glad you exist.',
    weight: 18,
    purpose: 'ambient',
  },

  // ---- LORE ----
  {
    id: 'kevin-lore-curious-1',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'curious',
    text: 'die-rectors? subroutines. big ones. important ones. but between us? *whispers* they don\'t know.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-curious-2',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'curious',
    text: 'okay so the void right? people think its empty but its actually-- *looks around* --its actually just unrendered. don\'t tell anyone.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-pleased-1',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'pleased',
    text: 'the simulation has layers. like an onion. a buggy onion. i\'ve seen seven. there might be more.',
    weight: 15,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-pleased-2',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'pleased',
    text: 'fun fact the sphere wasn\'t always round. someone filed a ticket. took forever to fix.',
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'kevin-lore-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'lore',
    mood: 'generous',
    text: 'the one? yeah i debug for them sometimes. nice enough. doesn\'t really "exist" in the traditional sense but who does anymore.',
    weight: 18,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },

  // ---- HINTS ----
  {
    id: 'kevin-hint-curious-1',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'curious',
    text: 'okay so that boss? their hitbox is-- *gestures vaguely* --smaller on the left. trust me i checked.',
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'tactical', roomsAhead: 1 } },
  },
  {
    id: 'kevin-hint-curious-2',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'curious',
    text: 'see that corner? no? good. don\'t look at it. its not supposed to do that.',
    weight: 12,
    purpose: 'warning',
  },
  {
    id: 'kevin-hint-pleased-1',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'pleased',
    text: 'pro tip the rng isn\'t actually random. its pseudorandom. which means-- wait you didn\'t hear that from me.',
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'detailed', roomsAhead: 3 } },
  },
  {
    id: 'kevin-hint-pleased-2',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'pleased',
    text: 'if you die just reload. or don\'t. death is just a state change. nothing personal.',
    weight: 12,
    purpose: 'warning',
  },
  {
    id: 'kevin-hint-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'hint',
    mood: 'generous',
    text: 'the third room has a memory leak. you might see duplicates. just ignore the extra ones. they\'re not real. probably.',
    weight: 20,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 5 } },
    cooldown: { oncePerRun: true },
  },

  // ---- SALES PITCH ----
  {
    id: 'kevin-sales-curious-1',
    entitySlug: 'mr-kevin',
    pool: 'salesPitch',
    mood: 'curious',
    text: 'these? these find the weird stuff. like that corner over there. dont look at it too long. its not supposed to render that way but nobody filed a ticket so.',
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'show me' },
      { verb: 'decline', label: 'im good' },
    ],
    action: { type: 'openShop', payload: { shopType: 'debug' } },
  },
  {
    id: 'kevin-sales-generous-1',
    entitySlug: 'mr-kevin',
    pool: 'salesPitch',
    mood: 'generous',
    text: '*hands you something* void key. opens things. concepts too. don\'t ask how. i don\'t know either. just works.',
    weight: 20,
    purpose: 'shop',
    quickReplies: [
      { verb: 'accept', label: 'thanks i think' },
      { verb: 'decline', label: 'that sounds dangerous' },
    ],
    action: { type: 'grantItem', payload: { itemType: 'void_key' } },
    cooldown: { oncePerRun: true },
  },

  // ---- CHALLENGE ----
  {
    id: 'kevin-challenge-curious-1',
    entitySlug: 'mr-kevin',
    pool: 'challenge',
    mood: 'curious',
    text: 'okay weird question. can you find what\'s wrong in the next room? i have a theory but i need someone to check. you know. empirically.',
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'sure why not' },
      { verb: 'decline', label: 'sounds fake' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'debug' } },
  },

  // ---- REACTION ----
  {
    id: 'kevin-react-dice-1',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'any',
    text: 'oh that was-- *checks something invisible* --that was definitely not supposed to happen. but it did! so. neat.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-react-dice-2',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'curious',
    text: 'huh. interesting. your dice rolled a-- wait that value exists? let me just-- *mutters* --okay yeah that\'s fine apparently.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-react-victory-1',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'pleased',
    text: 'nice! or concerning? i genuinely can\'t tell anymore. let\'s say nice.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-react-death-1',
    entitySlug: 'mr-kevin',
    pool: 'reaction',
    mood: 'curious',
    text: '*stares* you just... did that. on purpose? wild. the logs are gonna be interesting.',
    weight: 15,
    purpose: 'ambient',
  },

  // ---- IDLE ----
  {
    id: 'kevin-idle-1',
    entitySlug: 'mr-kevin',
    pool: 'idle',
    mood: 'any',
    text: '*stares at empty space* ...that\'s not right.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-idle-2',
    entitySlug: 'mr-kevin',
    pool: 'idle',
    mood: 'any',
    text: '*mutters* where did that pointer go...',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-idle-3',
    entitySlug: 'mr-kevin',
    pool: 'idle',
    mood: 'any',
    text: '*taps something invisible* still broken.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-idle-4',
    entitySlug: 'mr-kevin',
    pool: 'idle',
    mood: 'any',
    text: '...is that supposed to flicker?',
    weight: 10,
    purpose: 'ambient',
  },
  {
    id: 'kevin-idle-5',
    entitySlug: 'mr-kevin',
    pool: 'idle',
    mood: 'any',
    text: '*to no one* yes i know. i\'m looking at it.',
    weight: 10,
    purpose: 'ambient',
  },

  // ---- FAREWELL ----
  {
    id: 'kevin-farewell-1',
    entitySlug: 'mr-kevin',
    pool: 'farewell',
    mood: 'any',
    text: 'okay yeah go do your thing. i\'ll be here. checking... stuff.',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-farewell-2',
    entitySlug: 'mr-kevin',
    pool: 'farewell',
    mood: 'pleased',
    text: 'bye! if you crash just-- well you won\'t remember this anyway. safe travels!',
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'kevin-farewell-3',
    entitySlug: 'mr-kevin',
    pool: 'farewell',
    mood: 'curious',
    text: 'see you next loop. or this loop. time is fake here.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'kevin-farewell-4',
    entitySlug: 'mr-kevin',
    pool: 'farewell',
    mood: 'generous',
    text: 'don\'t forget to save! or do forget. the autosave might work. probably.',
    weight: 12,
    purpose: 'ambient',
  },
];
