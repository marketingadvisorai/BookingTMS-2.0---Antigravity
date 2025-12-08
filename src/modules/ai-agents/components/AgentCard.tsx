/**
 * AgentCard Component
 * Displays an AI agent with status, stats, and actions
 */

import React from 'react';
import {
  Bot,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  Brain,
  TrendingUp,
  Clock,
  Users,
  Play,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/layout/ThemeContext';
import type { AIAgent } from '../types';

interface AgentCardProps {
  agent: AIAgent;
  onPreview: (agent: AIAgent) => void;
  onConfigure?: (agent: AIAgent) => void;
  onToggleStatus?: (agent: AIAgent) => void;
  showSystemControls?: boolean; // Only for system admins
}

export function AgentCard({
  agent,
  onPreview,
  onConfigure,
  onToggleStatus,
  showSystemControls = false,
}: AgentCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const getAgentIcon = () => {
    switch (agent.agentType) {
      case 'voice':
        return Phone;
      case 'hybrid':
        return Bot;
      default:
        return MessageSquare;
    }
  };

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'active':
        return (
          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'training':
        return (
          <Badge className={isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}>
            <Brain className="w-3 h-3 mr-1" />
            Training
          </Badge>
        );
      case 'error':
        return (
          <Badge className={isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}>
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const Icon = getAgentIcon();

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isDark
                ? agent.agentType === 'voice'
                  ? 'bg-purple-500/20'
                  : 'bg-[#4f46e5]/20'
                : agent.agentType === 'voice'
                ? 'bg-purple-100'
                : 'bg-blue-100'
            }`}
          >
            <Icon
              className={`w-7 h-7 ${
                isDark
                  ? agent.agentType === 'voice'
                    ? 'text-purple-400'
                    : 'text-[#6366f1]'
                  : agent.agentType === 'voice'
                  ? 'text-purple-600'
                  : 'text-blue-600'
              }`}
            />
          </div>
          {getStatusBadge()}
        </div>
        <CardTitle className={textClass}>{agent.name}</CardTitle>
        <CardDescription className={`${textMutedClass} line-clamp-2`}>
          {agent.description || `${agent.agentType} agent for customer interactions`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-6 pt-0">
        {/* Stats */}
        <div className={`grid grid-cols-3 gap-3 p-4 rounded-lg ${bgElevatedClass}`}>
          <div className="text-center">
            <p className={`text-lg font-semibold ${textClass}`}>
              {formatNumber(agent.stats?.totalConversations || 0)}
            </p>
            <p className={`text-xs ${textMutedClass}`}>Conversations</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-semibold ${textClass}`}>
              {agent.stats?.satisfactionScore?.toFixed(1) || '0.0'}
            </p>
            <p className={`text-xs ${textMutedClass}`}>Rating</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-semibold ${textClass}`}>
              {agent.stats?.avgResponseTimeMs
                ? `${(agent.stats.avgResponseTimeMs / 1000).toFixed(1)}s`
                : '--'}
            </p>
            <p className={`text-xs ${textMutedClass}`}>Response</p>
          </div>
        </div>

        {/* System Admin Controls */}
        {showSystemControls && onToggleStatus && (
          <div className={`flex items-center justify-between p-3 border rounded-lg ${borderClass}`}>
            <div className="flex items-center gap-2">
              <Switch
                checked={agent.status === 'active'}
                onCheckedChange={() => onToggleStatus(agent)}
              />
              <span className={`text-sm ${textClass}`}>
                {agent.status === 'active' ? 'Agent Active' : 'Agent Inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => onPreview(agent)}
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {showSystemControls && onConfigure && (
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => onConfigure(agent)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
