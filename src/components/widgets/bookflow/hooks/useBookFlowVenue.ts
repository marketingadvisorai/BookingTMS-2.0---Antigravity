/**
 * BookFlow Widget - Venue Data Hook
 * @module widgets/bookflow/hooks/useBookFlowVenue
 */

import { useState, useEffect, useCallback } from 'react';
import { bookflowService } from '../services/bookflow.service';
import type { BookFlowVenue } from '../types';

interface UseBookFlowVenueOptions {
  venueId: string;
  autoLoad?: boolean;
}

interface UseBookFlowVenueReturn {
  venue: BookFlowVenue | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBookFlowVenue(
  options: UseBookFlowVenueOptions
): UseBookFlowVenueReturn {
  const { venueId, autoLoad = true } = options;

  const [venue, setVenue] = useState<BookFlowVenue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadVenue = useCallback(async () => {
    if (!venueId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await bookflowService.getVenue(venueId);
      if (!data) {
        throw new Error('Venue not found');
      }
      setVenue(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load venue'));
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    if (autoLoad && venueId) {
      loadVenue();
    }
  }, [autoLoad, venueId, loadVenue]);

  return {
    venue,
    loading,
    error,
    refresh: loadVenue,
  };
}
