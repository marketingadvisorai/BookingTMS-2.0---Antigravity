/**
 * Notifications Module Types
 * @module notifications/types
 */

export type NotificationType = 'booking' | 'payment' | 'game' | 'venue' | 'system' | 'alert';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  read_at?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  search?: string;
}

export type NotificationTab = 'all' | 'unread';
