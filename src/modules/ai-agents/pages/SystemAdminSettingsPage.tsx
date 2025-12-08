/**
 * SystemAdminSettingsPage
 * System Admin only - configure AI providers, API keys, models
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Key,
  Check,
  X,
  RefreshCw,
  Bot,
  Cpu,
  DollarSign,
  Activity,
  Volume2,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAISettings } from '../hooks';
import type { AIAgentSettings, AIProvider } from '../types';

export function SystemAdminSettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const { settings, usageStats, loading, error, refresh, updateSettings, saveApiKey } =
    useAISettings();

  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveApiKey = async (provider: AIProvider) => {
    if (!apiKeyInput.trim()) return;
    setSaving(true);
    try {
      await saveApiKey(provider, apiKeyInput);
      setApiKeyInput('');
      setEditingProvider(null);
    } catch (err) {
      console.error('Failed to save API key:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProvider = async (settings: AIAgentSettings) => {
    await updateSettings(settings.provider, { isEnabled: !settings.isEnabled });
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return <Bot className="w-5 h-5" />;
      case 'deepseek':
        return <Cpu className="w-5 h-5" />;
      case 'elevenlabs':
        return <Volume2 className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return isDark ? 'text-emerald-400' : 'text-emerald-600';
      case 'deepseek':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'elevenlabs':
        return isDark ? 'text-purple-400' : 'text-purple-600';
      default:
        return textClass;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4f46e5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className={textMutedClass}>{error}</p>
        <Button onClick={refresh}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>AI System Settings</h1>
          <p className={textMutedClass}>
            Configure AI providers, models, and API keys
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={refresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Conversations</p>
                  <p className={`text-xl font-bold ${textClass}`}>
                    {usageStats.totalConversations.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Volume2 className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Voice Calls</p>
                  <p className={`text-xl font-bold ${textClass}`}>
                    {usageStats.totalCalls.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Cpu className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Tokens Used</p>
                  <p className={`text-xl font-bold ${textClass}`}>
                    {(usageStats.totalTokensUsed / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Est. Cost</p>
                  <p className={`text-xl font-bold ${textClass}`}>
                    ${usageStats.estimatedCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Settings */}
      <Tabs defaultValue="providers">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4 mt-4">
          {settings.map((provider) => (
            <Card
              key={provider.id}
              className={`${cardBgClass} border ${borderClass}`}
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'
                      }`}
                    >
                      <span className={getProviderColor(provider.provider)}>
                        {getProviderIcon(provider.provider)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${textClass}`}>
                        {provider.providerName}
                      </CardTitle>
                      <CardDescription className={textMutedClass}>
                        {provider.models.length} models available
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={provider.isEnabled ? 'default' : 'secondary'}
                      className={
                        provider.isEnabled
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-green-100 text-green-700'
                          : ''
                      }
                    >
                      {provider.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={() => handleToggleProvider(provider)}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                {/* API Key */}
                <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className={`w-4 h-4 ${textMutedClass}`} />
                      <span className={`text-sm ${textClass}`}>API Key</span>
                    </div>
                    {provider.apiKeyHint ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={isDark ? 'border-emerald-500/30 text-emerald-400' : ''}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Configured ({provider.apiKeyHint})
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProvider(provider.provider)}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProvider(provider.provider)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Key
                      </Button>
                    )}
                  </div>

                  {editingProvider === provider.provider && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-3"
                    >
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder={`Enter ${provider.providerName} API key`}
                            className={isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMutedClass}`}
                          >
                            {showApiKey ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          onClick={() => handleSaveApiKey(provider.provider)}
                          disabled={!apiKeyInput.trim() || saving}
                        >
                          {saving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingProvider(null);
                            setApiKeyInput('');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className={`text-xs ${textMutedClass}`}>
                        API keys are encrypted and stored securely. Only the last 4 characters are shown.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Models */}
                <div>
                  <Label className={`text-sm ${textMutedClass}`}>Default Model</Label>
                  <Select
                    value={provider.defaultModel}
                    onValueChange={(value) =>
                      updateSettings(provider.provider, { defaultModel: value })
                    }
                  >
                    <SelectTrigger className={`mt-1 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Info */}
                <div className={`text-xs ${textMutedClass}`}>
                  Cost: ${provider.costPer1kTokens.toFixed(4)} per 1K tokens
                  {provider.monthlyBudgetLimit && (
                    <> • Budget: ${provider.monthlyBudgetLimit.toFixed(2)}/month</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="models" className="space-y-4 mt-4">
          {settings.map((provider) => (
            <Card key={provider.id} className={`${cardBgClass} border ${borderClass}`}>
              <CardHeader className="p-4">
                <CardTitle className={`text-base ${textClass}`}>
                  {provider.providerName} Models
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {provider.models.map((model) => (
                    <div
                      key={model.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}
                    >
                      <div>
                        <p className={`text-sm font-medium ${textClass}`}>{model.name}</p>
                        <p className={`text-xs ${textMutedClass}`}>
                          {model.type} • {model.contextWindow?.toLocaleString()} tokens
                        </p>
                      </div>
                      {model.default && (
                        <Badge className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : ''}>
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
