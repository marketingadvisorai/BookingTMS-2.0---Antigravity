/**
 * MarketingPro 1.1 - Gift Cards Table Component
 * @description Table displaying all gift cards with actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, Search, Filter, Copy, MoreVertical, 
  Eye, Send, XCircle, Upload 
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getBadgeClasses } from '../../utils/theme';
import { toast } from 'sonner';

interface GiftCardsTableProps {
  onCreateGiftCard: () => void;
}

// Sample data - in production, this would come from API
const GIFT_CARDS = [
  { code: 'GC-ABC123XYZ', amount: 100, balance: 75, recipient: 'john.doe@example.com', status: 'active', expiry: 'Dec 31, 2025' },
  { code: 'GC-DEF456UVW', amount: 50, balance: 50, recipient: 'sarah.smith@example.com', status: 'active', expiry: 'Mar 15, 2026' },
  { code: 'GC-GHI789RST', amount: 25, balance: 0, recipient: 'mike.jones@example.com', status: 'redeemed', expiry: 'Jun 30, 2025' },
];

export function GiftCardsTable({ onCreateGiftCard }: GiftCardsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const getBalancePercentage = (balance: number, amount: number) => {
    return Math.round((balance / amount) * 100);
  };

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className={classes.text}>Gift Cards</CardTitle>
            <p className={`text-sm mt-1 ${classes.textMuted}`}>Create and manage gift cards</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => toast.success('Bulk import dialog would open here')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Generate
            </Button>
            <Button className={`${classes.primaryBtn} w-full sm:w-auto`} onClick={onCreateGiftCard}>
              <Plus className="w-4 h-4 mr-2" />
              Create Gift Card
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${classes.textMuted}`} />
              <Input placeholder="Search gift cards..." className="pl-10" />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Table */}
          <div className={`border rounded-lg overflow-x-auto ${classes.border}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {GIFT_CARDS.map((card) => {
                  const pct = getBalancePercentage(card.balance, card.amount);
                  return (
                    <TableRow key={card.code}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className={`text-sm px-2 py-1 rounded ${classes.codeBg} ${classes.text}`}>
                            {card.code}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCopyCode(card.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className={classes.text}>${card.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={card.balance === 0 ? `line-through ${classes.textMuted}` : classes.text}>
                            ${card.balance.toFixed(2)}
                          </span>
                          <Badge variant="secondary" className={`text-xs ${
                            pct === 100 ? getBadgeClasses('active', isDark) :
                            pct > 0 ? (isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700') :
                            getBadgeClasses('paused', isDark)
                          }`}>
                            {pct}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className={`text-sm ${classes.textMuted}`}>{card.recipient}</TableCell>
                      <TableCell>
                        <Badge className={getBadgeClasses(card.status, isDark)}>
                          {card.status === 'active' ? 'Active' : 'Redeemed'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-sm ${classes.textMuted}`}>{card.expiry}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                            <DropdownMenuItem><Send className="w-4 h-4 mr-2" />Resend Email</DropdownMenuItem>
                            {card.status === 'active' && (
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />Deactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
