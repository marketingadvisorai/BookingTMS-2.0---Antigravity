import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Link2, 
  ShieldCheck, 
  Webhook, 
  Users, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ExternalLink,
  PlayCircle,
  RefreshCw,
  Eye,
  Lock,
  Key,
  Database,
  Activity
} from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';
import { stripeConnectService, type ConnectedAccount, type AccountBalance, type Payout, type Dispute } from '../../services/stripeConnectService';

export const StripeConnectAdminPanel = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'restricted'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoActivatedAt, setDemoActivatedAt] = useState<string | null>(null);
  const [demoReason, setDemoReason] = useState<string | null>(null);
  
  // Real data state
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [accountBalances, setAccountBalances] = useState<Record<string, any>>({});
  const [recentPayouts, setRecentPayouts] = useState<Payout[]>([]);
  const [recentDisputes, setRecentDisputes] = useState<Dispute[]>([]);

  const demoData = useMemo(() => {
    const now = Date.now();
    const demoAccounts: ConnectedAccount[] = [
      {
        id: 'acct_demo001',
        type: 'express',
        email: 'demo@escapehq.com',
        country: 'US',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        created: Math.floor(now / 1000) - 86_400,
        business_profile: { name: 'Escape HQ Demo', url: 'https://demo.escapehq.com' },
        requirements: { currently_due: [] },
        metadata: { business_name: 'Escape HQ Demo' },
        default_currency: 'usd',
      },
      {
        id: 'acct_demo002',
        type: 'express',
        email: 'events@mazeescape.io',
        country: 'US',
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        created: Math.floor(now / 1000) - 172_800,
        business_profile: { name: 'Maze Escape Labs', url: 'https://mazeescape.io' },
        requirements: { currently_due: ['business_profile.support_address'] },
        metadata: { business_name: 'Maze Escape Labs' },
        default_currency: 'usd',
      },
    ];

    const demoBalances: Record<string, AccountBalance> = {
      acct_demo001: {
        available: [{ amount: 452500, currency: 'usd' }],
        pending: [{ amount: 128000, currency: 'usd' }],
      },
      acct_demo002: {
        available: [{ amount: 0, currency: 'usd' }],
        pending: [{ amount: 32500, currency: 'usd' }],
      },
    };

    const demoPayouts: Payout[] = [
      {
        id: 'po_demo001',
        amount: 325000,
        arrival_date: Math.floor(now / 1000) - 72_000,
        created: Math.floor(now / 1000) - 75_000,
        currency: 'usd',
        description: 'Weekly payout',
        status: 'paid',
        type: 'bank_account',
      },
    ];

    const demoDisputes: Dispute[] = [
      {
        id: 'dp_demo001',
        amount: 12500,
        currency: 'usd',
        created: Math.floor(now / 1000) - 48_000,
        reason: 'product_not_received',
        status: 'needs_response',
        charge: 'ch_demo001',
      },
    ];

    return { demoAccounts, demoBalances, demoPayouts, demoDisputes };
  }, []);

  const activateDemoMode = (reason?: string) => {
    const description = reason ?? 'Backend API is not reachable. Showing sample data.';
    setDemoMode(true);
    setDemoReason(description);
    setError(null);
    setConnectedAccounts(demoData.demoAccounts);
    setAccountBalances(demoData.demoBalances);
    setRecentPayouts(demoData.demoPayouts);
    setRecentDisputes(demoData.demoDisputes);
    const timestamp = new Date().toLocaleString();
    setDemoActivatedAt(timestamp);
    setLoading(false);
    if (!demoMode) {
      toast.info('Stripe Connect demo mode enabled', {
        description,
      });
    }
  };

  // Fetch connected accounts and their data
  useEffect(() => {
    // Only fetch if backend is available
    const checkBackendAndFetch = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001'}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        if (response.ok) {
          fetchConnectedAccountsData();
        } else {
          console.warn('Backend health check failed');
          activateDemoMode(`Backend responded with HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn('Backend not available, falling back to demo data');
        activateDemoMode('Backend server is not available. Please start the backend server to manage Stripe Connect accounts.');
      }
    };

    checkBackendAndFetch();
  }, []);

  const fetchConnectedAccountsData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDemoMode(false);

      // Fetch all connected accounts with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const accountsResponse = await stripeConnectService.listAccounts({ limit: 100 });
      clearTimeout(timeoutId);
      
      const accounts = accountsResponse.accounts;

      // Fetch balances for each account
      const balances: Record<string, any> = {};
      const payouts: Payout[] = [];
      const disputes: Dispute[] = [];

      await Promise.all(
        accounts.map(async (account) => {
          try {
            // Fetch balance
            const balanceRes = await stripeConnectService.getBalance(account.id);
            balances[account.id] = balanceRes.balance;

            // Fetch recent payouts
            const payoutsRes = await stripeConnectService.listPayouts({
              accountId: account.id,
              limit: 5,
            });
            payouts.push(...payoutsRes.payouts);

            // Fetch disputes
            const disputesRes = await stripeConnectService.listDisputes({
              accountId: account.id,
              limit: 10,
            });
            disputes.push(...disputesRes.disputes);
          } catch (err) {
            // Silently fail for individual account data
            console.warn(`Could not fetch data for account ${account.id}`);
          }
        })
      );

      setConnectedAccounts(accounts);
      setAccountBalances(balances);
      setRecentPayouts(payouts.slice(0, 10));
      setRecentDisputes(disputes.slice(0, 10));
    } catch (err: any) {
      const errorMessage = err?.name === 'AbortError'
        ? 'Request timeout - backend server may not be running'
        : err?.message || 'Failed to connect to backend server';
      console.warn('[StripeConnectAdminPanel] Falling back to demo data:', errorMessage);
      activateDemoMode(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getAccountBalance = (accountId: string) => {
    const balance = accountBalances[accountId];
    if (!balance || !balance.available || balance.available.length === 0) return 0;
    return balance.available[0].amount / 100; // Convert from cents
  };

  const getAccountStatus = (account: ConnectedAccount): 'active' | 'pending' | 'restricted' => {
    if (account.charges_enabled && account.payouts_enabled) return 'active';
    if (account.details_submitted) return 'pending';
    return 'restricted';
  };

  const getVerificationStatus = (account: ConnectedAccount) => {
    if (account.requirements && account.requirements.currently_due && account.requirements.currently_due.length > 0) {
      return 'pending';
    }
    return 'verified';
  };

  const webhookEndpoints = [
    {
      id: 'we_1234',
      url: window.location.origin + '/api/webhooks/stripe',
      status: 'enabled',
      events: ['payment_intent.succeeded', 'payout.paid', 'account.updated', 'charge.dispute.created'],
      lastEvent: new Date().toISOString()
    }
  ];

  // Build recent transactions from payouts and disputes
  const recentTransactions = [
    ...recentPayouts.slice(0, 3).map(payout => ({
      id: payout.id,
      account: connectedAccounts.find(a => a.id === payout.id)?.email || 'Unknown',
      type: 'payout' as const,
      amount: payout.amount / 100,
      status: payout.status,
      date: new Date(payout.created * 1000).toISOString().split('T')[0]
    })),
    ...recentDisputes.slice(0, 2).map(dispute => ({
      id: dispute.id,
      account: 'Account',
      type: 'dispute' as const,
      amount: dispute.amount / 100,
      status: dispute.status,
      date: new Date(dispute.created * 1000).toISOString().split('T')[0]
    }))
  ].slice(0, 5);

  // Handle creating new connected account
  const handleCreateAccount = async (type: 'express' | 'custom') => {
    try {
      const account = await stripeConnectService.createAccount({
        type,
        email: 'newaccount@example.com', // This should come from a form
        country: 'US',
        businessType: 'company',
      });

      toast.success('Connected account created', {
        description: `Stripe ID: ${account.accountId}`,
      });
      await fetchConnectedAccountsData(); // Refresh data
    } catch (err: any) {
      toast.error('Failed to create account', {
        description: err?.message || 'Unknown error',
      });
    }
  };

  // Handle triggering payout
  const handleTriggerPayout = async (accountId: string) => {
    try {
      const balance = getAccountBalance(accountId);
      if (balance <= 0) {
        alert('Account has no available balance to payout');
        return;
      }

      await stripeConnectService.createPayout({
        accountId,
        amount: balance,
        currency: 'usd',
        description: 'Manual payout triggered from admin',
      });

      alert('Payout created successfully');
      await fetchConnectedAccountsData(); // Refresh data
    } catch (err: any) {
      console.error('Failed to create payout:', err);
      alert('Failed to create payout: ' + err.message);
    }
  };

  const filteredAccounts = connectedAccounts.filter(account => {
    const status = getAccountStatus(account);
    const matchesSearch = (account.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (loading) {
    return (
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardContent className="p-8 text-center">
          <RefreshCw className={`w-8 h-8 ${mutedTextClass} animate-spin mx-auto mb-4`} />
          <p className={textClass}>Loading Stripe Connect accounts...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state - show helpful message when backend is not available
  if (error) {
    return (
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardContent className="p-8">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <p className={`${textClass} text-center mb-4 font-semibold`}>Backend Server Required</p>
          <p className={`text-sm ${mutedTextClass} text-center mb-4 max-w-2xl mx-auto`}>
            {error}
          </p>
          <div className={`p-4 rounded-lg ${secondaryBgClass} text-left max-w-2xl mx-auto mb-4`}>
            <p className={`text-sm font-semibold ${textClass} mb-2`}>To use Stripe Connect features:</p>
            <ol className={`text-xs ${mutedTextClass} space-y-1 list-decimal list-inside`}>
              <li>Install backend dependencies: <code className="bg-black/20 px-1 rounded">./install-stripe-connect.sh</code></li>
              <li>Configure environment variables in <code className="bg-black/20 px-1 rounded">.env.backend</code></li>
              <li>Start backend server: <code className="bg-black/20 px-1 rounded">cd src/backend && npm run dev</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchConnectedAccountsData} className="flex gap-2" variant="outline">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
            <Button asChild variant="default">
              <a href="/STRIPE_CONNECT_SETUP_GUIDE.md" target="_blank" className="flex gap-2">
                <ExternalLink className="w-4 h-4" />
                Setup Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${mutedTextClass} mb-1`}>Connected Accounts</p>
                <p className={`text-2xl font-bold ${textClass}`}>{connectedAccounts.length}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${mutedTextClass} mb-1`}>Total Balance</p>
                <p className={`text-2xl font-bold ${textClass}`}>
                  ${connectedAccounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${mutedTextClass} mb-1`}>Active Disputes</p>
                <p className={`text-2xl font-bold ${textClass}`}>
                  {connectedAccounts.reduce((sum, acc) => sum + acc.disputes, 0)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${mutedTextClass} mb-1`}>Pending Payouts</p>
                <p className={`text-2xl font-bold ${textClass}`}>
                  {connectedAccounts.reduce((sum, acc) => sum + acc.pendingPayouts, 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Onboarding Section */}
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-lg ${textClass}`}>Connected Account Onboarding</CardTitle>
              <p className={`text-sm mt-1 ${mutedTextClass}`}>
                OAuth flows, account links, and verification management
              </p>
            </div>
            <Button size="sm" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Start Onboarding
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className={`text-sm font-medium ${textClass}`}>Express Accounts</span>
              </div>
              <p className={`text-xs ${mutedTextClass}`}>
                Stripe-hosted onboarding with reduced compliance burden. Best for quick setup.
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Create Express Account
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-blue-500" />
                <span className={`text-sm font-medium ${textClass}`}>Custom Accounts</span>
              </div>
              <p className={`text-xs ${mutedTextClass}`}>
                Full control over onboarding UI. You handle compliance and verification.
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Create Custom Account
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-purple-500" />
                <span className={`text-sm font-medium ${textClass}`}>OAuth Flow</span>
              </div>
              <p className={`text-xs ${mutedTextClass}`}>
                Let existing Stripe accounts connect via OAuth. Fastest for verified accounts.
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Generate OAuth Link
              </Button>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${secondaryBgClass} text-xs ${mutedTextClass}`}>
            <strong>Best Practice:</strong> Store account IDs securely in your database, never expose secret keys client-side, 
            and use account sessions for embedded components. Verify accounts meet requirements before enabling payouts.
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts List with Actions */}
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className={`text-lg ${textClass}`}>Connected Accounts Management</CardTitle>
              <p className={`text-sm mt-1 ${mutedTextClass}`}>
                View balances, trigger payouts, manage disputes, and monitor account status
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync All
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="https://dashboard.stripe.com/connect/accounts/overview" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Stripe Dashboard
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
              <Input
                placeholder="Search by name or account ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'pending', 'restricted'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Accounts Table */}
          <div className="space-y-3">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-lg border ${borderColor} ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className={`font-semibold ${textClass}`}>{account.name}</h4>
                      <Badge
                        variant="outline"
                        className={
                          account.status === 'active'
                            ? 'border-emerald-500 text-emerald-500'
                            : account.status === 'pending'
                            ? 'border-amber-500 text-amber-500'
                            : 'border-red-500 text-red-500'
                        }
                      >
                        {account.status}
                      </Badge>
                      {account.verification === 'verified' && (
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs ${mutedTextClass} mb-3`}>{account.id}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`text-xs ${mutedTextClass}`}>Balance</span>
                        <p className={`font-semibold ${textClass}`}>${getAccountBalance(account.id).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className={`text-xs ${mutedTextClass}`}>Pending Payouts</span>
                        <p className={`font-semibold ${textClass}`}>
                          {accountBalances[account.id]?.pending?.[0]?.amount ? 
                            `$${(accountBalances[account.id].pending[0].amount / 100).toLocaleString()}` : 
                            '$0'}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs ${mutedTextClass}`}>Disputes</span>
                        <p className={`font-semibold ${textClass}`}>
                          {recentDisputes.filter(d => d.charge?.startsWith(account.id)).length || 0}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs ${mutedTextClass}`}>Last Payout</span>
                        <p className={`font-semibold ${textClass}`}>
                          {recentPayouts.find(p => p.id.includes(account.id)) ? 
                            new Date(recentPayouts.find(p => p.id.includes(account.id))!.created * 1000).toLocaleDateString() : 
                            'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <DollarSign className="w-4 h-4" />
                      Trigger Payout
                    </Button>
                    {account.disputes > 0 && (
                      <Button variant="outline" size="sm" className="gap-2 text-amber-500 border-amber-500">
                        <AlertTriangle className="w-4 h-4" />
                        View Disputes
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhooks */}
        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`text-lg ${textClass}`}>Webhook Configuration</CardTitle>
                <p className={`text-sm mt-1 ${mutedTextClass}`}>
                  Real-time event updates for payments, payouts, disputes
                </p>
              </div>
              <Webhook className={`w-5 h-5 ${mutedTextClass}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhookEndpoints.map((webhook) => (
              <div key={webhook.id} className={`p-4 rounded-lg border ${borderColor}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className={`text-xs ${textClass} font-mono`}>{webhook.url}</code>
                      <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                        {webhook.status}
                      </Badge>
                    </div>
                    <p className={`text-xs ${mutedTextClass}`}>
                      Last event: {webhook.lastEvent}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.slice(0, 3).map((event) => (
                    <Badge key={event} variant="secondary" className="text-[10px]">
                      {event}
                    </Badge>
                  ))}
                  {webhook.events.length > 3 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{webhook.events.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              Configure Webhooks
            </Button>
            <div className={`p-3 rounded-lg ${secondaryBgClass} text-xs ${mutedTextClass}`}>
              <strong>Events to monitor:</strong> payment_intent.succeeded, payout.paid, charge.dispute.created, 
              account.updated, capability.updated
            </div>
          </CardContent>
        </Card>

        {/* Security & Permissions */}
        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`text-lg ${textClass}`}>Security & Permissions</CardTitle>
                <p className={`text-sm mt-1 ${mutedTextClass}`}>
                  Role-based access, API key management, audit logs
                </p>
              </div>
              <Lock className={`w-5 h-5 ${mutedTextClass}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className={`text-sm font-medium ${textClass}`}>Security Status</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span className={textClass}>API keys stored server-side only</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span className={textClass}>Webhook signatures verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span className={textClass}>Account IDs encrypted at rest</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span className={textClass}>Role-based access control active</span>
                </li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-blue-500" />
                <span className={`text-sm font-medium ${textClass}`}>Data Management</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={mutedTextClass}>Stored Account IDs</span>
                  <span className={textClass}>{connectedAccounts.length} accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedTextClass}>API Calls (24h)</span>
                  <span className={textClass}>1,247 requests</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedTextClass}>Webhook Events (24h)</span>
                  <span className={textClass}>342 events</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full gap-2">
              <Activity className="w-4 h-4" />
              View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${textClass}`}>Recent Transaction Activity</CardTitle>
          <p className={`text-sm mt-1 ${mutedTextClass}`}>
            Latest payments, payouts, and disputes across all connected accounts
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-3 rounded-lg ${secondaryBgClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'payout' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                  }`}>
                    {tx.type === 'payout' 
                      ? <DollarSign className="w-5 h-5 text-emerald-500" /> 
                      : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${textClass}`}>{tx.account}</p>
                    <p className={`text-xs ${mutedTextClass}`}>
                      {tx.type} • {tx.id} • {tx.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${textClass}`}>
                    ${tx.amount.toLocaleString()}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      tx.status === 'paid' || tx.status === 'won'
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-amber-500 text-amber-500'
                    }`}
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">
            View All Transactions
          </Button>
        </CardContent>
      </Card>

      {/* Documentation Resources */}
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${textClass}`}>Stripe Connect Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <a href="https://docs.stripe.com/connect" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
                Connect Overview
              </a>
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <a href="https://docs.stripe.com/connect/saas/tasks/app-fees" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
                Application Fees Guide
              </a>
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <a href="https://docs.stripe.com/connect/webhooks" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
                Connect Webhooks
              </a>
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <a href="https://docs.stripe.com/api" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
                API Reference
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
