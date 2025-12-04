/**
 * Settings Module - Data Mappers
 * @module settings/utils/mappers
 */

import {
  OrganizationSettings,
  DBOrganizationSettings,
  NotificationPreferences,
  DBNotificationPreferences,
} from '../types';

// ============================================================================
// Organization Settings Mappers
// ============================================================================

export function mapDBSettingsToUI(db: DBOrganizationSettings): OrganizationSettings {
  return {
    id: db.id,
    organizationId: db.organization_id,
    businessName: db.business_name || '',
    businessEmail: db.business_email || '',
    businessPhone: db.business_phone || '',
    businessAddress: db.business_address || '',
    timezone: db.timezone || 'America/New_York',
    currency: db.currency || 'USD',
    dateFormat: db.date_format || 'MM/DD/YYYY',
    timeFormat: db.time_format || '12h',
    logoUrl: db.logo_url,
    faviconUrl: db.favicon_url,
    primaryColor: db.primary_color || '#4f46e5',
    accentColor: db.accent_color || '#6366f1',
    advanceBookingDays: db.advance_booking_days || 30,
    minBookingNoticeHours: db.min_booking_notice_hours || 2,
    allowSameDayBooking: db.allow_same_day_booking ?? true,
    requireDeposit: db.require_deposit ?? false,
    depositPercentage: db.deposit_percentage || 0,
    cancellationPolicy: db.cancellation_policy,
    cancellationHours: db.cancellation_hours || 24,
    emailFromName: db.email_from_name,
    emailReplyTo: db.email_reply_to,
    emailSignature: db.email_signature,
    googleAnalyticsId: db.google_analytics_id,
    facebookPixelId: db.facebook_pixel_id,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function mapUISettingsToDBUpdate(
  data: Partial<OrganizationSettings>
): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (data.businessName !== undefined) update.business_name = data.businessName;
  if (data.businessEmail !== undefined) update.business_email = data.businessEmail;
  if (data.businessPhone !== undefined) update.business_phone = data.businessPhone;
  if (data.businessAddress !== undefined) update.business_address = data.businessAddress;
  if (data.timezone !== undefined) update.timezone = data.timezone;
  if (data.currency !== undefined) update.currency = data.currency;
  if (data.dateFormat !== undefined) update.date_format = data.dateFormat;
  if (data.timeFormat !== undefined) update.time_format = data.timeFormat;
  if (data.logoUrl !== undefined) update.logo_url = data.logoUrl;
  if (data.primaryColor !== undefined) update.primary_color = data.primaryColor;
  if (data.accentColor !== undefined) update.accent_color = data.accentColor;
  if (data.advanceBookingDays !== undefined) update.advance_booking_days = data.advanceBookingDays;
  if (data.minBookingNoticeHours !== undefined) update.min_booking_notice_hours = data.minBookingNoticeHours;
  if (data.allowSameDayBooking !== undefined) update.allow_same_day_booking = data.allowSameDayBooking;
  if (data.requireDeposit !== undefined) update.require_deposit = data.requireDeposit;
  if (data.depositPercentage !== undefined) update.deposit_percentage = data.depositPercentage;
  if (data.cancellationPolicy !== undefined) update.cancellation_policy = data.cancellationPolicy;
  if (data.cancellationHours !== undefined) update.cancellation_hours = data.cancellationHours;
  if (data.emailFromName !== undefined) update.email_from_name = data.emailFromName;
  if (data.emailReplyTo !== undefined) update.email_reply_to = data.emailReplyTo;
  if (data.emailSignature !== undefined) update.email_signature = data.emailSignature;
  if (data.googleAnalyticsId !== undefined) update.google_analytics_id = data.googleAnalyticsId;
  if (data.facebookPixelId !== undefined) update.facebook_pixel_id = data.facebookPixelId;

  return update;
}

// ============================================================================
// Notification Preferences Mappers
// ============================================================================

export function mapDBNotifToUI(db: DBNotificationPreferences): NotificationPreferences {
  return {
    id: db.id,
    organizationId: db.organization_id,
    userId: db.user_id,
    emailNewBookings: db.email_new_bookings ?? true,
    emailBookingChanges: db.email_booking_changes ?? true,
    emailCancellations: db.email_cancellations ?? true,
    emailDailyReports: db.email_daily_reports ?? false,
    emailWeeklyReports: db.email_weekly_reports ?? true,
    emailPaymentReceived: db.email_payment_received ?? true,
    emailRefundProcessed: db.email_refund_processed ?? true,
    emailLowAvailability: db.email_low_availability ?? false,
    smsEnabled: db.sms_enabled ?? false,
    smsPhone: db.sms_phone,
    smsBookingReminders: db.sms_booking_reminders ?? false,
    smsUrgentAlerts: db.sms_urgent_alerts ?? false,
    pushEnabled: db.push_enabled ?? false,
    pushNewBookings: db.push_new_bookings ?? true,
    pushUrgentAlerts: db.push_urgent_alerts ?? true,
    quietHoursEnabled: db.quiet_hours_enabled ?? false,
    quietHoursStart: db.quiet_hours_start || '22:00',
    quietHoursEnd: db.quiet_hours_end || '08:00',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function mapUINotifToDBUpdate(
  data: Partial<NotificationPreferences>
): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (data.emailNewBookings !== undefined) update.email_new_bookings = data.emailNewBookings;
  if (data.emailBookingChanges !== undefined) update.email_booking_changes = data.emailBookingChanges;
  if (data.emailCancellations !== undefined) update.email_cancellations = data.emailCancellations;
  if (data.emailDailyReports !== undefined) update.email_daily_reports = data.emailDailyReports;
  if (data.emailWeeklyReports !== undefined) update.email_weekly_reports = data.emailWeeklyReports;
  if (data.emailPaymentReceived !== undefined) update.email_payment_received = data.emailPaymentReceived;
  if (data.emailRefundProcessed !== undefined) update.email_refund_processed = data.emailRefundProcessed;
  if (data.emailLowAvailability !== undefined) update.email_low_availability = data.emailLowAvailability;
  if (data.smsEnabled !== undefined) update.sms_enabled = data.smsEnabled;
  if (data.smsPhone !== undefined) update.sms_phone = data.smsPhone;
  if (data.smsBookingReminders !== undefined) update.sms_booking_reminders = data.smsBookingReminders;
  if (data.smsUrgentAlerts !== undefined) update.sms_urgent_alerts = data.smsUrgentAlerts;
  if (data.pushEnabled !== undefined) update.push_enabled = data.pushEnabled;
  if (data.pushNewBookings !== undefined) update.push_new_bookings = data.pushNewBookings;
  if (data.pushUrgentAlerts !== undefined) update.push_urgent_alerts = data.pushUrgentAlerts;
  if (data.quietHoursEnabled !== undefined) update.quiet_hours_enabled = data.quietHoursEnabled;
  if (data.quietHoursStart !== undefined) update.quiet_hours_start = data.quietHoursStart;
  if (data.quietHoursEnd !== undefined) update.quiet_hours_end = data.quietHoursEnd;

  return update;
}
