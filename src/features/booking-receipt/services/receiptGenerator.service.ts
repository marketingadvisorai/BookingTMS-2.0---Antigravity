/**
 * Receipt Generator Service
 * Generates downloadable PDF/HTML receipts for bookings
 */

import type { ReceiptData, ReceiptConfig } from '../types';

class ReceiptGeneratorService {
  private defaultConfig: ReceiptConfig = {
    companyName: 'BookingTMS',
    primaryColor: '#2563eb',
    showQrCode: true,
  };

  /**
   * Generate HTML receipt that can be printed as PDF
   */
  generateHtmlReceipt(data: ReceiptData, config?: Partial<ReceiptConfig>): string {
    const cfg = { ...this.defaultConfig, ...config };
    const formattedDate = this.formatDate(data.bookingDate);
    const paymentDate = this.formatDate(data.paymentDate);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${data.bookingNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; background: #f5f5f5; }
    .receipt { max-width: 400px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: ${cfg.primaryColor}; color: white; padding: 24px; text-align: center; }
    .header h1 { font-size: 20px; margin-bottom: 4px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .body { padding: 24px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
    .status.confirmed { background: #dcfce7; color: #166534; }
    .status.pending { background: #fef3c7; color: #92400e; }
    .status.cancelled { background: #fee2e2; color: #991b1b; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; }
    .info-value { font-weight: 500; text-align: right; }
    .divider { height: 1px; background: #eee; margin: 16px 0; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 700; }
    .total-row .amount { color: ${cfg.primaryColor}; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #666; }
    .qr-section { text-align: center; padding: 16px; border-top: 1px dashed #ddd; margin-top: 16px; }
    .booking-ref { font-family: monospace; font-size: 16px; background: #f3f4f6; padding: 8px 16px; border-radius: 8px; display: inline-block; }
    @media print {
      body { background: white; }
      .receipt { box-shadow: none; margin: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${cfg.companyName}</h1>
      <p>Booking Receipt</p>
    </div>
    <div class="body">
      <span class="status ${data.status}">${data.status}</span>
      
      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-row">
          <span class="info-label">Reference</span>
          <span class="info-value booking-ref">${data.bookingNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Activity</span>
          <span class="info-value">${data.activityName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Venue</span>
          <span class="info-value">${data.venueName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time</span>
          <span class="info-value">${data.bookingTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Party Size</span>
          <span class="info-value">${data.partySize} ${data.partySize === 1 ? 'person' : 'people'}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">Customer</div>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">${data.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${data.customerEmail}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">Payment</div>
        <div class="info-row">
          <span class="info-label">${data.partySize} × $${data.unitPrice.toFixed(2)}</span>
          <span class="info-value">$${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.discount ? `
        <div class="info-row">
          <span class="info-label">Discount ${data.discountCode ? `(${data.discountCode})` : ''}</span>
          <span class="info-value" style="color: #16a34a;">-$${data.discount.toFixed(2)}</span>
        </div>` : ''}
        ${data.tax ? `
        <div class="info-row">
          <span class="info-label">Tax</span>
          <span class="info-value">$${data.tax.toFixed(2)}</span>
        </div>` : ''}
        <div class="total-row">
          <span>Total Paid</span>
          <span class="amount">$${data.totalAmount.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Date</span>
          <span class="info-value">${paymentDate}</span>
        </div>
        ${data.paymentMethod ? `
        <div class="info-row">
          <span class="info-label">Method</span>
          <span class="info-value">${data.paymentMethod}</span>
        </div>` : ''}
      </div>
    </div>
    <div class="footer">
      <p>Thank you for your booking!</p>
      <p style="margin-top: 4px;">Please arrive 10-15 minutes early.</p>
    </div>
  </div>
</body>
</html>`.trim();
  }

  /**
   * Download receipt as PDF using browser print
   */
  downloadReceipt(data: ReceiptData, config?: Partial<ReceiptConfig>): void {
    const html = this.generateHtmlReceipt(data, config);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  /**
   * Open receipt in new tab for viewing
   */
  viewReceipt(data: ReceiptData, config?: Partial<ReceiptConfig>): void {
    const html = this.generateHtmlReceipt(data, config);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

export const receiptGeneratorService = new ReceiptGeneratorService();
