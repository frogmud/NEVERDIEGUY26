/**
 * Response Selector
 *
 * Core deterministic template selection engine.
 * Uses seeded RNG for reproducible "authored" feel per run.
 *
 * Seed = runSeed + npcSlug + roomIndex + intent
 * Same run + same room + same NPC + same intent = same response
 */

import { createSeededRng, type SeededRng } from '../pools/seededRng';
import type {
  ResponseTemplate,
  TemplatePool,
  MoodType,
  ResponseContext,
  SelectedResponse,
  NPCPersonalityConfig,
  NPCConversation,
  TemplateCondition,
  NPCTriggerEvent,
} from './types';
import { deriveMood, getFavorLevel, createDefaultRelationship } from './relationship';
import { detectIntentPool } from './intent-detector';
import { processVariables, buildVariableContext } from './variable-processor';
import { applyDomainTint, getDomainVariables } from './domain-tint';
import { mapTriggerToPool } from './triggers';

// ============================================
// Seed Generation
// ============================================

export interface SeedContext {
  runSeed: string;
  npcSlug: string;
  roomIndex: number;
  intent: string;
}

/**
 * Generate deterministic seed for template selection
 */
export function getChatSeed(context: SeedContext): string {
  return `${context.runSeed}:${context.npcSlug}:${context.roomIndex}:${context.intent}`;
}

// ============================================
// Recently Used Tracking
// ============================================

const MAX_RECENTLY_USED = 5;

/**
 * Check if template was recently used (prevent repeats)
 */
export function isRecentlyUsed(
  templateId: string,
  conversation: NPCConversation | undefined
): boolean {
  if (!conversation) return false;
  return conversation.recentlyUsedTemplates.includes(templateId);
}

/**
 * Mark template as used
 */
export function markTemplateUsed(
  conversation: NPCConversation,
  templateId: string,
  roomIndex: number
): NPCConversation {
  const recentlyUsed = [
    templateId,
    ...conversation.recentlyUsedTemplates.filter((id) => id !== templateId),
  ].slice(0, MAX_RECENTLY_USED);

  return {
    ...conversation,
    recentlyUsedTemplates: recentlyUsed,
    cooldownsActive: {
      ...conversation.cooldownsActive,
      [templateId]: roomIndex,
    },
  };
}

// ============================================
// Cooldown Checking
// ============================================

/**
 * Check if template is on cooldown
 */
export function isOnCooldown(
  template: ResponseTemplate,
  conversation: NPCConversation | undefined,
  currentRoom: number
): boolean {
  if (!template.cooldown) return false;
  if (!conversation) return false;

  // Check room-based cooldown
  if (template.cooldown.rooms) {
    const lastUsedRoom = conversation.cooldownsActive[template.id];
    if (lastUsedRoom !== undefined) {
      const roomsSinceUse = currentRoom - lastUsedRoom;
      if (roomsSinceUse < template.cooldown.rooms) {
        return true;
      }
    }
  }

  // Check oncePerRun
  if (template.cooldown.oncePerRun) {
    if (conversation.usedOncePerRun?.includes(template.id)) {
      return true;
    }
  }

  return false;
}

// ============================================
// Condition Evaluation
// ============================================

/**
 * Evaluate a template condition
 */
export function evaluateCondition(
  condition: TemplateCondition,
  context: ResponseContext
): boolean {
  const { type, comparison, value } = condition;

  let actual: number | string;

  switch (type) {
    case 'favorLevel':
      actual = context.relationship
        ? getFavorLevel(context.relationship)
        : 0;
      break;
    case 'heat':
      actual = context.heat;
      break;
    case 'integrity':
      actual = context.playerIntegrity;
      break;
    case 'domain':
      actual = context.currentDomain;
      break;
    case 'runCount':
      // Would need to be added to context
      actual = 0;
      break;
    default:
      return true; // Unknown condition type passes
  }

  // Compare based on type
  if (typeof actual === 'string' && typeof value === 'string') {
    return comparison === 'eq' ? actual === value : actual !== value;
  }

  if (typeof actual === 'number' && typeof value === 'number') {
    switch (comparison) {
      case 'gt':
        return actual > value;
      case 'lt':
        return actual < value;
      case 'eq':
        return actual === value;
      case 'gte':
        return actual >= value;
      case 'lte':
        return actual <= value;
      default:
        return true;
    }
  }

  return true;
}

