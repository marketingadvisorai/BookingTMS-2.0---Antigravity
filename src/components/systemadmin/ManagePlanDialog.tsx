'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useTheme } from '../layout/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Crown, CheckCircle, Save, X, Users, DollarSign, Plus, Trash2, GripVertical, Star, Percent, Tag } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ManagePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onSave?: (updatedPlan: any) => void;
}

interface DraggableFeatureItemProps {
  feature: string;
  index: number;
  moveFeature: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (index: number) => void;
  isDark: boolean;
  textClass: string;
  borderColor: string;
  secondaryBgClass: string;
}

const DraggableFeatureItem = ({
  feature,
  index,
  moveFeature,
  onRemove,
  isDark,
  textClass,
  borderColor,
  secondaryBgClass,
}: DraggableFeatureItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'FEATURE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'FEATURE',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveFeature(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  const scale = isOver ? 1.02 : 1;

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity, transform: `scale(${scale})`, transition: 'transform 0.2s' }}
      className={`p-3 rounded-lg border ${borderColor} ${secondaryBgClass} flex items-center justify-between cursor-move hover:${
        isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
      } transition-colors`}
    >
      <div className="flex items-center gap-2 flex-1">
        <GripVertical className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className={textClass}>{feature}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="text-red-600 hover:bg-red-600/10"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const ManagePlanDialog = ({ isOpen, onClose, plan, onSave }: ManagePlanDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  const [formData, setFormData] = useState({
    name: plan?.name || '',
    price: plan?.price || 0,
    subscribers: plan?.subscribers || 0,
    color: plan?.color || '#4f46e5',
    isFeatured: plan?.isFeatured || false,
    discountType: plan?.discount?.type || 'none',
    discountValue: plan?.discount?.value || 0,
  });

  const [features, setFeatures] = useState<string[]>(plan?.features || []);
  const [newFeature, setNewFeature] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const moveFeature = useCallback((dragIndex: number, hoverIndex: number) => {
    setFeatures((prevFeatures) => {
      const newFeatures = [...prevFeatures];
      const draggedFeature = newFeatures[dragIndex];
      newFeatures.splice(dragIndex, 1);
      newFeatures.splice(hoverIndex, 0, draggedFeature);
      return newFeatures;
    });
  }, []);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (features.length === 0) {
      toast.error('At least one feature is required');
      return;
    }
    if (formData.discountType !== 'none' && formData.discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    const updatedPlan = {
      ...plan,
      name: formData.name,
      price: formData.price,
      subscribers: formData.subscribers,
      color: formData.color,
      isFeatured: formData.isFeatured,
      discount: formData.discountType !== 'none' ? {
        type: formData.discountType,
        value: formData.discountValue,
      } : null,
      features,
    };

    if (onSave) {
      onSave(updatedPlan);
    }

    toast.success(`Plan "${formData.name}" has been updated`);
    onClose();
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} border ${borderColor} max-w-2xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" style={{ color: formData.color }} />
            <span className={textClass}>Manage {plan.name} Plan</span>
          </DialogTitle>
          <DialogDescription className={mutedTextClass}>
            Update plan details, pricing, and features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-4 h-4 ${mutedTextClass}`} />
                <span className={`text-sm ${mutedTextClass}`}>Active Subscribers</span>
              </div>
              <div className={`text-2xl ${textClass}`}>{formData.subscribers}</div>
            </div>
            <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${mutedTextClass}`} />
                <span className={`text-sm ${mutedTextClass}`}>Monthly Revenue</span>
              </div>
              <div className={`text-2xl ${textClass}`}>
                ${(formData.price * formData.subscribers).toLocaleString()}
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Plan Details */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Plan Details</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Plan Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="Basic"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Monthly Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="99"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="h-12 w-20"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className={`h-12 flex-1 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                      placeholder="#4f46e5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Featured & Discount Options */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Plan Options</h4>
            <div className="space-y-4">
              {/* Featured Toggle */}
              <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                      <Star className={`w-5 h-5 ${formData.isFeatured ? 'text-yellow-500 fill-yellow-500' : mutedTextClass}`} />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Featured / Most Popular</Label>
                      <p className={`text-sm mt-0.5 ${mutedTextClass}`}>
                        Display a featured badge to highlight this plan
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                </div>
              </div>

              {/* Discount Options */}
              <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass} space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                    <Tag className={`w-5 h-5 ${formData.discountType !== 'none' ? 'text-green-500' : mutedTextClass}`} />
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Discount Options</Label>
                    <p className={`text-sm mt-0.5 ${mutedTextClass}`}>
                      Apply a discount to this plan
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => handleInputChange('discountType', value)}
                    >
                      <SelectTrigger className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] ${textClass}`}>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent className={`${isDark ? 'bg-[#161616] border-[#333]' : 'bg-white border-gray-200'}`}>
                        <SelectItem value="none" className={isDark ? 'text-white hover:bg-[#1a1a1a]' : ''}>No Discount</SelectItem>
                        <SelectItem value="percentage" className={isDark ? 'text-white hover:bg-[#1a1a1a]' : ''}>
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Percentage Off
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed" className={isDark ? 'text-white hover:bg-[#1a1a1a]' : ''}>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Fixed Amount Off
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.discountType !== 'none' && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount ($)'}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        value={formData.discountValue}
                        onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                        className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                        placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                      />
                    </div>
                  )}
                </div>

                {formData.discountType !== 'none' && formData.discountValue > 0 && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-950/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                          Discounted Price:
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm line-through ${mutedTextClass}`}>${formData.price}/month</div>
                        <div className={`text-lg font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                          ${formData.discountType === 'percentage' 
                            ? (formData.price * (1 - formData.discountValue / 100)).toFixed(2)
                            : (formData.price - formData.discountValue).toFixed(2)
                          }/month
                        </div>
                        <div className={`text-xs ${isDark ? 'text-green-500' : 'text-green-600'}`}>
                          Save ${formData.discountType === 'percentage'
                            ? (formData.price * formData.discountValue / 100).toFixed(2)
                            : formData.discountValue.toFixed(2)
                          }/month
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Features */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Plan Features</h4>
            
            {/* Add New Feature */}
            <div className="flex gap-2 mb-4">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500 flex-1`}
                placeholder="Add a new feature..."
              />
              <Button
                onClick={handleAddFeature}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              {features.length === 0 ? (
                <div className={`p-8 rounded-lg border ${borderColor} ${secondaryBgClass} text-center`}>
                  <p className={mutedTextClass}>No features added yet</p>
                  <p className={`text-sm mt-2 ${mutedTextClass}`}>Add features above to get started</p>
                </div>
              ) : (
                <DndProvider backend={HTML5Backend}>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <DraggableFeatureItem
                        key={`${feature}-${index}`}
                        feature={feature}
                        index={index}
                        moveFeature={moveFeature}
                        onRemove={handleRemoveFeature}
                        isDark={isDark}
                        textClass={textClass}
                        borderColor={borderColor}
                        secondaryBgClass={secondaryBgClass}
                      />
                    ))}
                  </div>
                </DndProvider>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
            <h4 className={`text-sm uppercase tracking-wider mb-3 ${mutedTextClass}`}>Preview</h4>
            <div className={`p-6 rounded-lg border ${borderColor} bg-white dark:bg-[#161616] relative`}>
              {/* Featured Badge */}
              {formData.isFeatured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 px-3 py-1 shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`${textClass} flex items-center gap-2`}>
                    {formData.name || 'Plan Name'}
                  </h3>
                  <div className="mt-2">
                    {formData.discountType !== 'none' && formData.discountValue > 0 ? (
                      <div>
                        <div className={`text-sm line-through ${mutedTextClass}`}>
                          ${formData.price}/month
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl ${textClass}`}>
                            ${formData.discountType === 'percentage' 
                              ? (formData.price * (1 - formData.discountValue / 100)).toFixed(2)
                              : (formData.price - formData.discountValue).toFixed(2)
                            }
                          </span>
                          <span className={mutedTextClass}>/month</span>
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          Save {formData.discountType === 'percentage' 
                            ? `${formData.discountValue}%` 
                            : `$${formData.discountValue}`
                          }
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-3xl ${textClass}`}>${formData.price}</span>
                        <span className={mutedTextClass}>/month</span>
                      </div>
                    )}
                  </div>
                </div>
                <Crown className="w-6 h-6" style={{ color: formData.color }} />
              </div>
              <div className="space-y-2">
                {features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className={`text-sm ${mutedTextClass}`}>{feature}</span>
                  </div>
                ))}
                {features.length > 3 && (
                  <p className={`text-sm ${mutedTextClass} pl-6`}>+ {features.length - 3} more features</p>
                )}
              </div>
            </div>
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
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
