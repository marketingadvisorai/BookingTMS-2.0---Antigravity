/**
 * Staff Query Service
 * List and stats operations for staff management
 * @module staff/services/staffQuery.service
 */

import { supabase } from '@/lib/supabase/client';
import { StaffMember, DBStaffMember, StaffStats, StaffFilters } from '../types';
import { mapDBStaffToUI } from '../utils/mappers';

export interface ListStaffOptions {
  organizationId?: string; // Optional for system admins viewing all
  filters?: StaffFilters;
  limit?: number;
  offset?: number;
  viewAllOrgs?: boolean; // System admin flag to view all organizations
}

class StaffQueryService {
  /**
   * List staff members using RPC function v2
   * Uses get_staff_members_v2 which includes organization_id and organization_name
   * System admins can use viewAllOrgs=true to see all staff across organizations
   */
  async list(options: ListStaffOptions): Promise<StaffMember[]> {
    const { organizationId, filters, limit = 100, offset = 0, viewAllOrgs = false } = options;

    let data: DBStaffMember[] | null = null;
    let error: any = null;

    // System admin viewing all organizations
    if (viewAllOrgs) {
      console.log('[StaffQueryService] Fetching all staff members for system admin');
      const result = await (supabase.rpc as any)('get_all_staff_members');
      data = result.data;
      error = result.error;
      
      // Fallback if function doesn't exist or access denied
      if (error) {
        console.warn('[StaffQueryService] get_all_staff_members error:', error.message);
        // Fallback: query staff_profiles directly with join
        // Using separate queries to avoid RLS issues with joins
        const staffResult = await supabase
          .from('staff_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (staffResult.error) {
          console.error('[StaffQueryService] Staff profiles query failed:', staffResult.error);
          throw new Error(staffResult.error.message);
        }

        // Get user details for each staff profile
        const userIds = (staffResult.data || []).map((sp: any) => sp.user_id);
        const orgIds = [...new Set((staffResult.data || []).map((sp: any) => sp.organization_id).filter(Boolean))];
        
        const [usersResult, orgsResult] = await Promise.all([
          userIds.length > 0 
            ? supabase.from('users').select('id, email, full_name, role, is_active, avatar_url').in('id', userIds)
            : Promise.resolve({ data: [], error: null }),
          orgIds.length > 0
            ? supabase.from('organizations').select('id, name').in('id', orgIds)
            : Promise.resolve({ data: [], error: null })
        ]);

        const usersMap = new Map((usersResult.data || []).map((u: any) => [u.id, u]));
        const orgsMap = new Map((orgsResult.data || []).map((o: any) => [o.id, o]));

        // Transform to expected format
        data = (staffResult.data || []).map((row: any) => {
          const user = usersMap.get(row.user_id) || {};
          const org = orgsMap.get(row.organization_id) || {};
          return {
            id: row.id,
            user_id: row.user_id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            is_active: user.is_active,
            organization_id: row.organization_id,
            organization_name: org.name,
            department: row.department,
            job_title: row.job_title,
            phone: row.phone,
            hire_date: row.hire_date,
            avatar_url: row.avatar_url || user.avatar_url,
            assigned_activities: row.assigned_activities || [],
            assigned_venues: row.assigned_venues || [],
            skills: row.skills || [],
            created_at: row.created_at,
          };
        }).filter((s: any) => s.email); // Filter out any without user data
        
        error = null;
        console.log('[StaffQueryService] Fallback query returned', data.length, 'staff members');
      }
    } else if (organizationId) {
      // Regular org-scoped query
      const result = await (supabase.rpc as any)('get_staff_members_v2', {
        p_organization_id: organizationId,
      });
      
      if (result.error && result.error.message?.includes('function') && result.error.message?.includes('does not exist')) {
        // Fallback to v1 if v2 doesn't exist
        const fallback = await (supabase.rpc as any)('get_staff_members', {
          p_organization_id: organizationId,
        });
        data = fallback.data;
        error = fallback.error;
      } else {
        data = result.data;
        error = result.error;
      }
    } else {
      // No org ID and not viewing all - return empty
      return [];
    }

    if (error) {
      console.error('Error fetching staff:', error);
      throw new Error(error.message);
    }

    let staffList = ((data || []) as DBStaffMember[]).map(mapDBStaffToUI);

    // Apply client-side filters
    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        staffList = staffList.filter(
          (s) => s.fullName.toLowerCase().includes(search) || 
                 s.email.toLowerCase().includes(search) ||
                 (s.organizationName && s.organizationName.toLowerCase().includes(search))
        );
      }
      if (filters.role && filters.role !== 'all') {
        staffList = staffList.filter((s) => s.role === filters.role);
      }
      if (filters.status && filters.status !== 'all') {
        staffList = staffList.filter((s) => (filters.status === 'active' ? s.isActive : !s.isActive));
      }
      if (filters.department) {
        staffList = staffList.filter((s) => s.department === filters.department);
      }
    }

    return staffList.slice(offset, offset + limit);
  }

  /**
   * Get staff statistics
   */
  async getStats(organizationId: string): Promise<StaffStats> {
    const { data, error } = await (supabase.rpc as any)('get_staff_stats', {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('Error fetching staff stats:', error);
      return { total: 0, active: 0, byRole: {}, byDepartment: {}, avgHoursThisMonth: 0 };
    }

    const row = (data?.[0] || data || {}) as any;
    return {
      total: row.total_staff || 0,
      active: row.active_staff || 0,
      byRole: row.by_role || {},
      byDepartment: row.by_department || {},
      avgHoursThisMonth: row.avg_hours_this_month || 0,
    };
  }

  /**
   * Get unique departments
   */
  async getDepartments(organizationId: string): Promise<string[]> {
    const { data, error } = await (supabase.from('staff_profiles') as any)
      .select('department')
      .eq('organization_id', organizationId)
      .not('department', 'is', null);

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    const unique = [...new Set((data || []).map((d: any) => d.department).filter(Boolean))] as string[];
    return unique.sort();
  }
}

export const staffQueryService = new StaffQueryService();
