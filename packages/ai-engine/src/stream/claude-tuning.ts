/**
 * Claude-Powered Stream Tuning
 *
 * Use Claude to interpret natural language queries and find
 * the right channel/moment in the eternal broadcast.
 *
 * Instead of chatting with Claude, users ask Claude to "tune in" to
 * the right stream based on what they want to hear.
 */

import type { StreamEntry, VoiceProfile } from './types';
import { VOICE_PROFILES, getAllVoiceProfiles, DOMAIN_CONTEXTS } from './voice-profiles';
import { DOMAIN_LORE_POOLS } from './domain-lore';
import {
  Channel,
  todaySeed,
  createChannel,
  sampleStream,
  getAllChannelsForSeed,
  type StreamSample,
} from './eternal-calendar';
import {
  DiscoveryQuery,
  DiscoveryResult,
  searchStreams,
  findNPC,
  getRecommendations,
} from './stream-discovery';
import { generateEnhancedDayStream } from './enhanced-stream';

// ============================================
// Tuning Request Types
// ============================================

export interface TuningRequest {
  /** The user's natural language query */
  query: string;
  /** Current seed (defaults to today) */
  currentSeed?: string;
  /** User preferences for better recommendations */
  preferences?: {
    favoriteNPCs?: string[];
    favoriteTopics?: string[];
    favoriteDomains?: string[];
  };
}

export interface TuningResponse {
  /** Interpreted intent */
  intent: TuningIntent;
  /** Recommended channel(s) */
  channels: TunedChannel[];
  /** Explanation of why these channels were chosen */
  explanation: string;
  /** Suggested follow-up queries */
  suggestions: string[];
}

export type TuningIntent =
  | 'find_npc'           // User wants to hear from specific NPC
  | 'find_topic'         // User wants to hear about a topic
  | 'find_interaction'   // User wants to hear two NPCs talk
  | 'find_lore'          // User wants lore/secrets
  | 'find_drama'         // User wants conflict/tension
  | 'find_meta'          // User wants fourth-wall content
  | 'explore'            // User wants something new
  | 'specific_day'       // User asked for a specific date
  | 'unclear';           // Couldn't determine intent

export interface TunedChannel {
  channel: Channel;
  /** Why this channel was recommended */
  reason: string;
  /** Relevance score (0-1) */
  confidence: number;
  /** Sample entries for preview */
  preview: StreamEntry[];
  /** Specific entry to start at (if applicable) */
  startAt?: StreamEntry;
}

// ============================================
// Query Interpretation (No Claude Needed)
// ============================================

/**
 * Interpret a user query locally (fast, no API call)
 *
 * This handles common patterns without needing Claude.
 * Falls back to Claude for complex queries.
 */
export function interpretQueryLocally(query: string): {
  intent: TuningIntent;
  params: Partial<DiscoveryQuery>;
  needsClaude: boolean;
} {
  const lowerQuery = query.toLowerCase();

  // Find NPC by name
  for (const [slug, profile] of Object.entries(VOICE_PROFILES)) {
    const nameLower = profile.name.toLowerCase();
    if (lowerQuery.includes(nameLower) || lowerQuery.includes(slug)) {
      return {
        intent: 'find_npc',
        params: { npcs: [slug] },
        needsClaude: false,
      };
    }
  }

  // Find by topic keywords
  const topicKeywords: Record<string, string[]> = {
    'die-rectors': ['die-rector', 'director', 'pantheon', 'the one', 'john', 'peter'],
    'death': ['death', 'dead', 'soul', 'afterlife', 'bones'],
    'trade': ['trade', 'buy', 'sell', 'gold', 'shop', 'deal', 'merchant'],
    'escape': ['escape', 'exit', 'leave', 'door', 'way out', 'freedom'],
    'lore': ['lore', 'history', 'origin', 'before', 'secret', 'truth'],
    'prophecy': ['prophecy', 'prophecies', 'foretold', 'predict', 'future'],
    'revolution': ['revolution', 'resist', 'fight', 'rebellion', 'travelers'],
    'gambling': ['gamble', 'bet', 'dice', 'chance', 'xtreme', 'odds'],
    'fire': ['fire', 'burn', 'flame', 'infernus', 'maxwell'],
    'ice': ['ice', 'cold', 'frost', 'freeze', 'jane'],
    'void': ['void', 'null', 'nothing', 'empty', 'providence'],
    'chaos': ['chaos', 'wind', 'aberrant', 'robert', 'wild'],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(k => lowerQuery.includes(k))) {
      return {
        intent: 'find_topic',
        params: { topics: [topic] },
        needsClaude: false,
      };
    }
  }

  // Find by entry type
  if (lowerQuery.includes('lore') || lowerQuery.includes('secret')) {
    return {
      intent: 'find_lore',
      params: { entryTypes: ['lore'] },
      needsClaude: false,
    };
  }
  if (lowerQuery.includes('meta') || lowerQuery.includes('fourth wall') || lowerQuery.includes('break')) {
    return {
      intent: 'find_meta',
      params: { entryTypes: ['meta'] },
      needsClaude: false,
    };
  }
  if (lowerQuery.includes('drama') || lowerQuery.includes('fight') || lowerQuery.includes('conflict')) {
    return {
      intent: 'find_drama',
      params: { mood: 'tense' },
      needsClaude: false,
    };
  }

  // Find by domain
  for (const [slug, domain] of Object.entries(DOMAIN_CONTEXTS)) {
    if (lowerQuery.includes(domain.name.toLowerCase()) || lowerQuery.includes(slug)) {
      return {
        intent: 'find_topic',
        params: { domains: [slug] },
        needsClaude: false,
      };
    }
  }

  // Explore/random
  if (lowerQuery.includes('random') || lowerQuery.includes('surprise') || lowerQuery.includes('explore')) {
    return {
      intent: 'explore',
      params: {},
      needsClaude: false,
    };
  }

  // Date patterns
  if (lowerQuery.includes('today')) {
    return {
      intent: 'specific_day',
      params: {},
      needsClaude: false,
    };
  }
  if (lowerQuery.includes('yesterday')) {
    return {
      intent: 'specific_day',
      params: {},
      needsClaude: false,
    };
  }

  // Can't determine locally
  return {
    intent: 'unclear',
    params: {},
    needsClaude: true,
  };
}

