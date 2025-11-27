/**
 * BookingCard Component
 * Displays a single booking in card format
 */

import React from 'react';
import { Calendar, Clock, Users, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CustomerBooking, BookingStatus } from '../types';

interface BookingCardProps {
  booking: CustomerBooking;
  onClick: () => void;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  confirmed: { label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  checked_in: { label: 'Checked In', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  completed: { label: 'Completed', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-700' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  no_show: { label: 'No Show', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const status = statusConfig[booking.status];
  const isPast = new Date(booking.bookingDate) < new Date();
  const isUpcoming = !isPast && booking.status !== 'cancelled';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isUpcoming
          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-75'
      }`}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-shrink-0">
          {booking.activityImage ? (
            <img
              src={booking.activityImage}
              alt={booking.activityName}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {booking.activityName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {booking.venueName}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formatDate(booking.bookingDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              {formatTime(booking.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" />
              {booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="text-sm">
              <span className="text-slate-500 dark:text-slate-400">Ref: </span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {booking.bookingReference}
              </span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span className="text-sm font-medium">Details</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
