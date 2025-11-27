/**
 * Customization Panel Component
 * Theme and color customization options
 * 
 * @module widget/CustomizationPanel
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Palette, Sun, Moon } from 'lucide-react';

interface CustomizationPanelProps {
  primaryColor: string;
  theme: 'light' | 'dark';
  onColorChange: (color: string) => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const COLOR_PRESETS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Green
  '#dc2626', // Red
  '#ea580c', // Orange
  '#0891b2', // Cyan
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  primaryColor,
  theme,
  onColorChange,
  onThemeChange,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Customization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme Toggle */}
        <div>
          <Label className="text-sm mb-2 block">Theme</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange('light')}
              className="flex-1"
            >
              <Sun className="w-4 h-4 mr-1" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange('dark')}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-1" />
              Dark
            </Button>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <Label className="text-sm mb-2 block">Primary Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="flex-1 font-mono text-sm"
              placeholder="#2563eb"
            />
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <Label className="text-sm mb-2 block">Presets</Label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  primaryColor === color 
                    ? 'border-gray-900 dark:border-white scale-110' 
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomizationPanel;
