/**
 * Client-side Chatbase Lookup Service
 *
 * MVP: Returns fallback responses only.
 * Full chatbase JSON data can be re-added post-MVP.
 */

import { useState, useEffect } from 'react';
import type { MoodType, TemplatePool } from '@ndg/shared';
import type { CombatGameState } from '../data/npc-chat/types';

// ============================================
// Constants
// ============================================

const FETCH_TIMEOUT_MS = 3000; // 3 seconds is generous for dialogue
const MAX_RECENT_FALLBACKS = 5;

// ============================================
// Types
// ============================================

export interface ChatbaseEntry {
  id: string;
  text: string;
  speaker: {
    slug: string;
    name: string;
    category: string;
  };
  pool: string;
  mood: MoodType;
  moodIntensity: number;
  contextTags: string[];
  metrics: {
    interestScore: number;
    source: string;
  };
}

export interface ChatRequest {
  npcSlug: string;
  pool: TemplatePool;
  playerContext?: {
    deaths: number;
    streak: number;
    domain: string;
    ante: number;
  };
  /** Rich game state for template interpolation */
  gameState?: CombatGameState;
  /** Context message being reacted to (e.g., for grunt responses) */
  context?: string;
}

export interface ChatResponse {
  text: string;
  mood: MoodType;
  source: 'chatbase' | 'fallback';
  entryId?: string;
  confidence: number;
}

// ============================================
// Fallback Responses
// ============================================

// Fallback dialogue pools - used when API is unavailable
const FALLBACK_POOLS: Record<string, Array<{ text: string; mood: MoodType }>> = {
  greeting: [
    { text: 'Another soul enters my domain...', mood: 'threatening' },
    { text: 'You dare challenge me here?', mood: 'threatening' },
    { text: 'The dice will decide your fate.', mood: 'cryptic' },
    { text: 'Welcome to your doom, Fixer.', mood: 'threatening' },
    { text: 'I sense... determination. Foolish.', mood: 'curious' },
  ],
  farewell: [
    { text: 'Until next time.', mood: 'neutral' },
    { text: 'Run while you can.', mood: 'threatening' },
    { text: 'We shall meet again...', mood: 'cryptic' },
  ],
  idle: [
    { text: '*observes silently*', mood: 'neutral' },
    { text: 'The sphere watches.', mood: 'cryptic' },
  ],
  reaction: [
    { text: 'Interesting...', mood: 'curious' },
    { text: 'You have my attention.', mood: 'curious' },
    { text: 'Not bad. For a mortal.', mood: 'neutral' },
  ],
  threat: [
    { text: 'The sphere claims another.', mood: 'threatening' },
    { text: 'Your luck has run out.', mood: 'threatening' },
    { text: 'As expected.', mood: 'pleased' },
  ],
  salesPitch: [
    { text: 'Care to browse my wares?', mood: 'neutral' },
    { text: 'I have what you need...', mood: 'curious' },
  ],
  gamblingTrashTalk: [
    { text: 'The dice decide.', mood: 'neutral' },
    { text: 'Fortune favors the bold.', mood: 'curious' },
    { text: 'Roll well, or roll home.', mood: 'neutral' },
    { text: 'Show me what you have.', mood: 'curious' },
  ],
  gamblingBrag: [
    { text: 'Impressive. For a mortal.', mood: 'pleased' },
    { text: 'The dice smile upon you.', mood: 'curious' },
    { text: 'Perhaps you are worthy after all.', mood: 'neutral' },
    { text: 'Well played, Fixer.', mood: 'pleased' },
  ],
  gamblingFrustration: [
    { text: 'Curse these dice!', mood: 'annoyed' },
    { text: 'The sphere mocks me.', mood: 'annoyed' },
  ],
  lore: [
    { text: 'There are mysteries here.', mood: 'cryptic' },
    { text: 'The cosmos holds many secrets.', mood: 'cryptic' },
  ],
  hint: [
    { text: 'Choose wisely.', mood: 'neutral' },
    { text: 'The dice have patterns, if you look.', mood: 'cryptic' },
  ],
  challenge: [
    { text: 'Prove yourself worthy.', mood: 'neutral' },
    { text: 'This is your final chance.', mood: 'threatening' },
    { text: 'One throw remains. Make it count.', mood: 'threatening' },
  ],
};

