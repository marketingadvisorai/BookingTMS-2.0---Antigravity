/**
 * Embed Pro 2.0 - Container Component
 * @module embed-pro/containers/EmbedProContainer
 * 
 * Data orchestration container that fetches widget data
 * and routes to the correct widget component.
 */

import React from 'react';
import { useEmbedProData } from '../hooks/useEmbedProData';
import { BookingWidgetPro } from '../widgets';
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
  // For now, all types use BookingWidgetPro
  // Future: Add CalendarWidgetPro, ButtonWidgetPro, etc.
  switch (data.type) {
    case 'booking-widget':
    case 'inline-widget':
    case 'popup-widget':
    case 'calendar-widget':
    case 'button-widget':
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
