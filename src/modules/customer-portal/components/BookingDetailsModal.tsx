/**
 * BookingDetailsModal Component
 * Modal for viewing booking details and performing actions
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, CreditCard, AlertCircle, Loader2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomerBooking, CancelBookingResponse } from '../types';

interface BookingDetailsModalProps {
  booking: CustomerBooking;
  onClose: () => void;
  onCancel: (bookingId: string, reason?: string) => Promise<CancelBookingResponse>;
  onReschedule?: (bookingId: string) => void;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

export function BookingDetailsModal({ booking, onClose, onCancel, onReschedule }: BookingDetailsModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<CancelBookingResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    const result = await onCancel(booking.id, cancelReason);
    setCancelResult(result);
    setIsCancelling(false);
  };

  const copyReference = () => {
    navigator.clipboard.writeText(booking.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
            {booking.activityImage && (
              <img
                src={booking.activityImage}
                alt={booking.activityName}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
              />
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white">{booking.activityName}</h2>
              <p className="text-white/80 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {booking.venueName}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Booking Reference */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Booking Reference</p>
                <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                  {booking.bookingReference}
                </p>
              </div>
              <button
                onClick={copyReference}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(booking.bookingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Guests</p>
                  <p className="font-medium text-slate-900 dark:text-white">{booking.partySize} people</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                  <p className="font-medium text-slate-900 dark:text-white">${booking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Cancel Confirmation */}
            {showCancelConfirm && !cancelResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-700 dark:text-red-400">Cancel this booking?</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {booking.paymentStatus === 'paid'
                        ? 'A refund will be processed within 5-10 business days.'
                        : 'This action cannot be undone.'}
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation (optional)"
                      className="mt-3 w-full p-2 rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-800 text-sm resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Keep Booking
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Confirm Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cancel Result */}
            {cancelResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-lg border ${
                  cancelResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <p className={cancelResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                  {cancelResult.message}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!showCancelConfirm && !cancelResult && (
              <div className="flex gap-3">
                {booking.canReschedule && onReschedule && (
                  <button
                    onClick={() => onReschedule(booking.id)}
                    className="flex-1 py-3 px-4 rounded-xl border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Reschedule
                  </button>
                )}
                {booking.canCancel && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 py-3 px-4 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
