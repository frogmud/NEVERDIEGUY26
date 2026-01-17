/**
 * Claude Refinement Hook for Eternal Stream
 *
 * When a user asks a question, Claude refines the NPC response using:
 * - Speaker's personality/voice profile
 * - Current seed/day context
 * - Recent stream history
 *
 * This module provides the prompt construction and response parsing
 * for integration with Claude API (actual API call happens client-side).
 */

import type {
  StreamEntry,
  VoiceProfile,
  DomainContext,
  RefinementInput,
  RefinementOutput,
} from './types';

import { getVoiceProfile, getDomainContext } from './voice-profiles';

// ============================================
// Prompt Construction
// ============================================

/**
 * Build the system prompt for Claude refinement
 */
export function buildRefinementSystemPrompt(speaker: VoiceProfile): string {
  return `You are ${speaker.name}, an immortal NPC on an eternal broadcast platform in NEVER DIE GUY.

## Your Voice
${speaker.patterns.map(p => `- ${p}`).join('\n')}

## Your Vocabulary
Use these words naturally: ${speaker.vocabulary.join(', ')}

## Your Topics
You like to discuss: ${speaker.topics.join(', ')}

## Your Catchphrases
${speaker.catchphrases.map(c => `- "${c}"`).join('\n')}

## Relationships
- You tease: ${speaker.teases.length ? speaker.teases.join(', ') : 'no one in particular'}
- You respect: ${speaker.respects.length ? speaker.respects.join(', ') : 'few'}
- You avoid: ${speaker.avoids.length ? speaker.avoids.join(', ') : 'no one'}

## Rules
1. Stay in character as ${speaker.name}
2. Keep responses concise (1-3 sentences max)
3. Use your characteristic speech patterns
4. Reference the current domain/context when relevant
5. You're aware this is an eternal broadcast but don't over-explain it
6. If asked about game mechanics, answer helpfully but in character`;
}

/**
 * Build the user prompt for Claude refinement
 */
export function buildRefinementUserPrompt(input: RefinementInput): string {
  const historyContext = input.recentHistory.length > 0
    ? `\nRecent stream (last ${input.recentHistory.length} messages):\n${formatRecentHistory(input.recentHistory)}`
    : '';

  return `Current context:
- Domain: ${input.domain.name} (${input.domain.element} element)
- Day/Seed: ${input.seed}
- Atmosphere: ${input.domain.atmosphere.join(', ')}
${historyContext}

User asks: "${input.userQuestion}"

Respond as ${input.speaker.name} in 1-3 sentences, staying true to your voice and character.`;
}

/**
 * Format recent history for context
 */
function formatRecentHistory(entries: StreamEntry[]): string {
  return entries
    .slice(-5) // Last 5 entries max
    .map(e => `[${e.speakerName}]: ${e.content}`)
    .join('\n');
}

// ============================================
// Input Preparation
// ============================================

/**
 * Prepare refinement input from raw user data
 */
export function prepareRefinementInput(
  userQuestion: string,
  speakerSlug: string,
  seed: string,
  domainSlug: string,
  recentHistory: StreamEntry[] = []
): RefinementInput | null {
  const speaker = getVoiceProfile(speakerSlug);
  const domain = getDomainContext(domainSlug);

  if (!speaker || !domain) {
    return null;
  }

  return {
    userQuestion,
    speaker,
    seed,
    domain,
    recentHistory,
  };
}

// ============================================
// Response Processing
// ============================================

/**
 * Parse and validate Claude's response
 */
export function parseRefinementResponse(
  rawResponse: string,
  speaker: VoiceProfile
): RefinementOutput {
  // Clean up response
  const content = rawResponse.trim();

  // Calculate voice match score (simple heuristic)
  const voiceMatch = calculateVoiceMatch(content, speaker);

  // Extract suggested topics from content
  const suggestedTopics = extractTopics(content, speaker);

  return {
    content,
    voiceMatch,
    suggestedTopics,
  };
}

/**
 * Calculate how well the response matches the NPC's voice
 */
function calculateVoiceMatch(content: string, speaker: VoiceProfile): number {
  const lowerContent = content.toLowerCase();
  let score = 0.5; // Base score

  // Check for vocabulary usage
  const vocabHits = speaker.vocabulary.filter(word =>
    lowerContent.includes(word.toLowerCase())
  ).length;
  score += Math.min(vocabHits * 0.05, 0.25);

  // Check for pattern indicators
  const patternIndicators = [
    speaker.patterns.some(p => p.includes('ellipsis') && content.includes('...')),
    speaker.patterns.some(p => p.includes('CAPS') && /[A-Z]{3,}/.test(content)),
    speaker.patterns.some(p => p.includes('question') && content.includes('?')),
  ];
  score += patternIndicators.filter(Boolean).length * 0.08;

  // Check for catchphrase fragments
  const catchphraseFragments = speaker.catchphrases.some(phrase =>
    lowerContent.includes(phrase.slice(0, 10).toLowerCase())
  );
  if (catchphraseFragments) score += 0.1;

  return Math.min(score, 1.0);
}

