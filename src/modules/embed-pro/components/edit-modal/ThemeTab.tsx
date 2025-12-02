/**
 * Edit Embed Modal - Theme Tab
 * @module embed-pro/components/edit-modal/ThemeTab
 */

import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmbedTheme } from '../../types/embed-config.types';
import type { EditFormData } from './types';
import {
  WIDGET_THEMES,
  PRESET_COLORS,
  BORDER_RADIUS_OPTIONS,
  FONT_OPTIONS,
  ThemePreset,
} from './constants';

interface ThemeTabProps {
  formData: EditFormData;
  onChange: (updates: Partial<EditFormData>) => void;
}

export const ThemeTab: React.FC<ThemeTabProps> = ({ formData, onChange }) => {
  const applyThemePreset = (theme: ThemePreset) => {
    onChange({
      widgetTheme: theme.id,
      primaryColor: theme.preview.primaryColor,
      borderRadius: theme.preview.borderRadius,
    });
  };

  return (
    <div className="space-y-6">
      {/* Widget Theme Selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Widget Theme</Label>
        <div className="grid grid-cols-2 gap-3">
          {WIDGET_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => applyThemePreset(theme)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                formData.widgetTheme === theme.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              {formData.widgetTheme === theme.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className="w-full h-16 rounded-lg mb-3"
                style={{
                  background: theme.preview.backgroundColor,
                  borderRadius: theme.preview.borderRadius,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <div
                  className="w-1/2 h-3 rounded-full mt-3 mx-3"
                  style={{ backgroundColor: theme.preview.primaryColor }}
                />
                <div className="w-3/4 h-2 rounded-full mt-2 mx-3 bg-gray-200" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {theme.name}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Theme (Light/Dark) */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Color Mode</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'auto', icon: Monitor, label: 'Auto' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ colorTheme: value as EmbedTheme })}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                formData.colorTheme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className={cn('w-5 h-5', formData.colorTheme === value ? 'text-blue-500' : 'text-gray-400')} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Primary Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ primaryColor: color })}
              className={cn(
                'w-10 h-10 rounded-lg border-2 transition-all hover:scale-110',
                formData.primaryColor === color
                  ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-blue-500'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="sr-only"
            />
            <span className="text-xs text-gray-400">+</span>
          </label>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Border Radius</Label>
        <div className="grid grid-cols-3 gap-2">
          {BORDER_RADIUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ borderRadius: value })}
              className={cn(
                'px-3 py-2 text-sm rounded-lg border transition-all',
                formData.borderRadius === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Font Family</Label>
        <Select value={formData.fontFamily} onValueChange={(v) => onChange({ fontFamily: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value} style={{ fontFamily: value }}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ThemeTab;
