/**
 * Embed Pro 2.0 - Widget Header Component
 * @module embed-pro/widget-components/WidgetHeader
 * 
 * Compact header with thumbnail, activity name, and quick info.
 * Optimized for fast loading and minimal visual footprint.
 */

import React, { useState } from 'react';
import { Clock, Users, MapPin, DollarSign } from 'lucide-react';
import type { WidgetActivity, WidgetVenue, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetHeaderProps {
  activity: WidgetActivity;
  venue?: WidgetVenue | null;
  style: WidgetStyle;
  compact?: boolean;
  isDarkMode?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  activity,
  venue,
  style,
  compact = false,
  isDarkMode: isDarkModeProp,
}) => {
  // Detect dark mode from style or prop
  const isDarkMode = isDarkModeProp ?? style.theme === 'dark';
  const [imgLoaded, setImgLoaded] = useState(false);
  const { name, coverImage, duration, minPlayers, maxPlayers, price, currency } = activity;

  // Format price display
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 border-b ${
        isDarkMode ? 'border-white/10' : 'border-gray-100'
      }`}
      style={{ 
        background: isDarkMode 
          ? `linear-gradient(135deg, ${style.primaryColor}15 0%, transparent 50%)`
          : `linear-gradient(135deg, ${style.primaryColor}08 0%, transparent 50%)` 
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImgLoaded(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
          </>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: style.primaryColor }}
          >
            {name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Activity Name */}
        <h1 className={`font-semibold truncate text-base leading-tight ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {name}
        </h1>

        {/* Venue (if available) */}
        {venue && (
          <div className={`flex items-center gap-1 text-xs mt-0.5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <MapPin className="w-3 h-3" />
            <span className="truncate">{venue.name}</span>
          </div>
        )}

        {/* Quick Stats */}
        <div className={`flex items-center gap-3 mt-1.5 text-xs ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" style={{ color: style.primaryColor }} />
            {duration}min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" style={{ color: style.primaryColor }} />
            {minPlayers}-{maxPlayers}
          </span>
        </div>
      </div>

      {/* Price Badge */}
      <div 
        className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm"
        style={{ backgroundColor: style.primaryColor }}
      >
        {formatPrice(price)}
      </div>
    </div>
  );
};

export default WidgetHeader;
