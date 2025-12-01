/**
 * Embed Pro 2.0 - SMS Reminder Types
 * @module embed-pro/types/sms-reminder.types
 * 
 * Type definitions for SMS reminder functionality.
 * Supports booking confirmations and reminder notifications.
 */

// =====================================================
// SMS TYPES
// =====================================================

export type SMSReminderType = 
  | 'booking_confirmation'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'reminder_1h'
  | 'cancellation'
  | 'reschedule'
  | 'waitlist_available';

export type SMSStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';

export interface SMSReminder {
  /** Unique identifier */
  id: string;
  /** Booking ID */
  bookingId: string;
  /** Type of reminder */
  type: SMSReminderType;
  /** Recipient phone number */
  phoneNumber: string;
  /** Message content */
  message: string;
  /** Scheduled send time (ISO string) */
  scheduledAt: string;
  /** Actual sent time */
  sentAt?: string;
  /** Current status */
  status: SMSStatus;
  /** Error message if failed */
  error?: string;
  /** External provider message ID */
  externalId?: string;
  /** Created timestamp */
  createdAt: string;
}

// =====================================================
// REMINDER SETTINGS
// =====================================================

export interface SMSReminderSettings {
  /** Whether SMS reminders are enabled */
  enabled: boolean;
  /** Send confirmation SMS on booking */
  sendConfirmation: boolean;
  /** Send reminder 24 hours before */
  send24hReminder: boolean;
  /** Send reminder 2 hours before */
  send2hReminder: boolean;
  /** Send reminder 1 hour before */
  send1hReminder: boolean;
  /** Send cancellation notification */
  sendCancellation: boolean;
  /** Custom reminder times (minutes before) */
  customReminders?: number[];
}

export const DEFAULT_SMS_SETTINGS: SMSReminderSettings = {
  enabled: true,
  sendConfirmation: true,
  send24hReminder: true,
  send2hReminder: false,
  send1hReminder: true,
  sendCancellation: true,
};

// =====================================================
// MESSAGE TEMPLATES
// =====================================================

export interface SMSTemplate {
  type: SMSReminderType;
  name: string;
  template: string;
  variables: string[];
}

export const SMS_TEMPLATES: SMSTemplate[] = [
  {
    type: 'booking_confirmation',
    name: 'Booking Confirmation',
    template: 'Hi {{customerName}}! Your booking for {{activityName}} on {{date}} at {{time}} is confirmed. Ref: {{bookingRef}}. See you at {{venueName}}!',
    variables: ['customerName', 'activityName', 'date', 'time', 'bookingRef', 'venueName'],
  },
  {
    type: 'reminder_24h',
    name: '24 Hour Reminder',
    template: 'Reminder: Your {{activityName}} booking is tomorrow at {{time}}. Location: {{venueName}}. Ref: {{bookingRef}}',
    variables: ['activityName', 'time', 'venueName', 'bookingRef'],
  },
  {
    type: 'reminder_2h',
    name: '2 Hour Reminder',
    template: 'Your {{activityName}} starts in 2 hours at {{time}}. Please arrive 10 min early. Location: {{venueName}}',
    variables: ['activityName', 'time', 'venueName'],
  },
  {
    type: 'reminder_1h',
    name: '1 Hour Reminder',
    template: 'Your {{activityName}} starts in 1 hour! Time: {{time}}. Location: {{venueName}}. See you soon!',
    variables: ['activityName', 'time', 'venueName'],
  },
  {
    type: 'cancellation',
    name: 'Cancellation Notice',
    template: 'Your booking for {{activityName}} on {{date}} at {{time}} has been cancelled. Ref: {{bookingRef}}. Contact us with questions.',
    variables: ['activityName', 'date', 'time', 'bookingRef'],
  },
  {
    type: 'reschedule',
    name: 'Reschedule Notice',
    template: 'Your {{activityName}} booking has been rescheduled to {{date}} at {{time}}. Ref: {{bookingRef}}',
    variables: ['activityName', 'date', 'time', 'bookingRef'],
  },
  {
    type: 'waitlist_available',
    name: 'Waitlist Availability',
    template: 'Good news! A spot opened for {{activityName}} on {{date}} at {{time}}. Book now before it fills up!',
    variables: ['activityName', 'date', 'time'],
  },
];

// =====================================================
// SEND REQUEST TYPES
// =====================================================

export interface SendSMSRequest {
  phoneNumber: string;
  message: string;
  bookingId?: string;
  organizationId?: string;
  type?: SMSReminderType | 'notification';
}

export interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ScheduleSMSRequest {
  bookingId: string;
  phoneNumber: string;
  type: SMSReminderType;
  scheduledAt: string;
  templateVariables: Record<string, string>;
}

// =====================================================
// UI STATE
// =====================================================

export interface SMSOptInState {
  phoneNumber: string;
  isOptedIn: boolean;
  selectedReminders: SMSReminderType[];
  isSubmitting: boolean;
  error: string | null;
}
