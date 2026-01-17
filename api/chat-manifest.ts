/**
 * GET /api/chat-manifest - NPC Chatbase Manifest Endpoint
 *
 * Returns static manifest of all NPCs, their entry counts, and pools.
 * Used by client-side chatbase service for lookup/stats without round-trips.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getChatManifest } from './_lib/chatbase-data.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Cache for 1 hour (manifest is static)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const manifest = getChatManifest();

    return res.status(200).json({
      ...manifest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
