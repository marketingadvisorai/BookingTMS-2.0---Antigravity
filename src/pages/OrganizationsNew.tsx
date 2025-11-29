/**
 * Organizations Management Page (Refactored)
 * 
 * Comprehensive organizations management for System Admin & Super Admin.
 * Features: CRUD operations, settings, billing, and analytics.
 * 
 * Components extracted to: /src/features/organizations/components/
 * - StatCard - Statistics display cards
 * - OrganizationCard - Grid view card
 * - OrganizationsTable - Table view
 * - OrganizationsLoadingSkeleton - Loading state
 * 
 * @version 0.1.57
 * @date 2025-11-30
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Building2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useOrganizations, usePlans } from '../features/system-admin/hooks';
import { OrganizationService } from '../features/system-admin/services';
import { OrganizationModal } from '../features/system-admin/components/organizations/OrganizationModal';
import { OrganizationSettingsModal } from '../components/organizations';
import { UserPasswordResetModal } from '../components/admin';
import { toast } from 'sonner';
import type { Organization, CreateOrganizationDTO } from '../features/system-admin/types';

// Import modular components
import {
  StatCard,
  OrganizationCard,
  OrganizationsTable,
  OrganizationsLoadingSkeleton,
  OrganizationsHeader,
  OrganizationsFilters,
  OrganizationsEmptyState,
  OrganizationsErrorCard,
} from '../features/organizations/components';

export function OrganizationsNew() {
  const { isRole } = useAuth();
  const isSystemAdmin = isRole('system-admin');
  const isSuperAdmin = isRole('super-admin');

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [resetUser, setResetUser] = useState<{ id: string; email: string; name: string } | null>(null);

  // Data hooks
  const { organizations = [], total = 0, isLoading, refetch, error } = useOrganizations(
    { 
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter as any : undefined,
    },
    currentPage,
    10
  );
  const { plans } = usePlans(true);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Stats
  const stats = useMemo(() => ({
    total: total || 0,
    active: organizations.filter(o => o.status === 'active').length,
    pending: organizations.filter(o => o.status === 'pending').length,
    suspended: organizations.filter(o => o.status === 'suspended').length,
  }), [organizations, total]);

  // Handlers
  const handleAdd = () => {
    setSelectedOrg(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setIsAddModalOpen(true);
  };

  const handleSettings = (org: Organization) => {
    setSelectedOrg(org);
    setIsSettingsModalOpen(true);
  };

  const handleResetPassword = (org: Organization) => {
    if (org.owner_email) {
      setResetUser({
        id: (org as any).owner_user_id || org.id,
        email: org.owner_email,
        name: org.owner_name || org.name,
      });
      setIsPasswordResetOpen(true);
    } else {
      toast.error('No owner email configured for this organization');
    }
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await OrganizationService.delete(org.id);
      toast.success(`Organization "${org.name}" deleted successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete organization');
    }
  };

  const handleSubmit = async (data: CreateOrganizationDTO & { initial_password?: string }) => {
    try {
      if (selectedOrg) {
        await OrganizationService.update(selectedOrg.id, {
          name: data.name,
          owner_name: data.owner_name,
          owner_email: data.owner_email,
          plan_id: data.plan_id,
          status: data.status === 'active' ? 'active' : data.status === 'pending' ? undefined : data.status as any,
        });
        toast.success('Organization updated successfully');
      } else {
        const result = await OrganizationService.createComplete(data, data.initial_password);
        if (result.admin_credentials?.temp_password) {
          toast.success(`Organization created! Temp password: ${result.admin_credentials.temp_password}`, { duration: 10000 });
        } else {
          toast.success('Organization created successfully');
        }
      }
      setIsAddModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
      throw error;
    }
  };

  // Access control
  if (!isSystemAdmin && !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
            <p className="text-gray-500 mt-2">
              You don't have permission to access Organizations management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#161616]">
      <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <OrganizationsHeader onAdd={handleAdd} />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Organizations" value={stats.total} icon={<Building2 className="h-5 w-5" />} color="indigo" />
          <StatCard title="Active" value={stats.active} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
          <StatCard title="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} color="amber" />
          <StatCard title="Suspended" value={stats.suspended} icon={<AlertTriangle className="h-5 w-5" />} color="red" />
        </div>

        {/* Filters */}
        <OrganizationsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
          onRefresh={refetch}
        />

        {/* Content */}
        {isLoading ? (
          <OrganizationsLoadingSkeleton viewMode={viewMode} />
        ) : error ? (
          <OrganizationsErrorCard error={error} onRetry={refetch} />
        ) : organizations.length === 0 ? (
          <OrganizationsEmptyState onAdd={handleAdd} />
        ) : viewMode === 'table' ? (
          <OrganizationsTable
            organizations={organizations}
            onEdit={handleEdit}
            onSettings={handleSettings}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onEdit={handleEdit}
                onSettings={handleSettings}
                onDelete={handleDelete}
                onResetPassword={handleResetPassword}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <OrganizationModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmit}
          organization={selectedOrg}
          plans={plans?.map(p => ({ id: p.id, name: p.name })) || []}
        />

        {selectedOrg && (
          <OrganizationSettingsModal
            open={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            organization={selectedOrg}
            onUpdate={() => { refetch(); setIsSettingsModalOpen(false); }}
          />
        )}

        <UserPasswordResetModal
          open={isPasswordResetOpen}
          onClose={() => { setIsPasswordResetOpen(false); setResetUser(null); }}
          user={resetUser}
        />
      </div>
    </div>
  );
}

export default OrganizationsNew;
