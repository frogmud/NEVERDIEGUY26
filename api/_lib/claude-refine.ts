/**
 * Claude AI Refinement for NPC Dialogue
 *
 * Takes chatbase lookups and refines them through Claude
 * to ensure responses stay in character and feel natural.
 *
 * NEVER DIE GUY
 */

import { getPersona } from './npc-personas.js';

// Lazy-initialized Anthropic client (loaded dynamically)
let anthropicClient: unknown = null;
let anthropicLoadFailed = false;

async function getClient(): Promise<unknown> {
  if (anthropicLoadFailed) {
    throw new Error('Anthropic SDK not available');
  }
  if (!anthropicClient) {
    try {
      // Dynamic import to avoid module resolution errors when SDK isn't installed
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } catch {
      anthropicLoadFailed = true;
      throw new Error('Anthropic SDK not available - install @anthropic-ai/sdk');
    }
  }
  return anthropicClient;
}

export interface ConversationContext {
  targetNpcSlug?: string;
  targetNpcName?: string;
  relationshipType?: string;
  relationshipStrength?: number;
  tone?: {
    warmth: number;
    tension: number;
    formality: 'casual' | 'formal';
    tone: string;
  };
  previousText?: string;
  domainSlug?: string;
}

export interface RefineOptions {
  npcSlug: string;
  chatbaseText: string;
  pool: string;
  context?: string;
  /** Context for multi-NPC conversations */
  conversationContext?: ConversationContext;
}

export interface RefineResult {
  text: string;
  refined: boolean;
  error?: string;
}

/**
 * Refine chatbase dialogue through Claude to make it more natural and in-character
 *
 * @param options - Refinement options
 * @returns Refined text (or original if refinement fails/disabled)
 */
export async function refineWithClaude(options: RefineOptions): Promise<RefineResult> {
  const { npcSlug, chatbaseText, pool, context, conversationContext } = options;

  // Get persona for this NPC
  const persona = getPersona(npcSlug);
  if (!persona) {
    // No persona defined - return original
    return {
      text: chatbaseText,
      refined: false,
      error: `No persona found for NPC: ${npcSlug}`,
    };
  }

  try {
    const client = await getClient() as {
      messages: {
        create: (params: {
          model: string;
          max_tokens: number;
          temperature: number;
          system: string;
          messages: Array<{ role: string; content: string }>;
        }) => Promise<{
          content: Array<{ type: string; text?: string }>;
        }>;
      };
    };

    // Model is env-configurable for easy switching
    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

    // Add timeout to prevent hanging requests
    const TIMEOUT_MS = 5000;
    const apiCall = client.messages.create({
      model,
      max_tokens: 300,
      temperature: 0.7, // Lower than 0.8 for more consistent character voice
      system: persona.systemPrompt,
      messages: [
        {
          role: 'user',
          content: buildRefinePrompt(persona.name, chatbaseText, pool, context, conversationContext),
        },
      ],
    });

    const response = await Promise.race([
      apiCall,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Claude API timeout')), TIMEOUT_MS)
      ),
    ]);

    // Extract text from response
    const content = response.content[0];
    if (content.type === 'text' && content.text) {
      const refinedText = content.text.trim();
      // Sanity check - don't return empty or too-short responses
      if (refinedText.length >= 3) {
        return {
          text: refinedText,
          refined: true,
        };
      }
    }

    // Fallback to original if refinement produced nothing useful
    return {
      text: chatbaseText,
      refined: false,
      error: 'Refinement produced empty response',
    };
  } catch (err) {
    // Log error but don't crash - return original text
    console.error(`[claude-refine] Error refining for ${npcSlug}:`, err);
    return {
      text: chatbaseText,
      refined: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Build the refinement prompt for Claude
 */
function buildRefinePrompt(
  npcName: string,
  originalText: string,
  pool: string,
  context?: string,
  conversationContext?: ConversationContext
): string {
  const contextLine = context
    ? `\nPlayer context: "${context}"`
    : '';

  // Build conversation context section for multi-NPC dialogue
  let conversationSection = '';
  if (conversationContext) {
    const parts: string[] = [];

    if (conversationContext.targetNpcName) {
      parts.push(`Speaking to: ${conversationContext.targetNpcName}`);
    }

    if (conversationContext.relationshipType) {
      const strength = conversationContext.relationshipStrength
        ? ` (strength ${conversationContext.relationshipStrength}/10)`
        : '';
      parts.push(`Relationship: ${conversationContext.relationshipType.replace(/_/g, ' ')}${strength}`);
    }

    if (conversationContext.tone) {
      const { warmth, tension, formality, tone } = conversationContext.tone;
      parts.push(`Tone: ${tone} (warmth: ${warmth}%, tension: ${tension}%, ${formality})`);
    }

    if (conversationContext.previousText) {
      parts.push(`Responding to: "${conversationContext.previousText}"`);
    }

    if (parts.length > 0) {
      conversationSection = `\n\nConversation context:\n${parts.map(p => `- ${p}`).join('\n')}`;
    }
  }

  // Adjust rules based on whether this is NPC-to-NPC dialogue
  const isNPCDialogue = pool.startsWith('npc') || conversationContext?.targetNpcSlug;
  const additionalRules = isNPCDialogue
    ? `\n- Address the other NPC naturally (use their name or a nickname)
- Reflect the relationship dynamic in your tone
- React to what they said if responding to a previous message`
    : '';

  return `Refine this dialogue line for ${npcName}. Make it sound more natural and strongly in-character while keeping the same general meaning and length.

Original line: "${originalText}"
Dialogue type: ${pool}${contextLine}${conversationSection}

Rules:
- Keep similar length (1-3 sentences max)
- Stay completely in character
- Include *action* if appropriate
- Ensure that truncation of messages doesn't hinder meaning or intent
- Do NOT add explanations or meta-commentary
- Do NOT use modern internet slang unless it fits the character${additionalRules}

Respond with ONLY the refined dialogue line, nothing else.`;
}

/**
 * Check if Claude refinement is enabled via environment variable
 */
export function isRefinementEnabled(): boolean {
  return process.env.ENABLE_CLAUDE_REFINEMENT === 'true';
}
