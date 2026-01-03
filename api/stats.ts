/**
 * GET /api/stats - Lookup Statistics Endpoint
 *
 * Returns chatbase lookup statistics.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLookupEngine } from './_lib/lookup';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const lookupEngine = await getLookupEngine();
    const stats = lookupEngine.getStats();

    return res.status(200).json({
      ...stats,
      hitRate: stats.lookups > 0
        ? ((stats.hits / stats.lookups) * 100).toFixed(1) + '%'
        : 'N/A',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