// ============================================
// Fast Tuning (No Claude)
// ============================================

/**
 * Tune to a channel based on a query (fast, local)
 */
export function tuneLocal(request: TuningRequest): TuningResponse {
  const seed = request.currentSeed || todaySeed();
  const { intent, params } = interpretQueryLocally(request.query);

  // Generate search seeds (today + a few days back)
  const seeds = [seed];
  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    seeds.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  }

  let channels: TunedChannel[] = [];
  let explanation = '';
  let suggestions: string[] = [];

  switch (intent) {
    case 'find_npc': {
      if (params.npcs?.[0]) {
        const npcLocation = findNPC(params.npcs[0], seed);
        if (npcLocation && npcLocation.channels.length > 0) {
          channels = npcLocation.channels.slice(0, 3).map(loc => ({
            channel: loc.channel,
            reason: `${npcLocation.npc.name} is active here`,
            confidence: 0.9,
            preview: loc.sampleEntry ? [loc.sampleEntry] : [],
            startAt: loc.sampleEntry || undefined,
          }));
          explanation = `Found ${npcLocation.npc.name} broadcasting on ${channels.length} channel(s) today.`;
          suggestions = [
            `What is ${npcLocation.npc.name} talking about?`,
            `Who does ${npcLocation.npc.name} interact with?`,
            `Find ${npcLocation.npc.name}'s lore`,
          ];
        }
      }
      break;
    }

    case 'find_topic':
    case 'find_lore':
    case 'find_meta':
    case 'find_drama': {
      const results = searchStreams(params, seeds, 20);
      channels = results.slice(0, 3).map(r => ({
        channel: r.channel,
        reason: r.matchReason,
        confidence: r.relevance,
        preview: r.entries.slice(0, 3),
      }));
      const topic = params.topics?.[0] || params.entryTypes?.[0] || 'relevant content';
      explanation = `Found ${results.length} stream(s) about ${topic}.`;
      suggestions = [
        `More about ${topic}`,
        `Related lore`,
        `Who discusses ${topic}?`,
      ];
      break;
    }

    case 'explore': {
      const recommendations = getRecommendations(
        request.preferences || {},
        seed,
        3
      );
      channels = recommendations.map(r => ({
        channel: r.channel,
        reason: r.reason,
        confidence: r.confidence,
        preview: r.preview,
      }));
      explanation = 'Here are some channels to explore.';
      suggestions = [
        'Find something specific',
        'Show me lore',
        'Where is Willy today?',
      ];
      break;
    }

    case 'specific_day': {
      const allChannels = getAllChannelsForSeed(seed);
      channels = allChannels.slice(0, 3).map(ch => {
        const sample = sampleStream(seed, ch.domainSlug, 3);
        return {
          channel: ch,
          reason: `${ch.domainName} - ${ch.dayLabel}`,
          confidence: 0.7,
          preview: sample.entries,
        };
      });
      explanation = `Showing channels for ${channels[0]?.channel.dayLabel || 'today'}.`;
      suggestions = [
        'Go to yesterday',
        'Find specific NPC',
        'Show lore channels',
      ];
      break;
    }

    default: {
      // Fallback: show recommendations
      const recommendations = getRecommendations(
        request.preferences || {},
        seed,
        3
      );
      channels = recommendations.map(r => ({
        channel: r.channel,
        reason: r.reason,
        confidence: r.confidence,
        preview: r.preview,
      }));
      explanation = "I'm not sure what you're looking for. Here are some suggestions.";
      suggestions = [
        'Find a specific NPC (e.g., "Where is Willy?")',
        'Find a topic (e.g., "Show me lore")',
        'Explore a domain (e.g., "What\'s in Frost Reach?")',
      ];
    }
  }

  return {
    intent,
    channels,
    explanation,
    suggestions,
  };
}

