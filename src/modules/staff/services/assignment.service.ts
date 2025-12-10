/**
 * Staff Assignment Service
 * CRUD operations for staff activity/venue assignments
 * @module staff/services/assignment
 */

import { supabase } from '@/lib/supabase/client';
import {
  StaffAssignment,
  DBStaffAssignment,
  AssignmentFormData,
  AssignmentType,
} from '../types';

function mapDBToUI(db: DBStaffAssignment): StaffAssignment {
  return {
    id: db.id,
    staffProfileId: db.staff_profile_id,
    organizationId: db.organization_id,
    assignmentType: db.assignment_type,
    activityId: db.activity_id,
    activityName: db.activity_name,
    venueId: db.venue_id,
    venueName: db.venue_name,
    schedulePattern: db.schedule_pattern,
    startDate: db.start_date,
    endDate: db.end_date,
    isPrimary: db.is_primary,
    priority: db.priority,
    createdAt: db.created_at,
  };
}

class AssignmentService {
  async list(
    staffProfileId?: string,
    organizationId?: string,
    type?: AssignmentType
  ): Promise<StaffAssignment[]> {
    const { data, error } = await (supabase.rpc as any)('get_staff_assignments', {
      p_staff_profile_id: staffProfileId || null,
      p_organization_id: organizationId || null,
      p_assignment_type: type || null,
    });

    if (error) {
      console.error('Error fetching assignments:', error);
      throw new Error(error.message);
    }

    return ((data || []) as DBStaffAssignment[]).map(mapDBToUI);
  }

  async create(
    staffProfileId: string,
    organizationId: string,
    formData: AssignmentFormData,
    createdBy: string
  ): Promise<StaffAssignment> {
    const { data, error } = await (supabase.from('staff_assignments') as any)
      .insert({
        staff_profile_id: staffProfileId,
        organization_id: organizationId,
        assignment_type: formData.assignmentType,
        activity_id: formData.activityId || null,
        venue_id: formData.venueId || null,
        schedule_pattern: formData.schedulePattern,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        is_primary: formData.isPrimary || false,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      throw new Error(error.message);
    }

    return mapDBToUI(data);
  }

  async update(id: string, updates: Partial<AssignmentFormData>): Promise<StaffAssignment> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.assignmentType) dbUpdates.assignment_type = updates.assignmentType;
    if (updates.activityId !== undefined) dbUpdates.activity_id = updates.activityId;
    if (updates.venueId !== undefined) dbUpdates.venue_id = updates.venueId;
    if (updates.schedulePattern) dbUpdates.schedule_pattern = updates.schedulePattern;
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.isPrimary !== undefined) dbUpdates.is_primary = updates.isPrimary;

    const { data, error } = await (supabase.from('staff_assignments') as any)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating assignment:', error);
      throw new Error(error.message);
    }

    return mapDBToUI(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase.from('staff_assignments') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting assignment:', error);
      throw new Error(error.message);
    }
  }

  async getByActivity(activityId: string, organizationId: string): Promise<StaffAssignment[]> {
    return this.list(undefined, organizationId, 'activity').then((assignments) =>
      assignments.filter((a) => a.activityId === activityId)
    );
  }

  async getByVenue(venueId: string, organizationId: string): Promise<StaffAssignment[]> {
    return this.list(undefined, organizationId, 'venue').then((assignments) =>
      assignments.filter((a) => a.venueId === venueId)
    );
  }
}

export const assignmentService = new AssignmentService();
