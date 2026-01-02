/**
 * Conversation Threading System
 *
 * Maintains topic continuity and natural conversation flow:
 * - Topic tracking: What's being discussed
 * - Thread memory: Recent topics for callbacks
 * - Topic affinity: What each NPC prefers to discuss
 * - Exhaustion: When topics run dry
 * - Transitions: Natural segues between subjects
 */

import type { MoodType, NPCCategory } from '../core/types';

// ============================================
// Topic Types
// ============================================

export type TopicCategory =
  | 'greeting'       // Initial pleasantries
  | 'business'       // Trade, deals, transactions
  | 'personal'       // About self or others
  | 'lore'           // World history, backstory
  | 'threat'         // Hostile exchanges
  | 'alliance'       // Cooperation discussions
  | 'gossip'         // Third-party information
  | 'philosophy'     // Abstract concepts
  | 'practical'      // Survival, tactics
  | 'humor'          // Jokes, banter
  | 'emotional'      // Feelings, trauma
  | 'game_meta';     // About the game itself

export interface Topic {
  id: string;
  category: TopicCategory;
  subject: string;          // What specifically (e.g., "the-one", "escape")
  initiator: string;        // Who started this topic
  participants: string[];   // Who has engaged
  depth: number;            // How deep we've gone (0-10)
  exhaustion: number;       // 0-1, how tired this topic is
  lastMentioned: number;    // Turn number
  sentiment: number;        // -1 to 1, how this topic is perceived
  relatedTopics: string[];  // Topics this naturally leads to
}

export interface ConversationThread {
  id: string;
  topics: Topic[];
  activeTopic: string | null;
  turnCount: number;
  participants: Set<string>;
  momentum: number;         // 0-1, how engaged the conversation is
  tension: number;          // 0-1, conflict level
}

// ============================================
// Topic Definitions
// ============================================

export const TOPIC_TEMPLATES: Record<string, Partial<Topic>> = {
  'greeting-initial': {
    category: 'greeting',
    subject: 'initial-meeting',
    exhaustion: 0,
    depth: 0,
    relatedTopics: ['business-inquiry', 'personal-intro', 'gossip-local'],
  },
  'greeting-familiar': {
    category: 'greeting',
    subject: 'returning-face',
    exhaustion: 0,
    depth: 0,
    relatedTopics: ['personal-update', 'business-repeat', 'gossip-new'],
  },
  'business-inquiry': {
    category: 'business',
    subject: 'trade-interest',
    exhaustion: 0,
    depth: 0,
    relatedTopics: ['business-negotiation', 'business-decline', 'personal-favor'],
  },
  'lore-world': {
    category: 'lore',
    subject: 'the-game',
    exhaustion: 0,
    depth: 0,
    relatedTopics: ['lore-die-rectors', 'philosophy-meaning', 'practical-survival'],
  },
  'threat-warning': {
    category: 'threat',
    subject: 'danger-ahead',
    exhaustion: 0.3,
    depth: 0,
    relatedTopics: ['threat-escalation', 'alliance-proposal', 'practical-survival'],
  },
  'gossip-local': {
    category: 'gossip',
    subject: 'local-news',
    exhaustion: 0,
    depth: 0,
    relatedTopics: ['gossip-people', 'lore-world', 'threat-warning'],
  },
  'alliance-proposal': {
    category: 'alliance',
    subject: 'working-together',
    exhaustion: 0,
    depth: 0,
    relatedTopics: ['alliance-terms', 'personal-goals', 'threat-warning'],
  },
};

// ============================================
// NPC Topic Affinities
// ============================================

export interface TopicAffinity {
  preferred: TopicCategory[];
  avoided: TopicCategory[];
  expertise: TopicCategory[];
  triggers: TopicCategory[];  // Topics that provoke strong reactions
}

