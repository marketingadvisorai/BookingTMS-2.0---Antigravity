/**
 * Booking Receipt PDF Service
 * 
 * Generates downloadable PDF receipts for bookings.
 * Uses jsPDF for PDF generation.
 */

import { jsPDF } from 'jspdf';

export interface ReceiptBookingData {
  id: string;
  bookingNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  activityName: string;
  venueName: string;
  venueAddress?: string;
  date: string;
  time: string;
  endTime?: string;
  partySize: number;
  adults?: number;
  children?: number;
  subtotal?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  qrCodeDataUrl?: string;
}

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

/**
 * Generate a booking receipt PDF
 */
export function generateBookingReceiptPDF(
  booking: ReceiptBookingData,
  business: BusinessInfo
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
  const grayColor: [number, number, number] = [107, 114, 128];
  const darkColor: [number, number, number] = [17, 24, 39];

  // Header with business name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(business.name, pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Booking Receipt', pageWidth / 2, 35, { align: 'center' });

  y = 60;

  // Receipt number and date
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.text(`Receipt #: ${booking.bookingNumber || booking.id}`, 20, y);
  doc.text(
    `Date: ${new Date(booking.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`,
    pageWidth - 20,
    y,
    { align: 'right' }
  );

  y += 15;

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(20, y, pageWidth - 20, y);
  y += 15;

  // Customer Information Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 20, y);
  y += 10;

  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${booking.customerName}`, 20, y);
  y += 7;
  doc.text(`Email: ${booking.customerEmail}`, 20, y);
  y += 7;
  if (booking.customerPhone) {
    doc.text(`Phone: ${booking.customerPhone}`, 20, y);
    y += 7;
  }

  y += 10;

  // Booking Details Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Details', 20, y);
  y += 10;

  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Activity:', booking.activityName],
    ['Venue:', booking.venueName],
    ['Date:', formatDate(booking.date)],
    ['Time:', `${booking.time}${booking.endTime ? ` - ${booking.endTime}` : ''}`],
    ['Party Size:', `${booking.partySize} people`],
  ];

  if (booking.adults !== undefined || booking.children !== undefined) {
    details.push(['Breakdown:', `${booking.adults || 0} adults, ${booking.children || 0} children`]);
  }

  details.forEach(([label, value]) => {
    doc.setTextColor(...grayColor);
    doc.text(label, 20, y);
    doc.setTextColor(...darkColor);
    doc.text(value, 70, y);
    y += 7;
  });

  y += 10;

  // Payment Summary Section
  doc.setDrawColor(229, 231, 235);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', 20, y);
  y += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Subtotal
  if (booking.subtotal !== undefined) {
    doc.setTextColor(...grayColor);
    doc.text('Subtotal:', 20, y);
    doc.setTextColor(...darkColor);
    doc.text(formatCurrency(booking.subtotal), pageWidth - 20, y, { align: 'right' });
    y += 7;
  }

  // Discount
  if (booking.discount && booking.discount > 0) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text('Discount:', 20, y);
    doc.text(`-${formatCurrency(booking.discount)}`, pageWidth - 20, y, { align: 'right' });
    y += 7;
  }

  // Total
  doc.setDrawColor(229, 231, 235);
  doc.line(pageWidth - 80, y, pageWidth - 20, y);
  y += 8;

  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, y);
  doc.text(formatCurrency(booking.totalAmount), pageWidth - 20, y, { align: 'right' });
  y += 10;

  // Payment method and status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (booking.paymentMethod) {
    doc.setTextColor(...grayColor);
    doc.text(`Payment Method: ${booking.paymentMethod}`, 20, y);
    y += 7;
  }
  if (booking.paymentStatus) {
    const statusColor = booking.paymentStatus === 'paid' ? [16, 185, 129] : [245, 158, 11];
    doc.setTextColor(...(statusColor as [number, number, number]));
    doc.text(`Status: ${booking.paymentStatus.toUpperCase()}`, 20, y);
    y += 7;
  }

  y += 15;

  // QR Code (if provided)
  if (booking.qrCodeDataUrl) {
    try {
      doc.addImage(booking.qrCodeDataUrl, 'PNG', pageWidth / 2 - 25, y, 50, 50);
      y += 55;
      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.text('Scan for check-in', pageWidth / 2, y, { align: 'center' });
      y += 15;
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e);
    }
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.text('Thank you for your booking!', pageWidth / 2, footerY, { align: 'center' });

  if (business.address) {
    doc.text(business.address, pageWidth / 2, footerY + 5, { align: 'center' });
  }
  if (business.phone || business.email) {
    const contactLine = [business.phone, business.email].filter(Boolean).join(' | ');
    doc.text(contactLine, pageWidth / 2, footerY + 10, { align: 'center' });
  }
  if (business.website) {
    doc.text(business.website, pageWidth / 2, footerY + 15, { align: 'center' });
  }

  return doc;
}

/**
 * Download booking receipt as PDF
 */
export function downloadBookingReceipt(
  booking: ReceiptBookingData,
  business: BusinessInfo,
  filename?: string
): void {
  const doc = generateBookingReceiptPDF(booking, business);
  const defaultFilename = `receipt-${booking.bookingNumber || booking.id}.pdf`;
  doc.save(filename || defaultFilename);
}

/**
 * Get PDF as blob for email attachment or preview
 */
export function getBookingReceiptBlob(
  booking: ReceiptBookingData,
  business: BusinessInfo
): Blob {
  const doc = generateBookingReceiptPDF(booking, business);
  return doc.output('blob');
}

/**
 * Get PDF as base64 for embedding
 */
export function getBookingReceiptBase64(
  booking: ReceiptBookingData,
  business: BusinessInfo
): string {
  const doc = generateBookingReceiptPDF(booking, business);
  return doc.output('datauristring');
}

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