/**
 * Check if all conditions pass
 */
export function evaluateConditions(
  conditions: TemplateCondition[] | undefined,
  context: ResponseContext
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, context));
}

// ============================================
// Candidate Filtering
// ============================================

/**
 * Get candidate templates matching pool, mood, and conditions
 */
export function getCandidates(
  templates: ResponseTemplate[],
  npcSlug: string,
  pool: TemplatePool,
  mood: MoodType,
  context: ResponseContext,
  conversation: NPCConversation | undefined
): ResponseTemplate[] {
  return templates.filter((t) => {
    // Must match NPC
    if (t.entitySlug !== npcSlug) return false;

    // Must match pool
    if (t.pool !== pool) return false;

    // Must match mood (or be 'any')
    if (t.mood !== 'any' && t.mood !== mood) return false;

    // Must not be recently used
    if (isRecentlyUsed(t.id, conversation)) return false;

    // Must not be on cooldown
    if (isOnCooldown(t, conversation, context.roomIndex)) return false;

    // Must pass all conditions
    if (!evaluateConditions(t.conditions, context)) return false;

    // Exclude ambient templates during direct conversation
    if (context.isDirectConversation && t.purpose === 'ambient') return false;

    return true;
  });
}

// ============================================
// Weighted Selection
// ============================================

/**
 * Select template using weighted random selection
 */
export function weightedSelect(
  candidates: ResponseTemplate[],
  rng: SeededRng,
  namespace: string
): ResponseTemplate | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Calculate total weight
  const totalWeight = candidates.reduce((sum, t) => sum + t.weight, 0);

  // Random selection
  let random = rng.random(namespace) * totalWeight;

  for (const candidate of candidates) {
    random -= candidate.weight;
    if (random <= 0) {
      return candidate;
    }
  }

  // Fallback to last (shouldn't happen)
  return candidates[candidates.length - 1];
}

// ============================================
// Main Selection Function
// ============================================

/**
 * Select an NPC response
 *
 * This is the core function that:
 * 1. Builds deterministic seed
 * 2. Derives mood from relationship + context
 * 3. Gets candidates matching pool + mood + conditions
 * 4. Selects using weighted RNG
 * 5. Processes variables
 * 6. Returns response with action payload
 */
export function selectResponse(
  npcSlug: string,
  trigger: NPCTriggerEvent | 'playerMessage',
  context: ResponseContext,
  templates: ResponseTemplate[],
  personality: NPCPersonalityConfig,
  conversation: NPCConversation | undefined
): SelectedResponse | null {
  // 1. Build deterministic seed
  const intent =
    trigger === 'playerMessage'
      ? detectIntentPool(context.playerMessage || '').pool
      : mapTriggerToPool(trigger);

  const seed = getChatSeed({
    runSeed: context.runSeed,
    npcSlug,
    roomIndex: context.roomIndex,
    intent,
  });
  const rng = createSeededRng(seed);

  // 2. Get relationship (use default if not found)
  const relationship =
    context.relationship || createDefaultRelationship(npcSlug);

  // 3. Derive mood from relationship + run context
  const mood = deriveMood(relationship, context);

  // 4. Determine pool
  const pool: TemplatePool =
    trigger === 'playerMessage'
      ? detectIntentPool(context.playerMessage || '').pool
      : mapTriggerToPool(trigger);

  // 5. Apply domain tinting to pool weights
  const tintedWeights = applyDomainTint(personality.poolWeights, context.currentDomain);

  // 6. Get candidates
  const candidates = getCandidates(
    templates,
    npcSlug,
    pool,
    mood,
    context,
    conversation
  );

  // 7. Weighted selection
  const template = weightedSelect(candidates, rng, `select:${npcSlug}:${pool}`);

  if (!template) {
    // Try fallback to 'any' mood
    const anyMoodCandidates = templates.filter(
      (t) =>
        t.entitySlug === npcSlug &&
        t.pool === pool &&
        t.mood === 'any' &&
        !isRecentlyUsed(t.id, conversation) &&
        !isOnCooldown(t, conversation, context.roomIndex) &&
        evaluateConditions(t.conditions, context)
    );

    const fallbackTemplate = weightedSelect(
      anyMoodCandidates,
      rng,
      `fallback:${npcSlug}:${pool}`
    );

    if (!fallbackTemplate) {
      return null; // No template available
    }

    // Use fallback
    return buildResponse(fallbackTemplate, context, mood, seed, personality);
  }

  return buildResponse(template, context, mood, seed, personality);
}

