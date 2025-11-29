import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useBookings } from '../hooks/useBookings';
import { useGames, type Game } from '../hooks/useGames';
import { useVenues, type Venue } from '../hooks/venue/useVenues';
import { useAuth } from '../lib/auth/AuthContext';
import { PageLoadingScreen } from '../components/layout/PageLoadingScreen';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/layout/PageHeader';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Download,
  MoreVertical,
  CalendarDays,
  List,
  Plus,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  Eye,
  RefreshCcw,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  FileText,
  Grid3x3,
  Columns,
  Loader2,
  QrCode
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Calendar } from '../components/ui/calendar';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { jsPDF } from 'jspdf';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { AdminBookingService } from '../services/AdminBookingService';

// Extracted modular components
import {
  MonthCalendarView,
  WeekView,
  DayView,
  ScheduleView,
  AddBookingDialog,
  BookingDetailsDialog,
  RefundDialog,
  RescheduleDialog,
  CancelDialog,
  AttendeeListDialog,
  QRScannerDialog,
} from '../features/bookings/components';
import type { AddBookingSubmission } from '../features/bookings/components';
import type { Booking as BookingType, GameOption } from '../features/bookings/types';
import { adaptBookingFromSupabase, formatCurrency } from '../features/bookings/utils';
import { useBookingFilters } from '../features/bookings/hooks';

interface Booking {
  id: string;
  customer: string;
  email: string;
  phone: string;
  game: string;
  gameId?: string;
  date: string;
  time: string;
  groupSize: number;
  adults: number;
  children: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentMethod: string;
  notes: string;
  assignedStaffId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  venueId?: string;
  venueName?: string;
}

// AddBookingFormValues, AddBookingSubmission, AddBookingDialogProps are now imported from ../features/bookings/components
// GameOption is imported from ../features/bookings/types

// adaptBookingFromSupabase is now imported from ../features/bookings/utils

// Game colors for calendar views
const gameColors: Record<string, string> = {
  'Mystery Manor': '#8b5cf6',
  'Space Odyssey': '#3b82f6',
  'Zombie Outbreak': '#ef4444',
  'Treasure Hunt': '#f59e0b',
  'Prison Break': '#10b981',
};

const addMinutesToTime = (time: string, minutes: number): string => {
  if (!time) return time;
  const [hours, mins] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return time;
  const start = new Date();
  start.setHours(hours, mins, 0, 0);
  start.setMinutes(start.getMinutes() + minutes);
  const resultHours = start.getHours().toString().padStart(2, '0');
  const resultMinutes = start.getMinutes().toString().padStart(2, '0');
  return `${resultHours}:${resultMinutes} `;
};

// formatCurrency is now imported from ../features/bookings/utils

const seedBookings: Booking[] = [
  {
    id: 'BK-1001',
    customer: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    game: 'Mystery Manor',
    date: '2025-10-30',
    time: '14:00',
    groupSize: 6,
    adults: 4,
    children: 2,
    amount: 180,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    notes: 'Birthday celebration',
  },
  {
    id: 'BK-1002',
    customer: 'Mike Chen',
    email: 'mike.c@email.com',
    phone: '+1 (555) 234-5678',
    game: 'Space Odyssey',
    date: '2025-10-30',
    time: '16:00',
    groupSize: 4,
    adults: 4,
    children: 0,
    amount: 120,
    status: 'pending',
    paymentMethod: 'PayPal',
    notes: '',
  },
  {
    id: 'BK-1003',
    customer: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1 (555) 345-6789',
    game: 'Zombie Outbreak',
    date: '2025-10-31',
    time: '18:00',
    groupSize: 8,
    adults: 6,
    children: 2,
    amount: 240,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    notes: '',
  },
  {
    id: 'BK-1004',
    customer: 'Alex Thompson',
    email: 'alex.t@email.com',
    phone: '+1 (555) 456-7890',
    game: 'Treasure Hunt',
    date: '2025-10-31',
    time: '19:30',
    groupSize: 5,
    adults: 3,
    children: 2,
    amount: 150,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    notes: 'Family outing',
  },
  {
    id: 'BK-1005',
    customer: 'Lisa Martinez',
    email: 'lisa.m@email.com',
    phone: '+1 (555) 567-8901',
    game: 'Mystery Manor',
    date: '2025-11-01',
    time: '15:00',
    groupSize: 6,
    adults: 6,
    children: 0,
    amount: 180,
    status: 'cancelled',
    paymentMethod: 'Credit Card',
    notes: '',
  },
  {
    id: 'BK-1006',
    customer: 'David Kim',
    email: 'david.k@email.com',
    phone: '+1 (555) 678-9012',
    game: 'Prison Break',
    date: '2025-11-01',
    time: '17:00',
    groupSize: 7,
    adults: 5,
    children: 2,
    amount: 210,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    notes: '',
  },
  {
    id: 'BK-1007',
    customer: 'Jennifer White',
    email: 'jen.w@email.com',
    phone: '+1 (555) 789-0123',
    game: 'Mystery Manor',
    date: '2025-11-02',
    time: '14:00',
    groupSize: 4,
    adults: 2,
    children: 2,
    amount: 120,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    notes: '',
  },
];

