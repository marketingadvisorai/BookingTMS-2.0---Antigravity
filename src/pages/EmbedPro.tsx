/**
 * Embed Pro 1.1 - Page Component
 * @module pages/EmbedPro
 * 
 * Fetches activities and venues for the current/selected organization
 * and passes them to the EmbedProDashboard component.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EmbedProDashboard } from '../modules/embed-pro';
import { useAuth } from '../lib/auth/AuthContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';

interface Organization {
  id: string;
  name: string;
  status?: string;
}

interface SimpleActivity {
  id: string;
  name: string;
}

interface SimpleVenue {
  id: string;
  name: string;
}

const EmbedProPage: React.FC = () => {
  const { currentUser, isLoading: authLoading, isRole } = useAuth();
  
  // Data states
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activities, setActivities] = useState<SimpleActivity[]>([]);
  const [venues, setVenues] = useState<SimpleVenue[]>([]);
  
  // Loading states
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Selection state for system admins
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const isSystemAdmin = isRole('system-admin');

  // Get organization ID - either from user or from selection (for system admins)
  const organizationId = isSystemAdmin 
    ? selectedOrgId 
    : (currentUser?.organizationId || null);

  // Fetch organizations for system admins
  useEffect(() => {
    if (isSystemAdmin) {
      const fetchOrgs = async () => {
        setOrgsLoading(true);
        try {
          // Include all organizations (not just active) so system admins can manage all embeds
          const { data } = await supabase
            .from('organizations')
            .select('id, name, status')
            .in('status', ['active', 'pending', 'inactive'])
            .order('name');
          const orgData = (data as Organization[]) || [];
          setOrganizations(orgData);
          // Auto-select first org if none selected
          if (orgData.length > 0 && !selectedOrgId) {
            setSelectedOrgId(orgData[0].id);
          }
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        } finally {
          setOrgsLoading(false);
        }
      };
      fetchOrgs();
    }
  }, [isSystemAdmin]);

  // Fetch activities and venues for the selected organization
  const fetchOrgData = useCallback(async (orgId: string) => {
    setDataLoading(true);
    try {
      // Fetch activities for this organization
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('name');
      
      if (activityError) {
        console.error('Failed to fetch activities:', activityError);
      } else {
        setActivities(activityData || []);
      }

      // Fetch venues for this organization
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('name');
      
      if (venueError) {
        console.error('Failed to fetch venues:', venueError);
      } else {
        setVenues(venueData || []);
      }
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch data when organization changes
  useEffect(() => {
    if (organizationId) {
      fetchOrgData(organizationId);
    } else {
      // Clear data if no organization
      setActivities([]);
      setVenues([]);
    }
  }, [organizationId, fetchOrgData]);

  // Loading state
  if (authLoading || orgsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading Embed Pro...</p>
        </div>
      </div>
    );
  }

  // System admin organization selector
  const renderOrgSelector = () => {
    if (!isSystemAdmin) return null;
    
    return (
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Select Organization
            </Label>
            <Select value={selectedOrgId || ''} onValueChange={setSelectedOrgId}>
              <SelectTrigger className="mt-1 w-full max-w-sm">
                <SelectValue placeholder="Choose organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    <span className="flex items-center gap-2">
                      {org.name}
                      {org.status && org.status !== 'active' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          org.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {org.status}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  // No organization for non-system-admins
  if (!organizationId && !isSystemAdmin) {
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

  // No organizations available
  if (isSystemAdmin && organizations.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <Building2 className="w-4 h-4" />
          <AlertDescription>
            No organizations found. Create an organization first to use Embed Pro.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get selected organization name for display
  const selectedOrgName = organizations.find(o => o.id === selectedOrgId)?.name;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderOrgSelector()}
      {organizationId && (
        <EmbedProDashboard
          key={organizationId} // Force re-mount on organization change
          organizationId={organizationId}
          organizationName={isSystemAdmin ? selectedOrgName : undefined}
          activities={activities}
          venues={venues}
          isLoading={dataLoading}
          isSystemAdmin={isSystemAdmin}
        />
      )}
    </div>
  );
};

export default EmbedProPage;
