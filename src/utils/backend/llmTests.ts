/**
 * LLM Connection Testing Utilities
 * 
 * Provides reusable functions for testing LLM API connections,
 * validating API keys, and testing model responses.
 */

export interface LLMConnectionResult {
  provider: string;
  success: boolean;
  message: string;
  latency?: number;
  details?: any;
  error?: any;
}

export interface LLMProvider {
  id: string;
  name: string;
  envVar: string;
  apiUrl: string;
  testModel: string;
  description: string;
  icon: string;
}

/**
 * Supported LLM Providers
 */
export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    testModel: 'gpt-3.5-turbo',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    icon: '🤖',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    envVar: 'ANTHROPIC_API_KEY',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    testModel: 'claude-3-haiku-20240307',
    description: 'Claude 3 Opus, Sonnet, and Haiku models',
    icon: '🧠',
  },
  {
    id: 'google',
    name: 'Google AI (Gemini)',
    envVar: 'GOOGLE_AI_API_KEY',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models',
    testModel: 'gemini-pro',
    description: 'Gemini Pro and other Google AI models',
    icon: '✨',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    envVar: 'COHERE_API_KEY',
    apiUrl: 'https://api.cohere.ai/v1/generate',
    testModel: 'command',
    description: 'Command and other Cohere models',
    icon: '💬',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    envVar: 'HUGGINGFACE_API_KEY',
    apiUrl: 'https://api-inference.huggingface.co/models',
    testModel: 'gpt2',
    description: 'Access to Hugging Face model hub',
    icon: '🤗',
  },
  {
    id: 'together',
    name: 'Together AI',
    envVar: 'TOGETHER_API_KEY',
    apiUrl: 'https://api.together.xyz/inference',
    testModel: 'togethercomputer/llama-2-7b-chat',
    description: 'Llama 2, Mistral, and other open-source models',
    icon: '🦙',
  },
];

/**
 * Test OpenAI API connection
 */
export async function testOpenAI(apiKey: string): Promise<LLMConnectionResult> {
  const startTime = Date.now();
  const provider = LLM_PROVIDERS.find(p => p.id === 'openai')!;

  try {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider.testModel,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a connection test. Please respond with "Connection successful".',
          },
        ],
        max_tokens: 50,
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        provider: provider.name,
        success: false,
        message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        latency,
        error: data.error,
      };
    }

    return {
      provider: provider.name,
      success: true,
      message: 'Successfully connected to OpenAI API',
      latency,
      details: {
        model: provider.testModel,
        response: data.choices?.[0]?.message?.content || 'OK',
        usage: data.usage,
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      provider: provider.name,
      success: false,
      message: error.message || 'Failed to connect to OpenAI API',
      latency,
      error,
    };
  }
}

/**
 * Test Anthropic Claude API connection
 */
export async function testAnthropic(apiKey: string): Promise<LLMConnectionResult> {
  const startTime = Date.now();
  const provider = LLM_PROVIDERS.find(p => p.id === 'anthropic')!;

  try {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.testModel,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a connection test. Please respond with "Connection successful".',
          },
        ],
        max_tokens: 50,
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        provider: provider.name,
        success: false,
        message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        latency,
        error: data.error,
      };
    }

    return {
      provider: provider.name,
      success: true,
      message: 'Successfully connected to Anthropic API',
      latency,
      details: {
        model: provider.testModel,
        response: data.content?.[0]?.text || 'OK',
        usage: data.usage,
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      provider: provider.name,
      success: false,
      message: error.message || 'Failed to connect to Anthropic API',
      latency,
      error,
    };
  }
}

/**
 * Test Google AI (Gemini) API connection
 */
export async function testGoogleAI(apiKey: string): Promise<LLMConnectionResult> {
  const startTime = Date.now();
  const provider = LLM_PROVIDERS.find(p => p.id === 'google')!;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${provider.testModel}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Hello! This is a connection test. Please respond with "Connection successful".',
              },
            ],
          },
        ],
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        provider: provider.name,
        success: false,
        message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        latency,
        error: data.error,
      };
    }

    return {
      provider: provider.name,
      success: true,
      message: 'Successfully connected to Google AI API',
      latency,
      details: {
        model: provider.testModel,
        response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK',
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      provider: provider.name,
      success: false,
      message: error.message || 'Failed to connect to Google AI API',
      latency,
      error,
    };
  }
}

/**
 * Test Cohere API connection
 */
