/**
 * Staff Module - Assignment Types
 * @module staff/types/assignment
 */

export type AssignmentType = 'activity' | 'venue' | 'schedule';

export interface SchedulePattern {
  days: number[]; // 0-6 (Sun-Sat)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
}

export interface StaffAssignment {
  id: string;
  staffProfileId: string;
  organizationId: string;
  assignmentType: AssignmentType;
  activityId?: string;
  activityName?: string;
  venueId?: string;
  venueName?: string;
  schedulePattern: SchedulePattern;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  priority: number;
  createdAt: string;
}

export interface DBStaffAssignment {
  id: string;
  staff_profile_id: string;
  organization_id: string;
  assignment_type: AssignmentType;
  activity_id?: string;
  activity_name?: string;
  venue_id?: string;
  venue_name?: string;
  schedule_pattern: SchedulePattern;
  start_date: string;
  end_date?: string;
  is_primary: boolean;
  priority: number;
  created_at: string;
}

export interface AssignmentFormData {
  assignmentType: AssignmentType;
  activityId?: string;
  venueId?: string;
  schedulePattern: SchedulePattern;
  startDate: string;
  endDate?: string;
  isPrimary?: boolean;
}

export const DEFAULT_SCHEDULE_PATTERN: SchedulePattern = {
  days: [1, 2, 3, 4, 5], // Mon-Fri
  startTime: '09:00',
  endTime: '17:00',
  timezone: 'America/New_York',
};

export const DEFAULT_ASSIGNMENT_FORM: AssignmentFormData = {
  assignmentType: 'activity',
  schedulePattern: DEFAULT_SCHEDULE_PATTERN,
  startDate: new Date().toISOString().split('T')[0],
  isPrimary: false,
};
