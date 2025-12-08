/**
 * AI Agent Chat Edge Function
 * Handles chat messages for text-based AI agents
 * Supports: OpenAI, DeepSeek
 */

import { corsHeaders } from '../_shared/cors.ts';

// Provider endpoints
const ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
};

interface ChatRequest {
  provider: 'openai' | 'deepseek';
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  apiKey?: string; // Optional - can use server-side key
}

interface ChatResponse {
  choices: { message: { content: string } }[];
  usage: { total_tokens: number };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      provider = 'openai',
      model = 'gpt-4o-mini',
      messages,
      temperature = 0.7,
      maxTokens = 500,
      apiKey,
    }: ChatRequest = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get API key from request or environment
    let resolvedApiKey = apiKey;
    if (!resolvedApiKey) {
      if (provider === 'openai') {
        resolvedApiKey = Deno.env.get('OPENAI_API_KEY');
      } else if (provider === 'deepseek') {
        resolvedApiKey = Deno.env.get('DEEPSEEK_API_KEY');
      }
    }

    if (!resolvedApiKey) {
      return new Response(
        JSON.stringify({ error: `API key not configured for ${provider}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endpoint = ENDPOINTS[provider];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Make request to LLM provider
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resolvedApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`${provider} API error:`, response.status, errorData);
      return new Response(
        JSON.stringify({
          error: `${provider} API error: ${response.status}`,
          details: errorData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data: ChatResponse = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Agent Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
