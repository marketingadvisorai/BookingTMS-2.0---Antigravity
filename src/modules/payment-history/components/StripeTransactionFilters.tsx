/**
 * Stripe Transaction Filters
 * Filter controls for Stripe transactions
 * @module payment-history/components/StripeTransactionFilters
 */

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface StripeTransactionFiltersProps {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  isDark?: boolean;
}

export function StripeTransactionFilters({
  searchQuery,
  statusFilter,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onDateChange,
  isDark = false,
}: StripeTransactionFiltersProps) {
  const inputClass = isDark
    ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#737373]'
    : 'bg-gray-100 border-gray-300 placeholder:text-gray-500';
  const selectClass = isDark
    ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white'
    : 'bg-gray-100 border-gray-300';
  const selectContentClass = isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white';
  const selectItemClass = isDark ? 'text-white focus:bg-[#161616] focus:text-white' : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="lg:col-span-2 relative">
        <Search 
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDark ? 'text-[#737373]' : 'text-gray-400'
          }`} 
        />
        <Input
          placeholder="Search by transaction ID, email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`pl-10 h-12 ${inputClass}`}
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className={`h-12 ${selectClass}`}>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent className={selectContentClass}>
          <SelectItem value="all" className={selectItemClass}>All Statuses</SelectItem>
          <SelectItem value="completed" className={selectItemClass}>Completed</SelectItem>
          <SelectItem value="succeeded" className={selectItemClass}>Succeeded</SelectItem>
          <SelectItem value="pending" className={selectItemClass}>Pending</SelectItem>
          <SelectItem value="failed" className={selectItemClass}>Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Filter */}
      <Select value={dateFilter} onValueChange={onDateChange}>
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
  );
}

export default StripeTransactionFilters;
