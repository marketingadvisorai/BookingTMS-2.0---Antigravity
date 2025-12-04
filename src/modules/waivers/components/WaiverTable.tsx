/**
 * Waiver Table Component
 * Displays signed waiver records in a searchable, filterable table
 * @module waivers/components/WaiverTable
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Send,
  Filter,
  X,
} from 'lucide-react';
import { WaiverRecord, WaiverFilters, WaiverStatus } from '../types';
import { getStatusColor, formatDisplayDate } from '../utils/mappers';

interface WaiverTableProps {
  waivers: WaiverRecord[];
  loading: boolean;
  isDark: boolean;
  filters: WaiverFilters;
  onFiltersChange: (filters: WaiverFilters) => void;
  onView: (waiver: WaiverRecord) => void;
  onDownload: (waiver: WaiverRecord) => void;
  onDelete: (waiver: WaiverRecord) => void;
  onSendReminder: (waivers: WaiverRecord[]) => void;
  onBulkDelete: (waivers: WaiverRecord[]) => void;
}

export function WaiverTable({
  waivers,
  loading,
  isDark,
  filters,
  onFiltersChange,
  onView,
  onDownload,
  onDelete,
  onSendReminder,
  onBulkDelete,
}: WaiverTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === waivers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(waivers.map(w => w.id)));
    }
  };

  const selectedWaivers = waivers.filter(w => selectedIds.has(w.id));
  const hasSelection = selectedIds.size > 0;

  return (
    <Card className={`${cardBgClass} border ${borderClass}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className={textClass}>Waiver Records</CardTitle>
          
          {hasSelection && (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${textMutedClass}`}>
                {selectedIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendReminder(selectedWaivers.filter(w => w.status === 'pending'))}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkDelete(selectedWaivers)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMutedClass}`} />
            <Input
              placeholder="Search by name, email, or code..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9 h-10"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              status: value as WaiverFilters['status'] 
            })}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>

          {(filters.search || filters.status !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({ search: '', status: 'all' })}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={isDark ? 'border-[#2a2a2a]' : ''}>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === waivers.length && waivers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className={textMutedClass}>Participant</TableHead>
                <TableHead className={textMutedClass}>Template</TableHead>
                <TableHead className={textMutedClass}>Waiver Code</TableHead>
                <TableHead className={textMutedClass}>Status</TableHead>
                <TableHead className={textMutedClass}>Signed Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ) : waivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className={`text-center py-8 ${textMutedClass}`}>
                    No waivers found
                  </TableCell>
                </TableRow>
              ) : (
                waivers.map((waiver) => (
                  <TableRow 
                    key={waiver.id} 
                    className={`${hoverBgClass} ${isDark ? 'border-[#2a2a2a]' : ''}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(waiver.id)}
                        onCheckedChange={() => toggleSelect(waiver.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={`font-medium ${textClass}`}>{waiver.participantName}</p>
                        <p className={`text-sm ${textMutedClass}`}>{waiver.participantEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className={textMutedClass}>
                      {waiver.templateName}
                    </TableCell>
                    <TableCell>
                      <code className={`text-sm ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`}>
                        {waiver.waiverCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(waiver.status, isDark)}>
                        {waiver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={textMutedClass}>
                      {waiver.signedAt ? formatDisplayDate(waiver.signedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                          <DropdownMenuItem onClick={() => onView(waiver)}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload(waiver)}>
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(waiver)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
