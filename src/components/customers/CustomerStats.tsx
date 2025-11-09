'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { useCustomers } from '../../hooks/useCustomers';
import { Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

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

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <div className={`${bgClass} ${borderClass} border rounded-lg p-6 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${subtextClass}`}>{title}</p>
          <p className={`text-3xl mt-2 ${textClass}`}>{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-sm ${trend === 'up' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {change}
            </span>
            <span className={`text-sm ${subtextClass}`}>vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function CustomerStats() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { customers, getCustomerMetrics } = useCustomers();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  const iconColor = isDark ? '#4f46e5' : '#4f46e5';

  useEffect(() => {
    fetchMetrics();
  }, [customers]);

  const fetchMetrics = async () => {
    // Fetch metrics (no org_id needed - single tenant)
    const data = await getCustomerMetrics();
    setMetrics(data);
    setLoading(false);
  };

  const calculateChange = (current: number, previous: number): { value: string; trend: 'up' | 'down' } => {
    if (previous === 0) return { value: '+0%', trend: 'up' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      trend: change >= 0 ? 'up' : 'down'
    };
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const formatCurrency = (num: number): string => {
    return `$${Math.round(num).toLocaleString('en-US')}`;
  };

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${isDark ? 'bg-[#161616] border-[#1e1e1e]' : 'bg-white border-gray-200'} border rounded-lg p-6 shadow-sm animate-pulse`}>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalChange = calculateChange(metrics.total_customers, metrics.total_customers_previous);
  const activeChange = calculateChange(metrics.active_customers, metrics.active_customers_previous);
  const avgLtvChange = calculateChange(metrics.avg_lifetime_value, metrics.avg_lifetime_value_previous);
  
  const growthRate = metrics.total_customers_for_growth > 0
    ? (metrics.new_customers_current / metrics.total_customers_for_growth) * 100
    : 0;
  const previousGrowthRate = metrics.total_customers_previous > 0
    ? ((metrics.total_customers_for_growth - metrics.total_customers_previous) / metrics.total_customers_previous) * 100
    : 0;
  const growthChange = calculateChange(growthRate, previousGrowthRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Customers"
        value={formatNumber(metrics.total_customers)}
        change={totalChange.value}
        trend={totalChange.trend}
        icon={<Users className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Active Customers"
        value={formatNumber(metrics.active_customers)}
        change={activeChange.value}
        trend={activeChange.trend}
        icon={<UserCheck className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Avg. Lifetime Value"
        value={formatCurrency(metrics.avg_lifetime_value)}
        change={avgLtvChange.value}
        trend={avgLtvChange.trend}
        icon={<DollarSign className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Growth Rate"
        value={`${growthRate.toFixed(1)}%`}
        change={growthChange.value}
        trend={growthChange.trend}
        icon={<TrendingUp className="w-6 h-6" style={{ color: iconColor }} />}
      />
    </div>
  );
}
