/**
 * Staff Page
 * Main staff management page component
 * @module staff/pages/StaffPage
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useStaff } from '../hooks/useStaff';
import { StaffMember, StaffFormData } from '../types';
import {
  StaffStatsCards,
  StaffFilters,
  StaffTable,
  AddStaffDialog,
  ViewStaffDialog,
  DeleteStaffDialog,
} from '../components';

export function StaffPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use modular staff hook
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
  } = useStaff();

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

  const handleAddStaff = async (data: StaffFormData, password: string) => {
    await createStaff(data, password);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Staff Management"
        description="Manage your team members and their roles"
        sticky
        action={
          <PermissionGuard permissions={['staff.create']}>
            <Button
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </PermissionGuard>
        }
      />

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
      <StaffTable
        staff={staff}
        loading={loading}
        isDark={isDark}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
      />

      {/* Dialogs */}
      <AddStaffDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddStaff}
        isDark={isDark}
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
