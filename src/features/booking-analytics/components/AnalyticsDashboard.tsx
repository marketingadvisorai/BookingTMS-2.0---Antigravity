/**
 * Analytics Dashboard Component
 * 
 * Main dashboard component displaying booking analytics with charts and metrics.
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useBookingAnalytics } from '../hooks/useBookingAnalytics';
import type { DateRange } from '../types';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percent';
  loading?: boolean;
}

function MetricCard({ title, value, change, icon, format = 'number', loading }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</span>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatValue(value)}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1">{Math.abs(change)}% vs previous period</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

function StatusBadge({ status, count, percentage, color }: StatusBadgeProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="capitalize text-gray-700 dark:text-gray-300">{status}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-900 dark:text-white">{count}</span>
        <span className="text-gray-500 text-sm w-12 text-right">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const {
    data,
    isLoading,
    error,
    filters,
    setDateRange,
    refresh,
  } = useBookingAnalytics();

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track revenue, bookings, and customer metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={data?.revenue.totalRevenue || 0}
          change={data?.revenue.revenueChange}
          icon={<DollarSign size={20} />}
          format="currency"
          loading={isLoading}
        />
        <MetricCard
          title="Total Bookings"
          value={data?.bookings.totalBookings || 0}
          change={data?.bookings.bookingsChange}
          icon={<Calendar size={20} />}
          loading={isLoading}
        />
        <MetricCard
          title="Avg Order Value"
          value={data?.revenue.averageOrderValue || 0}
          icon={<BarChart3 size={20} />}
          format="currency"
          loading={isLoading}
        />
        <MetricCard
          title="Conversion Rate"
          value={data?.conversion.conversionRate || 0}
          change={data?.conversion.conversionChange}
          icon={<TrendingUp size={20} />}
          format="percent"
          loading={isLoading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="New Customers"
          value={data?.customers.newCustomers || 0}
          change={data?.customers.customerChange}
          icon={<Users size={20} />}
          loading={isLoading}
        />
        <MetricCard
          title="Repeat Rate"
          value={data?.customers.repeatRate || 0}
          icon={<Users size={20} />}
          format="percent"
          loading={isLoading}
        />
        <MetricCard
          title="Completed Bookings"
          value={data?.bookings.completedBookings || 0}
          icon={<Calendar size={20} />}
          loading={isLoading}
        />
        <MetricCard
          title="Cancellation Rate"
          value={
            data?.bookings.totalBookings
              ? (data.bookings.cancelledBookings / data.bookings.totalBookings) * 100
              : 0
          }
          icon={<Calendar size={20} />}
          format="percent"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bookings by Status
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.bookingsByStatus.map((status) => (
                <StatusBadge
                  key={status.status}
                  status={status.status}
                  count={status.count}
                  percentage={status.percentage}
                  color={status.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Activities by Revenue
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.revenueByActivity.slice(0, 5).map((activity, index) => (
                <div key={activity.activityId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                      {activity.activityName}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${activity.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
              {(!data?.revenueByActivity || data.revenueByActivity.length === 0) && (
                <p className="text-gray-500 text-center py-4">No activity data available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Peak Hours and Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Booking Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Peak Booking Hours
          </h3>
          {isLoading ? (
            <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          ) : (
            <div className="flex items-end gap-1 h-32">
              {data?.peakBookingHours.map((hour) => {
                const maxCount = Math.max(...(data?.peakBookingHours.map((h) => h.count) || [1]));
                const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={hour.hour}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t transition-all hover:bg-blue-600 dark:hover:bg-blue-500"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${hour.hour}:00 - ${hour.count} bookings`}
                  />
                );
              })}
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>
        </div>

        {/* Peak Booking Days */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bookings by Day of Week
          </h3>
          {isLoading ? (
            <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          ) : (
            <div className="space-y-2">
              {data?.peakBookingDays.map((day) => {
                const maxCount = Math.max(...(data?.peakBookingDays.map((d) => d.count) || [1]));
                const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                      {day.day.slice(0, 3)}
                    </span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 dark:bg-green-600 rounded-full transition-all"
                        style={{ width: `${Math.max(width, 2)}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {day.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
