import React from 'react';
import { Button } from '../../../components/ui/button';
import { GameCard } from './GameCard';
import { Game } from '../types';

interface GameGridProps {
  games: Game[];
  isLoading: boolean;
  onEdit: (game: Game) => void;
  onViewBookings: (game: Game) => void;
  onDuplicate: (game: Game) => void;
  onDelete: (game: Game) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onAddGame: () => void;
}

export function GameGrid({ 
  games, 
  isLoading, 
  onEdit, 
  onViewBookings, 
  onDuplicate, 
  onDelete, 
  onToggleStatus,
  onAddGame
}: GameGridProps) {
  
  if (isLoading && games.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-[#4f46e5]"></div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No games found. Create your first game!</p>
        <Button 
          variant="outline" 
          onClick={onAddGame}
        >
          Add Game
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onEdit={onEdit}
          onViewBookings={onViewBookings}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
