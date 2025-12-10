/**
 * Staff Assignments Hook
 * Manage staff activity/venue assignments
 * @module staff/hooks/useStaffAssignments
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { StaffAssignment, AssignmentFormData } from '../types';
import { assignmentService } from '../services';

export interface UseStaffAssignmentsOptions {
  staffProfileId?: string;
  organizationId?: string;
  autoFetch?: boolean;
}

export interface UseStaffAssignmentsReturn {
  assignments: StaffAssignment[];
  loading: boolean;
  error: string | null;
  createAssignment: (data: AssignmentFormData, createdBy: string) => Promise<StaffAssignment>;
  updateAssignment: (id: string, data: Partial<AssignmentFormData>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useStaffAssignments(
  options: UseStaffAssignmentsOptions = {}
): UseStaffAssignmentsReturn {
  const { staffProfileId, organizationId, autoFetch = true } = options;

  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await assignmentService.list(staffProfileId, organizationId);
      if (mountedRef.current) {
        setAssignments(data);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message);
        toast.error('Failed to load assignments');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [staffProfileId, organizationId]);

  const createAssignment = useCallback(
    async (data: AssignmentFormData, createdBy: string) => {
      if (!staffProfileId || !organizationId) {
        throw new Error('Staff profile and organization ID required');
      }

      const result = await assignmentService.create(staffProfileId, organizationId, data, createdBy);
      toast.success('Assignment created successfully');
      await refresh();
      return result;
    },
    [staffProfileId, organizationId, refresh]
  );

  const updateAssignment = useCallback(
    async (id: string, data: Partial<AssignmentFormData>) => {
      await assignmentService.update(id, data);
      toast.success('Assignment updated successfully');
      await refresh();
    },
    [refresh]
  );

  const deleteAssignment = useCallback(
    async (id: string) => {
      await assignmentService.delete(id);
      toast.success('Assignment removed');
      await refresh();
    },
    [refresh]
  );

  // Real-time subscription
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase.channel('staff-assignments-changes');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_assignments' }, () => {
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
  }, [organizationId, refresh]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch) refresh();
    return () => { mountedRef.current = false; };
  }, [autoFetch, refresh]);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refresh,
  };
}
