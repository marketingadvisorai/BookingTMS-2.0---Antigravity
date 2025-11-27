import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { subDays, startOfWeek, format, parseISO, startOfToday, subWeeks, addDays } from 'date-fns';

// Database row types
interface BookingRow {
  id: string;
  final_amount: number | null;
  party_size: number | null;
  status: string;
  created_at: string;
  customer_id: string | null;
}

interface TrendBookingRow {
  booking_date: string;
}

interface UpcomingBookingRow {
  id: string;
  booking_date: string;
  start_time: string | null;
  status: string;
  final_amount: number | null;
  customer: { full_name: string } | null;
  activity: { name: string } | null;
  venue: { name: string } | null;
}

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

      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      const eightWeeksAgo = subWeeks(today, 8);

      // 1. Fetch Stats (Total Bookings, Revenue, etc.) - Last 30 days
      const { data: rawBookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, final_amount, party_size, status, created_at, customer_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (bookingsError) throw bookingsError;

      const bookingsData = (rawBookingsData || []) as BookingRow[];
      const total_bookings = bookingsData.length;
      const confirmed_bookings = bookingsData.filter(b => b.status === 'confirmed').length;
      const total_revenue = bookingsData.reduce((sum, b) => sum + (b.final_amount || 0), 0);
      const average_order_value = total_bookings > 0 ? total_revenue / total_bookings : 0;
      const avg_group_size = total_bookings > 0 ? bookingsData.reduce((sum, b) => sum + (b.party_size || 0), 0) / total_bookings : 0;

      // Fetch total customers count
      const { count: total_customers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Active customers (unique customers with bookings in last 30 days)
      const active_customers = new Set(bookingsData.map(b => b.customer_id)).size;

      setStats({
        total_bookings,
        confirmed_bookings,
        total_revenue,
        average_order_value,
        avg_group_size,
        total_customers: total_customers || 0,
        active_customers
      });

      // 2. Weekly Trend
      const { data: rawTrendBookings, error: trendError } = await supabase
        .from('bookings')
        .select('booking_date')
        .gte('booking_date', eightWeeksAgo.toISOString())
        .lte('booking_date', today.toISOString());

      if (trendError) throw trendError;
      const trendBookings = (rawTrendBookings || []) as TrendBookingRow[];

      // Group by week
      const weeksMap = new Map<string, number>();
      // Initialize last 8 weeks
      for (let i = 0; i < 8; i++) {
        const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
        const weekLabel = format(weekStart, 'MMM dd');
        // Ensure we don't overwrite if already exists (though iterating backwards ensures uniqueness usually)
        if (!weeksMap.has(weekLabel)) {
          weeksMap.set(weekLabel, 0);
        }
      }

      trendBookings.forEach(b => {
        const date = parseISO(b.booking_date);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekLabel = format(weekStart, 'MMM dd');
        // Only count if it falls within our tracked weeks
        if (weeksMap.has(weekLabel)) {
          weeksMap.set(weekLabel, (weeksMap.get(weekLabel) || 0) + 1);
        } else {
          // Handle edge cases or just ignore
        }
      });

      // Convert map to array and reverse to show oldest to newest
      // Note: Map preserves insertion order, but we inserted newest first.
      const weeklyTrend = Array.from(weeksMap.entries())
        .map(([week_label, bookings_count]) => ({ week_start: '', week_label, bookings_count }))
        .reverse();

      setWeeklyTrend(weeklyTrend);

      // 3. Upcoming Bookings - Use simpler query without joins
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('bookings')
        .select('id, booking_date, start_time, status, final_amount, customer_id, activity_id, venue_id')
        .eq('booking_date', format(today, 'yyyy-MM-dd'))
        .gt('start_time', format(today, 'HH:mm:ss'))
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true })
        .limit(5);

      if (upcomingError) {
        console.warn('Error fetching upcoming bookings:', upcomingError);
      }

      const upcomingBookings = (upcomingData || []).map((b: any) => ({
        booking_id: b.id,
        customer_name: 'Customer',
        activity_name: 'Activity',
        venue_name: 'Venue',
        booking_date: b.booking_date,
        start_time: b.start_time,
        status: b.status,
        total_amount: b.final_amount
      }));

      setUpcomingBookings(upcomingBookings);

      // 4. Today's Hourly
      const { data: rawTodayBookings, error: todayError } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('booking_date', format(today, 'yyyy-MM-dd'));

      if (todayError) throw todayError;
      const todayBookings = (rawTodayBookings || []) as { start_time: string }[];

      const hourlyMap = new Map<string, number>();
      for (let i = 9; i <= 21; i++) { // 9 AM to 9 PM
        const hour = i < 10 ? `0${i}:00` : `${i}:00`;
        hourlyMap.set(hour, 0);
      }

      todayBookings.forEach(b => {
        // Extract hour from HH:MM:SS
        const hour = b.start_time?.substring(0, 2) + ':00';
        if (hourlyMap.has(hour)) {
          hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        }
      });

      const todaysHourly = Array.from(hourlyMap.entries()).map(([hour_slot, bookings_count]) => ({
        hour_slot,
        bookings_count
      }));

      setTodaysHourly(todaysHourly);

      // 5. Recent Activity - Use simpler query without joins
      const { data: recentData, error: recentError } = await supabase
        .from('bookings')
        .select('id, booking_date, start_time, status, final_amount, created_at, customer_id, activity_id, venue_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.warn('Error fetching recent activity:', recentError);
      }

      const recentActivity = (recentData || []).map((b: any) => ({
        booking_id: b.id,
        customer_name: 'Customer',
        activity_name: 'Activity',
        venue_name: 'Venue',
        booking_date: b.booking_date,
        booking_time: b.start_time,
        status: b.status,
        total_amount: b.final_amount,
        created_at: b.created_at,
        is_future_booking: new Date(b.booking_date) >= startOfToday()
      }));

      setRecentActivity(recentActivity);

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

