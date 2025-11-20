/**
 * Customers Database Hook
 * Manages customer data with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  total_bookings: number;
  total_spent: number;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerGame {
  game_id: string;
  game_name: string;
  game_image: string;
  booking_count: number;
  total_spent: number;
  last_played: string;
}

export interface CustomerVenue {
  venue_id: string;
  venue_name: string;
  visit_count: number;
  total_spent: number;
  last_visit: string;
}

export interface CustomerInsights {
  customer: Customer;
  favorite_game: {
    id: string;
    name: string;
    image_url: string;
    booking_count: number;
    total_spent: number;
  } | null;
  preferred_venue: {
    id: string;
    name: string;
    visit_count: number;
    total_spent: number;
  } | null;
  lifecycle_stage: 'new' | 'active' | 'at-risk' | 'churned';
  spending_tier: 'vip' | 'high' | 'medium' | 'low';
  frequency_tier: 'frequent' | 'regular' | 'occasional' | 'one-time';
  last_booking_date: string | null;
  days_since_last_visit: number;
  average_booking_value: number;
  booking_frequency_per_month: number;
}

export interface GameSegment {
  game_id: string;
  game_name: string;
  game_image_url: string;
  customer_count: number;
  total_bookings: number;
  total_revenue: number;
  avg_booking_value: number;
  last_booking_date: string;
}

export interface VenueSegment {
  venue_id: string;
  venue_name: string;
  customer_count: number;
  total_bookings: number;
  total_revenue: number;
  avg_booking_value: number;
  last_booking_date: string;
}

export interface GameAudienceMember {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_bookings: number;
  total_spent: number;
  last_booking_date: string;
  first_booking_date: string;
  avg_booking_value: number;
}

export interface VenueAudienceMember {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_bookings: number;
  total_spent: number;
  last_booking_date: string;
  first_booking_date: string;
  avg_booking_value: number;
}

export interface CustomerMetrics {
  total_customers: number;
  total_customers_previous: number;
  active_customers: number;
  active_customers_previous: number;
  avg_lifetime_value: number;
  avg_lifetime_value_previous: number;
  new_customers_current: number;
  total_customers_for_growth: number;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Create customer
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'total_bookings' | 'total_spent'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Customer created successfully!');
      await fetchCustomers(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating customer:', err);
      toast.error(err.message || 'Failed to create customer');
      throw err;
    }
  };

  // Update customer
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Customer updated successfully!');
      await fetchCustomers(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast.error(err.message || 'Failed to update customer');
      throw err;
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Customer deleted successfully!');
      await fetchCustomers(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error(err.message || 'Failed to delete customer');
      throw err;
    }
  };

  // Get customer by ID
  const getCustomerById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching customer:', err);
      toast.error('Failed to load customer details');
      throw err;
    }
  };

  // Search customers
  const searchCustomers = async (searchTerm: string) => {
    try {
      const { data, error: searchError } = await supabase
        .rpc('search_customers', { p_search_term: searchTerm });

      if (searchError) throw searchError;

      return data || [];
    } catch (err: any) {
      console.error('Error searching customers:', err);
      return [];
    }
  };

  // Get customer booking history
  const getCustomerHistory = async (customerId: string) => {
    try {
      const { data, error: historyError } = await supabase
        .rpc('get_customer_history', { p_customer_id: customerId });

      if (historyError) throw historyError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching customer history:', err);
      return [];
    }
  };

  // Get customer insights with analytics
  const getCustomerInsights = async (customerId: string): Promise<CustomerInsights | null> => {
    try {
      const { data, error: insightsError } = await supabase
        .rpc('get_customer_with_insights', { p_customer_id: customerId });

      if (insightsError) throw insightsError;

      return data || null;
    } catch (err: any) {
      console.error('Error fetching customer insights:', err);
      toast.error('Failed to load customer insights');
      return null;
    }
  };

  // Get customer games
  const getCustomerGames = async (customerId: string): Promise<CustomerGame[]> => {
    try {
      const { data, error: gamesError } = await supabase
        .rpc('get_customer_games', { p_customer_id: customerId });

      if (gamesError) throw gamesError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching customer games:', err);
      return [];
    }
  };

  // Get customer venues
  const getCustomerVenues = async (customerId: string): Promise<CustomerVenue[]> => {
    try {
      const { data, error: venuesError } = await supabase
        .rpc('get_customer_venues', { p_customer_id: customerId });

      if (venuesError) throw venuesError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching customer venues:', err);
      return [];
    }
  };

  // Get game-based segments (each game as an audience segment)
  const getGameSegments = async (): Promise<GameSegment[]> => {
    try {
      const { data, error: segmentsError } = await supabase
        .rpc('get_game_segments');

      if (segmentsError) throw segmentsError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching game segments:', err);
      return [];
    }
  };

  // Get audience for a specific game
  const getGameAudience = async (gameId: string): Promise<GameAudienceMember[]> => {
    try {
      const { data, error: audienceError } = await supabase
        .rpc('get_game_audience', { p_game_id: gameId });

      if (audienceError) throw audienceError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching game audience:', err);
      return [];
    }
  };

  // Get venue-based segments (each venue as an audience segment)
  const getVenueSegments = async (): Promise<VenueSegment[]> => {
    try {
      const { data, error: segmentsError } = await supabase
        .rpc('get_venue_segments');

      if (segmentsError) throw segmentsError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching venue segments:', err);
      return [];
    }
  };

  // Get audience for a specific venue
  const getVenueAudience = async (venueId: string): Promise<VenueAudienceMember[]> => {
    try {
      const { data, error: audienceError } = await supabase
        .rpc('get_venue_audience', { p_venue_id: venueId });

      if (audienceError) throw audienceError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching venue audience:', err);
      return [];
    }
  };

  // Get customer metrics for dashboard
  const getCustomerMetrics = async (): Promise<CustomerMetrics | null> => {
    try {
      const { data, error: metricsError } = await supabase
        .rpc('get_customer_metrics');

      if (metricsError) throw metricsError;

      return data && data.length > 0 ? data[0] : null;
    } catch (err: any) {
      console.error('Error fetching customer metrics:', err);
      return null;
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchCustomers();

    // Subscribe to customer changes
    const subscription = supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Customer changed:', payload);
          fetchCustomers(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    searchCustomers,
    getCustomerHistory,
    getCustomerInsights,
    getCustomerGames,
    getCustomerVenues,
    getGameSegments,
    getGameAudience,
    getVenueSegments,
    getVenueAudience,
    getCustomerMetrics,
    refreshCustomers: fetchCustomers,
  };
}
