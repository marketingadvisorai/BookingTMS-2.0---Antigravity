import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Users, 
  Search,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Send,
  Filter,
  UserPlus
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface AttendeeListDialogProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

type Attendee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  waiverStatus: 'signed' | 'pending';
  waiverDate: string;
  isMinor: boolean;
};

// Mock attendee data
const mockAttendees: Attendee[] = [
  {
    id: 'ATT-001',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    waiverStatus: 'signed',
    waiverDate: 'Oct 29, 2025',
    isMinor: false
  },
  {
    id: 'ATT-002',
    name: 'Mike Chen',
    email: 'mike.c@email.com',
    phone: '+1 (555) 234-5678',
    waiverStatus: 'signed',
    waiverDate: 'Oct 29, 2025',
    isMinor: false
  },
  {
    id: 'ATT-003',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1 (555) 345-6789',
    waiverStatus: 'pending',
    waiverDate: '-',
    isMinor: false
  },
  {
    id: 'ATT-004',
    name: 'Tommy Davis',
    email: 'parent@email.com',
    phone: '+1 (555) 345-6789',
    waiverStatus: 'signed',
    waiverDate: 'Oct 29, 2025',
    isMinor: true
  },
  {
    id: 'ATT-005',
    name: 'Alex Thompson',
    email: 'alex.t@email.com',
    phone: '+1 (555) 456-7890',
    waiverStatus: 'pending',
    waiverDate: '-',
    isMinor: false
  },
];

export default function AttendeeListDialog({ booking, isOpen, onClose }: AttendeeListDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendees] = useState<Attendee[]>(mockAttendees);

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || attendee.waiverStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: attendees.length,
    signed: attendees.filter(a => a.waiverStatus === 'signed').length,
    pending: attendees.filter(a => a.waiverStatus === 'pending').length,
    minors: attendees.filter(a => a.isMinor).length
  };

  const handleSendReminders = () => {
    const pendingCount = stats.pending;
    toast.success(`Sending reminders to ${pendingCount} attendees...`);
  };

  // CSV export helpers
  const escapeCsv = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape double quotes by doubling them, wrap with quotes if contains comma/newline/quote
    const needsQuotes = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const buildCsv = (rows: Attendee[]) => {
    const header = [
      'Attendee ID',
      'Name',
      'Email',
      'Phone',
      'Waiver Status',
      'Signed Date',
      'Type',
      booking?.id ? 'Booking ID' : undefined,
    ].filter(Boolean) as string[];

    const body = rows.map((a) => [
      escapeCsv(a.id),
      escapeCsv(a.name),
      escapeCsv(a.email),
      escapeCsv(a.phone),
      escapeCsv(a.waiverStatus),
      escapeCsv(a.waiverDate),
      escapeCsv(a.isMinor ? 'Minor' : 'Adult'),
      booking?.id ? escapeCsv(booking.id) : undefined,
    ].filter((v) => v !== undefined).join(','));

    return [header.join(','), ...body].join('\n');
  };

  const downloadCsv = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportList = () => {
    const rows = filteredAttendees;
    if (rows.length === 0) {
      toast.info('No attendees to export for current filters.');
      return;
    }

    const csv = buildCsv(rows);
    const ts = new Date();
    const stamp = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}_${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}`;
    const base = booking?.id ? `attendees_${booking.id}` : 'attendees_all';
    const filename = `${base}_${stamp}.csv`;

    downloadCsv(csv, filename);
    toast.success(`Exported ${rows.length} attendee${rows.length > 1 ? 's' : ''} to ${filename}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-5xl max-h-[90vh] overflow-hidden flex flex-col ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Attendee List</DialogTitle>
          <DialogDescription className={textMutedClass}>
            {booking ? `Viewing attendees for booking ${booking.id}` : 'All upcoming bookings attendees'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Total</p>
                  <p className={`text-xl mt-1 ${textClass}`}>{stats.total}</p>
                </div>
                <Users className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Signed</p>
                  <p className={`text-xl mt-1 ${textClass}`}>{stats.signed}</p>
                </div>
                <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Pending</p>
                  <p className={`text-xl mt-1 ${textClass}`}>{stats.pending}</p>
                </div>
                <Clock className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Minors</p>
                  <p className={`text-xl mt-1 ${textClass}`}>{stats.minors}</p>
                </div>
                <UserPlus className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>

          <Separator className={borderClass} />

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
              <Input
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attendee Table */}
          <div className={`rounded-lg border ${borderClass} overflow-hidden`}>
            <Table>
              <TableHeader>
                <TableRow className={borderClass}>
                  <TableHead className={textMutedClass}>Name</TableHead>
                  <TableHead className={textMutedClass}>Contact</TableHead>
                  <TableHead className={textMutedClass}>Waiver Status</TableHead>
                  <TableHead className={textMutedClass}>Signed Date</TableHead>
                  <TableHead className={textMutedClass}>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className={`text-center py-8 ${textMutedClass}`}>
                      No attendees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <TableRow key={attendee.id} className={`${borderClass} ${hoverBgClass} transition-colors`}>
                      <TableCell>
                        <div>
                          <p className={`text-sm ${textClass}`}>{attendee.name}</p>
                          <p className={`text-xs ${textMutedClass}`}>{attendee.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1 text-xs ${textMutedClass}`}>
                            <Mail className="w-3 h-3" />
                            {attendee.email}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${textMutedClass}`}>
                            <Phone className="w-3 h-3" />
                            {attendee.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            attendee.waiverStatus === 'signed'
                              ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0')
                              : (isDark ? 'bg-yellow-500/20 text-yellow-400 border-0' : 'bg-yellow-100 text-yellow-700 border-0')
                          }
                        >
                          {attendee.waiverStatus === 'signed' ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {attendee.waiverStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className={textMutedClass}>
                        {attendee.waiverDate}
                      </TableCell>
                      <TableCell>
                        {attendee.isMinor && (
                          <Badge className={isDark ? 'bg-purple-500/20 text-purple-400 border-0' : 'bg-purple-100 text-purple-700 border-0'}>
                            Minor
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleSendReminders} className="h-11" disabled={stats.pending === 0}>
              <Send className="w-4 h-4 mr-2" />
              Send Reminders ({stats.pending})
            </Button>
            <Button variant="outline" onClick={handleExportList} className="h-11">
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
            <Button 
              onClick={onClose}
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={`h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
