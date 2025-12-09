/**
 * Edit Embed Modal - Advanced Styles Tab
 * @module embed-pro/components/edit-modal/AdvancedStylesTab
 * 
 * Developer-friendly styling options for seamless website integration.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Palette, 
  Type, 
  Square, 
  Zap, 
  Code, 
  Eye,
  Sparkles,
  Layers 
} from 'lucide-react';
import type { EditFormData } from './types';
import { SHADOW_VALUES, FONT_FAMILIES, EASING_PRESETS } from '../../styles/constants';

interface AdvancedStylesTabProps {
  formData: EditFormData;
  onChange: (updates: Partial<EditFormData>) => void;
}

export const AdvancedStylesTab: React.FC<AdvancedStylesTabProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Glassmorphism Effects */}
      <Section title="Visual Effects" icon={Sparkles}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Glassmorphism</Label>
              <p className="text-xs text-gray-500">Enable glass blur effects</p>
            </div>
            <Switch
              checked={formData.enableGlassmorphism ?? true}
              onCheckedChange={(v) => onChange({ enableGlassmorphism: v })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Animations</Label>
              <p className="text-xs text-gray-500">Smooth transitions and effects</p>
            </div>
            <Switch
              checked={formData.enableAnimations ?? true}
              onCheckedChange={(v) => onChange({ enableAnimations: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Hover Effects</Label>
              <p className="text-xs text-gray-500">Button scale on hover</p>
            </div>
            <Switch
              checked={formData.enableHoverEffects ?? true}
              onCheckedChange={(v) => onChange({ enableHoverEffects: v })}
            />
          </div>
        </div>
      </Section>

      {/* Shadow Settings */}
      <Section title="Shadows" icon={Layers}>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Card Shadow</Label>
            <Select 
              value={formData.cardShadow || 'lg'} 
              onValueChange={(v) => onChange({ cardShadow: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SHADOW_VALUES).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Button Shadow</Label>
            <Select 
              value={formData.buttonShadow || 'md'} 
              onValueChange={(v) => onChange({ buttonShadow: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SHADOW_VALUES).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" icon={Type}>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Heading Font</Label>
            <Select 
              value={formData.headingFontFamily || formData.fontFamily} 
              onValueChange={(v) => onChange({ headingFontFamily: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value} style={{ fontFamily: value }}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Use Website Fonts</Label>
              <p className="text-xs text-gray-500">Inherit from parent website</p>
            </div>
            <Switch
              checked={formData.inheritParentFonts ?? false}
              onCheckedChange={(v) => onChange({ inheritParentFonts: v })}
            />
          </div>
        </div>
      </Section>

      {/* Custom Colors */}
      <Section title="Additional Colors" icon={Palette}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Success Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.successColor || '#10b981'}
                onChange={(e) => onChange({ successColor: e.target.value })}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <Input
                value={formData.successColor || '#10b981'}
                onChange={(e) => onChange({ successColor: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Error Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.errorColor || '#ef4444'}
                onChange={(e) => onChange({ errorColor: e.target.value })}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <Input
                value={formData.errorColor || '#ef4444'}
                onChange={(e) => onChange({ errorColor: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Custom CSS */}
      <Section title="Custom CSS" icon={Code}>
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Add custom CSS rules to override widget styles. Use <code>.bookflow-widget</code> as root selector.
          </p>
          <Textarea
            value={formData.customCSS || ''}
            onChange={(e) => onChange({ customCSS: e.target.value })}
            placeholder={`.bookflow-widget {\n  /* Your custom styles */\n}`}
            className="font-mono text-xs h-32"
          />
        </div>
      </Section>
    </div>
  );
};

// Section component for organization
const Section: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <h4 className="font-medium text-sm">{title}</h4>
    </div>
    {children}
  </div>
);

export default AdvancedStylesTab;
