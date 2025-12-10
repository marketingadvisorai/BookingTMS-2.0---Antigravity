/**
 * Staff Schedule Service
 * Shift and availability management
 * @module staff/services/schedule
 */

import { supabase } from '@/lib/supabase/client';
import {
  StaffShift,
  DBStaffShift,
  ShiftFormData,
  AvailableStaff,
} from '../types';

function mapDBShiftToUI(db: DBStaffShift): StaffShift {
  return {
    id: db.id,
    staffProfileId: db.staff_profile_id,
    staffName: db.staff_name,
    organizationId: db.organization_id,
    assignmentId: db.assignment_id,
    shiftDate: db.shift_date,
    startTime: db.start_time,
    endTime: db.end_time,
    breakMinutes: db.break_minutes || 0,
    status: db.status,
    activityId: db.activity_id,
    activityName: db.activity_name,
    bookingIds: db.booking_ids || [],
    notes: db.notes,
    swapRequested: db.swap_requested || false,
    swapRequestedWith: db.swap_requested_with,
    swapApprovedBy: db.swap_approved_by,
    createdAt: db.created_at,
  };
}

class ScheduleService {
  async getShifts(
    organizationId: string,
    startDate: string,
    endDate: string,
    staffProfileId?: string
  ): Promise<StaffShift[]> {
    const { data, error } = await (supabase.rpc as any)('get_staff_shifts', {
      p_organization_id: organizationId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_staff_profile_id: staffProfileId || null,
    });

    if (error) {
      console.error('Error fetching shifts:', error);
      throw new Error(error.message);
    }

    return ((data || []) as DBStaffShift[]).map(mapDBShiftToUI);
  }

  async createShift(
    staffProfileId: string,
    organizationId: string,
    formData: ShiftFormData,
    createdBy: string
  ): Promise<StaffShift> {
    const { data, error } = await (supabase.from('staff_shifts') as any)
      .insert({
        staff_profile_id: staffProfileId,
        organization_id: organizationId,
        shift_date: formData.shiftDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        break_minutes: formData.breakMinutes || 0,
        activity_id: formData.activityId || null,
        assignment_id: formData.assignmentId || null,
        notes: formData.notes || null,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shift:', error);
      throw new Error(error.message);
    }

    return mapDBShiftToUI(data);
  }

  async updateShiftStatus(shiftId: string, status: StaffShift['status']): Promise<void> {
    const { error } = await (supabase.from('staff_shifts') as any)
      .update({ status })
      .eq('id', shiftId);

    if (error) {
      console.error('Error updating shift status:', error);
      throw new Error(error.message);
    }
  }

  async deleteShift(shiftId: string): Promise<void> {
    const { error } = await (supabase.from('staff_shifts') as any)
      .delete()
      .eq('id', shiftId);

    if (error) {
      console.error('Error deleting shift:', error);
      throw new Error(error.message);
    }
  }

  async getAvailableStaff(
    organizationId: string,
    date: string,
    startTime: string,
    endTime: string,
    activityId?: string
  ): Promise<AvailableStaff[]> {
    const { data, error } = await (supabase.rpc as any)('get_available_staff', {
      p_organization_id: organizationId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_activity_id: activityId || null,
    });

    if (error) {
      console.error('Error fetching available staff:', error);
      throw new Error(error.message);
    }

    return ((data || []) as any[]).map((row) => ({
      staffProfileId: row.staff_profile_id,
      userId: row.user_id,
      fullName: row.full_name,
      role: row.role,
      isAvailable: row.is_available,
      preference: row.preference,
      hasConflict: row.has_conflict,
    }));
  }
}

export const scheduleService = new ScheduleService();
