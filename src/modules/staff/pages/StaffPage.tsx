/**
 * Staff Page
 * Main staff management page component
 * System admins can select organization to view staff
 * @module staff/pages/StaffPage
 */

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Building2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/AuthContext';
import { useStaff } from '../hooks/useStaff';
import { StaffMember, StaffFormData } from '../types';
import {
  StaffStatsCards,
  StaffFilters,
  StaffTable,
  AddStaffDialog,
  ViewStaffDialog,
  DeleteStaffDialog,
  OrganizationSelector,
} from '../components';

export function StaffPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();
  
  const isSystemAdmin = currentUser?.role === 'system-admin';
  
  // Organization selection for system admins
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    currentUser?.organizationId || ''
  );

  // Use modular staff hook with selected organization
  const {
    staff,
    stats,
    loading,
    filters,
    setFilters,
    clearFilters,
    createStaff,
    toggleStatus,
    deleteStaff,
    refreshStaff,
    refreshStats,
  } = useStaff({ organizationId: selectedOrgId });

  // Loading timeout - force recovery after 15 seconds
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (loading) {
      timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000);
    } else {
      setLoadingTimeout(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoadingTimeout(false);
    try {
      await Promise.all([refreshStaff(), refreshStats()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Handlers
  const handleView = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (member: StaffMember) => {
    // For now, open view dialog - edit can be added later
    setSelectedStaff(member);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    await deleteStaff(selectedStaff.userId);
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    await toggleStatus(userId, isActive);
  };

  const handleAddStaff = async (data: StaffFormData, password: string, organizationId: string) => {
    await createStaff(data, password, organizationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Staff Management"
        description="Manage your team members and their roles"
        sticky
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`gap-2 ${isDark ? 'border-[#2a2a2a] text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <PermissionGuard permissions={['staff.create']}>
              <Button
                style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                onClick={() => setIsAddDialogOpen(true)}
                disabled={isSystemAdmin && !selectedOrgId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      {/* Organization Selector for System Admins */}
      {isSystemAdmin && (
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <Building2 className={`w-5 h-5 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-500'}`} />
            <div className="flex-1 max-w-md">
              <OrganizationSelector
                value={selectedOrgId}
                onChange={setSelectedOrgId}
                isDark={isDark}
              />
            </div>
            {!selectedOrgId && (
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <AlertCircle className="w-4 h-4" />
                Select an organization to view and manage staff
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaffStatsCards stats={stats} isDark={isDark} />

      {/* Filters */}
      <StaffFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClear={clearFilters}
        isDark={isDark}
      />

      {/* Staff Table */}
      {loadingTimeout ? (
        <div className={`rounded-lg border p-8 text-center ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
          <div className={`text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading is taking longer than expected
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
            There might be a connection issue. Click the button below to retry.
          </p>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry Loading
          </Button>
        </div>
      ) : (
        <StaffTable
          staff={staff}
          loading={loading}
          isDark={isDark}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Dialogs */}
      <AddStaffDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddStaff}
        isDark={isDark}
        defaultOrganizationId={selectedOrgId}
      />

      <ViewStaffDialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
        isDark={isDark}
      />

      <DeleteStaffDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleDeleteConfirm}
        staff={selectedStaff}
        isDark={isDark}
      />
    </div>
  );
}
