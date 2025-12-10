/**
 * Staff Query Service
 * List and stats operations for staff management
 * @module staff/services/staffQuery.service
 */

import { supabase } from '@/lib/supabase/client';
import { StaffMember, DBStaffMember, StaffStats, StaffFilters } from '../types';
import { mapDBStaffToUI } from '../utils/mappers';

export interface ListStaffOptions {
  organizationId: string;
  filters?: StaffFilters;
  limit?: number;
  offset?: number;
}

class StaffQueryService {
  /**
   * List staff members using RPC function
   */
  async list(options: ListStaffOptions): Promise<StaffMember[]> {
    const { organizationId, filters, limit = 100, offset = 0 } = options;

    const { data, error } = await (supabase.rpc as any)('get_staff_members', {
      p_organization_id: organizationId,
    });

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
          (s) => s.fullName.toLowerCase().includes(search) || s.email.toLowerCase().includes(search)
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
