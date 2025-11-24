import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  total_bookings: number;
  confirmed_bookings: number;
  total_revenue: number;
  average_order_value: number;
  avg_group_size: number;
  total_customers: number;
  active_customers: number;
}

export interface WeeklyTrend {
  week_start: string;
  week_label: string;
  bookings_count: number;
}

export interface UpcomingBooking {
  booking_id: string;
  customer_name: string;
  activity_name: string;
  venue_name: string;
  booking_date: string;
  start_time: string;
  status: string;
  total_amount: number;
}

export interface TodaysHourly {
  hour_slot: string;
  bookings_count: number;
}

export interface RecentActivity {
  booking_id: string;
  customer_name: string;
  activity_name: string;
  venue_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  created_at: string;
  is_future_booking: boolean;
}

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [todaysHourly, setTodaysHourly] = useState<TodaysHourly[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats');

      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch weekly trend
      const { data: trendData, error: trendError } = await supabase
        .rpc('get_weekly_bookings_trend');

      if (trendError) throw trendError;
      setWeeklyTrend(trendData || []);

      // Fetch upcoming bookings
      const { data: upcomingData, error: upcomingError } = await supabase
        .rpc('get_upcoming_bookings', { limit_count: 5 });

      if (upcomingError) throw upcomingError;

      // Map game_name to activity_name if necessary
      const mappedUpcoming = (upcomingData || []).map((item: any) => ({
        ...item,
        activity_name: item.activity_name || item.game_name || 'Unknown Activity'
      }));
      setUpcomingBookings(mappedUpcoming);

      // Fetch today's hourly bookings
      const { data: hourlyData, error: hourlyError } = await supabase
        .rpc('get_todays_bookings_by_hour');

      if (hourlyError) throw hourlyError;
      setTodaysHourly(hourlyData || []);

      // Fetch recent booking activity
      const { data: activityData, error: activityError } = await supabase
        .rpc('get_recent_booking_activity', { limit_count: 10 });

      if (activityError) throw activityError;

      // Map game_name to activity_name if necessary
      const mappedActivity = (activityData || []).map((item: any) => ({
        ...item,
        activity_name: item.activity_name || item.game_name || 'Unknown Activity'
      }));
      setRecentActivity(mappedActivity);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to bookings changes
    const subscription = supabase
      .channel('dashboard-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    stats,
    weeklyTrend,
    upcomingBookings,
    todaysHourly,
    recentActivity,
    refreshDashboard: fetchDashboardData,
  };
}
