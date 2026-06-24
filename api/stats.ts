/**
 * GET /api/stats - Lookup Statistics Endpoint
 *
 * Returns chatbase lookup statistics.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLookupEngine } from './_lib/lookup.js';

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
    // Log full detail server-side; return a generic message in production so
    // internal error text is not leaked to clients.
    console.error('Stats handler error:', error);
    const exposeDetail = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      error: 'Internal Server Error',
      message: exposeDetail && error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.',
    });
  }
}
