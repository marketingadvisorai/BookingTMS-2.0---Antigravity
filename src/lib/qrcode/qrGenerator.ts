import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class QRCodeGenerator {
  /**
   * Generate QR code as data URL (base64 image)
   * @param data - Data to encode in QR code
   * @param options - QR code options
   * @returns Promise<string> - Data URL of QR code image
   */
  static async generateDataURL(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M' as const,
        ...options,
      };

      const dataURL = await QRCode.toDataURL(data, defaultOptions);
      return dataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code for waiver form
   * @param waiverUrl - Full URL to waiver form
   * @param bookingId - Booking ID for tracking
   * @returns Promise<string> - Data URL of QR code
   */
  static async generateWaiverQRCode(
    waiverUrl: string,
    bookingId: string
  ): Promise<string> {
    // Add booking ID as query parameter for tracking
    const urlWithTracking = `${waiverUrl}?booking=${bookingId}&source=qr`;
    
    return this.generateDataURL(urlWithTracking, {
      width: 400,
      margin: 3,
      errorCorrectionLevel: 'H', // High error correction for better scanning
    });
  }

  /**
   * Generate QR code as SVG string
   * @param data - Data to encode
   * @param options - QR code options
   * @returns Promise<string> - SVG string
   */
  static async generateSVG(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M' as const,
        ...options,
      };

      const svg = await QRCode.toString(data, {
        ...defaultOptions,
        type: 'svg',
      });
      return svg;
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  /**
   * Generate QR code as buffer (for server-side use)
   * @param data - Data to encode
   * @param options - QR code options
   * @returns Promise<Buffer> - QR code as buffer
   */
  static async generateBuffer(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<Buffer> {
    try {
      const defaultOptions = {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M' as const,
        ...options,
      };

      const buffer = await QRCode.toBuffer(data, defaultOptions);
      return buffer;
    } catch (error) {
      console.error('Error generating QR code buffer:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }

  /**
   * Validate URL before generating QR code
   * @param url - URL to validate
   * @returns boolean - True if valid
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate waiver URL with booking information
   * @param baseUrl - Base URL of the application
   * @param waiverTemplateId - Waiver template ID
   * @param bookingId - Booking ID
   * @returns string - Full waiver URL
   */
  static generateWaiverURL(
    baseUrl: string,
    waiverTemplateId: string,
    bookingId: string
  ): string {
    return `${baseUrl}/waiver/${waiverTemplateId}?booking=${bookingId}`;
  }
}
