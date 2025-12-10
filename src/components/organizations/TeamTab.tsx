/**
 * Team Tab Component
 * 
 * Displays organization team members with proper data fetching
 * Includes navigation to full Staff management page
 * 
 * @version 1.0.0
 * @date 2025-12-10
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Users,
  UserPlus,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Organization } from '@/features/system-admin/types';

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
}

interface TeamTabProps {
  organization: Organization;
  onManageStaff?: () => void;
}

export function TeamTab({ organization, onManageStaff }: TeamTabProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, get organization members
      const { data: orgMembersData, error: membersError } = await (supabase
        .from('organization_members') as any)
        .select('id, user_id, role, status')
        .eq('organization_id', organization.id);

      if (membersError) {
        console.error('[TeamTab] Error fetching org members:', membersError);
        throw new Error(membersError.message);
      }

      const orgMembers = (orgMembersData || []) as Array<{
        id: string;
        user_id: string;
        role: string;
        status: string;
      }>;

      if (orgMembers.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Get user IDs
      const userIds = orgMembers.map((m) => m.user_id);

      // Fetch user details
      const { data: usersData, error: usersError } = await (supabase
        .from('users') as any)
        .select('id, email, full_name, role, is_active, avatar_url, phone')
        .in('id', userIds);

      if (usersError) {
        console.error('[TeamTab] Error fetching users:', usersError);
        throw new Error(usersError.message);
      }

      const users = (usersData || []) as Array<{
        id: string;
        email: string;
        full_name: string;
        role: string;
        is_active: boolean;
        avatar_url?: string;
        phone?: string;
      }>;

      // Fetch staff profiles for additional details
      const { data: staffProfilesData } = await (supabase
        .from('staff_profiles') as any)
        .select('user_id, department, job_title')
        .in('user_id', userIds);

      const staffProfiles = (staffProfilesData || []) as Array<{
        user_id: string;
        department?: string;
        job_title?: string;
      }>;

      // Create a map for quick lookup
      const usersMap = new Map(users.map((u) => [u.id, u]));
      const staffMap = new Map(staffProfiles.map((s) => [s.user_id, s]));

      // Combine data
      const teamMembers: TeamMember[] = orgMembers
        .map((member) => {
          const user = usersMap.get(member.user_id);
          const staff = staffMap.get(member.user_id);

          if (!user) return null;

          return {
            id: member.id,
            userId: member.user_id,
            email: user.email || '',
            fullName: user.full_name || 'Unknown',
            role: user.role || member.role || 'staff',
            isActive: user.is_active ?? member.status === 'active',
            avatarUrl: user.avatar_url,
            phone: user.phone,
            department: staff?.department,
            jobTitle: staff?.job_title,
          };
        })
        .filter(Boolean) as TeamMember[];

      setMembers(teamMembers);
    } catch (err: any) {
      console.error('[TeamTab] Error:', err);
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization.id) {
      fetchTeamMembers();
    }
  }, [organization.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'system-admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400';
      case 'super-admin':
      case 'org-admin':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400';
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
      case 'manager':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
      case 'owner':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatRole = (role: string) => {
    return role
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Team Members
              </CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? 's' : ''} in this organization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTeamMembers}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {onManageStaff && (
                <Button
                  size="sm"
                  onClick={onManageStaff}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Staff
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-500">Loading team members...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">{error}</div>
              <Button variant="outline" size="sm" onClick={fetchTeamMembers}>
                Try Again
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No team members found</p>
              <p className="text-sm mt-1">Add staff members to this organization</p>
              {onManageStaff && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManageStaff}
                  className="mt-4"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        {getInitials(member.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                      {member.jobTitle && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {member.jobTitle}
                          {member.department && ` • ${member.department}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {formatRole(member.role)}
                    </Badge>
                    <Badge
                      variant={member.isActive ? 'default' : 'secondary'}
                      className={
                        member.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500'
                      }
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {members.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {members.filter((m) => m.isActive).length}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {members.filter((m) => m.role === 'admin' || m.role === 'org-admin').length}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Admins</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                {members.length}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-500">Total</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TeamTab;
