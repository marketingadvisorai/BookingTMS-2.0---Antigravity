import React from 'react';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { useInventory } from '../modules/inventory/hooks/useInventory';
import { useGameWizard } from '../modules/inventory/hooks/useGameWizard';
import { InventoryStats } from '../modules/inventory/components/InventoryStats';
import { GameGrid } from '../modules/inventory/components/GameGrid';
import { GameDialogs } from '../modules/inventory/components/GameDialogs';

import { useTerminology } from '../hooks/useTerminology';

export function Events() {
  const t = useTerminology();
  const {
    games,
    stats,
    isLoading,
    createGame,
    updateGame,
    deleteGame,
    duplicateGame,
    toggleStatus
  } = useInventory();

  const wizard = useGameWizard();

  const handleAddComplete = async (data: any) => {
    try {
      const payload = wizard.prepareCreateData(data);
      await createGame(payload);
      wizard.setShowAddWizard(false);
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  const handleEditComplete = async (data: any) => {
    if (!wizard.editingGame) return;
    try {
      const payload = wizard.prepareUpdateData(data);
      await updateGame(wizard.editingGame.id, payload);
      wizard.setEditingGame(null);
    } catch (error) {
      console.error("Failed to update game:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!wizard.deletingGame) return;
    try {
      await deleteGame(wizard.deletingGame.id);
      wizard.setDeletingGame(null);
    } catch (error) {
      console.error("Failed to delete game:", error);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t.plural}
        description={`Manage your ${t.plural.toLowerCase()}`}
        sticky
        action={
          <Button
            className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-11"
            onClick={() => wizard.setShowAddWizard(true)}
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.actionAdd}</span>
          </Button>
        }
      />

      <InventoryStats stats={stats} isLoading={isLoading} />

      <GameGrid
        games={games}
        isLoading={isLoading}
        onEdit={wizard.setEditingGame}
        onViewBookings={wizard.setViewingBookingsGame}
        onDuplicate={duplicateGame}
        onDelete={wizard.setDeletingGame}
        onToggleStatus={toggleStatus}
        onAddGame={() => wizard.setShowAddWizard(true)}
      />

      <GameDialogs
        showAddWizard={wizard.showAddWizard}
        setShowAddWizard={wizard.setShowAddWizard}
        editingGame={wizard.editingGame}
        setEditingGame={wizard.setEditingGame}
        viewingBookingsGame={wizard.viewingBookingsGame}
        setViewingBookingsGame={wizard.setViewingBookingsGame}
        deletingGame={wizard.deletingGame}
        setDeletingGame={wizard.setDeletingGame}
        onAddComplete={handleAddComplete}
        onEditComplete={handleEditComplete}
        onDeleteConfirm={handleDeleteConfirm}
        convertGameToWizardData={wizard.convertGameToWizardData}
      />
    </div>
  );
}
