/**
 * Dashboard Metrics Component
 * 
 * Displays platform-wide metrics in a responsive grid
 * Uses existing design patterns from KPICard
 */

import React from 'react';
import { Building2, DollarSign, Users, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { usePlatformMetrics } from '../../hooks';

export const DashboardMetrics: React.FC = () => {
  const { metrics, isLoading } = usePlatformMetrics();

  const metricsConfig = [
    {
      title: 'Total Organizations',
      value: metrics?.total_organizations || 0,
      icon: Building2,
      change: metrics?.growth_rate || 0,
      format: 'number' as const,
      iconColor: 'bg-blue-600',
    },
    {
      title: 'Monthly Revenue',
      value: metrics?.mrr || 0,
      icon: DollarSign,
      change: 5.2, // TODO: Calculate from historical data
      format: 'currency' as const,
      iconColor: 'bg-emerald-600',
    },
    {
      title: 'Total Users',
      value: metrics?.total_users || 0,
      icon: Users,
      change: 12.5, // TODO: Calculate from historical data
      format: 'number' as const,
      iconColor: 'bg-purple-600',
    },
    {
      title: 'Growth Rate',
      value: metrics?.growth_rate || 0,
      icon: TrendingUp,
      change: metrics?.growth_rate || 0,
      format: 'percentage' as const,
      iconColor: 'bg-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metricsConfig.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          change={metric.change}
          format={metric.format}
          iconColor={metric.iconColor}
          loading={isLoading}
        />
      ))}
    </div>
  );
};
