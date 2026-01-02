/**
 * Intent Detection
 *
 * Detect player intent from message text to select appropriate template pool.
 * Uses pattern matching and keyword detection.
 */

import type { TemplatePool } from './types';

// ============================================
// Intent Types
// ============================================

export type DetectedIntent =
  | 'greeting'
  | 'farewell'
  | 'service'
  | 'quest'
  | 'lore'
  | 'challenge'
  | 'plead'
  | 'unknown';

export interface IntentMatch {
  intent: DetectedIntent;
  confidence: number; // 0-1
  matchedPattern?: string;
}

// ============================================
// Pattern Configuration
// ============================================

interface IntentPattern {
  intent: DetectedIntent;
  patterns: RegExp[];
  keywords: string[];
  baseConfidence: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'greeting',
    patterns: [
      /^(hi|hello|hey|greetings|yo|sup|howdy|hiya)\b/i,
      /^what'?s? up\b/i,
      /^good (morning|afternoon|evening|day)\b/i,
    ],
    keywords: ['hi', 'hello', 'hey', 'sup', 'greetings', 'howdy'],
    baseConfidence: 0.9,
  },
  {
    intent: 'farewell',
    patterns: [
      /^(bye|goodbye|later|see ya|cya|farewell|gtg|gotta go)\b/i,
      /\b(leaving now|heading out|gotta run)\b/i,
    ],
    keywords: ['bye', 'goodbye', 'later', 'farewell', 'cya'],
    baseConfidence: 0.9,
  },
  {
    intent: 'service',
    patterns: [
      /what (do you|can you) (sell|offer|have)\b/i,
      /show me (your )?(wares|items|goods|stock|inventory)\b/i,
      /\b(buy|sell|shop|trade|purchase)\b/i,
      /what('?s| is) (for sale|available)\b/i,
    ],
    keywords: ['buy', 'sell', 'shop', 'wares', 'items', 'price', 'stock', 'trade'],
    baseConfidence: 0.85,
  },
  {
    intent: 'quest',
    patterns: [
      /where (is|can i find|should i go|do i)\b/i,
      /how (do|can|should) i\b/i,
      /help me (with|find|get)\b/i,
      /any (tips|advice|hints|shortcuts)\b/i,
      /what should i do\b/i,
    ],
    keywords: ['where', 'how', 'help', 'find', 'quest', 'mission', 'objective', 'hint', 'tip'],
    baseConfidence: 0.8,
  },
  {
    intent: 'lore',
    patterns: [
      /tell me (about|more)\b/i,
      /who (is|are|was|were)\b/i,
      /what (is|are|was|were) (the|a|an)\b/i,
      /explain\b/i,
      /what happened\b/i,
      /why (do|did|does|is|are)\b/i,
    ],
    keywords: ['tell', 'explain', 'who', 'history', 'story', 'lore', 'origin'],
    baseConfidence: 0.8,
  },
  {
    intent: 'challenge',
    patterns: [
      /\b(fight|duel|battle|challenge|spar|1v1)\b/i,
      /let'?s? (fight|go|do this)\b/i,
      /you and me\b/i,
      /bring it\b/i,
    ],
    keywords: ['fight', 'duel', 'battle', 'challenge', 'spar'],
    baseConfidence: 0.85,
  },
  {
    intent: 'plead',
    patterns: [
      /\b(broke|poor|no money|can'?t afford|too expensive)\b/i,
      /give me a (deal|discount|break)\b/i,
      /please\b.*\b(help|cheap|free)\b/i,
      /have mercy\b/i,
    ],
    keywords: ['broke', 'poor', 'afford', 'discount', 'please', 'mercy', 'free'],
    baseConfidence: 0.75,
  },
];

// ============================================
// Intent Detection
// ============================================

/**
 * Detect intent from player message text
 */
export function detectIntent(message: string): IntentMatch {
  const normalizedMessage = message.toLowerCase().trim();

  // Empty or very short messages
  if (normalizedMessage.length < 2) {
    return { intent: 'unknown', confidence: 0 };
  }

  let bestMatch: IntentMatch = { intent: 'unknown', confidence: 0 };

  for (const config of INTENT_PATTERNS) {
    // Check patterns first (higher confidence)
    for (const pattern of config.patterns) {
      if (pattern.test(normalizedMessage)) {
        const confidence = config.baseConfidence;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent: config.intent,
            confidence,
            matchedPattern: pattern.toString(),
          };
        }
      }
    }

    // Check keywords (lower confidence boost)
    const keywordMatches = config.keywords.filter((kw) =>
      normalizedMessage.includes(kw.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      const keywordConfidence = Math.min(
        config.baseConfidence,
        0.5 + keywordMatches.length * 0.15
      );
      if (keywordConfidence > bestMatch.confidence) {
        bestMatch = {
          intent: config.intent,
          confidence: keywordConfidence,
          matchedPattern: `keywords: ${keywordMatches.join(', ')}`,
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Map detected intent to template pool
 */
export function intentToPool(intent: DetectedIntent): TemplatePool {
  const mapping: Record<DetectedIntent, TemplatePool> = {
    greeting: 'greeting',
    farewell: 'farewell',
    service: 'salesPitch',
    quest: 'hint',
    lore: 'lore',
    challenge: 'challenge',
    plead: 'salesPitch', // Triggers special discount logic
    unknown: 'idle',
  };
  return mapping[intent];
}

/**
 * Convenience function: detect intent and return pool
 */
export function detectIntentPool(message: string): {
  pool: TemplatePool;
  intent: DetectedIntent;
  confidence: number;
} {
  const match = detectIntent(message);
  return {
    pool: intentToPool(match.intent),
    intent: match.intent,
    confidence: match.confidence,
  };
}
