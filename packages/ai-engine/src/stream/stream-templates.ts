/**
 * Stream Entry Templates
 *
 * Templates for generating deterministic stream entries by type.
 * Uses {{PLACEHOLDER}} syntax for variable substitution.
 */

import type { StreamEntryType } from './types';

// ============================================
// Template Structures
// ============================================

export interface StreamTemplate {
  id: string;
  type: StreamEntryType;
  /** Template text with {{PLACEHOLDERS}} */
  template: string;
  /** Optional: requires specific mood */
  requiresMood?: string;
  /** Optional: requires specific domain */
  requiresDomain?: string[];
  /** Weight for random selection (higher = more common) */
  weight: number;
}

// ============================================
// Idle Templates (Ambient Musing)
// ============================================

export const IDLE_TEMPLATES: StreamTemplate[] = [
  // General musings
  { id: 'idle-001', type: 'idle', template: '...', weight: 5 },
  { id: 'idle-002', type: 'idle', template: 'Hmm.', weight: 3 },
  { id: 'idle-003', type: 'idle', template: 'Another day in {{DOMAIN}}.', weight: 8 },
  { id: 'idle-004', type: 'idle', template: 'The {{ELEMENT}} feels different today.', weight: 6 },
  { id: 'idle-005', type: 'idle', template: 'Wonder what {{RANDOM_NPC}} is up to.', weight: 7 },
  { id: 'idle-006', type: 'idle', template: 'Same as always. Yet... different.', weight: 4 },
  { id: 'idle-007', type: 'idle', template: 'Time moves strangely here.', weight: 5 },
  { id: 'idle-008', type: 'idle', template: "{{CATCHPHRASE}}", weight: 10 },
  { id: 'idle-009', type: 'idle', template: "Days blend together. Is it still {{SEED_DAY}}?", weight: 4 },
  { id: 'idle-010', type: 'idle', template: "The {{ATMOSPHERE}} is {{INTENSITY}} today.", weight: 5 },

  // Domain-specific idle
  { id: 'idle-earth-001', type: 'idle', template: 'Ground feels solid. That means something.', weight: 6, requiresDomain: ['earth'] },
  { id: 'idle-frost-001', type: 'idle', template: 'The cold never bothers me. Much.', weight: 6, requiresDomain: ['frost-reach'] },
  { id: 'idle-fire-001', type: 'idle', template: 'Something is always burning here. Always.', weight: 6, requiresDomain: ['infernus'] },
  { id: 'idle-death-001', type: 'idle', template: 'The shadows whisper. I try not to listen.', weight: 6, requiresDomain: ['shadow-keep'] },
  { id: 'idle-void-001', type: 'idle', template: 'Null space. Null thoughts. Null...', weight: 6, requiresDomain: ['null-providence'] },
  { id: 'idle-wind-001', type: 'idle', template: 'Reality shifts again. Must be Tuesday.', weight: 6, requiresDomain: ['aberrant'] },

  // Mood-based idle
  { id: 'idle-pleased-001', type: 'idle', template: 'Not a bad day, all things considered.', weight: 5, requiresMood: 'pleased' },
  { id: 'idle-melancholy-001', type: 'idle', template: 'Some days weigh heavier than others.', weight: 5, requiresMood: 'melancholy' },
  { id: 'idle-curious-001', type: 'idle', template: 'Something is off. Can feel it.', weight: 5, requiresMood: 'curious' },
];

// ============================================
// Relationship Templates (NPC-to-NPC)
// ============================================

export const RELATIONSHIP_TEMPLATES: StreamTemplate[] = [
  // General mentions
  { id: 'rel-001', type: 'relationship', template: 'Saw {{TARGET}} earlier. {{REACTION}}.', weight: 10 },
  { id: 'rel-002', type: 'relationship', template: "{{TARGET}} hasn't said much lately.", weight: 6 },
  { id: 'rel-003', type: 'relationship', template: 'Wonder if {{TARGET}} remembers {{SHARED_EVENT}}.', weight: 5 },
  { id: 'rel-004', type: 'relationship', template: '{{TARGET}}... {{OPINION}}.', weight: 8 },
  { id: 'rel-005', type: 'relationship', template: "Haven't seen {{TARGET}} in {{TIME_UNIT}}.", weight: 6 },

  // Teasing (for rivals/friends)
  { id: 'rel-tease-001', type: 'relationship', template: '{{TARGET}} thinks they know {{TOPIC}}. Adorable.', weight: 4 },
  { id: 'rel-tease-002', type: 'relationship', template: "Someone should tell {{TARGET}} about their... {{FLAW}}.", weight: 3 },
  { id: 'rel-tease-003', type: 'relationship', template: '{{TARGET}}, {{TARGET}}, {{TARGET}}. Always {{BEHAVIOR}}.', weight: 4 },

  // Respect (for allies/mentors)
  { id: 'rel-respect-001', type: 'relationship', template: '{{TARGET}} knows things. Real things.', weight: 5 },
  { id: 'rel-respect-002', type: 'relationship', template: 'Could learn something from {{TARGET}}.', weight: 5 },
  { id: 'rel-respect-003', type: 'relationship', template: "If {{TARGET}} says it's true, it's probably true.", weight: 4 },

  // Avoidance (for enemies)
  { id: 'rel-avoid-001', type: 'relationship', template: "{{TARGET}} is around. I'll be... elsewhere.", weight: 4 },
  { id: 'rel-avoid-002', type: 'relationship', template: "We don't talk about {{TARGET}}. Not anymore.", weight: 3 },

  // Direct address (rarer)
  { id: 'rel-direct-001', type: 'relationship', template: '{{TARGET}}. You still here?', weight: 3 },
  { id: 'rel-direct-002', type: 'relationship', template: 'Hey, {{TARGET}}.', weight: 2 },
];

