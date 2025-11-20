/**
 * Dashboard Header Component
 * 
 * Main header for System Admin Dashboard
 * Following existing design patterns
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  onAddOrganization?: () => void;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  isRefreshing?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onAddOrganization,
  onRefresh,
  onSearch,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          System Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#737373] mt-1">
          Manage organizations, plans, and platform metrics
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#737373]" />
          <Input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
          />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="default"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-gray-200 dark:border-[#2a2a2a]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}

        {/* Add Organization Button */}
        {onAddOrganization && (
          <Button
            onClick={onAddOrganization}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        )}
      </div>
    </div>
  );
};
