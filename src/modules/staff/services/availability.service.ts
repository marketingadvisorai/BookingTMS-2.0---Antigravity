/**
 * Staff Availability Service
 * Manage staff availability preferences
 * @module staff/services/availability
 */

import { supabase } from '@/lib/supabase/client';
import { StaffAvailability, DBStaffAvailability, AvailabilityPreference } from '../types';

function mapDBToUI(db: DBStaffAvailability): StaffAvailability {
  return {
    id: db.id,
    staffProfileId: db.staff_profile_id,
    organizationId: db.organization_id,
    dayOfWeek: db.day_of_week,
    startTime: db.start_time,
    endTime: db.end_time,
    isAvailable: db.is_available,
    preference: db.preference,
    effectiveFrom: db.effective_from,
    effectiveUntil: db.effective_until,
    notes: db.notes,
  };
}

class AvailabilityService {
  async list(staffProfileId: string): Promise<StaffAvailability[]> {
    const { data, error } = await (supabase.from('staff_availability') as any)
      .select('*')
      .eq('staff_profile_id', staffProfileId)
      .order('day_of_week')
      .order('start_time');

    if (error) {
      console.error('Error fetching availability:', error);
      throw new Error(error.message);
    }

    return ((data || []) as DBStaffAvailability[]).map(mapDBToUI);
  }

  async create(
    staffProfileId: string,
    organizationId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    preference: AvailabilityPreference = 'available',
    notes?: string
  ): Promise<StaffAvailability> {
    const { data, error } = await (supabase.from('staff_availability') as any)
      .insert({
        staff_profile_id: staffProfileId,
        organization_id: organizationId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_available: preference !== 'unavailable',
        preference,
        notes,
        effective_from: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating availability:', error);
      throw new Error(error.message);
    }

    return mapDBToUI(data);
  }

  async update(id: string, updates: Partial<StaffAvailability>): Promise<StaffAvailability> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.dayOfWeek !== undefined) dbUpdates.day_of_week = updates.dayOfWeek;
    if (updates.startTime) dbUpdates.start_time = updates.startTime;
    if (updates.endTime) dbUpdates.end_time = updates.endTime;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.preference) dbUpdates.preference = updates.preference;
    if (updates.effectiveUntil !== undefined) dbUpdates.effective_until = updates.effectiveUntil;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await (supabase.from('staff_availability') as any)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating availability:', error);
      throw new Error(error.message);
    }

    return mapDBToUI(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase.from('staff_availability') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability:', error);
      throw new Error(error.message);
    }
  }

  async setWeeklyAvailability(
    staffProfileId: string,
    organizationId: string,
    weeklySchedule: { day: number; startTime: string; endTime: string; preference: AvailabilityPreference }[]
  ): Promise<StaffAvailability[]> {
    // Delete existing availability
    await (supabase.from('staff_availability') as any)
      .delete()
      .eq('staff_profile_id', staffProfileId);

    // Insert new availability
    const results: StaffAvailability[] = [];
    for (const slot of weeklySchedule) {
      const availability = await this.create(
        staffProfileId,
        organizationId,
        slot.day,
        slot.startTime,
        slot.endTime,
        slot.preference
      );
      results.push(availability);
    }

    return results;
  }
}

export const availabilityService = new AvailabilityService();
