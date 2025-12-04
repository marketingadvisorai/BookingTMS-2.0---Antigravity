/**
 * Revenue Metrics Section
 * Displays revenue overview cards
 * @module payment-history/components/RevenueMetricsSection
 */

import { Card } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { RevenueMetrics } from '../types';

interface RevenueMetricsSectionProps {
  metrics: RevenueMetrics;
  isLoading?: boolean;
}

export function RevenueMetricsSection({ metrics, isLoading = false }: RevenueMetricsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200';
  const containerBg = isDark ? 'bg-[#161616] border border-[#1e1e1e]' : 'bg-white border border-gray-200';

  if (isLoading) {
    return (
      <div className={`${containerBg} rounded-lg shadow-sm p-6`}>
        <h2 className={`mb-4 ${textPrimary}`}>Revenue Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className={`${cardBg} p-4 animate-pulse`}>
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerBg} rounded-lg shadow-sm p-6`}>
      <h2 className={`mb-4 ${textPrimary}`}>Revenue Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Total Revenue</span>
            <DollarSign className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>${metrics.totalRevenue.toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500">+12.5% from last period</span>
          </div>
        </Card>

        {/* Total Refunds */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Total Refunds</span>
            <RotateCcw className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>${metrics.totalRefunds.toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-500">-3.2% from last period</span>
          </div>
        </Card>

        {/* Net Revenue */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Net Revenue</span>
            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>${metrics.netRevenue.toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs ${textSecondary}`}>After refunds</span>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Success Rate</span>
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>{metrics.successRate}%</div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs ${textSecondary}`}>{metrics.transactionCount} transactions</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RevenueMetricsSection;
