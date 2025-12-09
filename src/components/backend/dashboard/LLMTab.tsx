/**
 * LLM Connections Tab Component
 * Manages LLM provider connections and API key testing
 * SECURITY: API keys stored in component state only, not localStorage
 * @module components/backend/dashboard/LLMTab
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Eye,
  EyeOff,
  Trash2,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LLM_PROVIDERS,
  testLLMProvider,
  validateApiKeyFormat,
  formatLLMLatency,
  getLLMPerformanceRating,
  type LLMConnectionResult,
  type LLMProvider,
} from '@/utils/backend/llmTests';
import { DashboardTheme } from './types';

interface LLMTabProps {
  theme: DashboardTheme;
}

export function LLMTab({ theme }: LLMTabProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  // SECURITY: Keys stored in component state only, NOT localStorage
  const [llmApiKeys, setLlmApiKeys] = useState<Record<string, string>>({});
  const [llmResults, setLlmResults] = useState<Record<string, LLMConnectionResult>>({});
  const [llmTesting, setLlmTesting] = useState<Record<string, boolean>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const handleLlmApiKeyChange = (providerId: string, value: string) => {
    setLlmApiKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const toggleShowApiKey = (providerId: string) => {
    setShowApiKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const clearApiKey = (providerId: string) => {
    setLlmApiKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[providerId];
      return newKeys;
    });
    setLlmResults((prev) => {
      const newResults = { ...prev };
      delete newResults[providerId];
      return newResults;
    });
    toast.success(`${LLM_PROVIDERS.find((p) => p.id === providerId)?.name} API key cleared`);
  };

  const testLlmConnection = async (provider: LLMProvider) => {
    const apiKey = llmApiKeys[provider.id];

    if (!apiKey) {
      toast.error('Please enter an API key first');
      return;
    }

    const validation = validateApiKeyFormat(provider.id, apiKey);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setLlmTesting((prev) => ({ ...prev, [provider.id]: true }));

    try {
      const result = await testLLMProvider(provider.id, apiKey);
      setLlmResults((prev) => ({ ...prev, [provider.id]: result }));

      if (result.success) {
        toast.success(`Successfully connected to ${provider.name}`);
      } else {
        toast.error(`Failed to connect to ${provider.name}: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(`Error testing ${provider.name}: ${error.message}`);
    } finally {
      setLlmTesting((prev) => ({ ...prev, [provider.id]: false }));
    }
  };

  const testAllLlmConnections = async () => {
    const providersWithKeys = LLM_PROVIDERS.filter((p) => llmApiKeys[p.id]);

    if (providersWithKeys.length === 0) {
      toast.error('No API keys configured. Please add at least one API key.');
      return;
    }

    toast.info(`Testing ${providersWithKeys.length} LLM provider(s)...`);

    for (const provider of providersWithKeys) {
      await testLlmConnection(provider);
    }

    toast.success('All LLM connection tests completed');
  };

  return (
    <div className="space-y-4">
      {/* Security Notice */}
      <Alert className={`${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
        <AlertCircle className="w-4 h-4 text-blue-500" />
        <AlertDescription className={isDark ? 'text-blue-200' : 'text-blue-800'}>
          <strong>Security:</strong> API keys are stored in memory only for testing. 
          For production, use the Secrets tab to securely store keys in the database.
        </AlertDescription>
      </Alert>

      {/* LLM Providers */}
      <Card className={`${bgCard} border ${borderColor}`}>
        <div className={`p-6 border-b ${borderColor} flex justify-between items-center`}>
          <div>
            <h3 className={`text-lg ${textPrimary} mb-1`}>LLM Providers</h3>
            <p className={`text-sm ${textSecondary}`}>
              Test connections to AI/LLM providers
            </p>
          </div>
          <Button onClick={testAllLlmConnections} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Test All
          </Button>
        </div>
        <div className="p-6 space-y-6">
          {LLM_PROVIDERS.map((provider) => {
            const hasApiKey = !!llmApiKeys[provider.id];
            const result = llmResults[provider.id];
            const isTesting = llmTesting[provider.id];
            const showKey = showApiKeys[provider.id];

            return (
              <div key={provider.id} className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <div>
                    <h4 className={textPrimary}>{provider.name}</h4>
                    <p className={`text-sm ${textSecondary}`}>{provider.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className={`text-sm ${textPrimary}`}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        value={llmApiKeys[provider.id] || ''}
                        onChange={(e) => handleLlmApiKeyChange(provider.id, e.target.value)}
                        placeholder={`Enter your ${provider.name} API key`}
                        className={`h-10 pr-20 ${isDark ? 'bg-[#161616] border-gray-700' : 'bg-white border-gray-300'}`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {hasApiKey && (
                          <>
                            <Button type="button" variant="ghost" size="sm" onClick={() => toggleShowApiKey(provider.id)} className="h-7 w-7 p-0">
                              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => clearApiKey(provider.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => testLlmConnection(provider)} disabled={!hasApiKey || isTesting} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                      {isTesting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Testing...</> : <><Play className="w-4 h-4 mr-2" />Test</>}
                    </Button>
                  </div>
                </div>

                {result && (
                  <div className={`mt-3 p-3 rounded border ${borderColor} ${isDark ? 'bg-[#161616]' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.success ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <span className={`text-sm ${textPrimary}`}>{result.message}</span>
                      </div>
                      {result.latency && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className={`text-sm ${textSecondary}`}>{formatLLMLatency(result.latency)}</span>
                          {(() => {
                            const rating = getLLMPerformanceRating(result.latency);
                            const colors: Record<string, string> = { green: 'text-green-500', blue: 'text-blue-500', yellow: 'text-yellow-500', red: 'text-red-500' };
                            return <Badge className={`${colors[rating.color] || 'text-gray-500'} border-0 bg-transparent`}>{rating.label}</Badge>;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
