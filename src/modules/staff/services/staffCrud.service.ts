/**
 * Staff CRUD Service
 * Core CRUD operations for staff profiles
 * @module staff/services/staffCrud.service
 */

import { supabase } from '@/lib/supabase/client';
import { StaffMember, DBStaffMember, StaffFormData, StaffUpdateData } from '../types';
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
  skills: string[];
  assigned_activities: string[];
  assigned_venues: string[];
  avatar_url?: string;
  created_at: string;
  users: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    avatar_url?: string;
  };
}

class StaffCrudService {
  /**
   * Get a single staff member by ID
   */
  async getById(id: string): Promise<StaffMember | null> {
    const { data, error } = await (supabase.from('staff_profiles') as any)
      .select(`*, users!inner(id, email, full_name, role, is_active, avatar_url)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    if (!data) return null;

    const row = data as StaffProfileWithUser;
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
   * Create a new staff member via Edge Function
   */
  async create(data: StaffFormData, organizationId: string, password: string): Promise<StaffMember> {
    const { data: result, error } = await supabase.functions.invoke('create-staff-member', {
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
    });

    if (error) throw new Error(error.message);
    if (!result?.staff_profile_id) throw new Error('Failed to create staff profile');

    const created = await this.getById(result.staff_profile_id);
    if (!created) throw new Error('Failed to retrieve created staff');
    return created;
  }

  /**
   * Update staff profile fields
   */
  async updateProfile(id: string, updates: StaffUpdateData): Promise<StaffMember> {
    const dbUpdates = mapUIStaffToDBUpdate(updates);

    const { error } = await (supabase.from('staff_profiles') as any).update(dbUpdates).eq('id', id);
    if (error) throw new Error(error.message);

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
    if (error) throw new Error(error.message);
  }

  /**
   * Toggle staff active status
   */
  async toggleStatus(userId: string, currentlyActive: boolean): Promise<void> {
    await this.updateUser(userId, { isActive: !currentlyActive });
  }

  /**
   * Delete staff (soft delete by deactivating)
   */
  async delete(userId: string): Promise<void> {
    await this.updateUser(userId, { isActive: false });
  }
}

export const staffCrudService = new StaffCrudService();
