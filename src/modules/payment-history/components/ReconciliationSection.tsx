/**
 * Reconciliation Section
 * Displays reconciliation summary and unreconciled transactions
 * @module payment-history/components/ReconciliationSection
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { Transaction, ReconciliationSummary } from '../types';

interface ReconciliationSectionProps {
  summary: ReconciliationSummary;
  unreconciledTransactions: Transaction[];
  onReconcile: (transactionId: string) => void;
  isLoading?: boolean;
}

export function ReconciliationSection({
  summary,
  unreconciledTransactions,
  onReconcile,
  isLoading = false,
}: ReconciliationSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200';
  const itemBg = isDark ? 'bg-[#161616] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200';

  if (isLoading) {
    return (
      <Card className={`${cardBg} p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`p-4 rounded-lg ${itemBg}`}>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${cardBg} p-6`}>
      <h3 className={`mb-4 ${textPrimary}`}>Reconciliation Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${itemBg}`}>
          <div className={`text-sm ${textSecondary} mb-1`}>Reconciled</div>
          <div className={`text-2xl ${textPrimary}`}>{summary.reconciledTransactions}</div>
          <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            ${summary.reconciledAmount.toFixed(2)}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${itemBg}`}>
          <div className={`text-sm ${textSecondary} mb-1`}>Unreconciled</div>
          <div className={`text-2xl ${textPrimary}`}>{summary.unreconciledTransactions}</div>
          <div className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            ${summary.unreconciledAmount.toFixed(2)}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${itemBg}`}>
          <div className={`text-sm ${textSecondary} mb-1`}>Last Reconciled</div>
          <div className={`text-sm ${textPrimary}`}>
            {summary.lastReconciledDate
              ? new Date(summary.lastReconciledDate).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>

      <PermissionGuard permissions={['payments.reconcile']}>
        <div className="space-y-4">
          <h4 className={textPrimary}>Unreconciled Transactions</h4>
          {unreconciledTransactions.length === 0 ? (
            <div className={`p-4 rounded-lg ${itemBg} text-center`}>
              <CheckCircle2 className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <p className={textSecondary}>All transactions are reconciled!</p>
            </div>
          ) : (
            unreconciledTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 rounded-lg ${itemBg}`}
              >
                <div className="flex-1">
                  <div className={textPrimary}>{transaction.transactionRef}</div>
                  <div className={`text-sm ${textSecondary}`}>
                    {transaction.customerName} • ${transaction.amount.toFixed(2)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onReconcile(transaction.id)}
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: '#4f46e5' }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Reconciled
                </Button>
              </div>
            ))
          )}
        </div>
      </PermissionGuard>
    </Card>
  );
}

export default ReconciliationSection;
