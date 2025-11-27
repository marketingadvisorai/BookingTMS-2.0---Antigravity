/**
 * BookFlow Widget - Time Slots Hook
 * @module widgets/bookflow/hooks/useBookFlowSlots
 */

import { useState, useEffect, useCallback } from 'react';
import { bookflowService } from '../services/bookflow.service';
import type { TimeSlot } from '../types';

interface UseBookFlowSlotsOptions {
  activityId: string | null;
  selectedDate: Date | null;
}

interface UseBookFlowSlotsReturn {
  slots: TimeSlot[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBookFlowSlots(
  options: UseBookFlowSlotsOptions
): UseBookFlowSlotsReturn {
  const { activityId, selectedDate } = options;

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSlots = useCallback(async () => {
    if (!activityId || !selectedDate) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await bookflowService.getAvailableSlots(activityId, selectedDate);
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load slots'));
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [activityId, selectedDate]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  return {
    slots,
    loading,
    error,
    refresh: loadSlots,
  };
}
