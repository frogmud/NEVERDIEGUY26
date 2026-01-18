/**
 * Multi-Pass Greeting Refinement
 *
 * Takes base NPC greetings/ambient messages and runs them through
 * multiple refinement passes to ensure uniqueness. Each pass adds
 * subtle variations while maintaining character voice.
 *
 * Flow:
 * 1. Base greeting from ambient[] pool
 * 2. 5-6 refinement passes (Claude or local variation)
 * 3. Cache result to avoid API spam
 * 4. Return unique, in-character greeting
 *
 * NEVER DIE GUY
 */

import type { VoiceProfile } from './types';
import { getVoiceProfile } from './voice-profiles';

// ============================================
// Types
// ============================================

export interface RefinementPass {
  /** Pass number (1-6) */
  pass: number;
  /** Text before this pass */
  input: string;
  /** Text after this pass */
  output: string;
  /** Type of transformation applied */
  transformation: 'vocabulary' | 'pattern' | 'tone' | 'structure' | 'detail';
}

export interface GreetingRefinementResult {
  /** Original base greeting */
  original: string;
  /** Final refined greeting */
  refined: string;
  /** Number of passes applied */
  passCount: number;
  /** Whether result came from cache */
  cached: boolean;
  /** NPC slug */
  npcSlug: string;
  /** Voice match score (0-1) */
  voiceMatch: number;
}

export interface RefinementConfig {
  /** Number of refinement passes (default: 5) */
  passes: number;
  /** Temperature for variations (0.0-1.0, default: 0.7) */
  temperature: number;
  /** Use API refinement (requires server) vs local-only */
  useApi: boolean;
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTtl: number;
}

export const DEFAULT_REFINEMENT_CONFIG: RefinementConfig = {
  passes: 5,
  temperature: 0.7,
  useApi: false, // Start with local refinement to avoid API costs
  cacheTtl: 5 * 60 * 1000, // 5 minutes
};

// ============================================
// Cache
// ============================================

interface CacheEntry {
  result: GreetingRefinementResult;
  timestamp: number;
}

// In-memory cache (persists for session)
const refinementCache = new Map<string, CacheEntry>();

/** Generate cache key from NPC + base greeting */
function getCacheKey(npcSlug: string, baseGreeting: string): string {
  // Normalize the greeting for cache key
  const normalized = baseGreeting.toLowerCase().trim().slice(0, 50);
  return `${npcSlug}:${normalized}`;
}

/** Check if cached result is still valid */
function getCachedResult(
  npcSlug: string,
  baseGreeting: string,
  config: RefinementConfig
): GreetingRefinementResult | null {
  const key = getCacheKey(npcSlug, baseGreeting);
  const entry = refinementCache.get(key);

  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > config.cacheTtl) {
    refinementCache.delete(key);
    return null;
  }

  return { ...entry.result, cached: true };
}

/** Store result in cache */
function cacheResult(
  npcSlug: string,
  baseGreeting: string,
  result: GreetingRefinementResult
): void {
  const key = getCacheKey(npcSlug, baseGreeting);
  refinementCache.set(key, {
    result,
    timestamp: Date.now(),
  });

  // Prune old entries if cache gets too large
  if (refinementCache.size > 100) {
    const oldest = [...refinementCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 20);
    oldest.forEach(([key]) => refinementCache.delete(key));
  }
}

// ============================================
// Local Refinement Transformations
// ============================================

