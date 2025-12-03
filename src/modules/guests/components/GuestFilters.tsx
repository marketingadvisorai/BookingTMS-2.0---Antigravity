/**
 * Guest Filters Component
 * Search and filter bar for guest list
 */

'use client';

import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, Download, UserPlus } from 'lucide-react';
import type { CustomerFilters, LifecycleStage, SpendingTier } from '../types';

interface GuestFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSegment: string;
  onSegmentChange: (value: string) => void;
  onExport?: () => void;
  onAddNew?: () => void;
  canExport?: boolean;
  canCreate?: boolean;
}

const SEGMENT_OPTIONS = [
  { value: 'all', label: 'All Guests' },
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'churned', label: 'Churned' },
  { value: 'vip', label: 'VIP' },
  { value: 'high', label: 'High Spenders' },
];

export function GuestFilters({
  searchQuery,
  onSearchChange,
  selectedSegment,
  onSegmentChange,
  onExport,
  onAddNew,
  canExport = true,
  canCreate = true,
}: GuestFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <div
      className="p-4 border-b"
      style={{ borderColor: isDark ? '#1e1e1e' : '#e5e7eb' }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${subtextClass}`}
          />
          <Input
            placeholder="Search guests by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 h-12 ${
              isDark
                ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]'
                : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-12 ${
                  isDark
                    ? 'border-[#1e1e1e] bg-[#0a0a0a] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}
            >
              {SEGMENT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSegmentChange(option.value)}
                  className={selectedSegment === option.value ? 'bg-blue-500/10' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Button */}
          {canExport && onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              className={`h-12 ${
                isDark
                  ? 'border-[#1e1e1e] bg-[#0a0a0a] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}

          {/* Add Guest Button */}
          {canCreate && onAddNew && (
            <Button
              onClick={onAddNew}
              style={{ backgroundColor: '#4f46e5' }}
              className="h-12 text-white hover:opacity-90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
