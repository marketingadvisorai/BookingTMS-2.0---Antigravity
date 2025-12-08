/**
 * Invoice History Component
 * Displays recent invoices with download links
 * @module billing/components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Receipt, Loader2 } from 'lucide-react';
import type { Invoice } from '../types';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  loading?: boolean;
  isDark?: boolean;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  paid: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
  open: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400' },
  draft: { bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-400' },
  void: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400' },
  uncollectible: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400' },
};

export function InvoiceHistory({
  invoices,
  loading,
  isDark = false,
}: InvoiceHistoryProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const rowHover = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <Card className={`${cardBg} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardBg} border ${borderClass} shadow-sm`}>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={textClass}>Invoice History</CardTitle>
            <CardDescription className={mutedClass}>
              Your billing history and receipts
            </CardDescription>
          </div>
          <Receipt className={`w-5 h-5 ${mutedClass}`} />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {invoices.length === 0 ? (
          <div className={`text-center py-8 ${mutedClass}`}>
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.slice(0, 6).map((invoice) => {
              const status = invoice.status || 'draft';
              const colors = statusColors[status] || statusColors.draft;

              return (
                <div
                  key={invoice.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${rowHover} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className={`text-sm font-medium ${textClass}`}>
                        {invoice.invoice_number || invoice.stripe_invoice_id}
                      </p>
                      <p className={`text-xs ${mutedClass}`}>
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={`${colors.bg} ${colors.text} border-0 capitalize`}>
                      {status}
                    </Badge>
                    <p className={`text-sm font-medium ${textClass}`}>
                      {formatAmount(invoice.total, invoice.currency)}
                    </p>
                    <div className="flex items-center gap-1">
                      {invoice.invoice_pdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.invoice_pdf!, '_blank')}
                          className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3]' : ''}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {invoice.hosted_invoice_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                          className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3]' : ''}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default InvoiceHistory;
