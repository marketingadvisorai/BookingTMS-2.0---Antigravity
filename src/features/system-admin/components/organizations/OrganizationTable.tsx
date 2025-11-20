/**
 * Organization Table Component
 * 
 * Displays organizations in a sortable, filterable table
 * Following existing table design patterns
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatCurrency } from '../../utils';
import type { Organization } from '../../types';

interface OrganizationTableProps {
  organizations: Organization[];
  loading?: boolean;
  onView?: (org: Organization) => void;
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
  loading = false,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      active: { variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700' },
      inactive: { variant: 'secondary', className: 'bg-gray-500 hover:bg-gray-600' },
      pending: { variant: 'outline', className: 'border-orange-500 text-orange-600' },
    };

    const config = variants[status] || variants.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-[#1a1a1a]">
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell>
                  <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-32" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-20" />
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded w-16" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-16" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-24" />
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-10" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!organizations.length) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-12 text-center">
        <p className="text-gray-600 dark:text-[#737373]">
          No organizations found
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
            <TableHead className="font-semibold">Organization</TableHead>
            <TableHead className="font-semibold">Plan</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">MRR</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="w-[70px] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow
              key={org.id}
              className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              onClick={() => onView?.(org)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {org.name}
                  </span>
                  {org.owner_email && (
                    <span className="text-xs text-gray-500 dark:text-[#737373]">
                      {org.owner_email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-gray-700 dark:text-gray-300">
                  {typeof org.plan === 'string' ? org.plan : org.plan?.name || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                {getStatusBadge(org.status)}
              </TableCell>
              <TableCell>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(org.revenue?.total_revenue || 0)}
                </span>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-[#737373]">
                {formatDate(org.created_at)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(org)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(org)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(org)}
                        className="text-red-600 dark:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
