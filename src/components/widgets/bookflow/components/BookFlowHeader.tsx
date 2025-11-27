/**
 * BookFlow Widget - Header Component
 * @module widgets/bookflow/components/BookFlowHeader
 */

import React from 'react';
import { Clock, Users, Star } from 'lucide-react';
import type { BookFlowActivity } from '../types';

interface BookFlowHeaderProps {
  activity: BookFlowActivity;
  primaryColor?: string;
}

export const BookFlowHeader: React.FC<BookFlowHeaderProps> = ({
  activity,
  primaryColor = '#3B82F6',
}) => {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: activity.currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="relative overflow-hidden rounded-xl mb-6">
      {/* Cover Image */}
      {activity.coverImage && (
        <div className="relative h-48 sm:h-56">
          <img
            src={activity.coverImage}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={activity.coverImage ? 'absolute bottom-0 left-0 right-0 p-4' : 'p-4 bg-gray-50 dark:bg-gray-800/50'}>
        <h2 className={`text-2xl font-bold mb-2 ${activity.coverImage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {activity.name}
        </h2>
        
        {activity.tagline && (
          <p className={`text-sm mb-3 ${activity.coverImage ? 'text-white/80' : 'text-gray-500'}`}>
            {activity.tagline}
          </p>
        )}

        {/* Info badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {formatPrice(activity.price)}
            <span className="text-xs opacity-80">/person</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white/20 backdrop-blur-sm text-white">
            <Clock className="w-3.5 h-3.5" />
            {activity.duration} min
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white/20 backdrop-blur-sm text-white">
            <Users className="w-3.5 h-3.5" />
            {activity.minPlayers}-{activity.maxPlayers} players
          </div>

          {activity.difficulty && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white/20 backdrop-blur-sm text-white">
              <Star className="w-3.5 h-3.5" />
              {activity.difficulty}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookFlowHeader;
