/**
 * Staff Module - Schedule & Shift Types
 * @module staff/types/schedule
 */

export type ShiftStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AvailabilityPreference = 'preferred' | 'available' | 'if_needed' | 'unavailable';

export interface StaffShift {
  id: string;
  staffProfileId: string;
  staffName?: string;
  organizationId: string;
  assignmentId?: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  status: ShiftStatus;
  activityId?: string;
  activityName?: string;
  bookingIds: string[];
  notes?: string;
  swapRequested: boolean;
  swapRequestedWith?: string;
  swapApprovedBy?: string;
  createdAt: string;
}

export interface DBStaffShift {
  id: string;
  staff_profile_id: string;
  staff_name?: string;
  organization_id: string;
  assignment_id?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  status: ShiftStatus;
  activity_id?: string;
  activity_name?: string;
  booking_ids: string[];
  notes?: string;
  swap_requested: boolean;
  swap_requested_with?: string;
  swap_approved_by?: string;
  created_at: string;
}

export interface StaffAvailability {
  id: string;
  staffProfileId: string;
  organizationId: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  preference: AvailabilityPreference;
  effectiveFrom: string;
  effectiveUntil?: string;
  notes?: string;
}

export interface DBStaffAvailability {
  id: string;
  staff_profile_id: string;
  organization_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  preference: AvailabilityPreference;
  effective_from: string;
  effective_until?: string;
  notes?: string;
}

export interface ShiftFormData {
  shiftDate: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  activityId?: string;
  assignmentId?: string;
  notes?: string;
}

export interface AvailableStaff {
  staffProfileId: string;
  userId: string;
  fullName: string;
  role: string;
  isAvailable: boolean;
  preference: AvailabilityPreference;
  hasConflict: boolean;
}
