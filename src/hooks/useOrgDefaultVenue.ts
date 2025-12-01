/**
 * Hook to get the current organization's default venue
 * 
 * For org-admins, automatically selects their default venue
 * so they don't need to manually select it when creating activities.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/AuthContext';

interface DefaultVenue {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  organizationName?: string;
}

interface UseOrgDefaultVenueResult {
  defaultVenue: DefaultVenue | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrgDefaultVenue(): UseOrgDefaultVenueResult {
  const { currentUser } = useAuth();
  const [defaultVenue, setDefaultVenue] = useState<DefaultVenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefaultVenue = async () => {
    if (!currentUser?.organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Query for default venue or first venue if no default set
      const { data, error: fetchError } = await supabase
        .from('venues')
        .select(`
          id,
          name,
          slug,
          organization_id,
          is_default,
          organizations (name)
        `)
        .eq('organization_id', currentUser.organizationId)
        .eq('status', 'active')
        .order('is_default', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (fetchError) {
        // No venue found is not an error for display
        if (fetchError.code === 'PGRST116') {
          console.log('[useOrgDefaultVenue] No venue found for org');
          setDefaultVenue(null);
        } else {
          throw fetchError;
        }
      } else if (data) {
        const venueData = data as {
          id: string;
          name: string;
          slug: string;
          organization_id: string;
          is_default: boolean;
          organizations: { name: string } | null;
        };
        setDefaultVenue({
          id: venueData.id,
          name: venueData.name,
          slug: venueData.slug,
          organizationId: venueData.organization_id,
          organizationName: venueData.organizations?.name,
        });
      }
    } catch (err: any) {
      console.error('[useOrgDefaultVenue] Error:', err);
      setError(err.message || 'Failed to fetch default venue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultVenue();
  }, [currentUser?.organizationId]);

  return {
    defaultVenue,
    isLoading,
    error,
    refetch: fetchDefaultVenue,
  };
}

export default useOrgDefaultVenue;
