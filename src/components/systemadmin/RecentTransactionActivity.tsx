import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';

interface Transaction {
  id: string;
  type: 'payout' | 'dispute';
  account_id: string;
  account_name: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  created: number;
  arrival_date?: number;
}

interface RecentTransactionActivityProps {
  apiBaseUrl?: string;
  limit?: number;
}

export const RecentTransactionActivity: React.FC<RecentTransactionActivityProps> = ({
  apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001',
  limit = 10,
}) => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${apiBaseUrl}/api/stripe-connect-accounts/transactions?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (transaction: Transaction) => {
    if (transaction.type === 'payout') {
      switch (transaction.status) {
        case 'paid':
          return <Badge className="bg-green-500 text-white text-xs">paid</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-500 text-white text-xs">pending</Badge>;
        case 'in_transit':
          return <Badge className="bg-blue-500 text-white text-xs">in transit</Badge>;
        case 'failed':
          return <Badge className="bg-red-500 text-white text-xs">failed</Badge>;
        default:
          return <Badge className="bg-gray-500 text-white text-xs">{transaction.status}</Badge>;
      }
    } else {
      // Dispute
      switch (transaction.status) {
        case 'needs_response':
          return <Badge className="bg-orange-500 text-white text-xs">needs_response</Badge>;
        case 'under_review':
          return <Badge className="bg-yellow-500 text-white text-xs">under review</Badge>;
        case 'won':
          return <Badge className="bg-green-500 text-white text-xs">won</Badge>;
        case 'lost':
          return <Badge className="bg-red-500 text-white text-xs">lost</Badge>;
        default:
          return <Badge className="bg-gray-500 text-white text-xs">{transaction.status}</Badge>;
      }
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'payout') {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
      );
    }
  };

  const openStripeTransaction = (transaction: Transaction) => {
    const baseUrl = 'https://dashboard.stripe.com';
    if (transaction.type === 'payout') {
      window.open(`${baseUrl}/connect/accounts/${transaction.account_id}/payouts/${transaction.id}`, '_blank');
    } else {
      window.open(`${baseUrl}/connect/accounts/${transaction.account_id}/disputes/${transaction.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Card className={`${bgClass} border ${borderColor}`}>
        <CardHeader>
          <CardTitle className={textClass}>Recent Transaction Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${bgClass} border ${borderColor}`}>
        <CardHeader>
          <CardTitle className={textClass}>Recent Transaction Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchTransactions} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${bgClass} border ${borderColor}`}>
      <CardHeader>
        <div>
          <CardTitle className={textClass}>Recent Transaction Activity</CardTitle>
          <p className={`text-sm mt-1 ${mutedTextClass}`}>
            Latest payments, payouts, and disputes across all connected accounts
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className={mutedTextClass}>No recent transactions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center gap-4 p-3 border ${borderColor} rounded-lg ${hoverBgClass} transition-colors cursor-pointer`}
                onClick={() => openStripeTransaction(transaction)}
              >
                {getTransactionIcon(transaction)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${textClass} truncate`}>
                      {transaction.account_name}
                    </h4>
                    {getStatusBadge(transaction)}
                  </div>
                  <p className={`text-sm ${mutedTextClass}`}>
                    {transaction.type} • {transaction.account_id} • {formatDate(transaction.created)}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${textClass}`}>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <ExternalLink className={`w-4 h-4 ${mutedTextClass} ml-auto mt-1`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => window.open('https://dashboard.stripe.com/connect/activity', '_blank')}
              variant="outline"
              className="w-full"
            >
              View All Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionActivity;
