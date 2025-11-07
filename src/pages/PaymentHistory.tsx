/**
 * Payment & Transaction History Page
 * Comprehensive payment management system
 * 
 * Features:
 * - Transaction history with advanced filtering
 * - Payment method management
 * - Refund processing
 * - Revenue analytics
 * - Reconciliation tools
 * - Export functionality
 */

'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { RefundDialog } from '../components/payments/RefundDialog';
import { mockTransactions, mockRevenueMetrics, mockReconciliationSummary } from '../lib/payment/mockData';
import { Transaction, PaymentStatus, PaymentMethod, RefundReason } from '../types/payment';
import { toast } from 'sonner@2.0.3';
import { jsPDF } from 'jspdf';

export function PaymentHistory() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { hasPermission } = useAuth();

  // State
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Dark mode classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      const searchMatch = 
        transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.bookingId && transaction.bookingId.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;

      // Payment method filter
      const methodMatch = paymentMethodFilter === 'all' || transaction.paymentMethod.type === paymentMethodFilter;

      // Date filter
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const transactionDate = new Date(transaction.createdAt);
        const now = new Date();
        
        if (dateFilter === 'today') {
          dateMatch = transactionDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = transactionDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = transactionDate >= monthAgo;
        }
      }

      return searchMatch && statusMatch && methodMatch && dateMatch;
    });
  }, [transactions, searchQuery, statusFilter, paymentMethodFilter, dateFilter]);

  // Get status badge
  const getStatusBadge = (status: PaymentStatus) => {
    const configs = {
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

    const config = configs[status];
    const Icon = config.icon;
    const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <Badge className={`${config.className} gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method: PaymentMethod, details: any) => {
    if (details.last4) {
      return `${details.brand} •••• ${details.last4}`;
    }
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle refund
  const handleRefund = async (
    transactionId: string,
    amount: number,
    reason: RefundReason,
    notes: string,
    notifyCustomer: boolean
  ) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update transaction
    const updatedTransactions = transactions.map(t => {
      if (t.id === transactionId) {
        const totalRefunded = (t.refundAmount || 0) + amount;
        return {
          ...t,
          status: totalRefunded >= t.amount ? 'refunded' as PaymentStatus : 'partially_refunded' as PaymentStatus,
          refundAmount: totalRefunded,
          refundReason: reason,
          refundNotes: notes,
          refundedAt: new Date().toISOString(),
          refundedBy: 'current-user@bookingtms.com'
        };
      }
      return t;
    });

    setTransactions(updatedTransactions);
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);

      const data = filteredTransactions;

      if (!data || data.length === 0) {
        toast.error('No transactions to export based on current filters.');
        return;
      }

      if (exportFormat === 'csv') {
        const headers = [
          'Transaction Ref',
          'Type',
          'Status',
          'Amount',
          'Currency',
          'Refund Amount',
          'Customer Name',
          'Customer Email',
          'Booking ID',
          'Payment Method',
          'Card Brand',
          'Last4',
          'Created At',
          'Processed At',
          'Refunded At',
          'Invoice Number',
          'Receipt URL',
          'Reconciled',
          'Reconciled At'
        ];

        const rows = data.map(t => [
          t.transactionRef,
          t.type,
          t.status,
          t.amount.toFixed(2),
          t.currency,
          (t.refundAmount ?? 0).toFixed(2),
          t.customerName,
          t.customerEmail,
          t.bookingId ?? '',
          t.paymentMethod?.type ?? '',
          t.paymentMethod?.brand ?? '',
          t.paymentMethod?.last4 ?? '',
          new Date(t.createdAt).toISOString(),
          t.processedAt ? new Date(t.processedAt).toISOString() : '',
          t.refundedAt ? new Date(t.refundedAt).toISOString() : '',
          t.invoiceNumber ?? '',
          t.receiptUrl ?? '',
          t.reconciled ? 'Yes' : 'No',
          t.reconciledAt ? new Date(t.reconciledAt).toISOString() : ''
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.map(v => {
          const str = String(v ?? '');
          const needsQuotes = /[",\n]/.test(str);
          const escaped = str.replace(/"/g, '""');
          return needsQuotes ? `"${escaped}"` : escaped;
        }).join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV export complete');
      } else if (exportFormat === 'pdf') {
        const doc = new jsPDF();
        let y = 14;
        doc.setFontSize(16);
        doc.text('Payment History Export', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
        y += 8;

        const lineHeight = 6;
        const marginLeft = 14;
        const pageHeight = doc.internal.pageSize.getHeight();

        data.forEach((t, idx) => {
          const lines = [
            `#${idx + 1} • ${t.transactionRef} • ${t.status.toUpperCase()} • ${t.currency} ${t.amount.toFixed(2)}`,
            `Type: ${t.type} • Method: ${t.paymentMethod?.brand || ''} ${t.paymentMethod?.last4 ? '•••• ' + t.paymentMethod.last4 : t.paymentMethod?.type || ''}`,
            `Customer: ${t.customerName} <${t.customerEmail}>`,
            `Booking: ${t.bookingId || 'N/A'}`,
            `Created: ${new Date(t.createdAt).toLocaleString()}${t.processedAt ? ' • Processed: ' + new Date(t.processedAt).toLocaleString() : ''}`,
            `${t.refundAmount ? `Refunded: ${t.currency} ${(t.refundAmount || 0).toFixed(2)}${t.refundedAt ? ' • At: ' + new Date(t.refundedAt).toLocaleString() : ''}` : ''}`,
            `Reconciled: ${t.reconciled ? 'Yes' : 'No'}${t.reconciledAt ? ' • ' + new Date(t.reconciledAt).toLocaleString() : ''}`,
          ].filter(Boolean);

          lines.forEach(line => {
            if (y + lineHeight > pageHeight - 10) {
              doc.addPage();
              y = 14;
            }
            doc.text(line, marginLeft, y);
            y += lineHeight;
          });

          // Separator
          if (y + lineHeight > pageHeight - 10) {
            doc.addPage();
            y = 14;
          }
          doc.text('—'.repeat(40), marginLeft, y);
          y += lineHeight;
        });

        doc.save(`payment-history-${new Date().toISOString().slice(0,10)}.pdf`);
        toast.success('PDF export complete');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to export payment history');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  // Handle reconcile
  const handleReconcile = (transactionId: string) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          reconciled: true,
          reconciledAt: new Date().toISOString(),
          reconciledBy: 'current-user@bookingtms.com'
        };
      }
      return t;
    });
    setTransactions(updatedTransactions);
    toast.success('Transaction marked as reconciled');
  };

  return (
    <>
      <PageHeader
        title="Payments & History"
        description="Manage payments, refunds, and revenue reconciliation"
      />

      <div className="space-y-6">
        {/* Revenue Metrics - Elevated Container */}
        <div className={`${isDark ? 'bg-[#161616] border border-[#1e1e1e]' : 'bg-white border border-gray-200'} rounded-lg shadow-sm p-6`}>
          <h2 className={`mb-4 ${textPrimary}`}>Revenue Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <Card className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${textSecondary}`}>Total Revenue</span>
                <DollarSign className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className={`text-2xl ${textPrimary}`}>${mockRevenueMetrics.totalRevenue.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+12.5% from last period</span>
              </div>
            </Card>

            {/* Total Refunds */}
            <Card className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${textSecondary}`}>Total Refunds</span>
                <RotateCcw className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className={`text-2xl ${textPrimary}`}>${mockRevenueMetrics.totalRefunds.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">-3.2% from last period</span>
              </div>
            </Card>

            {/* Net Revenue */}
            <Card className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${textSecondary}`}>Net Revenue</span>
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className={`text-2xl ${textPrimary}`}>${mockRevenueMetrics.netRevenue.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs ${textSecondary}`}>After refunds</span>
              </div>
            </Card>

            {/* Success Rate */}
            <Card className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${textSecondary}`}>Success Rate</span>
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className={`text-2xl ${textPrimary}`}>{mockRevenueMetrics.successRate}%</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs ${textSecondary}`}>{mockRevenueMetrics.transactionCount} transactions</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Container */}
        <div className={`${isDark ? 'bg-[#161616] border border-[#1e1e1e]' : 'bg-white border border-gray-200'} rounded-lg shadow-sm p-6`}>
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className={isDark ? 'bg-[#0a0a0a] border border-[#2a2a2a]' : 'bg-gray-100 border border-gray-200'}>
              <TabsTrigger 
                value="transactions"
                className={`gap-2 ${isDark ? 'data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white text-[#a3a3a3]' : ''}`}
              >
                <CreditCard className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="reconciliation"
                className={`gap-2 ${isDark ? 'data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white text-[#a3a3a3]' : ''}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Reconciliation
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                  <Input
                    placeholder="Search by customer, email, transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 h-12 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}>
                  <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                    <SelectItem value="all" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>All Statuses</SelectItem>
                    <SelectItem value="completed" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Completed</SelectItem>
                    <SelectItem value="pending" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Pending</SelectItem>
                    <SelectItem value="processing" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Processing</SelectItem>
                    <SelectItem value="failed" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Failed</SelectItem>
                    <SelectItem value="refunded" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Refunded</SelectItem>
                    <SelectItem value="partially_refunded" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Partially Refunded</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
                  <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                    <SelectItem value="all" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>All Time</SelectItem>
                    <SelectItem value="today" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Today</SelectItem>
                    <SelectItem value="week" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Last 7 Days</SelectItem>
                    <SelectItem value="month" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className={textSecondary}>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                <PermissionGuard permissions={['payments.export']}>
                  <Button
                    variant="outline"
                    onClick={() => setShowExportDialog(true)}
                    className={`gap-2 ${isDark ? 'border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </PermissionGuard>
              </div>

              {/* Transactions Table */}
              <Card className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} shadow-sm`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDark ? 'bg-[#161616] border-b-2 border-[#2a2a2a]' : 'bg-gray-50 border-b-2 border-gray-200'}`}>
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
                      {filteredTransactions.map((transaction) => (
                        <tr 
                          key={transaction.id} 
                          className={`border-b ${isDark ? 'border-[#2a2a2a] hover:bg-[#161616]' : 'border-gray-200 hover:bg-gray-50'} transition-colors cursor-pointer`}
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsDetailDialogOpen(true);
                          }}
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
                              {getPaymentMethodDisplay(transaction.paymentMethod.type, transaction.paymentMethod)}
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(transaction.status)}
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
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setIsDetailDialogOpen(true);
                                }}
                                className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white' : ''}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <PermissionGuard permissions={['payments.refund']}>
                                {transaction.status === 'completed' || transaction.status === 'partially_refunded' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setIsRefundDialogOpen(true);
                                    }}
                                    className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white' : ''}
                                    disabled={transaction.amount === transaction.refundAmount}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                ) : null}
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                      <p className={textSecondary}>No transactions found</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Reconciliation Tab */}
            <TabsContent value="reconciliation" className="space-y-6">
              <Card className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} p-6`}>
                <h3 className={`mb-4 ${textPrimary}`}>Reconciliation Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${textSecondary} mb-1`}>Reconciled</div>
                    <div className={`text-2xl ${textPrimary}`}>{mockReconciliationSummary.reconciledTransactions}</div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      ${mockReconciliationSummary.reconciledAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${textSecondary} mb-1`}>Unreconciled</div>
                    <div className={`text-2xl ${textPrimary}`}>{mockReconciliationSummary.unreconciledTransactions}</div>
                    <div className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      ${mockReconciliationSummary.unreconciledAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${textSecondary} mb-1`}>Last Reconciled</div>
                    <div className={`text-sm ${textPrimary}`}>
                      {mockReconciliationSummary.lastReconciledDate 
                        ? new Date(mockReconciliationSummary.lastReconciledDate).toLocaleDateString()
                        : 'Never'}
                    </div>
                  </div>
                </div>

                <PermissionGuard permissions={['payments.reconcile']}>
                  <div className="space-y-4">
                    <h4 className={textPrimary}>Unreconciled Transactions</h4>
                    {transactions.filter(t => !t.reconciled && t.status === 'completed').map(transaction => (
                      <div
                        key={transaction.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-[#161616] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <div className="flex-1">
                          <div className={textPrimary}>{transaction.transactionRef}</div>
                          <div className={`text-sm ${textSecondary}`}>
                            {transaction.customerName} • ${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleReconcile(transaction.id)}
                          className="text-white hover:opacity-90"
                          style={{ backgroundColor: '#4f46e5' }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Reconciled
                        </Button>
                      </div>
                    ))}
                  </div>
                </PermissionGuard>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      {/* Refund Dialog */}
      <RefundDialog
        transaction={selectedTransaction}
        isOpen={isRefundDialogOpen}
        onClose={() => {
          setIsRefundDialogOpen(false);
          setSelectedTransaction(null);
        }}
        onRefund={handleRefund}
      />

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className={textPrimary}>Transaction Details</DialogTitle>
                <DialogDescription className={textSecondary}>
                  {selectedTransaction.transactionRef}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div>
                  <h4 className={`mb-3 ${textPrimary}`}>Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-sm ${textSecondary}`}>Name</div>
                      <div className={textPrimary}>{selectedTransaction.customerName}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSecondary}`}>Email</div>
                      <div className={textPrimary}>{selectedTransaction.customerEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Transaction Info */}
                <div>
                  <h4 className={`mb-3 ${textPrimary}`}>Transaction Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-sm ${textSecondary}`}>Amount</div>
                      <div className={textPrimary}>${selectedTransaction.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSecondary}`}>Status</div>
                      <div>{getStatusBadge(selectedTransaction.status)}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSecondary}`}>Payment Method</div>
                      <div className={textPrimary}>
                        {getPaymentMethodDisplay(selectedTransaction.paymentMethod.type, selectedTransaction.paymentMethod)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSecondary}`}>Date</div>
                      <div className={textPrimary}>
                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {selectedTransaction.bookingId && (
                      <div>
                        <div className={`text-sm ${textSecondary}`}>Booking ID</div>
                        <div className={textPrimary}>{selectedTransaction.bookingId}</div>
                      </div>
                    )}
                    {selectedTransaction.invoiceNumber && (
                      <div>
                        <div className={`text-sm ${textSecondary}`}>Invoice</div>
                        <div className={textPrimary}>{selectedTransaction.invoiceNumber}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Refund Info */}
                {selectedTransaction.refundAmount && selectedTransaction.refundAmount > 0 && (
                  <div>
                    <h4 className={`mb-3 ${textPrimary}`}>Refund Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className={`text-sm ${textSecondary}`}>Refund Amount</div>
                        <div className={isDark ? 'text-red-400' : 'text-red-600'}>
                          ${selectedTransaction.refundAmount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm ${textSecondary}`}>Refund Date</div>
                        <div className={textPrimary}>
                          {selectedTransaction.refundedAt 
                            ? new Date(selectedTransaction.refundedAt).toLocaleString()
                            : 'N/A'}
                        </div>
                      </div>
                      {selectedTransaction.refundReason && (
                        <div className="col-span-2">
                          <div className={`text-sm ${textSecondary}`}>Reason</div>
                          <div className={textPrimary}>
                            {selectedTransaction.refundReason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                      )}
                      {selectedTransaction.refundNotes && (
                        <div className="col-span-2">
                          <div className={`text-sm ${textSecondary}`}>Notes</div>
                          <div className={textPrimary}>{selectedTransaction.refundNotes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedTransaction.description && (
                  <div>
                    <div className={`text-sm ${textSecondary} mb-2`}>Description</div>
                    <div className={textPrimary}>{selectedTransaction.description}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
          <DialogHeader>
            <DialogTitle className={textPrimary}>Export Transactions</DialogTitle>
            <DialogDescription className={textSecondary}>
              Choose a format and export the currently filtered transactions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className={textSecondary}>Format</Label>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={exportFormat === 'csv' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('csv')}
                  className={isDark ? (exportFormat === 'csv' ? '' : 'border-[#2a2a2a] text-[#a3a3a3]') : ''}
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('pdf')}
                  className={isDark ? (exportFormat === 'pdf' ? '' : 'border-[#2a2a2a] text-[#a3a3a3]') : ''}
                >
                  PDF
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowExportDialog(false)}
                className={isDark ? 'text-[#a3a3a3] hover:text-white hover:bg-[#161616]' : ''}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'Exporting…' : 'Export'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
