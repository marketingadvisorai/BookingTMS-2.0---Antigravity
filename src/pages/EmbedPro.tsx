/**
 * Embed Pro 1.1 - Page Component
 * @module pages/EmbedPro
 */

import React, { useMemo } from 'react';
import { EmbedProDashboard } from '../modules/embed-pro';
import { useAuth } from '../lib/auth/AuthContext';
import { useActivities } from '../hooks/useActivities';
import { useVenues } from '../hooks/venue/useVenues';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

const EmbedProPage: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const { activities, loading: activitiesLoading } = useActivities();
  const { venues, loading: venuesLoading } = useVenues();

  // Get organization ID from user profile
  const organizationId = currentUser?.organizationId;

  // Prepare simplified lists for the dashboard
  const activityList = useMemo(() => 
    activities?.map(a => ({ id: a.id, name: a.name })) || [],
    [activities]
  );

  const venueList = useMemo(() => 
    venues?.map(v => ({ id: v.id, name: v.name })) || [],
    [venues]
  );

  // Loading state
  if (authLoading || activitiesLoading || venuesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading Embed Pro...</p>
        </div>
      </div>
    );
  }

  // No organization
  if (!organizationId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            You must be associated with an organization to use Embed Pro.
            Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <EmbedProDashboard
        organizationId={organizationId}
        activities={activityList}
        venues={venueList}
      />
    </div>
  );
};

export default EmbedProPage;
