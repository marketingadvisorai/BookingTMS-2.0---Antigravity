/**
 * Venue Booking Widget
 * 
 * Multi-activity booking widget for venue embeds.
 * Shows all activities at a venue with selector.
 * 
 * @usage
 * Embed URL: /embed?widget=calendar&key={venue_embed_key}
 * 
 * Features:
 * - Activity selector (thumbnail grid or dropdown)
 * - Unified calendar for selected activity
 * - Stripe checkout with activity's price
 * - Real-time availability updates
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Clock, Users, DollarSign, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BookingWizard } from './booking/BookingWizard';
import { useWidgetRealtime } from '../../lib/widget/useWidgetRealtime';

interface Activity {
  id: string;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  duration: number;
  price: number;
  childPrice?: number;
  minPlayers: number;
  maxPlayers: number;
  coverImage?: string;
  category?: string;
  customCapacityFields?: Array<{
    id: string;
    name: string;
    min: number;
    max: number;
    price: number;
  }>;
  stripe?: {
    priceId?: string;
    productId?: string;
  };
}

interface VenueBookingWidgetProps {
  venueId: string;
  venueName: string;
  venueAddress?: string;
  timezone?: string;
  activities: Activity[];
  primaryColor?: string;
  stripePublishableKey?: string;
  onActivitySelect?: (activity: Activity) => void;
}

export function VenueBookingWidget({
  venueId,
  venueName,
  venueAddress,
  timezone = 'UTC',
  activities,
  primaryColor = '#2563eb',
  stripePublishableKey,
  onActivitySelect,
}: VenueBookingWidgetProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    activities.length === 1 ? activities[0] : null
  );
  const [showBooking, setShowBooking] = useState(activities.length === 1);

  // Real-time updates
  const { isConnected } = useWidgetRealtime({
    venueId,
    activityId: selectedActivity?.id,
    onUpdate: () => {
      // Widget will auto-refresh via parent
      console.log('🔄 Venue widget received real-time update');
    },
  });

  const handleSelectActivity = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setShowBooking(true);
    onActivitySelect?.(activity);
  }, [onActivitySelect]);

  const handleBackToActivities = useCallback(() => {
    setShowBooking(false);
    setSelectedActivity(null);
  }, []);

  // Build config for BookingWizard
  const buildBookingConfig = useCallback((activity: Activity) => ({
    venueId,
    venueName,
    timezone,
    activities: [activity],
    games: [activity], // Backward compatibility
    primaryColor,
    stripePublishableKey,
  }), [venueId, venueName, timezone, primaryColor, stripePublishableKey]);

  // Show booking wizard if activity selected
  if (showBooking && selectedActivity) {
    return (
      <div className="w-full min-h-screen">
        {activities.length > 1 && (
          <div className="bg-white border-b p-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToActivities}
              className="text-gray-600"
            >
              ← All Activities
            </Button>
            <span className="text-sm font-medium">{selectedActivity.name}</span>
          </div>
        )}
        <BookingWizard
          config={buildBookingConfig(selectedActivity)}
          primaryColor={primaryColor}
        />
      </div>
    );
  }

  // Activity selection view
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {venueName}
        </h1>
        {venueAddress && (
          <p className="text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {venueAddress}
          </p>
        )}
        <p className="text-gray-500 mt-2">
          Select an experience to book
        </p>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            primaryColor={primaryColor}
            onSelect={() => handleSelectActivity(activity)}
          />
        ))}
      </div>

      {/* Connection indicator */}
      {isConnected && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live updates
        </div>
      )}
    </div>
  );
}

// Separate ActivityCard component for cleaner code
interface ActivityCardProps {
  activity: Activity;
  primaryColor: string;
  onSelect: () => void;
}

function ActivityCard({ activity, primaryColor, onSelect }: ActivityCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={activity.coverImage || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600'}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {activity.category && (
          <Badge
            className="absolute top-2 left-2 text-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {activity.category}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">
          {activity.name}
        </h3>
        {activity.tagline && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {activity.tagline}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {activity.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {activity.minPlayers}-{activity.maxPlayers}
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-bold" style={{ color: primaryColor }}>
              ${activity.price}
            </span>
            <span className="text-sm text-gray-500">/person</span>
          </div>
          <Button
            size="sm"
            style={{ backgroundColor: primaryColor }}
            className="text-white"
          >
            Book
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default VenueBookingWidget;
