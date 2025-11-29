/**
 * QR Code Service
 * 
 * Generates and validates QR codes for booking tickets.
 * Uses HMAC signatures for security.
 * @module lib/qr/qrService
 */
import QRCode from 'qrcode';
import type { QRCodePayload, QRScanResult, CheckInRequest, CheckInResponse, QRCodeConfig } from './types';
import { DEFAULT_QR_CONFIG } from './types';
import { supabase } from '../supabase/client';

/** Secret for HMAC signature - should be in env vars in production */
const QR_SECRET = import.meta.env.VITE_QR_SECRET || 'booking-tms-qr-secret-key-2025';

/**
 * Generate HMAC signature for QR payload
 */
async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(QR_SECRET);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify HMAC signature
 */
async function verifySignature(data: string, signature: string): Promise<boolean> {
  const expectedSignature = await generateSignature(data);
  return expectedSignature === signature;
}

/**
 * Generate QR code payload for a booking
 */
export async function generateQRPayload(booking: {
  id: string;
  confirmationCode: string;
  email: string;
  date: string;
  time: string;
  activityName: string;
  venueName: string;
  groupSize: number;
}): Promise<QRCodePayload> {
  const dataToSign = `${booking.id}:${booking.confirmationCode}:${booking.email}:${booking.date}`;
  const signature = await generateSignature(dataToSign);
  
  return {
    bookingId: booking.id,
    confirmationCode: booking.confirmationCode,
    email: booking.email,
    date: booking.date,
    time: booking.time,
    activityName: booking.activityName,
    venueName: booking.venueName,
    groupSize: booking.groupSize,
    signature,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate QR code as Data URL
 */
export async function generateQRCodeDataURL(
  payload: QRCodePayload,
  config: Partial<QRCodeConfig> = {}
): Promise<string> {
  const fullConfig = { ...DEFAULT_QR_CONFIG, ...config };
  const jsonPayload = JSON.stringify(payload);
  
  return QRCode.toDataURL(jsonPayload, {
    width: fullConfig.size,
    errorCorrectionLevel: fullConfig.level,
    margin: fullConfig.includeMargin ? 2 : 0,
    color: {
      dark: fullConfig.fgColor,
      light: fullConfig.bgColor,
    },
  });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  payload: QRCodePayload,
  config: Partial<QRCodeConfig> = {}
): Promise<string> {
  const fullConfig = { ...DEFAULT_QR_CONFIG, ...config };
  const jsonPayload = JSON.stringify(payload);
  
  return QRCode.toString(jsonPayload, {
    type: 'svg',
    width: fullConfig.size,
    errorCorrectionLevel: fullConfig.level,
    margin: fullConfig.includeMargin ? 2 : 0,
    color: {
      dark: fullConfig.fgColor,
      light: fullConfig.bgColor,
    },
  });
}

/**
 * Parse and validate QR code data
 */
export async function validateQRCode(qrData: string): Promise<QRScanResult> {
  try {
    const payload: QRCodePayload = JSON.parse(qrData);
    
    // Verify required fields
    if (!payload.bookingId || !payload.signature || !payload.confirmationCode) {
      return { valid: false, error: 'Invalid QR code format' };
    }
    
    // Verify signature
    const dataToVerify = `${payload.bookingId}:${payload.confirmationCode}:${payload.email}:${payload.date}`;
    const isValid = await verifySignature(dataToVerify, payload.signature);
    
    if (!isValid) {
      return { valid: false, error: 'Invalid QR code signature' };
    }
    
    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Could not parse QR code' };
  }
}

/**
 * Process check-in via edge function
 */
export async function processCheckIn(request: CheckInRequest): Promise<CheckInResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('qr-checkin', {
      body: request,
    });
    
    if (error) {
      return {
        success: false,
        message: 'Check-in failed',
        error: error.message,
      };
    }
    
    return data as CheckInResponse;
  } catch (error) {
    return {
      success: false,
      message: 'Check-in failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Booking data structure for QR generation */
interface BookingForQR {
  id: string;
  confirmation_code: string;
  customer: { email: string; first_name?: string; last_name?: string } | null;
  booking_date: string;
  start_time: string;
  group_size: number;
  activity: { name: string } | null;
  venue: { name: string } | null;
}

/**
 * Generate QR code for a booking by ID (fetches booking data)
 */
export async function generateBookingQR(bookingId: string): Promise<{
  success: boolean;
  dataUrl?: string;
  payload?: QRCodePayload;
  error?: string;
}> {
  try {
    // Fetch booking data
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        confirmation_code,
        customer:customers(email, first_name, last_name),
        booking_date,
        start_time,
        group_size,
        activity:activities(name),
        venue:venues(name)
      `)
      .eq('id', bookingId)
      .single();
    
    if (error || !data) {
      return { success: false, error: 'Booking not found' };
    }
    
    // Type assertion for the complex query result
    const booking = data as unknown as BookingForQR;
    
    const payload = await generateQRPayload({
      id: booking.id,
      confirmationCode: booking.confirmation_code,
      email: booking.customer?.email || '',
      date: booking.booking_date,
      time: booking.start_time,
      activityName: booking.activity?.name || 'Activity',
      venueName: booking.venue?.name || 'Venue',
      groupSize: booking.group_size || 1,
    });
    
    const dataUrl = await generateQRCodeDataURL(payload);
    
    return { success: true, dataUrl, payload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR code',
    };
  }
}

/** Export the default config */
export { DEFAULT_QR_CONFIG };
