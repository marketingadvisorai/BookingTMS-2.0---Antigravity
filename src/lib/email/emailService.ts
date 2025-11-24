import { supabase } from '../supabase/client';
import { BookingConfirmationEmailTemplate } from './templates/bookingConfirmationWithQR';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  campaignId?: string;
  customerId?: string;
  recipientName?: string;
}

export interface BookingData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_id?: string;
  room_name: string;
  date: string;
  time: string;
  player_count: number;
  total_amount: number;
  waiver_template_id?: string;
}

export class EmailService {
  /**
   * Send a generic email via Supabase Edge Function
   */
  static async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; data?: any; error?: any }> {
    // Check if we are in development mode
    const isDev = import.meta.env?.DEV;

    if (isDev) {
      console.log('📧 [DEV MODE] Mocking email send:', {
        to: options.to,
        subject: options.subject,
        templateId: options.templateId
      });
      return { success: true, data: { id: 'mock-email-id', message: 'Email mocked in dev mode' } };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: options
      });

      if (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
      }

      console.log('✅ Email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send booking confirmation email with QR code
   */
  static async sendBookingConfirmation(
    booking: BookingData,
    businessInfo: {
      name: string;
      address: string;
      phone: string;
      baseUrl?: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      // Format booking date
      const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Generate waiver URL if template exists
      const baseUrl = businessInfo.baseUrl || window.location.origin;
      const waiverUrl = booking.waiver_template_id
        ? `${baseUrl}/waiver/${booking.waiver_template_id}`
        : undefined;

      // Generate email HTML with QR code
      const emailHTML = await BookingConfirmationEmailTemplate.generateHTML({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        bookingId: booking.id,
        escaperoomName: booking.room_name,
        bookingDate: bookingDate,
        bookingTime: booking.time,
        playerCount: booking.player_count,
        totalAmount: `$${booking.total_amount.toFixed(2)}`,
        businessName: businessInfo.name,
        businessAddress: businessInfo.address,
        businessPhone: businessInfo.phone,
        waiverUrl: waiverUrl,
        waiverTemplateId: booking.waiver_template_id,
        qrCodeEnabled: !!waiverUrl, // Enable QR if waiver exists
        qrCodeMessage: 'Scan this QR code to complete your waiver before your visit'
      });

      const emailText = BookingConfirmationEmailTemplate.generatePlainText({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        bookingId: booking.id,
        escaperoomName: booking.room_name,
        bookingDate: bookingDate,
        bookingTime: booking.time,
        playerCount: booking.player_count,
        totalAmount: `$${booking.total_amount.toFixed(2)}`,
        businessName: businessInfo.name,
        businessAddress: businessInfo.address,
        businessPhone: businessInfo.phone,
        waiverUrl: waiverUrl
      });

      // Send email
      return await this.sendEmail({
        to: booking.customer_email,
        subject: `🎉 Booking Confirmed - ${booking.room_name}`,
        html: emailHTML,
        text: emailText,
        customerId: booking.customer_id,
        recipientName: booking.customer_name
      });
    } catch (error) {
      console.error('❌ Failed to send booking confirmation:', error);
      return { success: false, error };
    }
  }

  /**
   * Send waiver reminder email
   */
  static async sendWaiverReminder(
    booking: BookingData,
    waiverUrl: string
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Complete Your Waiver</h1>
            </div>
            <div class="content">
              <p>Hi ${booking.customer_name},</p>
              <p>You have an upcoming booking for <strong>${booking.room_name}</strong> on <strong>${booking.date}</strong> at <strong>${booking.time}</strong>.</p>
              <p>Please complete your waiver form before your visit to ensure a smooth check-in process.</p>
              <center>
                <a href="${waiverUrl}?booking=${booking.id}&source=reminder" class="button">
                  Complete Waiver Now
                </a>
              </center>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Or copy this link: <br>
                <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                  ${waiverUrl}?booking=${booking.id}
                </code>
              </p>
            </div>
            <div class="footer">
              <p>See you soon!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({
        to: booking.customer_email,
        subject: `📝 Complete Your Waiver - ${booking.room_name}`,
        html: html,
        customerId: booking.customer_id,
        recipientName: booking.customer_name
      });
    } catch (error) {
      console.error('❌ Failed to send waiver reminder:', error);
      return { success: false, error };
    }
  }

  /**
   * Send booking reminder (24h before)
   */
  static async sendBookingReminder(
    booking: BookingData,
    businessInfo: { name: string; address: string; phone: string }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Reminder: Your Booking Tomorrow</h1>
            </div>
            <div class="content">
              <p>Hi ${booking.customer_name},</p>
              <p>This is a friendly reminder about your upcoming booking:</p>
              <div class="info-box">
                <strong>Escape Room:</strong> ${booking.room_name}<br>
                <strong>Date:</strong> ${booking.date}<br>
                <strong>Time:</strong> ${booking.time}<br>
                <strong>Players:</strong> ${booking.player_count}<br>
                <strong>Booking ID:</strong> ${booking.id}
              </div>
              <p><strong>⚠️ Important Reminders:</strong></p>
              <ul>
                <li>Please arrive <strong>15 minutes early</strong> for check-in</li>
                <li>Bring a valid ID for verification</li>
                <li>All participants must have completed their waiver</li>
              </ul>
              <p><strong>📍 Location:</strong><br>
              ${businessInfo.name}<br>
              ${businessInfo.address}<br>
              Phone: ${businessInfo.phone}</p>
            </div>
            <div class="footer">
              <p>We're excited to see you tomorrow!</p>
              <p>Questions? Call us at ${businessInfo.phone}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({
        to: booking.customer_email,
        subject: `⏰ Reminder: Your booking tomorrow at ${booking.time}`,
        html: html,
        customerId: booking.customer_id,
        recipientName: booking.customer_name
      });
    } catch (error) {
      console.error('❌ Failed to send booking reminder:', error);
      return { success: false, error };
    }
  }

  /**
   * Send test email
   */
  static async sendTestEmail(toEmail: string): Promise<{ success: boolean; data?: any; error?: any }> {
    return await this.sendEmail({
      to: toEmail,
      subject: 'Test Email from Booking TMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">✅ Email System Working!</h1>
          <p>This is a test email from your Booking TMS system.</p>
          <p>If you received this, your email system is configured correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}<br>
            System: Booking TMS Email Service<br>
            Provider: Resend
          </p>
        </div>
      `,
      text: 'This is a test email from your Booking TMS system. If you received this, your email system is configured correctly!'
    });
  }
}
