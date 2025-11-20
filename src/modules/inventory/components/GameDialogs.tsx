import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { VisuallyHidden } from '../../../components/ui/visually-hidden';
import AddEventWizard from '../../../components/events/AddEventWizard';
import { ViewEventBookings } from '../../../components/events/ViewEventBookings';
import { Game } from '../types';

interface GameDialogsProps {
  showAddWizard: boolean;
  setShowAddWizard: (show: boolean) => void;
  editingGame: Game | null;
  setEditingGame: (game: Game | null) => void;
  viewingBookingsGame: Game | null;
  setViewingBookingsGame: (game: Game | null) => void;
  deletingGame: Game | null;
  setDeletingGame: (game: Game | null) => void;
  onAddComplete: (data: any) => void;
  onEditComplete: (data: any) => void;
  onDeleteConfirm: () => void;
  convertGameToWizardData: (game: Game) => any;
}

export function GameDialogs({
  showAddWizard,
  setShowAddWizard,
  editingGame,
  setEditingGame,
  viewingBookingsGame,
  setViewingBookingsGame,
  deletingGame,
  setDeletingGame,
  onAddComplete,
  onEditComplete,
  onDeleteConfirm,
  convertGameToWizardData
}: GameDialogsProps) {
  return (
    <>
      {/* Add Game Wizard Dialog */}
      <Dialog open={showAddWizard} onOpenChange={setShowAddWizard}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Complete the multi-step wizard to add a new escape room game
            </DialogDescription>
          </VisuallyHidden>
          <AddEventWizard
            onComplete={onAddComplete}
            onCancel={() => setShowAddWizard(false)}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Game Wizard Dialog */}
      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>Edit your escape room game details</DialogDescription>
          </VisuallyHidden>
          {editingGame && (
            <AddEventWizard
              onComplete={onEditComplete}
              onCancel={() => setEditingGame(null)}
              initialData={convertGameToWizardData(editingGame)}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Bookings Dialog */}
      <Dialog open={!!viewingBookingsGame} onOpenChange={(open) => !open && setViewingBookingsGame(null)}>
        <DialogContent className="!w-[90vw] !max-w-[1200px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>View Game Bookings</DialogTitle>
            <DialogDescription>View all bookings for {viewingBookingsGame?.name}</DialogDescription>
          </VisuallyHidden>
          {viewingBookingsGame && (
            <ViewEventBookings
              game={viewingBookingsGame}
              onClose={() => setViewingBookingsGame(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGame} onOpenChange={(open) => !open && setDeletingGame(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingGame?.name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700"
            >
              Delete Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
