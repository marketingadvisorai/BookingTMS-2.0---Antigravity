/**
 * AI Error Analysis Edge Function
 * Analyzes errors using Claude or GPT and stores results
 * @version 1.0.0
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  errorId: string;
  provider?: 'anthropic' | 'openai';
}

interface ErrorData {
  id: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  component?: string;
  file_path?: string;
  line_number?: number;
  url?: string;
  browser?: string;
  os?: string;
  occurrence_count: number;
  first_seen_at: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { errorId, provider = 'anthropic' } = await req.json() as AnalysisRequest;

    if (!errorId) {
      return new Response(
        JSON.stringify({ error: 'errorId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch error details
    const { data: error, error: fetchError } = await supabase
      .from('system_errors')
      .select('*')
      .eq('id', errorId)
      .single();

    if (fetchError || !error) {
      return new Response(
        JSON.stringify({ error: 'Error not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate analysis
    const analysis = await analyzeError(error as ErrorData, provider);

    // Store analysis result
    await supabase
      .from('system_errors')
      .update({
        ai_analysis: analysis,
        ai_suggestion: analysis.suggestedFix,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', errorId);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Analysis error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeError(
  error: ErrorData,
  provider: 'anthropic' | 'openai'
): Promise<Record<string, unknown>> {
  const prompt = generatePrompt(error);

  if (provider === 'anthropic') {
    return analyzeWithClaude(prompt);
  } else {
    return analyzeWithOpenAI(prompt);
  }
}

function generatePrompt(error: ErrorData): string {
  return `
You are an expert software engineer analyzing a production error.

ERROR DETAILS:
- Type: ${error.error_type}
- Message: ${error.message}
- Stack Trace: ${error.stack_trace || 'Not available'}
- Component: ${error.component || 'Unknown'}
- File: ${error.file_path || 'Unknown'}${error.line_number ? `:${error.line_number}` : ''}

CONTEXT:
- URL: ${error.url || 'Unknown'}
- Browser: ${error.browser || 'Unknown'}
- OS: ${error.os || 'Unknown'}
- Occurrences: ${error.occurrence_count}
- First seen: ${error.first_seen_at}

Please analyze this error and provide a response in JSON format:
{
  "rootCause": "What likely caused this error (1-2 sentences)",
  "impact": "Estimated user impact (brief)",
  "suggestedFix": "Code fix suggestion if applicable",
  "prevention": "How to prevent this in the future (brief)",
  "severity": number between 1-5 where 5 is critical,
  "confidence": number between 0-100 indicating your confidence
}

Respond ONLY with valid JSON, no additional text.
`.trim();
}

async function analyzeWithClaude(prompt: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return createFallbackAnalysis('Anthropic API key not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    return {
      ...JSON.parse(content),
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
    };
  } catch (err) {
    return createFallbackAnalysis(`Claude analysis failed: ${err}`);
  }
}

async function analyzeWithOpenAI(prompt: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return createFallbackAnalysis('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return {
      ...JSON.parse(content),
      provider: 'openai',
      model: 'gpt-4-turbo',
    };
  } catch (err) {
    return createFallbackAnalysis(`OpenAI analysis failed: ${err}`);
  }
}

function createFallbackAnalysis(reason: string): Record<string, unknown> {
  return {
    rootCause: 'Unable to perform automated analysis',
    impact: 'Manual review required',
    suggestedFix: null,
    prevention: 'Review error details manually',
    severity: 3,
    confidence: 0,
    error: reason,
    provider: 'fallback',
    model: 'none',
  };
}
