/**
 * AgentTypeSelector
 * Step 1 of Create Agent Wizard - Select agent type
 */

import React from 'react';
import { MessageSquare, Calendar, Phone, Check, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AIAgentCategory, AIAgentTier } from '../../types';

interface AgentTypeOption {
  id: AIAgentCategory;
  name: string;
  description: string;
  tier: AIAgentTier;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
}

interface AgentTypeSelectorProps {
  selected: AIAgentCategory | null;
  onSelect: (type: AIAgentCategory) => void;
  isDark: boolean;
}

const AGENT_TYPES: AgentTypeOption[] = [
  {
    id: 'basic_chat',
    name: 'Basic Chat Agent',
    description: 'Answer FAQs and general queries. Perfect for customer support.',
    tier: 'free',
    icon: <MessageSquare className="w-8 h-8" />,
    features: [
      'Answer general questions',
      'Provide business info',
      'Collect customer leads',
      '24/7 availability',
    ],
  },
  {
    id: 'booking_agent',
    name: 'Booking Agent',
    description: 'Full booking capabilities with availability checking and checkout.',
    tier: 'pro',
    icon: <Calendar className="w-8 h-8" />,
    features: [
      'All Basic features',
      'Check real-time availability',
      'Create bookings',
      'Generate checkout links',
      'Activity planning help',
    ],
    recommended: true,
  },
  {
    id: 'voice_agent',
    name: 'Voice Agent',
    description: 'Handle phone calls for bookings, reminders, and customer service.',
    tier: 'enterprise',
    icon: <Phone className="w-8 h-8" />,
    features: [
      'All Booking features',
      'Inbound call handling',
      'Outbound booking reminders',
      'Process refunds via call',
      'Reschedule/cancel bookings',
    ],
  },
];

const getTierBadge = (tier: AIAgentTier, isDark: boolean) => {
  const styles = {
    free: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700',
    pro: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
    enterprise: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700',
  };
  return <Badge className={`${styles[tier]} border-0 uppercase text-xs`}>{tier}</Badge>;
};

export function AgentTypeSelector({ selected, onSelect, isDark }: AgentTypeSelectorProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className={`text-xl font-semibold ${textClass}`}>Choose Agent Type</h2>
        <p className={`text-sm mt-1 ${textMutedClass}`}>
          Select the type of AI agent that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENT_TYPES.map((type) => {
          const isSelected = selected === type.id;
          const IconComponent = type.icon;

          return (
            <Card
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`cursor-pointer transition-all relative ${cardBgClass} border-2 ${
                isSelected
                  ? isDark ? 'border-[#4f46e5] shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'border-blue-500 shadow-lg'
                  : `${borderClass} hover:border-gray-400`
              }`}
            >
              {type.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={`${isDark ? 'bg-[#4f46e5]' : 'bg-blue-600'} text-white border-0`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardContent className="p-6 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    isSelected
                      ? isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'
                      : isDark ? 'bg-[#1e1e1e] text-[#a3a3a3]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {IconComponent}
                  </div>
                  {isSelected && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-[#4f46e5]' : 'bg-blue-600'
                    }`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-semibold ${textClass}`}>{type.name}</h3>
                  {getTierBadge(type.tier, isDark)}
                </div>

                <p className={`text-sm mb-4 ${textMutedClass}`}>{type.description}</p>

                <ul className="space-y-2">
                  {type.features.map((feature, i) => (
                    <li key={i} className={`text-sm flex items-center gap-2 ${textMutedClass}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${
                        isDark ? 'text-emerald-400' : 'text-green-600'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
