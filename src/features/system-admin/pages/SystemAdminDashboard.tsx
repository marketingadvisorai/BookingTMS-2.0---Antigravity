/**
 * System Admin Dashboard Page
 * 
 * Main dashboard page for system administrators
 * Integrates all components with real data
 */

import React, { useState } from 'react';
import {
  DashboardHeader,
  DashboardMetrics,
  OrganizationTable,
  Pagination,
  OrganizationModal,
} from '../components';
import { useOrganizations, useSystemAdmin, usePlans } from '../hooks';
import { OrganizationService } from '../services';
import { toast } from 'sonner';
import type { CreateOrganizationDTO } from '../types';

export const SystemAdminDashboard: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    organizationFilters,
    setOrganizationFilters,
  } = useSystemAdmin();

  const {
    organizations,
    total,
    isLoading,
    refetch,
    createOrganization,
    isCreating,
  } = useOrganizations({}, currentPage, pageSize);

  const { plans } = usePlans(true); // Get only active plans

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const handleAddOrganization = () => {
    setSelectedOrg(null);
    setIsModalOpen(true);
  };

  const handleEditOrganization = (org: any) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const handleViewOrganization = (org: any) => {
    // TODO: Navigate to organization details page
    console.log('View organization:', org);
  };

  const handleDeleteOrganization = async (org: any) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) {
      return;
    }

    try {
      await OrganizationService.delete(org.id);
      toast.success('Organization deleted successfully');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete organization');
    }
  };

  const handleSubmitOrganization = async (data: CreateOrganizationDTO) => {
    try {
      if (selectedOrg) {
        // Update existing - convert CreateOrganizationDTO to UpdateOrganizationDTO
        const updateData = {
          name: data.name,
          owner_name: data.owner_name,
          owner_email: data.owner_email,
          plan_id: data.plan_id,
          // Map status: CreateDTO has 'pending' but UpdateDTO doesn't
          status: data.status === 'active' ? ('active' as const) : undefined,
        };
        await OrganizationService.update(selectedOrg.id, updateData);
        toast.success('Organization updated successfully');
      } else {
        // Create new
        await createOrganization(data);
        toast.success('Organization created successfully');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(selectedOrg ? 'Failed to update organization' : 'Failed to create organization');
      throw error; // Re-throw to keep modal open
    }
  };

  const handleSearch = (query: string) => {
    setOrganizationFilters({ ...organizationFilters, search: query });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-white dark:bg-[#161616] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-6 pb-12">
        {/* Header */}
        <DashboardHeader
          onAddOrganization={handleAddOrganization}
          onRefresh={() => refetch()}
          onSearch={handleSearch}
          isRefreshing={isLoading}
        />

        {/* Metrics */}
        <DashboardMetrics />

        {/* Organizations Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Organizations
          </h2>
          
          <OrganizationTable
            organizations={organizations}
            loading={isLoading}
            onView={handleViewOrganization}
            onEdit={handleEditOrganization}
            onDelete={handleDeleteOrganization}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            loading={isLoading}
          />
        </div>

        {/* Add/Edit Modal */}
        <OrganizationModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitOrganization}
          organization={selectedOrg}
          plans={plans?.map((p) => ({ id: p.id, name: p.name })) || []}
          loading={isCreating}
        />
      </div>
    </div>
  );
};
