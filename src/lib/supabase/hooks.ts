/**
 * Supabase React Hooks
 * 
 * Custom hooks for fetching data from Supabase
 * These hooks handle loading, error states, and real-time updates
 */

import { useState, useEffect } from 'react';
import { supabase } from './client';
import { useAuth } from '../auth/AuthContext';

// ============================================================================
// BOOKINGS HOOKS
// ============================================================================

interface Booking {
  id: string;
  booking_number: string;
  booking_date: string;
  start_time: string;
  status: string;
  payment_status: string;
  final_amount: number;
  customer: {
    full_name: string;
    email: string;
  };
  game: {
    name: string;
  };
}

export function useBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.organizationId) {
      setIsLoading(false);
      return;
    }

    fetchBookings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `organization_id=eq.${currentUser.organizationId}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.organizationId]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase
        .from('bookings') as any)
        .select(`
          *,
          customer:customers(full_name, email),
          activity:activities(name)
        `)
        .eq('organization_id', currentUser!.organizationId!)
        .order('booking_date', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  return { bookings, isLoading, error, refetch: fetchBookings };
}

// ============================================================================
// GAMES HOOKS
// ============================================================================

interface Activity {
  id: string;
  name: string;
  description: string | null;
  difficulty: string;
  duration_minutes: number;
  min_players: number;
  max_players: number;
  price: number;
  is_active: boolean;
}

export function useActivities() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.organizationId) {
      setIsLoading(false);
      return;
    }

    fetchActivities();
  }, [currentUser?.organizationId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase
        .from('activities') as any)
        .select('*')
        .eq('organization_id', currentUser!.organizationId!)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message || 'Failed to fetch activities');
    } finally {
      setIsLoading(false);
    }
  };

  return { activities, isLoading, error, refetch: fetchActivities };
}

// ============================================================================
// CUSTOMERS HOOKS
// ============================================================================

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  total_bookings: number;
  total_spent: number;
  segment: string;
}

export function useCustomers() {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.organizationId) {
      setIsLoading(false);
      return;
    }

    fetchCustomers();
  }, [currentUser?.organizationId]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', currentUser!.organizationId!)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  return { customers, isLoading, error, refetch: fetchCustomers };
}

// ============================================================================
// DASHBOARD STATS HOOK
// ============================================================================

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeCustomers: number;
  upcomingBookings: number;
}

export function useDashboardStats() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    activeCustomers: 0,
    upcomingBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.organizationId) {
      setIsLoading(false);
      return;
    }

    fetchStats();
  }, [currentUser?.organizationId]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orgId = currentUser!.organizationId!;
      const today = new Date().toISOString().split('T')[0];

      // Total revenue (paid bookings)
      const { data: paidBookings, error: revenueError } = await supabase
        .from('bookings')
        .select('final_amount')
        .eq('organization_id', orgId)
        .eq('payment_status', 'paid');

      if (revenueError) throw revenueError;

      const totalRevenue = (paidBookings || []).reduce(
        (sum: number, booking: any) => sum + parseFloat(booking.final_amount),
        0
      );

      // Total bookings count
      const { count: totalBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      if (bookingsError) throw bookingsError;

      // Active customers (customers with at least one booking)
      const { count: activeCustomers, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gt('total_bookings', 0);

      if (customersError) throw customersError;

      // Upcoming bookings (future bookings)
      const { count: upcomingBookings, error: upcomingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('booking_date', today)
        .in('status', ['pending', 'confirmed']);

      if (upcomingError) throw upcomingError;

      setStats({
        totalRevenue,
        totalBookings: totalBookings || 0,
        activeCustomers: activeCustomers || 0,
        upcomingBookings: upcomingBookings || 0,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, error, refetch: fetchStats };
}

// ============================================================================
// NOTIFICATIONS HOOK
// ============================================================================

interface Notification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useNotificationsData() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }

    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase
        .from('notifications') as any)
        .select('*')
        .eq('user_id', currentUser!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
  };
}
