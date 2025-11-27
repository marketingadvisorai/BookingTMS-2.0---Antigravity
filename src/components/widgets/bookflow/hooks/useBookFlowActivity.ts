/**
 * BookFlow Widget - Activity Data Hook
 * @module widgets/bookflow/hooks/useBookFlowActivity
 */

import { useState, useEffect, useCallback } from 'react';
import { bookflowService } from '../services/bookflow.service';
import type { BookFlowActivity } from '../types';

interface UseBookFlowActivityOptions {
  activityId: string;
  autoLoad?: boolean;
}

interface UseBookFlowActivityReturn {
  activity: BookFlowActivity | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBookFlowActivity(
  options: UseBookFlowActivityOptions
): UseBookFlowActivityReturn {
  const { activityId, autoLoad = true } = options;

  const [activity, setActivity] = useState<BookFlowActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadActivity = useCallback(async () => {
    if (!activityId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await bookflowService.getActivity(activityId);
      if (!data) {
        throw new Error('Activity not found');
      }
      setActivity(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load activity'));
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    if (autoLoad && activityId) {
      loadActivity();
    }
  }, [autoLoad, activityId, loadActivity]);

  return {
    activity,
    loading,
    error,
    refresh: loadActivity,
  };
}
