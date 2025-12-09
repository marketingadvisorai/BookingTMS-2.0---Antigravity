/**
 * Settings Module - Type Definitions
 * @module settings/types
 */

// ============================================================================
// Organization Settings Types
// ============================================================================

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  
  // Business Info
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  
  // Branding
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  accentColor: string;
  
  // Booking Settings
  advanceBookingDays: number;
  minBookingNoticeHours: number;
  allowSameDayBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy?: string;
  cancellationHours: number;
  
  // Email Settings
  emailFromName?: string;
  emailReplyTo?: string;
  emailSignature?: string;
  
  // Integration Settings
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DBOrganizationSettings {
  id: string;
  organization_id: string;
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  accent_color: string;
  advance_booking_days: number;
  min_booking_notice_hours: number;
  allow_same_day_booking: boolean;
  require_deposit: boolean;
  deposit_percentage: number;
  cancellation_policy?: string;
  cancellation_hours: number;
  email_from_name?: string;
  email_reply_to?: string;
  email_signature?: string;
  google_analytics_id?: string;
  facebook_pixel_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Notification Preferences Types
// ============================================================================

export interface NotificationPreferences {
  id: string;
  organizationId: string;
  userId?: string;
  
  // Email
  emailNewBookings: boolean;
  emailBookingChanges: boolean;
  emailCancellations: boolean;
  emailDailyReports: boolean;
  emailWeeklyReports: boolean;
  emailPaymentReceived: boolean;
  emailRefundProcessed: boolean;
  emailLowAvailability: boolean;
  
  // SMS
  smsEnabled: boolean;
  smsPhone?: string;
  smsBookingReminders: boolean;
  smsUrgentAlerts: boolean;
  
  // Push
  pushEnabled: boolean;
  pushNewBookings: boolean;
  pushUrgentAlerts: boolean;
  
  // Schedule
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DBNotificationPreferences {
  id: string;
  organization_id: string;
  user_id?: string;
  email_new_bookings: boolean;
  email_booking_changes: boolean;
  email_cancellations: boolean;
  email_daily_reports: boolean;
  email_weekly_reports: boolean;
  email_payment_received: boolean;
  email_refund_processed: boolean;
  email_low_availability: boolean;
  sms_enabled: boolean;
  sms_phone?: string;
  sms_booking_reminders: boolean;
  sms_urgent_alerts: boolean;
  push_enabled: boolean;
  push_new_bookings: boolean;
  push_urgent_alerts: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface BusinessInfoFormData {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  timezone: string;
}

export interface NotificationFormData {
  emailNewBookings: boolean;
  emailCancellations: boolean;
  emailDailyReports: boolean;
  smsEnabled: boolean;
  smsBookingReminders: boolean;
  smsUrgentAlerts: boolean;
}

export interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * USA Time Zones Only
 * All IANA timezone identifiers for United States regions
 */
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (No DST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'America/Adak', label: 'Hawaii-Aleutian (HST)' },
  { value: 'America/Detroit', label: 'Eastern Time (Detroit)' },
  { value: 'America/Indiana/Indianapolis', label: 'Eastern Time (Indiana)' },
  { value: 'America/Boise', label: 'Mountain Time (Boise)' },
];

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
];

export type SettingsTab = 'business' | 'payments' | 'notifications' | 'security' | 'appearance';
