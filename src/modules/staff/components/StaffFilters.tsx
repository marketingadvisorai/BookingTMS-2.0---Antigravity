/**
 * Staff Filters Component
 * Search, filter, and export controls
 * @module staff/components/StaffFilters
 */

import { Search, Filter, X, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaffFilters as StaffFiltersType, STAFF_ROLES, DEPARTMENTS } from '../types';

interface StaffFiltersProps {
  filters: StaffFiltersType;
  onFiltersChange: (filters: StaffFiltersType) => void;
  onClear: () => void;
  isDark: boolean;
}

export function StaffFilters({ filters, onFiltersChange, onClear, isDark }: StaffFiltersProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const iconColor = isDark ? 'text-[#737373]' : 'text-gray-400';

  const hasActiveFilters =
    filters.role !== 'all' || filters.status !== 'all' || filters.search !== '';

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${iconColor}`}
            />
            <Input
              id="staff-filter-search"
              name="staff-filter-search"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-10 h-11"
              autoComplete="off"
              data-form-type="other"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={filters.role}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, role: value as any })
              }
            >
              <SelectTrigger className="w-[140px] h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, status: value as any })
              }
            >
              <SelectTrigger className="w-[140px] h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={onClear} className="h-11">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}

            <Button variant="outline" className="h-11">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
