/**
 * Payment History Page
 * Displays real payment data from Stripe
 * @module payment-history/pages/PaymentHistoryPage
 */

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, RefreshCw, AlertCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useStripePayments } from '../hooks/useStripePayments';
import { StripeRevenueMetrics } from '../components/StripeRevenueMetrics';
import { StripeTransactionFilters } from '../components/StripeTransactionFilters';
import { StripeTransactionsTable } from '../components/StripeTransactionsTable';
import { ReconciliationSection } from '../components/ReconciliationSection';

export function PaymentHistoryPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    transactions,
    summary,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isConnected,
  } = useStripePayments();

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Filter transactions client-side
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const searchMatch =
        !searchQuery ||
        t.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bookingId?.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = statusFilter === 'all' || t.status === statusFilter;

      let dateMatch = true;
      if (dateFilter !== 'all') {
        const txDate = new Date(t.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          dateMatch = txDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = txDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = txDate >= monthAgo;
        }
      }

      return searchMatch && statusMatch && dateMatch;
    });
  }, [transactions, searchQuery, statusFilter, dateFilter]);

  // Theme classes
  const bgClass = isDark ? 'bg-[#161616] border-[#1e1e1e]' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';

  // Not connected state
  if (!isConnected && !loading) {
    return (
      <>
        <PageHeader
          title="Payments & History"
          description="Manage payments, refunds, and revenue reconciliation"
        />
        <Card className={`${bgClass} border p-8 text-center`}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className={`text-xl font-semibold mb-2 ${textClass}`}>
            Stripe Not Connected
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Connect your Stripe account in Settings → Payments to view payment history.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Payments & History"
        description="Real-time payment data from your Stripe account"
        action={
          <Button
            onClick={refresh}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Revenue Metrics */}
        <StripeRevenueMetrics summary={summary} loading={loading} isDark={isDark} />

        {/* Main Content */}
        <div className={`${bgClass} border rounded-lg shadow-sm p-6`}>
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className={isDark ? 'bg-[#0a0a0a] border border-[#2a2a2a]' : 'bg-gray-100'}>
              <TabsTrigger value="transactions" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="reconciliation" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Reconciliation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
              {/* Filters */}
              <StripeTransactionFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                dateFilter={dateFilter}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onDateChange={setDateFilter}
                isDark={isDark}
              />

              {/* Transactions Table */}
              <StripeTransactionsTable
                transactions={filteredTransactions}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMore}
                isDark={isDark}
              />
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-6">
              <ReconciliationSection
                summary={{
                  reconciledTransactions: filteredTransactions.filter(t => t.status === 'succeeded').length,
                  reconciledAmount: filteredTransactions
                    .filter(t => t.status === 'succeeded')
                    .reduce((sum, t) => sum + t.amount, 0),
                  unreconciledTransactions: filteredTransactions.filter(t => t.status === 'pending').length,
                  unreconciledAmount: filteredTransactions
                    .filter(t => t.status === 'pending')
                    .reduce((sum, t) => sum + t.amount, 0),
                  lastReconciledDate: filteredTransactions.length > 0 
                    ? filteredTransactions[0].createdAt.toISOString()
                    : null,
                }}
                unreconciledTransactions={filteredTransactions
                  .filter(t => t.status === 'pending')
                  .map(t => ({
                    id: t.id,
                    transactionRef: t.transactionRef,
                    type: 'booking_payment' as const,
                    amount: t.amount,
                    customerName: t.customerName || 'Unknown',
                    customerEmail: t.customerEmail || '',
                    customerId: t.id,
                    currency: t.currency,
                    status: 'pending' as const,
                    createdAt: t.createdAt.toISOString(),
                    paymentMethod: {
                      type: (t.paymentMethod.type as any) || 'stripe',
                      brand: t.paymentMethod.brand,
                      last4: t.paymentMethod.last4,
                    },
                    reconciled: false,
                    createdBy: 'system',
                  }))}
                onReconcile={(id) => {
                  console.log('Reconcile:', id);
                }}
                isLoading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
