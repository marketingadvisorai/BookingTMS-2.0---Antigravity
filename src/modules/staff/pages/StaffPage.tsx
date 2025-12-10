/**
 * Staff Page
 * Main staff management page component
 * System admins can select organization to view staff
 * Supports URL params for org context: ?org={orgId}&orgName={orgName}
 * @module staff/pages/StaffPage
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Building2, AlertCircle, ArrowLeft, X } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  EditStaffDialog,
  ViewStaffDialog,
  DeleteStaffDialog,
  OrganizationSelector,
} from '../components';

export function StaffPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isSystemAdmin = currentUser?.role === 'system-admin';
  
  // Get organization context from URL params (if coming from Organizations page)
  const urlOrgId = searchParams.get('org');
  const urlOrgName = searchParams.get('orgName');
  
  // Organization selection for system admins
  // If URL has org param, use that; otherwise default to 'all' for system admins
  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
    if (urlOrgId) return urlOrgId;
    return isSystemAdmin ? 'all' : (currentUser?.organizationId || '');
  });
  
  // Track if we're in "filtered by organization" mode from URL
  const isFilteredFromOrg = !!urlOrgId;

  // Determine if viewing all organizations
  const viewAllOrgs = isSystemAdmin && selectedOrgId === 'all';
  const effectiveOrgId = selectedOrgId === 'all' ? undefined : selectedOrgId;

  // Use modular staff hook with selected organization or viewAllOrgs
  const {
    staff,
    stats,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    createStaff,
    updateStaff,
    toggleStatus,
    deleteStaff,
    deleteStaffPermanent,
    refreshStaff,
    refreshStats,
  } = useStaff({ 
    organizationId: effectiveOrgId, 
    viewAllOrgs 
  });

  // Loading timeout - force recovery after 15 seconds
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Clear organization filter (remove URL params)
  const clearOrgFilter = () => {
    setSearchParams({});
    setSelectedOrgId('all');
  };

  // Handle organization change from selector
  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    // Clear URL params when manually changing organization
    if (urlOrgId) {
      setSearchParams({});
    }
  };

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Handlers
  const handleView = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    await deleteStaffPermanent(selectedStaff.userId);
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    await toggleStatus(userId, isActive);
  };

  const handleAddStaff = async (data: StaffFormData, password: string, organizationId: string) => {
    await createStaff(data, password, organizationId);
  };

  const handleUpdateStaff = async (id: string, userId: string, updates: any) => {
    await updateStaff(id, userId, updates);
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Phone', 'Department', 'Job Title', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...staff.map(s => [
        `"${s.fullName}"`,
        s.email,
        s.role,
        s.isActive ? 'Active' : 'Inactive',
        s.phone || '',
        s.department || '',
        s.jobTitle || '',
        new Date(s.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
                disabled={isSystemAdmin && viewAllOrgs}
                title={isSystemAdmin && viewAllOrgs ? 'Select a specific organization to add staff' : undefined}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      {/* Organization Filter Banner (when coming from Organizations page) */}
      {isFilteredFromOrg && urlOrgName && (
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-indigo-950/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Viewing staff for organization
                </p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-indigo-900'}`}>
                  {decodeURIComponent(urlOrgName)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/organizations')}
                className={isDark ? 'border-indigo-700 text-indigo-300 hover:bg-indigo-950' : 'border-indigo-300 text-indigo-700 hover:bg-indigo-100'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearOrgFilter}
                className={isDark ? 'text-indigo-300 hover:bg-indigo-950' : 'text-indigo-700 hover:bg-indigo-100'}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Organization Selector for System Admins (when not filtered from URL) */}
      {isSystemAdmin && !isFilteredFromOrg && (
        <div className={`rounded-lg border p-4 ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <OrganizationSelector
                value={selectedOrgId}
                onChange={handleOrgChange}
                isDark={isDark}
                showAllOption={true}
                label="Filter by Organization"
              />
            </div>
            {viewAllOrgs && (
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <AlertCircle className="w-4 h-4" />
                Viewing staff from all organizations
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
        onExport={handleExport}
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
          error={error}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          onRefresh={handleRefresh}
          showOrganization={viewAllOrgs}
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

      {selectedStaff && (
        <EditStaffDialog
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedStaff(null);
          }}
          staff={selectedStaff}
          onUpdate={handleUpdateStaff}
          isDark={isDark}
        />
      )}

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
