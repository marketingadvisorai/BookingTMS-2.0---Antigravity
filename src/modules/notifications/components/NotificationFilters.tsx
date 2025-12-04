/**
 * Notification Filters Component
 * @module notifications/components/NotificationFilters
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
import { Search, CheckCheck, Trash2, Bell, BellOff } from 'lucide-react';
import type { NotificationType, NotificationFilters as Filters } from '../types';

interface NotificationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  isDark: boolean;
}

export function NotificationFilters({
  filters,
  onFiltersChange,
  unreadCount,
  onMarkAllAsRead,
  onClearAll,
  isDark,
}: NotificationFiltersProps) {
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  return (
    <div className={`${cardBg} border ${borderClass} rounded-lg p-4`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 h-11"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, type: v === 'all' ? undefined : v as NotificationType })}
        >
          <SelectTrigger className="w-full md:w-40 h-11">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="game">Game</SelectItem>
            <SelectItem value="venue">Venue</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
          </SelectContent>
        </Select>

        {/* Read/Unread Filter */}
        <Select
          value={filters.isRead === undefined ? 'all' : filters.isRead ? 'read' : 'unread'}
          onValueChange={(v) => onFiltersChange({ ...filters, isRead: v === 'all' ? undefined : v === 'read' })}
        >
          <SelectTrigger className="w-full md:w-40 h-11">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Unread ({unreadCount})
              </div>
            </SelectItem>
            <SelectItem value="read">
              <div className="flex items-center gap-2">
                <BellOff className="w-4 h-4" />
                Read
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" className="text-red-500" onClick={onClearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotificationFilters;