export const DEFAULT_TOPIC_AFFINITIES: Record<NPCCategory, TopicAffinity> = {
  pantheon: {
    preferred: ['lore', 'threat', 'game_meta', 'philosophy'],
    avoided: ['alliance', 'personal'],
    expertise: ['lore', 'game_meta'],
    triggers: ['alliance', 'emotional'],
  },
  wanderers: {
    preferred: ['business', 'gossip', 'practical', 'humor'],
    avoided: ['threat', 'emotional'],
    expertise: ['business', 'practical'],
    triggers: ['threat', 'lore'],
  },
  travelers: {
    preferred: ['alliance', 'practical', 'personal', 'gossip'],
    avoided: ['lore', 'philosophy'],
    expertise: ['practical', 'alliance'],
    triggers: ['threat', 'philosophy'],
  },
  shop: {
    preferred: ['business', 'gossip'],
    avoided: ['threat', 'philosophy'],
    expertise: ['business'],
    triggers: ['threat'],
  },
};

// ============================================
// Thread Operations
// ============================================

export function createThread(initiator: string): ConversationThread {
  return {
    id: `thread-${Date.now()}`,
    topics: [],
    activeTopic: null,
    turnCount: 0,
    participants: new Set([initiator]),
    momentum: 0.5,
    tension: 0,
  };
}

export function startTopic(
  thread: ConversationThread,
  topicId: string,
  initiator: string
): ConversationThread {
  const template = TOPIC_TEMPLATES[topicId];
  if (!template) return thread;

  const topic: Topic = {
    id: `${topicId}-${thread.turnCount}`,
    category: template.category || 'personal',
    subject: template.subject || topicId,
    initiator,
    participants: [initiator],
    depth: template.depth || 0,
    exhaustion: template.exhaustion || 0,
    lastMentioned: thread.turnCount,
    sentiment: 0,
    relatedTopics: template.relatedTopics || [],
  };

  return {
    ...thread,
    topics: [...thread.topics, topic],
    activeTopic: topic.id,
    participants: new Set([...thread.participants, initiator]),
  };
}

export function advanceTopic(
  thread: ConversationThread,
  speaker: string,
  contribution: 'positive' | 'negative' | 'neutral' | 'tangent'
): ConversationThread {
  if (!thread.activeTopic) return thread;

  const topics = thread.topics.map(t => {
    if (t.id !== thread.activeTopic) return t;

    const depthChange = contribution === 'tangent' ? 0 : 1;
    const exhaustionChange = 0.1 + (t.depth * 0.02);
    const sentimentChange =
      contribution === 'positive' ? 0.1 :
      contribution === 'negative' ? -0.1 : 0;

    return {
      ...t,
      depth: Math.min(10, t.depth + depthChange),
      exhaustion: Math.min(1, t.exhaustion + exhaustionChange),
      lastMentioned: thread.turnCount,
      sentiment: Math.max(-1, Math.min(1, t.sentiment + sentimentChange)),
      participants: [...new Set([...t.participants, speaker])],
    };
  });

  const momentumChange =
    contribution === 'positive' ? 0.1 :
    contribution === 'negative' ? 0.05 :
    contribution === 'tangent' ? -0.1 : 0;
  const tensionChange =
    contribution === 'negative' ? 0.15 :
    contribution === 'positive' ? -0.05 : 0;

  return {
    ...thread,
    topics,
    turnCount: thread.turnCount + 1,
    momentum: Math.max(0, Math.min(1, thread.momentum + momentumChange)),
    tension: Math.max(0, Math.min(1, thread.tension + tensionChange)),
    participants: new Set([...thread.participants, speaker]),
  };
}

export function getActiveTopic(thread: ConversationThread): Topic | null {
  return thread.topics.find(t => t.id === thread.activeTopic) || null;
}

export function shouldChangeTopic(thread: ConversationThread): boolean {
  const active = getActiveTopic(thread);
  if (!active) return true;
  if (active.exhaustion >= 0.8) return true;
  if (active.depth >= 7 && thread.momentum < 0.3) return true;
  if (thread.tension > 0.7 && active.category !== 'threat') return true;
  return false;
}

