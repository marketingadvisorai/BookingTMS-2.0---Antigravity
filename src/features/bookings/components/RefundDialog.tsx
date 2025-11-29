/**
 * RefundDialog Component
 * 
 * Dialog for processing booking refunds with amount and reason.
 * Connects to Stripe via the create-refund edge function.
 * @module features/bookings/components/RefundDialog
 */
import { useState, useEffect } from 'react';
import { RefreshCcw, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { RefundService } from '../../../lib/payments/refundService';
import type { Booking } from '../types';

export interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onRefundComplete?: () => void;
}

/**
 * Displays a dialog for processing refunds on a booking.
 * Supports partial refunds with reason documentation.
 * Connects to Stripe via Supabase Edge Function.
 */
export function RefundDialog({ open, onOpenChange, booking, onRefundComplete }: RefundDialogProps) {
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when booking changes
  useEffect(() => {
    if (booking) {
      setRefundAmount(booking.amount);
      setRefundReason('');
    }
  }, [booking]);

  if (!booking) return null;

  const handleRefund = async () => {
    if (!booking?.id) {
      toast.error('Invalid booking');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await RefundService.processRefund({
        bookingId: booking.id,
        amount: refundAmount,
        reason: refundReason || undefined
      });

      if (result.success) {
        toast.success(
          result.isFullRefund 
            ? `Full refund of $${result.amount?.toFixed(2)} processed successfully!`
            : `Partial refund of $${result.amount?.toFixed(2)} processed successfully!`
        );
        onRefundComplete?.();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast.error('An unexpected error occurred while processing the refund');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Issue a refund for booking {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-orange-900 dark:text-orange-400">
                This action will refund the customer and update the booking status.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="refund-amount" className="text-sm">Refund Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#737373]">$</span>
              <Input
                id="refund-amount"
                type="number"
                min="0"
                max={booking.amount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="pl-7 h-11"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-[#737373] mt-1">
              Original amount: ${booking.amount.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="refund-reason" className="text-sm">Refund Reason</Label>
            <Textarea
              id="refund-reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter the reason for this refund..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Customer:</span>
              <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate ml-2">{booking.customer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Payment Method:</span>
              <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{booking.paymentMethod}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto h-11"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            className="bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700 w-full sm:w-auto h-11"
            disabled={!refundAmount || refundAmount <= 0 || isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              'Process Refund'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