/**
 * Build the final response object
 */
function buildResponse(
  template: ResponseTemplate,
  context: ResponseContext,
  mood: MoodType,
  seed: string,
  personality: NPCPersonalityConfig
): SelectedResponse {
  // Get domain variables
  const domainVars = getDomainVariables(context.currentDomain);

  // Build variable context
  const variableContext = buildVariableContext(context, personality, domainVars);

  // Choose text (main or random variant)
  let text = template.text;
  if (template.variants && template.variants.length > 0) {
    // Could use RNG to pick variant, but for now use main text
    // Variants are for A/B testing or manual selection
  }

  // Process variables
  const processedText = processVariables(text, variableContext);

  return {
    text: processedText,
    mood,
    templateId: template.id,
    purpose: template.purpose,
    quickReplies: template.quickReplies,
    action: template.action,
    seed,
  };
}

// ============================================
// Fallback Template
// ============================================

/**
 * Create a generic fallback response when no templates match
 * Provides meaningful responses based on mood instead of "..."
 */
export function createFallbackResponse(
  npcSlug: string,
  mood: MoodType,
  seed: string
): SelectedResponse {
  const fallbackTexts: Record<MoodType, string[]> = {
    generous: [
      '*nods warmly* "What can I help you with?"',
      '"I have time to spare. What do you need?"',
      '*smiles* "Always happy to assist."',
    ],
    pleased: [
      '"Yes? How can I be of service?"',
      '*looks up attentively* "Go on..."',
      '"I appreciate the company."',
    ],
    neutral: [
      '*acknowledges your presence*',
      '"Hmm?"',
      '*pauses and looks at you*',
      '"What brings you here?"',
    ],
    amused: [
      '*chuckles softly* "Interesting..."',
      '"You do keep things entertaining."',
      '*raises an eyebrow with a slight smile*',
    ],
    cryptic: [
      '"The dice reveal more than you know..."',
      '*stares into the distance* "Curious timing."',
      '"Some questions answer themselves."',
    ],
    annoyed: [
      '*sighs* "What is it now?"',
      '"Make it quick."',
      '*crosses arms impatiently*',
    ],
    threatening: [
      '*narrows eyes* "Choose your next words carefully."',
      '"You test my patience..."',
      '*a cold silence fills the air*',
    ],
  };

  // Use seed to deterministically pick a response
  const responses = fallbackTexts[mood] || fallbackTexts.neutral;
  const index = Math.abs(hashString(seed)) % responses.length;

  return {
    text: responses[index],
    mood,
    templateId: 'fallback',
    purpose: 'ambient',
    seed,
  };
}

/**
 * Simple string hash for deterministic selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// ============================================
// Export for testing
// ============================================

export const __testing = {
  getCandidates,
  weightedSelect,
  evaluateCondition,
  evaluateConditions,
  isRecentlyUsed,
  isOnCooldown,
};
