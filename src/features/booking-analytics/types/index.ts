/**
 * Booking Analytics Types
 * 
 * Type definitions for booking analytics and revenue tracking.
 */

export type DateRange = '7d' | '30d' | '90d' | '12m' | 'all';
export type MetricGranularity = 'day' | 'week' | 'month';

export interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  revenueChange: number; // percentage change from previous period
  currency: string;
}

export interface BookingMetrics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  completedBookings: number;
  pendingBookings: number;
  bookingsChange: number; // percentage change from previous period
}

export interface ConversionMetrics {
  widgetViews: number;
  checkoutStarts: number;
  completedCheckouts: number;
  conversionRate: number; // percentage
  conversionChange: number; // change from previous period
  dropOffRate: number;
}

export interface CustomerMetrics {
  newCustomers: number;
  returningCustomers: number;
  repeatRate: number; // percentage
  totalCustomers: number;
  customerChange: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface RevenueByActivity {
  activityId: string;
  activityName: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

export interface RevenueByVenue {
  venueId: string;
  venueName: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

export interface BookingsByStatus {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  metric: number;
  change: number;
  rank: number;
}

export interface AnalyticsDashboardData {
  revenue: RevenueMetrics;
  bookings: BookingMetrics;
  conversion: ConversionMetrics;
  customers: CustomerMetrics;
  revenueTimeSeries: TimeSeriesDataPoint[];
  bookingsTimeSeries: TimeSeriesDataPoint[];
  revenueByActivity: RevenueByActivity[];
  revenueByVenue: RevenueByVenue[];
  bookingsByStatus: BookingsByStatus[];
  topActivities: TopPerformer[];
  peakBookingHours: { hour: number; count: number }[];
  peakBookingDays: { day: string; count: number }[];
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  organizationId?: string;
  venueId?: string;
  activityId?: string;
  granularity: MetricGranularity;
}

export interface AnalyticsState {
  data: AnalyticsDashboardData | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
}
