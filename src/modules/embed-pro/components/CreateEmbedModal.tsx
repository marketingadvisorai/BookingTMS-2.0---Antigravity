/**
 * Embed Pro 1.1 - Create Embed Modal Component
 * @module embed-pro/components/CreateEmbedModal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
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

type Step = 'type' | 'target' | 'details';

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
      });
    }
  }, [open]);

  const handleNext = () => {
    if (step === 'type') setStep('target');
    else if (step === 'target') setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') setStep('target');
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
      });
      onClose();
    } catch (error) {
      console.error('Failed to create embed:', error);
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
    { key: 'type', label: 'Widget Type' },
    { key: 'target', label: 'Target' },
    { key: 'details', label: 'Details' },
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

          {step === 'details' ? (
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Embed
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={step === 'type' ? !canProceedFromType : !canProceedFromTarget}
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
