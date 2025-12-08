/**
 * Stripe Transactions Table
 * Displays real transaction data from Stripe
 * @module payment-history/components/StripeTransactionsTable
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2,
  ChevronDown,
} from 'lucide-react';
import type { MappedTransaction } from '../hooks/useStripePayments';

interface StripeTransactionsTableProps {
  transactions: MappedTransaction[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isDark?: boolean;
}

const getStatusConfig = (status: string, isDark: boolean) => {
  const configs: Record<string, { icon: typeof CheckCircle2; className: string }> = {
    completed: {
      icon: CheckCircle2,
      className: isDark 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    succeeded: {
      icon: CheckCircle2,
      className: isDark 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    pending: {
      icon: Clock,
      className: isDark 
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
        : 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    processing: {
      icon: Clock,
      className: isDark 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
        : 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    failed: {
      icon: XCircle,
      className: isDark 
        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
        : 'bg-red-500/10 text-red-600 border-red-500/20',
    },
    canceled: {
      icon: XCircle,
      className: isDark 
        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
        : 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    },
  };
  return configs[status] || configs.pending;
};

export function StripeTransactionsTable({
  transactions,
  loading,
  hasMore,
  onLoadMore,
  isDark = false,
}: StripeTransactionsTableProps) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200';
  const headerBg = isDark 
    ? 'bg-[#161616] border-b-2 border-[#2a2a2a]' 
    : 'bg-gray-50 border-b-2 border-gray-200';
  const rowHover = isDark 
    ? 'border-[#2a2a2a] hover:bg-[#161616]' 
    : 'border-gray-200 hover:bg-gray-50';

  if (loading && !transactions.length) {
    return (
      <Card className={`${cardBg} shadow-sm`}>
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-indigo-500" />
          <p className={textSecondary}>Loading transactions from Stripe...</p>
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
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>
                Transaction ID
              </th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>
                Customer
              </th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>
                Amount
              </th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>
                Payment Method
              </th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>
                Status
              </th>
              <th className={`text-left p-4 ${textSecondary} uppercase tracking-wider text-xs`}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const config = getStatusConfig(tx.status, isDark);
              const Icon = config.icon;

              return (
                <tr key={tx.id} className={`border-b ${rowHover} transition-colors`}>
                  <td className="p-4">
                    <div>
                      <div className={`${textPrimary} font-mono text-sm`}>
                        {tx.transactionRef.substring(0, 20)}...
                      </div>
                      {tx.bookingId && (
                        <div className={`text-xs ${textSecondary}`}>
                          Booking: {tx.bookingId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className={textPrimary}>
                        {tx.customerName || 'N/A'}
                      </div>
                      <div className={`text-sm ${textSecondary}`}>
                        {tx.customerEmail || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`${textPrimary} font-semibold`}>
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </div>
                    {tx.refundAmount > 0 && (
                      <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        -${tx.refundAmount.toFixed(2)} refunded
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className={textPrimary}>
                      {tx.paymentMethod.brand && tx.paymentMethod.last4 
                        ? `${tx.paymentMethod.brand} •••• ${tx.paymentMethod.last4}`
                        : tx.paymentMethod.type || 'Card'
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={`${config.className} gap-1`}>
                      <Icon className="w-3 h-3" />
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className={textPrimary}>
                      {tx.createdAt.toLocaleDateString()}
                    </div>
                    <div className={`text-sm ${textSecondary}`}>
                      {tx.createdAt.toLocaleTimeString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
            <p className={textSecondary}>No transactions found</p>
            <p className={`text-sm mt-1 ${textSecondary}`}>
              Transactions will appear once you start processing payments
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={onLoadMore} 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2" />
            )}
            Load More
          </Button>
        </div>
      )}
    </Card>
  );
}

export default StripeTransactionsTable;
