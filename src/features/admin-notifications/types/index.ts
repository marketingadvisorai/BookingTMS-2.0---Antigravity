/**
 * Admin Notification Types
 * Types for admin notification system (email/Slack alerts)
 */

export type AdminNotificationChannel = 'email' | 'slack' | 'in_app';

export type AdminNotificationEvent =
  | 'new_booking'
  | 'booking_cancelled'
  | 'payment_received'
  | 'refund_processed'
  | 'high_value_booking'
  | 'capacity_alert'
  | 'new_customer';

export interface AdminNotificationConfig {
  id: string;
  organizationId: string;
  channel: AdminNotificationChannel;
  events: AdminNotificationEvent[];
  recipients: string[]; // email addresses or Slack channel IDs
  isEnabled: boolean;
  slackWebhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingNotificationData {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  activityName: string;
  venueName: string;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  totalAmount: number;
  paymentStatus: string;
}

export interface AdminNotificationPayload {
  event: AdminNotificationEvent;
  organizationId: string;
  data: BookingNotificationData | Record<string, unknown>;
  timestamp: string;
}
