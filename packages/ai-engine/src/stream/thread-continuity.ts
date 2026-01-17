/**
 * Thread Continuity System
 *
 * Makes NPCs respond to each other in the stream, creating
 * natural conversation flow rather than isolated monologues.
 */

import type { StreamEntry, StreamEntryType, VoiceProfile } from './types';
import type { SeededRng } from '../core/seeded-rng';
import { getVoiceProfile } from './voice-profiles';
import { getRelationshipFromGraph, type RelationshipType } from '../social/social-graph';

// ============================================
// Response Types
// ============================================

export interface ResponseContext {
  /** The entry being responded to */
  trigger: StreamEntry;
  /** The NPC responding */
  responderSlug: string;
  /** Relationship between responder and trigger speaker */
  relationship: RelationshipType | null;
  /** Voice profile of responder */
  responder: VoiceProfile;
}

export interface ResponseTemplate {
  id: string;
  /** What type of entry this responds to */
  triggeredBy: StreamEntryType | 'any';
  /** Relationship types this applies to */
  relationshipTypes: RelationshipType[] | 'any';
  /** Template with {{SPEAKER}}, {{CONTENT_FRAGMENT}}, etc. */
  template: string;
  /** Weight for selection */
  weight: number;
}

// ============================================
// Response Templates
// ============================================

export const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  // Generic responses
  { id: 'resp-001', triggeredBy: 'any', relationshipTypes: 'any', template: '{{SPEAKER}}... {{REACTION}}', weight: 8 },
  { id: 'resp-002', triggeredBy: 'any', relationshipTypes: 'any', template: '*acknowledges {{SPEAKER}}*', weight: 4 },
  { id: 'resp-003', triggeredBy: 'any', relationshipTypes: 'any', template: 'Hmm. {{SPEAKER}} has a point.', weight: 5 },

  // Responding to idle
  { id: 'resp-idle-001', triggeredBy: 'idle', relationshipTypes: 'any', template: "{{SPEAKER}} is in a mood today.", weight: 6 },
  { id: 'resp-idle-002', triggeredBy: 'idle', relationshipTypes: 'any', template: '*glances at {{SPEAKER}}* Same as always.', weight: 5 },
  { id: 'resp-idle-003', triggeredBy: 'idle', relationshipTypes: 'any', template: 'Did {{SPEAKER}} just say something?', weight: 4 },

  // Responding to relationship mentions
  { id: 'resp-rel-001', triggeredBy: 'relationship', relationshipTypes: 'any', template: '{{SPEAKER}} is talking about me? Interesting.', weight: 7 },
  { id: 'resp-rel-002', triggeredBy: 'relationship', relationshipTypes: 'any', template: 'I heard that, {{SPEAKER}}.', weight: 8 },
  { id: 'resp-rel-003', triggeredBy: 'relationship', relationshipTypes: 'any', template: "{{SPEAKER}} and their opinions...", weight: 5 },

  // Responding to lore
  { id: 'resp-lore-001', triggeredBy: 'lore', relationshipTypes: 'any', template: "{{SPEAKER}} knows things. Dangerous things.", weight: 6 },
  { id: 'resp-lore-002', triggeredBy: 'lore', relationshipTypes: 'any', template: "Is that true, what {{SPEAKER}} said?", weight: 5 },
  { id: 'resp-lore-003', triggeredBy: 'lore', relationshipTypes: 'any', template: 'I knew that. Everyone knows that.', weight: 4 },

  // Responding to meta
  { id: 'resp-meta-001', triggeredBy: 'meta', relationshipTypes: 'any', template: "{{SPEAKER}} gets philosophical. Again.", weight: 5 },
  { id: 'resp-meta-002', triggeredBy: 'meta', relationshipTypes: 'any', template: 'We all think about it, {{SPEAKER}}.', weight: 4 },

  // Ally responses
  { id: 'resp-ally-001', triggeredBy: 'any', relationshipTypes: ['allies', 'old_friends'], template: "{{SPEAKER}} speaks truth.", weight: 9 },
  { id: 'resp-ally-002', triggeredBy: 'any', relationshipTypes: ['allies', 'old_friends'], template: "I agree with {{SPEAKER}}. Always do.", weight: 7 },
  { id: 'resp-ally-003', triggeredBy: 'any', relationshipTypes: ['allies', 'old_friends'], template: "*nods at {{SPEAKER}}*", weight: 6 },

  // Rival responses
  { id: 'resp-rival-001', triggeredBy: 'any', relationshipTypes: ['rivals'], template: "{{SPEAKER}} would say that.", weight: 8 },
  { id: 'resp-rival-002', triggeredBy: 'any', relationshipTypes: ['rivals'], template: "Of course {{SPEAKER}} thinks so.", weight: 7 },
  { id: 'resp-rival-003', triggeredBy: 'any', relationshipTypes: ['rivals'], template: "*rolls eyes at {{SPEAKER}}*", weight: 5 },

  // Enemy responses
  { id: 'resp-enemy-001', triggeredBy: 'any', relationshipTypes: ['enemies'], template: "...", weight: 6 },
  { id: 'resp-enemy-002', triggeredBy: 'any', relationshipTypes: ['enemies'], template: "*ignores {{SPEAKER}}*", weight: 8 },
  { id: 'resp-enemy-003', triggeredBy: 'any', relationshipTypes: ['enemies'], template: "{{SPEAKER}}. Still here. Unfortunately.", weight: 5 },

  // Fear/respect responses
  { id: 'resp-fear-001', triggeredBy: 'any', relationshipTypes: ['fear_respect'], template: "*listens to {{SPEAKER}} carefully*", weight: 7 },
  { id: 'resp-fear-002', triggeredBy: 'any', relationshipTypes: ['fear_respect'], template: "{{SPEAKER}} commands attention.", weight: 6 },
];

