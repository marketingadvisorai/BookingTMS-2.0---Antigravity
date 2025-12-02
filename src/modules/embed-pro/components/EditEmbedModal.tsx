/**
 * Embed Pro 2.0 - Edit Embed Modal
 * @module embed-pro/components/EditEmbedModal
 * 
 * Main modal component for editing embed configurations.
 * Uses modular tab components for cleaner code organization.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Palette, Layout, Eye, Settings, Type } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import type { EmbedConfigWithRelations, UpdateEmbedConfigInput } from '../types';
import { ThemeTab, LayoutTab, DisplayTab, DetailsTab, DEFAULT_FORM_DATA } from './edit-modal';
import type { EditFormData } from './edit-modal';

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
// HELPER: Initialize form from config
// =====================================================

const initializeForm = (config: EmbedConfigWithRelations): EditFormData => ({
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

// =====================================================
// HELPER: Build update payload
// =====================================================

const buildUpdatePayload = (
  config: EmbedConfigWithRelations,
  formData: EditFormData
): UpdateEmbedConfigInput => {
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

  // Add venue layout for venue embeds
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

  return updates;
};

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
  const [formData, setFormData] = useState<EditFormData>(DEFAULT_FORM_DATA);

  // Initialize form when config changes
  useEffect(() => {
    if (config) {
      setFormData(initializeForm(config));
      setActiveTab('theme');
    }
  }, [config]);

  // Form update handler
  const handleChange = useCallback((updates: Partial<EditFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Save handler
  const handleSave = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      const updates = buildUpdatePayload(config, formData);
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

  if (!config) return null;

  const isVenue = config.target_type === 'venue';

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
            <TabsContent value="theme" className="mt-0">
              <ThemeTab formData={formData} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              <LayoutTab formData={formData} onChange={handleChange} isVenue={isVenue} />
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <DisplayTab formData={formData} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="details" className="mt-0">
              <DetailsTab formData={formData} config={config} onChange={handleChange} />
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
