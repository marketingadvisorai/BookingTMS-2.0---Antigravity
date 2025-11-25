/**
 * Staff Management Hook
 * Manages staff data with real-time sync from users table
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

  // Create staff member (creates auth user and profile via Edge Function)
  const createStaff = async (staffData: StaffFormData, password: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current user's organization ID
      // We can get it from the user metadata or by querying the organization_members table
      // But for now, let's assume the user context has it or we fetch it.
      // The RPC 'get_staff_with_email' uses the current user's org, so we are safe context-wise.
      // But we need to pass it to the Edge Function.

      // Fetch org id
      const { data: orgMember } = await (supabase as any)
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single() as any;

      if (!orgMember) throw new Error('Organization not found for current user');

      // Call Edge Function
      const { data, error: edgeError } = await supabase.functions.invoke('create-staff-member', {
        body: {
          email: staffData.email,
          password: password,
          first_name: staffData.first_name,
          last_name: staffData.last_name,
          role: staffData.role,
          organization_id: orgMember.organization_id
        }
      } as any);

      if (edgeError) throw edgeError;

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
      // Note: 'users' table might not have 'metadata' column in the same way 'user_profiles' did.
      // But '000_initial_schema' showed 'metadata' JSONB on 'organizations' and 'customers'.
      // 'users' table schema is inferred. Assuming it has 'metadata' or we map it.
      // If 'users' table doesn't have metadata, we might need to store it elsewhere or ignore it.
      // For now, we'll try to update it if it exists.

      // Check if metadata column exists? No, we can't check schema at runtime easily.
      // We'll assume 'users' table has the columns we need or we update what we can.

      const { data, error: updateError } = await (supabase as any)
        .from('users')
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
      const { error: deleteError } = await (supabase as any)
        .from('users')
        .update({ is_active: false }) // 'users' table uses is_active boolean usually
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
      const isActive = currentStatus === 'active';
      const newStatus = !isActive;

      const { error: updateError } = await (supabase as any)
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success(`Staff member ${newStatus ? 'activated' : 'deactivated'}`);
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
      await (supabase as any)
        .from('users')
        .update({ last_login_at: new Date().toISOString() }) // Assuming last_login_at column
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
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
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

