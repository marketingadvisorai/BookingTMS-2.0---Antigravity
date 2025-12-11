/**
 * AgentStatsCards
 * Overview stats for AI agents dashboard
 */

import React from 'react';
import { MessageSquare, TrendingUp, Clock, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AIAgent } from '../types';

interface AgentStatsCardsProps {
  agents: AIAgent[];
  isDark: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  icon: React.ReactNode;
  iconBgClass: string;
  isDark: boolean;
}

function StatCard({ label, value, change, changePositive, icon, iconBgClass, isDark }: StatCardProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm ${textMutedClass}`}>{label}</p>
            <p className={`text-2xl mt-1 ${textClass}`}>{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${changePositive ? (isDark ? 'text-emerald-400' : 'text-green-600') : textMutedClass}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentStatsCards({ agents, isDark }: AgentStatsCardsProps) {
  const totalConversations = agents.reduce((sum, a) => sum + (a.stats?.totalConversations || 0), 0);
  const totalMessages = agents.reduce((sum, a) => sum + (a.stats?.totalMessages || 0), 0);
  const avgResponseTime = agents.length > 0
    ? (agents.reduce((sum, a) => sum + (a.stats?.avgResponseTimeMs || 0), 0) / agents.length / 1000).toFixed(1)
    : '0';
  const activeAgents = agents.filter((a) => a.status === 'active').length;
  
  const avgSuccessRate = agents.length > 0
    ? Math.round(agents.reduce((sum, a) => sum + (a.stats?.successfulBookings || 0), 0) / Math.max(totalConversations, 1) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Conversations"
        value={totalConversations.toLocaleString()}
        change="↑ 23% from last month"
        changePositive
        icon={<MessageSquare className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />}
        iconBgClass={isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}
        isDark={isDark}
      />
      <StatCard
        label="Success Rate"
        value={`${avgSuccessRate}%`}
        change="↑ 5% improvement"
        changePositive
        icon={<TrendingUp className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />}
        iconBgClass={isDark ? 'bg-emerald-500/20' : 'bg-green-100'}
        isDark={isDark}
      />
      <StatCard
        label="Avg Response Time"
        value={`${avgResponseTime}s`}
        change="↓ 0.3s faster"
        changePositive
        icon={<Clock className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />}
        iconBgClass={isDark ? 'bg-purple-500/20' : 'bg-purple-100'}
        isDark={isDark}
      />
      <StatCard
        label="Active Agents"
        value={`${activeAgents}/${agents.length}`}
        change={activeAgents < agents.length ? `${agents.length - activeAgents} inactive` : 'All active'}
        icon={<Bot className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />}
        iconBgClass={isDark ? 'bg-orange-500/20' : 'bg-orange-100'}
        isDark={isDark}
      />
    </div>
  );
}
