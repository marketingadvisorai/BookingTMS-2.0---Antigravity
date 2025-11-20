import { useState } from 'react';
import { Game } from '../types';
import { convertGameToWizardData, convertWizardDataToGame } from '../utils/wizardAdapter';
import { useAuth } from '../../../lib/auth/AuthContext';

export function useGameWizard() {
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [viewingBookingsGame, setViewingBookingsGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const { currentUser } = useAuth();

  // Helper to prepare data for creation
  const prepareCreateData = (wizardData: any) => {
    if (!currentUser?.organizationId) throw new Error('No organization ID');
    return convertWizardDataToGame(wizardData, currentUser.organizationId, currentUser.organizationId);
  };

  // Helper to prepare data for update
  const prepareUpdateData = (wizardData: any) => {
    const difficultyMap = ['easy', 'easy', 'medium', 'hard', 'expert'];
    const difficulty = difficultyMap[wizardData.difficulty - 1] || 'medium';

    return {
        name: wizardData.name,
        description: wizardData.description,
        difficulty: difficulty as any,
        duration_minutes: wizardData.duration,
        min_players: wizardData.minAdults,
        max_players: wizardData.maxAdults,
        price: wizardData.adultPrice,
        image_url: wizardData.coverImage,
    };
  };

  return {
    showAddWizard,
    setShowAddWizard,
    editingGame,
    setEditingGame,
    viewingBookingsGame,
    setViewingBookingsGame,
    deletingGame,
    setDeletingGame,
    prepareCreateData,
    prepareUpdateData,
    convertGameToWizardData
  };
}
