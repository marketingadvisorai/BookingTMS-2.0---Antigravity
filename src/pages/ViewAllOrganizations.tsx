/**
 * View All Organizations Page
 * Full-page table view with advanced filtering and pagination
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useOrganizations, usePlans } from '../features/system-admin/hooks';
import { toast } from 'sonner';
import type { Organization } from '../features/system-admin/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface ViewAllOrganizationsProps {
  onBack?: () => void;
}

export const ViewAllOrganizations: React.FC<ViewAllOrganizationsProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const { organizations, isLoading, refetch } = useOrganizations(
    {
      search: searchQuery,
      status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      plan_id: planFilter !== 'all' ? planFilter : undefined,
    },
    currentPage,
    itemsPerPage
  );

  const { plans } = usePlans(true);

  // Calculate pagination
  const total = organizations?.length || 0;
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, total);

  // Handle actions
  const handleView = (org: Organization) => {
    toast.info(`Viewing ${org.name}`);
    // TODO: Navigate to organization details
  };

  const handleEdit = (org: Organization) => {
    toast.info(`Editing ${org.name}`);
    // TODO: Open edit modal
  };

  const handleDelete = async (org: Organization) => {
    if (window.confirm(`Are you sure you want to delete ${org.name}?`)) {
      toast.info(`Deleting ${org.name}...`);
      // TODO: Implement delete
    }
  };

  const handleExport = () => {
    toast.success('Exporting organizations to CSV...');
    // TODO: Implement CSV export
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/10 text-green-600 dark:text-green-500',
      pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500',
      inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-500',
      suspended: 'bg-red-500/10 text-red-600 dark:text-red-500',
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                className={`border ${borderColor}`}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className={`text-2xl font-bold ${textClass}`}>All Organizations</h1>
              <p className={mutedTextClass}>
                Showing {startIndex}-{endIndex} of {total} organizations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className={`border ${borderColor}`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className={`border ${borderColor}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardBgClass} border ${borderColor} rounded-lg p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Label className={mutedTextClass}>Search</Label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
                <Input
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} border ${borderColor}`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label className={mutedTextClass}>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} border ${borderColor}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`${cardBgClass} border ${borderColor} z-[9999]`} position="popper">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plan Filter */}
            <div>
              <Label className={mutedTextClass}>Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} border ${borderColor}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`${cardBgClass} border ${borderColor} z-[9999]`} position="popper">
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`${cardBgClass} border ${borderColor} rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} border-b ${borderColor}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${mutedTextClass} uppercase tracking-wider`}>
                    Organization
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${mutedTextClass} uppercase tracking-wider`}>
                    Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${mutedTextClass} uppercase tracking-wider`}>
                    Plan
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${mutedTextClass} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${mutedTextClass} uppercase tracking-wider`}>
                    Created
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${mutedTextClass} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderColor}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-12 text-center ${mutedTextClass}`}>
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading organizations...
                    </td>
                  </tr>
                ) : organizations?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-12 text-center ${mutedTextClass}`}>
                      No organizations found
                    </td>
                  </tr>
                ) : (
                  organizations?.map((org) => (
                    <tr key={org.id} className={`hover:${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <div>
                          <div className={`font-medium ${textClass}`}>{org.name}</div>
                          <div className={`text-sm ${mutedTextClass}`}>{org.owner_email}</div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${textClass}`}>
                        {org.owner_name || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          {org.plan?.name || 'No Plan'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        {getStatusBadge(org.status)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${mutedTextClass}`}>
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={`${cardBgClass} border ${borderColor}`}>
                            <DropdownMenuItem onClick={() => handleView(org)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(org)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(org)}
                              className="text-red-600 dark:text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
              <div className={`text-sm ${mutedTextClass}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`border ${borderColor}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`border ${borderColor}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
