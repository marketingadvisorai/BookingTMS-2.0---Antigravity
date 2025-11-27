/**
 * BookFlow Widget - Player Count Component
 * @module widgets/bookflow/components/BookFlowPlayerCount
 */

import React from 'react';
import { Users, Minus, Plus } from 'lucide-react';
import { cn } from '../../../ui/utils';

interface BookFlowPlayerCountProps {
  playerCount: number;
  childCount: number;
  onPlayerChange: (count: number) => void;
  onChildChange: (count: number) => void;
  minPlayers: number;
  maxPlayers: number;
  price: number;
  childPrice?: number | null;
  currency?: string;
  primaryColor?: string;
}

export const BookFlowPlayerCount: React.FC<BookFlowPlayerCountProps> = ({
  playerCount,
  childCount,
  onPlayerChange,
  onChildChange,
  minPlayers,
  maxPlayers,
  price,
  childPrice,
  currency = 'USD',
  primaryColor = '#3B82F6',
}) => {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const totalPlayers = playerCount + childCount;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <Users className="w-4 h-4" />
        Number of Players
      </h4>

      <div className="space-y-3">
        {/* Adults */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Adults</p>
            <p className="text-sm text-gray-500">{formatPrice(price)} each</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlayerChange(Math.max(minPlayers, playerCount - 1))}
              disabled={playerCount <= minPlayers}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                'border-2 border-gray-200 dark:border-gray-600',
                playerCount <= minPlayers
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-gray-300 dark:hover:border-gray-500'
              )}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold text-lg">{playerCount}</span>
            <button
              onClick={() => onPlayerChange(Math.min(maxPlayers - childCount, playerCount + 1))}
              disabled={totalPlayers >= maxPlayers}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                'text-white'
              )}
              style={{ backgroundColor: totalPlayers >= maxPlayers ? '#9CA3AF' : primaryColor }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children (if child price exists) */}
        {childPrice !== null && childPrice !== undefined && (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Children</p>
              <p className="text-sm text-gray-500">{formatPrice(childPrice)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onChildChange(Math.max(0, childCount - 1))}
                disabled={childCount <= 0}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  'border-2 border-gray-200 dark:border-gray-600',
                  childCount <= 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-gray-300 dark:hover:border-gray-500'
                )}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-lg">{childCount}</span>
              <button
                onClick={() => onChildChange(Math.min(maxPlayers - playerCount, childCount + 1))}
                disabled={totalPlayers >= maxPlayers}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  'text-white'
                )}
                style={{ backgroundColor: totalPlayers >= maxPlayers ? '#9CA3AF' : primaryColor }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Min/Max info */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {minPlayers}-{maxPlayers} players allowed per session
        </p>
      </div>
    </div>
  );
};

export default BookFlowPlayerCount;
