/**
 * Embed Pro 2.0 - Widget Success Component
 * @module embed-pro/widget-components/WidgetSuccess
 * 
 * Booking confirmation success screen with animations.
 * Cross-browser compatible date formatting.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, Users, MapPin, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import type { WidgetActivity, WidgetVenue, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetSuccessProps {
  activity: WidgetActivity;
  venue?: WidgetVenue | null;
  selectedDate: Date;
  selectedTime: string;
  partySize: number;
  childCount?: number;
  totalAmount?: number;
  bookingId?: string;
  bookingNumber?: string;
  customerEmail?: string;
  style: WidgetStyle;
  successMessage?: string;
  onNewBooking?: () => void;
  isDarkMode?: boolean;
}

// =====================================================
// HELPERS (Cross-browser safe)
// =====================================================

const formatDateSafe = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatTimeSafe = (time: string): string => {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const mins = parts[1] || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins} ${ampm}`;
};

const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// =====================================================
// COMPONENT
// =====================================================

export const WidgetSuccess: React.FC<WidgetSuccessProps> = ({
  activity,
  venue,
  selectedDate,
  selectedTime,
  partySize,
  childCount = 0,
  totalAmount,
  bookingId,
  bookingNumber,
  customerEmail,
  style,
  successMessage = 'Your booking is confirmed!',
  onNewBooking,
  isDarkMode: isDarkModeProp,
}) => {
  const isDarkMode = isDarkModeProp ?? style.theme === 'dark';
  const [showAnimation, setShowAnimation] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Copy booking reference to clipboard
  const copyBookingRef = async () => {
    const ref = bookingNumber || bookingId;
    if (ref) {
      try {
        await navigator.clipboard.writeText(ref);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = ref;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const displayRef = bookingNumber || bookingId;
  const totalGuests = partySize + childCount;

  return (
    <div 
      className={`p-6 text-center transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Success Icon with Pulse Animation */}
      <div
        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse"
        style={{ backgroundColor: `${style.primaryColor}15` }}
        aria-hidden="true"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${style.primaryColor}25` }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: style.primaryColor }} />
        </div>
      </div>

      {/* Success Message */}
      <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} id="success-heading">{successMessage}</h2>
      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Thank you for your booking</p>

      {/* Booking Reference */}
      {displayRef && (
        <div className={`rounded-lg px-4 py-2 inline-flex items-center gap-2 mb-6 ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} id="ref-label">Reference:</span>
          <span className={`font-mono font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} aria-labelledby="ref-label">{displayRef}</span>
          <button 
            onClick={copyBookingRef}
            className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? 'hover:bg-white/15' : 'hover:bg-gray-200'}`}
            style={{ ['--tw-ring-color' as any]: style.primaryColor }}
            aria-label={copied ? 'Reference copied to clipboard' : 'Copy booking reference to clipboard'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
            ) : (
              <Copy className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {/* Booking Details Card */}
      <div 
        className="rounded-xl p-4 text-left mb-5 border"
        style={{ backgroundColor: `${style.primaryColor}05`, borderColor: `${style.primaryColor}20` }}
        role="region"
        aria-label="Booking details"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{activity.name}</h3>
          {totalAmount !== undefined && (
            <span 
              className="font-bold text-lg"
              style={{ color: style.primaryColor }}
              aria-label={`Total: ${formatCurrency(totalAmount, activity.currency)}`}
            >
              {formatCurrency(totalAmount, activity.currency)}
            </span>
          )}
        </div>
        
        <dl className={`grid gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {/* Date */}
          <div className="flex items-center gap-2">
            <dt className="sr-only">Date</dt>
            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: style.primaryColor }} aria-hidden="true" />
            <dd>{formatDateSafe(selectedDate)}</dd>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <dt className="sr-only">Time</dt>
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: style.primaryColor }} aria-hidden="true" />
            <dd>{formatTimeSafe(selectedTime)} • {activity.duration} min</dd>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-2">
            <dt className="sr-only">Guests</dt>
            <Users className="w-4 h-4 flex-shrink-0" style={{ color: style.primaryColor }} aria-hidden="true" />
            <dd>
              {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
              {childCount > 0 && ` (${partySize} adult${partySize !== 1 ? 's' : ''}, ${childCount} child${childCount !== 1 ? 'ren' : ''})`}
            </dd>
          </div>

          {/* Venue */}
          {venue && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: style.primaryColor }} aria-hidden="true" />
              <dd>{venue.name}{venue.city && `, ${venue.city}`}{venue.state && `, ${venue.state}`}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Email Confirmation Note */}
      <div className={`flex items-center justify-center gap-2 text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <Mail className="w-4 h-4" aria-hidden="true" />
        <span>
          Confirmation sent to{' '}
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{customerEmail || 'your email'}</span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3" role="group" aria-label="Booking actions">
        {onNewBooking && (
          <button
            onClick={onNewBooking}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: style.primaryColor, ['--tw-ring-color' as any]: style.primaryColor }}
            aria-label="Make another booking"
          >
            Make Another Booking
          </button>
        )}
        
        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className={`w-full min-h-[44px] py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isDarkMode 
              ? 'text-gray-300 bg-white/10 hover:bg-white/15 focus:ring-gray-600' 
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200 focus:ring-gray-400'}`}
          aria-label="Print booking confirmation"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          Print Confirmation
        </button>
      </div>
    </div>
  );
};

export default WidgetSuccess;