export async function testCohere(apiKey: string): Promise<LLMConnectionResult> {
  const startTime = Date.now();
  const provider = LLM_PROVIDERS.find(p => p.id === 'cohere')!;

  try {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider.testModel,
        prompt: 'Hello! This is a connection test. Please respond with "Connection successful".',
        max_tokens: 50,
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        provider: provider.name,
        success: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        latency,
        error: data,
      };
    }

    return {
      provider: provider.name,
      success: true,
      message: 'Successfully connected to Cohere API',
      latency,
      details: {
        model: provider.testModel,
        response: data.generations?.[0]?.text || 'OK',
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      provider: provider.name,
      success: false,
      message: error.message || 'Failed to connect to Cohere API',
      latency,
      error,
    };
  }
}

/**
 * Test Hugging Face API connection
 */
export async function testHuggingFace(apiKey: string): Promise<LLMConnectionResult> {
  const startTime = Date.now();
  const provider = LLM_PROVIDERS.find(p => p.id === 'huggingface')!;

  try {
    const url = `${provider.apiUrl}/${provider.testModel}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: 'Hello! This is a connection test.',
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        provider: provider.name,
        success: false,
        message: data.error || `HTTP ${response.status}: ${response.statusText}`,
        latency,
        error: data,
      };
    }

    return {
      provider: provider.name,
      success: true,
      message: 'Successfully connected to Hugging Face API',
      latency,
      details: {
        model: provider.testModel,
        response: Array.isArray(data) ? data[0]?.generated_text : 'OK',
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      provider: provider.name,
      success: false,
      message: error.message || 'Failed to connect to Hugging Face API',
      latency,
      error,
    };
  }
}

/**
 * Test Together AI API connection
 */
export async function testTogetherAI(apiKey: string): Promise<LLMConnectionResult> {
  const startTime = Date.now();
  const provider = LLM_PROVIDERS.find(p => p.id === 'together')!;

  try {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider.testModel,
        prompt: 'Hello! This is a connection test. Please respond with "Connection successful".',
        max_tokens: 50,
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        provider: provider.name,
        success: false,
        message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        latency,
        error: data.error,
      };
    }

    return {
      provider: provider.name,
      success: true,
      message: 'Successfully connected to Together AI API',
      latency,
      details: {
        model: provider.testModel,
        response: data.output?.choices?.[0]?.text || 'OK',
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      provider: provider.name,
      success: false,
      message: error.message || 'Failed to connect to Together AI API',
      latency,
      error,
    };
  }
}

/**
 * Test LLM provider based on provider ID
 */
export async function testLLMProvider(
  providerId: string,
  apiKey: string
): Promise<LLMConnectionResult> {
  switch (providerId) {
    case 'openai':
      return testOpenAI(apiKey);
    case 'anthropic':
      return testAnthropic(apiKey);
    case 'google':
      return testGoogleAI(apiKey);
    case 'cohere':
      return testCohere(apiKey);
    case 'huggingface':
      return testHuggingFace(apiKey);
    case 'together':
      return testTogetherAI(apiKey);
    default:
      return {
        provider: 'Unknown',
        success: false,
        message: `Unknown provider: ${providerId}`,
      };
  }
}

/**
 * Check which LLM API keys are configured
 */
export function checkLLMApiKeys(): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  LLM_PROVIDERS.forEach((provider) => {
    // In browser, we can't directly check env vars
    // This would need to be done server-side
    results[provider.envVar] = false; // Default to false
  });

  return results;
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKeyFormat(providerId: string, apiKey: string): {
  valid: boolean;
  message: string;
} {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, message: 'API key is required' };
  }

  switch (providerId) {
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, message: 'OpenAI API keys should start with "sk-"' };
      }
      break;
    case 'anthropic':
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, message: 'Anthropic API keys should start with "sk-ant-"' };
      }
      break;
    // Add more specific validations as needed
  }

  if (apiKey.length < 20) {
    return { valid: false, message: 'API key seems too short' };
  }

  return { valid: true, message: 'API key format looks valid' };
}

/**
 * Get performance rating for LLM response time
 */
export function getLLMPerformanceRating(ms: number): {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  label: string;
  color: string;
} {
  if (ms < 500) {
    return { rating: 'excellent', label: 'Excellent', color: 'green' };
  } else if (ms < 1500) {
    return { rating: 'good', label: 'Good', color: 'blue' };
  } else if (ms < 3000) {
    return { rating: 'fair', label: 'Fair', color: 'yellow' };
  } else {
    return { rating: 'poor', label: 'Slow', color: 'red' };
  }
}

/**
 * Format LLM response time for display
 */
export function formatLLMLatency(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Get estimated cost per 1K tokens (approximate)
 */
export function getEstimatedCost(providerId: string, model: string): {
  input: number;
  output: number;
  currency: string;
} {
  // Approximate costs - update with actual pricing
  const costs: Record<string, { input: number; output: number }> = {
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'gemini-pro': { input: 0.00025, output: 0.0005 },
  };

  return {
    input: costs[model]?.input || 0,
    output: costs[model]?.output || 0,
    currency: 'USD',
  };
}