export function suggestNextTopic(
  thread: ConversationThread,
  speaker: string,
  speakerAffinity: TopicAffinity,
  rng: () => number
): string | null {
  const active = getActiveTopic(thread);
  const related = active?.relatedTopics || [];

  const preferred = related.filter(topicId => {
    const template = TOPIC_TEMPLATES[topicId];
    if (!template) return false;
    return speakerAffinity.preferred.includes(template.category!) ||
           !speakerAffinity.avoided.includes(template.category!);
  });

  if (preferred.length > 0) {
    return preferred[Math.floor(rng() * preferred.length)];
  }

  if (related.length > 0) {
    return related[Math.floor(rng() * related.length)];
  }

  return 'gossip-local';
}

export function detectTopicFromMessage(message: string): string | null {
  const lower = message.toLowerCase();
  const topicKeywords: Record<string, string[]> = {
    'greeting-initial': ['hello', 'hi', 'greetings', 'hey', 'howdy'],
    'business-inquiry': ['buy', 'sell', 'trade', 'deal', 'price'],
    'lore-world': ['this place', 'the game', 'world', 'universe'],
    'threat-warning': ['dangerous', 'careful', 'watch out', 'warning'],
    'gossip-local': ['heard', 'rumor', 'they say', 'word is'],
    'alliance-proposal': ['together', 'help each other', 'ally', 'join'],
  };

  for (const [topicId, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return topicId;
      }
    }
  }

  return null;
}

// ============================================
// Thread Summary for Context
// ============================================

export interface ThreadSummary {
  topicHistory: string[];
  currentSubject: string | null;
  depth: number;
  momentum: number;
  tension: number;
  participantCount: number;
  recentSentiment: number;
}

export function summarizeThread(thread: ConversationThread): ThreadSummary {
  const active = getActiveTopic(thread);
  const recentTopics = thread.topics.slice(-5);

  return {
    topicHistory: recentTopics.map(t => t.subject),
    currentSubject: active?.subject || null,
    depth: active?.depth || 0,
    momentum: thread.momentum,
    tension: thread.tension,
    participantCount: thread.participants.size,
    recentSentiment: active?.sentiment || 0,
  };
}

// ============================================
// Topic-based Response Hints
// ============================================

export interface TopicResponseHint {
  poolPreference: string[];
  moodSuggestion: MoodType | null;
  intensitySuggestion: number;
  shouldReference: string[];
}

export function getTopicResponseHint(
  thread: ConversationThread,
  speakerAffinity: TopicAffinity
): TopicResponseHint {
  const active = getActiveTopic(thread);
  const hint: TopicResponseHint = {
    poolPreference: [],
    moodSuggestion: null,
    intensitySuggestion: 50,
    shouldReference: [],
  };

  if (!active) return hint;

  switch (active.category) {
    case 'greeting':
      hint.poolPreference = ['greet', 'npc_greet'];
      hint.moodSuggestion = 'neutral';
      break;
    case 'business':
      hint.poolPreference = ['trade', 'merchant'];
      hint.moodSuggestion = 'curious';
      break;
    case 'threat':
      hint.poolPreference = ['threat', 'hostile'];
      hint.moodSuggestion = 'threatening';
      hint.intensitySuggestion = 70;
      break;
    case 'gossip':
      hint.poolPreference = ['gossip', 'react'];
      hint.moodSuggestion = 'curious';
      break;
    case 'alliance':
      hint.poolPreference = ['ally', 'generous'];
      hint.moodSuggestion = 'generous';
      break;
    case 'lore':
      hint.poolPreference = ['lore', 'gossip'];
      hint.moodSuggestion = 'cryptic';
      break;
  }

  if (speakerAffinity.expertise.includes(active.category)) {
    hint.intensitySuggestion += 15;
  }

  if (speakerAffinity.triggers.includes(active.category)) {
    hint.intensitySuggestion += 25;
  }

  if (thread.tension > 0.6) {
    hint.moodSuggestion = 'annoyed';
  }

  return hint;
}