// ============================================
// Response Generation
// ============================================

/**
 * Check if an entry should trigger a response
 */
export function shouldTriggerResponse(
  entry: StreamEntry,
  responderSlug: string,
  rng: SeededRng,
  index: number
): boolean {
  // Don't respond to self
  if (entry.speakerSlug === responderSlug) return false;

  // Check if mentioned
  if (entry.mentionsNPC === responderSlug) {
    // High chance to respond when mentioned
    return rng.random(`respond-mention:${index}`) < 0.7;
  }

  // Base chance for general response
  return rng.random(`respond-general:${index}`) < 0.25;
}

/**
 * Generate a response to a previous entry
 */
export function generateResponse(
  ctx: ResponseContext,
  rng: SeededRng,
  index: number
): string {
  // Find applicable templates
  const applicable = RESPONSE_TEMPLATES.filter(t => {
    // Check trigger type
    if (t.triggeredBy !== 'any' && t.triggeredBy !== ctx.trigger.type) {
      return false;
    }
    // Check relationship
    if (t.relationshipTypes !== 'any') {
      if (!ctx.relationship) return false;
      if (!t.relationshipTypes.includes(ctx.relationship)) return false;
    }
    return true;
  });

  if (applicable.length === 0) {
    return `*acknowledges ${ctx.trigger.speakerName}*`;
  }

  // Weight-based selection
  const weighted = applicable.map(t => ({ item: t, weight: t.weight }));
  const template = rng.randomWeighted(weighted, `response-template:${index}`);

  if (!template) {
    return `*acknowledges ${ctx.trigger.speakerName}*`;
  }

  // Fill template
  const reaction = getReaction(ctx.relationship, rng, index);
  return template.template
    .replace(/\{\{SPEAKER\}\}/g, ctx.trigger.speakerName)
    .replace(/\{\{REACTION\}\}/g, reaction);
}

/**
 * Get reaction based on relationship
 */
function getReaction(
  relationship: RelationshipType | null,
  rng: SeededRng,
  index: number
): string {
  const reactions: Record<string, string[]> = {
    allies: ['always good to hear from them', 'trustworthy as ever', 'a true friend'],
    old_friends: ['memories there', 'we go way back', 'familiar voice'],
    rivals: ['typical', 'predictable', 'same old story'],
    enemies: ['...', 'no comment', 'I have thoughts'],
    fear_respect: ['wise words', 'I listen', 'noted'],
    default: ['interesting', 'hmm', 'noted'],
  };

  const pool = relationship ? reactions[relationship] || reactions.default : reactions.default;
  return rng.randomChoice(pool, `reaction:${index}`) || 'hmm';
}

// ============================================
// Conversation Threading
// ============================================

export interface ConversationThread {
  /** IDs of entries in this thread */
  entryIds: string[];
  /** NPCs participating */
  participants: string[];
  /** Main topic/theme */
  topic: string;
  /** Is this thread still active */
  active: boolean;
}

/**
 * Detect if entries form a conversation thread
 */