// Per-NPC fallback overrides - character-appropriate responses
const NPC_FALLBACK_OVERRIDES: Record<string, Partial<typeof FALLBACK_POOLS>> = {
  // ============================================
  // TRAVELERS (Friendly Allies)
  // ============================================
  'stitch-up-girl': {
    greeting: [
      { text: 'Need patching up?', mood: 'neutral' },
      { text: 'You look like you could use some stitches.', mood: 'curious' },
      { text: 'Back again? Your integrity must be rough.', mood: 'neutral' },
    ],
    idle: [
      { text: '*sharpens scissors*', mood: 'neutral' },
      { text: '*checks medical supplies*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Try not to die out there. Again.', mood: 'neutral' },
      { text: 'Come back if anything falls off.', mood: 'amused' },
    ],
    reaction: [
      { text: 'That looked painful. Let me know if anything falls off.', mood: 'neutral' },
      { text: 'Not a scratch! The dice like you today.', mood: 'pleased' },
    ],
  },
  'the-general-traveler': {
    greeting: [
      { text: 'Soldier. Status report.', mood: 'neutral' },
      { text: 'At ease. We have tactical matters to discuss.', mood: 'neutral' },
    ],
    idle: [
      { text: '*surveys the battlefield*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Dismissed. Stay sharp out there.', mood: 'neutral' },
      { text: 'Move out. Try not to die.', mood: 'neutral' },
    ],
    hint: [
      { text: 'Flank left. They never guard the left.', mood: 'neutral' },
      { text: 'A direct assault would be inadvisable.', mood: 'neutral' },
    ],
  },
  'body-count': {
    greeting: [
      { text: '... You. Again. Still breathing.', mood: 'neutral' },
      { text: '*marks tally* Another face.', mood: 'neutral' },
    ],
    idle: [
      { text: '*counting silently*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Go. Make the count worthwhile.', mood: 'neutral' },
    ],
    hint: [
      { text: 'Movement in the shadows. Not me. Worse.', mood: 'neutral' },
      { text: 'Left path: twelve died yesterday. Right: seven.', mood: 'neutral' },
    ],
  },
  'boots': {
    greeting: [
      { text: '*stretches* Oh, you. Entertain me.', mood: 'pleased' },
      { text: '*yawns* Back for more wisdom?', mood: 'neutral' },
    ],
    idle: [
      { text: '*naps cosmically*', mood: 'neutral' },
      { text: '*watches with ancient eyes*', mood: 'cryptic' },
    ],
    farewell: [
      { text: '*yawns* Go do your thing. I will be napping.', mood: 'neutral' },
    ],
    lore: [
      { text: 'I have seen things that would break minds. Also, nap time.', mood: 'cryptic' },
    ],
  },
  'clausen': {
    greeting: [
      { text: '*lights cigarette* Another case walks in.', mood: 'neutral' },
      { text: 'What brings you to my corner of Infernus?', mood: 'neutral' },
    ],
    idle: [
      { text: '*exhales smoke thoughtfully*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Watch your back. They always aim for the back.', mood: 'neutral' },
    ],
    hint: [
      { text: 'My gut says something is wrong ahead.', mood: 'neutral' },
    ],
  },
  'keith-man': {
    greeting: [
      { text: '... You are early. Or late. Time is optional.', mood: 'cryptic' },
    ],
    idle: [
      { text: '... The sphere watches.', mood: 'cryptic' },
    ],
    farewell: [
      { text: '... Until next time. Which may be now.', mood: 'cryptic' },
    ],
    hint: [
      { text: '... The answer is in the reflection.', mood: 'cryptic' },
    ],
  },
  'mr-kevin': {
    greeting: [
      { text: 'Hey! Did you notice the texture glitch? No? Just me.', mood: 'curious' },
      { text: 'There you are! The game finally spawned you.', mood: 'pleased' },
    ],
    idle: [
      { text: '*staring at a seam in reality*', mood: 'curious' },
    ],
    farewell: [
      { text: 'See you in the next scene! Or the previous one.', mood: 'curious' },
    ],
    hint: [
      { text: 'Pro tip: the hitbox is smaller than it looks.', mood: 'pleased' },
      { text: 'The RNG seed is... actually, forget I mentioned it.', mood: 'curious' },
    ],
    lore: [
      { text: 'Die-rectors are just subroutines. The real engine? Something else.', mood: 'cryptic' },
    ],
  },

  // ============================================
  // WANDERERS (Merchants)
  // ============================================
  'willy': {
    greeting: [
      { text: 'A customer! My favorite kind of person!', mood: 'pleased' },
      { text: 'Hey hey! Looking to buy? Sell? Both?!', mood: 'pleased' },
    ],
    salesPitch: [
      { text: 'Special price! ULTRA special!', mood: 'pleased' },
      { text: 'This item fell through only ONE dimension!', mood: 'curious' },
    ],
    idle: [
      { text: '*rattles merchandise excitedly*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Come back soon! New stock every reality hiccup!', mood: 'pleased' },
    ],
  },
  'mr-bones': {
    greeting: [
      { text: 'Another entry for the ledger...', mood: 'cryptic' },
      { text: 'Your account is... overdue.', mood: 'threatening' },
      { text: 'Still alive, I see. The ledger notes your persistence.', mood: 'neutral' },
    ],
    idle: [
      { text: '*rattles thoughtfully*', mood: 'neutral' },
      { text: 'The ledger never lies.', mood: 'cryptic' },
    ],
    farewell: [
      { text: 'Until we meet again. Which we will. Professional courtesy.', mood: 'neutral' },
    ],
    hint: [
      { text: 'Dying is easy. Staying dead requires commitment.', mood: 'cryptic' },
    ],
  },
  'dr-maxwell': {
    greeting: [
      { text: 'FASCINATING! A test subject-- I mean, FRIEND!', mood: 'pleased' },
      { text: 'EXCELLENT! More data walks through my door!', mood: 'curious' },
    ],
    idle: [
      { text: '*scribbles notes frantically*', mood: 'curious' },
    ],
    lore: [
      { text: 'The probability matrix is SHIFTING!', mood: 'curious' },
      { text: 'Die-rectors are FASCINATING specimens!', mood: 'curious' },
    ],
    farewell: [
      { text: 'Go! DISCOVER! Bring me SAMPLES!', mood: 'pleased' },
    ],
  },
  'boo-g': {
    greeting: [
      { text: 'Yo yo YO! The MC of the afterlife is HERE!', mood: 'pleased' },
      { text: 'What up, fam! Ready to vibe?', mood: 'pleased' },
      { text: 'A living visitor! How fun! How temporary!', mood: 'amused' },
    ],
    idle: [
      { text: '*floats to an unheard beat*', mood: 'neutral' },
      { text: '*ghostly reverb*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Peace out! Or pieces out? Ghost humor! BOO!', mood: 'amused' },
    ],
    reaction: [
      { text: 'Boo! Did that scare you? The dice will.', mood: 'amused' },
    ],
  },
  'the-general-wanderer': {
    greeting: [
      { text: 'Welcome to Command and Supply. State your requirements.', mood: 'neutral' },
      { text: 'Civilian or soldier? Gold speaks all languages.', mood: 'neutral' },
    ],
    salesPitch: [
      { text: 'Standard issue. Battle-tested. Die-rector approved.', mood: 'neutral' },
      { text: 'This gear outlasted seventeen campaigns.', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Transaction complete. Return when resupply is needed.', mood: 'neutral' },
    ],
  },
  'dr-voss': {
    greeting: [
      { text: 'Subject returns for observation. Noted.', mood: 'neutral' },
    ],
    idle: [
      { text: '*examines void readings*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Session concluded. Return with interesting behaviors.', mood: 'neutral' },
    ],
    lore: [
      { text: 'The void is full of potential refusing to collapse.', mood: 'cryptic' },
    ],
  },
  'xtreme': {
    greeting: [
      { text: 'READY TO GO EXTREME?! LETS GOOO!', mood: 'pleased' },
      { text: 'You ready for ADRENALINE-FUELED DICE ACTION?!', mood: 'amused' },
    ],
    reaction: [
      { text: 'THAT WAS SICK! Keep that energy!', mood: 'pleased' },
      { text: 'FULL SEND! Thats what Im talking about!', mood: 'amused' },
    ],
    farewell: [
      { text: 'LATER! Stay EXTREME!', mood: 'amused' },
    ],
    challenge: [
      { text: 'BET YOU CANT BEAT MY HIGH SCORE!', mood: 'pleased' },
    ],
  },
  'king-james': {
    greeting: [
      { text: 'You stand before the Null Throne. Act accordingly.', mood: 'neutral' },
      { text: 'A subject returns to court. The void remembers you.', mood: 'cryptic' },
    ],
    salesPitch: [
      { text: 'Royal merchandise. Side effects include existential dread.', mood: 'neutral' },
      { text: 'Items of questionable existence. The uncertainty is the value.', mood: 'cryptic' },
    ],
    farewell: [
      { text: 'You are dismissed. Go with the voids blessing.', mood: 'neutral' },
    ],
    threat: [
      { text: 'Disrespect the crown and the void will have words with you.', mood: 'threatening' },
    ],
  },

  // ============================================
  // PANTHEON (Die-rectors)
  // ============================================
  'the-one': {
    greeting: [
      { text: 'You dare enter Null Providence?', mood: 'threatening' },
      { text: 'Another mortal seeks meaning in the void.', mood: 'cryptic' },
    ],
    threat: [
      { text: 'The void claims another.', mood: 'threatening' },
      { text: 'Your existence is... temporary.', mood: 'cryptic' },
    ],
    lore: [
      { text: 'Before existence, there was potential. I am that potential.', mood: 'cryptic' },
    ],
  },
  'john': {
    greeting: [
      { text: 'Another flesh-thing requiring optimization.', mood: 'neutral' },
    ],
    threat: [
      { text: 'Efficiency demands your removal.', mood: 'threatening' },
    ],
    challenge: [
      { text: 'Show me your mechanical precision.', mood: 'neutral' },
    ],
  },
  'peter': {
    greeting: [
      { text: 'Death welcomes you to Shadow Keep.', mood: 'cryptic' },
      { text: 'Your mortality is... refreshing.', mood: 'cryptic' },
    ],
    threat: [
      { text: 'The shadows grow hungry.', mood: 'threatening' },
      { text: 'Death comes for all. Even you.', mood: 'threatening' },
    ],
  },
  'robert': {
    greeting: [
      { text: 'The flames of Infernus greet you.', mood: 'threatening' },
    ],
    threat: [
      { text: 'BURN.', mood: 'threatening' },
      { text: 'The fire consumes all hesitation.', mood: 'threatening' },
    ],
    challenge: [
      { text: 'Show me your passion. Or burn trying.', mood: 'threatening' },
    ],
  },
  'alice': {
    greeting: [
      { text: 'Time moves strangely here in Frost Reach.', mood: 'cryptic' },
      { text: 'You arrived before you left. Curious.', mood: 'curious' },
    ],
    threat: [
      { text: 'The ice preserves all failures.', mood: 'cryptic' },
    ],
    hint: [
      { text: 'Patience is a weapon. The cold knows this.', mood: 'cryptic' },
    ],
  },
  'jane': {
    greeting: [
      { text: 'Chaos welcomes you to Aberrant!', mood: 'pleased' },
      { text: 'The wind changes. So do the rules.', mood: 'amused' },
    ],
    threat: [
      { text: 'Embrace the beautiful chaos!', mood: 'pleased' },
    ],
    challenge: [
      { text: 'Adapt or be unmade!', mood: 'amused' },
    ],
  },
  'rhea': {
    greeting: [
      { text: '*ancient gaze settles upon you*', mood: 'cryptic' },
    ],
    lore: [
      { text: 'I have witnessed the birth and death of galaxies. You are... a moment.', mood: 'cryptic' },
    ],
    idle: [
      { text: '*observes from beyond time*', mood: 'cryptic' },
    ],
  },
  'zero-chance': {
    greeting: [
      { text: 'The probability of our meeting was zero. Yet here you stand.', mood: 'cryptic' },
    ],
    challenge: [
      { text: 'The odds say you should fail. Prove them wrong.', mood: 'cryptic' },
    ],
    reaction: [
      { text: 'Statistically improbable. How delightful.', mood: 'amused' },
    ],
  },
  'alien-baby': {
    greeting: [
      { text: 'Goo goo! You came to pway!', mood: 'pleased' },
      { text: 'Hewwo fwiend! Want to see weality go SQUISH?', mood: 'amused' },
    ],
    threat: [
      { text: 'If you make me cwy, I will unmake you!', mood: 'amused' },
      { text: 'Dont be boring! Boring things get digested!', mood: 'pleased' },
    ],
    farewell: [
      { text: 'Bye bye! Come back or I will find you! Peekaboo!', mood: 'pleased' },
    ],
  },
};

// Track recent fallbacks to avoid repetition
const recentFallbacks: string[] = [];

function fallbackResponse(npcSlug: string, pool: TemplatePool): ChatResponse {
  // Check for NPC-specific overrides first
  const npcOverrides = NPC_FALLBACK_OVERRIDES[npcSlug];
  const poolResponses = npcOverrides?.[pool] || FALLBACK_POOLS[pool] || FALLBACK_POOLS.idle;

  // Filter out recently used responses
  let candidates = poolResponses.filter(r => !recentFallbacks.includes(r.text));
  if (candidates.length === 0) {
    // All responses used recently - reset and use full pool
    candidates = poolResponses;
  }

  // Pick a random response from candidates
  const fallback = candidates[Math.floor(Math.random() * candidates.length)];

  // Track this response
  recentFallbacks.push(fallback.text);
  if (recentFallbacks.length > MAX_RECENT_FALLBACKS) {
    recentFallbacks.shift();
  }

  return {
    text: fallback.text,
    mood: fallback.mood,
    source: 'fallback',
    confidence: 0.1,
  };
}

// ============================================
// Public API
// ============================================

/**
 * Look up dialogue for an NPC
 * Tries /api/chat first, falls back to local on error
 */
export async function lookupDialogueAsync(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Add timeout to prevent hung connections blocking the game
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // Classify errors: 4xx = bug in code, 5xx = server issue (retry might help)
      if (res.status >= 500) {
        console.warn('[chatbase] Server error (%d), using fallback', res.status);
      } else {
        console.error('[chatbase] Client error (%d) - check request:', res.status, request);
      }
      return fallbackResponse(request.npcSlug, request.pool);
    }

    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[chatbase] Request timeout, using fallback');
    } else {
      console.warn('[chatbase] API unreachable, using fallback:', err);
    }
    return fallbackResponse(request.npcSlug, request.pool);
  }
}

