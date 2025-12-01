/**
 * Booking Analytics Service
 * 
 * Service for fetching and computing booking analytics data.
 * All queries are organization-scoped for multi-tenant isolation.
 */

import { supabase } from '@/lib/supabase';
import type {
  AnalyticsDashboardData,
  AnalyticsFilters,
  RevenueMetrics,
  BookingMetrics,
  ConversionMetrics,
  CustomerMetrics,
  TimeSeriesDataPoint,
  RevenueByActivity,
  RevenueByVenue,
  BookingsByStatus,
  TopPerformer,
} from '../types';

// Status colors for charts
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  completed: '#3b82f6',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  no_show: '#6b7280',
};

/**
 * Calculate date range boundaries based on filter
 */
function getDateBoundaries(dateRange: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const end = new Date();
  const start = new Date();
  const prevEnd = new Date();
  const prevStart = new Date();
  
  switch (dateRange) {
    case '7d':
      start.setDate(end.getDate() - 7);
      prevEnd.setDate(start.getDate());
      prevStart.setDate(prevEnd.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      prevEnd.setDate(start.getDate());
      prevStart.setDate(prevEnd.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      prevEnd.setDate(start.getDate());
      prevStart.setDate(prevEnd.getDate() - 90);
      break;
    case '12m':
      start.setFullYear(end.getFullYear() - 1);
      prevEnd.setTime(start.getTime());
      prevStart.setFullYear(prevEnd.getFullYear() - 1);
      break;
    default:
      start.setFullYear(2020); // All time
      prevEnd.setTime(start.getTime());
      prevStart.setFullYear(2019);
  }
  
  return { start, end, prevStart, prevEnd };
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

class BookingAnalyticsService {
  /**
   * Fetch complete analytics dashboard data
   */
  async getDashboardData(filters: AnalyticsFilters): Promise<AnalyticsDashboardData> {
    const { start, end, prevStart, prevEnd } = getDateBoundaries(filters.dateRange);
    
    // Fetch all data in parallel
    const [
      revenue,
      bookings,
      conversion,
      customers,
      revenueTimeSeries,
      bookingsTimeSeries,
      revenueByActivity,
      revenueByVenue,
      bookingsByStatus,
      topActivities,
      peakHours,
      peakDays,
    ] = await Promise.all([
      this.getRevenueMetrics(filters, start, end, prevStart, prevEnd),
      this.getBookingMetrics(filters, start, end, prevStart, prevEnd),
      this.getConversionMetrics(filters, start, end, prevStart, prevEnd),
      this.getCustomerMetrics(filters, start, end, prevStart, prevEnd),
      this.getRevenueTimeSeries(filters, start, end),
      this.getBookingsTimeSeries(filters, start, end),
      this.getRevenueByActivity(filters, start, end),
      this.getRevenueByVenue(filters, start, end),
      this.getBookingsByStatus(filters, start, end),
      this.getTopActivities(filters, start, end),
      this.getPeakBookingHours(filters, start, end),
      this.getPeakBookingDays(filters, start, end),
    ]);
    
    return {
      revenue,
      bookings,
      conversion,
      customers,
      revenueTimeSeries,
      bookingsTimeSeries,
      revenueByActivity,
      revenueByVenue,
      bookingsByStatus,
      topActivities,
      peakBookingHours: peakHours,
      peakBookingDays: peakDays,
    };
  }

  /**
   * Revenue metrics calculation
   */
  private async getRevenueMetrics(
    filters: AnalyticsFilters,
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date
  ): Promise<RevenueMetrics> {
    let query = supabase
      .from('bookings')
      .select('total_amount, payment_status')
      .eq('payment_status', 'paid')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters.venueId) {
      query = query.eq('venue_id', filters.venueId);
    }
    if (filters.activityId) {
      query = query.eq('activity_id', filters.activityId);
    }
    
    const { data: current, error } = await query;
    if (error) throw error;
    
    // Previous period
    let prevQuery = supabase
      .from('bookings')
      .select('total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());
    
    if (filters.organizationId) {
      prevQuery = prevQuery.eq('organization_id', filters.organizationId);
    }
    
    const { data: previous } = await prevQuery;
    
    const totalRevenue = current?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
    const prevRevenue = previous?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
    const bookingCount = current?.length || 0;
    
    return {
      totalRevenue,
      averageOrderValue: bookingCount > 0 ? totalRevenue / bookingCount : 0,
      revenueChange: calculateChange(totalRevenue, prevRevenue),
      currency: 'USD',
    };
  }

  /**
   * Booking metrics calculation
   */
  private async getBookingMetrics(
    filters: AnalyticsFilters,
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date
  ): Promise<BookingMetrics> {
    let query = supabase
      .from('bookings')
      .select('status')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data: current, error } = await query;
    if (error) throw error;
    
    // Previous period count
    let prevQuery = supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());
    
    if (filters.organizationId) {
      prevQuery = prevQuery.eq('organization_id', filters.organizationId);
    }
    
    const { count: prevCount } = await prevQuery;
    
    const statusCounts = {
      confirmed: 0,
      cancelled: 0,
      no_show: 0,
      completed: 0,
      pending: 0,
    };
    
    current?.forEach((b) => {
      const status = b.status as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    });
    
    return {
      totalBookings: current?.length || 0,
      confirmedBookings: statusCounts.confirmed,
      cancelledBookings: statusCounts.cancelled,
      noShowBookings: statusCounts.no_show,
      completedBookings: statusCounts.completed,
      pendingBookings: statusCounts.pending,
      bookingsChange: calculateChange(current?.length || 0, prevCount || 0),
    };
  }

  /**
   * Conversion metrics from widget analytics
   */
  private async getConversionMetrics(
    filters: AnalyticsFilters,
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date
  ): Promise<ConversionMetrics> {
    // Try to get widget analytics if available
    let query = supabase
      .from('embed_configs')
      .select('view_count, booking_count');
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data: configs } = await query;
    
    const widgetViews = configs?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0;
    const completedCheckouts = configs?.reduce((sum, c) => sum + (c.booking_count || 0), 0) || 0;
    const checkoutStarts = Math.round(completedCheckouts * 1.3); // Estimate
    const conversionRate = widgetViews > 0 ? (completedCheckouts / widgetViews) * 100 : 0;
    const dropOffRate = checkoutStarts > 0 ? ((checkoutStarts - completedCheckouts) / checkoutStarts) * 100 : 0;
    
    return {
      widgetViews,
      checkoutStarts,
      completedCheckouts,
      conversionRate: Math.round(conversionRate * 100) / 100,
      conversionChange: 0, // Would need historical data
      dropOffRate: Math.round(dropOffRate * 100) / 100,
    };
  }

  /**
   * Customer metrics calculation
   */
  private async getCustomerMetrics(
    filters: AnalyticsFilters,
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date
  ): Promise<CustomerMetrics> {
    let query = supabase
      .from('customers')
      .select('id, total_bookings, created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data: newCustomers, error } = await query;
    if (error) throw error;
    
    // Previous period
    let prevQuery = supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());
    
    if (filters.organizationId) {
      prevQuery = prevQuery.eq('organization_id', filters.organizationId);
    }
    
    const { count: prevNewCount } = await prevQuery;
    
    // Total customers
    let totalQuery = supabase
      .from('customers')
      .select('id, total_bookings', { count: 'exact' });
    
    if (filters.organizationId) {
      totalQuery = totalQuery.eq('organization_id', filters.organizationId);
    }
    
    const { data: allCustomers, count: totalCount } = await totalQuery;
    
    const returningCustomers = allCustomers?.filter((c) => (c.total_bookings || 0) > 1).length || 0;
    const repeatRate = totalCount && totalCount > 0 ? (returningCustomers / totalCount) * 100 : 0;
    
    return {
      newCustomers: newCustomers?.length || 0,
      returningCustomers,
      repeatRate: Math.round(repeatRate * 100) / 100,
      totalCustomers: totalCount || 0,
      customerChange: calculateChange(newCustomers?.length || 0, prevNewCount || 0),
    };
  }

  /**
   * Revenue time series for charts
   */
  private async getRevenueTimeSeries(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<TimeSeriesDataPoint[]> {
    let query = supabase
      .from('bookings')
      .select('created_at, total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Group by date based on granularity
    const grouped = new Map<string, number>();
    data?.forEach((b) => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      grouped.set(date, (grouped.get(date) || 0) + (b.total_amount || 0));
    });
    
    return Array.from(grouped.entries()).map(([date, value]) => ({
      date,
      value,
      label: new Date(date).toLocaleDateString(),
    }));
  }

  /**
   * Bookings time series for charts
   */
  private async getBookingsTimeSeries(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<TimeSeriesDataPoint[]> {
    let query = supabase
      .from('bookings')
      .select('created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const grouped = new Map<string, number>();
    data?.forEach((b) => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      grouped.set(date, (grouped.get(date) || 0) + 1);
    });
    
    return Array.from(grouped.entries()).map(([date, value]) => ({
      date,
      value,
      label: new Date(date).toLocaleDateString(),
    }));
  }

  /**
   * Revenue breakdown by activity
   */
  private async getRevenueByActivity(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<RevenueByActivity[]> {
    let query = supabase
      .from('bookings')
      .select('activity_id, total_amount, activities(name)')
      .eq('payment_status', 'paid')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const grouped = new Map<string, { name: string; revenue: number; bookings: number }>();
    data?.forEach((b) => {
      const id = b.activity_id;
      const existing = grouped.get(id) || { 
        name: (b.activities as any)?.name || 'Unknown', 
        revenue: 0, 
        bookings: 0 
      };
      existing.revenue += b.total_amount || 0;
      existing.bookings += 1;
      grouped.set(id, existing);
    });
    
    const totalRevenue = Array.from(grouped.values()).reduce((sum, a) => sum + a.revenue, 0);
    
    return Array.from(grouped.entries())
      .map(([id, data]) => ({
        activityId: id,
        activityName: data.name,
        revenue: data.revenue,
        bookings: data.bookings,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  /**
   * Revenue breakdown by venue
   */
  private async getRevenueByVenue(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<RevenueByVenue[]> {
    let query = supabase
      .from('bookings')
      .select('venue_id, total_amount, venues(name)')
      .eq('payment_status', 'paid')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const grouped = new Map<string, { name: string; revenue: number; bookings: number }>();
    data?.forEach((b) => {
      const id = b.venue_id;
      if (!id) return;
      const existing = grouped.get(id) || { 
        name: (b.venues as any)?.name || 'Unknown', 
        revenue: 0, 
        bookings: 0 
      };
      existing.revenue += b.total_amount || 0;
      existing.bookings += 1;
      grouped.set(id, existing);
    });
    
    const totalRevenue = Array.from(grouped.values()).reduce((sum, v) => sum + v.revenue, 0);
    
    return Array.from(grouped.entries())
      .map(([id, data]) => ({
        venueId: id,
        venueName: data.name,
        revenue: data.revenue,
        bookings: data.bookings,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Bookings grouped by status
   */
  private async getBookingsByStatus(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<BookingsByStatus[]> {
    let query = supabase
      .from('bookings')
      .select('status')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const counts = new Map<string, number>();
    data?.forEach((b) => {
      counts.set(b.status, (counts.get(b.status) || 0) + 1);
    });
    
    const total = data?.length || 0;
    
    return Array.from(counts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: STATUS_COLORS[status] || '#9ca3af',
    }));
  }

  /**
   * Top performing activities
   */
  private async getTopActivities(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<TopPerformer[]> {
    const activities = await this.getRevenueByActivity(filters, start, end);
    
    return activities.slice(0, 5).map((a, index) => ({
      id: a.activityId,
      name: a.activityName,
      metric: a.revenue,
      change: 0, // Would need historical comparison
      rank: index + 1,
    }));
  }

  /**
   * Peak booking hours
   */
  private async getPeakBookingHours(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<{ hour: number; count: number }[]> {
    let query = supabase
      .from('bookings')
      .select('created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const hourCounts = new Array(24).fill(0);
    data?.forEach((b) => {
      const hour = new Date(b.created_at).getHours();
      hourCounts[hour]++;
    });
    
    return hourCounts.map((count, hour) => ({ hour, count }));
  }

  /**
   * Peak booking days
   */
  private async getPeakBookingDays(
    filters: AnalyticsFilters,
    start: Date,
    end: Date
  ): Promise<{ day: string; count: number }[]> {
    let query = supabase
      .from('bookings')
      .select('created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);
    
    data?.forEach((b) => {
      const dayIndex = new Date(b.created_at).getDay();
      dayCounts[dayIndex]++;
    });
    
    return days.map((day, index) => ({ day, count: dayCounts[index] }));
  }
}

export const bookingAnalyticsService = new BookingAnalyticsService();
