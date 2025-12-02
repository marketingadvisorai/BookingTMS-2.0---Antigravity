/**
 * Edit Embed Modal - Layout Tab
 * @module embed-pro/components/edit-modal/LayoutTab
 */

import React from 'react';
import { LayoutGrid, List, Sparkles, Rows, Columns } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VenueCardStyle } from '../../types/embed-config.types';
import type { EditFormData } from './types';

interface LayoutTabProps {
  formData: EditFormData;
  onChange: (updates: Partial<EditFormData>) => void;
  isVenue: boolean;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ formData, onChange, isVenue }) => {
  return (
    <div className="space-y-6">
      {/* Orientation */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Layout Orientation</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ layoutOrientation: 'vertical' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
              formData.layoutOrientation === 'vertical'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Rows className="w-6 h-6" />
            <span className="text-sm font-medium">Vertical</span>
            <span className="text-xs text-gray-500">Stack items top to bottom</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ layoutOrientation: 'horizontal' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
              formData.layoutOrientation === 'horizontal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Columns className="w-6 h-6" />
            <span className="text-sm font-medium">Horizontal</span>
            <span className="text-xs text-gray-500">Side by side layout</span>
          </button>
        </div>
      </div>

      {/* Display Mode (for venues) */}
      {isVenue && (
        <>
          <div>
            <Label className="text-sm font-medium mb-3 block">Activity Display</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'grid', icon: LayoutGrid, label: 'Grid' },
                { value: 'list', icon: List, label: 'List' },
                { value: 'carousel', icon: Sparkles, label: 'Carousel' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ displayMode: value as 'grid' | 'list' | 'carousel' })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                    formData.displayMode === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Columns */}
          {formData.displayMode === 'grid' && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Grid Columns: {formData.gridColumns}
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => onChange({ gridColumns: cols as 1 | 2 | 3 | 4 })}
                    className={cn(
                      'py-2 rounded-lg border transition-all text-sm font-medium',
                      formData.gridColumns === cols
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card Style */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Card Style</Label>
            <Select
              value={formData.cardStyle}
              onValueChange={(v) => onChange({ cardStyle: v as VenueCardStyle })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};

export default LayoutTab;
