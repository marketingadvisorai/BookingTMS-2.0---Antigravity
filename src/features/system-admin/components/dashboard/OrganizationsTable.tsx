/**
 * Organizations Table
 * Displays paginated organization list with actions
 * @module system-admin/components/dashboard/OrganizationsTable
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { Organization } from '../../types';

interface OrganizationsTableProps {
  organizations: Organization[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onAdd: () => void;
}

export function OrganizationsTable({
  organizations,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onAdd,
}: OrganizationsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: isDark
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inactive: isDark
        ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        : 'bg-gray-100 text-gray-600 border-gray-200',
      pending: isDark
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      suspended: isDark
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-red-50 text-red-700 border-red-200',
    };
    return variants[status] || variants.inactive;
  };

  const getPlanBadge = (planName?: string) => {
    const variants: Record<string, string> = {
      Pro: isDark
        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Growth: isDark
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Basic: isDark
        ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        : 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return variants[planName || 'Basic'] || variants.Basic;
  };

  return (
    <Card className={`${cardBgClass} border ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className={`text-lg ${textClass}`}>Organizations</CardTitle>
        <Button onClick={onAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Organization
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
          <Table>
            <TableHeader>
              <TableRow className={isDark ? 'bg-[#0a0a0a] border-[#333]' : 'bg-gray-50 border-gray-200'}>
                <TableHead className={mutedTextClass}>Organization</TableHead>
                <TableHead className={mutedTextClass}>Owner</TableHead>
                <TableHead className={mutedTextClass}>Plan</TableHead>
                <TableHead className={mutedTextClass}>Status</TableHead>
                <TableHead className={`${mutedTextClass} text-right`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <span className={mutedTextClass}>Loading...</span>
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <span className={mutedTextClass}>No organizations found</span>
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow
                    key={org.id}
                    className={`${isDark ? 'border-[#333] hover:bg-[#1a1a1a]' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-medium ${textClass}`}>{org.name}</span>
                        {org.website && (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs ${mutedTextClass} hover:text-indigo-500 flex items-center gap-1`}
                          >
                            {org.website.replace(/^https?:\/\//, '').split('/')[0]}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={textClass}>{org.owner_name || 'N/A'}</span>
                        <span className={`text-xs ${mutedTextClass}`}>{org.owner_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPlanBadge(org.plan?.name)}>
                        {org.plan?.name || 'Basic'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(org.status)}>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(org)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(org)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(org)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <span className={`text-sm ${mutedTextClass}`}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OrganizationsTable;
