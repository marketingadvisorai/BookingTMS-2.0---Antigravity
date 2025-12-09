/**
 * Embed Pro 2.0 - Container Component
 * @module embed-pro/containers/EmbedProContainer
 * 
 * Data orchestration container that fetches widget data
 * and routes to the correct widget component.
 */

import React from 'react';
import { useEmbedProData } from '../hooks/useEmbedProData';
import { 
  BookingWidgetPro, 
  CalendarWidgetPro, 
  ButtonWidgetPro, 
  InlineWidgetPro, 
  PopupWidgetPro 
} from '../widgets';
import { WidgetLoading, WidgetError } from '../widget-components';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface EmbedProContainerProps {
  /** Embed key from URL params */
  embedKey: string | null;
  /** Theme override from URL params */
  theme?: 'light' | 'dark';
  /** Preview mode flag */
  isPreview?: boolean;
  /** Callback when booking completes */
  onBookingComplete?: (bookingId: string) => void;
}

// =====================================================
// COMPONENT
// =====================================================

export const EmbedProContainer: React.FC<EmbedProContainerProps> = ({
  embedKey,
  theme,
  isPreview = false,
  onBookingComplete,
}) => {
  // Fetch widget data
  const { data, loading, error, refresh, initialized } = useEmbedProData({
    embedKey,
    isPreview,
  });

  // Loading state
  if (loading || !initialized) {
    return <WidgetLoading />;
  }

  // Error state
  if (error) {
    return (
      <WidgetError
        message={error}
        onRetry={refresh}
      />
    );
  }

  // No data state
  if (!data) {
    return (
      <WidgetError
        message="Widget configuration not found"
      />
    );
  }

  // Build effective data with theme override
  const effectiveData = {
    ...data,
    style: {
      ...data.style,
      theme: theme || data.style.theme,
    },
  };

  // Route to correct widget based on type
  switch (data.type) {
    case 'calendar-widget':
      return (
        <CalendarWidgetPro
          data={effectiveData}
          onDateSelect={(date) => {
            console.log('[CalendarWidget] Date selected:', date);
          }}
          onBookingComplete={(bookingId) => {
            console.log('[CalendarWidget] Booking complete:', bookingId);
            onBookingComplete?.(bookingId);
          }}
        />
      );

    case 'button-widget':
      return (
        <ButtonWidgetPro
          widgetData={effectiveData}
          style={effectiveData.style}
          onBookingComplete={(booking) => onBookingComplete?.(booking.id)}
        />
      );

    case 'inline-widget':
      return (
        <InlineWidgetPro
          data={effectiveData}
          onBookingComplete={(booking) => onBookingComplete?.(booking.id)}
        />
      );

    case 'popup-widget':
      return (
        <PopupWidgetPro
          data={effectiveData}
          onBookingComplete={(booking) => onBookingComplete?.(booking.id)}
        />
      );

    case 'booking-widget':
    default:
      return (
        <BookingWidgetPro
          data={effectiveData}
          onBookingComplete={onBookingComplete}
        />
      );
  }
};

export default EmbedProContainer;
