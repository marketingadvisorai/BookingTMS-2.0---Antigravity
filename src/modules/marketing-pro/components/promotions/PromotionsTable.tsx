/**
 * MarketingPro 1.1 - Promotions Table Component
 * @description Table displaying all promotions with actions
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
  Pencil, Pause, Play, Trash2 
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getBadgeClasses } from '../../utils/theme';
import { toast } from 'sonner';

interface PromotionsTableProps {
  onCreatePromo: () => void;
}

// Sample data - in production, this would come from API
const PROMOTIONS = [
  { code: 'SUMMER25', type: 'percentage', discount: '25%', usage: 45, limit: 100, validUntil: 'Dec 31, 2025', status: 'active' },
  { code: 'FIRSTTIME10', type: 'fixed', discount: '$10', usage: 12, limit: 50, validUntil: 'Jan 15, 2026', status: 'active' },
  { code: 'BLACKFRIDAY', type: 'percentage', discount: '50%', usage: 200, limit: 200, validUntil: 'Nov 30, 2025', status: 'paused' },
];

export function PromotionsTable({ onCreatePromo }: PromotionsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className={classes.text}>Coupon Codes & Promotions</CardTitle>
            <p className={`text-sm mt-1 ${classes.textMuted}`}>Create and manage discount codes</p>
          </div>
          <Button className={classes.primaryBtn} onClick={onCreatePromo}>
            <Plus className="w-4 h-4 mr-2" />
            Create Promotion
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${classes.textMuted}`} />
              <Input placeholder="Search promotions..." className="pl-10" />
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
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROMOTIONS.map((promo) => (
                  <TableRow key={promo.code}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className={`text-sm px-2 py-1 rounded ${classes.codeBg} ${classes.text}`}>
                          {promo.code}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyCode(promo.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getBadgeClasses(promo.type, isDark)}>
                        {promo.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </Badge>
                    </TableCell>
                    <TableCell className={classes.text}>{promo.discount} off</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className={classes.text}>{promo.usage}</span>
                        <span className={classes.textMuted}> / {promo.limit}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-sm ${classes.textMuted}`}>{promo.validUntil}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClasses(promo.status, isDark)}>
                        {promo.status === 'active' ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem>
                            {promo.status === 'active' ? (
                              <><Pause className="w-4 h-4 mr-2" />Pause</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2" />Activate</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
