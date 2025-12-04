/**
 * Waiver Stats Cards
 * Displays overview statistics for waivers and templates
 * @module waivers/components/WaiverStatsCards
 */

import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { WaiverStats, TemplateStats } from '../types';

interface WaiverStatsCardsProps {
  waiverStats: WaiverStats;
  templateStats: TemplateStats;
  isDark: boolean;
}

export function WaiverStatsCards({ waiverStats, templateStats, isDark }: WaiverStatsCardsProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const stats = [
    {
      title: 'Total Waivers',
      value: waiverStats.total,
      subtitle: `${waiverStats.thisMonth} this month`,
      icon: FileText,
      iconBg: isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100',
      iconColor: isDark ? 'text-[#6366f1]' : 'text-blue-600',
    },
    {
      title: 'Signed',
      value: waiverStats.signed,
      subtitle: `${waiverStats.signedThisWeek} this week`,
      icon: CheckSquare,
      iconBg: isDark ? 'bg-emerald-500/20' : 'bg-green-100',
      iconColor: isDark ? 'text-emerald-400' : 'text-green-600',
    },
    {
      title: 'Pending',
      value: waiverStats.pending,
      subtitle: 'Awaiting signature',
      icon: Clock,
      iconBg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
      iconColor: isDark ? 'text-yellow-400' : 'text-yellow-600',
    },
    {
      title: 'Templates',
      value: templateStats.total,
      subtitle: `${templateStats.active} active`,
      icon: AlertCircle,
      iconBg: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
      iconColor: isDark ? 'text-purple-400' : 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={`${cardBgClass} border ${borderClass}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${textClass}`}>{stat.value}</p>
                <p className={`text-sm ${textMutedClass}`}>{stat.title}</p>
                <p className={`text-xs ${textMutedClass}`}>{stat.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
