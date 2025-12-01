/**
 * Embed Pro 2.0 - SMS Reminder Service
 * @module embed-pro/services/sms-reminder.service
 * 
 * Service for sending SMS reminders via Twilio.
 * Handles template rendering, scheduling, and sending.
 * 
 * Uses Supabase Edge Function: /functions/v1/send-sms
 */

import { supabase } from '@/lib/supabase';
import type {
  SMSReminder,
  SMSReminderType,
  SMSReminderSettings,
  SendSMSRequest,
  SendSMSResponse,
  ScheduleSMSRequest,
  SMS_TEMPLATES,
  DEFAULT_SMS_SETTINGS,
} from '../types/sms-reminder.types';

// =====================================================
// SERVICE CLASS
// =====================================================

class SMSReminderService {
  private settings: SMSReminderSettings = {
    enabled: true,
    sendConfirmation: true,
    send24hReminder: true,
    send2hReminder: false,
    send1hReminder: true,
    sendCancellation: true,
  };

  /**
   * Send SMS immediately via Twilio Edge Function
   */
  async sendSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    try {
      // Validate phone number
      const cleanPhone = this.cleanPhoneNumber(request.phoneNumber);
      if (!this.isValidPhoneNumber(cleanPhone)) {
        return { success: false, error: 'Invalid phone number' };
      }

      console.log('[SMSService] Sending SMS via Twilio:', {
        to: cleanPhone.slice(-4),
        type: request.type || 'notification',
      });

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: cleanPhone,
          message: request.message,
          type: request.type || 'notification',
          bookingId: request.bookingId,
          organizationId: request.organizationId,
        },
      });

      if (error) {
        console.error('[SMSService] Edge function error:', error);
        return { success: false, error: error.message || 'SMS service error' };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to send SMS' };
      }

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (err) {
      console.error('[SMSService] Error sending SMS:', err);
      return { success: false, error: 'Failed to send SMS' };
    }
  }

  /**
   * Schedule SMS reminder for booking
   */
  async scheduleReminder(request: ScheduleSMSRequest): Promise<SMSReminder> {
    const message = this.renderTemplate(request.type, request.templateVariables);
    
    const reminder: SMSReminder = {
      id: this.generateId(),
      bookingId: request.bookingId,
      type: request.type,
      phoneNumber: this.cleanPhoneNumber(request.phoneNumber),
      message,
      scheduledAt: request.scheduledAt,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // In production, save to database and set up cron job
    console.log('[SMSService] Scheduled reminder:', {
      type: request.type,
      scheduledAt: request.scheduledAt,
    });

    return reminder;
  }

  /**
   * Schedule all reminders for a booking
   */
  async scheduleBookingReminders(booking: {
    id: string;
    customerName: string;
    customerPhone: string;
    activityName: string;
    venueName: string;
    startTime: string;
    bookingRef: string;
  }): Promise<SMSReminder[]> {
    const reminders: SMSReminder[] = [];
    const startDate = new Date(booking.startTime);
    const variables = {
      customerName: booking.customerName,
      activityName: booking.activityName,
      venueName: booking.venueName,
      bookingRef: booking.bookingRef,
      date: this.formatDate(startDate),
      time: this.formatTime(startDate),
    };

    // Confirmation
    if (this.settings.sendConfirmation) {
      const confirmation = await this.scheduleReminder({
        bookingId: booking.id,
        phoneNumber: booking.customerPhone,
        type: 'booking_confirmation',
        scheduledAt: new Date().toISOString(), // Send immediately
        templateVariables: variables,
      });
      reminders.push(confirmation);
    }

    // 24 hour reminder
    if (this.settings.send24hReminder) {
      const reminder24h = new Date(startDate);
      reminder24h.setHours(reminder24h.getHours() - 24);
      
      if (reminder24h > new Date()) {
        const reminder = await this.scheduleReminder({
          bookingId: booking.id,
          phoneNumber: booking.customerPhone,
          type: 'reminder_24h',
          scheduledAt: reminder24h.toISOString(),
          templateVariables: variables,
        });
        reminders.push(reminder);
      }
    }

    // 1 hour reminder
    if (this.settings.send1hReminder) {
      const reminder1h = new Date(startDate);
      reminder1h.setHours(reminder1h.getHours() - 1);
      
      if (reminder1h > new Date()) {
        const reminder = await this.scheduleReminder({
          bookingId: booking.id,
          phoneNumber: booking.customerPhone,
          type: 'reminder_1h',
          scheduledAt: reminder1h.toISOString(),
          templateVariables: variables,
        });
        reminders.push(reminder);
      }
    }

    return reminders;
  }

  /**
   * Render message from template
   */
  renderTemplate(type: SMSReminderType, variables: Record<string, string>): string {
    const templates: Record<SMSReminderType, string> = {
      booking_confirmation: 'Hi {{customerName}}! Your booking for {{activityName}} on {{date}} at {{time}} is confirmed. Ref: {{bookingRef}}. See you at {{venueName}}!',
      reminder_24h: 'Reminder: Your {{activityName}} booking is tomorrow at {{time}}. Location: {{venueName}}. Ref: {{bookingRef}}',
      reminder_2h: 'Your {{activityName}} starts in 2 hours at {{time}}. Please arrive 10 min early. Location: {{venueName}}',
      reminder_1h: 'Your {{activityName}} starts in 1 hour! Time: {{time}}. Location: {{venueName}}. See you soon!',
      cancellation: 'Your booking for {{activityName}} on {{date}} at {{time}} has been cancelled. Ref: {{bookingRef}}. Contact us with questions.',
      reschedule: 'Your {{activityName}} booking has been rescheduled to {{date}} at {{time}}. Ref: {{bookingRef}}',
      waitlist_available: 'Good news! A spot opened for {{activityName}} on {{date}} at {{time}}. Book now before it fills up!',
    };

    let message = templates[type] || '';
    
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    return message;
  }

  /**
   * Cancel pending reminders for a booking
   */
  async cancelBookingReminders(bookingId: string): Promise<void> {
    console.log('[SMSService] Cancelling reminders for booking:', bookingId);
    // In production, update database records
  }

  /**
   * Update reminder settings
   */
  updateSettings(settings: Partial<SMSReminderSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): SMSReminderSettings {
    return { ...this.settings };
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private generateId(): string {
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation - at least 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Format phone for display
   */
  formatPhoneForDisplay(phone: string): string {
    const clean = this.cleanPhoneNumber(phone);
    if (clean.length === 10) {
      return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    if (clean.length === 11 && clean.startsWith('1')) {
      return `+1 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7)}`;
    }
    return phone;
  }
}

// Export singleton
export const smsReminderService = new SMSReminderService();
export default smsReminderService;
