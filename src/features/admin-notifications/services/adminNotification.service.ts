/**
 * Admin Notification Service
 * Handles sending notifications to organization admins via email/Slack
 */

import { supabase } from '@/lib/supabase';
import type {
  AdminNotificationPayload,
  BookingNotificationData,
  AdminNotificationConfig,
} from '../types';

class AdminNotificationService {
  /**
   * Send notification for a new booking
   */
  async notifyNewBooking(data: BookingNotificationData): Promise<void> {
    const payload: AdminNotificationPayload = {
      event: 'new_booking',
      organizationId: '', // Will be derived from booking
      data,
      timestamp: new Date().toISOString(),
    };

    await this.sendNotifications(payload);
  }

  /**
   * Send notifications based on payload
   */
  private async sendNotifications(payload: AdminNotificationPayload): Promise<void> {
    try {
      // Get notification configs for organization
      const configs = await this.getNotificationConfigs(payload.organizationId);
      
      for (const config of configs) {
        if (!config.isEnabled || !config.events.includes(payload.event)) {
          continue;
        }

        switch (config.channel) {
          case 'email':
            await this.sendEmailNotification(config, payload);
            break;
          case 'slack':
            await this.sendSlackNotification(config, payload);
            break;
          case 'in_app':
            await this.createInAppNotification(config, payload);
            break;
        }
      }
    } catch (error) {
      console.error('Failed to send admin notifications:', error);
    }
  }

  /**
   * Get notification configs for an organization
   */
  private async getNotificationConfigs(
    organizationId: string
  ): Promise<AdminNotificationConfig[]> {
    // For now, return org admin emails from organization_members
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_id, users(email)')
      .eq('organization_id', organizationId)
      .in('role', ['admin', 'owner']);

    if (!members?.length) {
      return [];
    }

    // Create default email config
    const emails = members
      .map((m) => (m as any).users?.email)
      .filter(Boolean) as string[];

    return [
      {
        id: 'default',
        organizationId,
        channel: 'email',
        events: ['new_booking', 'booking_cancelled', 'high_value_booking'],
        recipients: emails,
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Send email notification via edge function
   */
  private async sendEmailNotification(
    config: AdminNotificationConfig,
    payload: AdminNotificationPayload
  ): Promise<void> {
    const data = payload.data as BookingNotificationData;
    const subject = this.getEmailSubject(payload.event, data);
    const html = this.buildEmailHtml(payload.event, data);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: config.recipients,
          subject,
          html,
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send admin email:', await response.text());
    }
  }

  /**
   * Send Slack notification via webhook
   */
  private async sendSlackNotification(
    config: AdminNotificationConfig,
    payload: AdminNotificationPayload
  ): Promise<void> {
    if (!config.slackWebhookUrl) return;

    const data = payload.data as BookingNotificationData;
    const message = this.buildSlackMessage(payload.event, data);

    const response = await fetch(config.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', await response.text());
    }
  }

  /**
   * Create in-app notification
   */
  private async createInAppNotification(
    config: AdminNotificationConfig,
    payload: AdminNotificationPayload
  ): Promise<void> {
    const data = payload.data as BookingNotificationData;
    
    await supabase.from('notifications').insert({
      organization_id: config.organizationId,
      type: 'booking',
      title: this.getEmailSubject(payload.event, data),
      message: this.getNotificationMessage(payload.event, data),
      metadata: data,
      read: false,
    });
  }

  private getEmailSubject(
    event: string,
    data: BookingNotificationData
  ): string {
    switch (event) {
      case 'new_booking':
        return `🎉 New Booking: ${data.activityName} - ${data.bookingNumber}`;
      case 'booking_cancelled':
        return `❌ Booking Cancelled: ${data.bookingNumber}`;
      case 'high_value_booking':
        return `💰 High Value Booking: $${data.totalAmount} - ${data.bookingNumber}`;
      default:
        return `Booking Update: ${data.bookingNumber}`;
    }
  }

  private getNotificationMessage(
    event: string,
    data: BookingNotificationData
  ): string {
    switch (event) {
      case 'new_booking':
        return `${data.customerName} booked ${data.activityName} for ${data.partySize} on ${data.bookingDate}`;
      case 'booking_cancelled':
        return `Booking ${data.bookingNumber} was cancelled`;
      default:
        return `Booking ${data.bookingNumber} was updated`;
    }
  }

  private buildEmailHtml(
    event: string,
    data: BookingNotificationData
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; }
    .value { font-weight: bold; }
    .amount { color: #2563eb; font-size: 1.25rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin:0;">New Booking Received 🎉</h1>
  </div>
  <div class="content">
    <div class="detail-row">
      <span class="label">Booking Reference</span>
      <span class="value">${data.bookingNumber}</span>
    </div>
    <div class="detail-row">
      <span class="label">Customer</span>
      <span class="value">${data.customerName}</span>
    </div>
    <div class="detail-row">
      <span class="label">Email</span>
      <span class="value">${data.customerEmail}</span>
    </div>
    <div class="detail-row">
      <span class="label">Activity</span>
      <span class="value">${data.activityName}</span>
    </div>
    <div class="detail-row">
      <span class="label">Venue</span>
      <span class="value">${data.venueName}</span>
    </div>
    <div class="detail-row">
      <span class="label">Date & Time</span>
      <span class="value">${data.bookingDate} at ${data.bookingTime}</span>
    </div>
    <div class="detail-row">
      <span class="label">Party Size</span>
      <span class="value">${data.partySize} people</span>
    </div>
    <div class="detail-row">
      <span class="label">Total Amount</span>
      <span class="value amount">$${data.totalAmount.toFixed(2)}</span>
    </div>
    <p style="margin-top:20px;color:#666;font-size:14px;">
      View this booking in your admin dashboard.
    </p>
  </div>
</body>
</html>`.trim();
  }

  private buildSlackMessage(
    event: string,
    data: BookingNotificationData
  ): Record<string, unknown> {
    return {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🎉 New Booking Received!' },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Booking:*\n${data.bookingNumber}` },
            { type: 'mrkdwn', text: `*Customer:*\n${data.customerName}` },
            { type: 'mrkdwn', text: `*Activity:*\n${data.activityName}` },
            { type: 'mrkdwn', text: `*Date:*\n${data.bookingDate}` },
            { type: 'mrkdwn', text: `*Time:*\n${data.bookingTime}` },
            { type: 'mrkdwn', text: `*Party Size:*\n${data.partySize}` },
            { type: 'mrkdwn', text: `*Amount:*\n$${data.totalAmount.toFixed(2)}` },
          ],
        },
      ],
    };
  }
}

export const adminNotificationService = new AdminNotificationService();
