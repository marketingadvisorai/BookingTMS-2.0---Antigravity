/**
 * Transaction Filters
 * Filter controls for transactions
 * @module payment-history/components/TransactionFilters
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { PaymentStatus, PaymentMethod, TransactionFilters as FilterState } from '../types';

interface TransactionFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  filteredCount: number;
  totalCount: number;
  onExport: () => void;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  filteredCount,
  totalCount,
  onExport,
}: TransactionFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const inputClass = isDark
    ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#737373]'
    : 'bg-gray-100 border-gray-300 placeholder:text-gray-500';
  const selectClass = isDark
    ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white'
    : 'bg-gray-100 border-gray-300';
  const selectContentClass = isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white';
  const selectItemClass = isDark ? 'text-white focus:bg-[#161616] focus:text-white' : '';

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
          <Input
            placeholder="Search by customer, email, transaction ID..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className={`pl-10 h-12 ${inputClass}`}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.statusFilter}
          onValueChange={(value) => onFiltersChange({ statusFilter: value as PaymentStatus | 'all' })}
        >
          <SelectTrigger className={`h-12 ${selectClass}`}>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectItem value="all" className={selectItemClass}>All Statuses</SelectItem>
            <SelectItem value="completed" className={selectItemClass}>Completed</SelectItem>
            <SelectItem value="pending" className={selectItemClass}>Pending</SelectItem>
            <SelectItem value="processing" className={selectItemClass}>Processing</SelectItem>
            <SelectItem value="failed" className={selectItemClass}>Failed</SelectItem>
            <SelectItem value="refunded" className={selectItemClass}>Refunded</SelectItem>
            <SelectItem value="partially_refunded" className={selectItemClass}>Partially Refunded</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Select
          value={filters.dateFilter}
          onValueChange={(value) => onFiltersChange({ dateFilter: value as 'today' | 'week' | 'month' | 'all' })}
        >
          <SelectTrigger className={`h-12 ${selectClass}`}>
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectItem value="all" className={selectItemClass}>All Time</SelectItem>
            <SelectItem value="today" className={selectItemClass}>Today</SelectItem>
            <SelectItem value="week" className={selectItemClass}>Last 7 Days</SelectItem>
            <SelectItem value="month" className={selectItemClass}>Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className={textSecondary}>
          Showing {filteredCount} of {totalCount} transactions
        </div>
        <PermissionGuard permissions={['payments.export']}>
          <Button
            variant="outline"
            onClick={onExport}
            className={`gap-2 ${isDark ? 'border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}`}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
}

export default TransactionFilters;
