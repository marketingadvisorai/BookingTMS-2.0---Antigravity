/**
 * MarketingPro 1.1 - Affiliate Table Component
 * @description Table displaying all affiliates with stats and actions
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
  Plus, Search, Filter, MoreVertical, 
  Eye, Pencil, XCircle, Download, DollarSign
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getBadgeClasses } from '../../utils/theme';

interface AffiliateTableProps {
  onAddAffiliate: () => void;
}

const AFFILIATES = [
  { 
    name: 'Travel Blog Co', 
    email: 'contact@travelblog.com', 
    code: 'TRAVEL15', 
    commission: 15, 
    status: 'active',
    clicks: 2340,
    conversions: 67,
    revenue: 8450,
    earnings: 1267.50
  },
  { 
    name: 'Local Events Guide', 
    email: 'partner@localevents.com', 
    code: 'LOCAL10', 
    commission: 10, 
    status: 'active',
    clicks: 1850,
    conversions: 45,
    revenue: 5670,
    earnings: 567.00
  },
  { 
    name: 'Adventure Seekers', 
    email: 'team@adventureseek.io', 
    code: 'ADVENTURE20', 
    commission: 20, 
    status: 'pending',
    clicks: 560,
    conversions: 12,
    revenue: 1890,
    earnings: 378.00
  },
];

export function AffiliateTable({ onAddAffiliate }: AffiliateTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className={classes.text}>Affiliate Partners</CardTitle>
            <p className={`text-sm mt-1 ${classes.textMuted}`}>Manage affiliate partnerships and commissions</p>
          </div>
          <Button className={`${classes.primaryBtn} w-full sm:w-auto`} onClick={onAddAffiliate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${classes.textMuted}`} />
              <Input placeholder="Search affiliates..." className="pl-10" />
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
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {AFFILIATES.map((affiliate) => (
                  <TableRow key={affiliate.code}>
                    <TableCell>
                      <div>
                        <p className={`text-sm ${classes.text}`}>{affiliate.name}</p>
                        <p className={`text-xs ${classes.textMuted}`}>{affiliate.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className={`text-sm px-2 py-1 rounded ${classes.codeBg} ${classes.text}`}>
                        {affiliate.code}
                      </code>
                    </TableCell>
                    <TableCell className={classes.text}>{affiliate.commission}%</TableCell>
                    <TableCell className={classes.text}>{affiliate.clicks.toLocaleString()}</TableCell>
                    <TableCell className={classes.text}>{affiliate.conversions}</TableCell>
                    <TableCell className={classes.text}>${affiliate.revenue.toLocaleString()}</TableCell>
                    <TableCell className={classes.success}>${affiliate.earnings.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClasses(affiliate.status, isDark)}>
                        {affiliate.status === 'active' ? 'Active' : 'Pending'}
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
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem><DollarSign className="w-4 h-4 mr-2" />Pay Commission</DropdownMenuItem>
                          <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Export Report</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="w-4 h-4 mr-2" />Deactivate
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