export function Bookings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Venue filter state
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>(undefined);

  // Supabase hooks
  const { bookings: supabaseBookings, loading: bookingsLoading, updateBooking, cancelBooking, refreshBookings } = useBookings(selectedVenueId);
  const { games, loading: gamesLoading } = useGames();
  const { venues, loading: venuesLoading } = useVenues();
  const { currentUser } = useAuth();

  // Build games data with colors for calendar
  const gamesData: GameOption[] = useMemo(() =>
    (games || []).map(g => ({
      id: g.id,
      name: g.name,
      venueId: g.venue_id,
      duration: g.duration_minutes ?? 60,
      price: Number(g.price) || 0,
      childPrice: Number((g as any).child_price ?? g.price) || Number(g.price) || 0,
      color: gameColors[g.name] || '#6b7280'
    })),
    [games]
  );

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const codeBgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100';

  const [view, setView] = useState<'table' | 'month' | 'week' | 'day' | 'schedule'>(() => {
    // Check if there's a preferred view from Dashboard navigation
    const savedView = localStorage.getItem('bookingsDefaultView');
    if (savedView) {
      localStorage.removeItem('bookingsDefaultView'); // Clear after reading
      return savedView as 'table' | 'month' | 'week' | 'day' | 'schedule';
    }
    return 'month';
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAttendeeList, setShowAttendeeList] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportDateRange, setExportDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Check for default view from Dashboard navigation
  useEffect(() => {
    const savedView = localStorage.getItem('bookingsDefaultView');
    if (savedView) {
      setView(savedView as 'table' | 'month' | 'week' | 'day' | 'schedule');
      localStorage.removeItem('bookingsDefaultView');
    }
  }, []);

  // Convert Supabase bookings to UI format
  const bookings = useMemo(() =>
    (supabaseBookings || []).map(adaptBookingFromSupabase),
    [supabaseBookings]
  );

  // Staff list - for now empty, will be populated from auth users in future
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

  // Use the booking filters hook for all filter state and logic
  const {
    filters,
    setSearchTerm,
    setStatusFilter,
    setGameFilter,
    setDateRangePreset,
    setCustomStartDate,
    setCustomEndDate,
    setShowDateRangePicker,
    getDateRangeLabel,
    filterBookings,
    clearAllFilters,
    hasActiveFilters,
  } = useBookingFilters();

  // Destructure for easier access
  const { 
    searchTerm, 
    statusFilter, 
    gameFilter, 
    dateRangePreset, 
    customStartDate, 
    customEndDate, 
    showDateRangePicker 
  } = filters;

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  // Persist current details of the selected booking (status + assigned staff)
  const saveDetails = async () => {
    try {
      if (!selectedBooking) return;
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === selectedBooking.id || b.id === selectedBooking.id
      );
      if (sbBooking) {
        await updateBooking(sbBooking.id, {
          status: selectedBooking.status,
          metadata: {
            ...sbBooking.metadata,
            assigned_staff_id: selectedBooking.assignedStaffId || sbBooking.metadata?.assigned_staff_id
          }
        });
      }
      await refreshBookings();
      toast.success('Changes saved');
    } catch (error) {
      console.error('Failed to save booking changes:', error);
      toast.error('Failed to save changes');
    }
  };

  const handleRefund = (booking: any) => {
    setSelectedBooking(booking);
    setShowRefundDialog(true);
  };

  const handleShowAttendees = (date: Date) => {
    setSelectedDate(date);
    setShowAttendeeList(true);
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const records = filteredBookings;

      if (exportFormat === 'csv') {
        const headers = [
          'Booking ID', 'Customer', 'Email', 'Phone', 'Game', 'Date', 'Time', 'Group Size', 'Adults', 'Children', 'Amount', 'Status', 'Payment Method', 'Assigned Staff', 'Check In', 'Check Out', 'Notes'
        ];

        const escape = (val: any) => {
          const s = val === undefined || val === null ? '' : String(val);
          return '"' + s.replace(/"/g, '""') + '"';
        };

        const rows = records.map(b => [
          escape(b.id),
          escape(b.customer),
          escape(b.email),
          escape(b.phone),
          escape(b.game),
          escape(formatDate(b.date)),
          escape(b.time),
          escape(b.groupSize),
          escape(b.adults),
          escape(b.children),
          escape(b.amount),
          escape(b.status),
          escape(b.paymentMethod),
          escape(b.assignedStaffId ? (staffList.find(s => s.id === b.assignedStaffId)?.name || b.assignedStaffId) : ''),
          escape(b.checkInTime || ''),
          escape(b.checkOutTime || ''),
          escape(b.notes || '')
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const doc = new jsPDF();
        let y = 20;
        doc.setFontSize(16);
        doc.text('Bookings Export', 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()} `, 14, y);
        y += 10;

        records.forEach(b => {
          const line = `ID ${b.id} • ${b.customer} • ${b.game} • ${formatDate(b.date)} ${b.time} • ${b.groupSize} ppl • $${b.amount} • ${b.status} `;
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, 14, y);
          y += 7;
        });

        doc.save(`bookings_${new Date().toISOString().slice(0, 10)}.pdf`);
      }

      toast.success(`Bookings exported successfully as ${exportFormat.toUpperCase()} `);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export bookings');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const handleReschedule = (booking: any) => {
    setSelectedBooking(booking);
    setShowRescheduleDialog(true);
  };

  const confirmReschedule = async (dateStr: string, timeStr: string) => {
    if (!selectedBooking) return;
    try {
      // Find the original Supabase booking
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === selectedBooking.id || b.id === selectedBooking.id
      );
      if (sbBooking) {
        await updateBooking(sbBooking.id, {
          booking_date: dateStr,
          booking_time: timeStr
        });
      }
      setShowRescheduleDialog(false);
      setShowBookingDetails(false);
      setSelectedBooking(null);
      toast.success('Booking rescheduled');
    } catch (error) {
      console.error('Failed to reschedule:', error);
      toast.error('Failed to reschedule booking');
    }
  };

  const handleCancel = (booking: any) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const confirmCancel = async (reason?: string) => {
    if (!selectedBooking) return;
    try {
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === selectedBooking.id || b.id === selectedBooking.id
      );
      if (sbBooking) {
        await cancelBooking(sbBooking.id, reason, false);
      }
      setShowCancelDialog(false);
      setSelectedBooking(null);
      toast.success('Booking cancelled');
    } catch (error) {
      console.error('Failed to cancel:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleSendConfirmation = (booking: any) => {
    toast.success('Confirmation email sent to ' + booking.email);
  };

  // Filter bookings using the hook's filterBookings function
  // Date range, search, status, and game filters are all handled by the hook
  const filteredBookings = useMemo(() => filterBookings(bookings), [filterBookings, bookings]);

  const assignStaff = async (bookingId: string, staffId: string) => {
    try {
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === bookingId || b.id === bookingId
      );
      if (sbBooking) {
        await updateBooking(sbBooking.id, {
          metadata: {
            ...sbBooking.metadata,
            assigned_staff_id: staffId
          }
        });
      }
      toast.success('Staff assigned');
    } catch (error) {
      console.error('Failed to assign staff:', error);
      toast.error('Failed to assign staff');
    }
  };

  const updateStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === bookingId || b.id === bookingId
      );
      if (sbBooking) {
        await updateBooking(sbBooking.id, { status });
      }
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const checkIn = async (bookingId: string) => {
    try {
      const ts = new Date().toISOString();
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === bookingId || b.id === bookingId
      );
      if (sbBooking) {
        await updateBooking(sbBooking.id, {
          status: 'confirmed',
          metadata: {
            ...sbBooking.metadata,
            check_in_time: ts
          }
        });
      }
      toast.success('Checked in');
    } catch (error) {
      console.error('Failed to check in:', error);
      toast.error('Failed to check in');
    }
  };

  const checkOut = async (bookingId: string) => {
    try {
      const ts = new Date().toISOString();
      const sbBooking = (supabaseBookings || []).find(b =>
        b.confirmation_code === bookingId || b.id === bookingId
      );
      if (sbBooking) {
        await updateBooking(sbBooking.id, {
          status: 'completed',
          metadata: {
            ...sbBooking.metadata,
            check_out_time: ts
          }
        });
      }
      toast.success('Checked out');
    } catch (error) {
      console.error('Failed to check out:', error);
      toast.error('Failed to check out');
    }
  };

  const handleCreateBooking = async (values: AddBookingSubmission) => {
    if (isCreatingBooking) return;

    try {
      setIsCreatingBooking(true);

      await AdminBookingService.createAdminBooking({
        venue_id: values.venueId,
        activity_id: values.gameId,
        customer_name: `${values.firstName} ${values.lastName} `.trim(),
        customer_email: values.email,
        customer_phone: values.phone,
        booking_date: values.date,
        start_time: values.time,
        end_time: values.endTime,
        adults: values.adults,
        children: values.children,
        total_amount: values.totalAmount,
        payment_method: values.paymentMethod,
        payment_status: values.paymentStatus,
        deposit_amount: values.depositAmount,
        notes: values.notes?.trim() ? values.notes : undefined,
        customer_notes: values.customerNotes?.trim() ? values.customerNotes : undefined,
      });

      toast.success('Booking created successfully');
      await refreshBookings();
      setView('month');
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error?.message || 'Failed to create booking');
      throw error;
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Bookings"
        description="Manage and track all your bookings"
        sticky
        action={
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await refreshBookings();
                  toast.success('Bookings refreshed successfully');
                } catch (error) {
                  toast.error('Failed to refresh bookings');
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              className="h-11 w-11 flex-shrink-0"
            >
              <RefreshCcw className={`w - 4 h - 4 ${isRefreshing ? 'animate-spin' : ''} `} />
            </Button>
            <Button
              variant="outline"
              className="h-11 flex items-center justify-center gap-2"
              onClick={() => setShowQRScanner(true)}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </Button>
            <Button
              className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] flex-1 sm:flex-initial sm:w-auto h-11 flex items-center justify-center gap-2"
              onClick={() => setShowAddBooking(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Booking</span>
            </Button>
          </div>
        }
      />

      {/* Filters and Search */}
      <Card className={`${cardBgClass} border ${borderClass} shadow - sm`}>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className={`absolute left - 3 top - 1 / 2 - translate - y - 1 / 2 w - 4 h - 4 ${isDark ? 'text-[#737373]' : 'text-gray-400'} `} />
              <Input
                placeholder="Search by customer name, email, or booking ID..."
                className="pl-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
              {/* Date Range Picker */}
              <Popover open={showDateRangePicker} onOpenChange={setShowDateRangePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 col-span-2 sm:col-span-1 sm:flex-initial sm:min-w-[200px] justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{getDateRangeLabel()}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex flex-col sm:flex-row">
                    {/* Presets */}
                    <div className="border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-[#2a2a2a] p-3">
                      <div className="space-y-1 min-w-[180px]">
                        <p className="text-xs text-gray-500 dark:text-[#737373] px-2 py-1">Quick Select</p>
                        <Button
                          variant={dateRangePreset === 'all' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('all');
                            setShowDateRangePicker(false);
                          }}
                        >
                          All Time
                        </Button>
                        <Button
                          variant={dateRangePreset === 'today' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('today');
                            setShowDateRangePicker(false);
                          }}
                        >
                          Today
                        </Button>
                        <Button
                          variant={dateRangePreset === 'yesterday' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('yesterday');
                            setShowDateRangePicker(false);
                          }}
                        >
                          Yesterday
                        </Button>
                        <Button
                          variant={dateRangePreset === 'last7days' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('last7days');
                            setShowDateRangePicker(false);
                          }}
                        >
                          Last 7 Days
                        </Button>
                        <Button
                          variant={dateRangePreset === 'last30days' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('last30days');
                            setShowDateRangePicker(false);
                          }}
                        >
                          Last 30 Days
                        </Button>
                        <Separator className="my-2" />
                        <p className="text-xs text-gray-500 px-2 py-1">By Period</p>
                        <Button
                          variant={dateRangePreset === 'thisWeek' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('thisWeek');
                            setShowDateRangePicker(false);
                          }}
                        >
                          This Week
                        </Button>
                        <Button
                          variant={dateRangePreset === 'lastWeek' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('lastWeek');
                            setShowDateRangePicker(false);
                          }}
                        >
                          Last Week
                        </Button>
                        <Button
                          variant={dateRangePreset === 'thisMonth' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('thisMonth');
                            setShowDateRangePicker(false);
                          }}
                        >
                          This Month
                        </Button>
                        <Button
                          variant={dateRangePreset === 'lastMonth' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('lastMonth');
                            setShowDateRangePicker(false);
                          }}
                        >
                          Last Month
                        </Button>
                        <Button
                          variant={dateRangePreset === 'thisQuarter' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('thisQuarter');
                            setShowDateRangePicker(false);
                          }}
                        >
                          This Quarter
                        </Button>
                        <Button
                          variant={dateRangePreset === 'thisYear' ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => {
                            setDateRangePreset('thisYear');
                            setShowDateRangePicker(false);
                          }}
                        >
                          This Year
                        </Button>
                      </div>
                    </div>

                    {/* Custom Range Calendar */}
                    <div className="p-3">
                      <p className="text-sm text-gray-900 mb-2 px-2">Custom Range</p>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600 px-2">Start Date</Label>
                          <Calendar
                            mode="single"
                            selected={customStartDate}
                            onSelect={(date) => {
                              setCustomStartDate(date);
                              if (date && customEndDate) {
                                setDateRangePreset('custom');
                              }
                            }}
                            className="rounded-md border-0"
                          />
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-xs text-gray-600 px-2">End Date</Label>
                          <Calendar
                            mode="single"
                            selected={customEndDate}
                            onSelect={(date) => {
                              setCustomEndDate(date);
                              if (customStartDate && date) {
                                setDateRangePreset('custom');
                              }
                            }}
                            disabled={(date) => customStartDate ? date < customStartDate : false}
                            className="rounded-md border-0"
                          />
                        </div>
                        {customStartDate && customEndDate && (
                          <Button
                            className="w-full bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
                            onClick={() => {
                              setDateRangePreset('custom');
                              setShowDateRangePicker(false);
                            }}
                          >
                            Apply Range
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Venue Filter in Search Bar */}
              <Select value={selectedVenueId || 'all-venues'} onValueChange={(value) => {
                setSelectedVenueId(value === 'all-venues' ? undefined : value);
                setView('month'); // Switch to month view when venue changes
              }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-venues">All Venues</SelectItem>
                  {(venues || []).map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* All Games filter and 3-dot menu on same line */}
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-games">All Games</SelectItem>
                  <SelectItem value="Mystery Manor">Mystery Manor</SelectItem>
                  <SelectItem value="Space Odyssey">Space Odyssey</SelectItem>
                  <SelectItem value="Zombie Outbreak">Zombie Outbreak</SelectItem>
                  <SelectItem value="Treasure Hunt">Treasure Hunt</SelectItem>
                  <SelectItem value="Prison Break">Prison Break</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button - Only show on desktop, use dropdown on mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="sm:hidden h-11 w-11 flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PermissionGuard permissions={['bookings.export']}>
                    <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <DropdownMenuItem onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGameFilter('all-games');
                    setDateRangePreset('all');
                    setSelectedVenueId(undefined);
                    toast.success('Filters cleared');
                  }}>
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <PermissionGuard permissions={['bookings.export']}>
                <Button variant="outline" onClick={() => setShowExportDialog(true)} className="hidden sm:flex h-11">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </PermissionGuard>
            </div>

            {/* Active Filters Indicator */}
            {(searchTerm || statusFilter !== 'all' || gameFilter !== 'all-games' || dateRangePreset !== 'all' || selectedVenueId) && (
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-gray-600 dark:text-[#737373]">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1 bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3]">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-600 dark:hover:text-red-500">×</button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1 bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3]">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-600 dark:hover:text-red-500">×</button>
                  </Badge>
                )}
                {gameFilter !== 'all-games' && (
                  <Badge variant="secondary" className="gap-1 bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3]">
                    Game: {gameFilter}
                    <button onClick={() => setGameFilter('all-games')} className="ml-1 hover:text-red-600 dark:hover:text-red-500">×</button>
                  </Badge>
                )}
                {dateRangePreset !== 'all' && (
                  <Badge variant="secondary" className="gap-1 bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3]">
                    Date: {getDateRangeLabel()}
                    <button onClick={() => setDateRangePreset('all')} className="ml-1 hover:text-red-600 dark:hover:text-red-500">×</button>
                  </Badge>
                )}
                {selectedVenueId && (
                  <Badge variant="secondary" className="gap-1 bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3]">
                    Venue: {venues?.find(v => v.id === selectedVenueId)?.name || 'Selected'}
                    <button onClick={() => setSelectedVenueId(undefined)} className="ml-1 hover:text-red-600 dark:hover:text-red-500">×</button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGameFilter('all-games');
                    setDateRangePreset('all');
                    setSelectedVenueId(undefined);
                  }}
                  className="text-[#4f46e5] dark:text-[#6366f1] hover:text-[#4338ca] dark:hover:text-[#818cf8] ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto flex overflow-hidden">
              <TabsTrigger value="month" className="gap-2 flex-1 sm:flex-initial">
                <CalendarDays className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2 flex-1 sm:flex-initial">
                <Grid3x3 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="day" className="gap-2 flex-1 sm:flex-initial">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Day</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2 flex-1 sm:flex-initial">
                <Columns className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2 flex-1 sm:flex-initial">
                <List className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Table</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Venue Filter */}
          <Select value={selectedVenueId || 'all'} onValueChange={(value) => {
            setSelectedVenueId(value === 'all' ? undefined : value);
            setView('month'); // Switch to month view when venue changes
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {(venues || []).map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-gray-600 dark:text-[#737373]">
          {filteredBookings.length} {filteredBookings.length !== bookings.length && `of ${bookings.length} `} booking{filteredBookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Month Calendar View */}
      {view === 'month' && (
        <MonthCalendarView
          bookings={filteredBookings}
          onViewDetails={handleViewDetails}
          onShowAttendees={handleShowAttendees}
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
          gamesData={gamesData}
        />
      )}

      {/* Week View */}
      {view === 'week' && (
        <WeekView
          bookings={filteredBookings}
          onViewDetails={handleViewDetails}
          selectedDate={selectedDate || new Date()}
          setSelectedDate={setSelectedDate}
          gamesData={gamesData}
        />
      )}

      {/* Day View */}
      {view === 'day' && (
        <DayView
          bookings={filteredBookings}
          onViewDetails={handleViewDetails}
          selectedDate={selectedDate || new Date()}
          setSelectedDate={setSelectedDate}
          gamesData={gamesData}
        />
      )}

      {/* Schedule View */}
      {view === 'schedule' && (
        <ScheduleView
          bookings={filteredBookings}
          onViewDetails={handleViewDetails}
          selectedDate={selectedDate || new Date()}
          setSelectedDate={setSelectedDate}
          gamesData={gamesData}
        />
      )}

      {/* Table View */}
      {view === 'table' && (
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 p-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-[#404040] mb-3" />
                  <p className="text-gray-500 dark:text-[#737373]">No bookings found</p>
                  <p className="text-sm text-gray-400 dark:text-[#525252] mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.id} className="border border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white truncate">{booking.customer}</p>
                            <p className="text-xs text-gray-500 dark:text-[#737373]">{booking.id}</p>
                            {booking.assignedStaffId && (
                              <p className="text-xs text-gray-600 dark:text-[#737373] mt-1">Assigned: {staffList.find(s => s.id === booking.assignedStaffId)?.name || booking.assignedStaffId}</p>
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`flex - shrink - 0 text - xs border
                            ${booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : ''}
                            ${booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : ''}
                            ${booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' : ''}
                            ${booking.status === 'no-show' ? 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30' : ''}
                            ${booking.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' : ''}
`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <Separator className="dark:bg-[#2a2a2a]" />
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div className="min-w-0">
                            <p className="text-gray-500 dark:text-[#737373] text-xs">Game</p>
                            <p className="text-gray-900 dark:text-white truncate">{booking.game}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-500 dark:text-[#737373] text-xs">Date & Time</p>
                            <p className="text-gray-900 dark:text-white text-xs sm:text-sm">{formatDate(booking.date)}</p>
                            <p className="text-xs text-gray-500 dark:text-[#737373]">{booking.time}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-500 dark:text-[#737373] text-xs">Group Size</p>
                            <p className="text-gray-900 dark:text-white">{booking.groupSize} people</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-500 dark:text-[#737373] text-xs">Amount</p>
                            <p className="text-gray-900 dark:text-white">${booking.amount}</p>
                          </div>
                        </div>
                        <Separator className="dark:bg-[#2a2a2a]" />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            <span className="text-xs sm:text-sm">View</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleReschedule(booking)}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendConfirmation(booking)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Confirmation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRefund(booking)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Process Refund
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem onClick={() => checkIn(booking.id)}>
                                <Clock className="w-4 h-4 mr-2" />
                                Check In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => checkOut(booking.id)}>
                                <Clock className="w-4 h-4 mr-2" />
                                Check Out
                              </DropdownMenuItem>
                              <Separator />
                              {booking.status !== 'cancelled' && (
                                <DropdownMenuItem className="text-red-600 dark:text-red-500" onClick={() => handleCancel(booking)}>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-[#404040] mb-3" />
                  <p className="text-gray-500 dark:text-[#737373]">No bookings found</p>
                  <p className="text-sm text-gray-400 dark:text-[#525252] mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-[#2a2a2a]">
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Group Size</TableHead>
                      <TableHead>Assigned Staff</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                        <TableCell className="text-gray-900 dark:text-white">{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{booking.customer}</p>
                            <p className="text-xs text-gray-500 dark:text-[#737373]">{booking.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{booking.game}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(booking.date)}</p>
                            <p className="text-xs text-gray-500 dark:text-[#737373]">{booking.time}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{booking.groupSize} people</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{booking.assignedStaffId ? (staffList.find(s => s.id === booking.assignedStaffId)?.name || booking.assignedStaffId) : '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">${booking.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`border
                          ${booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : ''}
                          ${booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : ''}
                          ${booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' : ''}
                          ${booking.status === 'no-show' ? 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30' : ''}
                          ${booking.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' : ''}
`}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendConfirmation(booking)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Confirmation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReschedule(booking)}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              {booking.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleRefund(booking)}>
                                  <RefreshCcw className="w-4 h-4 mr-2" />
                                  Process Refund
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => checkIn(booking.id)}>
                                <Clock className="w-4 h-4 mr-2" />
                                Check In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => checkOut(booking.id)}>
                                <Clock className="w-4 h-4 mr-2" />
                                Check Out
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[#4f46e5]" onClick={() => { setSelectedBooking(booking); setShowBookingDetails(true); }}>
                                <Users className="w-4 h-4 mr-2" />
                                Assign Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 dark:text-red-500" onClick={() => handleCancel(booking)}>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Booking Dialog */}
      <AddBookingDialog
        open={showAddBooking}
        onOpenChange={setShowAddBooking}
        bookings={bookings}
        gamesData={gamesData}
        venues={venues}
        onCreate={handleCreateBooking}
        isSubmitting={isCreatingBooking}
      />

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        open={showBookingDetails}
        onOpenChange={(open: boolean) => {
          setShowBookingDetails(open);
          if (!open) setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onRefund={handleRefund}
        onReschedule={handleReschedule}
        staffList={staffList}
        onAssignStaff={(staffId: string) => selectedBooking && assignStaff(selectedBooking.id, staffId)}
        onUpdateStatus={(status: Booking['status']) => selectedBooking && updateStatus(selectedBooking.id, status)}
        onCheckIn={() => selectedBooking && checkIn(selectedBooking.id)}
        onCheckOut={() => selectedBooking && checkOut(selectedBooking.id)}
        onSendConfirmation={() => selectedBooking && handleSendConfirmation(selectedBooking)}
        onSave={saveDetails}
      />

      {/* Refund Dialog */}
      <RefundDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        booking={selectedBooking}
      />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        open={showRescheduleDialog}
        onOpenChange={(open: boolean) => {
          setShowRescheduleDialog(open);
          if (!open) setSelectedBooking(null);
        }}
        booking={selectedBooking}
        bookings={bookings}
        onConfirm={confirmReschedule}
      />

      {/* Attendee List Dialog */}
      <AttendeeListDialog
        open={showAttendeeList}
        onOpenChange={setShowAttendeeList}
        date={selectedDate}
        bookings={selectedDate ? getBookingsForDate(selectedDate) : []}
        gamesData={gamesData}
      />

      {/* Cancel Dialog */}
      <CancelDialog
        open={showCancelDialog}
        onOpenChange={(open: boolean) => {
          setShowCancelDialog(open);
          if (!open) setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onConfirm={confirmCancel}
      />

      {/* QR Scanner Dialog */}
      <QRScannerDialog
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        onCheckInComplete={refreshBookings}
      />

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Export Bookings</DialogTitle>
            <DialogDescription>
              Download your booking data in your preferred format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-900 dark:text-white mb-2">Export Format</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p - 4 border - 2 rounded - lg text - left transition - all ${exportFormat === 'csv'
                    ? 'border-[#4f46e5] dark:border-[#6366f1] bg-blue-50 dark:bg-[#4f46e5]/10'
                    : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#404040]'
                    } `}
                >
                  <p className="text-sm text-gray-900 dark:text-white">CSV File</p>
                  <p className="text-xs text-gray-600 dark:text-[#737373] mt-1">Excel compatible spreadsheet</p>
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p - 4 border - 2 rounded - lg text - left transition - all ${exportFormat === 'pdf'
                    ? 'border-[#4f46e5] dark:border-[#6366f1] bg-blue-50 dark:bg-[#4f46e5]/10'
                    : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#404040]'
                    } `}
                >
                  <p className="text-sm text-gray-900 dark:text-white">PDF File</p>
                  <p className="text-xs text-gray-600 dark:text-[#737373] mt-1">Printable document format</p>
                </button>
              </div>
            </div>

            <Separator className="dark:bg-[#2a2a2a]" />

            <div>
              <Label htmlFor="date-range" className="text-sm text-gray-900 dark:text-white mb-2">Date Range</Label>
              <Select value={exportDateRange} onValueChange={setExportDateRange}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-[#4f46e5]/10 border border-blue-200 dark:border-[#4f46e5]/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-blue-600 dark:text-[#6366f1] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-900 dark:text-[#a5b4fc]">
                    {exportDateRange === 'all' ? 'All' : exportDateRange === 'today' ? 'Today\'s' :
                      exportDateRange === 'quarter' ? 'This quarter\'s' : exportDateRange === 'year' ? 'This year\'s' : 'Selected'} bookings will be exported
                  </p>
                  <p className="text-xs text-blue-700 dark:text-[#818cf8] mt-1">
                    Estimated: {filteredBookings.length} records
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting} className="w-full sm:w-auto h-11">
              Cancel
            </Button>
            <Button
              className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-11"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// All dialog components are now imported from ../features/bookings/components:
// AddBookingDialog, BookingDetailsDialog, RefundDialog, RescheduleDialog, CancelDialog, AttendeeListDialog
// Calendar views: MonthCalendarView, WeekView, DayView, ScheduleView
// END OF FILE - All inline dialog definitions have been moved to the features/bookings/components directory
