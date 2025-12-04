/**
 * Notifications Page
 * Uses the modular notifications components
 * @module pages/Notifications
 */

import { useState } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

import {
  NotificationFilters,
  NotificationsList,
  type NotificationFiltersType,
} from '@/modules/notifications';

export default function Notifications() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFiltersType>({});

  const handleNavigate = (link: string) => {
    navigate(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Stay updated with your latest activity"
          sticky
          action={
            <Badge variant="secondary" className="text-sm">
              <Bell className="w-4 h-4 mr-1" />
              {unreadCount} unread
            </Badge>
          }
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with your latest activity"
        sticky
        action={
          unreadCount > 0 && (
            <Badge
              className={isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'}
            >
              <Bell className="w-4 h-4 mr-1" />
              {unreadCount} unread
            </Badge>
          )
        }
      />

      <NotificationFilters
        filters={filters}
        onFiltersChange={setFilters}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAll}
        isDark={isDark}
      />

      <NotificationsList
        notifications={notifications as any}
        filters={filters}
        isDark={isDark}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export { Notifications };
