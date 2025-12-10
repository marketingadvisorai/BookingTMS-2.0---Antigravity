/**
 * Staff Module - Data Mappers
 * Converts between database (snake_case) and UI (camelCase) formats
 * @module staff/utils/mappers
 */

import {
  StaffMember,
  DBStaffMember,
  StaffFormData,
  StaffUpdateData,
  TimeEntry,
  DBTimeEntry,
  StaffRole,
} from '../types';

// ============================================================================
// Staff Member Mappers
// ============================================================================

export function mapDBStaffToUI(db: DBStaffMember): StaffMember {
  return {
    id: db.id,
    userId: db.user_id,
    organizationId: db.organization_id,
    organizationName: db.organization_name,
    email: db.email || '',
    fullName: db.full_name || '',
    role: db.role || 'staff',
    isActive: db.is_active ?? true,
    department: db.department,
    jobTitle: db.job_title,
    phone: db.phone,
    hireDate: db.hire_date,
    employeeId: db.employee_id,
    emergencyContactName: db.emergency_contact_name,
    emergencyContactPhone: db.emergency_contact_phone,
    assignedActivities: db.assigned_activities || [],
    assignedVenues: db.assigned_venues || [],
    skills: db.skills || [],
    avatarUrl: db.avatar_url,
    notes: db.notes,
    createdAt: db.created_at,
    updatedAt: db.updated_at || db.created_at,
  };
}

export function mapUIStaffToDBInsert(
  data: StaffFormData,
  organizationId: string,
  userId: string
): Record<string, unknown> {
  return {
    user_id: userId,
    organization_id: organizationId,
    department: data.department || null,
    job_title: data.jobTitle || null,
    phone: data.phone || null,
    hire_date: data.hireDate || null,
    employee_id: data.employeeId || null,
    emergency_contact_name: data.emergencyContactName || null,
    emergency_contact_phone: data.emergencyContactPhone || null,
    assigned_activities: data.assignedActivities || [],
    assigned_venues: data.assignedVenues || [],
    skills: data.skills || [],
    avatar_url: data.avatarUrl || null,
    notes: data.notes || null,
  };
}

export function mapUIStaffToDBUpdate(data: StaffUpdateData): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (data.department !== undefined) update.department = data.department;
  if (data.jobTitle !== undefined) update.job_title = data.jobTitle;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.hireDate !== undefined) update.hire_date = data.hireDate;
  if (data.employeeId !== undefined) update.employee_id = data.employeeId;
  if (data.emergencyContactName !== undefined) {
    update.emergency_contact_name = data.emergencyContactName;
  }
  if (data.emergencyContactPhone !== undefined) {
    update.emergency_contact_phone = data.emergencyContactPhone;
  }
  if (data.assignedActivities !== undefined) {
    update.assigned_activities = data.assignedActivities;
  }
  if (data.assignedVenues !== undefined) {
    update.assigned_venues = data.assignedVenues;
  }
  if (data.skills !== undefined) update.skills = data.skills;
  if (data.avatarUrl !== undefined) update.avatar_url = data.avatarUrl;
  if (data.notes !== undefined) update.notes = data.notes;

  return update;
}

// ============================================================================
// Time Entry Mappers
// ============================================================================

export function mapDBTimeEntryToUI(db: DBTimeEntry): TimeEntry {
  return {
    id: db.id,
    staffProfileId: db.staff_profile_id,
    organizationId: db.organization_id,
    clockIn: db.clock_in,
    clockOut: db.clock_out,
    breakMinutes: db.break_minutes || 0,
    activityId: db.activity_id,
    bookingId: db.booking_id,
    notes: db.notes,
    status: db.status || 'active',
    createdAt: db.created_at,
  };
}

// ============================================================================
// Display Helpers
// ============================================================================

export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDisplayDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleColor(role: StaffRole, isDark: boolean): string {
  const colors: Record<StaffRole, { light: string; dark: string }> = {
    'system-admin': {
      light: 'bg-amber-100 text-amber-700 border-amber-200',
      dark: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    'super-admin': {
      light: 'bg-purple-100 text-purple-700 border-purple-200',
      dark: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    'org-admin': {
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    admin: {
      light: 'bg-red-100 text-red-700 border-red-200',
      dark: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    manager: {
      light: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      dark: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    staff: {
      light: 'bg-gray-100 text-gray-700 border-gray-200',
      dark: 'bg-[#2a2a2a] text-[#a3a3a3] border-[#2a2a2a]',
    },
  };

  const color = colors[role] || colors.staff;
  return isDark ? color.dark : color.light;
}

export function getStatusColor(isActive: boolean, isDark: boolean): string {
  if (isActive) {
    return isDark
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-green-100 text-green-700';
  }
  return isDark
    ? 'bg-red-500/20 text-red-400'
    : 'bg-red-100 text-red-700';
}

export function calculateHoursWorked(clockIn: string, clockOut?: string): number {
  const start = new Date(clockIn);
  const end = clockOut ? new Date(clockOut) : new Date();
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 10) / 10;
}
