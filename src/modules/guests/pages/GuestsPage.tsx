/**
 * Guests Page
 * Main page component for guest/customer management
 * Uses the modular guests module with multi-tenant support
 */

'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCcw, Download } from 'lucide-react';
import { toast } from 'sonner';

// Module imports
import { useGuests } from '../hooks/useGuests';
import { GuestStats } from '../components/GuestStats';
import { GuestTable } from '../components/GuestTable';
import { GuestFilters } from '../components/GuestFilters';
import { AddGuestDialog } from '../components/AddGuestDialog';
import type { Customer, CustomerCreateInput } from '../types';

export function GuestsPage() {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const isDark = theme === 'dark';

  // Hook for guest data management
  const {
    customers,
    metrics,
    loading,
    refreshCustomers,
    createCustomer,
    updateCustomer,
  } = useGuests({ autoLoad: true, realtimeEnabled: true });

  // Local UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Permissions
  const canEdit = hasPermission('customers.edit');
  const canExport = hasPermission('customers.export');
  const canCreate = hasPermission('customers.create');

  // Style classes
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';

  // Filter customers based on search and segment
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone?.includes(searchQuery) ?? false);

    const matchesSegment =
      selectedSegment === 'all' ||
      customer.lifecycleStage === selectedSegment ||
      customer.spendingTier === selectedSegment;

    return matchesSearch && matchesSegment;
  });

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCustomers();
    toast.success('Guest list refreshed');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredCustomers.map((c) => c.id));
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectCustomer = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      setSelectAll(false);
    } else {
      newSelected.add(id);
      if (newSelected.size === filteredCustomers.length) {
        setSelectAll(true);
      }
    }
    setSelectedIds(newSelected);
  };

  const handleViewCustomer = (customer: Customer) => {
    // TODO: Open detail modal
    toast.info(`Viewing ${customer.fullName}`);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAddDialog(true);
  };

  const handleSaveCustomer = async (data: CustomerCreateInput) => {
    if (selectedCustomer) {
      await updateCustomer({ id: selectedCustomer.id, ...data });
    } else {
      await createCustomer(data);
    }
    setSelectedCustomer(null);
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setShowAddDialog(true);
  };

  return (
    <>
      <PageHeader
        title="Guests"
        description="Manage guest database, profiles, and segments"
        sticky
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw
                className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats Overview */}
        <GuestStats metrics={metrics} loading={loading} />

        {/* Main Content */}
        <Tabs defaultValue="database" className="w-full">
          <TabsList className={isDark ? 'bg-[#161616]' : 'bg-gray-100'}>
            <TabsTrigger value="database">Guest Database</TabsTrigger>
            <TabsTrigger value="segments">Segments & Marketing</TabsTrigger>
          </TabsList>

          {/* Guest Database Tab */}
          <TabsContent value="database" className="space-y-6 mt-6">
            <div className={`${bgClass} ${borderClass} border rounded-lg`}>
              {/* Filters */}
              <GuestFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSegment={selectedSegment}
                onSegmentChange={setSelectedSegment}
                onExport={canExport ? handleExport : undefined}
                onAddNew={canCreate ? handleAddNew : undefined}
                canExport={canExport}
                canCreate={canCreate}
              />

              {/* Bulk Actions Bar */}
              {selectedIds.size > 0 && (
                <div className="p-4 border-b" style={{ borderColor: isDark ? '#1e1e1e' : '#e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <p className={isDark ? 'text-white' : 'text-gray-900'}>
                        <span className="font-semibold">{selectedIds.size}</span>{' '}
                        guest{selectedIds.size !== 1 ? 's' : ''} selected
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedIds(new Set());
                          setSelectAll(false);
                        }}
                        className={isDark ? 'text-[#a3a3a3] hover:text-white' : ''}
                      >
                        Clear selection
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info(`Exporting ${selectedIds.size} guests...`)}
                      className={isDark ? 'border-[#2a2a2a] text-[#a3a3a3]' : ''}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Table */}
              <GuestTable
                customers={filteredCustomers}
                loading={loading}
                selectedIds={selectedIds}
                onSelectCustomer={handleSelectCustomer}
                onSelectAll={handleSelectAll}
                selectAll={selectAll}
                onView={handleViewCustomer}
                onEdit={handleEditCustomer}
                canEdit={canEdit}
                onAddNew={canCreate ? handleAddNew : undefined}
              />
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="mt-6">
            <div className={`${bgClass} ${borderClass} border rounded-lg p-8 text-center`}>
              <p className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>
                Segments & Marketing coming soon. Use the existing CustomerSegments component.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <AddGuestDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
        editCustomer={selectedCustomer}
      />
    </>
  );
}

export default GuestsPage;
