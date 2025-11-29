/**
 * QRCodeDisplay Component
 * 
 * Displays a QR code for a booking with download option.
 * @module components/qr/QRCodeDisplay
 */
import { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { generateQRPayload, generateQRCodeDataURL } from '../../lib/qr';
import type { QRCodePayload, QRCodeConfig } from '../../lib/qr';

export interface QRCodeDisplayProps {
  /** Booking data to encode in QR */
  booking: {
    id: string;
    confirmationCode: string;
    email: string;
    date: string;
    time: string;
    activityName: string;
    venueName: string;
    groupSize: number;
  };
  /** Size in pixels (default 200) */
  size?: number;
  /** Show download button */
  showDownload?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Displays a QR code for a booking
 */
export function QRCodeDisplay({ 
  booking, 
  size = 200, 
  showDownload = true,
  className = '' 
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateQR() {
      setIsLoading(true);
      setError(null);
      try {
        const payload = await generateQRPayload(booking);
        const dataUrl = await generateQRCodeDataURL(payload, { size });
        setQrDataUrl(dataUrl);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error('QR generation error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    generateQR();
  }, [booking, size]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `ticket-${booking.confirmationCode}.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !qrDataUrl) {
    return (
      <div className={`flex flex-col items-center justify-center text-red-500 ${className}`} style={{ width: size, height: size }}>
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-xs text-center">{error || 'Failed to load QR'}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="bg-white p-2 rounded-lg shadow-sm">
        <img 
          src={qrDataUrl} 
          alt={`QR Code for booking ${booking.confirmationCode}`}
          width={size}
          height={size}
          className="block"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
        {booking.confirmationCode}
      </p>
      {showDownload && (
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download Ticket
        </Button>
      )}
    </div>
  );
}
