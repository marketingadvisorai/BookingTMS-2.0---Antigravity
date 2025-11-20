/**
 * Notification System Types
 * Comprehensive type definitions for the notification system
 */

export type NotificationType = 
  | 'booking'           // New booking created
  | 'cancellation'      // Booking cancelled
  | 'payment'           // Payment received
  | 'refund'            // Refund processed
  | 'customer'          // New customer registered
  | 'staff'             // Staff assignment/update
  | 'system'            // System updates/announcements
  | 'alert'             // Warnings, capacity alerts
  | 'message';          // Customer messages

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    bookingId?: string;
    customerId?: string;
    amount?: number;
    staffId?: string;
    gameId?: string;
    [key: string]: any;
  };
}

export interface NotificationSettings {
  // Sound Settings
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  soundForBookings: boolean;
  soundForPayments: boolean;
  soundForCancellations: boolean;

  // Desktop/Push Notifications
  desktopEnabled: boolean;
  desktopForBookings: boolean;
  desktopForPayments: boolean;
  desktopForCancellations: boolean;
  desktopForMessages: boolean;
  desktopForStaffUpdates: boolean;

  // Email Notifications
  emailEnabled: boolean;
  emailForBookings: boolean;
  emailForCancellations: boolean;
  emailForPayments: boolean;
  emailForRefunds: boolean;
  emailForCustomerMessages: boolean;
  emailForSystemUpdates: boolean;
  emailForReports: boolean;
  emailForMarketing: boolean;
  emailDigest: 'instant' | 'hourly' | 'daily' | 'weekly';

  // SMS Notifications
  smsEnabled: boolean;
  smsPhoneNumber: string;
  smsForBookings: boolean;
  smsForCancellations: boolean;
  smsForUrgentAlerts: boolean;

  // Quiet Hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // 24h format: "22:00"
  quietHoursEnd: string;   // 24h format: "08:00"

  // Notification Preferences
  showInAppNotifications: boolean;
  autoMarkReadAfter: number; // seconds, 0 = disabled
  groupSimilarNotifications: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  // Sound Settings
  soundEnabled: true,
  soundVolume: 70,
  soundForBookings: true,
  soundForPayments: true,
  soundForCancellations: true,

  // Desktop/Push Notifications
  desktopEnabled: true,
  desktopForBookings: true,
  desktopForPayments: true,
  desktopForCancellations: true,
  desktopForMessages: true,
  desktopForStaffUpdates: true,

  // Email Notifications
  emailEnabled: true,
  emailForBookings: true,
  emailForCancellations: true,
  emailForPayments: true,
  emailForRefunds: true,
  emailForCustomerMessages: true,
  emailForSystemUpdates: false,
  emailForReports: true,
  emailForMarketing: false,
  emailDigest: 'instant',

  // SMS Notifications
  smsEnabled: false,
  smsPhoneNumber: '',
  smsForBookings: false,
  smsForCancellations: false,
  smsForUrgentAlerts: false,

  // Quiet Hours
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',

  // Notification Preferences
  showInAppNotifications: true,
  autoMarkReadAfter: 0,
  groupSimilarNotifications: true,
};
