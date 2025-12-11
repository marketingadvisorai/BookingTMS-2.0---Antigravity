/**
 * VoiceAgentConfig
 * ElevenLabs voice configuration panel for system admins
 */

import React, { useState } from 'react';
import { Volume2, Key, Play, RefreshCw, Check, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import type { ElevenLabsVoice } from '../types';

interface VoiceAgentConfigProps {
  organizationId: string;
  isDark: boolean;
  apiKey?: string;
  selectedVoice?: string;
  onApiKeyChange: (key: string) => void;
  onVoiceChange: (voiceId: string) => void;
  onSave: () => void;
}

const ELEVENLABS_MODELS = [
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5 (Fastest)', description: 'Low latency, great for real-time' },
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: '29 languages supported' },
  { id: 'eleven_monolingual_v1', name: 'English v1', description: 'English only, high quality' },
];

export function VoiceAgentConfig({
  organizationId,
  isDark,
  apiKey = '',
  selectedVoice = '',
  onApiKeyChange,
  onVoiceChange,
  onSave,
}: VoiceAgentConfigProps) {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState('eleven_turbo_v2_5');
  const [previewLoading, setPreviewLoading] = useState(false);

  const { voices, loadingVoices, fetchVoices, previewVoice } = useVoiceAgent({
    organizationId,
    autoFetch: false,
  });

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const handleFetchVoices = async () => {
    if (localApiKey) {
      await fetchVoices(localApiKey);
    }
  };

  const handlePreviewVoice = async (voiceId: string) => {
    if (!localApiKey) return;
    setPreviewLoading(true);
    try {
      await previewVoice(voiceId, localApiKey);
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveConfig = () => {
    onApiKeyChange(localApiKey);
    onSave();
  };

  return (
    <Card className={`${cardBgClass} border ${borderClass}`}>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <Volume2 className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <CardTitle className={textClass}>ElevenLabs Voice</CardTitle>
            <CardDescription className={textMutedClass}>
              Configure voice synthesis for AI agents
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <Label className={textClass}>API Key</Label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Enter ElevenLabs API key"
              className={`flex-1 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}`}
            />
            <Button variant="outline" onClick={handleFetchVoices} disabled={!localApiKey || loadingVoices}>
              {loadingVoices ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            </Button>
          </div>
          <p className={`text-xs ${textMutedClass}`}>
            Get your API key at <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">elevenlabs.io</a>
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label className={textClass}>Voice Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className={isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ELEVENLABS_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div>
                    <span>{model.name}</span>
                    <span className={`text-xs ml-2 ${textMutedClass}`}>{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        {voices.length > 0 && (
          <div className="space-y-2">
            <Label className={textClass}>Voice</Label>
            <div className={`max-h-48 overflow-y-auto rounded-lg border ${borderClass}`}>
              {voices.map((voice) => (
                <div
                  key={voice.voiceId}
                  className={`flex items-center justify-between p-3 border-b last:border-b-0 ${borderClass} ${
                    selectedVoice === voice.voiceId ? (isDark ? 'bg-purple-500/10' : 'bg-purple-50') : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={selectedVoice === voice.voiceId}
                      onChange={() => onVoiceChange(voice.voiceId)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className={`text-sm ${textClass}`}>{voice.name}</p>
                      <p className={`text-xs ${textMutedClass}`}>{voice.category}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewVoice(voice.voiceId)}
                    disabled={previewLoading}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={handleSaveConfig} className="w-full" disabled={!localApiKey}>
          <Check className="w-4 h-4 mr-2" />
          Save Voice Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
