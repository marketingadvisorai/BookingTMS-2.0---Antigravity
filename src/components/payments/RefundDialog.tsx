/**
 * Refund Dialog Component
 * Process full or partial refunds for transactions
 */

'use client';

import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { AlertCircle, DollarSign } from 'lucide-react';
import { Transaction, RefundReason } from '../../types/payment';
import { toast } from 'sonner';

interface RefundDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onRefund: (transactionId: string, amount: number, reason: RefundReason, notes: string, notifyCustomer: boolean) => void;
}

export function RefundDialog({ transaction, isOpen, onClose, onRefund }: RefundDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState<RefundReason>('customer_request');
  const [notes, setNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const maxRefundAmount = transaction 
    ? transaction.amount - (transaction.refundAmount || 0)
    : 0;

  const handleRefund = async () => {
    if (!transaction) return;

    const amount = parseFloat(refundAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (amount > maxRefundAmount) {
      toast.error(`Refund amount cannot exceed $${maxRefundAmount.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      await onRefund(transaction.id, amount, refundReason, notes, notifyCustomer);
      toast.success('Refund processed successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to process refund');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setRefundAmount('');
    setRefundReason('customer_request');
    setNotes('');
    setNotifyCustomer(true);
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
            Process Refund
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>
            Refund transaction {transaction.transactionRef}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Details */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-[#0a0a0a] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Original Amount:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>${transaction.amount.toFixed(2)}</span>
              </div>
              {transaction.refundAmount && transaction.refundAmount > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Already Refunded:</span>
                  <span className={isDark ? 'text-red-400' : 'text-red-600'}>-${transaction.refundAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}">
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Available to Refund:</span>
                <span className={isDark ? 'text-green-400' : 'text-green-600'}>${maxRefundAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Refund Amount */}
          <div className="space-y-2">
            <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Refund Amount</Label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefundAmount}
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className={`pl-10 h-12 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRefundAmount((maxRefundAmount / 2).toFixed(2))}
                className={isDark ? 'border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRefundAmount(maxRefundAmount.toFixed(2))}
                className={isDark ? 'border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}
              >
                Full Refund
              </Button>
            </div>
          </div>

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Reason</Label>
            <Select value={refundReason} onValueChange={(value) => setRefundReason(value as RefundReason)}>
              <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                <SelectItem value="customer_request" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Customer Request</SelectItem>
                <SelectItem value="booking_cancelled" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Booking Cancelled</SelectItem>
                <SelectItem value="duplicate_charge" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Duplicate Charge</SelectItem>
                <SelectItem value="service_issue" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Service Issue</SelectItem>
                <SelectItem value="overcharge" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Overcharge</SelectItem>
                <SelectItem value="other" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Internal Notes (Optional)</Label>
            <Textarea
              placeholder="Add any additional notes about this refund..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}
            />
          </div>

          {/* Notify Customer */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notifyCustomer}
              onCheckedChange={(checked) => setNotifyCustomer(checked as boolean)}
            />
            <Label
              htmlFor="notify"
              className={`cursor-pointer ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}
            >
              Send refund confirmation email to customer
            </Label>
          </div>

          {/* Warning */}
          <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              This action cannot be undone. The refund will be processed immediately.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className={isDark ? 'border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={isProcessing || !refundAmount}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessing ? 'Processing...' : 'Process Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