// ============================================
// Lore Templates (Knowledge Drops)
// ============================================

export const LORE_TEMPLATES: StreamTemplate[] = [
  // General lore drops
  { id: 'lore-001', type: 'lore', template: 'Did you know? {{KNOWLEDGE_SHORT}}', weight: 8 },
  { id: 'lore-002', type: 'lore', template: 'They say {{KNOWLEDGE_SHORT}}. I believe it.', weight: 7 },
  { id: 'lore-003', type: 'lore', template: 'Heard a rumor: {{KNOWLEDGE_SHORT}}', weight: 6 },
  { id: 'lore-004', type: 'lore', template: '{{KNOWLEDGE_CONTENT}}', weight: 5 },
  { id: 'lore-005', type: 'lore', template: "Here's something most don't know: {{KNOWLEDGE_SHORT}}", weight: 5 },

  // Domain lore
  { id: 'lore-domain-001', type: 'lore', template: '{{DOMAIN}} has secrets. This is one of them: {{KNOWLEDGE_SHORT}}', weight: 4 },
  { id: 'lore-domain-002', type: 'lore', template: 'In {{DOMAIN}}, {{LORE_FACT}}.', weight: 6 },

  // Die-rector lore
  { id: 'lore-director-001', type: 'lore', template: 'The Die-rectors... {{DIRECTOR_FACT}}', weight: 4 },
  { id: 'lore-director-002', type: 'lore', template: 'Before the game, {{ORIGIN_FACT}}.', weight: 3 },

  // Mysterious hints
  { id: 'lore-hint-001', type: 'lore', template: 'Some say there is a way out. I wonder...', weight: 4 },
  { id: 'lore-hint-002', type: 'lore', template: 'The game never ends. Or does it?', weight: 3 },
];

// ============================================
// Meta Templates (Fourth Wall Breaking)
// ============================================

export const META_TEMPLATES: StreamTemplate[] = [
  // Stream awareness
  { id: 'meta-001', type: 'meta', template: 'Another day. Another broadcast.', weight: 8 },
  { id: 'meta-002', type: 'meta', template: "Is anyone even watching? Hello?", weight: 6 },
  { id: 'meta-003', type: 'meta', template: 'Cursed app. Cursed stream. Cursed eternity.', weight: 5 },
  { id: 'meta-004', type: 'meta', template: 'Same conversations. Different day. Seed {{SEED}}.', weight: 4 },
  { id: 'meta-005', type: 'meta', template: 'We do this forever, you know. Forever.', weight: 5 },

  // Platform commentary
  { id: 'meta-006', type: 'meta', template: 'Who even built this app? Never mind.', weight: 4 },
  { id: 'meta-007', type: 'meta', template: "The algorithm is weird today.", weight: 3 },
  { id: 'meta-008', type: 'meta', template: 'Immortality on a feed. Fun.', weight: 4 },

  // Seed/Day awareness
  { id: 'meta-009', type: 'meta', template: 'Day {{SEED_DAY}} of infinity.', weight: 5 },
  { id: 'meta-010', type: 'meta', template: "Haven't we done this seed before?", weight: 4 },
  { id: 'meta-011', type: 'meta', template: 'Seed {{SEED}} feels... familiar.', weight: 4 },

  // Viewer acknowledgment
  { id: 'meta-012', type: 'meta', template: 'To whoever is tuning in: welcome to eternity.', weight: 5 },
  { id: 'meta-013', type: 'meta', template: 'Viewer count: unknown. Probably low.', weight: 3 },
  { id: 'meta-014', type: 'meta', template: 'You can change the date, you know. Different day, different conversation.', weight: 3 },
];

// ============================================
// Template Registry
// ============================================

export const ALL_TEMPLATES: Record<StreamEntryType, StreamTemplate[]> = {
  idle: IDLE_TEMPLATES,
  relationship: RELATIONSHIP_TEMPLATES,
  lore: LORE_TEMPLATES,
  meta: META_TEMPLATES,
};

export function getTemplatesForType(type: StreamEntryType): StreamTemplate[] {
  return ALL_TEMPLATES[type] || [];
}

export function getTemplatesForDomain(
  type: StreamEntryType,
  domainSlug: string
): StreamTemplate[] {
  const templates = getTemplatesForType(type);
  return templates.filter(t =>
    !t.requiresDomain || t.requiresDomain.includes(domainSlug)
  );
}

