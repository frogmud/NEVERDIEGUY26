/**
 * Traveler NPC Definitions
 *
 * Former playable characters - friendly allies who help the player.
 */

import type { EnhancedNPCConfig } from '../types';

// ============================================
// Stitch Up Girl - The Healer Sister
// ============================================

export const STITCH_UP_GIRL: EnhancedNPCConfig = {
  identity: {
    slug: 'stitch-up-girl',
    name: 'Stitch Up Girl',
    category: 'travelers',
    title: 'Combat Medic',
  },
  archetype: 'guardian',
  sociability: 0.7,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 5,
    hint: 25,
    lore: 15,
    challenge: 10,
    reaction: 20,
    threat: 0,
    idle: 10,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'medical-precision',
      description: 'Uses medical terminology and surgical metaphors',
      modifier: {
        poolBonus: { hint: 0.2, reaction: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'stat_threshold',
      id: 'healing-concern',
      description: 'Concerned when player is wounded',
      threshold: { stat: 'integrity', comparison: 'lt', value: 50 },
      response: 'concerned',
      intensity: 0.7,
    },
    {
      type: 'topic_mention',
      id: 'healing-talk',
      description: 'Engaged by medical topics',
      keywords: ['heal', 'hurt', 'wound', 'blood', 'surgery', 'fix'],
      response: 'focused',
      intensity: 0.6,
    },
  ],
  topicAffinity: {
    preferred: ['alliance', 'practical', 'personal'],
    avoided: ['threat'],
    expertise: ['practical', 'alliance'],
    triggers: ['threat'],
  },
  primaryGoals: [
    {
      type: 'warn_player',
      priority: 0.8,
      description: 'Warn about health dangers',
    },
    {
      type: 'improve_relationship',
      priority: 0.7,
      description: 'Build trust with travelers',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.5,
      description: 'Teach survival techniques',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    preferredLocations: ['shadow-keep', 'the-dying-saucer'],
    homeLocation: 'shadow-keep',
    knowledgeDomains: ['medicine', 'survival', 'shadow-keep'],
    spriteKey: 'stitch-up-girl',
    portraitKey: 'stitch-up-girl',
  },
};

// ============================================
// The General (Traveler) - Undead Strategist
// ============================================

export const THE_GENERAL_TRAVELER: EnhancedNPCConfig = {
  identity: {
    slug: 'the-general-traveler',
    name: 'The General',
    category: 'travelers',
    title: 'Undead Strategist',
  },
  archetype: 'warrior',
  sociability: 0.5,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 25,
    lore: 20,
    challenge: 25,
    reaction: 15,
    threat: 5,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'tactical-speak',
      description: 'Speaks in military tactics and strategy',
      modifier: {
        poolBonus: { hint: 0.15, challenge: 0.15 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'battle-tactics',
      description: 'Engaged by tactical discussion',
      keywords: ['strategy', 'tactics', 'battle', 'fight', 'war', 'command'],
      response: 'focused',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['alliance', 'practical', 'threat'],
    avoided: ['gossip', 'humor'],
    expertise: ['practical', 'alliance'],
    triggers: ['gossip'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.8,
      description: 'Assess tactical abilities',
    },
    {
      type: 'share_knowledge',
      priority: 0.7,
      description: 'Teach combat strategies',
    },
  ],
  secondaryGoals: [
    {
      type: 'recruit_ally',
      priority: 0.5,
      description: 'Find worthy tacticians',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    preferredLocations: ['earth', 'shadow-keep'],
    homeLocation: 'earth',
    knowledgeDomains: ['tactics', 'combat', 'history'],
    spriteKey: 'the-general-traveler',
    portraitKey: 'the-general-traveler',
  },
};

// ============================================
// Body Count - Silent Assassin
// ============================================

export const BODY_COUNT: EnhancedNPCConfig = {
  identity: {
    slug: 'body-count',
    name: 'Body Count',
    category: 'travelers',
    title: 'Silent Assassin',
  },
  archetype: 'predator',
  sociability: 0.3,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 5,
    salesPitch: 0,
    hint: 30,
    lore: 10,
    challenge: 25,
    reaction: 20,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'silent-deadly',
      description: 'Speaks minimally, every word counts',
      modifier: {
        poolBonus: { hint: 0.2, threat: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'stealth-talk',
      description: 'Engaged by stealth and elimination topics',
      keywords: ['stealth', 'silent', 'kill', 'target', 'shadow', 'assassin'],
      response: 'focused',
      intensity: 0.7,
    },
  ],
  topicAffinity: {
    preferred: ['threat', 'practical'],
    avoided: ['gossip', 'emotional'],
    expertise: ['stealth', 'combat'],
    triggers: ['loud'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.8,
      description: 'Test stealth capabilities',
    },
    {
      type: 'warn_player',
      priority: 0.7,
      description: 'Warn about deadly threats',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.4,
      description: 'Teach assassination techniques',
      conditions: [{ type: 'favorLevel', comparison: 'gte', value: 5 }],
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    preferredLocations: ['aberrant'],
    homeLocation: 'aberrant',
    knowledgeDomains: ['stealth', 'assassination', 'observation'],
    spriteKey: 'body-count',
    portraitKey: 'body-count',
  },
};

// ============================================
// Boots - Cosmic Cat
// ============================================

export const BOOTS: EnhancedNPCConfig = {
  identity: {
    slug: 'boots',
    name: 'Boots',
    category: 'travelers',
    title: 'Cosmic Cat',
  },
  archetype: 'diplomat',
  sociability: 0.6,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 0,
    hint: 25,
    lore: 25,
    challenge: 10,
    reaction: 15,
    threat: 0,
    idle: 5,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'cat-cosmic',
      description: 'Cat behaviors mixed with cosmic awareness',
      modifier: {
        poolBonus: { lore: 0.2, hint: 0.15 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'cat-things',
      description: 'Responds to cat and cosmic topics',
      keywords: ['cat', 'pet', 'cosmic', 'old one', 'cute', 'meow'],
      response: 'pleased',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['alliance', 'practical', 'gossip'],
    avoided: ['threat'],
    expertise: ['practical'],
    triggers: ['threat'],
  },
  primaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.8,
      description: 'Share cosmic wisdom (when in the mood)',
    },
    {
      type: 'improve_relationship',
      priority: 0.7,
      description: 'Be adored',
    },
  ],
  secondaryGoals: [
    {
      type: 'influence_mood',
      priority: 0.5,
      targetMood: 'calm',
      description: 'Bring peace through cat presence',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    isMainCharacter: true,
    preferredLocations: ['null-providence', 'the-apartment'],
    homeLocation: 'null-providence',
    knowledgeDomains: ['cosmic-secrets', 'old-ones', 'reality'],
    spriteKey: 'boots',
    portraitKey: 'boots',
  },
};

// ============================================
// Detective Clausen - Infernal Detective
// ============================================

export const CLAUSEN: EnhancedNPCConfig = {
  identity: {
    slug: 'clausen',
    name: 'Detective Clausen',
    category: 'travelers',
    title: 'Infernal Detective',
  },
  archetype: 'opportunist',
  sociability: 0.55,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 30,
    lore: 20,
    challenge: 15,
    reaction: 15,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'noir-detective',
      description: 'Speaks in noir detective style',
      modifier: {
        poolBonus: { hint: 0.2, lore: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'mystery-case',
      description: 'Engaged by mysteries and cases',
      keywords: ['mystery', 'case', 'investigate', 'clue', 'suspect', 'evidence'],
      response: 'focused',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'threat', 'gossip'],
    avoided: ['emotional'],
    expertise: ['investigation', 'infernus'],
    triggers: ['deception'],
  },
  primaryGoals: [
    {
      type: 'gather_information',
      priority: 0.9,
      description: 'Investigate everything',
    },
    {
      type: 'share_knowledge',
      priority: 0.6,
      description: 'Share case findings',
    },
  ],
  secondaryGoals: [
    {
      type: 'warn_player',
      priority: 0.5,
      description: 'Warn about dangerous situations',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    preferredLocations: ['infernus'],
    homeLocation: 'infernus',
    knowledgeDomains: ['investigation', 'infernus', 'crime'],
    spriteKey: 'clausen',
    portraitKey: 'clausen',
  },
};

// ============================================
// Keith Man - Time-Dilated Speedster
// ============================================

export const KEITH_MAN: EnhancedNPCConfig = {
  identity: {
    slug: 'keith-man',
    name: 'Keith Man',
    category: 'travelers',
    title: 'Temporal Speedster',
  },
  archetype: 'diplomat',
  sociability: 0.7,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 0,
    hint: 25,
    lore: 20,
    challenge: 15,
    reaction: 15,
    threat: 0,
    idle: 10,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'fast-talk',
      description: 'Speaks quickly, references time constantly',
      modifier: {
        poolBonus: { hint: 0.15, greeting: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'speed-time',
      description: 'Excited by speed and time topics',
      keywords: ['fast', 'speed', 'time', 'slow', 'quick', 'freeze'],
      response: 'pleased',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['practical', 'personal', 'humor'],
    avoided: ['threat'],
    expertise: ['time', 'speed'],
    triggers: ['slowness'],
  },
  primaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.8,
      description: 'Teach speed techniques',
    },
    {
      type: 'improve_relationship',
      priority: 0.6,
      description: 'Make friends quickly',
    },
  ],
  secondaryGoals: [
    {
      type: 'warn_player',
      priority: 0.5,
      description: 'Warn about temporal dangers',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    preferredLocations: ['frost-reach'],
    homeLocation: 'frost-reach',
    knowledgeDomains: ['time', 'speed', 'frost-reach'],
    spriteKey: 'keith-man',
    portraitKey: 'keith-man',
  },
};

// ============================================
// Mr. Kevin - Reality Debugger
// ============================================

export const MR_KEVIN: EnhancedNPCConfig = {
  identity: {
    slug: 'mr-kevin',
    name: 'Mr. Kevin',
    category: 'travelers',
    title: 'Reality Debugger',
  },
  archetype: 'sage',
  sociability: 0.5,
  defaultMood: 'curious',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 30,
    lore: 30,
    challenge: 15,
    reaction: 10,
    threat: 0,
    idle: 5,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'fourth-wall',
      description: 'Breaks fourth wall, references game mechanics',
      modifier: {
        poolBonus: { lore: 0.25, hint: 0.15 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'meta-game',
      description: 'Engaged by meta and game topics',
      keywords: ['game', 'bug', 'glitch', 'meta', 'reality', 'void', 'null'],
      response: 'curious',
      intensity: 0.9,
    },
  ],
  topicAffinity: {
    preferred: ['game_meta', 'lore', 'philosophy'],
    avoided: ['business'],
    expertise: ['game_meta', 'void'],
    triggers: ['normality'],
  },
  primaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.9,
      description: 'Reveal game secrets and meta knowledge',
    },
    {
      type: 'gather_information',
      priority: 0.7,
      description: 'Catalog reality bugs',
    },
  ],
  secondaryGoals: [
    {
      type: 'establish_mystery',
      priority: 0.5,
      description: 'Maintain enigmatic presence',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 0,
    canBeFought: false,
    isMainCharacter: true,
    preferredLocations: ['null-providence'],
    homeLocation: 'null-providence',
    knowledgeDomains: ['game-mechanics', 'void', 'reality-bugs'],
    spriteKey: 'mr-kevin',
    portraitKey: 'mr-kevin',
  },
};

// ============================================
// Exports
// ============================================

export const TRAVELER_NPCS: EnhancedNPCConfig[] = [
  STITCH_UP_GIRL,
  THE_GENERAL_TRAVELER,
  BODY_COUNT,
  BOOTS,
  CLAUSEN,
  KEITH_MAN,
  MR_KEVIN,
];
