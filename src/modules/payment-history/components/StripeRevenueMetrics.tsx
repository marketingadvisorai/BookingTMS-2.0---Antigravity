/**
 * Stripe Revenue Metrics Section
 * Displays revenue overview from real Stripe data
 * @module payment-history/components/StripeRevenueMetrics
 */

import { Card } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import type { RevenueSummary } from '../services/stripe-payments.service';

interface StripeRevenueMetricsProps {
  summary: RevenueSummary | null;
  loading?: boolean;
  isDark?: boolean;
}

export function StripeRevenueMetrics({ summary, loading, isDark = false }: StripeRevenueMetricsProps) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200';
  const containerBg = isDark ? 'bg-[#161616] border border-[#1e1e1e]' : 'bg-white border border-gray-200';

  if (loading) {
    return (
      <div className={`${containerBg} rounded-lg shadow-sm p-6`}>
        <h2 className={`mb-4 ${textPrimary}`}>Revenue Overview</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  const metrics = summary || {
    totalRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0,
    transactionCount: 0,
    successRate: 0,
    failedCount: 0,
    currency: 'USD',
  };

  return (
    <div className={`${containerBg} rounded-lg shadow-sm p-6`}>
      <h2 className={`mb-4 ${textPrimary}`}>Revenue Overview (Last 30 Days)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Total Revenue</span>
            <DollarSign className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>
            ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs ${textSecondary}`}>
              From Stripe
            </span>
          </div>
        </Card>

        {/* Total Refunds */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Total Refunds</span>
            <RotateCcw className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>
            ${metrics.totalRefunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>
              {metrics.failedCount} failed
            </span>
          </div>
        </Card>

        {/* Net Revenue */}
        <Card className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Net Revenue</span>
            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className={`text-2xl ${textPrimary}`}>
            ${metrics.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
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
            <span className={`text-xs ${textSecondary}`}>
              {metrics.transactionCount} transactions
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default StripeRevenueMetrics;
