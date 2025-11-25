/**
 * Organizations Management Page
 * 
 * Comprehensive organizations management for System Admin & Super Admin
 * Features: CRUD operations, settings, billing, and analytics
 * 
 * @version 0.1.4
 * @date 2025-11-25
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Search,
  Building2,
  Users,
  CreditCard,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
  Download,
  TrendingUp,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useAuth } from '../lib/auth/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { useOrganizations, usePlans } from '../features/system-admin/hooks';
import { OrganizationService } from '../features/system-admin/services';
import { OrganizationModal } from '../features/system-admin/components/organizations/OrganizationModal';
import OrganizationSettingsModal from '../components/organizations/OrganizationSettingsModal';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '../features/system-admin/utils';
import type { Organization, CreateOrganizationDTO } from '../features/system-admin/types';

// Status configuration for badges
const statusConfig: Record<string, { variant: any; icon: React.ReactNode; className: string }> = {
  active: { 
    variant: 'default', 
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-emerald-600 hover:bg-emerald-700' 
  },
  inactive: { 
    variant: 'secondary', 
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-gray-500 hover:bg-gray-600' 
  },
  pending: { 
    variant: 'outline', 
    icon: <Clock className="h-3 w-3" />,
    className: 'border-orange-500 text-orange-600' 
  },
  suspended: { 
    variant: 'destructive', 
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'bg-red-600 hover:bg-red-700' 
  },
};

export function Organizations() {
  const { isRole } = useAuth();
  const isSystemAdmin = isRole('system-admin');
  const isSuperAdmin = isRole('super-admin');

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Data hooks
  const { organizations, total, isLoading, refetch, createOrganization, isCreating } = useOrganizations(
    { 
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter as any : undefined,
    },
    currentPage,
    10
  );
  const { plans } = usePlans(true);

  // Stats
  const stats = useMemo(() => {
    const all = organizations || [];
    return {
      total: total || 0,
      active: all.filter(o => o.status === 'active').length,
      pending: all.filter(o => o.status === 'pending').length,
      suspended: all.filter(o => o.status === 'suspended').length,
    };
  }, [organizations, total]);

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

  const handleSubmit = async (data: CreateOrganizationDTO) => {
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
        await createOrganization(data);
        toast.success('Organization created successfully');
      }
      setIsAddModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
      throw error;
    }
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  // Only allow system-admin and super-admin
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-7 w-7 text-indigo-600" />
              Organizations
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage all organizations, their settings, and subscriptions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Organizations"
            value={stats.total}
            icon={<Building2 className="h-5 w-5" />}
            color="indigo"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={<CheckCircle className="h-5 w-5" />}
            color="emerald"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="Suspended"
            value={stats.suspended}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="red"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Grid */}
        {isLoading ? (
          <OrganizationsLoadingSkeleton />
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No organizations found
              </h3>
              <p className="text-gray-500 mt-2">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first organization'}
              </p>
              <Button onClick={handleAdd} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onEdit={handleEdit}
                onSettings={handleSettings}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} organizations
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * 10 >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <OrganizationModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmit}
          organization={selectedOrg}
          plans={plans?.map(p => ({ id: p.id, name: p.name })) || []}
          loading={isCreating}
        />

        {selectedOrg && (
          <OrganizationSettingsModal
            open={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            organization={selectedOrg}
            onUpdate={() => {
              refetch();
              setIsSettingsModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'amber' | 'red';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Organization Card Component
function OrganizationCard({ 
  organization, 
  onEdit, 
  onSettings, 
  onDelete 
}: {
  organization: Organization;
  onEdit: (org: Organization) => void;
  onSettings: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}) {
  const statusInfo = statusConfig[organization.status] || statusConfig.pending;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base">{organization.name}</CardTitle>
              {organization.owner_email && (
                <CardDescription className="text-xs">
                  {organization.owner_email}
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSettings(organization)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(organization)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(organization)}
                className="text-red-600 dark:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status & Plan */}
        <div className="flex items-center justify-between">
          <Badge variant={statusInfo.variant} className={`${statusInfo.className} flex items-center gap-1`}>
            {statusInfo.icon}
            {organization.status}
          </Badge>
          <span className="text-sm text-gray-500">
            {typeof organization.plan === 'object' ? organization.plan?.name : 'No Plan'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(organization.revenue?.total_revenue || 0)}
            </p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {organization.application_fee_percentage || 0}%
            </p>
            <p className="text-xs text-gray-500">Platform Fee</p>
          </div>
        </div>

        {/* Stripe Status */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            {organization.stripe_charges_enabled ? (
              <span className="text-emerald-600 dark:text-emerald-400">Payments Enabled</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">Setup Required</span>
            )}
          </span>
        </div>

        {/* Created Date */}
        <div className="text-xs text-gray-400 pt-2">
          Created {formatDate(organization.created_at)}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function OrganizationsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Organizations;