/** Word substitutions that maintain meaning */
const SUBSTITUTIONS: Record<string, string[]> = {
  // General
  good: ['excellent', 'fine', 'solid', 'decent'],
  bad: ['rough', 'grim', 'dire', 'terrible'],
  see: ['notice', 'observe', 'spot', 'witness'],
  think: ['reckon', 'suspect', 'believe', 'figure'],
  know: ['understand', 'realize', 'recognize', 'grasp'],
  want: ['need', 'desire', 'seek', 'require'],
  look: ['appear', 'seem', 'present', 'show'],
  come: ['arrive', 'approach', 'enter', 'appear'],
  go: ['head', 'venture', 'proceed', 'move'],
  get: ['obtain', 'acquire', 'receive', 'grab'],
  // Emotional
  happy: ['pleased', 'satisfied', 'content', 'delighted'],
  sad: ['melancholy', 'somber', 'gloomy', 'down'],
  angry: ['furious', 'irate', 'vexed', 'incensed'],
  // Actions
  said: ['mentioned', 'noted', 'remarked', 'stated'],
  asked: ['inquired', 'wondered', 'questioned', 'probed'],
  told: ['informed', 'advised', 'notified', 'warned'],
  // Descriptors
  big: ['massive', 'enormous', 'vast', 'substantial'],
  small: ['tiny', 'modest', 'minor', 'slight'],
  fast: ['swift', 'rapid', 'quick', 'speedy'],
  slow: ['gradual', 'leisurely', 'unhurried', 'measured'],
  // Time
  now: ['currently', 'presently', 'at the moment', 'right now'],
  later: ['eventually', 'in time', 'soon enough', 'afterward'],
  always: ['eternally', 'perpetually', 'consistently', 'forever'],
  never: ['not once', 'at no point', 'absolutely not', 'under no circumstances'],
  // Emphasis
  very: ['quite', 'rather', 'extremely', 'particularly'],
  really: ['truly', 'genuinely', 'absolutely', 'certainly'],
};

/** Structural variations */
const STRUCTURE_PREFIXES = [
  'Hmm... ',
  'Ah, ',
  'Well, ',
  'So... ',
  '',
  '*considers* ',
  '*nods* ',
];

const STRUCTURE_SUFFIXES = [
  '',
  '...',
  ', you know.',
  ', I suppose.',
  '. Obviously.',
  '. Just saying.',
];

/**
 * Apply vocabulary transformation - swap words with synonyms
 */
function applyVocabularyPass(
  text: string,
  voice: VoiceProfile,
  temperature: number
): string {
  let result = text;

  // Only apply substitutions probabilistically based on temperature
  for (const [word, alternatives] of Object.entries(SUBSTITUTIONS)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(result) && Math.random() < temperature * 0.6) {
      // Prefer alternatives that match NPC vocabulary if possible
      const matchingVocab = alternatives.filter(alt =>
        voice.vocabulary.some(v => v.toLowerCase().includes(alt.toLowerCase()))
      );
      const pool = matchingVocab.length > 0 ? matchingVocab : alternatives;
      const replacement = pool[Math.floor(Math.random() * pool.length)];
      result = result.replace(regex, replacement);
    }
  }

  return result;
}

/**
 * Apply pattern transformation - adjust to match NPC speech patterns
 */
function applyPatternPass(
  text: string,
  voice: VoiceProfile,
  temperature: number
): string {
  let result = text;

  // Apply NPC-specific patterns
  for (const pattern of voice.patterns) {
    const patternLower = pattern.toLowerCase();

    // Ellipsis pattern
    if (patternLower.includes('ellipsis') && Math.random() < temperature * 0.4) {
      // Replace some periods with ellipses
      if (!result.includes('...')) {
        result = result.replace(/\. /, '... ');
      }
    }

    // CAPS pattern (like X-treme)
    if (patternLower.includes('caps') && Math.random() < temperature * 0.3) {
      // Capitalize emphasis words
      const emphasisWords = ['extreme', 'wild', 'bold', 'risk', 'chance', 'lucky'];
      for (const word of emphasisWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (result.toLowerCase().includes(word)) {
          result = result.replace(regex, word.toUpperCase());
        }
      }
    }

    // Question pattern (rhetorical questions)
    if (patternLower.includes('question') && Math.random() < temperature * 0.25) {
      if (!result.includes('?') && result.length < 80) {
        result = result.replace(/\.$/, ', you know?');
      }
    }
  }

  return result;
}

/**
 * Apply tone transformation - adjust emotional register
 */
function applyTonePass(
  text: string,
  voice: VoiceProfile,
  temperature: number
): string {
  let result = text;

  // Add character-appropriate interjections
  if (voice.catchphrases.length > 0 && Math.random() < temperature * 0.15) {
    // Extract short fragments from catchphrases
    const fragments = voice.catchphrases
      .flatMap(phrase => phrase.split(/[,.!?]/).filter(f => f.length > 3 && f.length < 20))
      .map(f => f.trim());

    if (fragments.length > 0) {
      const fragment = fragments[Math.floor(Math.random() * fragments.length)];
      // Sometimes prepend, sometimes append
      if (Math.random() < 0.5) {
        result = `${fragment}. ${result}`;
      }
    }
  }

  return result;
}

