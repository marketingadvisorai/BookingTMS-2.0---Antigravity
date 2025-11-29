/**
 * QRScannerDialog Component
 * 
 * Dialog for scanning QR codes to check-in/check-out bookings.
 * Used by admins, staff, and owners on the Bookings page.
 * @module features/bookings/components/QRScannerDialog
 */
import { useState, useCallback } from 'react';
import { QrCode, UserCheck, UserX, Loader2, CheckCircle2, AlertCircle, Users, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { QRScanner } from '../../../components/qr';
import { processCheckIn, validateQRCode } from '../../../lib/qr';
import type { QRScanResult, CheckInResponse } from '../../../lib/qr';
import { toast } from 'sonner';

export interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInComplete?: () => void;
}

interface ScanResultDisplay {
  type: 'success' | 'error' | 'already_checked_in';
  message: string;
  booking?: CheckInResponse['booking'];
}

/**
 * Dialog component for QR-based check-in/check-out
 */
export function QRScannerDialog({ open, onOpenChange, onCheckInComplete }: QRScannerDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultDisplay | null>(null);
  const [lastPayload, setLastPayload] = useState<QRScanResult['payload'] | null>(null);

  const handleScan = useCallback(async (result: QRScanResult) => {
    if (!result.valid || !result.payload) {
      setScanResult({
        type: 'error',
        message: result.error || 'Invalid QR code',
      });
      return;
    }

    setLastPayload(result.payload);
    setIsProcessing(true);
    setScanResult(null);

    try {
      const response = await processCheckIn({
        bookingId: result.payload.bookingId,
        signature: result.payload.signature,
        action: 'check_in',
      });

      if (response.success) {
        setScanResult({
          type: 'success',
          message: response.message,
          booking: response.booking,
        });
        toast.success('Check-in successful!');
        onCheckInComplete?.();
      } else if (response.alreadyCheckedIn) {
        setScanResult({
          type: 'already_checked_in',
          message: 'Already checked in',
          booking: response.booking,
        });
        toast.info('Guest is already checked in');
      } else {
        setScanResult({
          type: 'error',
          message: response.error || 'Check-in failed',
        });
        toast.error(response.error || 'Check-in failed');
      }
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Check-in failed',
      });
      toast.error('Check-in failed');
    } finally {
      setIsProcessing(false);
    }
  }, [onCheckInComplete]);

  const handleCheckOut = useCallback(async () => {
    if (!lastPayload) return;

    setIsProcessing(true);
    try {
      const response = await processCheckIn({
        bookingId: lastPayload.bookingId,
        signature: lastPayload.signature,
        action: 'check_out',
      });

      if (response.success) {
        setScanResult({
          type: 'success',
          message: 'Check-out successful!',
          booking: response.booking,
        });
        toast.success('Check-out successful!');
        onCheckInComplete?.();
      } else {
        toast.error(response.error || 'Check-out failed');
      }
    } catch (error) {
      toast.error('Check-out failed');
    } finally {
      setIsProcessing(false);
    }
  }, [lastPayload, onCheckInComplete]);

  const handleScanError = useCallback((error: string) => {
    if (!error.includes('NotFoundException')) {
      console.warn('Scan error:', error);
    }
  }, []);

  const resetScan = () => {
    setScanResult(null);
    setLastPayload(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            QR Ticket Scanner
          </DialogTitle>
          <DialogDescription>
            Scan a booking QR code to check-in or check-out guests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* Scanner or Result */}
          {!scanResult && !isProcessing && (
            <QRScanner
              onScan={handleScan}
              onError={handleScanError}
              width={280}
              height={280}
            />
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center h-[280px]">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Processing check-in...</p>
            </div>
          )}

          {/* Result Display */}
          {scanResult && !isProcessing && (
            <div className="w-full space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                scanResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                scanResult.type === 'already_checked_in' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-red-50 dark:bg-red-900/20'
              }`}>
                {scanResult.type === 'success' ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : scanResult.type === 'already_checked_in' ? (
                  <UserCheck className="w-8 h-8 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <p className={`font-semibold ${
                    scanResult.type === 'success' ? 'text-green-700 dark:text-green-400' :
                    scanResult.type === 'already_checked_in' ? 'text-yellow-700 dark:text-yellow-400' :
                    'text-red-700 dark:text-red-400'
                  }`}>
                    {scanResult.message}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              {scanResult.booking && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {scanResult.booking.customer}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {scanResult.booking.confirmationCode}
                      </p>
                    </div>
                    <Badge variant={
                      scanResult.booking.status === 'checked_in' ? 'default' :
                      scanResult.booking.status === 'completed' ? 'secondary' : 'outline'
                    }>
                      {scanResult.booking.status?.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {scanResult.booking.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {scanResult.booking.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                      <Users className="w-4 h-4" />
                      {scanResult.booking.groupSize} guests - {scanResult.booking.activityName}
                    </div>
                  </div>

                  {scanResult.booking.checkInTime && (
                    <p className="text-xs text-gray-500">
                      Checked in: {new Date(scanResult.booking.checkInTime).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetScan} className="flex-1">
                  Scan Another
                </Button>
                {scanResult.type === 'already_checked_in' && scanResult.booking && !scanResult.booking.checkOutTime && (
                  <Button onClick={handleCheckOut} className="flex-1">
                    <UserX className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
