/**
 * Staff Module - Core Staff Types
 * @module staff/types/staff
 */

import { StaffRole } from '../constants/roles';

export type StaffStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface StaffMember {
  id: string;
  userId: string;
  organizationId: string;
  organizationName?: string; // From get_staff_members_v2
  email: string;
  fullName: string;
  role: StaffRole;
  isActive: boolean;
  department?: string;
  jobTitle?: string;
  phone?: string;
  hireDate?: string;
  employeeId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedActivities: string[];
  assignedVenues: string[];
  skills: string[];
  avatarUrl?: string;
  notes?: string; // Bio/description
  createdAt: string;
  updatedAt: string;
}

export interface DBStaffMember {
  id: string;
  user_id: string;
  organization_id: string;
  organization_name?: string; // From get_staff_members_v2
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
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
  notes?: string; // Bio/description
  created_at: string;
  updated_at?: string;
}

export interface StaffFormData {
  email: string;
  fullName: string;
  role: StaffRole;
  department?: string;
  jobTitle?: string;
  phone?: string;
  hireDate?: string;
  employeeId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedActivities?: string[];
  assignedVenues?: string[];
  skills?: string[];
  password?: string;
  avatarUrl?: string; // Profile photo URL
  notes?: string; // Bio/description
}

export interface StaffUpdateData {
  fullName?: string;
  role?: StaffRole;
  department?: string;
  jobTitle?: string;
  phone?: string;
  hireDate?: string;
  employeeId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedActivities?: string[];
  assignedVenues?: string[];
  skills?: string[];
  isActive?: boolean;
  avatarUrl?: string; // Profile photo URL
  notes?: string; // Bio/description
}

export interface StaffFilters {
  search: string;
  role: 'all' | StaffRole;
  status: 'all' | 'active' | 'inactive';
  department?: string;
}

export interface StaffStats {
  total: number;
  active: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  avgHoursThisMonth: number;
}

export interface TimeEntry {
  id: string;
  staffProfileId: string;
  organizationId: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  activityId?: string;
  bookingId?: string;
  notes?: string;
  status: 'active' | 'completed' | 'void';
  createdAt: string;
}

export interface DBTimeEntry {
  id: string;
  staff_profile_id: string;
  organization_id: string;
  clock_in: string;
  clock_out?: string;
  break_minutes: number;
  activity_id?: string;
  booking_id?: string;
  notes?: string;
  status: 'active' | 'completed' | 'void';
  created_at: string;
}

export const DEFAULT_STAFF_FILTERS: StaffFilters = {
  search: '',
  role: 'all',
  status: 'all',
};

export const DEFAULT_STAFF_FORM: StaffFormData = {
  email: '',
  fullName: '',
  role: 'staff',
  department: '',
  jobTitle: '',
  phone: '',
  assignedActivities: [],
  assignedVenues: [],
  skills: [],
  notes: '',
};
