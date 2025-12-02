/**
 * Embed Pro 2.0 - Create Embed Modal Component
 * @module embed-pro/components/CreateEmbedModal
 * 
 * Multi-step wizard for creating embed configurations with theme customization.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Sun, 
  Moon, 
  Monitor,
  Palette,
  Type,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { EmbedTypeSelector } from './EmbedTypeSelector';
import { 
  type EmbedType, 
  type TargetType, 
  type EmbedTheme,
  type CreateEmbedConfigInput,
  TARGET_TYPES,
} from '../types';

interface CreateEmbedModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateEmbedConfigInput) => Promise<void>;
  organizationId: string;
  activities?: { id: string; name: string }[];
  venues?: { id: string; name: string }[];
}

type Step = 'type' | 'target' | 'details' | 'style';

// Preset colors for the color picker
const PRESET_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Green
  '#dc2626', // Red
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#4f46e5', // Indigo
  '#000000', // Black
];

// Border radius options
const BORDER_RADIUS_OPTIONS = [
  { value: '0px', label: 'Square' },
  { value: '4px', label: 'Slight' },
  { value: '8px', label: 'Small' },
  { value: '12px', label: 'Medium' },
  { value: '16px', label: 'Large' },
  { value: '24px', label: 'Extra Large' },
];

// Font family options
const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter (Default)' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
];

export const CreateEmbedModal: React.FC<CreateEmbedModalProps> = ({
  open,
  onClose,
  onCreate,
  organizationId,
  activities = [],
  venues = [],
}) => {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'booking-widget' as EmbedType,
    target_type: 'activity' as TargetType,
    target_id: '',
    // Style options
    theme: 'light' as EmbedTheme,
    primaryColor: '#2563eb',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep('type');
      setFormData({
        name: '',
        description: '',
        type: 'booking-widget',
        target_type: 'activity',
        target_id: '',
        theme: 'light',
        primaryColor: '#2563eb',
        borderRadius: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
      });
    }
  }, [open]);

  const handleNext = () => {
    if (step === 'type') setStep('target');
    else if (step === 'target') {
      // Auto-populate name from selected target
      if (!formData.name) {
        let autoName = '';
        if (formData.target_type === 'activity' && formData.target_id) {
          const activity = activities.find(a => a.id === formData.target_id);
          if (activity) autoName = `${activity.name} Booking Widget`;
        } else if (formData.target_type === 'venue' && formData.target_id) {
          const venue = venues.find(v => v.id === formData.target_id);
          if (venue) autoName = `${venue.name} Booking Widget`;
        }
        if (autoName) {
          setFormData(prev => ({ ...prev, name: autoName }));
        }
      }
      setStep('details');
    }
    else if (step === 'details') setStep('style');
  };

  const handleBack = () => {
    if (step === 'style') setStep('details');
    else if (step === 'details') setStep('target');
    else if (step === 'target') setStep('type');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onCreate({
        organization_id: organizationId,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        target_type: formData.target_type,
        target_id: formData.target_id || undefined,
        style: {
          primaryColor: formData.primaryColor,
          secondaryColor: '#6b7280',
          backgroundColor: formData.theme === 'dark' ? '#1f2937' : '#ffffff',
          textColor: formData.theme === 'dark' ? '#f9fafb' : '#111827',
          borderRadius: formData.borderRadius,
          fontFamily: formData.fontFamily,
          buttonStyle: 'filled',
          theme: formData.theme,
          shadow: 'md',
          padding: '16px',
        },
      });
      toast.success('Embed created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to create embed:', error);
      const message = error?.message || 'Failed to create embed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromType = !!formData.type;
  
  // Require a target selection - can't proceed if no target is selected or no items to select from
  const canProceedFromTarget = (() => {
    if (formData.target_type === 'venue') {
      return venues.length > 0 && !!formData.target_id;
    } else if (formData.target_type === 'activity') {
      return activities.length > 0 && !!formData.target_id;
    } else if (formData.target_type === 'multi-activity') {
      // Multi-activity doesn't require specific selection in this step
      return activities.length > 0;
    }
    return false;
  })();
  
  const canSubmit = !!formData.name.trim();

  const stepIndicators = [
    { key: 'type', label: 'Type' },
    { key: 'target', label: 'Target' },
    { key: 'details', label: 'Details' },
    { key: 'style', label: 'Style' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Embed</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {stepIndicators.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                step === s.key 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-400'
              )}>
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                  step === s.key ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                )}>
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < stepIndicators.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <EmbedTypeSelector
                value={formData.type}
                onChange={(type) => setFormData(prev => ({ ...prev, type }))}
              />
            </motion.div>
          )}

          {step === 'target' && (
            <motion.div
              key="target"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label>Target Type</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(v) => setFormData(prev => ({ 
                    ...prev, 
                    target_type: v as TargetType,
                    target_id: '' 
                  }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.target_type === 'activity' && (
                <div>
                  <Label>Select Activity</Label>
                  {activities.length === 0 ? (
                    <div className="mt-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        No activities found for this organization. Please create an activity first.
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={formData.target_id}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, target_id: v }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose an activity" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {activities.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {formData.target_type === 'venue' && (
                <div>
                  <Label>Select Venue</Label>
                  {venues.length === 0 ? (
                    <div className="mt-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        No venues found for this organization. Please create a venue first.
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={formData.target_id}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, target_id: v }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a venue" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {venues.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
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
            </motion.div>
          )}

          {step === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Theme Selector */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4" />
                  Theme
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'auto', icon: Monitor, label: 'Auto' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, theme: value as EmbedTheme }))}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        formData.theme === value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5',
                        formData.theme === value ? 'text-blue-500' : 'text-gray-400'
                      )} />
                      <span className={cn(
                        'text-sm font-medium',
                        formData.theme === value ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600'
                      )}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4" />
                  Primary Color
                </Label>
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
                  <label className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
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
                <Label className="flex items-center gap-2 mb-3">
                  <Square className="w-4 h-4" />
                  Border Radius
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {BORDER_RADIUS_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, borderRadius: value }))}
                      className={cn(
                        'px-3 py-2 text-sm rounded-lg border transition-all',
                        formData.borderRadius === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4" />
                  Font Family
                </Label>
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

              {/* Live Preview */}
              <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-3">Preview</p>
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: formData.theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderRadius: formData.borderRadius,
                    fontFamily: formData.fontFamily,
                  }}
                >
                  <h4 
                    className="font-semibold mb-2"
                    style={{ color: formData.theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Book Now
                  </h4>
                  <button
                    className="w-full py-2 px-4 text-white font-medium"
                    style={{ 
                      backgroundColor: formData.primaryColor,
                      borderRadius: formData.borderRadius,
                    }}
                  >
                    Select Date
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={step === 'type' ? onClose : handleBack}
          >
            {step === 'type' ? 'Cancel' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {step === 'style' ? (
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Embed
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={
                step === 'type' ? !canProceedFromType : 
                step === 'target' ? !canProceedFromTarget :
                step === 'details' ? !canSubmit : false
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmbedModal;
