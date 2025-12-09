/**
 * Error Stats Card Component
 * @module components/backend/error-monitoring/StatsCard
 */

'use client';

import { Card } from '@/components/ui/card';

type StatsColor = 'blue' | 'red' | 'orange' | 'green' | 'purple';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: StatsColor;
  isDark: boolean;
  highlight?: boolean;
}

export function StatsCard({ label, value, icon, color, isDark, highlight }: StatsCardProps) {
  const colors: Record<StatsColor, string> = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    red: isDark ? 'text-red-400' : 'text-red-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
    green: isDark ? 'text-green-400' : 'text-green-600',
    purple: isDark ? 'text-purple-400' : 'text-purple-600',
  };

  return (
    <Card
      className={`p-4 ${isDark ? 'bg-[#161616] border-gray-800' : 'bg-white border-gray-200'} ${
        highlight ? 'ring-2 ring-purple-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={colors[color]}>{icon}</div>
      </div>
    </Card>
  );
}
