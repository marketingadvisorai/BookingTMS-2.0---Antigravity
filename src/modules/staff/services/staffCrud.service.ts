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
  employee_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  skills: string[];
  assigned_activities: string[];
  assigned_venues: string[];
  avatar_url?: string;
  notes?: string;
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
      id: row.id,
      user_id: row.users.id,
      organization_id: row.organization_id,
      email: row.users.email,
      full_name: row.users.full_name,
      role: row.users.role as any,
      is_active: row.users.is_active,
      department: row.department,
      job_title: row.job_title,
      phone: row.phone,
      hire_date: row.hire_date,
      employee_id: row.employee_id,
      emergency_contact_name: row.emergency_contact_name,
      emergency_contact_phone: row.emergency_contact_phone,
      assigned_activities: row.assigned_activities || [],
      assigned_venues: row.assigned_venues || [],
      skills: row.skills || [],
      avatar_url: row.avatar_url || row.users.avatar_url,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return mapDBStaffToUI(dbStaff);
  }

  /**
   * Create a new staff member via Edge Function
   * Then update with avatar and notes if provided
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

    // Update with avatar and notes if provided
    if (data.avatarUrl || data.notes) {
      const updateData: Record<string, unknown> = {};
      if (data.avatarUrl) updateData.avatar_url = data.avatarUrl;
      if (data.notes) updateData.notes = data.notes;
      
      await (supabase.from('staff_profiles') as any)
        .update(updateData)
        .eq('id', result.staff_profile_id);
    }

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
