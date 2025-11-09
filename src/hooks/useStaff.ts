/**
 * Staff Management Hook
 * Manages staff data with real-time sync from user_profiles table
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'super-admin' | 'admin' | 'beta-owner' | 'manager' | 'staff';
  status: string;
  company?: string;
  metadata: {
    department?: string;
    permissions?: string[];
    lastLogin?: string;
    hoursWorked?: number;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff';
  company?: string;
  department?: string;
  permissions?: string[];
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff members using RPC function
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_staff_with_email');

      if (fetchError) throw fetchError;

      setStaff(data || []);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.message);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  // Create staff member (creates auth user and profile)
  const createStaff = async (staffData: StaffFormData, password: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call RPC function to create staff member with auth user
      const { data, error: rpcError } = await supabase
        .rpc('create_staff_member', {
          p_email: staffData.email,
          p_password: password,
          p_first_name: staffData.first_name,
          p_last_name: staffData.last_name,
          p_phone: staffData.phone,
          p_role: staffData.role,
          p_company: staffData.company || null,
          p_metadata: {
            department: staffData.department,
            permissions: staffData.permissions || [],
          }
        });

      if (rpcError) throw rpcError;

      toast.success('Staff member created successfully!');
      await fetchStaff(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating staff:', err);
      toast.error(err.message || 'Failed to create staff member');
      throw err;
    }
  };

  // Update staff member
  const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    try {
      // Prepare updates, handling metadata separately
      const { metadata, email, ...profileUpdates } = updates;
      
      const updateData: any = { ...profileUpdates };
      
      // Merge metadata if provided
      if (metadata) {
        const { data: current } = await supabase
          .from('user_profiles')
          .select('metadata')
          .eq('id', id)
          .single();

        updateData.metadata = {
          ...(current?.metadata || {}),
          ...metadata
        };
      }

      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Staff member updated successfully!');
      await fetchStaff(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating staff:', err);
      toast.error(err.message || 'Failed to update staff member');
      throw err;
    }
  };

  // Delete staff member (soft delete by setting status to inactive)
  const deleteStaff = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Staff member deactivated successfully!');
      await fetchStaff(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      toast.error(err.message || 'Failed to delete staff member');
      throw err;
    }
  };

  // Toggle staff status
  const toggleStaffStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success(`Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchStaff(); // Refresh list
    } catch (err: any) {
      console.error('Error toggling staff status:', err);
      toast.error(err.message || 'Failed to update staff status');
      throw err;
    }
  };

  // Update last login time
  const updateLastLogin = async (id: string) => {
    try {
      const { data: current } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', id)
        .single();

      const updatedMetadata = {
        ...(current?.metadata || {}),
        lastLogin: new Date().toISOString()
      };

      await supabase
        .from('user_profiles')
        .update({ metadata: updatedMetadata })
        .eq('id', id);
    } catch (err: any) {
      console.error('Error updating last login:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStaff();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles'
        },
        (payload) => {
          console.log('Staff change detected:', payload);
          fetchStaff(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus,
    updateLastLogin,
    refreshStaff: fetchStaff, // Alias for consistency
  };
}
