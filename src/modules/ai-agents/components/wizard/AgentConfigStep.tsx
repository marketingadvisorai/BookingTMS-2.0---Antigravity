/**
 * AgentConfigStep
 * Step 2 of Create Agent Wizard - Configure agent basics
 */

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AIAgentCategory } from '../../types';

interface AgentConfigData {
  name: string;
  description: string;
  personality: 'friendly' | 'professional' | 'casual';
  welcomeMessage: string;
  systemPrompt: string;
}

interface AgentConfigStepProps {
  agentType: AIAgentCategory;
  config: AgentConfigData;
  onChange: (config: AgentConfigData) => void;
  isDark: boolean;
}

const PERSONALITY_OPTIONS = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' },
  { value: 'professional', label: 'Professional', description: 'Formal business tone' },
  { value: 'casual', label: 'Casual', description: 'Relaxed conversational tone' },
];

const DEFAULT_PROMPTS: Record<AIAgentCategory, string> = {
  basic_chat: `You are a helpful customer service assistant for an escape room business. Answer questions about:
- Business hours and location
- Available games and experiences
- Pricing and group sizes
- Policies (cancellation, age requirements, etc.)

Be friendly and helpful. If asked about booking, explain that customers can book through the website.`,
  booking_agent: `You are an intelligent booking assistant for an escape room venue. You can:
- Answer all customer questions
- Check real-time availability for activities
- Help customers choose the right experience
- Create bookings and provide checkout links
- Suggest activities based on group size and preferences

Use the available tools to check availability and create bookings. Always confirm details before booking.`,
  voice_agent: `You are a professional voice assistant for an escape room business. During phone calls you can:
- Answer questions about games and availability
- Help customers book experiences
- Send booking confirmations
- Handle rescheduling and cancellation requests
- Process refund requests when appropriate

Speak clearly and confirm important details. Ask for spelling of names and email addresses.`,
};

export function AgentConfigStep({ agentType, config, onChange, isDark }: AgentConfigStepProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const inputClass = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : '';

  const handleChange = (field: keyof AgentConfigData, value: string) => {
    onChange({ ...config, [field]: value });
  };

  React.useEffect(() => {
    if (!config.systemPrompt) {
      handleChange('systemPrompt', DEFAULT_PROMPTS[agentType]);
    }
  }, [agentType]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className={`text-xl font-semibold ${textClass}`}>Configure Your Agent</h2>
        <p className={`text-sm mt-1 ${textMutedClass}`}>
          Set up the basic settings for your AI agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={textClass}>Agent Name *</Label>
            <Input
              value={config.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Booking Assistant"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={textClass}>Description</Label>
            <Input
              value={config.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of what this agent does"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={textClass}>Personality</Label>
            <Select
              value={config.personality}
              onValueChange={(v) => handleChange('personality', v)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <span className={`ml-2 text-xs ${textMutedClass}`}>{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={textClass}>Welcome Message</Label>
            <Textarea
              value={config.welcomeMessage}
              onChange={(e) => handleChange('welcomeMessage', e.target.value)}
              placeholder="Hi! How can I help you today?"
              className={`${inputClass} min-h-[80px]`}
            />
            <p className={`text-xs ${textMutedClass}`}>
              First message shown when a customer starts a chat
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className={textClass}>System Prompt</Label>
            <button
              type="button"
              onClick={() => handleChange('systemPrompt', DEFAULT_PROMPTS[agentType])}
              className={`text-xs flex items-center gap-1 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'} hover:underline`}
            >
              <Sparkles className="w-3 h-3" />
              Reset to default
            </button>
          </div>
          <Textarea
            value={config.systemPrompt}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            placeholder="Instructions for how the AI should behave..."
            className={`${inputClass} min-h-[280px] font-mono text-sm`}
          />
          <p className={`text-xs ${textMutedClass}`}>
            This prompt defines the agent's behavior and capabilities. Advanced users can customize this.
          </p>
        </div>
      </div>
    </div>
  );
}
