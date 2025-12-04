/**
 * Transaction Detail Dialog
 * Shows detailed transaction information
 * @module payment-history/components/TransactionDetailDialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { Transaction, PaymentStatus, PaymentMethod } from '../types';

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

// Status badge configuration
const getStatusConfig = (status: PaymentStatus, isDark: boolean) => {
  const configs: Record<PaymentStatus, { icon: typeof CheckCircle2; className: string }> = {
    completed: {
      icon: CheckCircle2,
      className: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-500/10 text-green-600 border-green-500/20'
    },
    pending: {
      icon: Clock,
      className: isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    processing: {
      icon: RefreshCw,
      className: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    },
    failed: {
      icon: XCircle,
      className: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-600 border-red-500/20'
    },
    refunded: {
      icon: RotateCcw,
      className: isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    },
    partially_refunded: {
      icon: RotateCcw,
      className: isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    },
    cancelled: {
      icon: XCircle,
      className: isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  };
  return configs[status];
};

// Format payment method display
const formatPaymentMethod = (method: PaymentMethod, details: any) => {
  if (details?.last4) {
    return `${details.brand} •••• ${details.last4}`;
  }
  return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function TransactionDetailDialog({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const dialogBg = isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200';

  const renderStatusBadge = (status: PaymentStatus) => {
    const config = getStatusConfig(status, isDark);
    const Icon = config.icon;
    const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <Badge className={`${config.className} gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${dialogBg}`}>
        <DialogHeader>
          <DialogTitle className={textPrimary}>Transaction Details</DialogTitle>
          <DialogDescription className={textSecondary}>
            {transaction.transactionRef}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div>
            <h4 className={`mb-3 ${textPrimary}`}>Customer Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-sm ${textSecondary}`}>Name</div>
                <div className={textPrimary}>{transaction.customerName}</div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Email</div>
                <div className={textPrimary}>{transaction.customerEmail}</div>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div>
            <h4 className={`mb-3 ${textPrimary}`}>Transaction Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-sm ${textSecondary}`}>Amount</div>
                <div className={textPrimary}>${transaction.amount.toFixed(2)}</div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Status</div>
                <div>{renderStatusBadge(transaction.status)}</div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Payment Method</div>
                <div className={textPrimary}>
                  {formatPaymentMethod(transaction.paymentMethod.type, transaction.paymentMethod)}
                </div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Date</div>
                <div className={textPrimary}>
                  {new Date(transaction.createdAt).toLocaleString()}
                </div>
              </div>
              {transaction.bookingId && (
                <div>
                  <div className={`text-sm ${textSecondary}`}>Booking ID</div>
                  <div className={textPrimary}>{transaction.bookingId}</div>
                </div>
              )}
              {transaction.invoiceNumber && (
                <div>
                  <div className={`text-sm ${textSecondary}`}>Invoice</div>
                  <div className={textPrimary}>{transaction.invoiceNumber}</div>
                </div>
              )}
            </div>
          </div>

          {/* Refund Info */}
          {transaction.refundAmount && transaction.refundAmount > 0 && (
            <div>
              <h4 className={`mb-3 ${textPrimary}`}>Refund Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${textSecondary}`}>Refund Amount</div>
                  <div className={isDark ? 'text-red-400' : 'text-red-600'}>
                    ${transaction.refundAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${textSecondary}`}>Refund Date</div>
                  <div className={textPrimary}>
                    {transaction.refundedAt
                      ? new Date(transaction.refundedAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
                {transaction.refundReason && (
                  <div className="col-span-2">
                    <div className={`text-sm ${textSecondary}`}>Reason</div>
                    <div className={textPrimary}>
                      {transaction.refundReason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                )}
                {transaction.refundNotes && (
                  <div className="col-span-2">
                    <div className={`text-sm ${textSecondary}`}>Notes</div>
                    <div className={textPrimary}>{transaction.refundNotes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {transaction.description && (
            <div>
              <div className={`text-sm ${textSecondary} mb-2`}>Description</div>
              <div className={textPrimary}>{transaction.description}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDetailDialog;
