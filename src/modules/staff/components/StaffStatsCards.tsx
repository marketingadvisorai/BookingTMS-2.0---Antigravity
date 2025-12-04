/**
 * Staff Stats Cards Component
 * Displays staff statistics in a card grid
 * @module staff/components/StaffStatsCards
 */

import { Users, UserCheck, Shield, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StaffStats } from '../types';

interface StaffStatsCardsProps {
  stats: StaffStats;
  isDark: boolean;
}

export function StaffStatsCards({ stats, isDark }: StaffStatsCardsProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverShadowClass = isDark
    ? 'hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]'
    : 'hover:shadow-md';

  const cards = [
    {
      label: 'Total Staff',
      value: stats.total,
      icon: Users,
      iconBg: isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100',
      iconColor: isDark ? 'text-[#6366f1]' : 'text-blue-600',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: UserCheck,
      iconBg: isDark ? 'bg-emerald-500/20' : 'bg-green-100',
      iconColor: isDark ? 'text-emerald-400' : 'text-green-600',
    },
    {
      label: 'Managers',
      value: stats.byRole?.manager || 0,
      icon: Shield,
      iconBg: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
      iconColor: isDark ? 'text-purple-400' : 'text-purple-600',
    },
    {
      label: 'Staff Members',
      value: stats.byRole?.staff || 0,
      icon: User,
      iconBg: isDark ? 'bg-orange-500/20' : 'bg-orange-100',
      iconColor: isDark ? 'text-orange-400' : 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>{card.label}</p>
                <p className={`text-2xl mt-1 ${textClass}`}>{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
              >
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
