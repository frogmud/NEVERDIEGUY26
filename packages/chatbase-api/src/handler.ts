/**
 * @ndg/chatbase-api - Cloudflare Worker Handler
 *
 * Edge function for server-side chatbase lookups.
 * Claude acts as a curator - selecting from existing entries, never generating.
 */

import type { ChatRequest, ChatResponse, TemplatePool, MoodType } from '@ndg/shared';

import { ChatbaseLookup } from './lookup';

// Cloudflare Worker environment bindings
export interface Env {
  CHATBASE: KVNamespace;
  CHATBASE_STORAGE?: R2Bucket;
  ANTHROPIC_API_KEY?: string;
  ENVIRONMENT: string;
}

// Cache lookup engine per isolate
let lookupEngine: ChatbaseLookup | null = null;

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Initialize lookup engine if needed
      if (!lookupEngine) {
        lookupEngine = new ChatbaseLookup(env);
        await lookupEngine.initialize();
      }

      // Route handling
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return handleChatRequest(request, env, corsHeaders);
      }

      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          environment: env.ENVIRONMENT,
          cacheLoaded: lookupEngine?.isLoaded() ?? false,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (url.pathname === '/api/stats') {
        return new Response(JSON.stringify(lookupEngine?.getStats() ?? {}), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Handler error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

/**
 * Handle chat request - look up appropriate dialogue from chatbase
 */
async function handleChatRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const body = await request.json() as ChatRequest;

  // Validate request
  if (!body.npcSlug || !body.pool) {
    return new Response(JSON.stringify({
      error: 'Bad Request',
      message: 'npcSlug and pool are required',
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Perform lookup
  const result = await lookupEngine!.lookup({
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

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
