/**
 * Staff Module - Role Definitions
 * @module staff/constants/roles
 */

export type StaffRole = 'system-admin' | 'super-admin' | 'org-admin' | 'admin' | 'manager' | 'staff';

export const ROLE_HIERARCHY: Record<StaffRole, number> = {
  'system-admin': 0,
  'super-admin': 1,
  'org-admin': 2,
  'admin': 3,
  'manager': 4,
  'staff': 5,
};

export const STAFF_ROLES: { value: StaffRole; label: string; icon: string; level: number }[] = [
  { value: 'system-admin', label: 'System Admin', icon: '🔐', level: 0 },
  { value: 'super-admin', label: 'Super Admin', icon: '👑', level: 1 },
  { value: 'org-admin', label: 'Org Admin', icon: '🏢', level: 2 },
  { value: 'admin', label: 'Admin', icon: '⚙️', level: 3 },
  { value: 'manager', label: 'Manager', icon: '👔', level: 4 },
  { value: 'staff', label: 'Staff', icon: '👤', level: 5 },
];

export const DEPARTMENTS = [
  'Operations',
  'Management',
  'Customer Service',
  'Maintenance',
  'Marketing',
  'Finance',
  'IT',
  'Other',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export function getRoleLabel(role: StaffRole): string {
  return STAFF_ROLES.find((r) => r.value === role)?.label || role;
}

export function getRoleLevel(role: StaffRole): number {
  return ROLE_HIERARCHY[role] ?? 5;
}

export function canAssignRole(userRole: StaffRole, targetRole: StaffRole): boolean {
  return getRoleLevel(userRole) < getRoleLevel(targetRole);
}

export function getAssignableRoles(userRole: StaffRole): StaffRole[] {
  const userLevel = getRoleLevel(userRole);
  return STAFF_ROLES.filter((r) => r.level > userLevel).map((r) => r.value);
}
