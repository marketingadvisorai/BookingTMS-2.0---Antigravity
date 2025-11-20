import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { RefreshCw, ExternalLink, Search, Eye, DollarSign, Loader2 } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';

interface ConnectedAccount {
  id: string;
  email?: string;
  business_profile?: {
    name?: string;
    url?: string;
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
  balance: {
    available: number;
    pending: number;
    currency: string;
  };
  pending_payouts: {
    amount: number;
    count: number;
  };
  disputes: {
    count: number;
    total: number;
  };
  last_payout?: {
    amount: number;
    arrival_date: number;
    created: number;
  } | null;
  created: number;
  type: string;
  error?: string;
}

interface ConnectedAccountsManagementProps {
  apiBaseUrl?: string;
}

export const ConnectedAccountsManagement: React.FC<ConnectedAccountsManagementProps> = ({
  apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001',
}) => {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'restricted'>('all');
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/api/stripe-connect-accounts/list`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch connected accounts');
      }

      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
        setFilteredAccounts(data.accounts);
      } else {
        throw new Error(data.error || 'Failed to fetch accounts');
      }
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchAccounts();
    setSyncing(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    let filtered = accounts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (acc) =>
          acc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.business_profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((acc) => {
        if (statusFilter === 'active') {
          return acc.charges_enabled && acc.payouts_enabled;
        } else if (statusFilter === 'pending') {
          return !acc.charges_enabled || !acc.payouts_enabled;
        } else if (statusFilter === 'restricted') {
          return !acc.charges_enabled && !acc.payouts_enabled;
        }
        return true;
      });
    }

    setFilteredAccounts(filtered);
  }, [searchQuery, statusFilter, accounts]);

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

  const getStatusBadge = (account: ConnectedAccount) => {
    if (account.charges_enabled && account.payouts_enabled) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    } else if (!account.charges_enabled && !account.payouts_enabled) {
      return <Badge className="bg-red-500 text-white">Restricted</Badge>;
    } else {
      return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
    }
  };

  const openStripeDashboard = (accountId: string) => {
    window.open(`https://dashboard.stripe.com/connect/accounts/${accountId}`, '_blank');
  };

  if (loading) {
    return (
      <Card className={`${bgClass} border ${borderColor}`}>
        <CardHeader>
          <CardTitle className={textClass}>Connected Accounts Management</CardTitle>
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
          <CardTitle className={textClass}>Connected Accounts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchAccounts} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={textClass}>Connected Accounts Management</CardTitle>
            <p className={`text-sm mt-1 ${mutedTextClass}`}>
              View balances, trigger payouts, manage disputes, and monitor account status
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync All
            </Button>
            <Button
              onClick={() => window.open('https://dashboard.stripe.com/connect/accounts', '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Stripe Dashboard
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
            <Input
              type="text"
              placeholder="Search by name or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'restricted'].map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Accounts List */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <p className={mutedTextClass}>
              {accounts.length === 0
                ? 'No connected accounts found. Create your first connected account to get started.'
                : 'No accounts match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className={`border ${borderColor} rounded-lg p-4 ${hoverBgClass} transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${textClass}`}>
                        {account.business_profile?.name || account.email || account.id}
                      </h3>
                      {getStatusBadge(account)}
                    </div>
                    <p className={`text-sm ${mutedTextClass}`}>{account.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className={`text-xs uppercase ${mutedTextClass} mb-1`}>Balance</p>
                    <p className={`font-semibold ${textClass}`}>
                      {formatCurrency(account.balance.available, account.balance.currency)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase ${mutedTextClass} mb-1`}>Pending Payouts</p>
                    <p className={`font-semibold ${textClass}`}>
                      {formatCurrency(account.pending_payouts.amount, account.balance.currency)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase ${mutedTextClass} mb-1`}>Disputes</p>
                    <p className={`font-semibold ${textClass}`}>{account.disputes.count}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase ${mutedTextClass} mb-1`}>Last Payout</p>
                    <p className={`font-semibold ${textClass}`}>
                      {account.last_payout
                        ? formatDate(account.last_payout.arrival_date)
                        : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => openStripeDashboard(account.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    disabled={account.balance.available <= 0}
                    variant="outline"
                    size="sm"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Trigger Payout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccountsManagement;
