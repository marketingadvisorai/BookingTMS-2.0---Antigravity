/**
 * Venue Preview Component
 * Simple preview of how the booking widget will look
 * This is for ADMIN preview only, not the actual customer widget
 */

import React from 'react';
import { CalendarWidget } from '../widgets/CalendarWidget';

interface VenuePreviewProps {
  primaryColor: string;
  games: any[];
  venueName: string;
}

/**
 * VenuePreview
 * 
 * Shows admin a preview of how their booking widget will appear to customers.
 * This uses the CalendarWidget but is wrapped for venue admin context.
 * 
 * Purpose:
 * - Admin preview only
 * - Shows current venue configuration
 * - Uses actual booking widget for accuracy
 * 
 * Note: The actual customer-facing widget is in /embed/:key route
 */
export default function VenuePreview({ 
  primaryColor, 
  games,
  venueName 
}: VenuePreviewProps) {
  // Convert games to widget format
  const widgetConfig = {
    games: games.map((game) => {
      const settings = game.settings || {};
      return {
        id: game.id,
        name: game.name,
        description: game.description,
        tagline: settings.tagline,
        duration: game.duration,
        price: parseFloat(game.price),
        childPrice: parseFloat(game.child_price),
        difficulty: game.difficulty,
        minPlayers: game.min_players,
        maxPlayers: game.max_players,
        minAge: game.min_age,
        image: game.image_url,
        imageUrl: game.image_url,
        coverImage: game.image_url,
        rating: 0,
        reviews: 0,
        language: settings.language || ['English'],
        successRate: game.success_rate,
        activityDetails: settings.activityDetails,
        additionalInformation: settings.additionalInformation,
        faqs: settings.faqs || [],
        cancellationPolicies: settings.cancellationPolicies || [],
        accessibility: settings.accessibility,
        location: settings.location,
        galleryImages: settings.galleryImages || [],
        videos: settings.videos || [],
        operatingDays: settings.operatingDays || [],
        startTime: settings.startTime || '10:00',
        endTime: settings.endTime || '22:00',
        slotInterval: settings.slotInterval || 60,
        advanceBooking: settings.advanceBooking || 30,
        customDates: settings.customDates || [],
        blockedDates: settings.blockedDates || [],
        stripe_price_id: game.stripe_price_id,
        stripe_product_id: game.stripe_product_id,
        stripe_sync_status: game.stripe_sync_status,
      };
    }),
    venueName,
    showPromoCodeInput: false,
    showGiftCardInput: false,
  };

  return (
    <div className="venue-preview">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Admin Preview:</strong> This is how your booking widget will appear to customers.
        </p>
      </div>
      <CalendarWidget 
        primaryColor={primaryColor} 
        config={widgetConfig}
      />
    </div>
  );
}
