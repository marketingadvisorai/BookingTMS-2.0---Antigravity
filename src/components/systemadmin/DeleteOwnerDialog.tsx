'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useTheme } from '../layout/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface DeleteOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  owner: any;
  onConfirmDelete?: (ownerId: number) => void;
}

export const DeleteOwnerDialog = ({ isOpen, onClose, owner, onConfirmDelete }: DeleteOwnerDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  const [confirmText, setConfirmText] = useState('');
  const confirmationPhrase = 'DELETE';

  const handleDelete = () => {
    if (confirmText !== confirmationPhrase) {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (onConfirmDelete) {
      onConfirmDelete(owner.id);
    }

    toast.success(`Owner "${owner.organizationName}" has been deleted`);
    onClose();
  };

  const isDeleteDisabled = confirmText !== confirmationPhrase;

  if (!owner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} border ${borderColor} max-w-2xl`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Delete Owner
          </DialogTitle>
          <DialogDescription className={mutedTextClass}>
            This action cannot be undone. Please confirm deletion by typing DELETE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="p-4 rounded-lg bg-red-600/10 border border-red-600/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-600 dark:text-red-400 mb-2">Warning: This action cannot be undone!</h4>
                <p className={`text-sm ${mutedTextClass}`}>
                  Deleting this owner will permanently remove:
                </p>
                <ul className={`mt-2 space-y-1 text-sm ${mutedTextClass} list-disc list-inside`}>
                  <li>All organization data and settings</li>
                  <li>All associated venues ({owner.venues} venue{owner.venues !== 1 ? 's' : ''})</li>
                  <li>All booking history and customer data</li>
                  <li>All payment and subscription information</li>
                  <li>All analytics and reports</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className={`p-4 rounded-lg border ${borderColor} bg-gray-50 dark:bg-[#0a0a0a]`}>
            <h4 className={`text-sm uppercase tracking-wider mb-3 ${mutedTextClass}`}>Owner to be deleted</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={mutedTextClass}>Organization:</span>
                <span className={textClass}>{owner.organizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Owner:</span>
                <span className={textClass}>{owner.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Organization ID:</span>
                <code className="text-xs bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                  {owner.organizationId}
                </code>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Email:</span>
                <span className={textClass}>{owner.email}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Plan:</span>
                <span className={textClass}>{owner.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Venues:</span>
                <span className={textClass}>{owner.venues}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Type <span className="font-mono bg-red-600/10 text-red-600 dark:text-red-400 px-2 py-1 rounded">{confirmationPhrase}</span> to confirm deletion
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
              placeholder="Type DELETE here"
              autoComplete="off"
            />
          </div>

          {/* Impact Summary */}
          <div className={`p-4 rounded-lg border ${borderColor} bg-yellow-600/5`}>
            <p className={`text-sm ${mutedTextClass}`}>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">Note:</span> Consider exporting all data before deleting this owner. Once deleted, data recovery is not possible.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#333]">
            <Button
              variant="outline"
              onClick={onClose}
              className={`border ${borderColor}`}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleteDisabled}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Owner Permanently
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
