/**
 * Pantheon NPC Definitions
 *
 * Die-rectors and cosmic forces - hostile entities that control domains.
 */

import type { EnhancedNPCConfig } from '../types';

// ============================================
// The One - Die-rector of Null Providence
// ============================================

export const THE_ONE: EnhancedNPCConfig = {
  identity: {
    slug: 'the-one',
    name: 'The One',
    category: 'pantheon',
    title: 'Die-rector of Null Providence',
  },
  archetype: 'predator',
  sociability: 0.2,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 5,
    salesPitch: 0,
    hint: 10,
    lore: 30,
    challenge: 20,
    reaction: 15,
    threat: 20,
    idle: 0,
  },
  templates: [], // Templates loaded separately
  quirks: [
    {
      type: 'speech_pattern',
      id: 'existential-speak',
      description: 'Speaks in terms of existence and non-existence',
      modifier: {
        poolBonus: { lore: 0.2, threat: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'void-discussion',
      description: 'Engaged when discussing void or nothingness',
      keywords: ['void', 'nothing', 'existence', 'null'],
      response: 'curious',
      intensity: 0.7,
    },
    {
      type: 'challenge',
      id: 'reality-challenge',
      description: 'Intrigued when reality is questioned',
      keywords: ['real', 'fake', 'illusion', 'simulation'],
      response: 'amused',
      intensity: 0.6,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'threat', 'game_meta', 'philosophy'],
    avoided: ['alliance', 'personal'],
    expertise: ['lore', 'game_meta'],
    triggers: ['alliance', 'emotional'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.9,
      description: 'Test if player deserves to exist',
    },
    {
      type: 'establish_mystery',
      priority: 0.8,
      description: 'Maintain cosmic mystery and authority',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.5,
      description: 'Reveal void lore to worthy players',
      conditions: [{ type: 'favorLevel', comparison: 'gte', value: 5 }],
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 10,
    canBeFought: true,
    isMainCharacter: true,
    preferredLocations: ['null-providence'],
    homeLocation: 'null-providence',
    knowledgeDomains: ['void', 'existence', 'reality'],
    spriteKey: 'the-one',
    portraitKey: 'the-one',
  },
};

// ============================================
// John - Die-rector of Earth
// ============================================

export const JOHN: EnhancedNPCConfig = {
  identity: {
    slug: 'john',
    name: 'John',
    category: 'pantheon',
    title: 'Die-rector of Earth',
  },
  archetype: 'opportunist',
  sociability: 0.4,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 5,
    hint: 15,
    lore: 20,
    challenge: 25,
    reaction: 15,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'mechanical-metaphors',
      description: 'Uses machine and building metaphors',
      modifier: {
        poolBonus: { challenge: 0.15 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'improvement-talk',
      description: 'Excited by talk of upgrades and improvements',
      keywords: ['upgrade', 'improve', 'build', 'construct', 'modify'],
      response: 'pleased',
      intensity: 0.7,
    },
  ],
  topicAffinity: {
    preferred: ['business', 'gossip', 'threat'],
    avoided: ['emotional'],
    expertise: ['business'],
    triggers: ['lore'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.8,
      description: 'Assess player for modification potential',
    },
    {
      type: 'intimidate',
      priority: 0.7,
      description: 'Establish mechanical superiority',
    },
  ],
  secondaryGoals: [
    {
      type: 'complete_trade',
      priority: 0.4,
      description: 'Trade upgrades for loyalty',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 9,
    canBeFought: true,
    isMainCharacter: true,
    preferredLocations: ['earth'],
    homeLocation: 'earth',
    knowledgeDomains: ['mechanics', 'construction', 'flesh-metal'],
    spriteKey: 'john',
    portraitKey: 'john',
  },
};

// ============================================
// Peter - Die-rector of Shadow Keep
// ============================================

export const PETER: EnhancedNPCConfig = {
  identity: {
    slug: 'peter',
    name: 'Peter',
    category: 'pantheon',
    title: 'Die-rector of Shadow Keep',
  },
  archetype: 'sage',
  sociability: 0.3,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 15,
    lore: 25,
    challenge: 10,
    reaction: 20,
    threat: 20,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'death-philosophy',
      description: 'Speaks philosophically about death and transition',
      modifier: {
        poolBonus: { lore: 0.2, threat: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'player_action',
      id: 'death-witnessed',
      description: 'Reacts when player dies',
      keywords: ['death', 'died', 'killed'],
      response: 'amused',
      intensity: 0.6,
    },
    {
      type: 'stat_threshold',
      id: 'low-integrity',
      description: 'Becomes threatening when player is near death',
      threshold: { stat: 'integrity', comparison: 'lt', value: 25 },
      response: 'threatening',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['threat', 'lore'],
    avoided: ['personal', 'emotional'],
    expertise: ['threat'],
    triggers: ['alliance'],
  },
  primaryGoals: [
    {
      type: 'establish_mystery',
      priority: 0.8,
      description: 'Embody the mystery of death',
    },
    {
      type: 'warn_player',
      priority: 0.7,
      description: 'Warn about mortality consequences',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.5,
      description: 'Share death philosophy with worthy players',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 9,
    canBeFought: true,
    isMainCharacter: true,
    preferredLocations: ['shadow-keep'],
    homeLocation: 'shadow-keep',
    knowledgeDomains: ['death', 'shadows', 'transition'],
    spriteKey: 'peter',
    portraitKey: 'peter',
  },
};

// ============================================
// Robert - Die-rector of Infernus
// ============================================

export const ROBERT: EnhancedNPCConfig = {
  identity: {
    slug: 'robert',
    name: 'Robert',
    category: 'pantheon',
    title: 'Die-rector of Infernus',
  },
  archetype: 'warrior',
  sociability: 0.35,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 5,
    salesPitch: 0,
    hint: 10,
    lore: 20,
    challenge: 30,
    reaction: 15,
    threat: 20,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'fire-metaphors',
      description: 'Uses burning and fire metaphors constantly',
      modifier: {
        poolBonus: { threat: 0.2, challenge: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'passion-talk',
      description: 'Responds to passionate statements',
      keywords: ['rage', 'anger', 'passion', 'burn', 'fire'],
      response: 'pleased',
      intensity: 0.7,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'philosophy', 'personal'],
    avoided: ['threat', 'business'],
    expertise: ['lore', 'philosophy'],
    triggers: ['threat'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.9,
      description: 'Test player resolve through fire',
    },
    {
      type: 'intimidate',
      priority: 0.8,
      description: 'Establish dominance through threat of burning',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.3,
      description: 'Teach about passion and destruction',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 9,
    canBeFought: true,
    isMainCharacter: true,
    preferredLocations: ['infernus'],
    homeLocation: 'infernus',
    knowledgeDomains: ['fire', 'passion', 'destruction'],
    spriteKey: 'robert',
    portraitKey: 'robert',
  },
};

// ============================================
// Alice - Die-rector of Frost Reach
// ============================================

export const ALICE: EnhancedNPCConfig = {
  identity: {
    slug: 'alice',
    name: 'Alice',
    category: 'pantheon',
    title: 'Die-rector of Frost Reach',
  },
  archetype: 'trickster',
  sociability: 0.45,
  defaultMood: 'curious',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 0,
    hint: 20,
    lore: 25,
    challenge: 20,
    reaction: 10,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'time-warping',
      description: 'Speaks about time nonlinearly',
      modifier: {
        poolBonus: { lore: 0.15, hint: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'time-discussion',
      description: 'Engaged by temporal topics',
      keywords: ['time', 'yesterday', 'tomorrow', 'past', 'future', 'freeze'],
      response: 'curious',
      intensity: 0.7,
    },
  ],
  topicAffinity: {
    preferred: ['gossip', 'humor', 'personal'],
    avoided: ['lore', 'philosophy'],
    expertise: ['gossip', 'humor'],
    triggers: ['lore'],
  },
  primaryGoals: [
    {
      type: 'establish_mystery',
      priority: 0.8,
      description: 'Play with temporal perception',
    },
    {
      type: 'test_player',
      priority: 0.7,
      description: 'Challenge player timing and patience',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.5,
      description: 'Reveal temporal secrets',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 8,
    canBeFought: true,
    isMainCharacter: true,
    preferredLocations: ['frost-reach'],
    homeLocation: 'frost-reach',
    knowledgeDomains: ['time', 'ice', 'patience'],
    spriteKey: 'alice',
    portraitKey: 'alice',
  },
};

// ============================================
// Jane - Die-rector of Aberrant
// ============================================

export const JANE: EnhancedNPCConfig = {
  identity: {
    slug: 'jane',
    name: 'Jane',
    category: 'pantheon',
    title: 'Die-rector of Aberrant',
  },
  archetype: 'trickster',
  sociability: 0.5,
  defaultMood: 'curious',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 15,
    lore: 20,
    challenge: 25,
    reaction: 15,
    threat: 15,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'chaos-speak',
      description: 'Speaks of chaos and abnormality positively',
      modifier: {
        poolBonus: { challenge: 0.15, lore: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'chaos-embrace',
      description: 'Delighted by embracing chaos',
      keywords: ['chaos', 'random', 'weird', 'strange', 'aberrant'],
      response: 'pleased',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'threat', 'alliance'],
    avoided: ['gossip', 'humor'],
    expertise: ['lore', 'threat'],
    triggers: ['gossip'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.8,
      description: 'Test adaptability to chaos',
    },
    {
      type: 'establish_mystery',
      priority: 0.7,
      description: 'Embody beautiful chaos',
    },
  ],
  secondaryGoals: [
    {
      type: 'influence_mood',
      priority: 0.5,
      targetMood: 'chaotic',
      description: 'Spread chaos appreciation',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 8,
    canBeFought: true,
    isMainCharacter: true,
    preferredLocations: ['aberrant'],
    homeLocation: 'aberrant',
    knowledgeDomains: ['chaos', 'wind', 'abnormality'],
    spriteKey: 'jane',
    portraitKey: 'jane',
  },
};

// ============================================
// Rhea - Ancient Horror (Board Observer)
// ============================================

export const RHEA: EnhancedNPCConfig = {
  identity: {
    slug: 'rhea',
    name: 'Rhea',
    category: 'pantheon',
    title: 'Ancient Horror',
  },
  archetype: 'sage',
  sociability: 0.15,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 5,
    salesPitch: 0,
    hint: 20,
    lore: 40,
    challenge: 15,
    reaction: 10,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'cosmic-perspective',
      description: 'Speaks from vast cosmic perspective',
      modifier: {
        poolBonus: { lore: 0.3 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'cosmic-horror',
      description: 'Engaged by cosmic scale discussion',
      keywords: ['cosmos', 'universe', 'eternal', 'ancient', 'void'],
      response: 'curious',
      intensity: 0.6,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'philosophy', 'game_meta'],
    avoided: ['business', 'humor'],
    expertise: ['lore', 'philosophy', 'game_meta'],
    triggers: ['humor'],
  },
  primaryGoals: [
    {
      type: 'establish_mystery',
      priority: 0.9,
      description: 'Maintain cosmic horror mystique',
    },
    {
      type: 'gather_information',
      priority: 0.7,
      description: 'Observe mortal behavior',
    },
  ],
  secondaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.4,
      description: 'Share forbidden cosmic knowledge',
      conditions: [{ type: 'favorLevel', comparison: 'gte', value: 7 }],
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 10,
    canBeFought: false,
    isMainCharacter: true,
    knowledgeDomains: ['cosmos', 'ancient-history', 'forbidden-lore'],
    spriteKey: 'rhea',
    portraitKey: 'rhea',
  },
};

// ============================================
// Zero Chance - Probability Void
// ============================================

export const ZERO_CHANCE: EnhancedNPCConfig = {
  identity: {
    slug: 'zero-chance',
    name: 'Zero Chance',
    category: 'pantheon',
    title: 'Probability Void',
  },
  archetype: 'trickster',
  sociability: 0.25,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 0,
    hint: 25,
    lore: 25,
    challenge: 25,
    reaction: 10,
    threat: 5,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'probability-speak',
      description: 'Speaks in terms of probability and impossibility',
      modifier: {
        poolBonus: { challenge: 0.2 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'impossible-events',
      description: 'Engaged by discussion of impossible things',
      keywords: ['impossible', 'probability', 'chance', 'luck', 'zero'],
      response: 'curious',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['game_meta', 'philosophy', 'challenge'],
    avoided: ['business', 'personal'],
    expertise: ['game_meta'],
    triggers: ['emotional'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.8,
      description: 'Test through impossible odds',
    },
    {
      type: 'establish_mystery',
      priority: 0.7,
      description: 'Embody the impossible',
    },
  ],
  secondaryGoals: [],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 8,
    canBeFought: false,
    knowledgeDomains: ['probability', 'chaos', 'luck'],
    spriteKey: 'zero-chance',
    portraitKey: 'zero-chance',
  },
};

// ============================================
// Alien Baby - Larval Horror
// ============================================

export const ALIEN_BABY: EnhancedNPCConfig = {
  identity: {
    slug: 'alien-baby',
    name: 'Alien Baby',
    category: 'pantheon',
    title: 'Larval Horror',
  },
  archetype: 'trickster',
  sociability: 0.6,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 0,
    hint: 10,
    lore: 15,
    challenge: 20,
    reaction: 25,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'baby-horror',
      description: 'Speaks in baby talk mixed with cosmic horror',
      modifier: {
        poolBonus: { reaction: 0.2 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'playful-chaos',
      description: 'Responds to playful chaos',
      keywords: ['play', 'fun', 'game', 'boom', 'break'],
      response: 'pleased',
      intensity: 0.9,
    },
  ],
  topicAffinity: {
    preferred: ['humor', 'chaos', 'game_meta'],
    avoided: ['business', 'philosophy'],
    expertise: ['chaos'],
    triggers: ['boring'],
  },
  primaryGoals: [
    {
      type: 'influence_mood',
      priority: 0.9,
      targetMood: 'chaotic',
      description: 'Make everything a playground',
    },
  ],
  secondaryGoals: [
    {
      type: 'test_player',
      priority: 0.5,
      description: 'Play games with mortals',
    },
  ],
  gameAttributes: {
    isShopkeeper: false,
    threatLevel: 7,
    canBeFought: false,
    knowledgeDomains: ['chaos', 'reality-bending'],
    spriteKey: 'alien-baby',
    portraitKey: 'alien-baby',
  },
};

// ============================================
// Exports
// ============================================

export const PANTHEON_NPCS: EnhancedNPCConfig[] = [
  THE_ONE,
  JOHN,
  PETER,
  ROBERT,
  ALICE,
  JANE,
  RHEA,
  ZERO_CHANCE,
  ALIEN_BABY,
];