export function detectThread(
  entries: StreamEntry[],
  windowSize: number = 5
): ConversationThread | null {
  if (entries.length < 2) return null;

  const recent = entries.slice(-windowSize);
  const participants = new Set<string>();
  const topics: string[] = [];

  for (const entry of recent) {
    participants.add(entry.speakerSlug);
    if (entry.mentionsNPC) participants.add(entry.mentionsNPC);
    topics.push(entry.type);
  }

  // A thread exists if there's back-and-forth (multiple speakers)
  if (participants.size >= 2) {
    return {
      entryIds: recent.map(e => e.id),
      participants: [...participants],
      topic: getMostCommonTopic(topics),
      active: true,
    };
  }

  return null;
}

function getMostCommonTopic(topics: string[]): string {
  const counts: Record<string, number> = {};
  for (const t of topics) {
    counts[t] = (counts[t] || 0) + 1;
  }
  let maxTopic = 'idle';
  let maxCount = 0;
  for (const [topic, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxTopic = topic;
    }
  }
  return maxTopic;
}

/**
 * Get a follow-up template for continuing a thread
 */
export function getThreadContinuation(
  thread: ConversationThread,
  speaker: VoiceProfile,
  rng: SeededRng,
  index: number
): string | null {
  const continuations = [
    'As I was saying...',
    'To continue...',
    'On that topic...',
    'Speaking of which...',
    'Anyway...',
    'But yes...',
    'Right, so...',
  ];

  if (rng.random(`thread-continue:${index}`) < 0.3) {
    return rng.randomChoice(continuations, `continuation:${index}`) || null;
  }

  return null;
}

// ============================================
// Direct Address Generation
// ============================================

export interface DirectAddress {
  /** NPC being addressed */
  targetSlug: string;
  /** Opening phrase */
  opening: string;
}

/**
 * Generate a direct address to another NPC
 */
export function generateDirectAddress(
  speaker: VoiceProfile,
  targetSlug: string,
  rng: SeededRng,
  index: number
): DirectAddress {
  const target = getVoiceProfile(targetSlug);
  const targetName = target?.name || targetSlug;

  const relationship = getRelationshipFromGraph(speaker.slug, targetSlug);

  let openings: string[];

  if (speaker.teases.includes(targetSlug)) {
    openings = [
      `Hey ${targetName}.`,
      `${targetName}, ${targetName}, ${targetName}...`,
      `Oh, ${targetName}.`,
      `Listen up, ${targetName}.`,
    ];
  } else if (speaker.respects.includes(targetSlug)) {
    openings = [
      `${targetName}.`,
      `A word, ${targetName}?`,
      `${targetName}, if you have a moment.`,
      `With respect, ${targetName}...`,
    ];
  } else if (speaker.avoids.includes(targetSlug)) {
    openings = [
      `...${targetName}.`,
      `*reluctantly* ${targetName}.`,
      `${targetName}. Fine.`,
    ];
  } else {
    openings = [
      `${targetName}.`,
      `Hey, ${targetName}.`,
      `${targetName}?`,
    ];
  }

  return {
    targetSlug,
    opening: rng.randomChoice(openings, `address:${index}`) || `${targetName}.`,
  };
}

// ============================================
// Reaction to Being Mentioned
// ============================================

/**
 * Generate a reaction when an NPC is mentioned by someone else
 */
export function generateMentionReaction(
  mentioned: VoiceProfile,
  mentioner: StreamEntry,
  rng: SeededRng,
  index: number
): string {
  const relationship = getRelationshipFromGraph(mentioned.slug, mentioner.speakerSlug);

  let reactions: string[];

  if (mentioned.teases.includes(mentioner.speakerSlug)) {
    reactions = [
      `${mentioner.speakerName} again? What now.`,
      `I heard that, ${mentioner.speakerName}.`,
      `${mentioner.speakerName} talks a lot.`,
    ];
  } else if (mentioned.respects.includes(mentioner.speakerSlug)) {
    reactions = [
      `${mentioner.speakerName} mentioned me?`,
      `*listens to what ${mentioner.speakerName} said*`,
      `Interesting, coming from ${mentioner.speakerName}.`,
    ];
  } else if (mentioned.avoids.includes(mentioner.speakerSlug)) {
    reactions = [
      `*doesn't acknowledge ${mentioner.speakerName}*`,
      `...`,
      `I have nothing to say about that.`,
    ];
  } else {
    reactions = [
      `${mentioner.speakerName}? What about me?`,
      `Did someone say my name?`,
      `*looks at ${mentioner.speakerName}*`,
    ];
  }

  return rng.randomChoice(reactions, `mention-reaction:${index}`) || '...';
}
