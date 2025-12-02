/**
 * Embed Pro 2.0 - Widget Activity Selector Component
 * @module embed-pro/widget-components/WidgetActivitySelector
 * 
 * Displays all activities for a venue with Apple Liquid Glass design.
 * Used when embedding a venue to let users select which game to book.
 * 
 * Supports multiple layout modes:
 * - grid: 2-4 column responsive grid
 * - list: Single column list view
 * - carousel: Horizontal scrollable carousel
 * - horizontal: Side-by-side image and content
 */

import React, { useState, useMemo } from 'react';
import { Clock, Users, ChevronRight, Sparkles, MapPin, Search, ChevronLeft } from 'lucide-react';
import type { WidgetActivity, WidgetVenue, WidgetStyle } from '../types/widget.types';
import type { VenueLayoutConfig, VenueDisplayMode, VenueCardStyle } from '../types/embed-config.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetActivitySelectorProps {
  activities: WidgetActivity[];
  venue: WidgetVenue | null;
  style: WidgetStyle;
  onSelect: (activity: WidgetActivity) => void;
  layout?: VenueLayoutConfig;
}

// =====================================================
// ACTIVITY CARD COMPONENT
// =====================================================

interface ActivityCardProps {
  activity: WidgetActivity;
  style: WidgetStyle;
  onSelect: () => void;
  index: number;
  cardStyle?: VenueCardStyle;
  showImage?: boolean;
  showPrice?: boolean;
  showDuration?: boolean;
  showCapacity?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  style, 
  onSelect, 
  index,
  cardStyle = 'default',
  showImage = true,
  showPrice = true,
  showDuration = true,
  showCapacity = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: activity.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Horizontal card layout
  if (cardStyle === 'horizontal') {
    return (
      <button
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full text-left group"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div 
          className={`
            relative overflow-hidden rounded-2xl flex
            bg-white/60 backdrop-blur-md border border-white/70
            shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_2px_12px_rgba(255,255,255,0.4)]
            transition-all duration-300 ease-out
            ${isHovered ? 'scale-[1.01] shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : ''}
          `}
        >
          {/* Image Section - Side */}
          {showImage && (
            <div className="relative w-32 sm:w-40 flex-shrink-0 overflow-hidden">
              {activity.coverImage ? (
                <img
                  src={activity.coverImage}
                  alt={activity.name}
                  onLoad={() => setImageLoaded(true)}
                  className={`
                    w-full h-full object-cover transition-all duration-500
                    ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                    ${isHovered ? 'scale-110' : 'scale-100'}
                  `}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${style.primaryColor}30 0%, ${style.primaryColor}10 100%)` }}
                >
                  <Sparkles className="w-8 h-8" style={{ color: style.primaryColor }} />
                </div>
              )}
            </div>
          )}

          {/* Content Section - Side */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                  {activity.name}
                </h3>
                {showPrice && (
                  <span className="font-bold text-sm ml-2 flex-shrink-0" style={{ color: style.primaryColor }}>
                    {formatPrice(activity.price)}
                  </span>
                )}
              </div>
              {activity.tagline && (
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {activity.tagline}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                {showDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activity.duration}min</span>
                  </div>
                )}
                {showCapacity && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{activity.minPlayers}-{activity.maxPlayers}</span>
                  </div>
                )}
              </div>
              
              {/* Book Now Button for Horizontal */}
              <div 
                className="mt-3 py-2 px-4 rounded-xl text-center font-semibold text-white text-sm
                           transition-all duration-300 flex items-center justify-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.primaryColor}dd 100%)`,
                  boxShadow: isHovered ? `0 4px 15px ${style.primaryColor}40` : 'none',
                }}
              >
                <span>Book Now</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </div>
          </div>
        </div>
      </button>
    );
  }

  // Default/Compact card layout (vertical)
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
        {showImage && (
          <div className={`relative overflow-hidden ${cardStyle === 'compact' ? 'h-24' : 'h-32'}`}>
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
            {showPrice && (
              <div 
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl
                           bg-white/80 backdrop-blur-md border border-white/60
                           shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
              >
                <span className="font-bold text-sm" style={{ color: style.primaryColor }}>
                  {formatPrice(activity.price)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className={cardStyle === 'compact' ? 'p-3' : 'p-4'}>
          <h3 className={`font-semibold text-gray-900 line-clamp-1 mb-1 ${cardStyle === 'compact' ? 'text-base' : 'text-lg mb-2'}`}>
            {activity.name}
          </h3>
          
          {cardStyle !== 'compact' && activity.tagline && (
            <p className="text-sm text-gray-500 line-clamp-1 mb-3">
              {activity.tagline}
            </p>
          )}
          
          {/* Stats Row */}
          {(showDuration || showCapacity) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {showDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activity.duration}min</span>
                </div>
              )}
              {showCapacity && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{activity.minPlayers}-{activity.maxPlayers}</span>
                </div>
              )}
            </div>
          )}

          {/* Book Now Button - Always Visible */}
          <div 
            className="w-full py-2.5 px-4 rounded-xl text-center font-semibold text-white text-sm
                       transition-all duration-300 flex items-center justify-center gap-2
                       hover:shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.primaryColor}dd 100%)`,
              boxShadow: isHovered ? `0 4px 15px ${style.primaryColor}40` : 'none',
            }}
          >
            <span>Book Now</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
          </div>
        </div>
      </div>
    </button>
  );
};

// =====================================================
// DEFAULT LAYOUT
// =====================================================

const DEFAULT_LAYOUT: VenueLayoutConfig = {
  displayMode: 'grid',
  gridColumns: 2,
  cardStyle: 'default',
  showActivityImage: true,
  showActivityPrice: true,
  showActivityDuration: true,
  showActivityCapacity: true,
  sortBy: 'name',
  sortOrder: 'asc',
  maxActivities: 0,
  enableSearch: false,
  compactOnMobile: true,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const WidgetActivitySelector: React.FC<WidgetActivitySelectorProps> = ({
  activities,
  venue,
  style,
  onSelect,
  layout: layoutProp,
}) => {
  const layout = { ...DEFAULT_LAYOUT, ...layoutProp };
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Sort and filter activities
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.tagline?.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (layout.sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'popularity':
          // Could add booking count here
          comparison = 0;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return layout.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Limit if maxActivities > 0
    if (layout.maxActivities && layout.maxActivities > 0) {
      result = result.slice(0, layout.maxActivities);
    }

    return result;
  }, [activities, searchQuery, layout.sortBy, layout.sortOrder, layout.maxActivities]);

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No activities available</p>
      </div>
    );
  }

  // Get grid columns class
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[layout.gridColumns || 2];

  // Carousel navigation
  const canGoPrev = carouselIndex > 0;
  const canGoNext = carouselIndex < filteredActivities.length - 1;

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
          {filteredActivities.length} experience{filteredActivities.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search Box */}
      {layout.enableSearch && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
          />
        </div>
      )}

      {/* Carousel Layout */}
      {layout.displayMode === 'carousel' && (
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="w-full flex-shrink-0 px-1">
                  <ActivityCard
                    activity={activity}
                    style={style}
                    onSelect={() => onSelect(activity)}
                    index={0}
                    cardStyle={layout.cardStyle}
                    showImage={layout.showActivityImage}
                    showPrice={layout.showActivityPrice}
                    showDuration={layout.showActivityDuration}
                    showCapacity={layout.showActivityCapacity}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Carousel Navigation */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
              disabled={!canGoPrev}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {filteredActivities.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === carouselIndex ? 'w-4' : 'bg-gray-300'
                  }`}
                  style={{ backgroundColor: i === carouselIndex ? style.primaryColor : undefined }}
                />
              ))}
            </div>
            <button
              onClick={() => setCarouselIndex(i => Math.min(filteredActivities.length - 1, i + 1))}
              disabled={!canGoNext}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      {layout.displayMode === 'grid' && (
        <div className={`grid ${gridColsClass} gap-3 max-h-[400px] overflow-y-auto pr-1`}>
          {filteredActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              style={style}
              onSelect={() => onSelect(activity)}
              index={index}
              cardStyle={layout.compactOnMobile ? 'compact' : layout.cardStyle}
              showImage={layout.showActivityImage}
              showPrice={layout.showActivityPrice}
              showDuration={layout.showActivityDuration}
              showCapacity={layout.showActivityCapacity}
            />
          ))}
        </div>
      )}

      {/* List Layout */}
      {layout.displayMode === 'list' && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              style={style}
              onSelect={() => onSelect(activity)}
              index={index}
              cardStyle={layout.cardStyle === 'horizontal' ? 'horizontal' : layout.cardStyle}
              showImage={layout.showActivityImage}
              showPrice={layout.showActivityPrice}
              showDuration={layout.showActivityDuration}
              showCapacity={layout.showActivityCapacity}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WidgetActivitySelector;
