/**
 * Guest Stats Component
 * Dashboard metrics cards for customer analytics
 */

'use client';

import { useTheme } from '@/components/layout/ThemeContext';
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import type { CustomerMetrics } from '../types';
import { formatCurrency, formatPercentage } from '../utils/mappers';

interface GuestStatsProps {
  metrics: CustomerMetrics | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616] border-[#1e1e1e]' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`${bgClass} border rounded-lg p-6 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm ${subtextClass}`}>{title}</p>
          <p className={`text-2xl font-semibold mt-1 ${textClass}`}>{value}</p>
          <p className={`text-sm mt-1 ${trendColor}`}>
            {change} from last period
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function GuestStats({ metrics, loading }: GuestStatsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const iconColor = '#4f46e5';

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`${
              isDark ? 'bg-[#161616] border-[#1e1e1e]' : 'bg-white border-gray-200'
            } border rounded-lg p-6 shadow-sm animate-pulse`}
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: '+0%', trend: 'up' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: formatPercentage(change),
      trend: change >= 0 ? 'up' as const : 'down' as const,
    };
  };

  const totalChange = calculateChange(
    metrics.totalCustomers,
    metrics.totalCustomersPrevious
  );
  const activeChange = calculateChange(
    metrics.activeCustomers,
    metrics.activeCustomersPrevious
  );
  const ltvChange = calculateChange(
    metrics.avgLifetimeValue,
    metrics.avgLifetimeValuePrevious
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Guests"
        value={metrics.totalCustomers.toLocaleString()}
        change={totalChange.value}
        trend={totalChange.trend}
        icon={<Users className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Active Guests"
        value={metrics.activeCustomers.toLocaleString()}
        change={activeChange.value}
        trend={activeChange.trend}
        icon={<UserCheck className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Avg. Lifetime Value"
        value={formatCurrency(metrics.avgLifetimeValue)}
        change={ltvChange.value}
        trend={ltvChange.trend}
        icon={<DollarSign className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Growth Rate"
        value={`${metrics.growthRate.toFixed(1)}%`}
        change={`${metrics.newCustomersCurrent} new`}
        trend="up"
        icon={<TrendingUp className="w-6 h-6" style={{ color: iconColor }} />}
      />
    </div>
  );
}
