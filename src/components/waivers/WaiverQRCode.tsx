import { useState, useEffect } from 'react';
import { QRCodeGenerator } from '../../lib/qrcode/qrGenerator';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Copy, QrCode as QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../layout/ThemeContext';

interface WaiverQRCodeProps {
  waiverUrl: string;
  bookingId: string;
  customMessage?: string;
  size?: number;
  showActions?: boolean;
  className?: string;
}

export default function WaiverQRCode({
  waiverUrl,
  bookingId,
  customMessage = 'Scan to complete your waiver',
  size = 300,
  showActions = true,
  className = ''
}: WaiverQRCodeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Semantic classes
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';

  useEffect(() => {
    generateQRCode();
  }, [waiverUrl, bookingId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!QRCodeGenerator.isValidURL(waiverUrl)) {
        throw new Error('Invalid waiver URL');
      }

      const dataURL = await QRCodeGenerator.generateWaiverQRCode(waiverUrl, bookingId);
      setQrCodeDataURL(dataURL);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = `waiver-qr-${bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = `${waiverUrl}?booking=${bookingId}&source=qr`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Waiver link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <Card className={`${cardBgClass} border ${borderClass} ${className}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className={`text-sm mt-4 ${textMutedClass}`}>Generating QR code...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${cardBgClass} border ${borderClass} ${className}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <QrCodeIcon className={`w-12 h-12 ${textMutedClass} mb-4`} />
          <p className={`text-sm ${textMutedClass}`}>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={generateQRCode}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardBgClass} border ${borderClass} ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Custom Message */}
          {customMessage && (
            <div className="text-center mb-4">
              <p className={`text-sm font-medium ${textClass}`}>{customMessage}</p>
              <p className={`text-xs mt-1 ${textMutedClass}`}>
                Booking ID: {bookingId}
              </p>
            </div>
          )}

          {/* QR Code Image */}
          <div className={`p-4 rounded-lg border ${borderClass} bg-white`}>
            <img
              src={qrCodeDataURL}
              alt="Waiver QR Code"
              width={size}
              height={size}
              className="block"
            />
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-4 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          )}

          {/* Helper Text */}
          <p className={`text-xs text-center mt-4 ${textMutedClass}`}>
            Scan this code with your phone camera to open the waiver form
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
