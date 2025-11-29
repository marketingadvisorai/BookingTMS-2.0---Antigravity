/**
 * BookingTableView Component
 * 
 * Displays bookings in a table format with mobile card view.
 * Shows booking ID, customer, game, date, amount, status, and actions.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Search,
  MoreVertical,
  Eye,
  RefreshCcw,
  Mail,
  DollarSign,
  Clock,
  AlertCircle,
  Users,
} from 'lucide-react';
import type { Booking, GameOption } from '../types';
import { formatCurrency } from '../utils';

export interface BookingTableViewProps {
  bookings: Booking[];
  staffList: { id: string; name: string }[];
  onViewDetails: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onRefund: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onSendConfirmation: (booking: Booking) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onAssignStaff: (booking: Booking) => void;
  formatDate: (dateStr: string) => string;
}

/**
 * Get status badge styling based on booking status
 */
const getStatusBadgeClass = (status: string): string => {
  const baseClass = 'border';
  switch (status) {
    case 'confirmed':
      return `${baseClass} bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30`;
    case 'pending':
      return `${baseClass} bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30`;
    case 'cancelled':
      return `${baseClass} bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30`;
    case 'no-show':
      return `${baseClass} bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30`;
    case 'completed':
      return `${baseClass} bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30`;
    default:
      return baseClass;
  }
};

/**
 * Mobile card view for individual booking
 */
const MobileBookingCard: React.FC<{
  booking: Booking;
  staffList: { id: string; name: string }[];
  props: BookingTableViewProps;
}> = ({ booking, staffList, props }) => (
  <Card className="border border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white truncate">{booking.customer}</p>
            <p className="text-xs text-gray-500 dark:text-[#737373]">{booking.id}</p>
            {booking.assignedStaffId && (
              <p className="text-xs text-gray-600 dark:text-[#737373] mt-1">
                Assigned: {staffList.find(s => s.id === booking.assignedStaffId)?.name || booking.assignedStaffId}
              </p>
            )}
          </div>
          <Badge variant="secondary" className={`flex-shrink-0 text-xs ${getStatusBadgeClass(booking.status)}`}>
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
            <p className="text-gray-900 dark:text-white text-xs sm:text-sm">{props.formatDate(booking.date)}</p>
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
          <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => props.onViewDetails(booking)}>
            <Eye className="w-4 h-4 mr-1.5" />
            <span className="text-xs sm:text-sm">View</span>
          </Button>
          <BookingActionsMenu booking={booking} props={props} />
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Dropdown menu for booking actions
 */
const BookingActionsMenu: React.FC<{
  booking: Booking;
  props: BookingTableViewProps;
  isDesktop?: boolean;
}> = ({ booking, props, isDesktop = false }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      {isDesktop ? (
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="h-9 w-9 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      )}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {isDesktop && (
        <DropdownMenuItem onClick={() => props.onViewDetails(booking)}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => props.onSendConfirmation(booking)}>
        <Mail className="w-4 h-4 mr-2" />
        Send Confirmation
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => props.onReschedule(booking)}>
        <RefreshCcw className="w-4 h-4 mr-2" />
        Reschedule
      </DropdownMenuItem>
      {booking.status === 'confirmed' && (
        <DropdownMenuItem onClick={() => props.onRefund(booking)}>
          <DollarSign className="w-4 h-4 mr-2" />
          Process Refund
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => props.onCheckIn(booking.id)}>
        <Clock className="w-4 h-4 mr-2" />
        Check In
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => props.onCheckOut(booking.id)}>
        <Clock className="w-4 h-4 mr-2" />
        Check Out
      </DropdownMenuItem>
      <DropdownMenuItem className="text-[#4f46e5]" onClick={() => props.onAssignStaff(booking)}>
        <Users className="w-4 h-4 mr-2" />
        Assign Staff
      </DropdownMenuItem>
      {booking.status !== 'cancelled' && (
        <>
          <Separator />
          <DropdownMenuItem className="text-red-600 dark:text-red-500" onClick={() => props.onCancel(booking)}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Cancel Booking
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

/**
 * Empty state component
 */
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-[#404040] mb-3" />
    <p className="text-gray-500 dark:text-[#737373]">No bookings found</p>
    <p className="text-sm text-gray-400 dark:text-[#525252] mt-1">Try adjusting your filters</p>
  </div>
);

export function BookingTableView(props: BookingTableViewProps) {
  const { bookings, staffList, formatDate } = props;

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>All Bookings</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3 p-4">
          {bookings.length === 0 ? (
            <EmptyState />
          ) : (
            bookings.map((booking) => (
              <MobileBookingCard key={booking.id} booking={booking} staffList={staffList} props={props} />
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          {bookings.length === 0 ? (
            <EmptyState />
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
                {bookings.map((booking) => (
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
                    <TableCell className="text-gray-900 dark:text-white">
                      {booking.assignedStaffId 
                        ? (staffList.find(s => s.id === booking.assignedStaffId)?.name || booking.assignedStaffId) 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">${booking.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadgeClass(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <BookingActionsMenu booking={booking} props={props} isDesktop />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
