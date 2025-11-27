/**
 * Embed Pro 2.0 - Widget Activity Selector Component
 * @module embed-pro/widget-components/WidgetActivitySelector
 * 
 * Displays all activities for a venue with Apple Liquid Glass design.
 * Used when embedding a venue to let users select which game to book.
 */

import React, { useState } from 'react';
import { Clock, Users, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import type { WidgetActivity, WidgetVenue, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetActivitySelectorProps {
  activities: WidgetActivity[];
  venue: WidgetVenue | null;
  style: WidgetStyle;
  onSelect: (activity: WidgetActivity) => void;
}

// =====================================================
// ACTIVITY CARD COMPONENT
// =====================================================

interface ActivityCardProps {
  activity: WidgetActivity;
  style: WidgetStyle;
  onSelect: () => void;
  index: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, style, onSelect, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: activity.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full text-left group"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div 
        className={`
          relative overflow-hidden rounded-2xl
          bg-white/60 backdrop-blur-md border border-white/70
          shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_2px_12px_rgba(255,255,255,0.4)]
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : ''}
        `}
      >
        {/* Image Section */}
        <div className="relative h-32 overflow-hidden">
          {activity.coverImage ? (
            <>
              <img
                src={activity.coverImage}
                alt={activity.name}
                onLoad={() => setImageLoaded(true)}
                className={`
                  w-full h-full object-cover transition-all duration-500
                  ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
                  ${isHovered ? 'scale-110' : 'scale-100'}
                `}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${style.primaryColor}30 0%, ${style.primaryColor}10 100%)` }}
            >
              <Sparkles className="w-10 h-10" style={{ color: style.primaryColor }} />
            </div>
          )}
          
          {/* Price Badge - Liquid Glass */}
          <div 
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl
                       bg-white/80 backdrop-blur-md border border-white/60
                       shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
          >
            <span className="font-bold text-sm" style={{ color: style.primaryColor }}>
              {formatPrice(activity.price)}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 mb-2">
            {activity.name}
          </h3>
          
          {activity.tagline && (
            <p className="text-sm text-gray-500 line-clamp-1 mb-3">
              {activity.tagline}
            </p>
          )}
          
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{activity.duration}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{activity.minPlayers}-{activity.maxPlayers}</span>
            </div>
          </div>

          {/* Select Arrow */}
          <div 
            className={`
              absolute bottom-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center
              transition-all duration-300
              ${isHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}
            `}
            style={{ 
              background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.primaryColor}dd 100%)`,
            }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </button>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const WidgetActivitySelector: React.FC<WidgetActivitySelectorProps> = ({
  activities,
  venue,
  style,
  onSelect,
}) => {
  if (activities.length === 0) {
    return (
      <div className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No activities available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Venue Header */}
      {venue && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" style={{ color: style.primaryColor }} />
          <span className="font-medium">{venue.name}</span>
        </div>
      )}

      {/* Section Title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Select an Experience</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {activities.length} experience{activities.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Activity Grid */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            style={style}
            onSelect={() => onSelect(activity)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default WidgetActivitySelector;
