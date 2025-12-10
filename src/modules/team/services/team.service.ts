/**
 * Team Service
 * Handles team member CRUD operations via organization_members table
 * @module team/services/team.service
 */

import { supabase } from '@/lib/supabase/client';
import {
  TeamMember,
  DBTeamMember,
  TeamStats,
  TeamRole,
  TeamMemberStatus,
  DEFAULT_PERMISSIONS_BY_ROLE,
} from '../types';

/**
 * Map DB team member to UI format
 */
function mapDBTeamToUI(db: DBTeamMember): TeamMember {
  const role = (db.role || 'member') as TeamRole;
  return {
    id: db.id,
    organizationId: db.organization_id,
    userId: db.user_id,
    name: db.full_name || db.email || 'Unknown',
    email: db.email || '',
    phone: db.phone,
    role,
    status: (db.status as TeamMemberStatus) || 'active',
    avatarUrl: db.avatar_url,
    joinDate: db.joined_at || db.created_at,
    lastActive: db.last_sign_in_at,
    invitedBy: db.invited_by,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE[role] || DEFAULT_PERMISSIONS_BY_ROLE.member,
  };
}

class TeamService {
  /**
   * List team members for an organization
   */
  async list(organizationId: string): Promise<TeamMember[]> {
    // Query organization_members joined with users
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        organization_id,
        user_id,
        role,
        status,
        invited_by,
        joined_at,
        created_at,
        users:user_id (
          email,
          full_name,
          phone,
          avatar_url,
          is_active,
          last_sign_in_at
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
      throw new Error(error.message);
    }

    // Flatten the joined data
    const members = (data || []).map((row: any) => {
      const user = row.users || {};
      return mapDBTeamToUI({
        ...row,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        last_sign_in_at: user.last_sign_in_at,
      });
    });

    return members;
  }

  /**
   * Get team statistics
   */
  async getStats(organizationId: string): Promise<TeamStats> {
    const members = await this.list(organizationId);
    
    return {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      invited: members.filter(m => m.status === 'invited').length,
      managersAndAdmins: members.filter(m => 
        ['owner', 'super-admin', 'org-admin', 'admin', 'manager'].includes(m.role)
      ).length,
    };
  }

  /**
   * Invite a new team member
   */
  async invite(
    organizationId: string,
    email: string,
    role: TeamRole,
    invitedByUserId: string
  ): Promise<TeamMember> {
    // First check if user exists
    const { data: existingUser } = await (supabase
      .from('users') as any)
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Add existing user to organization
      const { data, error } = await (supabase
        .from('organization_members') as any)
        .insert({
          organization_id: organizationId,
          user_id: (existingUser as any).id,
          role,
          status: 'active',
          invited_by: invitedByUserId,
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      const members = await this.list(organizationId);
      return members.find(m => m.id === data.id)!;
    }

    // Create placeholder for invited user (actual user creation happens on invite accept)
    throw new Error('User invitation flow requires edge function - implement invite-team-member');
  }

  /**
   * Update team member role
   */
  async updateRole(memberId: string, newRole: TeamRole): Promise<void> {
    const { error } = await (supabase
      .from('organization_members') as any)
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) throw new Error(error.message);
  }

  /**
   * Update team member status
   */
  async updateStatus(memberId: string, status: TeamMemberStatus): Promise<void> {
    const { error } = await (supabase
      .from('organization_members') as any)
      .update({ status })
      .eq('id', memberId);

    if (error) throw new Error(error.message);
  }

  /**
   * Remove team member
   */
  async remove(memberId: string): Promise<void> {
    const { error } = await (supabase
      .from('organization_members') as any)
      .delete()
      .eq('id', memberId);

    if (error) throw new Error(error.message);
  }
}

export const teamService = new TeamService();
