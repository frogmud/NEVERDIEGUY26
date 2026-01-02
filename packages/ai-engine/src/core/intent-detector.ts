/**
 * Intent Detection
 *
 * Analyzes messages to determine speaker intent.
 * Used for both player messages and NPC-to-NPC communication.
 */

import type { DetectedIntent, IntentMatch, TemplatePool } from './types';

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
      /^(hi|hello|hey|greetings|yo|sup|howdy|hiya|salutations)\b/i,
      /^what'?s? up\b/i,
      /^good (morning|afternoon|evening|day)\b/i,
      /^well met\b/i,
    ],
    keywords: ['hi', 'hello', 'hey', 'greetings', 'howdy', 'welcome'],
    baseConfidence: 0.9,
  },
  {
    intent: 'farewell',
    patterns: [
      /^(bye|goodbye|later|see ya|cya|farewell|gtg|gotta go)\b/i,
      /\b(leaving now|heading out|gotta run|must go)\b/i,
      /^until (next time|we meet again)\b/i,
    ],
    keywords: ['bye', 'goodbye', 'later', 'farewell', 'leaving'],
    baseConfidence: 0.9,
  },
  {
    intent: 'trade',
    patterns: [
      /what (do you|can you) (sell|offer|have)\b/i,
      /show me (your )?(wares|items|goods|stock|inventory)\b/i,
      /\b(buy|sell|shop|trade|purchase|deal)\b/i,
      /what('?s| is) (for sale|available)\b/i,
      /\b(price|cost|how much)\b/i,
    ],
    keywords: ['buy', 'sell', 'trade', 'wares', 'price', 'deal', 'bargain'],
    baseConfidence: 0.85,
  },
  {
    intent: 'question',
    patterns: [
      /^(who|what|where|when|why|how)\b/i,
      /\?$/,
      /^(do|does|did|can|could|would|is|are|was|were)\b.*\?/i,
    ],
    keywords: ['who', 'what', 'where', 'why', 'how', 'explain'],
    baseConfidence: 0.7,
  },
  {
    intent: 'lore',
    patterns: [
      /tell me (about|more)\b/i,
      /who (is|are|was|were)\b/i,
      /what (is|are) (the|a|an)\b/i,
      /explain\b/i,
      /what happened\b/i,
      /the (story|history|legend) of\b/i,
    ],
    keywords: ['tell', 'explain', 'history', 'story', 'lore', 'origin', 'legend'],
    baseConfidence: 0.8,
  },
  {
    intent: 'challenge',
    patterns: [
      /\b(fight|duel|battle|challenge|spar|1v1)\b/i,
      /let'?s? (fight|go|do this)\b/i,
      /you and me\b/i,
      /bring it\b/i,
      /face me\b/i,
    ],
    keywords: ['fight', 'duel', 'battle', 'challenge', 'spar', 'combat'],
    baseConfidence: 0.85,
  },
  {
    intent: 'compliment',
    patterns: [
      /\b(nice|good|great|excellent|amazing|wonderful)\b.*\b(work|job|done)\b/i,
      /\b(you('re| are)|that'?s?)\s+(great|amazing|wonderful|impressive)\b/i,
      /\bi (like|love|admire|respect)\b/i,
      /^(well done|bravo|impressive)\b/i,
    ],
    keywords: ['nice', 'great', 'amazing', 'impressive', 'admire', 'respect', 'love'],
    baseConfidence: 0.75,
  },
  {
    intent: 'insult',
    patterns: [
      /\b(stupid|idiot|fool|pathetic|worthless|useless)\b/i,
      /\b(hate|despise|loathe)\b/i,
      /you('re| are) (nothing|pathetic|weak)\b/i,
      /\b(scum|trash|garbage)\b/i,
    ],
    keywords: ['stupid', 'idiot', 'fool', 'hate', 'pathetic', 'weak', 'worthless'],
    baseConfidence: 0.8,
  },
  {
    intent: 'gossip',
    patterns: [
      /have you heard\b/i,
      /did you (know|hear)\b/i,
      /\bthey say\b/i,
      /\brumor(s)?\b/i,
      /between (you and me|us)\b/i,
      /\babout (him|her|them|that one)\b/i,
    ],
    keywords: ['heard', 'rumor', 'gossip', 'secret', 'whisper', 'apparently'],
    baseConfidence: 0.75,
  },
  {
    intent: 'help',
    patterns: [
      /\b(help|assist|aid)\b.*\b(me|us)\b/i,
      /\bi need\b/i,
      /\bcan you\b.*\b(help|assist)\b/i,
      /\bplease\b/i,
      /\b(desperate|struggling|lost)\b/i,
    ],
    keywords: ['help', 'please', 'need', 'assist', 'desperate', 'mercy'],
    baseConfidence: 0.75,
  },
];

// ============================================
// NPC Name Detection
// ============================================

/**
 * Check if a message references a specific NPC
 */
export function detectNPCReference(
  message: string,
  npcNames: string[]
): string | undefined {
  const lowerMessage = message.toLowerCase();

  for (const name of npcNames) {
    const lowerName = name.toLowerCase();
    // Match whole word
    const regex = new RegExp(`\\b${lowerName}\\b`, 'i');
    if (regex.test(lowerMessage)) {
      return name;
    }
  }

  return undefined;
}

// ============================================
// Intent Detection
// ============================================

export function detectIntent(
  message: string,
  knownNPCs: string[] = []
): IntentMatch {
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
        0.5 + keywordMatches.length * 0.12
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

  // Check for NPC references
  const referencedNPC = detectNPCReference(message, knownNPCs);
  if (referencedNPC) {
    bestMatch.targetNPC = referencedNPC;
    // Boost confidence if talking about someone specific
    if (bestMatch.intent === 'gossip' || bestMatch.intent === 'question') {
      bestMatch.confidence = Math.min(1, bestMatch.confidence + 0.1);
    }
  }

  return bestMatch;
}

// ============================================
// Intent to Template Pool Mapping
// ============================================

export function intentToPool(intent: DetectedIntent, isNPCTarget: boolean): TemplatePool {
  if (isNPCTarget) {
    // Talking to/about another NPC
    switch (intent) {
      case 'greeting':
        return 'npcGreeting';
      case 'gossip':
        return 'npcGossip';
      default:
        return 'npcReaction';
    }
  }

  // Talking to player or general
  const mapping: Record<DetectedIntent, TemplatePool> = {
    greeting: 'greeting',
    farewell: 'farewell',
    trade: 'salesPitch',
    question: 'hint',
    lore: 'lore',
    challenge: 'challenge',
    compliment: 'reaction',
    insult: 'threat',
    gossip: 'npcGossip',
    help: 'hint',
    unknown: 'idle',
  };

  return mapping[intent];
}
