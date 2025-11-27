/**
 * BookFlow Widget - Single Activity Widget
 * @module widgets/bookflow/BookFlowSingle
 * 
 * Complete booking widget for a single activity.
 * Handles: Calendar → Time → Players → Checkout
 */

import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useBookFlowActivity, useBookFlowSlots } from './hooks';
import {
  BookFlowHeader,
  BookFlowCalendar,
  BookFlowTimeSlots,
  BookFlowPlayerCount,
  BookFlowPricing,
} from './components';
import type { BookFlowConfig, BookFlowStyle } from './types';
import { DEFAULT_CONFIG, DEFAULT_STYLE } from './types';

interface BookFlowSingleProps {
  activityId: string;
  config?: Partial<BookFlowConfig>;
  style?: Partial<BookFlowStyle>;
  onBookingComplete?: (booking: any) => void;
}

export const BookFlowSingle: React.FC<BookFlowSingleProps> = ({
  activityId,
  config: configOverrides,
  style: styleOverrides,
  onBookingComplete,
}) => {
  // Merge config and style with defaults
  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  const style = { ...DEFAULT_STYLE, ...styleOverrides };

  // Load activity data
  const { activity, loading, error } = useBookFlowActivity({ activityId });

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [childCount, setChildCount] = useState(0);

  // Load time slots when date is selected
  const { slots, loading: slotsLoading } = useBookFlowSlots({
    activityId,
    selectedDate,
  });

  // Reset time when date changes
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!activity || !selectedDate || !selectedTime) return;

    // For now, log the booking data
    // TODO: Integrate with Stripe checkout
    const bookingData = {
      activityId: activity.id,
      activityName: activity.name,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      playerCount,
      childCount,
      totalAmount: playerCount * activity.price + childCount * (activity.childPrice || 0),
    };

    console.log('📦 Booking data:', bookingData);
    onBookingComplete?.(bookingData);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: style.primaryColor }} />
          <p className="text-gray-500">Loading booking widget...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !activity) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Activity
          </h3>
          <p className="text-gray-500">
            {error?.message || 'Activity not found. Please check your embed code.'}
          </p>
        </div>
      </div>
    );
  }

  const canCheckout = selectedDate && selectedTime && playerCount >= activity.minPlayers;

  return (
    <div 
      className="max-w-2xl mx-auto p-4 sm:p-6"
      style={{ fontFamily: style.fontFamily }}
    >
      {/* Header with activity info */}
      <BookFlowHeader 
        activity={activity} 
        primaryColor={style.primaryColor} 
      />

      <div className="space-y-6">
        {/* Step 1: Calendar */}
        {config.showCalendar && (
          <BookFlowCalendar
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
            schedule={activity.schedule}
            primaryColor={style.primaryColor}
          />
        )}

        {/* Step 2: Time Slots */}
        {config.showTimeSlots && selectedDate && (
          <BookFlowTimeSlots
            slots={slots}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            loading={slotsLoading}
            primaryColor={style.primaryColor}
          />
        )}

        {/* Step 3: Player Count */}
        {config.showPlayerCount && selectedTime && (
          <BookFlowPlayerCount
            playerCount={playerCount}
            childCount={childCount}
            onPlayerChange={setPlayerCount}
            onChildChange={setChildCount}
            minPlayers={activity.minPlayers}
            maxPlayers={activity.maxPlayers}
            price={activity.price}
            childPrice={activity.childPrice}
            currency={activity.currency}
            primaryColor={style.primaryColor}
          />
        )}

        {/* Pricing & Checkout */}
        {canCheckout && (
          <BookFlowPricing
            activity={activity}
            playerCount={playerCount}
            childCount={childCount}
            onCheckout={handleCheckout}
            primaryColor={style.primaryColor}
            buttonText={config.buttonText}
          />
        )}
      </div>
    </div>
  );
};

export default BookFlowSingle;
