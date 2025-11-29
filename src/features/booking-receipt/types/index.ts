/**
 * Booking Receipt Types
 * Types for PDF receipt generation
 */

export interface ReceiptData {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  activityName: string;
  venueName: string;
  venueAddress?: string;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  discountCode?: string;
  tax?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface ReceiptConfig {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  primaryColor?: string;
  showQrCode?: boolean;
}
