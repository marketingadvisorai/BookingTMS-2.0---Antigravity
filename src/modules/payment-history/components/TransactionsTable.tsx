/**
 * Transactions Table
 * Displays transaction list with actions
 * @module payment-history/components/TransactionsTable
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RotateCcw, CreditCard, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { Transaction, PaymentStatus, PaymentMethod } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewDetails: (transaction: Transaction) => void;
  onRefund: (transaction: Transaction) => void;
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

export function TransactionsTable({
  transactions,
  isLoading = false,
  onViewDetails,
  onRefund,
}: TransactionsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200';
  const headerBg = isDark ? 'bg-[#161616] border-b-2 border-[#2a2a2a]' : 'bg-gray-50 border-b-2 border-gray-200';
  const rowHover = isDark ? 'border-[#2a2a2a] hover:bg-[#161616]' : 'border-gray-200 hover:bg-gray-50';

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

  if (isLoading) {
    return (
      <Card className={`${cardBg} shadow-sm`}>
        <div className="p-8 text-center">
          <RefreshCw className={`w-8 h-8 mx-auto mb-4 animate-spin ${textSecondary}`} />
          <p className={textSecondary}>Loading transactions...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${cardBg} shadow-sm`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={headerBg}>
            <tr>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Transaction</th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Customer</th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Amount</th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Payment Method</th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Status</th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Date</th>
              <th className={`text-right p-4 ${textSecondary} uppercase tracking-wider text-xs`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className={`border-b ${rowHover} transition-colors cursor-pointer`}
                onClick={() => onViewDetails(transaction)}
              >
                <td className="p-4">
                  <div>
                    <div className={textPrimary}>{transaction.transactionRef}</div>
                    {transaction.bookingId && (
                      <div className={`text-sm ${textSecondary}`}>{transaction.bookingId}</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className={textPrimary}>{transaction.customerName}</div>
                    <div className={`text-sm ${textSecondary}`}>{transaction.customerEmail}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className={textPrimary}>${transaction.amount.toFixed(2)}</div>
                  {transaction.refundAmount && transaction.refundAmount > 0 && (
                    <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      -${transaction.refundAmount.toFixed(2)} refunded
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className={textPrimary}>
                    {formatPaymentMethod(transaction.paymentMethod.type, transaction.paymentMethod)}
                  </div>
                </td>
                <td className="p-4">
                  {renderStatusBadge(transaction.status)}
                </td>
                <td className="p-4">
                  <div className={textPrimary}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                  <div className={`text-sm ${textSecondary}`}>
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(transaction)}
                      className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white' : ''}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <PermissionGuard permissions={['payments.refund']}>
                      {(transaction.status === 'completed' || transaction.status === 'partially_refunded') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRefund(transaction)}
                          className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white' : ''}
                          disabled={transaction.amount === transaction.refundAmount}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
            <p className={textSecondary}>No transactions found</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default TransactionsTable;
