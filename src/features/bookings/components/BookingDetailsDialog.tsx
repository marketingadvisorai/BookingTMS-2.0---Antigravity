/**
 * BookingDetailsDialog Component
 * 
 * Full-screen dialog for viewing and managing booking details.
 * Includes customer info, booking info, status management, and actions.
 * @module features/bookings/components/BookingDetailsDialog
 */
import { useState } from 'react';
import { Users, Mail, Phone, CalendarDays, Clock, RefreshCcw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { PermissionGuard } from '../../../components/auth/PermissionGuard';
import type { Booking, BookingStatus } from '../types';

export interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onRefund: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  staffList: Array<{ id: string; name: string }>;
  onAssignStaff?: (staffId: string) => void;
  onUpdateStatus?: (status: BookingStatus) => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onSendConfirmation?: () => void;
  onSave?: () => Promise<void>;
}

/** Format date string for display */
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Get status badge classes */
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
    case 'pending':
      return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30';
    case 'in-progress':
      return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
    case 'completed':
      return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30';
    default:
      return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
  }
};

/**
 * Full-screen dialog for viewing and managing a booking.
 * Supports status updates, staff assignment, check-in/out, and refunds.
 */
export function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
  onRefund,
  onReschedule,
  staffList,
  onAssignStaff,
  onUpdateStatus,
  onCheckIn,
  onCheckOut,
  onSendConfirmation,
  onSave
}: BookingDetailsDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!booking) return null;

  const handleSave = async () => {
    if (!onSave) return;
    try {
      setIsSaving(true);
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
        <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Complete information for booking {booking.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto overflow-x-hidden px-4 sm:px-6 flex-1 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`text-sm px-3 py-1 border ${getStatusClasses(booking.status)}`}>
              {booking.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-[#737373]">ID: {booking.id}</span>
          </div>

          {/* Assignment & Status Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
            <div>
              <Label className="text-sm">Assigned Staff</Label>
              <Select
                value={booking.assignedStaffId || ''}
                onValueChange={(val) => onAssignStaff?.(val)}
              >
                <SelectTrigger className="mt-1 h-11 w-full">
                  <SelectValue placeholder="Assign staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.length > 0 ? (
                    staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-staff" disabled>No staff available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select
                value={booking.status}
                onValueChange={(val) => onUpdateStatus?.(val as BookingStatus)}
              >
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
                  {booking.checkInTime && <span>Checked in: {new Date(booking.checkInTime).toLocaleString()}</span>}
                  {booking.checkOutTime && <span className="ml-4">Checked out: {new Date(booking.checkOutTime).toLocaleString()}</span>}
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

        <DialogFooter className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 border-t border-gray-200 dark:border-[#2a2a2a] shrink-0">
          <Button onClick={handleSave} className="w-full sm:w-auto h-11" disabled={isSaving}>
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">Close</Button>
          <Button variant="outline" className="w-full sm:w-auto h-11" onClick={onSendConfirmation}>
            <Mail className="w-4 h-4 mr-2" />Send Confirmation
          </Button>
          <Button variant="outline" className="w-full sm:w-auto h-11" onClick={() => onReschedule(booking)}>
            <CalendarDays className="w-4 h-4 mr-2" />Reschedule
          </Button>
          {!booking.checkInTime && booking.status !== 'cancelled' && (
            <Button onClick={onCheckIn} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-11">
              <Clock className="w-4 h-4 mr-2" />Check In
            </Button>
          )}
          {booking.checkInTime && !booking.checkOutTime && (
            <Button onClick={onCheckOut} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-11">
              <Clock className="w-4 h-4 mr-2" />Check Out
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <PermissionGuard permissions={['payments.refund']}>
              <Button
                variant="outline"
                className="text-orange-600 dark:text-orange-500 hover:text-orange-700 w-full sm:w-auto h-11"
                onClick={() => { onOpenChange(false); onRefund(booking); }}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />Process Refund
              </Button>
            </PermissionGuard>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
