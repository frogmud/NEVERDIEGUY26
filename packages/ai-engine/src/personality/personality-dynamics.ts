/**
 * Personality Dynamics System
 *
 * Adds depth to NPC behavior through:
 * - Quirks: Unique behavioral patterns
 * - Triggers: Topics/events that provoke strong reactions
 * - Affinities: Natural attraction/repulsion to other personality types
 * - Behavioral modifiers: Context-dependent personality shifts
 */

import type { MoodType, NPCCategory } from '../core/types';

// ============================================
// Personality Traits
// ============================================

export type PersonalityTrait =
  | 'proud' | 'humble'
  | 'curious' | 'disinterested'
  | 'trusting' | 'paranoid'
  | 'patient' | 'impulsive'
  | 'serious' | 'playful'
  | 'direct' | 'cryptic'
  | 'generous' | 'greedy'
  | 'brave' | 'cowardly'
  | 'optimistic' | 'pessimistic'
  | 'social' | 'reclusive';

export interface PersonalityProfile {
  primaryTraits: PersonalityTrait[];
  quirks: Quirk[];
  triggers: EmotionalTrigger[];
  affinities: PersonalityAffinity[];
  speechPatterns: SpeechPattern[];
  behavioralModifiers: BehavioralModifier[];
}

// ============================================
// Quirks - Unique Behaviors
// ============================================

export type QuirkType =
  | 'verbal_tic'        // Repeats certain words/phrases
  | 'physical_habit'    // Does specific actions
  | 'obsession'         // Fixated on a topic
  | 'phobia'            // Avoids certain things
  | 'ritual'            // Performs specific routines
  | 'collection'        // Collects/mentions specific items
  | 'catchphrase'       // Has signature lines
  | 'reference'         // Always references something
  | 'contradiction'     // Says one thing, does another
  | 'speech_pattern';   // Distinctive way of speaking

export interface Quirk {
  type: QuirkType;
  id?: string;
  description: string;
  frequency?: number; // 0-1, how often it manifests
  textInserts?: string[]; // Text to randomly insert
  moodEffect?: Partial<Record<MoodType, number>>; // How it affects mood display
  modifier?: {
    poolBonus?: Partial<Record<string, number>>;
    moodShift?: MoodType;
  };
}

// ============================================
// Emotional Triggers
// ============================================

export type TriggerType =
  | 'topic'           // Specific subject matter
  | 'topic_mention'   // When topic is mentioned
  | 'npc_mention'     // When specific NPC is mentioned
  | 'category'        // When interacting with NPC category
  | 'keyword'         // Specific words in conversation
  | 'event'           // Game events
  | 'memory'          // Past interactions referenced
  | 'compliment'      // Being praised
  | 'insult'          // Being criticized
  | 'question'        // Being asked about something
  | 'player_action'   // Player does something
  | 'stat_threshold'  // Player stat crosses threshold
  | 'challenge';      // Player challenges NPC

export interface EmotionalTrigger {
  type: TriggerType;
  id?: string;
  description?: string;
  trigger?: string | string[];
  keywords?: string[];
  response?: string;
  intensity?: number; // 1-10, can be at top level or in reaction
  threshold?: {
    stat: string;
    value: number;
    comparison?: 'gt' | 'lt' | 'eq';
  };
  reaction?: {
    moodShift?: MoodType;
    intensity?: number; // 1-10
    responsePool?: string; // Force specific template pool
    statEffects?: Array<{ stat: string; change: number }>;
  };
  cooldown?: number; // Turns before can trigger again
}

// ============================================
// Personality Affinities
// ============================================

export interface PersonalityAffinity {
  target: {
    type: 'trait' | 'category' | 'npc' | 'mood';
    value: string;
  };
  modifier: number; // -100 to 100, affects relationship formation
  reason?: string;
}

// ============================================
// Speech Patterns
// ============================================

export type SpeechPatternType =
  | 'formal'
  | 'casual'
  | 'archaic'
  | 'technical'
  | 'poetic'
  | 'terse'
  | 'verbose'
  | 'questioning'
  | 'commanding'
  | 'uncertain';