/**
 * Apply structure transformation - rearrange or add framing
 */
function applyStructurePass(
  text: string,
  _voice: VoiceProfile,
  temperature: number
): string {
  let result = text;

  // Add prefix occasionally
  if (Math.random() < temperature * 0.3) {
    const prefix = STRUCTURE_PREFIXES[Math.floor(Math.random() * STRUCTURE_PREFIXES.length)];
    if (!result.startsWith(prefix) && prefix) {
      result = prefix + result.charAt(0).toLowerCase() + result.slice(1);
    }
  }

  // Add suffix occasionally
  if (Math.random() < temperature * 0.25) {
    const suffix = STRUCTURE_SUFFIXES[Math.floor(Math.random() * STRUCTURE_SUFFIXES.length)];
    if (suffix && !result.endsWith(suffix.trim())) {
      // Remove existing punctuation before adding suffix
      result = result.replace(/[.!?]+$/, '') + suffix;
    }
  }

  return result;
}

/**
 * Apply detail transformation - add/remove specific details
 */
function applyDetailPass(
  text: string,
  voice: VoiceProfile,
  temperature: number
): string {
  let result = text;

  // Occasionally inject vocabulary words as details
  if (voice.vocabulary.length > 0 && Math.random() < temperature * 0.2) {
    const vocabWord = voice.vocabulary[Math.floor(Math.random() * voice.vocabulary.length)];
    // Only add if word isn't already present
    if (!result.toLowerCase().includes(vocabWord.toLowerCase())) {
      // Try to fit it naturally
      const insertPoints = [
        { regex: /\. /, replacement: `. Something about ${vocabWord}. ` },
        { regex: / is /, replacement: ` (the ${vocabWord} kind) is ` },
        { regex: /\!$/, replacement: ` - ${vocabWord} style!` },
      ];
      const point = insertPoints[Math.floor(Math.random() * insertPoints.length)];
      if (point.regex.test(result) && Math.random() < 0.3) {
        result = result.replace(point.regex, point.replacement);
      }
    }
  }

  return result;
}

// ============================================
// Refinement Engine
// ============================================

const TRANSFORMATION_ORDER: Array<'vocabulary' | 'pattern' | 'tone' | 'structure' | 'detail'> = [
  'vocabulary',
  'pattern',
  'tone',
  'structure',
  'detail',
];

/**
 * Apply a single refinement pass
 */
function applyPass(
  text: string,
  voice: VoiceProfile,
  passNumber: number,
  temperature: number
): RefinementPass {
  const transformationType = TRANSFORMATION_ORDER[(passNumber - 1) % TRANSFORMATION_ORDER.length];
  let output: string;

  switch (transformationType) {
    case 'vocabulary':
      output = applyVocabularyPass(text, voice, temperature);
      break;
    case 'pattern':
      output = applyPatternPass(text, voice, temperature);
      break;
    case 'tone':
      output = applyTonePass(text, voice, temperature);
      break;
    case 'structure':
      output = applyStructurePass(text, voice, temperature);
      break;
    case 'detail':
      output = applyDetailPass(text, voice, temperature);
      break;
    default:
      output = text;
  }

  return {
    pass: passNumber,
    input: text,
    output,
    transformation: transformationType,
  };
}

/**
 * Calculate voice match score based on vocabulary/pattern alignment
 */
function calculateVoiceMatch(text: string, voice: VoiceProfile): number {
  const lowerText = text.toLowerCase();
  let score = 0.5; // Base score

  // Vocabulary hits
  const vocabHits = voice.vocabulary.filter(word =>
    lowerText.includes(word.toLowerCase())
  ).length;
  score += Math.min(vocabHits * 0.05, 0.2);

  // Pattern alignment
  const hasEllipsis = text.includes('...');
  const hasCaps = /[A-Z]{3,}/.test(text);
  const hasQuestion = text.includes('?');
  const patternLower = voice.patterns.map(p => p.toLowerCase()).join(' ');

  if (patternLower.includes('ellipsis') && hasEllipsis) score += 0.1;
  if (patternLower.includes('caps') && hasCaps) score += 0.1;
  if (patternLower.includes('question') && hasQuestion) score += 0.05;

  // Catchphrase fragments
  const hasCatchphrase = voice.catchphrases.some(phrase =>
    lowerText.includes(phrase.slice(0, 15).toLowerCase())
  );
  if (hasCatchphrase) score += 0.1;

  return Math.min(score, 1.0);
}

