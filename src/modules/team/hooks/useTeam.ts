/**
 * Team Hook
 * Provides team member management with real-time updates
 * @module team/hooks/useTeam
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { teamService } from '../services/team.service';
import {
  TeamMember,
  TeamStats,
  TeamFilters,
  TeamRole,
  TeamMemberStatus,
  DEFAULT_TEAM_FILTERS,
} from '../types';

export interface UseTeamOptions {
  organizationId?: string;
  autoFetch?: boolean;
  enableRealTime?: boolean;
}

export interface UseTeamReturn {
  members: TeamMember[];
  stats: TeamStats;
  loading: boolean;
  error: string | null;
  
  // Operations
  inviteMember: (email: string, role: TeamRole) => Promise<void>;
  updateRole: (memberId: string, role: TeamRole) => Promise<void>;
  updateStatus: (memberId: string, status: TeamMemberStatus) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  
  // Refresh
  refresh: () => Promise<void>;
  
  // Filters
  filters: TeamFilters;
  setFilters: (filters: TeamFilters) => void;
  filteredMembers: TeamMember[];
}

export function useTeam(options: UseTeamOptions = {}): UseTeamReturn {
  const { autoFetch = true, enableRealTime = true } = options;
  const { currentUser } = useAuth();
  const organizationId = options.organizationId || currentUser?.organizationId;

  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    total: 0,
    active: 0,
    invited: 0,
    managersAndAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TeamFilters>(DEFAULT_TEAM_FILTERS);

  // Refs
  const mountedRef = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh data
  const refresh = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const [membersData, statsData] = await Promise.all([
        teamService.list(organizationId),
        teamService.getStats(organizationId),
      ]);

      if (mountedRef.current) {
        setMembers(membersData);
        setStats(statsData);
      }
    } catch (err: any) {
      console.error('Error fetching team:', err);
      if (mountedRef.current) {
        setError(err.message);
        toast.error('Failed to load team members');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [organizationId]);

  // Invite member
  const inviteMember = useCallback(
    async (email: string, role: TeamRole) => {
      if (!organizationId || !currentUser?.id) {
        throw new Error('Organization or user not found');
      }

      await teamService.invite(organizationId, email, role, currentUser.id);
      toast.success(`Invitation sent to ${email}`);
      await refresh();
    },
    [organizationId, currentUser?.id, refresh]
  );

  // Update role
  const updateRole = useCallback(
    async (memberId: string, role: TeamRole) => {
      await teamService.updateRole(memberId, role);
      toast.success('Role updated successfully');
      await refresh();
    },
    [refresh]
  );

  // Update status
  const updateStatus = useCallback(
    async (memberId: string, status: TeamMemberStatus) => {
      await teamService.updateStatus(memberId, status);
      toast.success(`Member ${status === 'active' ? 'activated' : 'deactivated'}`);
      await refresh();
    },
    [refresh]
  );

  // Remove member
  const removeMember = useCallback(
    async (memberId: string) => {
      await teamService.remove(memberId);
      toast.success('Member removed from team');
      await refresh();
    },
    [refresh]
  );

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || member.role === filters.role;
    const matchesStatus = filters.status === 'all' || member.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Real-time subscription
  useEffect(() => {
    if (!enableRealTime || !organizationId) return;

    const channel = supabase.channel('team-changes');

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_members' }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) refresh();
        }, 500);
      })
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [enableRealTime, organizationId, refresh]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch && organizationId) {
      refresh();
    } else if (!organizationId) {
      setMembers([]);
      setStats({ total: 0, active: 0, invited: 0, managersAndAdmins: 0 });
      setLoading(false);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, organizationId, refresh]);

  return {
    members,
    stats,
    loading,
    error,
    inviteMember,
    updateRole,
    updateStatus,
    removeMember,
    refresh,
    filters,
    setFilters,
    filteredMembers,
  };
}