export interface SpeechPattern {
  type: SpeechPatternType;
  weight: number;
  transforms?: TextTransform[];
}

export interface TextTransform {
  type: 'prefix' | 'suffix' | 'replace' | 'wrap';
  pattern?: string;
  replacement?: string;
}

// ============================================
// Behavioral Modifiers
// ============================================

export interface BehavioralModifier {
  condition: {
    type: 'mood' | 'relationship' | 'context' | 'time' | 'health';
    check: string;
    value: number | string;
  };
  effects: {
    traitShift?: Partial<Record<PersonalityTrait, number>>;
    poolWeightMod?: Partial<Record<string, number>>;
    sociabilityMod?: number;
    aggressionMod?: number;
  };
}

// ============================================
// Personality Factory
// ============================================

export function createPersonalityProfile(
  category: NPCCategory,
  traits: PersonalityTrait[],
  customQuirks: Quirk[] = [],
  customTriggers: EmotionalTrigger[] = []
): PersonalityProfile {
  // Base affinities by category
  const categoryAffinities: PersonalityAffinity[] = getDefaultAffinities(category);

  // Default speech patterns by primary trait
  const speechPatterns = getDefaultSpeechPatterns(traits);

  return {
    primaryTraits: traits,
    quirks: customQuirks,
    triggers: customTriggers,
    affinities: categoryAffinities,
    speechPatterns,
    behavioralModifiers: getDefaultModifiers(category),
  };
}

function getDefaultAffinities(category: NPCCategory): PersonalityAffinity[] {
  const affinities: PersonalityAffinity[] = [];

  switch (category) {
    case 'pantheon':
      affinities.push(
        { target: { type: 'category', value: 'pantheon' }, modifier: 20, reason: 'Fellow cosmic entity' },
        { target: { type: 'category', value: 'travelers' }, modifier: -30, reason: 'Views as prey' },
        { target: { type: 'trait', value: 'proud' }, modifier: 15, reason: 'Respects pride' },
        { target: { type: 'trait', value: 'cowardly' }, modifier: -40, reason: 'Despises weakness' }
      );
      break;
    case 'wanderers':
      affinities.push(
        { target: { type: 'category', value: 'wanderers' }, modifier: 15, reason: 'Fellow merchant/wanderer' },
        { target: { type: 'category', value: 'pantheon' }, modifier: -20, reason: 'Wary of power' },
        { target: { type: 'trait', value: 'generous' }, modifier: 25, reason: 'Good for business' },
        { target: { type: 'trait', value: 'curious' }, modifier: 20, reason: 'Potential customer' }
      );
      break;
    case 'travelers':
      affinities.push(
        { target: { type: 'category', value: 'travelers' }, modifier: 30, reason: 'Shared struggle' },
        { target: { type: 'category', value: 'pantheon' }, modifier: -50, reason: 'Natural enemies' },
        { target: { type: 'trait', value: 'brave' }, modifier: 25, reason: 'Admires courage' },
        { target: { type: 'trait', value: 'trusting' }, modifier: 15, reason: 'Easier alliance' }
      );
      break;
  }

  return affinities;
}

function getDefaultSpeechPatterns(traits: PersonalityTrait[]): SpeechPattern[] {
  const patterns: SpeechPattern[] = [];

  if (traits.includes('cryptic')) {
    patterns.push({ type: 'poetic', weight: 30 });
  }
  if (traits.includes('direct')) {
    patterns.push({ type: 'terse', weight: 25 });
  }
  if (traits.includes('proud')) {
    patterns.push({ type: 'formal', weight: 20 });
  }
  if (traits.includes('playful')) {
    patterns.push({ type: 'casual', weight: 25 });
  }
  if (traits.includes('curious')) {
    patterns.push({ type: 'questioning', weight: 20 });
  }

  // Default casual if nothing specific
  if (patterns.length === 0) {
    patterns.push({ type: 'casual', weight: 50 });
  }

  return patterns;
}

