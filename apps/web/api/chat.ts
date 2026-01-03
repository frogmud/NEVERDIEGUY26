/**
 * POST /api/chat - NPC Dialogue Lookup Endpoint
 *
 * Returns appropriate dialogue from chatbase based on NPC, pool, and player context.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatRequest, ChatResponse, TemplatePool } from '@ndg/shared';
import { getLookupEngine } from './_lib/lookup';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // Validate request
    if (!body.npcSlug || !body.pool) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'npcSlug and pool are required',
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

    const response: ChatResponse = {
      text: result.text,
      mood: result.mood,
      source: result.source,
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
