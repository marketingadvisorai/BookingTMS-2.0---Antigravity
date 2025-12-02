/**
 * Embed Pro 2.0 - Edit Embed Modal
 * @module embed-pro/components/EditEmbedModal
 * 
 * Comprehensive editing dialog for embed configurations.
 * Includes theme switching, layout options, and visual customization.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Palette,
  Layout,
  Eye,
  Settings,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  List,
  Rows,
  Columns,
  Sparkles,
  Square,
  Type,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  EmbedConfigWithRelations,
  UpdateEmbedConfigInput,
  EmbedTheme,
  WidgetTheme,
  LayoutOrientation,
  VenueDisplayMode,
  VenueCardStyle,
} from '../types';

// =====================================================
// THEME PRESETS
// =====================================================

interface ThemePreset {
  id: WidgetTheme;
  name: string;
  description: string;
  preview: {
    primaryColor: string;
    backgroundColor: string;
    borderRadius: string;
    style: string;
  };
}

const WIDGET_THEMES: ThemePreset[] = [
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    description: 'Modern glassmorphism with blur effects',
    preview: {
      primaryColor: '#2563eb',
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: '24px',
      style: 'backdrop-blur-xl',
    },
  },
  {
    id: 'bookingmars',
    name: 'Bookingmars',
    description: 'Clean, minimal Airbnb-inspired design',
    preview: {
      primaryColor: '#FF385C',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      style: 'shadow-lg',
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional calendar-style layout',
    preview: {
      primaryColor: '#059669',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      style: 'border',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with subtle accents',
    preview: {
      primaryColor: '#6366F1',
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      style: 'border-b',
    },
  },
];

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#dc2626',
  '#ea580c', '#0891b2', '#be185d', '#FF385C',
  '#6366F1', '#000000',
];

const BORDER_RADIUS_OPTIONS = [
  { value: '0px', label: 'Square' },
  { value: '4px', label: 'Slight' },
  { value: '8px', label: 'Small' },
  { value: '12px', label: 'Medium' },
  { value: '16px', label: 'Large' },
  { value: '24px', label: 'Extra Large' },
];

const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
];

// =====================================================
// PROPS INTERFACE
// =====================================================

interface EditEmbedModalProps {
  open: boolean;
  config: EmbedConfigWithRelations | null;
  onClose: () => void;
  onSave: (id: string, updates: UpdateEmbedConfigInput) => Promise<void>;
}

// =====================================================
// COMPONENT
// =====================================================

export const EditEmbedModal: React.FC<EditEmbedModalProps> = ({
  open,
  config,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // Theme
    widgetTheme: 'liquid-glass' as WidgetTheme,
    colorTheme: 'light' as EmbedTheme,
    primaryColor: '#2563eb',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
    // Layout
    layoutOrientation: 'vertical' as LayoutOrientation,
    displayMode: 'grid' as VenueDisplayMode,
    cardStyle: 'default' as VenueCardStyle,
    gridColumns: 2 as 1 | 2 | 3 | 4,
    // Display options
    showPricing: true,
    showDescription: true,
    showActivityImage: true,
    showActivityDuration: true,
    showActivityCapacity: true,
    enableSearch: false,
    compactOnMobile: true,
  });

  // Initialize form when config changes
  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name || '',
        description: config.description || '',
        widgetTheme: config.style?.widgetTheme || 'liquid-glass',
        colorTheme: config.style?.theme || 'light',
        primaryColor: config.style?.primaryColor || '#2563eb',
        borderRadius: config.style?.borderRadius || '12px',
        fontFamily: config.style?.fontFamily || 'Inter, system-ui, sans-serif',
        layoutOrientation: config.style?.layoutOrientation || 'vertical',
        displayMode: config.venue_layout?.displayMode || 'grid',
        cardStyle: config.venue_layout?.cardStyle || 'default',
        gridColumns: config.venue_layout?.gridColumns || 2,
        showPricing: config.config?.showPricing !== false,
        showDescription: config.config?.showDescription !== false,
        showActivityImage: config.venue_layout?.showActivityImage !== false,
        showActivityDuration: config.venue_layout?.showActivityDuration !== false,
        showActivityCapacity: config.venue_layout?.showActivityCapacity !== false,
        enableSearch: config.venue_layout?.enableSearch === true,
        compactOnMobile: config.venue_layout?.compactOnMobile !== false,
      });
      setActiveTab('theme');
    }
  }, [config]);

  const handleSave = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      const updates: UpdateEmbedConfigInput = {
        name: formData.name,
        description: formData.description || null,
        style: {
          ...config.style,
          widgetTheme: formData.widgetTheme,
          theme: formData.colorTheme,
          primaryColor: formData.primaryColor,
          borderRadius: formData.borderRadius,
          fontFamily: formData.fontFamily,
          layoutOrientation: formData.layoutOrientation,
          backgroundColor: formData.colorTheme === 'dark' ? '#1f2937' : '#ffffff',
          textColor: formData.colorTheme === 'dark' ? '#f9fafb' : '#111827',
        },
        config: {
          ...config.config,
          showPricing: formData.showPricing,
          showDescription: formData.showDescription,
        },
        display_options: {
          ...config.display_options,
          showActivityImages: formData.showActivityImage,
        },
      };

      // Add venue layout if it's a venue embed
      if (config.target_type === 'venue') {
        (updates as any).venue_layout = {
          displayMode: formData.displayMode,
          cardStyle: formData.cardStyle,
          gridColumns: formData.gridColumns,
          showActivityImage: formData.showActivityImage,
          showActivityPrice: formData.showPricing,
          showActivityDuration: formData.showActivityDuration,
          showActivityCapacity: formData.showActivityCapacity,
          enableSearch: formData.enableSearch,
          compactOnMobile: formData.compactOnMobile,
        };
      }

      await onSave(config.id, updates);
      toast.success('Embed updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update embed:', error);
      toast.error('Failed to update embed');
    } finally {
      setLoading(false);
    }
  };

  const applyThemePreset = (theme: ThemePreset) => {
    setFormData(prev => ({
      ...prev,
      widgetTheme: theme.id,
      primaryColor: theme.preview.primaryColor,
      borderRadius: theme.preview.borderRadius,
    }));
  };

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Edit Embed: {config.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 flex-shrink-0">
            <TabsTrigger value="theme" className="gap-1.5">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-1.5">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-1.5">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-1.5">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Theme Tab */}
            <TabsContent value="theme" className="mt-0 space-y-6">
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
                      <p className="text-xs text-gray-500 mt-0.5">
                        {theme.description}
                      </p>
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
                      onClick={() => setFormData(prev => ({ ...prev, colorTheme: value as EmbedTheme }))}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        formData.colorTheme === value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5',
                        formData.colorTheme === value ? 'text-blue-500' : 'text-gray-400'
                      )} />
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
                      onClick={() => setFormData(prev => ({ ...prev, primaryColor: color }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
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
                      onClick={() => setFormData(prev => ({ ...prev, borderRadius: value }))}
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
                <Select
                  value={formData.fontFamily}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, fontFamily: v }))}
                >
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
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="mt-0 space-y-6">
              {/* Orientation */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Layout Orientation</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, layoutOrientation: 'vertical' }))}
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
                    onClick={() => setFormData(prev => ({ ...prev, layoutOrientation: 'horizontal' }))}
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
              {config.target_type === 'venue' && (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Activity Display</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, displayMode: 'grid' }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          formData.displayMode === 'grid'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <LayoutGrid className="w-5 h-5" />
                        <span className="text-sm font-medium">Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, displayMode: 'list' }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          formData.displayMode === 'list'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <List className="w-5 h-5" />
                        <span className="text-sm font-medium">List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, displayMode: 'carousel' }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          formData.displayMode === 'carousel'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium">Carousel</span>
                      </button>
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
                            onClick={() => setFormData(prev => ({ ...prev, gridColumns: cols as 1 | 2 | 3 | 4 }))}
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
                      onValueChange={(v) => setFormData(prev => ({ ...prev, cardStyle: v as VenueCardStyle }))}
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
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Show Pricing</Label>
                    <p className="text-xs text-gray-500">Display prices on cards</p>
                  </div>
                  <Switch
                    checked={formData.showPricing}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showPricing: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Show Description</Label>
                    <p className="text-xs text-gray-500">Display activity descriptions</p>
                  </div>
                  <Switch
                    checked={formData.showDescription}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showDescription: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Show Images</Label>
                    <p className="text-xs text-gray-500">Display activity cover images</p>
                  </div>
                  <Switch
                    checked={formData.showActivityImage}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showActivityImage: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Show Duration</Label>
                    <p className="text-xs text-gray-500">Display activity duration</p>
                  </div>
                  <Switch
                    checked={formData.showActivityDuration}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showActivityDuration: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Show Capacity</Label>
                    <p className="text-xs text-gray-500">Display min-max players</p>
                  </div>
                  <Switch
                    checked={formData.showActivityCapacity}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showActivityCapacity: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Enable Search</Label>
                    <p className="text-xs text-gray-500">Show search box for activities</p>
                  </div>
                  <Switch
                    checked={formData.enableSearch}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSearch: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">Compact on Mobile</Label>
                    <p className="text-xs text-gray-500">Use compact layout on small screens</p>
                  </div>
                  <Switch
                    checked={formData.compactOnMobile}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compactOnMobile: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-0 space-y-4">
              <div>
                <Label htmlFor="name">Embed Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Homepage Booking Widget"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this embed"
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Show target info */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Type</span>
                  <span className="font-medium capitalize">{config.target_type}</span>
                </div>
                {config.activity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Activity</span>
                    <span className="font-medium">{config.activity.name}</span>
                  </div>
                )}
                {config.venue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Venue</span>
                    <span className="font-medium">{config.venue.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Embed Key</span>
                  <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {config.embed_key.slice(0, 20)}...
                  </code>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !formData.name.trim()}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmbedModal;
