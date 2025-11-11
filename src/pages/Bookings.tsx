import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useBookings } from '../hooks/useBookings';
import { useGames, type Game } from '../hooks/useGames';
import { useVenues, type Venue } from '../hooks/useVenues';
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
  Loader2
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

interface AddBookingFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  venueId: string;
  gameId: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  notes: string;
  customerNotes: string;
  paymentMethod: string;
  paymentStatus: string;
  depositAmount: number;
}

interface GameOption {
  id: string;
  name: string;
  venueId?: string;
  duration: number;
  price: number;
  childPrice: number;
  color: string;
}

interface AddBookingSubmission extends AddBookingFormValues {
  totalAmount: number;
  endTime: string;
}

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: AddBookingSubmission) => Promise<void>;
  bookings: Booking[];
  gamesData: GameOption[];
  venues: Venue[];
  isSubmitting: boolean;
}

// Adapter function to convert Supabase BookingWithDetails to UI Booking format
const adaptBookingFromSupabase = (sb: any): Booking => ({
  id: sb.confirmation_code || sb.id,
  customer: sb.customer_name || 'Unknown',
  email: sb.customer_email || '',
  phone: sb.customer_phone || '',
  game: sb.game_name || 'Unknown Game',
  gameId: sb.game_id,
  date: sb.booking_date || '',
  time: sb.booking_time || '',
  groupSize: sb.players || 0,
  adults: sb.players || 0,
  children: 0,
  amount: Number(sb.total_amount) || 0,
  status: (sb.status || 'pending') as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
  paymentMethod: sb.payment_method || 'Credit Card',
  notes: sb.notes || '',
  assignedStaffId: sb.metadata?.assigned_staff_id,
  checkInTime: sb.metadata?.check_in_time,
  checkOutTime: sb.metadata?.check_out_time,
  venueId: sb.venue_id,
  venueName: sb.venue_name || 'Unknown Venue',
});

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
  return `${resultHours}:${resultMinutes}`;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(amount) ? amount : 0);

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
      duration: g.duration ?? 60,
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
  
  // Date range states
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all-games');
  // Removed staff filter from search options bar

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
          'Booking ID','Customer','Email','Phone','Game','Date','Time','Group Size','Adults','Children','Amount','Status','Payment Method','Assigned Staff','Check In','Check Out','Notes'
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
        a.download = `bookings_${new Date().toISOString().slice(0,10)}.csv`;
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
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
        y += 10;

        records.forEach(b => {
          const line = `ID ${b.id} • ${b.customer} • ${b.game} • ${formatDate(b.date)} ${b.time} • ${b.groupSize} ppl • $${b.amount} • ${b.status}`;
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, 14, y);
          y += 7;
        });

        doc.save(`bookings_${new Date().toISOString().slice(0,10)}.pdf`);
      }

      toast.success(`Bookings exported successfully as ${exportFormat.toUpperCase()}`);
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

  // Date range filtering
  const getDateRangeLabel = () => {
    if (dateRangePreset === 'all') return 'All Time';
    if (dateRangePreset === 'today') return 'Today';
    if (dateRangePreset === 'yesterday') return 'Yesterday';
    if (dateRangePreset === 'last7days') return 'Last 7 Days';
    if (dateRangePreset === 'last30days') return 'Last 30 Days';
    if (dateRangePreset === 'thisWeek') return 'This Week';
    if (dateRangePreset === 'lastWeek') return 'Last Week';
    if (dateRangePreset === 'thisMonth') return 'This Month';
    if (dateRangePreset === 'lastMonth') return 'Last Month';
    if (dateRangePreset === 'thisQuarter') return 'This Quarter';
    if (dateRangePreset === 'thisYear') return 'This Year';
    if (dateRangePreset === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Select Date Range';
  };

  const isDateInRange = (dateStr: string) => {
    if (dateRangePreset === 'all') return true;
    
    const bookingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateRangePreset === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      return dateStr === todayStr;
    }

    if (dateRangePreset === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return dateStr === yesterday.toISOString().split('T')[0];
    }

    if (dateRangePreset === 'last7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return bookingDate >= sevenDaysAgo && bookingDate <= today;
    }

    if (dateRangePreset === 'last30days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return bookingDate >= thirtyDaysAgo && bookingDate <= today;
    }

    if (dateRangePreset === 'thisWeek') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    }

    if (dateRangePreset === 'lastWeek') {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return bookingDate >= startOfLastWeek && bookingDate <= endOfLastWeek;
    }

    if (dateRangePreset === 'thisMonth') {
      return bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
    }

    if (dateRangePreset === 'lastMonth') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return bookingDate.getMonth() === lastMonth.getMonth() && bookingDate.getFullYear() === lastMonth.getFullYear();
    }

    if (dateRangePreset === 'thisQuarter') {
      const quarter = Math.floor(today.getMonth() / 3);
      const startMonth = quarter * 3;
      const bookingQuarter = Math.floor(bookingDate.getMonth() / 3);
      return bookingQuarter === quarter && bookingDate.getFullYear() === today.getFullYear();
    }

    if (dateRangePreset === 'thisYear') {
      return bookingDate.getFullYear() === today.getFullYear();
    }

    if (dateRangePreset === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return bookingDate >= start && bookingDate <= end;
    }

    return true;
  };

  // Filter bookings based on search, filters, and date range
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesGame = gameFilter === 'all-games' || booking.game === gameFilter;
    
    const matchesDateRange = isDateInRange(booking.date);
    
    return matchesSearch && matchesStatus && matchesGame && matchesDateRange;
  });

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
        game_id: values.gameId,
        customer_name: `${values.firstName} ${values.lastName}`.trim(),
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
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
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
          {filteredBookings.length} {filteredBookings.length !== bookings.length && `of ${bookings.length}`} booking{filteredBookings.length !== 1 ? 's' : ''}
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
                          className={`flex-shrink-0 text-xs border
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
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    exportFormat === 'csv' 
                      ? 'border-[#4f46e5] dark:border-[#6366f1] bg-blue-50 dark:bg-[#4f46e5]/10' 
                      : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#404040]'
                  }`}
                >
                  <p className="text-sm text-gray-900 dark:text-white">CSV File</p>
                  <p className="text-xs text-gray-600 dark:text-[#737373] mt-1">Excel compatible spreadsheet</p>
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    exportFormat === 'pdf' 
                      ? 'border-[#4f46e5] dark:border-[#6366f1] bg-blue-50 dark:bg-[#4f46e5]/10' 
                      : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#404040]'
                  }`}
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

// Month Calendar View Component
function MonthCalendarView({ bookings, onViewDetails, onShowAttendees, calendarMonth, setCalendarMonth, gamesData }: any) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDay = (day: number) => {
    const { year, month } = getDaysInMonth(calendarMonth);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter((b: any) => b.date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarMonth);

  const prevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const days: React.ReactElement[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[120px]" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = getBookingsForDay(day);
    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
    
    days.push(
      <div
        key={day}
        className={`min-h-[80px] sm:min-h-[120px] border border-gray-200 dark:border-[#2a2a2a] p-1 sm:p-2 bg-white dark:bg-[#161616] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors ${
          isToday ? 'ring-1 sm:ring-2 ring-[#4f46e5] dark:ring-[#6366f1]' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className={`text-xs sm:text-sm ${isToday ? 'bg-blue-600 dark:bg-[#4f46e5] text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs' : 'text-gray-900 dark:text-white'}`}>
            {day}
          </span>
          {dayBookings.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 sm:h-6 text-xs px-1 sm:px-2"
              onClick={() => onShowAttendees(new Date(year, month, day))}
            >
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
              <span className="hidden sm:inline">{dayBookings.reduce((sum: number, b: any) => sum + b.groupSize, 0)}</span>
            </Button>
          )}
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          {dayBookings.slice(0, 2).map((booking: any) => {
            const gameColor = gamesData.find(g => g.name === booking.game)?.color || '#6b7280';
            return (
              <div
                key={booking.id}
                className="text-xs p-1 sm:p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: gameColor + '20', borderLeft: `2px sm:3px solid ${gameColor}` }}
                onClick={() => onViewDetails(booking)}
              >
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" style={{ color: gameColor }} />
                  <span className="text-[10px] sm:text-xs truncate" style={{ color: gameColor }}>{booking.time}</span>
                </div>
                <p className="text-gray-900 dark:text-white truncate mt-0.5 text-[10px] sm:text-xs hidden sm:block">{booking.game}</p>
                <p className="text-gray-600 dark:text-[#737373] text-[10px] truncate hidden sm:block">{booking.customer}</p>
              </div>
            );
          })}
          {dayBookings.length > 2 && (
            <button
              className="text-[10px] sm:text-xs text-[#4f46e5] dark:text-[#6366f1] hover:text-[#4338ca] dark:hover:text-[#818cf8] w-full text-left pl-1 sm:pl-1.5"
              onClick={() => onShowAttendees(new Date(year, month, day))}
            >
              +{dayBookings.length - 2} more
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-[#4f46e5] dark:text-[#6366f1] flex-shrink-0" />
            <span className="truncate text-sm sm:text-base">{new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCalendarMonth(new Date())} className="h-8 sm:h-9 px-3 text-xs sm:text-sm">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="grid grid-cols-7 gap-0 overflow-x-auto">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs sm:text-sm text-gray-600 dark:text-[#737373] p-1 sm:p-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#2a2a2a]">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
          {days}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-2">Games:</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {gamesData.map(game => (
              <div key={game.id} className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: game.color }} />
                <span className="text-xs text-gray-700 dark:text-[#a3a3a3] truncate">{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Week View Component
function WeekView({ bookings, onViewDetails, selectedDate, setSelectedDate, gamesData }: any) {
  const getWeekDays = (date: Date): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);

  const getBookingsForTimeSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((b: any) => {
      if (b.date !== dateStr) return false;
      // Compare just the hour part (HH:MM vs HH:MM:SS)
      const bookingTime = b.time.substring(0, 5); // Get HH:MM
      return bookingTime === time;
    });
  };

  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-[#4f46e5] dark:text-[#6366f1]" />
            Week View
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={prevWeek} className="h-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="flex-1 sm:flex-initial h-9">
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek} className="h-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="relative">
          <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="min-w-[800px]">
            {/* Week Days Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs text-gray-600 dark:text-[#737373] p-2">Time</div>
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    className={`text-center p-2 rounded-t-lg ${isToday ? 'bg-blue-50 dark:bg-[#4f46e5]/10 border border-blue-200 dark:border-[#4f46e5]/30' : 'bg-gray-50 dark:bg-[#0a0a0a]'}`}
                  >
                    <p className="text-xs text-gray-600 dark:text-[#737373]">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className={`text-sm ${isToday ? 'text-[#4f46e5] dark:text-[#6366f1]' : 'text-gray-900 dark:text-white'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-1">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-1">
                  <div className="text-xs text-gray-600 dark:text-[#737373] p-2 flex items-center">
                    {time}
                  </div>
                  {weekDays.map((day, idx) => {
                    const dayBookings = getBookingsForTimeSlot(day, time);
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-[#2a2a2a] p-1 min-h-[60px] bg-white dark:bg-[#161616] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                      >
                        {dayBookings.map((booking: any) => {
                          const gameColor = gamesData.find(g => g.name === booking.game)?.color || '#6b7280';
                          return (
                            <div
                              key={booking.id}
                              className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity mb-1"
                              style={{ backgroundColor: gameColor + '20', borderLeft: `3px solid ${gameColor}` }}
                              onClick={() => onViewDetails(booking)}
                            >
                              <p className="text-gray-900 dark:text-white truncate">{booking.game}</p>
                              <p className="text-gray-600 dark:text-[#737373] text-[10px] truncate">{booking.customer}</p>
                              <p className="text-gray-500 dark:text-[#525252] text-[10px]">{booking.groupSize} people</p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            </div>
          </div>
          {/* Scroll indicator for mobile */}
          <div className="sm:hidden text-center text-xs text-gray-500 dark:text-gray-400 mt-2 py-1">
            ← Swipe to view all days →
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Day View Component
function DayView({ bookings, onViewDetails, selectedDate, setSelectedDate, gamesData }: any) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);
  
  const getBookingsForTimeSlot = (time: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return bookings.filter((b: any) => {
      if (b.date !== dateStr) return false;
      // Compare just the hour part (HH:MM vs HH:MM:SS)
      const bookingTime = b.time.substring(0, 5); // Get HH:MM
      return bookingTime === time;
    });
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#4f46e5] dark:text-[#6366f1]" />
            <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            {isToday && <Badge className="bg-blue-600 dark:bg-[#4f46e5]">Today</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={prevDay} className="h-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="flex-1 sm:flex-initial h-9">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextDay} className="h-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-2">
          {timeSlots.map((time) => {
            const timeBookings = getBookingsForTimeSlot(time);
            return (
              <div key={time} className="flex gap-3 border-b border-gray-100 dark:border-[#2a2a2a] pb-2">
                <div className="w-20 flex-shrink-0 text-sm text-gray-600 dark:text-[#737373] pt-2">
                  {time}
                </div>
                <div className="flex-1 space-y-2">
                  {timeBookings.length === 0 ? (
                    <div className="h-16 border border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-lg flex items-center justify-center text-xs text-gray-400 dark:text-[#525252]">
                      No bookings
                    </div>
                  ) : (
                    timeBookings.map((booking: any) => {
                      const gameColor = gamesData.find(g => g.name === booking.game)?.color || '#6b7280';
                      return (
                        <Card
                          key={booking.id}
                          className="cursor-pointer hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-shadow border-l-4 dark:border-[#2a2a2a]"
                          style={{ borderLeftColor: gameColor }}
                          onClick={() => onViewDetails(booking)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-gray-900 dark:text-white mb-1">{booking.game}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-[#737373]">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {booking.customer}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {booking.groupSize} people
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ${booking.amount}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`border
                                  ${booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : ''}
                                  ${booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : ''}
                                  ${booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' : ''}
                                `}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Schedule View Component (All Rooms Side by Side)
function ScheduleView({ bookings, onViewDetails, selectedDate, setSelectedDate, gamesData }: any) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);
  
  const getBookingsForGameAndTime = (game: string, time: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return bookings.filter((b: any) => {
      if (b.date !== dateStr || b.game !== game) return false;
      // Compare just the hour part (HH:MM vs HH:MM:SS)
      const bookingTime = b.time.substring(0, 5); // Get HH:MM
      return bookingTime === time;
    });
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-[#4f46e5] dark:text-[#6366f1]" />
            <span>Schedule by Room</span>
            {isToday && <Badge className="bg-blue-600 dark:bg-[#4f46e5]">Today</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={prevDay} className="h-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="flex-1 sm:flex-initial h-9">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextDay} className="h-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-[#737373] mt-2">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="relative">
          <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="min-w-[900px]">
            {/* Room Headers */}
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `100px repeat(${gamesData.length}, 1fr)` }}>
              <div className="text-xs text-gray-600 dark:text-[#737373] p-2">Time</div>
              {gamesData.map((game) => (
                <div
                  key={game.id}
                  className="text-center p-2 rounded-t-lg"
                  style={{ backgroundColor: game.color + '20' }}
                >
                  <div className="w-3 h-3 rounded mx-auto mb-1" style={{ backgroundColor: game.color }} />
                  <p className="text-xs text-gray-900 dark:text-white">{game.name}</p>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-1">
              {timeSlots.map((time) => (
                <div key={time} className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${gamesData.length}, 1fr)` }}>
                  <div className="text-xs text-gray-600 dark:text-[#737373] p-2 flex items-center">
                    {time}
                  </div>
                  {gamesData.map((game) => {
                    const gameBookings = getBookingsForGameAndTime(game.name, time);
                    return (
                      <div
                        key={game.id}
                        className="border border-gray-200 dark:border-[#2a2a2a] p-1 min-h-[60px] bg-white dark:bg-[#161616] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                      >
                        {gameBookings.map((booking: any) => (
                          <div
                            key={booking.id}
                            className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity mb-1"
                            style={{ backgroundColor: game.color + '20', borderLeft: `3px solid ${game.color}` }}
                            onClick={() => onViewDetails(booking)}
                          >
                            <p className="text-gray-900 dark:text-white truncate">{booking.customer}</p>
                            <p className="text-gray-600 dark:text-[#737373] text-[10px]">{booking.groupSize} people</p>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1 py-0 h-4 mt-1 border
                                ${booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : ''}
                                ${booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : ''}
                              `}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            </div>
          </div>
          {/* Scroll indicator for mobile */}
          <div className="sm:hidden text-center text-xs text-gray-500 dark:text-gray-400 mt-2 py-1">
            ← Swipe to view all rooms →
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Booking Dialog Component
function AddBookingDialog({ open, onOpenChange, onCreate, bookings, gamesData, venues, isSubmitting }: AddBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AddBookingFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    venueId: '',
    gameId: '',
    date: '',
    time: '',
    adults: 2,
    children: 0,
    notes: '',
    customerNotes: '',
    paymentMethod: 'credit-card',
    paymentStatus: 'pending',
    depositAmount: 0,
  });

  // Validation & helpers
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const selectedVenue = useMemo(() => venues.find((v) => v.id === formData.venueId), [venues, formData.venueId]);
  const selectedGame = useMemo(() => gamesData.find((g) => g.id === formData.gameId), [gamesData, formData.gameId]);
  const isSlotAvailable = (date: string, time: string) => {
    if (!date || !time || !selectedGame || !formData.venueId) return false;
    return !bookings.some((b) => {
      const sameDate = b.date === date;
      const sameTime = b.time === time;
      const sameGame = b.gameId ? b.gameId === selectedGame.id : b.game === selectedGame.name;
      const sameVenue = b.venueId ? b.venueId === formData.venueId : true;
      return sameDate && sameTime && sameGame && sameVenue && b.status !== 'cancelled';
    });
  };
  const isDateTimeNotPast = (date: string, time: string) => {
    if (!date || !time) return false;
    const [hh, mm] = time.split(':').map(Number);
    const dt = new Date(date);
    dt.setHours(hh || 0, mm || 0, 0, 0);
    return dt.getTime() >= new Date().getTime();
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      toast.error('Please enter the first name.');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Please enter the last name.');
      return false;
    }
    if (!formData.email.trim() || !isEmailValid(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.venueId) { toast.error('Please select a venue.'); return false; }
    if (!formData.gameId) { toast.error('Please select a game.'); return false; }
    if (!formData.date) { toast.error('Please select a date.'); return false; }
    if (!formData.time) { toast.error('Please select a time.'); return false; }
    if ((formData.adults ?? 0) < 1) { toast.error('Adults must be at least 1.'); return false; }
    if ((formData.children ?? 0) < 0) { toast.error('Children cannot be negative.'); return false; }
    if (!isDateTimeNotPast(formData.date, formData.time)) { toast.error('Selected date/time is in the past.'); return false; }
    if (!isSlotAvailable(formData.date, formData.time)) { toast.error('This time slot is already booked. Choose another.'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1) { if (!validateStep1()) return; setStep(2); return; }
    if (step === 2) { if (!validateStep2()) return; setStep(3); return; }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    // Final guard before create
    if (!validateStep1() || !validateStep2()) return;
    if (onCreate) {
      try {
        const submission: AddBookingSubmission = {
          ...formData,
          totalAmount,
          endTime: estimatedEndTime || formData.time,
        };
        await onCreate(submission);
        onOpenChange(false);
        setStep(1);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          venueId: '',
          gameId: '',
          date: '',
          time: '',
          adults: 2,
          children: 0,
          notes: '',
          customerNotes: '',
          paymentMethod: 'credit-card',
          paymentStatus: 'pending',
          depositAmount: 0,
        });
      } catch (error) {
        // errors handled by onCreate (toast), keep dialog open
      }
      return;
    }
  };

  const availableGames = useMemo(() => {
    if (!formData.venueId) return gamesData;
    return gamesData.filter((g) => g.venueId === formData.venueId);
  }, [gamesData, formData.venueId]);

  const totalAmount = useMemo(() => {
    const adultPrice = selectedGame?.price ?? 30;
    const childPrice = selectedGame?.childPrice ?? Math.max((selectedGame?.price ?? 30) * 0.7, 0);
    return (formData.adults * adultPrice) + (formData.children * childPrice);
  }, [formData.adults, formData.children, selectedGame]);

  const estimatedEndTime = useMemo(() => {
    if (!selectedGame || !formData.time) return '';
    return addMinutesToTime(formData.time, selectedGame.duration);
  }, [selectedGame, formData.time]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
          <DialogDescription>
            Create a new booking for a customer. Step {step} of 3.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</div>
                <h3 className="text-sm sm:text-base text-gray-900">Customer Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="mt-1 h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Booking Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</div>
                <h3 className="text-sm sm:text-base text-gray-900">Booking Details</h3>
              </div>

              <div>
                <Label htmlFor="venue" className="text-sm">Select Venue *</Label>
                <Select
                  value={formData.venueId}
                  onValueChange={(value) => setFormData((prev) => ({
                    ...prev,
                    venueId: value,
                    gameId: '',
                    time: '',
                  }))}
                >
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue placeholder="Choose a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(venues) && venues.length > 0 ? (
                      venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-venues" disabled>
                        No venues available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="game" className="text-sm">Select Game *</Label>
                <Select
                  value={formData.gameId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gameId: value, time: '' }))}
                  disabled={!formData.venueId}
                >
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue placeholder={formData.venueId ? 'Choose a game' : 'Select a venue first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGames.length > 0 ? (
                      availableGames.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-games" disabled>
                        {formData.venueId ? 'No games available for this venue' : 'Select a venue to load games'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-sm">Time *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData({ ...formData, time: value })}
                    disabled={!formData.date || !formData.gameId}
                  >
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue placeholder={formData.gameId ? 'Select time' : 'Select a game first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {['10:00','12:00','14:00','16:00','18:00','20:00'].map((t) => {
                        const unavailable = formData.date && formData.gameId ? !isSlotAvailable(formData.date, t) : true;
                        const label = (
                          t === '10:00' ? '10:00 AM' :
                          t === '12:00' ? '12:00 PM' :
                          t === '14:00' ? '2:00 PM' :
                          t === '16:00' ? '4:00 PM' :
                          t === '18:00' ? '6:00 PM' :
                          '8:00 PM'
                        );
                        return (
                          <SelectItem key={t} value={t} disabled={unavailable}>
                            {label}{unavailable && formData.date && formData.gameId ? ' (Unavailable)' : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults" className="text-sm">Number of Adults *</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 0 })}
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="children" className="text-sm">Number of Children</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                    className="mt-1 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Internal Notes (Admin Only)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes for staff..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="customerNotes" className="text-sm">Customer Notes</Label>
                <Textarea
                  id="customerNotes"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  placeholder="Special requests from customer..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment & Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">3</div>
                <h3 className="text-sm sm:text-base text-gray-900">Payment & Confirmation</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm text-blue-900 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="text-gray-900">{formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="text-gray-900">{selectedVenue?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Game:</span>
                    <span className="text-gray-900">{selectedGame?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="text-gray-900">{formData.date || '—'}{formData.time ? ` at ${formData.time}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated End:</span>
                    <span className="text-gray-900">{estimatedEndTime || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group Size:</span>
                    <span className="text-gray-900">{formData.adults} adults, {formData.children} children</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Status</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partially_paid">Partially Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="depositAmount" className="text-sm">Deposit Amount (Optional)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="mt-1 h-11"
                />
                <p className="text-xs text-gray-500 mt-1">Leave as 0 if no deposit is required</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full sm:w-auto h-11">
              Back
            </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-11 order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-11 order-1 sm:order-2"
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-11 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Booking Details Dialog Component
function BookingDetailsDialog({ open, onOpenChange, booking, onRefund, onReschedule, staffList, onAssignStaff, onUpdateStatus, onCheckIn, onCheckOut, onSendConfirmation, onSave }: any) {
  if (!booking) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [isSaving, setIsSaving] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
        <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Complete information for booking {booking.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto overflow-x-hidden px-4 sm:px-6 flex-1">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={`text-sm px-3 py-1 border
                ${booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : ''}
                ${booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : ''}
                ${booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' : ''}
                ${booking.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' : ''}
                ${booking.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' : ''}
              `}
            >
              {booking.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-[#737373]">ID: {booking.id}</span>
          </div>

          {/* Assignment & Status Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
            <div>
              <Label className="text-sm">Assigned Staff</Label>
              <Select value={booking.assignedStaffId || ''} onValueChange={(val) => onAssignStaff && onAssignStaff(val)}>
                <SelectTrigger className="mt-1 h-11 w-full">
                  <SelectValue placeholder={booking.assignedStaffId ? (staffList?.find((s: any) => s.id === booking.assignedStaffId)?.name || 'Assigned') : 'Assign staff'} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(staffList) && staffList.length > 0 ? staffList.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  )) : (
                    <SelectItem value="no-staff" disabled>No staff available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select value={booking.status} onValueChange={(val) => onUpdateStatus && onUpdateStatus(val)}>
                <SelectTrigger className="mt-1 h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(booking.checkInTime || booking.checkOutTime) && (
              <div className="sm:col-span-2 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-[#737373]">
                  {booking.checkInTime && (<span>Checked in: {new Date(booking.checkInTime).toLocaleString()}</span>)}
                  {booking.checkOutTime && (<span className="ml-4">Checked out: {new Date(booking.checkOutTime).toLocaleString()}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-sm text-gray-600 dark:text-[#737373] mb-3">Customer Information</h3>
            <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400 dark:text-[#525252]" />
                <span className="text-gray-900 dark:text-white">{booking.customer}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 dark:text-[#525252]" />
                <span className="text-gray-600 dark:text-[#737373]">{booking.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 dark:text-[#525252]" />
                <span className="text-gray-600 dark:text-[#737373]">{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div>
            <h3 className="text-sm text-gray-600 dark:text-[#737373] mb-3">Booking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-[#737373] mb-2">Venue</p>
                <p className="text-base text-gray-900 dark:text-white font-medium">{booking.venueName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-[#737373] mb-2">Game</p>
                <p className="text-base text-gray-900 dark:text-white font-medium">{booking.game}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-[#737373] mb-2">Date & Time</p>
                <p className="text-base text-gray-900 dark:text-white font-medium">{formatDate(booking.date)}</p>
                <p className="text-sm text-gray-600 dark:text-[#737373] mt-1">{booking.time}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-[#737373] mb-2">Group Size</p>
                <p className="text-base text-gray-900 dark:text-white font-medium">{booking.groupSize} people</p>
                <p className="text-sm text-gray-600 dark:text-[#737373] mt-1">{booking.adults} adults, {booking.children} children</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4 lg:col-span-2">
                <p className="text-xs text-gray-500 dark:text-[#737373] mb-2">Payment</p>
                <p className="text-base text-gray-900 dark:text-white font-medium">${booking.amount}</p>
                <p className="text-sm text-gray-600 dark:text-[#737373] mt-1">{booking.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <h3 className="text-sm text-gray-600 dark:text-[#737373] mb-2">Special Notes</h3>
              <div className="bg-yellow-50 dark:bg-amber-500/10 border border-yellow-200 dark:border-amber-500/30 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-[#a3a3a3]">{booking.notes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={async () => {
              if (!onSave) return;
              try {
                setIsSaving(true);
                await onSave();
              } finally {
                setIsSaving(false);
              }
            }}
            className="w-full sm:w-auto h-11"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">
            Close
          </Button>
          <Button variant="outline" className="w-full sm:w-auto h-11" onClick={() => onSendConfirmation && onSendConfirmation()}>
            <Mail className="w-4 h-4 mr-2" />
            Send Confirmation
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11"
            onClick={() => onReschedule && onReschedule(booking)}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Reschedule
          </Button>
          {(!booking.checkInTime && booking.status !== 'cancelled') && (
            <Button onClick={() => onCheckIn && onCheckIn()} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-11">
              <Clock className="w-4 h-4 mr-2" />
              Check In
            </Button>
          )}
          {(booking.checkInTime && !booking.checkOutTime) && (
            <Button onClick={() => onCheckOut && onCheckOut()} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-11">
              <Clock className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <PermissionGuard permissions={['payments.refund']}>
              <Button
                variant="outline"
                className="text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 w-full sm:w-auto h-11"
                onClick={() => {
                  onOpenChange(false);
                  onRefund(booking);
                }}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Process Refund
              </Button>
            </PermissionGuard>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Refund Dialog Component
function RefundDialog({ open, onOpenChange, booking }: any) {
  const [refundAmount, setRefundAmount] = useState(booking?.amount || 0);
  const [refundReason, setRefundReason] = useState('');

  const handleRefund = () => {
    toast.success(`Refund of $${refundAmount} processed successfully!`);
    onOpenChange(false);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Issue a refund for booking {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-orange-900 dark:text-orange-400">
                  This action will refund the customer and update the booking status.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="refund-amount" className="text-sm">Refund Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#737373]">$</span>
              <Input
                id="refund-amount"
                type="number"
                min="0"
                max={booking.amount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                className="pl-7 h-11"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-[#737373] mt-1">
              Original amount: ${booking.amount}
            </p>
          </div>

          <div>
            <Label htmlFor="refund-reason" className="text-sm">Refund Reason</Label>
            <Textarea
              id="refund-reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter the reason for this refund..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Customer:</span>
              <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate ml-2">{booking.customer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Payment Method:</span>
              <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{booking.paymentMethod}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            className="bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700 w-full sm:w-auto h-11"
            disabled={!refundAmount || refundAmount <= 0}
          >
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Attendee List Dialog Component
function AttendeeListDialog({ open, onOpenChange, date, bookings, gamesData = [] }: any) {
  if (!date) return null;

  const totalAttendees = bookings.reduce((sum: number, b: any) => sum + b.groupSize, 0);
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + b.amount, 0);

  const escapeCsv = (value: any) => {
    const str = value === null || value === undefined ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const buildCsv = (rows: any[]) => {
    const headers = [
      'Booking ID', 'Customer', 'Email', 'Phone', 'Game', 'Date', 'Time', 'Group Size', 'Amount', 'Status'
    ];
    const lines = [headers.join(',')];
    rows.forEach(r => {
      lines.push([
        escapeCsv(r.id),
        escapeCsv(r.customer),
        escapeCsv(r.email),
        escapeCsv(r.phone),
        escapeCsv(r.game),
        escapeCsv(r.date),
        escapeCsv(r.time),
        escapeCsv(r.groupSize),
        escapeCsv(r.amount),
        escapeCsv(r.status)
      ].join(','));
    });
    return lines.join('\n');
  };

  const downloadCsv = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportList = () => {
    const rows = bookings || [];
    if (!rows.length) {
      toast.info('No bookings to export for this day');
      return;
    }
    const csv = buildCsv(rows);
    const ts = new Date();
    const stamp = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}_${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}`;
    const filename = `attendees_${date.toISOString().split('T')[0]}_${stamp}.csv`;
    downloadCsv(csv, filename);
    toast.success(`Exported ${rows.length} records`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            All bookings and attendees for this day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-blue-600 truncate">Bookings</p>
                    <p className="text-lg sm:text-2xl text-blue-900">{bookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-green-600 truncate">Attendees</p>
                    <p className="text-lg sm:text-2xl text-green-900">{totalAttendees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-purple-600 truncate">Revenue</p>
                    <p className="text-lg sm:text-2xl text-purple-900">${totalRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <ScrollArea className="h-[300px] sm:h-[400px]">
            <div className="space-y-3 pr-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No bookings for this day</p>
                </div>
              ) : (
                bookings.map((booking: any) => {
                  const gameColor = gamesData.find(g => g.name === booking.game)?.color || '#6b7280';
                  return (
                    <Card key={booking.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-12 rounded" style={{ backgroundColor: gameColor }} />
                              <div>
                                <h4 className="text-gray-900">{booking.game}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {booking.time}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {booking.groupSize} people
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Separator className="my-2" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-gray-900">{booking.customer}</p>
                                <p className="text-xs text-gray-600">{booking.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Group Composition</p>
                                <p className="text-gray-900">{booking.adults} Adults, {booking.children} Children</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="text-xl text-gray-900">${booking.amount}</p>
                            <Badge
                              variant="secondary"
                              className={`mt-2
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                                ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                              `}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExportList}>
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
// Reschedule Dialog Component
function RescheduleDialog({ open, onOpenChange, booking, onConfirm, bookings = [] }: any) {
  const [newDate, setNewDate] = useState<Date | undefined>(booking ? new Date(booking.date) : undefined);
  const [newTime, setNewTime] = useState<string>(booking?.time || '');

  // Define standard business hours time slots (10:00 - 23:00)
  const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);

  useEffect(() => {
    if (booking) {
      setNewDate(new Date(booking.date));
      setNewTime(booking.time);
    }
  }, [booking]);

  if (!booking) return null;

  const formatDateISO = (d: Date) => d.toISOString().split('T')[0];

  // Compute availability for the selected date based on existing bookings
  const slotsForSelectedDate = (date?: Date) => {
    if (!date) return [] as { time: string; available: boolean }[];
    const dateStr = formatDateISO(date);
    return TIME_SLOTS.map((time) => {
      const isBusy = bookings.some((b: any) => b.date === dateStr && b.time === time && b.status !== 'cancelled' && b.id !== booking.id);
      return { time, available: !isBusy };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-blue-600 dark:text-[#4f46e5]" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Update the date and time for booking {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">New Date</Label>
            <div className="mt-2 border rounded-md p-2">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={(date: Date) => date < new Date(new Date().setHours(0,0,0,0))}
                className="rounded-md [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">New Time</Label>
            <div className="mt-2">
              {newDate ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {slotsForSelectedDate(newDate).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setNewTime(slot.time)}
                      disabled={!slot.available}
                      className={`
                        px-3 py-2 rounded-lg border-2 text-center transition-all
                        ${newTime === slot.time
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : slot.available
                            ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 cursor-not-allowed opacity-50'}
                      `}
                    >
                      <div className="text-sm">{slot.time}</div>
                      <div className={`text-xs mt-0.5 ${slot.available ? 'text-green-600' : 'text-red-500'}`}>
                        {slot.available ? 'Available' : 'Unavailable'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-2">Select a date to view available time slots</div>
              )}
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-3 h-11"
              />
              <p className="text-xs text-gray-500 mt-1">Pick a slot or enter a custom time.</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-[#4f46e5]/10 border border-blue-200 dark:border-[#4f46e5]/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-[#6366f1]" />
              <span className="text-blue-900 dark:text-[#a5b4fc]">Current: {formatDate(booking.date)} {booking.time}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (newDate && newTime && onConfirm) {
                onConfirm(formatDateISO(newDate), newTime);
                // proactively close dialog to avoid any overlay lingering
                onOpenChange && onOpenChange(false);
              }
            }}
            className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-11"
            disabled={!newDate || !newTime}
          >
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// Cancel Dialog Component
function CancelDialog({ open, onOpenChange, booking, onConfirm }: any) {
  const [reason, setReason] = useState('');
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            This will mark booking {booking.id} as cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-red-900 dark:text-red-400">
              Customers may need to be notified and any payments handled separately.
            </p>
          </div>
          <div>
            <Label className="text-sm">Cancellation Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 h-24"
              placeholder="e.g., Customer requested cancellation due to illness"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">
            Keep Booking
          </Button>
          <Button
            onClick={() => onConfirm && onConfirm(reason)}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 w-full sm:w-auto h-11"
          >
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
