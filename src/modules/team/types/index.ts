/**
 * Team Module - Types
 * @module team/types
 */

export type TeamRole = 'owner' | 'super-admin' | 'org-admin' | 'admin' | 'manager' | 'staff' | 'member';
export type TeamMemberStatus = 'active' | 'inactive' | 'invited' | 'suspended';

export interface TeamMember {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  avatarUrl?: string;
  joinDate?: string;
  lastActive?: string;
  invitedBy?: string;
  permissions: TeamPermissions;
}

export interface TeamPermissions {
  bookings: boolean;
  activities: boolean;
  staff: boolean;
  reports: boolean;
  billing: boolean;
  settings: boolean;
}

export interface DBTeamMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  invited_by?: string;
  joined_at?: string;
  created_at: string;
  // Joined from users table
  email?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
  last_sign_in_at?: string;
}

export interface TeamStats {
  total: number;
  active: number;
  invited: number;
  managersAndAdmins: number;
}

export interface TeamFilters {
  search: string;
  role: 'all' | TeamRole;
  status: 'all' | TeamMemberStatus;
}

export const DEFAULT_TEAM_FILTERS: TeamFilters = {
  search: '',
  role: 'all',
  status: 'all',
};

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<TeamRole, TeamPermissions> = {
  owner: { bookings: true, activities: true, staff: true, reports: true, billing: true, settings: true },
  'super-admin': { bookings: true, activities: true, staff: true, reports: true, billing: true, settings: true },
  'org-admin': { bookings: true, activities: true, staff: true, reports: true, billing: false, settings: true },
  admin: { bookings: true, activities: true, staff: true, reports: true, billing: false, settings: true },
  manager: { bookings: true, activities: true, staff: false, reports: true, billing: false, settings: false },
  staff: { bookings: true, activities: false, staff: false, reports: false, billing: false, settings: false },
  member: { bookings: true, activities: false, staff: false, reports: false, billing: false, settings: false },
};
