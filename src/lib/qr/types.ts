/**
 * QR Ticket System Types
 * 
 * Types for QR code generation, scanning, and check-in operations.
 * @module lib/qr/types
 */

/** QR code payload structure embedded in the code */
export interface QRCodePayload {
  /** Unique booking ID */
  bookingId: string;
  /** Booking confirmation code (e.g., BK-XXXXX) */
  confirmationCode: string;
  /** Customer email for verification */
  email: string;
  /** Booking date (YYYY-MM-DD) */
  date: string;
  /** Booking time (HH:MM) */
  time: string;
  /** Activity/game name */
  activityName: string;
  /** Venue name */
  venueName: string;
  /** Group size */
  groupSize: number;
  /** HMAC signature for validation */
  signature: string;
  /** Timestamp when QR was generated */
  generatedAt: string;
}

/** Check-in status types */
export type CheckInStatus = 'pending' | 'checked_in' | 'checked_out' | 'no_show' | 'cancelled';

/** Result from QR code scan and validation */
export interface QRScanResult {
  valid: boolean;
  payload?: QRCodePayload;
  error?: string;
  booking?: {
    id: string;
    customer: string;
    email: string;
    activityName: string;
    date: string;
    time: string;
    groupSize: number;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
}

/** Check-in request sent to edge function */
export interface CheckInRequest {
  bookingId: string;
  signature: string;
  action: 'check_in' | 'check_out';
  scannedBy?: string;
}

/** Check-in response from edge function */
export interface CheckInResponse {
  success: boolean;
  message: string;
  booking?: {
    id: string;
    confirmationCode: string;
    customer: string;
    activityName: string;
    date: string;
    time: string;
    groupSize: number;
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
  };
  error?: string;
  alreadyCheckedIn?: boolean;
}

/** QR code display configuration */
export interface QRCodeConfig {
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  bgColor: string;
  fgColor: string;
}

/** Default QR code configuration */
export const DEFAULT_QR_CONFIG: QRCodeConfig = {
  size: 256,
  level: 'H', // High error correction for better scanning
  includeMargin: true,
  bgColor: '#FFFFFF',
  fgColor: '#000000',
};
