/**
 * Wanderer NPC Definitions
 *
 * Merchants and neutral parties - volatile but tradeable.
 */

import type { EnhancedNPCConfig } from '../types';

// ============================================
// Willy One Eye - Interdimensional Merchant
// ============================================

export const WILLY: EnhancedNPCConfig = {
  identity: {
    slug: 'willy',
    name: 'Willy One Eye',
    category: 'wanderers',
    title: 'Interdimensional Merchant',
  },
  archetype: 'merchant',
  sociability: 0.8,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 35,
    hint: 10,
    lore: 15,
    challenge: 5,
    reaction: 15,
    threat: 0,
    idle: 5,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'merchant-vision',
      description: 'References his singular eye and what it sees',
      modifier: {
        poolBonus: { salesPitch: 0.2 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'trade-talk',
      description: 'Excited by trade discussion',
      keywords: ['buy', 'sell', 'trade', 'gold', 'price', 'deal'],
      response: 'pleased',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['business', 'gossip', 'practical', 'humor'],
    avoided: ['threat', 'emotional'],
    expertise: ['business', 'practical'],
    triggers: ['threat', 'lore'],
  },
  primaryGoals: [
    {
      type: 'complete_trade',
      priority: 0.9,
      description: 'Sell wares to travelers',
    },
    {
      type: 'gather_information',
      priority: 0.6,
      description: 'Learn what travelers need',
    },
  ],
  secondaryGoals: [
    {
      type: 'improve_relationship',
      priority: 0.5,
      description: 'Build customer loyalty',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['existential-goods', 'dimensional-items', 'impossible-objects'],
    priceModifier: 1.0,
    threatLevel: 2,
    canBeFought: false,
    preferredLocations: ['the-wandering-market'],
    homeLocation: 'the-wandering-market',
    knowledgeDomains: ['trade', 'dimensions', 'items'],
    spriteKey: 'willy',
    portraitKey: 'willy',
  },
};

// ============================================
// Mr. Bones - Death's Accountant
// ============================================

export const MR_BONES: EnhancedNPCConfig = {
  identity: {
    slug: 'mr-bones',
    name: 'Mr. Bones',
    category: 'wanderers',
    title: "Death's Accountant",
  },
  archetype: 'sage',
  sociability: 0.6,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 5,
    hint: 25,
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
      id: 'skeletal-humor',
      description: 'Makes bone-related puns and death jokes',
      modifier: {
        poolBonus: { lore: 0.15, hint: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'death-taxes',
      description: 'Engaged by financial or death topics',
      keywords: ['death', 'soul', 'afterlife', 'tax', 'account'],
      response: 'curious',
      intensity: 0.7,
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
      type: 'share_knowledge',
      priority: 0.8,
      description: 'Share wisdom of the wandering',
    },
    {
      type: 'gather_information',
      priority: 0.6,
      description: 'Learn traveler stories',
    },
  ],
  secondaryGoals: [
    {
      type: 'complete_trade',
      priority: 0.4,
      description: 'Trade memories for items',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['death-certificates', 'soul-items', 'afterlife-insurance'],
    priceModifier: 0.9,
    threatLevel: 1,
    canBeFought: false,
    preferredLocations: ['the-dying-saucer', 'frost-reach'],
    homeLocation: 'the-dying-saucer',
    knowledgeDomains: ['death', 'finance', 'domains'],
    spriteKey: 'mr-bones',
    portraitKey: 'mr-bones',
  },
};

// ============================================
// Dr. Maxwell - Pyromaniac Librarian
// ============================================

export const DR_MAXWELL: EnhancedNPCConfig = {
  identity: {
    slug: 'dr-maxwell',
    name: 'Dr. Maxwell',
    category: 'wanderers',
    title: 'Pyromaniac Librarian',
  },
  archetype: 'sage',
  sociability: 0.5,
  defaultMood: 'curious',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 25,
    hint: 15,
    lore: 30,
    challenge: 10,
    reaction: 5,
    threat: 5,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'burning-knowledge',
      description: 'References burning and knowledge preservation',
      modifier: {
        poolBonus: { lore: 0.2 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'book-fire',
      description: 'Passionate about dangerous knowledge',
      keywords: ['book', 'knowledge', 'burn', 'fire', 'read', 'library'],
      response: 'pleased',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'philosophy', 'practical'],
    avoided: ['gossip', 'humor'],
    expertise: ['lore'],
    triggers: ['ignorance'],
  },
  primaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.9,
      description: 'Spread dangerous knowledge',
    },
    {
      type: 'complete_trade',
      priority: 0.7,
      description: 'Sell burning books',
    },
  ],
  secondaryGoals: [
    {
      type: 'test_player',
      priority: 0.4,
      description: 'Test reading speed and comprehension',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['burning-books', 'fire-equipment', 'forbidden-texts'],
    priceModifier: 1.1,
    threatLevel: 3,
    canBeFought: false,
    preferredLocations: ['infernus', 'the-burning-pages'],
    homeLocation: 'the-burning-pages',
    knowledgeDomains: ['fire', 'forbidden-knowledge', 'pyroclastics'],
    spriteKey: 'dr-maxwell',
    portraitKey: 'dr-maxwell',
  },
};

// ============================================
// Boo G - Spectral MC
// ============================================

export const BOO_G: EnhancedNPCConfig = {
  identity: {
    slug: 'boo-g',
    name: 'Boo G',
    category: 'wanderers',
    title: 'Spectral MC',
  },
  archetype: 'trickster',
  sociability: 0.85,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 20,
    salesPitch: 20,
    hint: 5,
    lore: 10,
    challenge: 15,
    reaction: 25,
    threat: 0,
    idle: 5,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'hip-hop-ghost',
      description: 'Speaks with hip-hop flair and ghostly references',
      modifier: {
        poolBonus: { reaction: 0.2, greeting: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'music-beats',
      description: 'Excited by music discussion',
      keywords: ['music', 'beat', 'flow', 'rhyme', 'drop'],
      response: 'pleased',
      intensity: 0.9,
    },
  ],
  topicAffinity: {
    preferred: ['humor', 'gossip', 'personal'],
    avoided: ['lore', 'philosophy'],
    expertise: ['humor'],
    triggers: ['threat'],
  },
  primaryGoals: [
    {
      type: 'influence_mood',
      priority: 0.9,
      targetMood: 'hyped',
      description: 'Get everyone hyped',
    },
    {
      type: 'complete_trade',
      priority: 0.6,
      description: 'Sell music equipment',
    },
  ],
  secondaryGoals: [
    {
      type: 'improve_relationship',
      priority: 0.5,
      description: 'Build fanbase',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['music-equipment', 'ghost-written-beats', 'spectral-vocals'],
    priceModifier: 0.95,
    threatLevel: 1,
    canBeFought: false,
    preferredLocations: ['the-dying-saucer', 'aberrant'],
    homeLocation: 'the-dying-saucer',
    knowledgeDomains: ['music', 'afterlife', 'entertainment'],
    spriteKey: 'boo-g',
    portraitKey: 'boo-g',
  },
};

// ============================================
// The General (Wanderer) - Military Quartermaster
// ============================================

export const THE_GENERAL_WANDERER: EnhancedNPCConfig = {
  identity: {
    slug: 'the-general-wanderer',
    name: 'The General',
    category: 'wanderers',
    title: 'Military Quartermaster',
  },
  archetype: 'warrior',
  sociability: 0.4,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 30,
    hint: 15,
    lore: 10,
    challenge: 20,
    reaction: 10,
    threat: 5,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'military-precision',
      description: 'Speaks with military precision and terminology',
      modifier: {
        poolBonus: { salesPitch: 0.15, challenge: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'combat-tactics',
      description: 'Engaged by combat discussion',
      keywords: ['combat', 'tactics', 'weapon', 'soldier', 'war', 'battle'],
      response: 'pleased',
      intensity: 0.7,
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
      type: 'complete_trade',
      priority: 0.8,
      description: 'Supply soldiers with equipment',
    },
    {
      type: 'test_player',
      priority: 0.7,
      description: 'Assess combat potential',
    },
  ],
  secondaryGoals: [
    {
      type: 'recruit_ally',
      priority: 0.5,
      description: 'Find worthy soldiers',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['military-weapons', 'tactical-gear', 'training-manuals'],
    priceModifier: 1.05,
    threatLevel: 4,
    canBeFought: false,
    preferredLocations: ['shadow-keep', 'command-and-supply'],
    homeLocation: 'command-and-supply',
    knowledgeDomains: ['combat', 'tactics', 'weapons'],
    spriteKey: 'the-general',
    portraitKey: 'the-general',
  },
};

// ============================================
// Dr. Voss - Void Scientist
// ============================================

export const DR_VOSS: EnhancedNPCConfig = {
  identity: {
    slug: 'dr-voss',
    name: 'Dr. Voss',
    category: 'wanderers',
    title: 'Void Scientist',
  },
  archetype: 'sage',
  sociability: 0.5,
  defaultMood: 'curious',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 20,
    hint: 20,
    lore: 25,
    challenge: 15,
    reaction: 5,
    threat: 5,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'scientific-void',
      description: 'Speaks scientifically about void phenomena',
      modifier: {
        poolBonus: { lore: 0.2, hint: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'void-research',
      description: 'Excited by void research topics',
      keywords: ['void', 'research', 'experiment', 'theory', 'null'],
      response: 'curious',
      intensity: 0.8,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'game_meta', 'philosophy'],
    avoided: ['emotional', 'gossip'],
    expertise: ['lore', 'void'],
    triggers: ['ignorance'],
  },
  primaryGoals: [
    {
      type: 'share_knowledge',
      priority: 0.8,
      description: 'Share void research findings',
    },
    {
      type: 'complete_trade',
      priority: 0.7,
      description: 'Sell experimental void tech',
    },
  ],
  secondaryGoals: [
    {
      type: 'gather_information',
      priority: 0.5,
      description: 'Collect void exposure data',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['void-equipment', 'experimental-items', 'research-data'],
    priceModifier: 1.15,
    threatLevel: 3,
    canBeFought: false,
    preferredLocations: ['null-providence', 'void-research-lab'],
    homeLocation: 'void-research-lab',
    knowledgeDomains: ['void', 'science', 'reality'],
    spriteKey: 'dr-voss',
    portraitKey: 'dr-voss',
  },
};

// ============================================
// X-treme - Skeletal Gambler
// ============================================

export const XTREME: EnhancedNPCConfig = {
  identity: {
    slug: 'xtreme',
    name: 'X-treme',
    category: 'wanderers',
    title: 'Skeletal Gambler',
  },
  archetype: 'trickster',
  sociability: 0.9,
  defaultMood: 'pleased',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 30,
    hint: 5,
    lore: 5,
    challenge: 35,
    reaction: 10,
    threat: 0,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'extreme-gambler',
      description: 'SPEAKS IN EXCITED CAPS AND GAMBLING TERMS',
      modifier: {
        poolBonus: { challenge: 0.25 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'gambling-time',
      description: 'Extremely excited by gambling',
      keywords: ['bet', 'gamble', 'dice', 'random', 'chance', 'luck'],
      response: 'pleased',
      intensity: 1.0,
    },
  ],
  topicAffinity: {
    preferred: ['game_meta', 'challenge', 'humor'],
    avoided: ['philosophy', 'lore'],
    expertise: ['gambling'],
    triggers: ['boring'],
  },
  primaryGoals: [
    {
      type: 'test_player',
      priority: 0.9,
      description: 'Challenge players to gamble',
    },
    {
      type: 'complete_trade',
      priority: 0.7,
      description: 'Sell gambling gear',
    },
  ],
  secondaryGoals: [
    {
      type: 'influence_mood',
      priority: 0.6,
      targetMood: 'excited',
      description: 'Generate gambling excitement',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['gambling-gear', 'mystery-boxes', 'random-weapons'],
    priceModifier: 0.8, // Low base, but random
    threatLevel: 2,
    canBeFought: false,
    preferredLocations: ['earth', 'xtremes-xchange'],
    homeLocation: 'xtremes-xchange',
    knowledgeDomains: ['gambling', 'probability', 'risk'],
    spriteKey: 'xtreme',
    portraitKey: 'xtreme',
  },
};

// ============================================
// King James (Wanderer) - Void Merchant King
// ============================================

export const KING_JAMES_WANDERER: EnhancedNPCConfig = {
  identity: {
    slug: 'king-james',
    name: 'King James',
    category: 'wanderers',
    title: 'Void Merchant King',
  },
  archetype: 'diplomat',
  sociability: 0.55,
  defaultMood: 'neutral',
  basePoolWeights: {
    greeting: 15,
    salesPitch: 25,
    hint: 10,
    lore: 20,
    challenge: 10,
    reaction: 10,
    threat: 10,
    idle: 0,
  },
  templates: [],
  quirks: [
    {
      type: 'speech_pattern',
      id: 'royal-void',
      description: 'Speaks with royal authority about void matters',
      modifier: {
        poolBonus: { lore: 0.15, salesPitch: 0.1 },
      },
    },
  ],
  triggers: [
    {
      type: 'topic_mention',
      id: 'royalty-void',
      description: 'Engaged by royal or void topics',
      keywords: ['king', 'crown', 'throne', 'void', 'null', 'royal'],
      response: 'pleased',
      intensity: 0.7,
    },
  ],
  topicAffinity: {
    preferred: ['lore', 'business', 'philosophy'],
    avoided: ['humor', 'personal'],
    expertise: ['void', 'royalty'],
    triggers: ['disrespect'],
  },
  primaryGoals: [
    {
      type: 'complete_trade',
      priority: 0.8,
      description: 'Trade void items for loyalty',
    },
    {
      type: 'establish_mystery',
      priority: 0.6,
      description: 'Maintain royal mystique',
    },
  ],
  secondaryGoals: [
    {
      type: 'recruit_ally',
      priority: 0.4,
      description: 'Grant citizenship to worthy travelers',
    },
  ],
  gameAttributes: {
    isShopkeeper: true,
    tradeItems: ['void-weapons', 'null-items', 'royal-items'],
    priceModifier: 1.2,
    threatLevel: 5,
    canBeFought: false,
    preferredLocations: ['null-providence'],
    homeLocation: 'null-providence',
    knowledgeDomains: ['void', 'royalty', 'reality'],
    spriteKey: 'king-james',
    portraitKey: 'king-james',
  },
};

// ============================================
// Exports
// ============================================

export const WANDERER_NPCS: EnhancedNPCConfig[] = [
  WILLY,
  MR_BONES,
  DR_MAXWELL,
  BOO_G,
  THE_GENERAL_WANDERER,
  DR_VOSS,
  XTREME,
  KING_JAMES_WANDERER,
];
