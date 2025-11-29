/**
 * CancelDialog Component
 * 
 * Dialog for confirming booking cancellation with optional reason.
 * @module features/bookings/components/CancelDialog
 */
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import type { Booking } from '../types';

export interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: (reason?: string) => void;
}

/**
 * Displays a confirmation dialog for cancelling a booking.
 * Allows optional reason entry before confirming cancellation.
 */
export function CancelDialog({ open, onOpenChange, booking, onConfirm }: CancelDialogProps) {
  const [reason, setReason] = useState('');

  if (!booking) return null;

  const handleConfirm = () => {
    onConfirm(reason || undefined);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            This will mark booking {booking.id} as cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-red-900 dark:text-red-400">
              Customers may need to be notified and any payments handled separately.
            </p>
          </div>
          <div>
            <Label className="text-sm">Cancellation Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 h-24"
              placeholder="e.g., Customer requested cancellation due to illness"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">
            Keep Booking
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 w-full sm:w-auto h-11"
          >
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
