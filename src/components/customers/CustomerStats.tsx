'use client';

import { useTheme } from '../layout/ThemeContext';
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

  const iconColor = isDark ? '#4f46e5' : '#4f46e5';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Customers"
        value="2,847"
        change="+12.5%"
        trend="up"
        icon={<Users className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Active Customers"
        value="1,243"
        change="+8.2%"
        trend="up"
        icon={<UserCheck className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Avg. Lifetime Value"
        value="$487"
        change="+15.3%"
        trend="up"
        icon={<DollarSign className="w-6 h-6" style={{ color: iconColor }} />}
      />
      <StatCard
        title="Growth Rate"
        value="23.4%"
        change="+5.1%"
        trend="up"
        icon={<TrendingUp className="w-6 h-6" style={{ color: iconColor }} />}
      />
    </div>
  );
}
