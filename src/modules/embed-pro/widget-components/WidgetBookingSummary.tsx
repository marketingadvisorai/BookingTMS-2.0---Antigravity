/**
 * Embed Pro 2.0 - Widget Booking Summary Component
 * @module embed-pro/widget-components/WidgetBookingSummary
 * 
 * Sticky sidebar summary for desktop showing booking progress.
 * Displays selected date, time, guests, and pricing.
 */

import React from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle2 } from 'lucide-react';
import type { WidgetActivity, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS
// =====================================================

interface WidgetBookingSummaryProps {
  activity: WidgetActivity;
  venueName?: string;
  venueCity?: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  partySize: number;
  childCount: number;
  style: WidgetStyle;
  currentStep: string;
}

// =====================================================
// HELPERS
// =====================================================

const formatDate = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

const formatTime = (time: string): string => {
  const [hours, mins] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// =====================================================
// COMPONENT
// =====================================================

export const WidgetBookingSummary: React.FC<WidgetBookingSummaryProps> = ({
  activity,
  venueName,
  venueCity,
  selectedDate,
  selectedTime,
  partySize,
  childCount,
  style,
  currentStep,
}) => {
  const totalGuests = partySize + childCount;
  const hasChildPricing = activity.childPrice !== null && activity.childPrice !== undefined;
  
  // Calculate total price
  const totalPrice = hasChildPricing
    ? (partySize * activity.price) + (childCount * (activity.childPrice || 0))
    : partySize * activity.price;

  // Summary items with completion status
  const summaryItems = [
    {
      icon: Calendar,
      label: 'Date',
      value: selectedDate ? formatDate(selectedDate) : 'Select a date',
      completed: !!selectedDate,
    },
    {
      icon: Clock,
      label: 'Time',
      value: selectedTime ? formatTime(selectedTime) : 'Select a time',
      completed: !!selectedTime,
    },
    {
      icon: Users,
      label: 'Guests',
      value: totalGuests > 0 
        ? `${totalGuests} ${totalGuests === 1 ? 'guest' : 'guests'}${hasChildPricing && childCount > 0 ? ` (${partySize} adults, ${childCount} children)` : ''}`
        : 'Select guests',
      completed: totalGuests > 0,
    },
  ];

  return (
    <div 
      className="rounded-2xl overflow-hidden border shadow-lg"
      style={{ 
        backgroundColor: style.theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: style.theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      {/* Header with Activity Image */}
      <div className="relative h-40 overflow-hidden">
        {activity.coverImage ? (
          <img 
            src={activity.coverImage} 
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ 
              background: `linear-gradient(135deg, ${style.primaryColor}40 0%, ${style.primaryColor}20 100%)` 
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg">{activity.name}</h3>
          {venueName && (
            <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {venueName}{venueCity ? `, ${venueCity}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Summary Items */}
      <div className="p-4 space-y-3">
        <h4 
          className="font-semibold text-sm uppercase tracking-wider"
          style={{ color: style.theme === 'dark' ? '#9ca3af' : '#6b7280' }}
        >
          Booking Summary
        </h4>
        
        {summaryItems.map((item, idx) => (
          <div 
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
              item.completed 
                ? 'bg-green-50 dark:bg-green-900/20' 
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <div 
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <item.icon className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <p 
                className={`font-medium text-sm truncate ${
                  item.completed 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: style.theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        {/* Price breakdown */}
        {totalGuests > 0 && (
          <div className="space-y-2 mb-3">
            {hasChildPricing ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {partySize} adult{partySize !== 1 ? 's' : ''} × {formatPrice(activity.price, activity.currency)}
                  </span>
                  <span className="font-medium">{formatPrice(partySize * activity.price, activity.currency)}</span>
                </div>
                {childCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {childCount} child{childCount !== 1 ? 'ren' : ''} × {formatPrice(activity.childPrice || 0, activity.currency)}
                    </span>
                    <span className="font-medium">{formatPrice(childCount * (activity.childPrice || 0), activity.currency)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {partySize} guest{partySize !== 1 ? 's' : ''} × {formatPrice(activity.price, activity.currency)}
                </span>
                <span className="font-medium">{formatPrice(partySize * activity.price, activity.currency)}</span>
              </div>
            )}
          </div>
        )}

        {/* Total */}
        <div 
          className="flex justify-between items-center pt-3 border-t"
          style={{ borderColor: style.theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
          <span 
            className="text-2xl font-bold"
            style={{ color: style.primaryColor }}
          >
            {formatPrice(totalPrice, activity.currency)}
          </span>
        </div>

        {/* Duration info */}
        <p className="text-xs text-gray-400 mt-2 text-center">
          {activity.duration} minute experience
        </p>
      </div>
    </div>
  );
};

export default WidgetBookingSummary;