// ============================================
// Claude-Powered Tuning (For Complex Queries)
// ============================================

/**
 * System prompt for Claude tuning
 */
export function buildTuningSystemPrompt(): string {
  const npcList = getAllVoiceProfiles()
    .map(p => `- ${p.name} (${p.slug}): ${p.patterns[0] || 'unique voice'}`)
    .join('\n');

  const domainList = Object.entries(DOMAIN_CONTEXTS)
    .map(([slug, d]) => `- ${d.name} (${slug}): ${d.description}`)
    .join('\n');

  return `You are a tuning assistant for the NEVER DIE GUY eternal broadcast.

The eternal broadcast is a cursed social platform where immortal NPCs chat across infinite "days" (seeds). Each day + domain combination produces a unique, deterministic conversation stream.

Your job is to help users find the right channel to tune into based on their query.

## Available NPCs
${npcList}

## Available Domains
${domainList}

## Response Format
Respond with a JSON object:
{
  "intent": "find_npc" | "find_topic" | "find_interaction" | "find_lore" | "find_drama" | "find_meta" | "explore",
  "npcs": ["slug1", "slug2"], // NPCs to search for
  "topics": ["topic1"], // Topics to search for
  "domains": ["domain-slug"], // Domains to search
  "interactions": [{"from": "npc1", "to": "npc2"}], // Specific interactions
  "explanation": "Why you recommended this",
  "suggestions": ["follow-up 1", "follow-up 2"]
}

Only include fields that are relevant to the query.`;
}

/**
 * User prompt for Claude tuning
 */
export function buildTuningUserPrompt(query: string, currentSeed: string): string {
  return `User query: "${query}"
Current seed/day: ${currentSeed}

What channels should they tune into?`;
}

/**
 * Parse Claude's response into a DiscoveryQuery
 */
export function parseTuningResponse(response: string): {
  intent: TuningIntent;
  query: Partial<DiscoveryQuery>;
  explanation: string;
  suggestions: string[];
} {
  try {
    const json = JSON.parse(response);
    return {
      intent: json.intent || 'unclear',
      query: {
        npcs: json.npcs,
        topics: json.topics,
        domains: json.domains,
        interactions: json.interactions,
      },
      explanation: json.explanation || '',
      suggestions: json.suggestions || [],
    };
  } catch {
    return {
      intent: 'unclear',
      query: {},
      explanation: 'Could not parse response',
      suggestions: [],
    };
  }
}

/**
 * Execute a Claude-interpreted tuning (after getting Claude response)
 */
export function executeTuning(
  parsed: ReturnType<typeof parseTuningResponse>,
  seed: string = todaySeed()
): TuningResponse {
  const seeds = [seed];
  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    seeds.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  }

  const results = searchStreams(parsed.query, seeds, 20);
  const channels: TunedChannel[] = results.slice(0, 3).map(r => ({
    channel: r.channel,
    reason: r.matchReason,
    confidence: r.relevance,
    preview: r.entries.slice(0, 3),
  }));

  return {
    intent: parsed.intent,
    channels,
    explanation: parsed.explanation,
    suggestions: parsed.suggestions,
  };
}

// ============================================
// Claude API Request Builder
// ============================================

export interface ClaudeTuningConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_TUNING_CONFIG: ClaudeTuningConfig = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 500,
  temperature: 0.3, // Low for consistent parsing
};

/**
 * Build a Claude API request for tuning
 */
export function buildClaudeTuningRequest(
  query: string,
  seed: string = todaySeed(),
  config: ClaudeTuningConfig = DEFAULT_TUNING_CONFIG
): {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
} {
  return {
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system: buildTuningSystemPrompt(),
    messages: [
      { role: 'user', content: buildTuningUserPrompt(query, seed) },
    ],
  };
}

// ============================================
// Hybrid Tuning (Local First, Claude Fallback)
// ============================================

/**
 * Tune with local-first approach, Claude fallback indicator
 */
export function tune(request: TuningRequest): {
  response: TuningResponse;
  usedClaude: boolean;
  claudeRequest?: ReturnType<typeof buildClaudeTuningRequest>;
} {
  const { intent, params, needsClaude } = interpretQueryLocally(request.query);

  if (!needsClaude) {
    // Handle locally
    return {
      response: tuneLocal(request),
      usedClaude: false,
    };
  }

  // Need Claude - return the request for the client to execute
  return {
    response: tuneLocal(request), // Provide a fallback
    usedClaude: true,
    claudeRequest: buildClaudeTuningRequest(
      request.query,
      request.currentSeed || todaySeed()
    ),
  };
}