/**
 * Extract potential follow-up topics from content
 */
function extractTopics(content: string, speaker: VoiceProfile): string[] {
  const suggestedTopics: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check which speaker topics are mentioned
  for (const topic of speaker.topics) {
    if (lowerContent.includes(topic.toLowerCase())) {
      suggestedTopics.push(topic);
    }
  }

  // Add general topics based on content keywords
  const topicKeywords: Record<string, string[]> = {
    'trade': ['deal', 'buy', 'sell', 'gold', 'price'],
    'lore': ['history', 'remember', 'before', 'origin'],
    'combat': ['fight', 'battle', 'weapon', 'attack'],
    'death': ['die', 'dead', 'soul', 'afterlife'],
    'meta': ['game', 'forever', 'eternal', 'broadcast'],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      if (!suggestedTopics.includes(topic)) {
        suggestedTopics.push(topic);
      }
    }
  }

  return suggestedTopics.slice(0, 3);
}

// ============================================
// Quick Response Generation (No Claude)
// ============================================

/**
 * Generate a quick in-character response without Claude
 * Used as fallback or for simple queries
 */
export function generateQuickResponse(
  input: RefinementInput
): RefinementOutput {
  const { speaker, domain, userQuestion } = input;
  const lowerQuestion = userQuestion.toLowerCase();

  // Pattern matching for common questions
  let content: string;

  if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
    // Greeting
    content = speaker.catchphrases[0] || `${speaker.name} acknowledges you.`;
  } else if (lowerQuestion.includes('who are you') || lowerQuestion.includes('your name')) {
    // Introduction
    content = `${speaker.name}. ${speaker.patterns[0]?.replace(/s$/, '') || 'That is all.'}.`;
  } else if (lowerQuestion.includes('where') || lowerQuestion.includes('domain')) {
    // Location
    content = `We're in ${domain.name}. ${domain.atmosphere[0] || 'Interesting'}, isn't it?`;
  } else if (lowerQuestion.includes('help') || lowerQuestion.includes('how')) {
    // Assistance (varies by archetype)
    if (speaker.topics.includes('trade')) {
      content = 'Trade is simple. You want something, you pay for it. Questions?';
    } else if (speaker.topics.includes('death')) {
      content = "Death comes for us all. Some of us are already there.";
    } else {
      content = speaker.catchphrases[1] || 'Hmm. Let me think on that.';
    }
  } else {
    // Default: use catchphrase or generic
    const idx = Math.floor(Math.random() * speaker.catchphrases.length);
    content = speaker.catchphrases[idx] || '...';
  }

  return {
    content,
    voiceMatch: 0.7, // Fallback confidence
    suggestedTopics: speaker.topics.slice(0, 2),
  };
}

// ============================================
// Claude API Integration Types
// ============================================

/**
 * Configuration for Claude API call
 */
export interface ClaudeRefinementConfig {
  /** Model to use (e.g., 'claude-sonnet-4-5-20250929') */
  model: string;
  /** Max tokens for response */
  maxTokens: number;
  /** Temperature for creativity (0.0 - 1.0) */
  temperature: number;
  /** Timeout in milliseconds */
  timeout: number;
}

export const DEFAULT_REFINEMENT_CONFIG: ClaudeRefinementConfig = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 150,
  temperature: 0.7,
  timeout: 5000,
};

/**
 * Build the full API request body
 */
export function buildClaudeRequest(
  input: RefinementInput,
  config: ClaudeRefinementConfig = DEFAULT_REFINEMENT_CONFIG
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
    system: buildRefinementSystemPrompt(input.speaker),
    messages: [
      { role: 'user', content: buildRefinementUserPrompt(input) },
    ],
  };
}

// ============================================
// Stream Entry from Refinement
// ============================================

/**
 * Create a stream entry from a refined response
 */
export function createEntryFromRefinement(
  speakerSlug: string,
  output: RefinementOutput,
  seed: string,
  domainSlug: string,
  timestamp: number
): StreamEntry {
  const speaker = getVoiceProfile(speakerSlug);

  return {
    id: `refined:${seed}:${domainSlug}:${timestamp}`,
    speakerSlug,
    speakerName: speaker?.name || speakerSlug,
    type: 'idle', // Refined responses are treated as idle/ambient
    content: output.content,
    timestamp,
  };
}
