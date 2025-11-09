import { QRCodeGenerator } from '../../qrcode/qrGenerator';

export interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  escaperoomName: string;
  bookingDate: string;
  bookingTime: string;
  playerCount: number;
  totalAmount: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  waiverUrl?: string;
  waiverTemplateId?: string;
  qrCodeEnabled?: boolean;
  qrCodeMessage?: string;
}

export class BookingConfirmationEmailTemplate {
  /**
   * Generate booking confirmation email HTML with optional QR code
   */
  static async generateHTML(data: BookingConfirmationData): Promise<string> {
    let qrCodeDataURL = '';

    // Generate QR code if waiver URL is provided and QR is enabled
    if (data.qrCodeEnabled && data.waiverUrl && data.bookingId) {
      try {
        qrCodeDataURL = await QRCodeGenerator.generateWaiverQRCode(
          data.waiverUrl,
          data.bookingId
        );
      } catch (error) {
        console.error('Failed to generate QR code for email:', error);
      }
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #4f46e5;
    }
    .header h1 {
      color: #4f46e5;
      margin: 0;
      font-size: 28px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .booking-details {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .qr-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
      color: white;
    }
    .qr-section h2 {
      margin: 0 0 10px 0;
      font-size: 22px;
    }
    .qr-section p {
      margin: 0 0 20px 0;
      opacity: 0.9;
    }
    .qr-code-container {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      display: inline-block;
      margin: 0 auto;
    }
    .qr-code-container img {
      display: block;
      max-width: 250px;
      height: auto;
    }
    .waiver-link {
      display: inline-block;
      margin-top: 15px;
      padding: 12px 24px;
      background-color: white;
      color: #4f46e5;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }
    .important-info {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .important-info h3 {
      margin: 0 0 10px 0;
      color: #856404;
      font-size: 16px;
    }
    .important-info p {
      margin: 5px 0;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .container {
        padding: 20px;
      }
      .detail-row {
        flex-direction: column;
      }
      .detail-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="success-icon">🎉</div>
      <h1>Booking Confirmed!</h1>
      <p style="color: #666; margin: 10px 0 0 0;">Thank you for your booking, ${data.customerName}!</p>
    </div>

    <!-- Booking Details -->
    <div class="booking-details">
      <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Booking Details</h2>
      
      <div class="detail-row">
        <span class="detail-label">Booking ID:</span>
        <span class="detail-value"><strong>${data.bookingId}</strong></span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Escape Room:</span>
        <span class="detail-value"><strong>${data.escaperoomName}</strong></span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${data.bookingDate}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${data.bookingTime}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Number of Players:</span>
        <span class="detail-value">${data.playerCount}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Total Amount:</span>
        <span class="detail-value"><strong>${data.totalAmount}</strong></span>
      </div>
    </div>

    ${qrCodeDataURL || data.waiverUrl ? `
    <!-- QR Code Section -->
    <div class="qr-section">
      <h2>📝 Complete Your Waiver</h2>
      <p>${data.qrCodeMessage || 'Scan this QR code to complete your waiver before your visit'}</p>
      
      ${qrCodeDataURL ? `
      <div class="qr-code-container">
        <img src="${qrCodeDataURL}" alt="Waiver QR Code" />
      </div>
      
      <p style="font-size: 14px; margin-top: 15px;">
        Scan with your phone camera or click the button below
      </p>
      ` : ''}
      
      <a href="${data.waiverUrl}?booking=${data.bookingId}&source=email" class="waiver-link">
        Open Waiver Form
      </a>
      
      <p style="font-size: 12px; margin-top: 15px; opacity: 0.9;">
        Or copy this link: <br>
        <span style="font-family: monospace; font-size: 11px; word-break: break-all;">
          ${data.waiverUrl}?booking=${data.bookingId}
        </span>
      </p>
    </div>
    ` : ''}

    <!-- Important Information -->
    <div class="important-info">
      <h3>⚠️ Important Information</h3>
      <p><strong>Please arrive 15 minutes early</strong> to check in and receive your briefing.</p>
      ${data.waiverUrl && !qrCodeDataURL ? `<p>All participants must complete a waiver form before playing. <a href="${data.waiverUrl}?booking=${data.bookingId}" style="color: #856404; text-decoration: underline;">Complete it now</a></p>` : ''}
      <p>Bring a valid ID for verification.</p>
    </div>

    <!-- Location -->
    <div style="margin: 20px 0;">
      <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">📍 Location</h3>
      <p style="margin: 5px 0; color: #666;">
        <strong>${data.businessName}</strong><br>
        ${data.businessAddress}<br>
        Phone: ${data.businessPhone}
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Need to make changes? <a href="#">Manage your booking</a></p>
      <p style="margin-top: 10px;">
        Questions? Contact us at ${data.businessPhone}
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated confirmation email. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text version of the email
   */
  static generatePlainText(data: BookingConfirmationData): string {
    return `
🎉 BOOKING CONFIRMED!

Thank you for your booking, ${data.customerName}!

BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${data.bookingId}
Escape Room: ${data.escaperoomName}
Date: ${data.bookingDate}
Time: ${data.bookingTime}
Number of Players: ${data.playerCount}
Total Amount: ${data.totalAmount}

${data.waiverUrl ? `
📝 COMPLETE YOUR WAIVER:
${data.waiverUrl}?booking=${data.bookingId}&source=email

All participants must complete a waiver form before playing.
` : ''}

⚠️ IMPORTANT INFORMATION:
• Please arrive 15 minutes early for check-in
• Bring a valid ID for verification
• All participants must sign a waiver

📍 LOCATION:
${data.businessName}
${data.businessAddress}
Phone: ${data.businessPhone}

Need help? Contact us at ${data.businessPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated confirmation email.
    `.trim();
  }
}
