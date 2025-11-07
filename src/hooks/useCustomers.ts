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
    refreshCustomers: fetchCustomers,
  };
}