// ============================================
// Public API
// ============================================

/**
 * Refine a greeting through multiple passes to make it unique
 *
 * @param npcSlug - NPC identifier
 * @param baseGreeting - Original greeting text
 * @param config - Refinement configuration
 * @returns Refined greeting result
 */
export function refineGreeting(
  npcSlug: string,
  baseGreeting: string,
  config: Partial<RefinementConfig> = {}
): GreetingRefinementResult {
  const fullConfig = { ...DEFAULT_REFINEMENT_CONFIG, ...config };

  // Check cache first
  const cached = getCachedResult(npcSlug, baseGreeting, fullConfig);
  if (cached) {
    return cached;
  }

  // Get voice profile
  const voice = getVoiceProfile(npcSlug);
  if (!voice) {
    // No voice profile - return original with low score
    return {
      original: baseGreeting,
      refined: baseGreeting,
      passCount: 0,
      cached: false,
      npcSlug,
      voiceMatch: 0.3,
    };
  }

  // Apply multiple passes
  let currentText = baseGreeting;
  const passes: RefinementPass[] = [];

  for (let i = 1; i <= fullConfig.passes; i++) {
    const pass = applyPass(currentText, voice, i, fullConfig.temperature);
    passes.push(pass);
    currentText = pass.output;

    // Early exit if text hasn't changed in 2 consecutive passes
    if (i > 2 && passes[i - 1].output === passes[i - 2].output) {
      break;
    }
  }

  // Calculate final voice match
  const voiceMatch = calculateVoiceMatch(currentText, voice);

  const result: GreetingRefinementResult = {
    original: baseGreeting,
    refined: currentText,
    passCount: passes.length,
    cached: false,
    npcSlug,
    voiceMatch,
  };

  // Cache the result
  cacheResult(npcSlug, baseGreeting, result);

  return result;
}

/**
 * Refine a greeting asynchronously with optional API refinement
 *
 * @param npcSlug - NPC identifier
 * @param baseGreeting - Original greeting text
 * @param config - Refinement configuration
 * @returns Promise resolving to refined greeting result
 */
export async function refineGreetingAsync(
  npcSlug: string,
  baseGreeting: string,
  config: Partial<RefinementConfig> = {}
): Promise<GreetingRefinementResult> {
  const fullConfig = { ...DEFAULT_REFINEMENT_CONFIG, ...config };

  // Check cache first
  const cached = getCachedResult(npcSlug, baseGreeting, fullConfig);
  if (cached) {
    return cached;
  }

  // If API refinement is enabled and we have a chat endpoint
  if (fullConfig.useApi) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: npcSlug,
          message: `Refine this greeting for uniqueness while keeping my character voice: "${baseGreeting}"`,
          pool: 'ambient',
          enableRefinement: true,
          refinementPasses: fullConfig.passes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          const result: GreetingRefinementResult = {
            original: baseGreeting,
            refined: data.response,
            passCount: fullConfig.passes,
            cached: false,
            npcSlug,
            voiceMatch: data.voiceMatch || 0.8,
          };
          cacheResult(npcSlug, baseGreeting, result);
          return result;
        }
      }
    } catch {
      // Fall through to local refinement
    }
  }

  // Fall back to local refinement
  return refineGreeting(npcSlug, baseGreeting, config);
}

/**
 * Batch refine multiple greetings (useful for pre-warming)
 */
export function refineGreetings(
  npcSlug: string,
  greetings: string[],
  config: Partial<RefinementConfig> = {}
): GreetingRefinementResult[] {
  return greetings.map(greeting => refineGreeting(npcSlug, greeting, config));
}

/**
 * Clear the refinement cache (useful for testing or memory management)
 */
export function clearRefinementCache(): void {
  refinementCache.clear();
}

/**
 * Get cache stats for debugging
 */
export function getRefinementCacheStats(): { size: number; entries: string[] } {
  return {
    size: refinementCache.size,
    entries: [...refinementCache.keys()],
  };
}
