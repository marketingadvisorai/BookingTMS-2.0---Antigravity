/**
 * Bookings Page - Database Version
 * Uses real Supabase database with full booking details
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PageHeader } from '../components/layout/PageHeader';
import { Calendar, Plus, Edit, X, Loader2, Search, Filter, DollarSign, Users, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { useBookings } from '../hooks/useBookings';
import { useVenues } from '../hooks/venue/useVenues';
import { useGames } from '../hooks/useGames';
import { useCustomers } from '../hooks/useCustomers';
import { format } from 'date-fns';

export function BookingsDatabase() {
  const { bookings, loading, createBooking, updateBooking, cancelBooking } = useBookings();
  const { venues } = useVenues();
  const { games } = useGames();
  const { customers } = useCustomers();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    venue_id: '',
    activity_id: '',
    customer_id: '',
    booking_date: '',
    booking_time: '',
    players: 2,
    total_amount: 0,
    deposit_amount: 0,
    notes: '',
  });

  const [cancelData, setCancelData] = useState({
    reason: '',
    issueRefund: false,
  });

  const resetForm = () => {
    setFormData({
      venue_id: '',
      activity_id: '',
      customer_id: '',
      booking_date: '',
      booking_time: '',
      players: 2,
      total_amount: 0,
      deposit_amount: 0,
      notes: '',
    });
  };

  const handleCreateBooking = async () => {
    if (!formData.venue_id || !formData.activity_id || !formData.customer_id) return;

    setSubmitting(true);
    try {
      await createBooking({
        venue_id: formData.venue_id,
        activity_id: formData.activity_id,
        customer_id: formData.customer_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        players: formData.players,
        total_amount: formData.total_amount,
        notes: formData.notes,
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setSubmitting(true);
    try {
      await cancelBooking(selectedBooking.id, cancelData.reason, cancelData.issueRefund);
      setShowCancelDialog(false);
      setSelectedBooking(null);
      setCancelData({ reason: '', issueRefund: false });
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'partial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.confirmation_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.activity_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    revenue: bookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings Management"
        description="Manage all bookings with real-time database sync"
        sticky
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-[#6366f1]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${stats.revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by customer, confirmation code, venue, or game..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400 dark:text-[#737373]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No bookings found' : 'No bookings yet'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-[#737373] mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first booking to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Booking
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {booking.activity_name}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-[#737373]">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{booking.customer_name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.venue_name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.venue_city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.booking_date}</span>
                            <span className="text-gray-400">at</span>
                            <span>{booking.booking_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{booking.players} players</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${booking.total_amount?.toFixed(2)}
                        </div>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>

                    {booking.confirmation_code && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-[#737373]">Confirmation:</span>
                        <code className="px-2 py-1 bg-gray-100 dark:bg-[#1e1e1e] rounded font-mono">
                          {booking.confirmation_code}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailsDialog(true);
                      }}
                      className="flex-1 lg:flex-none"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelDialog(true);
                        }}
                        className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Booking Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Fill in the booking details below
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Select value={formData.venue_id} onValueChange={(value) => setFormData({ ...formData, venue_id: value, activity_id: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="game">Game *</Label>
                <Select
                  value={formData.activity_id}
                  onValueChange={(value) => {
                    const game = games.find(g => g.id === value);
                    setFormData({
                      ...formData,
                      activity_id: value,
                      total_amount: game?.price || 0,
                    });
                  }}
                  disabled={!formData.venue_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games
                      .filter(g => g.venue_id === formData.venue_id)
                      .map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name} - ${game.price}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="players">Players *</Label>
                  <Input
                    id="players"
                    type="number"
                    min="1"
                    value={formData.players}
                    onChange={(e) => setFormData({ ...formData, players: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={!formData.venue_id || !formData.activity_id || !formData.customer_id || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Confirmation Code: {selectedBooking?.confirmation_code}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Customer</p>
                  <p className="font-semibold">{selectedBooking.customer_name}</p>
                  <p className="text-gray-600">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Venue</p>
                  <p className="font-semibold">{selectedBooking.venue_name}</p>
                  <p className="text-gray-600">{selectedBooking.venue_city}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Game</p>
                  <p className="font-semibold">{selectedBooking.activity_name}</p>
                  <p className="text-gray-600">{selectedBooking.activity_difficulty}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Date & Time</p>
                  <p className="font-semibold">{selectedBooking.booking_date}</p>
                  <p className="text-gray-600">{selectedBooking.booking_time}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Players</p>
                  <p className="font-semibold">{selectedBooking.players}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Amount</p>
                  <p className="font-semibold">${selectedBooking.total_amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Status</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-[#737373]">Payment</p>
                  <Badge className={getPaymentStatusColor(selectedBooking.payment_status)}>
                    {selectedBooking.payment_status}
                  </Badge>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-gray-600 dark:text-[#737373] mb-1">Notes</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking for {selectedBooking?.customer_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                value={cancelData.reason}
                onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                placeholder="Enter reason for cancellation..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="refund"
                checked={cancelData.issueRefund}
                onChange={(e) => setCancelData({ ...cancelData, issueRefund: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="refund" className="cursor-pointer">
                Issue refund to customer
              </Label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
