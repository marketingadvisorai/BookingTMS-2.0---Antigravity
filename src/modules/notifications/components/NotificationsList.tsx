/**
 * Notifications List Component
 * @module notifications/components/NotificationsList
 */

import { Bell } from 'lucide-react';
import { NotificationCard } from './NotificationCard';
import type { Notification, NotificationFilters } from '../types';

interface NotificationsListProps {
  notifications: Notification[];
  filters: NotificationFilters;
  isDark: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (link: string) => void;
}

export function NotificationsList({
  notifications,
  filters,
  isDark,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationsListProps) {
  // Apply filters
  const filteredNotifications = notifications.filter((n) => {
    if (filters.type && n.type !== filters.type) return false;
    if (filters.isRead !== undefined && n.is_read !== filters.isRead) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!n.title.toLowerCase().includes(search) && !n.message.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  if (filteredNotifications.length === 0) {
    return (
      <div className={`${cardBg} border ${borderClass} rounded-lg p-12 text-center`}>
        <Bell className={`w-12 h-12 mx-auto mb-4 ${mutedClass}`} />
        <h3 className={`text-lg font-medium ${textClass}`}>No notifications</h3>
        <p className={`text-sm ${mutedClass} mt-1`}>
          {filters.search || filters.type || filters.isRead !== undefined
            ? 'No notifications match your filters'
            : "You're all caught up!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          isDark={isDark}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export default NotificationsList;
