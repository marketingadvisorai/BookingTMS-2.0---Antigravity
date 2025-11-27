/**
 * Embed Pro 2.0 - Widget Success Component
 * @module embed-pro/widget-components/WidgetSuccess
 * 
 * Booking confirmation success screen.
 */

import React from 'react';
import { CheckCircle, Calendar, Clock, Users, MapPin } from 'lucide-react';
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
  bookingId?: string;
  style: WidgetStyle;
  successMessage?: string;
  onNewBooking?: () => void;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetSuccess: React.FC<WidgetSuccessProps> = ({
  activity,
  venue,
  selectedDate,
  selectedTime,
  partySize,
  bookingId,
  style,
  successMessage = 'Your booking is confirmed!',
  onNewBooking,
}) => {
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time (12-hour)
  const formatTime = (time: string) => {
    const [hours, mins] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="p-6 text-center">
      {/* Success Icon */}
      <div
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: `${style.primaryColor}20` }}
      >
        <CheckCircle className="w-10 h-10" style={{ color: style.primaryColor }} />
      </div>

      {/* Success Message */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">{successMessage}</h2>
      
      {bookingId && (
        <p className="text-sm text-gray-500 mb-6">
          Booking Reference: <span className="font-mono font-medium">{bookingId}</span>
        </p>
      )}

      {/* Booking Details Card */}
      <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">{activity.name}</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: style.primaryColor }} />
            <span>{formatDate(selectedDate)}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: style.primaryColor }} />
            <span>{formatTime(selectedTime)} ({activity.duration} min)</span>
          </div>

          {/* Party Size */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: style.primaryColor }} />
            <span>{partySize} {partySize === 1 ? 'guest' : 'guests'}</span>
          </div>

          {/* Venue */}
          {venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: style.primaryColor }} />
              <span>{venue.name}{venue.city && `, ${venue.city}`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Note */}
      <p className="text-sm text-gray-500 mb-6">
        A confirmation email has been sent with your booking details.
      </p>

      {/* New Booking Button */}
      {onNewBooking && (
        <button
          onClick={onNewBooking}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors"
          style={{ backgroundColor: style.primaryColor }}
        >
          Make Another Booking
        </button>
      )}
    </div>
  );
};

export default WidgetSuccess;
