/**
 * Export Dialog
 * Dialog for exporting transactions to CSV or PDF
 * @module payment-history/components/ExportDialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/layout/ThemeContext';
import type { ExportFormat } from '../types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  isExporting: boolean;
}

export function ExportDialog({
  isOpen,
  onClose,
  exportFormat,
  onFormatChange,
  onExport,
  isExporting,
}: ExportDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const dialogBg = isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={dialogBg}>
        <DialogHeader>
          <DialogTitle className={textPrimary}>Export Transactions</DialogTitle>
          <DialogDescription className={textSecondary}>
            Choose a format and export the currently filtered transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className={textSecondary}>Format</Label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                onClick={() => onFormatChange('csv')}
                className={isDark ? (exportFormat === 'csv' ? '' : 'border-[#2a2a2a] text-[#a3a3a3]') : ''}
              >
                CSV
              </Button>
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => onFormatChange('pdf')}
                className={isDark ? (exportFormat === 'pdf' ? '' : 'border-[#2a2a2a] text-[#a3a3a3]') : ''}
              >
                PDF
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className={isDark ? 'text-[#a3a3a3] hover:text-white hover:bg-[#161616]' : ''}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button onClick={onExport} disabled={isExporting}>
              {isExporting ? 'Exporting…' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog;
