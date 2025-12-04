/**
 * Staff Module - Type Definitions
 * @module staff/types
 * @version 1.0.0
 */

// ============================================================================
// Role Types
// ============================================================================

export type StaffRole = 'super-admin' | 'org-admin' | 'admin' | 'manager' | 'staff';
export type StaffStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// ============================================================================
// Staff Member Types
// ============================================================================

export interface StaffMember {
  id: string;
  userId: string;
  organizationId: string;
  
  // User info (from users table)
  email: string;
  fullName: string;
  role: StaffRole;
  isActive: boolean;
  
  // Profile info
  department?: string;
  jobTitle?: string;
  phone?: string;
  hireDate?: string;
  employeeId?: string;
  
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Assignments
  assignedActivities: string[];
  assignedVenues: string[];
  skills: string[];
  
  // Display
  avatarUrl?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface DBStaffMember {
  id: string;
  user_id: string;
  organization_id: string;
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
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// Form Types
// ============================================================================

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
}

// ============================================================================
// Filter & Stats Types
// ============================================================================

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

// ============================================================================
// Time Entry Types
// ============================================================================

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

// ============================================================================
// Constants
// ============================================================================

export const STAFF_ROLES: { value: StaffRole; label: string; icon: string }[] = [
  { value: 'super-admin', label: 'Super Admin', icon: '👑' },
  { value: 'org-admin', label: 'Org Admin', icon: '🏢' },
  { value: 'admin', label: 'Admin', icon: '🔐' },
  { value: 'manager', label: 'Manager', icon: '📋' },
  { value: 'staff', label: 'Staff', icon: '👤' },
];

export const DEPARTMENTS = [
  'Operations',
  'Customer Service',
  'Game Master',
  'Sales & Marketing',
  'Maintenance',
  'Administration',
  'Finance',
  'IT Support',
];

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
};