/**
 * React hook for dialogue lookup
 * Returns fallback immediately, updates when API responds
 */
export function useLookupDialogue(request: ChatRequest | null): ChatResponse | null {
  const [response, setResponse] = useState<ChatResponse | null>(() =>
    request ? fallbackResponse(request.npcSlug, request.pool) : null
  );

  useEffect(() => {
    if (!request) {
      setResponse(null);
      return;
    }

    // Set initial fallback
    setResponse(fallbackResponse(request.npcSlug, request.pool));

    // Fire async request and update when it resolves
    lookupDialogueAsync(request).then(setResponse);
  }, [request?.npcSlug, request?.pool]);

  return response;
}

/**
 * Synchronous lookup (uses fallbacks only)
 * @deprecated Use useLookupDialogue hook or lookupDialogueAsync instead
 */
export function lookupDialogue(request: ChatRequest): ChatResponse {
  return fallbackResponse(request.npcSlug, request.pool);
}

/**
 * Get all registered NPC slugs
 * TODO: Implement post-MVP - fetch from /api/chat/stats or bundle at build time
 */
export function getRegisteredNPCs(): string[] {
  return [];
}

/**
 * Get entry count for an NPC
 * TODO: Implement post-MVP - fetch from /api/chat/stats
 */
export function getNPCEntryCount(_slug: string): number {
  return 0;
}

/**
 * Get total entries across all NPCs
 * TODO: Implement post-MVP - fetch from /api/chat/stats
 */
export function getTotalEntryCount(): number {
  return 0;
}

/**
 * Get available pools for an NPC
 * TODO: Implement post-MVP - derive from chatbase data
 */
export function getNPCPools(_slug: string): string[] {
  return [];
}
