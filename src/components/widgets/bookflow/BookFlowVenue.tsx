/**
 * BookFlow Widget - Venue Widget
 * @module widgets/bookflow/BookFlowVenue
 * 
 * Complete booking widget for a venue with multiple activities.
 * Handles: Activity Selection → Calendar → Time → Players → Checkout
 */

import React, { useState, useMemo } from 'react';
import { Loader2, AlertCircle, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { useBookFlowVenue, useBookFlowSlots } from './hooks';
import {
  BookFlowCalendar,
  BookFlowTimeSlots,
  BookFlowPlayerCount,
  BookFlowPricing,
} from './components';
import type { BookFlowConfig, BookFlowStyle, BookFlowActivity } from './types';
import { DEFAULT_CONFIG, DEFAULT_STYLE } from './types';
import { cn } from '../../ui/utils';

interface BookFlowVenueProps {
  venueId: string;
  config?: Partial<BookFlowConfig>;
  style?: Partial<BookFlowStyle>;
  onBookingComplete?: (booking: any) => void;
}

export const BookFlowVenue: React.FC<BookFlowVenueProps> = ({
  venueId,
  config: configOverrides,
  style: styleOverrides,
  onBookingComplete,
}) => {
  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  const style = { ...DEFAULT_STYLE, ...styleOverrides };

  // Load venue data with activities
  const { venue, loading, error } = useBookFlowVenue({ venueId });

  // Booking state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [childCount, setChildCount] = useState(0);

  // Get selected activity
  const selectedActivity = useMemo(() => {
    return venue?.activities.find(a => a.id === selectedActivityId) || null;
  }, [venue, selectedActivityId]);

  // Load time slots
  const { slots, loading: slotsLoading } = useBookFlowSlots({
    activityId: selectedActivityId,
    selectedDate,
  });

  // Reset downstream state when activity changes
  const handleActivitySelect = (activityId: string) => {
    setSelectedActivityId(activityId);
    setSelectedDate(null);
    setSelectedTime(null);
    setPlayerCount(2);
    setChildCount(0);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleCheckout = () => {
    if (!selectedActivity || !selectedDate || !selectedTime) return;

    const bookingData = {
      venueId: venue?.id,
      venueName: venue?.name,
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      playerCount,
      childCount,
      totalAmount: playerCount * selectedActivity.price + childCount * (selectedActivity.childPrice || 0),
    };

    console.log('📦 Booking data:', bookingData);
    onBookingComplete?.(bookingData);
  };

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

  if (error || !venue) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Venue
          </h3>
          <p className="text-gray-500">
            {error?.message || 'Venue not found. Please check your embed code.'}
          </p>
        </div>
      </div>
    );
  }

  const canCheckout = selectedActivity && selectedDate && selectedTime && 
    playerCount >= selectedActivity.minPlayers;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6" style={{ fontFamily: style.fontFamily }}>
      {/* Venue Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {venue.name}
        </h1>
        {venue.city && (
          <p className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-4 h-4" />
            {venue.city}{venue.state && `, ${venue.state}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Select an Experience
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {venue.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                selected={selectedActivityId === activity.id}
                onSelect={() => handleActivitySelect(activity.id)}
                primaryColor={style.primaryColor}
              />
            ))}
          </div>
        </div>

        {/* Booking Steps (Right Column) */}
        <div className="space-y-4">
          {selectedActivity && config.showCalendar && (
            <BookFlowCalendar
              selectedDate={selectedDate}
              onSelectDate={handleDateChange}
              schedule={selectedActivity.schedule}
              primaryColor={style.primaryColor}
            />
          )}

          {selectedActivity && selectedDate && config.showTimeSlots && (
            <BookFlowTimeSlots
              slots={slots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              loading={slotsLoading}
              primaryColor={style.primaryColor}
            />
          )}

          {selectedActivity && selectedTime && config.showPlayerCount && (
            <BookFlowPlayerCount
              playerCount={playerCount}
              childCount={childCount}
              onPlayerChange={setPlayerCount}
              onChildChange={setChildCount}
              minPlayers={selectedActivity.minPlayers}
              maxPlayers={selectedActivity.maxPlayers}
              price={selectedActivity.price}
              childPrice={selectedActivity.childPrice}
              currency={selectedActivity.currency}
              primaryColor={style.primaryColor}
            />
          )}

          {canCheckout && selectedActivity && (
            <BookFlowPricing
              activity={selectedActivity}
              playerCount={playerCount}
              childCount={childCount}
              onCheckout={handleCheckout}
              primaryColor={style.primaryColor}
              buttonText={config.buttonText}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Activity Card Sub-component
interface ActivityCardProps {
  activity: BookFlowActivity;
  selected: boolean;
  onSelect: () => void;
  primaryColor: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  selected,
  onSelect,
  primaryColor,
}) => {
  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(amount);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'text-left p-4 rounded-xl border-2 transition-all',
        selected ? 'border-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      )}
      style={selected ? { borderColor: primaryColor } : undefined}
    >
      {activity.coverImage && (
        <img src={activity.coverImage} alt={activity.name} className="w-full h-32 object-cover rounded-lg mb-3" />
      )}
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{activity.name}</h4>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}min</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{activity.minPlayers}-{activity.maxPlayers}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold" style={{ color: primaryColor }}>{formatPrice(activity.price)}</span>
        <ChevronRight className={cn('w-5 h-5', selected ? 'opacity-100' : 'opacity-0')} style={{ color: primaryColor }} />
      </div>
    </button>
  );
};

export default BookFlowVenue;
