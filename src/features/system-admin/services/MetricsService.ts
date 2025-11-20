/**
 * Metrics Service
 * 
 * Handles all platform-wide metrics and analytics
 * Integrates with various Supabase tables
 */

import { supabase } from '@/lib/supabase';
import type {
  PlatformMetrics,
  RevenueMetrics,
  UsageMetrics,
  GrowthMetrics,
  MetricsFilters,
} from '../types';

export class MetricsService {
  /**
   * Get platform-wide metrics
   */
  static async getPlatformMetrics(filters?: MetricsFilters): Promise<PlatformMetrics> {
    try {
      // Call the database function
      const { data, error } = await supabase
        .rpc('get_platform_metrics')
        .single();

      if (error) {
        throw new Error(`Failed to fetch platform metrics: ${error.message}`);
      }

      if (!data) {
        throw new Error('No platform metrics data returned');
      }

      return data as PlatformMetrics;
    } catch (error) {
      console.error('MetricsService.getPlatformMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get platform-wide metrics (OLD - keeping as fallback)
   */
  static async getPlatformMetricsManual(filters?: MetricsFilters): Promise<PlatformMetrics> {
    try {
      // Organizations count by status
      const { data: orgData } = await supabase
        .from('organizations')
        .select('status');

      const totalOrgs = orgData?.length || 0;
      const activeOrgs = orgData?.filter(o => o.status === 'active').length || 0;
      const inactiveOrgs = orgData?.filter(o => o.status === 'inactive').length || 0;
      const pendingOrgs = orgData?.filter(o => o.status === 'pending').length || 0;

      // Count by plan
      const { data: planCounts } = await supabase
        .from('organizations')
        .select('plan_id, plans(name)')
        .eq('status', 'active');

      const basicPlanCount = planCounts?.filter((o: any) => 
        o.plans?.name?.toLowerCase().includes('basic')
      ).length || 0;
      
      const growthPlanCount = planCounts?.filter((o: any) => 
        o.plans?.name?.toLowerCase().includes('growth')
      ).length || 0;
      
      const proPlanCount = planCounts?.filter((o: any) => 
        o.plans?.name?.toLowerCase().includes('pro')
      ).length || 0;

      // Revenue (would come from platform_revenue table)
      const { data: revenueData } = await supabase
        .from('platform_revenue')
        .select('amount, fee_collected');

      const totalRevenue = revenueData?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const platformFeeRevenue = revenueData?.reduce((sum, r) => sum + r.fee_collected, 0) || 0;

      // Calculate MRR from active organizations
      const { data: orgsWithPlans } = await supabase
        .from('organizations')
        .select('plans(price, billing_period)')
        .eq('status', 'active');

      const mrr = orgsWithPlans?.reduce((sum, org: any) => {
        const price = org.plans?.price || 0;
        const monthlyPrice = org.plans?.billing_period === 'annual' ? price / 12 : price;
        return sum + monthlyPrice;
      }, 0) || 0;

      const arr = mrr * 12;

      // Get usage counts
      const [{ count: venueCount }, { count: gameCount }, { count: bookingCount }, { count: userCount }] = await Promise.all([
        supabase.from('venues').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);

      // Growth metrics (simplified - would use time-based queries in production)
      const newOrgsThisMonth = 0; // TODO: Implement date filtering
      const churnRate = 0;
      const growthRate = 0;

      return {
        total_organizations: totalOrgs,
        active_organizations: activeOrgs,
        inactive_organizations: inactiveOrgs,
        pending_organizations: pendingOrgs,
        
        mrr,
        arr,
        total_revenue: totalRevenue,
        platform_fee_revenue: platformFeeRevenue,
        
        total_venues: venueCount || 0,
        total_games: gameCount || 0,
        total_bookings: bookingCount || 0,
        total_users: userCount || 0,
        
        new_organizations_this_month: newOrgsThisMonth,
        churn_rate: churnRate,
        growth_rate: growthRate,
        
        basic_plan_count: basicPlanCount,
        growth_plan_count: growthPlanCount,
        pro_plan_count: proPlanCount,
        
        period_start: filters?.time_range?.start_date || new Date().toISOString(),
        period_end: filters?.time_range?.end_date || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('MetricsService.getPlatformMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get revenue metrics
   */
  static async getRevenueMetrics(filters?: MetricsFilters): Promise<RevenueMetrics> {
    try {
      const { data } = await supabase
        .from('platform_revenue')
        .select('amount, fee_collected, created_at')
        .order('created_at', { ascending: true });

      const totalRevenue = data?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const platformFeeRevenue = data?.reduce((sum, r) => sum + r.fee_collected, 0) || 0;
      const netRevenue = totalRevenue - platformFeeRevenue;

      // Group by date for trend
      const trend = (data || []).reduce((acc: any[], item) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        const existing = acc.find(t => t.date === date);
        
        if (existing) {
          existing.value += item.amount;
        } else {
          acc.push({ date, value: item.amount });
        }
        
        return acc;
      }, []);

      return {
        total_revenue: totalRevenue,
        platform_fee_revenue: platformFeeRevenue,
        net_revenue: netRevenue,
        currency: 'USD',
        trend,
      };
    } catch (error) {
      console.error('MetricsService.getRevenueMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get usage metrics
   */
  static async getUsageMetrics(filters?: MetricsFilters): Promise<UsageMetrics> {
    try {
      const [
        { count: bookingsCount },
        { count: venuesCount },
        { count: gamesCount },
        { count: usersCount },
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('venues').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);

      return {
        bookings_count: bookingsCount || 0,
        venues_count: venuesCount || 0,
        games_count: gamesCount || 0,
        users_count: usersCount || 0,
        trend: [], // TODO: Implement trend data
      };
    } catch (error) {
      console.error('MetricsService.getUsageMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get growth metrics
   */
  static async getGrowthMetrics(filters?: MetricsFilters): Promise<GrowthMetrics> {
    try {
      // This would use time-based queries in production
      const { count: newOrgs } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: churnedOrgs } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'inactive');

      const netGrowth = (newOrgs || 0) - (churnedOrgs || 0);
      const growthRate = newOrgs ? (netGrowth / newOrgs) * 100 : 0;

      return {
        new_organizations: newOrgs || 0,
        churned_organizations: churnedOrgs || 0,
        net_growth: netGrowth,
        growth_rate: growthRate,
        trend: [], // TODO: Implement trend data
      };
    } catch (error) {
      console.error('MetricsService.getGrowthMetrics error:', error);
      throw error;
    }
  }
}
