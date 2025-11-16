/**
 * Metric Card Component
 * 
 * Displays a single KPI metric with icon, value, and trend
 * Matches existing KPICard design patterns
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercentage } from '../../utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  format = 'number',
  loading = false,
  iconColor = 'bg-blue-600',
}) => {
  // Format value based on type
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  const isPositive = change !== undefined && change >= 0;

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-[#2a2a2a] animate-pulse">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-32 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-28" />
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 dark:bg-[#2a2a2a] rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] transition-all hover:-translate-y-0.5">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5]/0 via-transparent to-purple-500/0 dark:from-[#4f46e5]/5 dark:via-transparent dark:to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-[#737373] mb-2 truncate uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-3 truncate">
              {formatValue(value)}
            </p>
            
            {change !== undefined && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                )}
                <span className={`text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-[#737373]">vs last month</span>
              </div>
            )}
          </div>
          
          <div className={`${iconColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
