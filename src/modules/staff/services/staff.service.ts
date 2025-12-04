/**
 * Staff Service
 * CRUD operations for staff management with multi-tenant support
 * @module staff/services/staff.service
 */

import { supabase } from '@/lib/supabase/client';
import {
  StaffMember,
  DBStaffMember,
  StaffFormData,
  StaffUpdateData,
  StaffStats,
  StaffFilters,
} from '../types';
import { mapDBStaffToUI, mapUIStaffToDBUpdate } from '../utils/mappers';

// Type for staff profile with joined user data
interface StaffProfileWithUser {
  id: string;
  user_id: string;
  organization_id: string;
  department?: string;
  job_title?: string;
  phone?: string;
  hire_date?: string;
  employee_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  assigned_activities: string[];
  assigned_venues: string[];
  skills: string[];
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  users: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    avatar_url?: string;
  };
}

export interface ListStaffOptions {
  organizationId: string;
  filters?: StaffFilters;
  limit?: number;
  offset?: number;
}

class StaffService {
  /**
   * List staff members using RPC function
   */
  async list(options: ListStaffOptions): Promise<StaffMember[]> {
    const { organizationId, filters, limit = 100, offset = 0 } = options;

    const { data, error } = await (supabase.rpc as any)('get_staff_members', {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('Error fetching staff:', error);
      throw new Error(error.message);
    }

    let staffList = ((data || []) as DBStaffMember[]).map(mapDBStaffToUI);

    // Apply client-side filters
    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        staffList = staffList.filter(
          (s) =>
            s.fullName.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search)
        );
      }
      if (filters.role && filters.role !== 'all') {
        staffList = staffList.filter((s) => s.role === filters.role);
      }
      if (filters.status && filters.status !== 'all') {
        staffList = staffList.filter((s) =>
          filters.status === 'active' ? s.isActive : !s.isActive
        );
      }
      if (filters.department) {
        staffList = staffList.filter((s) => s.department === filters.department);
      }
    }

    return staffList.slice(offset, offset + limit);
  }

  /**
   * Get a single staff member by ID
   */
  async getById(id: string): Promise<StaffMember | null> {
    const { data, error } = await (supabase
      .from('staff_profiles') as any)
      .select(`
        *,
        users!inner(id, email, full_name, role, is_active, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching staff:', error);
      throw new Error(error.message);
    }

    if (!data) return null;

    const row = data as StaffProfileWithUser;
    // Map joined data
    const dbStaff: DBStaffMember = {
      ...row,
      user_id: row.users.id,
      email: row.users.email,
      full_name: row.users.full_name,
      role: row.users.role as any,
      is_active: row.users.is_active,
      avatar_url: row.avatar_url || row.users.avatar_url,
    };

    return mapDBStaffToUI(dbStaff);
  }

  /**
   * Create a new staff member (creates auth user + profile via Edge Function)
   */
  async create(
    data: StaffFormData,
    organizationId: string,
    password: string
  ): Promise<StaffMember> {
    // Call Edge Function to create auth user and profile
    const { data: result, error } = await supabase.functions.invoke(
      'create-staff-member',
      {
        body: {
          email: data.email,
          password,
          full_name: data.fullName,
          role: data.role,
          organization_id: organizationId,
          department: data.department,
          job_title: data.jobTitle,
          phone: data.phone,
          hire_date: data.hireDate,
          skills: data.skills,
        },
      }
    );

    if (error) {
      console.error('Error creating staff:', error);
      throw new Error(error.message);
    }

    if (!result?.staff_profile_id) {
      throw new Error('Failed to create staff profile');
    }

    const created = await this.getById(result.staff_profile_id);
    if (!created) throw new Error('Failed to retrieve created staff');

    return created;
  }

  /**
   * Update staff profile
   */
  async updateProfile(id: string, updates: StaffUpdateData): Promise<StaffMember> {
    const dbUpdates = mapUIStaffToDBUpdate(updates);

    const { error } = await (supabase
      .from('staff_profiles') as any)
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating staff profile:', error);
      throw new Error(error.message);
    }

    const updated = await this.getById(id);
    if (!updated) throw new Error('Failed to retrieve updated staff');

    return updated;
  }

  /**
   * Update user fields (role, status)
   */
  async updateUser(userId: string, updates: { role?: string; isActive?: boolean }): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error } = await (supabase.from('users') as any).update(dbUpdates).eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Toggle staff active status
   */
  async toggleStatus(userId: string, currentlyActive: boolean): Promise<void> {
    await this.updateUser(userId, { isActive: !currentlyActive });
  }

  /**
   * Delete staff profile (soft delete by deactivating user)
   */
  async delete(userId: string): Promise<void> {
    await this.updateUser(userId, { isActive: false });
  }

  /**
   * Get staff statistics
   */
  async getStats(organizationId: string): Promise<StaffStats> {
    const { data, error } = await (supabase.rpc as any)('get_staff_stats', {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('Error fetching staff stats:', error);
      return {
        total: 0,
        active: 0,
        byRole: {},
        byDepartment: {},
        avgHoursThisMonth: 0,
      };
    }

    const row = (data?.[0] || data || {}) as any;
    return {
      total: row.total_staff || 0,
      active: row.active_staff || 0,
      byRole: row.by_role || {},
      byDepartment: row.by_department || {},
      avgHoursThisMonth: row.avg_hours_this_month || 0,
    };
  }

  /**
   * Get unique departments
   */
  async getDepartments(organizationId: string): Promise<string[]> {
    const { data, error } = await (supabase
      .from('staff_profiles') as any)
      .select('department')
      .eq('organization_id', organizationId)
      .not('department', 'is', null);

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    const unique = [...new Set((data || []).map((d: any) => d.department).filter(Boolean))] as string[];
    return unique.sort();
  }
}

export const staffService = new StaffService();
