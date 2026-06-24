/**
 * GET /api/health - Health Check Endpoint
 *
 * Returns service status and environment info.
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

    return res.status(200).json({
      status: 'ok',
      environment: process.env.VERCEL_ENV || 'development',
      cacheLoaded: lookupEngine.isLoaded(),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    // Log full detail server-side; return a generic message in production so
    // internal error text is not leaked to clients.
    console.error('Health handler error:', error);
    const exposeDetail = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      status: 'error',
      environment: process.env.VERCEL_ENV || 'development',
      message: exposeDetail && error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.',
      timestamp: new Date().toISOString(),
    });
  }
}
