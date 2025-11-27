/**
 * Embed Pro 2.0 - Analytics Dashboard Component
 * @module embed-pro/components/AnalyticsDashboard
 * 
 * Comprehensive analytics dashboard with charts, funnel analysis,
 * and date range filtering.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Calendar,
  Filter,
  RefreshCw,
  ArrowDown,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { analyticsService, StepFunnelStats, FunnelAnalysis } from '../services/analytics.service';
import type { EmbedConfigWithRelations, EmbedAnalyticsSummary } from '../types';

// =====================================================
// PROPS
// =====================================================

interface AnalyticsDashboardProps {
  config: EmbedConfigWithRelations;
  onClose?: () => void;
}

// =====================================================
// DATE RANGE OPTIONS
// =====================================================

type DateRangeOption = '7d' | '30d' | '90d' | 'all';

const DATE_RANGES: { value: DateRangeOption; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

// =====================================================
// HELPERS
// =====================================================

const getDateRange = (range: DateRangeOption): { start?: string; end?: string } => {
  if (range === 'all') return {};
  
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
  }
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

// =====================================================
// COMPONENT
// =====================================================

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  config,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EmbedAnalyticsSummary | null>(null);
  const [funnel, setFunnel] = useState<FunnelAnalysis | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(dateRange);
      
      const [summaryData, funnelData] = await Promise.all([
        analyticsService.getSummary(config.id, start, end),
        analyticsService.getFunnelAnalysis(config.id, start, end),
      ]);
      
      setSummary(summaryData);
      setFunnel(funnelData);
    } catch (error) {
      console.error('[AnalyticsDashboard] Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [config.id, dateRange]);

  // Calculate conversion rate
  const conversionRate = config.view_count > 0
    ? ((config.booking_count / config.view_count) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Analytics Overview
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {DATE_RANGES.find(r => r.value === dateRange)?.label}
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            {showDatePicker && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value);
                      setShowDatePicker(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      dateRange === range.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : ''
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Views"
          value={config.view_count}
          color="blue"
          trend={summary?.events_by_day && summary.events_by_day.length > 1 
            ? calculateTrend(summary.events_by_day.map(d => d.views)) 
            : null}
        />
        <StatCard
          icon={<MousePointerClick className="w-5 h-5" />}
          label="Bookings"
          value={config.booking_count}
          color="green"
          trend={summary?.events_by_day && summary.events_by_day.length > 1 
            ? calculateTrend(summary.events_by_day.map(d => d.bookings)) 
            : null}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          color="purple"
          isPercentage
        />
      </div>

      {/* Funnel Analysis */}
      {funnel && funnel.steps.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Conversion Funnel
          </h4>
          
          <div className="space-y-3">
            {funnel.steps.map((step, index) => (
              <FunnelStep
                key={step.step}
                step={step}
                isFirst={index === 0}
                isLast={index === funnel.steps.length - 1}
                primaryColor={config.style?.primaryColor || '#2563eb'}
              />
            ))}
          </div>

          {funnel.biggestDropOff && funnel.biggestDropOff.rate > 20 && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-start gap-2">
              <TrendingDown className="w-4 h-4 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-orange-700 dark:text-orange-400">
                  Biggest drop-off:
                </span>{' '}
                <span className="text-orange-600 dark:text-orange-300">
                  {funnel.biggestDropOff.rate}% at "{funnel.biggestDropOff.step}"
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Chart (Simplified bar representation) */}
      {summary?.events_by_day && summary.events_by_day.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Daily Activity
          </h4>
          <DailyChart data={summary.events_by_day.slice(-14)} primaryColor={config.style?.primaryColor || '#2563eb'} />
        </div>
      )}

      {/* Embed Details */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium capitalize">{config.type.replace('-', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className={`ml-2 font-medium ${config.is_active ? 'text-green-600' : 'text-gray-500'}`}>
              {config.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Target:</span>
            <span className="ml-2 font-medium capitalize">{config.target_type}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 font-medium">
              {new Date(config.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: number | null;
  isPercentage?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, trend, isPercentage }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-500',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend !== null && trend !== undefined && (
          <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

interface FunnelStepProps {
  step: StepFunnelStats;
  isFirst: boolean;
  isLast: boolean;
  primaryColor: string;
}

const FunnelStep: React.FC<FunnelStepProps> = ({ step, isFirst, isLast, primaryColor }) => {
  return (
    <div className="relative">
      {!isFirst && (
        <div className="absolute -top-2 left-4 flex items-center text-xs text-gray-400">
          <ArrowDown className="w-3 h-3" />
          <span className={step.dropOffRate > 30 ? 'text-red-500 font-medium' : ''}>
            -{step.dropOffRate}%
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div 
          className="h-8 rounded-md transition-all"
          style={{ 
            width: `${Math.max(step.percentage, 5)}%`,
            backgroundColor: isLast ? '#10b981' : primaryColor,
            opacity: 0.2 + (step.percentage / 100) * 0.8,
          }}
        />
        <div className="flex-1 min-w-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {step.step}
            </span>
            <span className="text-sm text-gray-500">
              {step.count} ({step.percentage}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DailyChartProps {
  data: { date: string; views: number; bookings: number }[];
  primaryColor: string;
}

const DailyChart: React.FC<DailyChartProps> = ({ data, primaryColor }) => {
  const maxViews = Math.max(...data.map(d => d.views), 1);
  
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((day, index) => {
        const height = (day.views / maxViews) * 100;
        const date = new Date(day.date);
        const dayLabel = date.getDate();
        
        return (
          <div 
            key={day.date} 
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div 
              className="w-full rounded-t transition-all hover:opacity-80 relative"
              style={{ 
                height: `${Math.max(height, 4)}%`,
                backgroundColor: primaryColor,
                opacity: 0.7,
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {day.views} views, {day.bookings} bookings
              </div>
            </div>
            {(index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2)) && (
              <span className="text-[10px] text-gray-400">{dayLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper to calculate trend
const calculateTrend = (values: number[]): number => {
  if (values.length < 2) return 0;
  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint).reduce((a, b) => a + b, 0);
  const secondHalf = values.slice(midpoint).reduce((a, b) => a + b, 0);
  if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
};

export default AnalyticsDashboard;
