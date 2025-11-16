/**
 * Metrics Types
 * 
 * Type definitions for platform and organization metrics
 */

export interface PlatformMetrics {
  // Organizations
  total_organizations: number;
  active_organizations: number;
  inactive_organizations: number;
  pending_organizations: number;
  
  // Revenue
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  total_revenue: number;
  platform_fee_revenue: number; // 0.75% collected
  
  // Usage
  total_venues: number;
  total_games: number;
  total_bookings: number;
  total_users: number;
  
  // Growth
  new_organizations_this_month: number;
  churn_rate: number;
  growth_rate: number;
  
  // Plans
  basic_plan_count: number;
  growth_plan_count: number;
  pro_plan_count: number;
  
  // Timestamps
  period_start: string;
  period_end: string;
  updated_at: string;
}

export interface OrganizationMetrics {
  organization_id: string;
  
  // Venues & Games
  total_venues: number;
  active_venues: number;
  total_games: number;
  
  // Bookings
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  canceled_bookings: number;
  
  // Revenue
  total_revenue: number;
  mrr: number;
  average_booking_value: number;
  
  // Users
  total_users: number;
  active_users: number;
  
  // Storage
  storage_used_gb: number;
  storage_limit_gb: number;
  
  // Timestamps
  period_start: string;
  period_end: string;
  updated_at: string;
}

export interface TrendData {
  date: string;
  value: number;
  change_percentage?: number;
}

export interface RevenueMetrics {
  total_revenue: number;
  platform_fee_revenue: number;
  net_revenue: number;
  currency: string;
  trend: TrendData[];
}

export interface UsageMetrics {
  bookings_count: number;
  venues_count: number;
  games_count: number;
  users_count: number;
  trend: TrendData[];
}

export interface GrowthMetrics {
  new_organizations: number;
  churned_organizations: number;
  net_growth: number;
  growth_rate: number;
  trend: TrendData[];
}

export interface MetricsTimeRange {
  start_date: string;
  end_date: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface MetricsFilters {
  time_range: MetricsTimeRange;
  organization_id?: string;
  plan_id?: string;
}
