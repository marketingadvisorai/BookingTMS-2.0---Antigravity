/**
 * Send Booking Confirmation Email
 * 
 * Sends booking confirmation with QR code via Supabase Edge Function.
 * @module lib/email/sendBookingConfirmation
 */
import { supabase } from '../supabase/client';
import { generateQRPayload, generateQRCodeDataURL } from '../qr';
import { generateBookingConfirmationEmail, generateBookingConfirmationText } from './bookingEmailTemplate';
import type { BookingEmailData } from './bookingEmailTemplate';

export interface SendConfirmationParams {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  confirmationCode: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  groupSize: number;
  totalAmount: number;
  currency?: string;
  venueAddress?: string;
  specialInstructions?: string;
}

export interface SendConfirmationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send booking confirmation email with QR code
 */
export async function sendBookingConfirmationEmail(
  params: SendConfirmationParams
): Promise<SendConfirmationResult> {
  try {
    // Generate QR code payload and data URL
    const qrPayload = await generateQRPayload({
      id: params.bookingId,
      confirmationCode: params.confirmationCode,
      email: params.customerEmail,
      date: params.date,
      time: params.time,
      activityName: params.activityName,
      venueName: params.venueName,
      groupSize: params.groupSize,
    });

    const qrCodeDataUrl = await generateQRCodeDataURL(qrPayload, { size: 200 });

    // Prepare email data
    const emailData: BookingEmailData = {
      customerName: params.customerName,
      confirmationCode: params.confirmationCode,
      activityName: params.activityName,
      venueName: params.venueName,
      date: params.date,
      time: params.time,
      groupSize: params.groupSize,
      totalAmount: params.totalAmount,
      currency: params.currency || 'USD',
      qrCodeDataUrl,
      venueAddress: params.venueAddress,
      specialInstructions: params.specialInstructions,
    };

    // Generate email content
    const htmlContent = generateBookingConfirmationEmail(emailData);
    const textContent = generateBookingConfirmationText(emailData);

    // Send via edge function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.customerEmail,
        subject: `Booking Confirmed! ${params.confirmationCode} - ${params.activityName}`,
        html: htmlContent,
        text: textContent,
        recipientName: params.customerName,
      },
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: data?.messageId,
    };
  } catch (error) {
    console.error('Error in sendBookingConfirmationEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

/** Booking data structure for email */
interface BookingForEmail {
  id: string;
  confirmation_code: string;
  booking_date: string;
  start_time: string;
  group_size: number;
  total_amount: number;
  customer: { email: string; first_name?: string; last_name?: string } | null;
  activity: { name: string } | null;
  venue: { name: string; address?: string; city?: string; state?: string } | null;
}

/**
 * Re-send booking confirmation (for existing bookings)
 */
export async function resendBookingConfirmation(bookingId: string): Promise<SendConfirmationResult> {
  try {
    // Fetch booking data
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        confirmation_code,
        booking_date,
        start_time,
        group_size,
        total_amount,
        customer:customers(email, first_name, last_name),
        activity:activities(name),
        venue:venues(name, address, city, state)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    // Type assertion for the complex query result
    const booking = data as unknown as BookingForEmail;
    const customer = booking.customer;
    const activity = booking.activity;
    const venue = booking.venue;

    if (!customer?.email) {
      return {
        success: false,
        error: 'Customer email not found',
      };
    }

    const venueAddress = venue?.address 
      ? `${venue.address}${venue.city ? `, ${venue.city}` : ''}${venue.state ? `, ${venue.state}` : ''}`
      : undefined;

    return sendBookingConfirmationEmail({
      bookingId: booking.id,
      customerEmail: customer.email,
      customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Guest',
      confirmationCode: booking.confirmation_code,
      activityName: activity?.name || 'Activity',
      venueName: venue?.name || 'Venue',
      date: booking.booking_date,
      time: booking.start_time,
      groupSize: booking.group_size || 1,
      totalAmount: booking.total_amount || 0,
      venueAddress,
    });
  } catch (error) {
    console.error('Error in resendBookingConfirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