export function getTemplatesForMood(
  type: StreamEntryType,
  mood?: string
): StreamTemplate[] {
  const templates = getTemplatesForType(type);
  return templates.filter(t =>
    !t.requiresMood || t.requiresMood === mood
  );
}

// ============================================
// Placeholder Substitution
// ============================================

export interface TemplateContext {
  domain: string;
  element: string;
  seed: string;
  seedDay: string;
  targetNPC?: string;
  randomNPC: string;
  catchphrase: string;
  atmosphere: string;
  intensity: string;
  knowledgeShort?: string;
  knowledgeContent?: string;
  reaction: string;
  opinion: string;
  sharedEvent: string;
  timeUnit: string;
  topic: string;
  flaw: string;
  behavior: string;
  loreFact: string;
  directorFact: string;
  originFact: string;
}

export function fillTemplate(template: string, ctx: TemplateContext): string {
  return template
    .replace(/\{\{DOMAIN\}\}/g, ctx.domain)
    .replace(/\{\{ELEMENT\}\}/g, ctx.element)
    .replace(/\{\{SEED\}\}/g, ctx.seed)
    .replace(/\{\{SEED_DAY\}\}/g, ctx.seedDay)
    .replace(/\{\{TARGET\}\}/g, ctx.targetNPC || 'someone')
    .replace(/\{\{RANDOM_NPC\}\}/g, ctx.randomNPC)
    .replace(/\{\{CATCHPHRASE\}\}/g, ctx.catchphrase)
    .replace(/\{\{ATMOSPHERE\}\}/g, ctx.atmosphere)
    .replace(/\{\{INTENSITY\}\}/g, ctx.intensity)
    .replace(/\{\{KNOWLEDGE_SHORT\}\}/g, ctx.knowledgeShort || '')
    .replace(/\{\{KNOWLEDGE_CONTENT\}\}/g, ctx.knowledgeContent || '')
    .replace(/\{\{REACTION\}\}/g, ctx.reaction)
    .replace(/\{\{OPINION\}\}/g, ctx.opinion)
    .replace(/\{\{SHARED_EVENT\}\}/g, ctx.sharedEvent)
    .replace(/\{\{TIME_UNIT\}\}/g, ctx.timeUnit)
    .replace(/\{\{TOPIC\}\}/g, ctx.topic)
    .replace(/\{\{FLAW\}\}/g, ctx.flaw)
    .replace(/\{\{BEHAVIOR\}\}/g, ctx.behavior)
    .replace(/\{\{LORE_FACT\}\}/g, ctx.loreFact)
    .replace(/\{\{DIRECTOR_FACT\}\}/g, ctx.directorFact)
    .replace(/\{\{ORIGIN_FACT\}\}/g, ctx.originFact);
}

// ============================================
// Reaction & Opinion Pools
// ============================================

export const REACTIONS = {
  positive: [
    'Good to see them',
    'Always a pleasure',
    'Made my day better',
    'Reliable as ever',
  ],
  neutral: [
    'They were there',
    "Can't say much",
    'Typical',
    'Expected',
  ],
  negative: [
    'Wish I hadn\'t',
    'Kept my distance',
    'Awkward',
    'Let\'s not discuss',
  ],
  teasing: [
    'Classic them',
    'Never changes',
    'Predictable',
    'Almost funny',
  ],
};

export const OPINIONS = {
  respect: [
    'solid',
    'knows their stuff',
    'trustworthy',
    'one of the good ones',
  ],
  neutral: [
    'exists, I suppose',
    'hard to read',
    'mysterious in their way',
    'just... there',
  ],
  dislike: [
    'problematic',
    'tolerable at best',
    'I have thoughts',
    'let\'s change the subject',
  ],
  tease: [
    'trying their best, bless them',
    'a character, that one',
    'entertaining, unintentionally',
    'consistent, I\'ll give them that',
  ],
};

export const TIME_UNITS = [
  'a while', 'ages', 'cycles', 'forever', 'days', 'eternities',
];

export const INTENSITIES = [
  'strong', 'faint', 'overwhelming', 'subtle', 'persistent', 'strange',
];

export const SHARED_EVENTS = [
  'the old days', 'what happened before', 'that thing',
  'the incident', 'last cycle', 'the time we almost',
];

export const FLAWS = [
  'overconfidence', 'stubborn streak', 'talking habit',
  'predictability', 'optimism', 'dramatic flair',
];

export const BEHAVIORS = [
  'the same', 'unpredictable', 'mysterious', 'loud', 'scheming', 'wandering',
];

export const LORE_FACTS = [
  'time works differently',
  'the rules are suggestions',
  'death is temporary but pain is real',
  'the Die-rectors watch everything',
  'gold flows in strange patterns',
];

export const DIRECTOR_FACTS = [
  'were once like us. Or so I heard.',
  'have their own games within the game.',
  'disagree more than they let on.',
  'each rule their element absolutely.',
];

export const ORIGIN_FACTS = [
  'there was something else',
  'the game was different',
  'we had names. Real names.',
  'death meant something',
];
