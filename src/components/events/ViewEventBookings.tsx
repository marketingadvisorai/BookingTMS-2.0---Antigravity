import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ViewGameBookingsProps {
  game: {
    id: string;
    name: string;
    description?: string;
  };
  onClose: () => void;
}

// Mock bookings data
const generateMockBookings = (gameId: string, gameName: string) => [
  {
    id: 1,
    bookingRef: 'BK-001234',
    customerName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    date: '2025-11-05',
    time: '14:00',
    duration: 60,
    adults: 4,
    children: 2,
    totalAmount: 180,
    status: 'confirmed',
    paymentStatus: 'paid',
    notes: 'Birthday celebration'
  },
  {
    id: 2,
    bookingRef: 'BK-001235',
    customerName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    date: '2025-11-06',
    time: '16:00',
    duration: 60,
    adults: 6,
    children: 0,
    totalAmount: 210,
    status: 'confirmed',
    paymentStatus: 'paid',
    notes: ''
  },
  {
    id: 3,
    bookingRef: 'BK-001236',
    customerName: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 345-6789',
    date: '2025-11-07',
    time: '18:00',
    duration: 60,
    adults: 5,
    children: 1,
    totalAmount: 195,
    status: 'pending',
    paymentStatus: 'pending',
    notes: 'First time visitor'
  },
  {
    id: 4,
    bookingRef: 'BK-001237',
    customerName: 'Emily Chen',
    email: 'emily.chen@email.com',
    phone: '+1 (555) 456-7890',
    date: '2025-11-08',
    time: '15:00',
    duration: 60,
    adults: 3,
    children: 0,
    totalAmount: 90,
    status: 'confirmed',
    paymentStatus: 'paid',
    notes: 'Corporate team building'
  },
  {
    id: 5,
    bookingRef: 'BK-001238',
    customerName: 'Robert Wilson',
    email: 'robert.w@email.com',
    phone: '+1 (555) 567-8901',
    date: '2025-11-09',
    time: '17:00',
    duration: 60,
    adults: 8,
    children: 0,
    totalAmount: 240,
    status: 'cancelled',
    paymentStatus: 'refunded',
    notes: 'Cancelled due to emergency'
  },
];

export function ViewEventBookings({ game, onClose }: ViewGameBookingsProps) {
  const [bookings] = useState(generateMockBookings(game.id, game.name));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'pending': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'cancelled': return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30';
      default: return 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#2a2a2a]';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-blue-100 dark:bg-[#4f46e5]/20 text-blue-700 dark:text-[#6366f1] border border-blue-200 dark:border-[#4f46e5]/30';
      case 'pending': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'refunded': return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30';
      default: return 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#2a2a2a]';
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0)
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-6 py-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl text-gray-900 dark:text-white">Bookings for {game.name}</h2>
            <p className="text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">{game.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="border-gray-200 dark:border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-xs text-gray-600 dark:text-[#737373] mb-1">Total Bookings</p>
              <p className="text-2xl text-gray-900 dark:text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-xs text-gray-600 dark:text-[#737373] mb-1">Confirmed</p>
              <p className="text-2xl text-green-600 dark:text-emerald-400">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-xs text-gray-600 dark:text-[#737373] mb-1">Pending</p>
              <p className="text-2xl text-yellow-600 dark:text-amber-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-xs text-gray-600 dark:text-[#737373] mb-1">Cancelled</p>
              <p className="text-2xl text-red-600 dark:text-red-400">{stats.cancelled}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-xs text-gray-600 dark:text-[#737373] mb-1">Total Revenue</p>
              <p className="text-2xl text-blue-600 dark:text-[#6366f1]">${stats.totalRevenue}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#737373]" />
            <Input
              placeholder="Search by customer name, booking ref, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-gray-200 dark:border-[#2a2a2a] hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all cursor-pointer"
              onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900 dark:text-white">{booking.customerName}</h3>
                      <Badge variant="secondary" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Badge variant="secondary" className={getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 dark:text-[#a3a3a3] mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {booking.time} ({booking.duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {booking.adults} adults{booking.children > 0 && `, ${booking.children} children`}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        ${booking.totalAmount}
                      </div>
                    </div>

                    {selectedBooking?.id === booking.id && (
                      <div className="pt-3 border-t border-gray-200 dark:border-[#2a2a2a] mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-[#737373] mb-1">Booking Reference</p>
                            <p className="text-gray-900 dark:text-white">{booking.bookingRef}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-[#737373] mb-1">Email</p>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400 dark:text-[#737373]" />
                              <p className="text-gray-900 dark:text-white">{booking.email}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-[#737373] mb-1">Phone</p>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400 dark:text-[#737373]" />
                              <p className="text-gray-900 dark:text-white">{booking.phone}</p>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="col-span-2">
                              <p className="text-gray-500 mb-1">Notes</p>
                              <p className="text-gray-900">{booking.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline">Edit Booking</Button>
                          <Button size="sm" variant="outline">Send Confirmation</Button>
                          <Button size="sm" variant="outline">View Waiver</Button>
                          {booking.status !== 'cancelled' && (
                            <Button size="sm" variant="outline" className="text-red-600">Cancel Booking</Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No bookings found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No bookings have been made for this game yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
