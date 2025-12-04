/**
 * Delete Staff Dialog Component
 * Confirmation dialog for deleting staff members
 * @module staff/components/DeleteStaffDialog
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StaffMember } from '../types';

interface DeleteStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  staff: StaffMember | null;
  isDark: boolean;
}

export function DeleteStaffDialog({
  open,
  onClose,
  onConfirm,
  staff,
  isDark,
}: DeleteStaffDialogProps) {
  if (!staff) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
        <AlertDialogHeader>
          <AlertDialogTitle className={isDark ? 'text-white' : ''}>
            Deactivate Staff Member?
          </AlertDialogTitle>
          <AlertDialogDescription className={isDark ? 'text-[#a3a3a3]' : ''}>
            This will deactivate <strong>{staff.fullName}</strong> and they will no longer be
            able to access the system. Their data will be preserved and they can be reactivated
            later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
