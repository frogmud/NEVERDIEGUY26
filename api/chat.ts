/**
 * POST /api/chat - NPC Dialogue Lookup Endpoint
 *
 * Returns appropriate dialogue from chatbase based on NPC, pool, and player context.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatRequest, ChatResponse, TemplatePool } from '../packages/shared/src/types/index.js';
import { getLookupEngine } from './_lib/lookup.js';
import { refineWithClaude, isRefinementEnabled } from './_lib/claude-refine.js';
import { getRegisteredNPCs } from './_lib/chatbase-data.js';

// ============================================
// Rate Limiting (in-memory, resets on cold start)
// ============================================
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60_000);

// ============================================
// Allowed Origins (CORS)
// ============================================
const ALLOWED_ORIGINS = [
  'https://neverdieguy.com',
  'https://www.neverdieguy.com',
  'https://neverdieguy-26.vercel.app',
  // Allow localhost for dev
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsOrigin(requestOrigin: string | undefined): string {
  if (!requestOrigin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  // In dev mode, allow any origin
  if (process.env.NODE_ENV === 'development') return requestOrigin;
  return ALLOWED_ORIGINS[0];
}

// ============================================
// Valid Pools
// ============================================
const VALID_POOLS: TemplatePool[] = [
  'greeting', 'farewell', 'idle', 'reaction', 'threat', 'salesPitch',
  'gamblingTrashTalk', 'gamblingBrag', 'gamblingFrustration',
  'lore', 'hint', 'challenge', 'npcGossip', 'npcConflict', 'npcReaction',
  'alliance', 'betrayal', 'rescue',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get client IP for rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown';

  // Rate limit check
  const rateLimit = checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Try again in a minute.',
    });
  }

  // CORS headers - locked to specific origins in production
  const origin = getCorsOrigin(req.headers.origin as string);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Use POST to request NPC dialogue',
    });
  }

  try {
    const body = req.body as ChatRequest;

    // Validate required fields
    if (!body.npcSlug || !body.pool) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'npcSlug and pool are required',
      });
    }

    // Validate npcSlug against registered NPCs
    const validNPCs = getRegisteredNPCs();
    if (!validNPCs.includes(body.npcSlug)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unknown NPC: ${body.npcSlug}`,
      });
    }

    // Validate pool is a known TemplatePool
    if (!VALID_POOLS.includes(body.pool as TemplatePool)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unknown pool: ${body.pool}`,
      });
    }

    // Get lookup engine
    const lookupEngine = await getLookupEngine();

    // Perform lookup
    const result = await lookupEngine.lookup({
      npcSlug: body.npcSlug,
      pool: body.pool as TemplatePool,
      contextHash: body.contextHash,
      playerContext: body.playerContext,
    });

    // Optionally refine through Claude if enabled
    let finalText = result.text;
    let finalSource = result.source;

    if (isRefinementEnabled() && result.source === 'chatbase') {
      try {
        const refined = await refineWithClaude({
          npcSlug: body.npcSlug,
          chatbaseText: result.text,
          pool: body.pool,
          context: body.context,
        });

        if (refined.refined) {
          finalText = refined.text;
          finalSource = 'claude_search';
        }
      } catch (err) {
        // Refinement failed - use original chatbase text
        console.warn('[chat] Claude refinement failed, using original:', err);
      }
    }

    const response: ChatResponse = {
      text: finalText,
      mood: result.mood,
      source: finalSource,
      entryId: result.entryId,
      confidence: result.confidence,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Chat handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
