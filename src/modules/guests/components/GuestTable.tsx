/**
 * Guest Table Component
 * Data table for customer list with actions
 */

'use client';

import { useState } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Eye, Edit, MoreVertical, UserPlus } from 'lucide-react';
import type { Customer } from '../types';
import { getSegmentColorClass, getStatusColorClass, formatCurrency } from '../utils/mappers';

interface GuestTableProps {
  customers: Customer[];
  loading?: boolean;
  selectedIds: Set<string>;
  onSelectCustomer: (id: string) => void;
  onSelectAll: () => void;
  selectAll: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  canEdit?: boolean;
  onAddNew?: () => void;
}

export function GuestTable({
  customers,
  loading,
  selectedIds,
  onSelectCustomer,
  onSelectAll,
  selectAll,
  onView,
  onEdit,
  canEdit = true,
  onAddNew,
}: GuestTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`${bgClass} ${borderClass} border rounded-lg p-12 text-center`}>
        <p className={subtextClass}>Loading guests...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full ${
            isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'
          } flex items-center justify-center`}
        >
          <UserPlus className={`w-8 h-8 ${subtextClass}`} />
        </div>
        <p className={`text-lg font-medium ${textClass} mb-2`}>No guests yet</p>
        <p className={`${subtextClass} mb-4`}>
          Guests will appear here when they make bookings or are added manually.
        </p>
        {onAddNew && (
          <Button
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add First Guest
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow
            className={isDark ? 'border-[#1e1e1e] hover:bg-transparent' : 'hover:bg-transparent'}
          >
            <TableHead className={`${textClass} w-12`}>
              <Checkbox
                checked={selectAll}
                onCheckedChange={onSelectAll}
                aria-label="Select all guests"
              />
            </TableHead>
            <TableHead className={textClass}>Guest</TableHead>
            <TableHead className={textClass}>Contact</TableHead>
            <TableHead className={textClass}>Bookings</TableHead>
            <TableHead className={textClass}>Lifetime Value</TableHead>
            <TableHead className={textClass}>Last Booking</TableHead>
            <TableHead className={textClass}>Segment</TableHead>
            <TableHead className={textClass}>Status</TableHead>
            <TableHead className={textClass}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className={isDark ? 'border-[#1e1e1e] hover:bg-[#1a1a1a]' : 'hover:bg-gray-50'}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(customer.id)}
                  onCheckedChange={() => onSelectCustomer(customer.id)}
                  aria-label={`Select ${customer.fullName}`}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className={textClass}>{customer.fullName}</p>
                  <p className={`text-sm ${subtextClass}`}>
                    {customer.id.slice(0, 8)}...
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className={`text-sm ${textClass}`}>{customer.email}</p>
                  <p className={`text-sm ${subtextClass}`}>
                    {customer.phone || 'No phone'}
                  </p>
                </div>
              </TableCell>
              <TableCell className={textClass}>{customer.totalBookings}</TableCell>
              <TableCell className={textClass}>
                {formatCurrency(customer.totalSpent)}
              </TableCell>
              <TableCell className={subtextClass}>
                {customer.lastBookingDisplay}
              </TableCell>
              <TableCell>
                <Badge className={getSegmentColorClass(customer.lifecycleStage, isDark)}>
                  {customer.lifecycleStage}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColorClass(customer.status, isDark)}>
                  {customer.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}
                  >
                    <DropdownMenuItem onClick={() => onView(customer)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(customer)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Guest
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
}
