/**
 * System Admin Dashboard Page (Refactored)
 * Main dashboard for platform administrators
 * @module system-admin/pages/SystemAdminDashboardPage
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/components/layout/ThemeContext';
import { useFeatureFlags } from '@/lib/featureflags/FeatureFlagContext';
import { SystemAdminProvider } from '../context';
import {
  useOrganizations,
  usePlatformMetrics,
  useOrganizationMetrics,
  usePlans,
} from '../hooks';
import {
  PlatformMetricsSection,
  OrganizationsTable,
  PlansSection,
  FeatureFlagsSection,
} from '../components/dashboard';
import type { Organization, Plan } from '../types';

// Imported dialog components (already extracted)
import { SystemAdminHeader } from '@/components/systemadmin/SystemAdminHeader';
import { ViewOwnerDialog } from '@/components/systemadmin/ViewOwnerDialog';
import { EditOwnerDialog } from '@/components/systemadmin/EditOwnerDialog';
import { DeleteOwnerDialog } from '@/components/systemadmin/DeleteOwnerDialog';
import { AddOwnerDialog } from '@/components/systemadmin/AddOwnerDialog';
import { ManagePlanDialog } from '@/components/systemadmin/ManagePlanDialog';
import { SystemAdminSettingsModal } from '@/components/systemadmin/SystemAdminSettingsModal';
import { SystemAdminNotificationsModal } from '@/components/systemadmin/SystemAdminNotificationsModal';
import { AccountSelector } from '@/components/systemadmin/AccountSelector';
import { PaymentsSubscriptionsSection } from '@/components/systemadmin/PaymentsSubscriptionsSection';

const ITEMS_PER_PAGE = 5;

interface Account {
  id: string;
  name: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive';
  stripeAccountId?: string;
}

interface SystemAdminDashboardInnerProps {
  onNavigate?: (page: string) => void;
}

function SystemAdminDashboardInner({ onNavigate }: SystemAdminDashboardInnerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { featureFlags, toggleFeature } = useFeatureFlags();

  // Data hooks
  const { organizations, isLoading: orgsLoading, refetch: refetchOrgs } = useOrganizations({}, 1, 100);
  const { plans, isLoading: plansLoading } = usePlans();
  const { metrics: platformMetrics, isLoading: platformMetricsLoading } = usePlatformMetrics();

  // Selected account state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { metrics: orgMetrics, isLoading: orgMetricsLoading } = useOrganizationMetrics(selectedOrgId || undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
  const [selectedOrgForView, setSelectedOrgForView] = useState<Organization | null>(null);
  const [selectedOrgForEdit, setSelectedOrgForEdit] = useState<Organization | null>(null);
  const [selectedOrgForDelete, setSelectedOrgForDelete] = useState<Organization | null>(null);
  const [selectedPlanForManage, setSelectedPlanForManage] = useState<Plan | null>(null);

  // Map organizations to accounts format
  const allAccounts: Account[] = useMemo(() => {
    if (!organizations?.length) return [];
    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      company: org.owner_name || org.plan?.name || 'N/A',
      phone: org.phone || org.id,
      status: org.status === 'active' ? 'active' : 'inactive',
      stripeAccountId: org.stripe_account_id || undefined,
    }));
  }, [organizations]);

  // Recent accounts (top 3)
  const recentAccounts = useMemo(() => allAccounts.slice(0, 3), [allAccounts]);

  // Calculate metrics
  const filteredMetrics = useMemo(() => {
    if (!selectedAccount && platformMetrics) {
      return {
        totalOwners: platformMetrics.total_organizations || 0,
        activeSubscriptions: platformMetrics.active_organizations || 0,
        activeVenues: platformMetrics.total_venues || 0,
        totalLocations: platformMetrics.total_venues || 0,
        totalGames: platformMetrics.total_games || 0,
        totalBookings: platformMetrics.total_bookings || 0,
        mrr: platformMetrics.mrr || 0,
      };
    }
    if (selectedAccount && orgMetrics) {
      return {
        totalOwners: 1,
        activeSubscriptions: 1,
        activeVenues: orgMetrics.total_venues || 0,
        totalLocations: orgMetrics.active_venues || 0,
        totalGames: orgMetrics.total_games || 0,
        totalBookings: orgMetrics.total_bookings || 0,
        mrr: orgMetrics.mrr || 0,
      };
    }
    return {
      totalOwners: organizations?.length || 0,
      activeSubscriptions: organizations?.filter((o) => o.status === 'active').length || 0,
      activeVenues: 0,
      totalLocations: 0,
      totalGames: 0,
      totalBookings: 0,
      mrr: 0,
    };
  }, [selectedAccount, platformMetrics, orgMetrics, organizations]);

  // Paginated organizations
  const filteredOrgs = useMemo(() => {
    if (!selectedAccount) return organizations || [];
    return (organizations || []).filter((o) => o.id === selectedAccount.id);
  }, [selectedAccount, organizations]);

  const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);
  const paginatedOrgs = filteredOrgs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers
  const handleAccountSelect = useCallback((account: Account | null) => {
    setSelectedAccount(account);
    setSelectedOrgId(account?.id || null);
    setCurrentPage(1);
    toast.info(account ? `Viewing: ${account.name}` : 'Viewing all accounts');
  }, []);

  const handleToggleFeature = useCallback(
    (featureId: string) => {
      const feature = featureFlags.find((f) => f.id === featureId);
      toggleFeature(featureId);
      toast.success(`${feature?.name} ${feature?.enabled ? 'disabled' : 'enabled'}`);
    },
    [featureFlags, toggleFeature]
  );

  const handleAddOrganization = useCallback(() => {
    refetchOrgs();
    setShowAddOwnerDialog(false);
  }, [refetchOrgs]);

  // Theme classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <SystemAdminHeader
        selectedAccount={selectedAccount}
        onAccountSelect={handleAccountSelect}
        accounts={allAccounts}
        recentAccounts={recentAccounts}
        onSettingsClick={() => setShowSettingsModal(true)}
        onNotificationsClick={() => setShowNotificationsModal(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Platform Metrics */}
        <PlatformMetricsSection
          metrics={filteredMetrics}
          isLoading={platformMetricsLoading || orgMetricsLoading}
          selectedAccountName={selectedAccount?.name}
        />

        {/* Organizations Table */}
        <div className="mb-6">
          <OrganizationsTable
            organizations={paginatedOrgs}
            isLoading={orgsLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onView={(org) => setSelectedOrgForView(org)}
            onEdit={(org) => setSelectedOrgForEdit(org)}
            onDelete={(org) => setSelectedOrgForDelete(org)}
            onAdd={() => setShowAddOwnerDialog(true)}
          />
        </div>

        {/* Payments Section */}
        {selectedAccount?.stripeAccountId && (
          <div className="mb-6">
            <PaymentsSubscriptionsSection selectedAccount={selectedAccount} />
          </div>
        )}

        {/* Plans Section */}
        <PlansSection
          plans={plans || []}
          isLoading={plansLoading}
          onManagePlan={(plan) => setSelectedPlanForManage(plan)}
        />

        {/* Feature Flags */}
        <FeatureFlagsSection
          featureFlags={featureFlags}
          selectedAccountName={selectedAccount?.name}
          onToggleFeature={handleToggleFeature}
        />
      </div>

      {/* Dialogs */}
      {selectedOrgForView && (
        <ViewOwnerDialog
          isOpen={!!selectedOrgForView}
          onClose={() => setSelectedOrgForView(null)}
          owner={selectedOrgForView}
          onEdit={() => {
            setSelectedOrgForEdit(selectedOrgForView);
            setSelectedOrgForView(null);
          }}
          onDelete={() => {
            setSelectedOrgForDelete(selectedOrgForView);
            setSelectedOrgForView(null);
          }}
        />
      )}

      {selectedOrgForEdit && (
        <EditOwnerDialog
          isOpen={!!selectedOrgForEdit}
          onClose={() => setSelectedOrgForEdit(null)}
          owner={selectedOrgForEdit}
          onSave={() => {
            refetchOrgs();
            setSelectedOrgForEdit(null);
          }}
        />
      )}

      {selectedOrgForDelete && (
        <DeleteOwnerDialog
          isOpen={!!selectedOrgForDelete}
          onClose={() => setSelectedOrgForDelete(null)}
          owner={selectedOrgForDelete}
          onConfirmDelete={() => {
            refetchOrgs();
            setSelectedOrgForDelete(null);
          }}
        />
      )}

      <AddOwnerDialog
        isOpen={showAddOwnerDialog}
        onClose={() => setShowAddOwnerDialog(false)}
        onAdd={handleAddOrganization}
      />

      {selectedPlanForManage && (
        <ManagePlanDialog
          isOpen={!!selectedPlanForManage}
          onClose={() => setSelectedPlanForManage(null)}
          plan={selectedPlanForManage}
          onSave={() => setSelectedPlanForManage(null)}
        />
      )}

      <SystemAdminSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <SystemAdminNotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </div>
  );
}

interface SystemAdminDashboardPageProps {
  onNavigate?: (page: string) => void;
}

export function SystemAdminDashboardPage({ onNavigate }: SystemAdminDashboardPageProps) {
  return (
    <SystemAdminProvider>
      <SystemAdminDashboardInner onNavigate={onNavigate} />
    </SystemAdminProvider>
  );
}

export default SystemAdminDashboardPage;
