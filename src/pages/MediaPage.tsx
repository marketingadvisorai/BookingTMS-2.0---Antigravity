/**
 * Media Page
 * 
 * Central media library with upload, management, and external storage integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import { MediaLibrary } from '../modules/media';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Loader2, Building2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
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

const MediaPage: React.FC = () => {
  const { currentUser, isLoading: authLoading, isRole } = useAuth();
  
  // Data states
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isSystemAdmin = isRole('system-admin');

  // Get organization ID - either from user or from selection (for system admins)
  const organizationId = isSystemAdmin 
    ? selectedOrgId 
    : (currentUser?.organizationId || null);

  // Fetch organizations for system admins
  const fetchOrgs = useCallback(async () => {
    if (!isSystemAdmin) return;
    setOrgsLoading(true);
    try {
      const { data } = await supabase
        .from('organizations')
        .select('id, name, status')
        .in('status', ['active', 'pending', 'inactive'])
        .order('name');
      const orgData = (data as Organization[]) || [];
      setOrganizations(orgData);
      if (orgData.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setOrgsLoading(false);
    }
  }, [isSystemAdmin, selectedOrgId]);

  useEffect(() => {
    fetchOrgs();
  }, [isSystemAdmin]);

  // Loading timeout - force recovery after 15 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (authLoading || orgsLoading) {
      timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000);
    } else {
      setLoadingTimeout(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, orgsLoading]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoadingTimeout(false);
    try {
      await fetchOrgs();
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state with timeout recovery
  if (authLoading || orgsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          {loadingTimeout ? (
            <>
              <div className="text-lg mb-2 text-gray-900 dark:text-white">
                Loading is taking longer than expected
              </div>
              <p className="text-sm mb-4 text-gray-500 dark:text-gray-400">
                There might be a connection issue. Click the button below to retry.
              </p>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry Loading
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading Media Library...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Organization selector for system admins
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
            You must be associated with an organization to access Media Library.
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
            No organizations found. Create an organization first to use Media Library.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderOrgSelector()}
      {organizationId && (
        <MediaLibrary
          key={organizationId}
          organizationId={organizationId}
          selectionMode="none"
        />
      )}
    </div>
  );
};

export default MediaPage;