function getDefaultModifiers(category: NPCCategory): BehavioralModifier[] {
  const modifiers: BehavioralModifier[] = [];

  // When in bad mood, become less social
  modifiers.push({
    condition: { type: 'mood', check: 'in', value: 'annoyed,threatening' },
    effects: { sociabilityMod: -0.3, aggressionMod: 0.2 },
  });

  // When in good mood, more generous
  modifiers.push({
    condition: { type: 'mood', check: 'in', value: 'pleased,generous' },
    effects: { sociabilityMod: 0.2 },
  });

  // Category-specific
  if (category === 'pantheon') {
    modifiers.push({
      condition: { type: 'relationship', check: 'respect_lt', value: -50 },
      effects: { aggressionMod: 0.5, poolWeightMod: { threat: 30 } },
    });
  }

  return modifiers;
}

// ============================================
// Quirk Processors
// ============================================

export function applyQuirks(
  text: string,
  quirks: Quirk[],
  rng: () => number
): string {
  let result = text;

  for (const quirk of quirks) {
    if (rng() > (quirk.frequency ?? 0.5)) continue;

    if (quirk.type === 'verbal_tic' && quirk.textInserts) {
      const insert = quirk.textInserts[Math.floor(rng() * quirk.textInserts.length)];
      // Insert at natural break points
      const insertPoints = ['. ', '! ', '? ', ', '];
      for (const point of insertPoints) {
        if (result.includes(point) && rng() > 0.5) {
          const idx = result.indexOf(point);
          result = result.slice(0, idx + point.length) + insert + ' ' + result.slice(idx + point.length);
          break;
        }
      }
    }

    if (quirk.type === 'catchphrase' && quirk.textInserts && rng() > 0.7) {
      const phrase = quirk.textInserts[Math.floor(rng() * quirk.textInserts.length)];
      result = result + ' ' + phrase;
    }
  }

  return result;
}

// ============================================
// Trigger Detection
// ============================================

export function detectTriggers(
  message: string,
  speakerSlug: string,
  triggers: EmotionalTrigger[]
): EmotionalTrigger[] {
  const activated: EmotionalTrigger[] = [];
  const lowerMessage = message.toLowerCase();

  for (const trigger of triggers) {
    let matches = false;

    switch (trigger.type) {
      case 'keyword':
        const keywords = Array.isArray(trigger.trigger) ? trigger.trigger : [trigger.trigger];
        matches = keywords.some(kw => kw && lowerMessage.includes(kw.toLowerCase()));
        break;

      case 'npc_mention':
        const npcs = Array.isArray(trigger.trigger) ? trigger.trigger : [trigger.trigger];
        matches = npcs.some(npc => npc && lowerMessage.includes(npc.toLowerCase()));
        break;

      case 'topic':
        const topics = Array.isArray(trigger.trigger) ? trigger.trigger : [trigger.trigger];
        matches = topics.some(topic => topic && lowerMessage.includes(topic.toLowerCase()));
        break;

      case 'compliment':
        matches = /\b(good|great|amazing|wonderful|impressive|smart|wise|strong)\b/i.test(lowerMessage);
        break;

      case 'insult':
        matches = /\b(stupid|weak|pathetic|fool|idiot|useless|worthless)\b/i.test(lowerMessage);
        break;
    }

    if (matches) {
      activated.push(trigger);
    }
  }

  return activated;
}

// ============================================
// Affinity Calculator
// ============================================

export function calculateAffinity(
  sourceProfile: PersonalityProfile,
  targetCategory: NPCCategory,
  targetTraits: PersonalityTrait[]
): number {
  let total = 0;

  for (const affinity of sourceProfile.affinities) {
    if (affinity.target.type === 'category' && affinity.target.value === targetCategory) {
      total += affinity.modifier;
    }
    if (affinity.target.type === 'trait' && targetTraits.includes(affinity.target.value as PersonalityTrait)) {
      total += affinity.modifier;
    }
  }

  return Math.max(-100, Math.min(100, total));
}
