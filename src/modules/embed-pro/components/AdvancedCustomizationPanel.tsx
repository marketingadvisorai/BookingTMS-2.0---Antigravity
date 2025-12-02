/**
 * Embed Pro - Advanced Customization Panel
 * @module embed-pro/components/AdvancedCustomizationPanel
 * 
 * Comprehensive customization options for embed widgets including:
 * - Branding (logo, colors, custom CSS)
 * - Display options (capacity warnings, social proof)
 * - Scheduling rules (advance booking, cutoff times)
 * - Custom fields (additional form inputs)
 * - Terms & conditions
 * - Conversion tracking (GA, FB Pixel)
 */

import React, { useState } from 'react';
import {
  Palette,
  Code2,
  FileText,
  Calendar,
  FormInput,
  Shield,
  BarChart3,
  Globe,
  Image,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/components/ui/utils';
import type {
  EmbedConfigWithRelations,
  UpdateEmbedConfigInput,
  CustomField,
  CustomFieldType,
  SocialLinks,
  SchedulingConfig,
  DisplayOptions,
  ConversionTracking,
} from '../types';

interface AdvancedCustomizationPanelProps {
  config: EmbedConfigWithRelations;
  onUpdate: (updates: UpdateEmbedConfigInput) => Promise<void>;
  isLoading?: boolean;
}

interface SectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({
  title,
  description,
  icon,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-4">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {icon}
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export const AdvancedCustomizationPanel: React.FC<AdvancedCustomizationPanelProps> = ({
  config,
  onUpdate,
  isLoading = false,
}) => {
  // Local state for form fields
  const [customCss, setCustomCss] = useState(config.custom_css || '');
  const [customLogo, setCustomLogo] = useState(config.custom_logo_url || '');
  const [customHeader, setCustomHeader] = useState(config.custom_header || '');
  const [customFooter, setCustomFooter] = useState(config.custom_footer || '');
  const [termsConditions, setTermsConditions] = useState(config.terms_conditions || '');
  const [termsRequired, setTermsRequired] = useState(config.terms_required || false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(config.social_links || {});
  const [customFields, setCustomFields] = useState<CustomField[]>(config.custom_fields || []);
  const [schedulingConfig, setSchedulingConfig] = useState<SchedulingConfig>(
    config.scheduling_config || {}
  );
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(
    config.display_options || {}
  );
  const [conversionTracking, setConversionTracking] = useState<ConversionTracking>(
    config.conversion_tracking || {}
  );
  const [allowedDomains, setAllowedDomains] = useState<string>(
    (config.allowed_domains || []).join('\n')
  );

  const handleSave = async (updates: Partial<UpdateEmbedConfigInput>) => {
    await onUpdate(updates);
  };

  // Custom field management
  const addCustomField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
    };
    setCustomFields([...customFields, newField]);
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], ...field };
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Branding & Appearance */}
      <Section
        title="Branding & Appearance"
        description="Custom logo, CSS, and visual tweaks"
        icon={<Palette className="w-4 h-4 text-blue-600" />}
        defaultOpen
      >
        <div className="space-y-4">
          <div>
            <Label>Custom Logo URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={customLogo}
                onChange={(e) => setCustomLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave({ custom_logo_url: customLogo || null })}
                disabled={isLoading}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 200x50px PNG or SVG with transparent background
            </p>
          </div>

          <div>
            <Label>Custom Header Text</Label>
            <Input
              value={customHeader}
              onChange={(e) => setCustomHeader(e.target.value)}
              placeholder="Welcome to our booking system"
              className="mt-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleSave({ custom_header: customHeader || null })}
              disabled={isLoading}
            >
              Save Header
            </Button>
          </div>

          <div>
            <Label>Custom Footer Text</Label>
            <Input
              value={customFooter}
              onChange={(e) => setCustomFooter(e.target.value)}
              placeholder="Questions? Call us at (555) 123-4567"
              className="mt-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleSave({ custom_footer: customFooter || null })}
              disabled={isLoading}
            >
              Save Footer
            </Button>
          </div>
        </div>
      </Section>

      {/* Display Options */}
      <Section
        title="Display Options"
        description="Control what's shown in the widget"
        icon={<Image className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Capacity Warning</Label>
              <p className="text-xs text-gray-500">Display "Only X spots left" message</p>
            </div>
            <Switch
              checked={displayOptions.showCapacityWarning || false}
              onCheckedChange={(checked) => {
                const updated = { ...displayOptions, showCapacityWarning: checked };
                setDisplayOptions(updated);
                handleSave({ display_options: updated });
              }}
            />
          </div>

          {displayOptions.showCapacityWarning && (
            <div>
              <Label>Warning Threshold</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={displayOptions.capacityWarningThreshold || 3}
                onChange={(e) => {
                  const updated = {
                    ...displayOptions,
                    capacityWarningThreshold: parseInt(e.target.value) || 3,
                  };
                  setDisplayOptions(updated);
                }}
                className="w-24 mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Show warning when spots fall below this number
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Waitlist Option</Label>
              <p className="text-xs text-gray-500">Allow customers to join waitlist for full slots</p>
            </div>
            <Switch
              checked={displayOptions.showWaitlist || false}
              onCheckedChange={(checked) => {
                const updated = { ...displayOptions, showWaitlist: checked };
                setDisplayOptions(updated);
                handleSave({ display_options: updated });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Promo Code Field</Label>
              <p className="text-xs text-gray-500">Display promo/discount code input</p>
            </div>
            <Switch
              checked={displayOptions.showPromoField || false}
              onCheckedChange={(checked) => {
                const updated = { ...displayOptions, showPromoField: checked };
                setDisplayOptions(updated);
                handleSave({ display_options: updated });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Social Proof</Label>
              <p className="text-xs text-gray-500">Display "X people booked today"</p>
            </div>
            <Switch
              checked={displayOptions.showSocialProof || false}
              onCheckedChange={(checked) => {
                const updated = { ...displayOptions, showSocialProof: checked };
                setDisplayOptions(updated);
                handleSave({ display_options: updated });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show "Powered by BookingTMS"</Label>
              <p className="text-xs text-gray-500">Display branding in widget footer</p>
            </div>
            <Switch
              checked={displayOptions.showPoweredBy !== false}
              onCheckedChange={(checked) => {
                const updated = { ...displayOptions, showPoweredBy: checked };
                setDisplayOptions(updated);
                handleSave({ display_options: updated });
              }}
            />
          </div>
        </div>
      </Section>

      {/* Scheduling Rules */}
      <Section
        title="Scheduling Rules"
        description="Control booking availability windows"
        icon={<Calendar className="w-4 h-4 text-blue-600" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Advance Days</Label>
            <Input
              type="number"
              min={0}
              max={365}
              value={schedulingConfig.minAdvanceDays || 0}
              onChange={(e) => {
                const updated = {
                  ...schedulingConfig,
                  minAdvanceDays: parseInt(e.target.value) || 0,
                };
                setSchedulingConfig(updated);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum days in advance to book
            </p>
          </div>

          <div>
            <Label>Max Advance Days</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={schedulingConfig.maxAdvanceDays || 90}
              onChange={(e) => {
                const updated = {
                  ...schedulingConfig,
                  maxAdvanceDays: parseInt(e.target.value) || 90,
                };
                setSchedulingConfig(updated);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum days in advance to book
            </p>
          </div>

          <div>
            <Label>Cutoff Hours</Label>
            <Input
              type="number"
              min={0}
              max={48}
              value={schedulingConfig.cutoffHours || 0}
              onChange={(e) => {
                const updated = {
                  ...schedulingConfig,
                  cutoffHours: parseInt(e.target.value) || 0,
                };
                setSchedulingConfig(updated);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hours before start time to stop accepting bookings
            </p>
          </div>

          <div>
            <Label>Buffer Minutes</Label>
            <Input
              type="number"
              min={0}
              max={120}
              value={schedulingConfig.bufferMinutes || 0}
              onChange={(e) => {
                const updated = {
                  ...schedulingConfig,
                  bufferMinutes: parseInt(e.target.value) || 0,
                };
                setSchedulingConfig(updated);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Buffer time between bookings
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <Label>Allow Same-Day Bookings</Label>
            <p className="text-xs text-gray-500">Let customers book for today</p>
          </div>
          <Switch
            checked={schedulingConfig.allowSameDay !== false}
            onCheckedChange={(checked) => {
              const updated = { ...schedulingConfig, allowSameDay: checked };
              setSchedulingConfig(updated);
            }}
          />
        </div>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => handleSave({ scheduling_config: schedulingConfig })}
          disabled={isLoading}
        >
          Save Scheduling Rules
        </Button>
      </Section>

      {/* Custom Fields */}
      <Section
        title="Custom Form Fields"
        description="Collect additional information from customers"
        icon={<FormInput className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          {customFields.map((field, index) => (
            <div
              key={field.id}
              className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      updateCustomField(index, {
                        label: e.target.value,
                        name: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                      })
                    }
                    placeholder="e.g., Company Name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value: CustomFieldType) =>
                      updateCustomField(index, { type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateCustomField(index, { required: checked })
                    }
                  />
                  <Label className="text-xs">Required</Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomField(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addCustomField}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>

          {customFields.length > 0 && (
            <Button
              onClick={() => handleSave({ custom_fields: customFields })}
              disabled={isLoading}
            >
              Save Custom Fields
            </Button>
          )}
        </div>
      </Section>

      {/* Terms & Conditions */}
      <Section
        title="Terms & Conditions"
        description="Require agreement before booking"
        icon={<FileText className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Require Terms Acceptance</Label>
              <p className="text-xs text-gray-500">
                Customers must agree before completing booking
              </p>
            </div>
            <Switch
              checked={termsRequired}
              onCheckedChange={(checked) => {
                setTermsRequired(checked);
                handleSave({ terms_required: checked });
              }}
            />
          </div>

          {termsRequired && (
            <div>
              <Label>Terms & Conditions Text</Label>
              <Textarea
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                placeholder="Enter your terms and conditions, cancellation policy, etc."
                rows={5}
                className="mt-1"
              />
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => handleSave({ terms_conditions: termsConditions || null })}
                disabled={isLoading}
              >
                Save Terms
              </Button>
            </div>
          )}
        </div>
      </Section>

      {/* Conversion Tracking */}
      <Section
        title="Conversion Tracking"
        description="Analytics and tracking integration"
        icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          <div>
            <Label>Google Analytics ID</Label>
            <Input
              value={conversionTracking.googleAnalyticsId || ''}
              onChange={(e) =>
                setConversionTracking({
                  ...conversionTracking,
                  googleAnalyticsId: e.target.value,
                })
              }
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Facebook Pixel ID</Label>
            <Input
              value={conversionTracking.facebookPixelId || ''}
              onChange={(e) =>
                setConversionTracking({
                  ...conversionTracking,
                  facebookPixelId: e.target.value,
                })
              }
              placeholder="XXXXXXXXXXXXXXXX"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Google Tag Manager ID</Label>
            <Input
              value={conversionTracking.googleTagManagerId || ''}
              onChange={(e) =>
                setConversionTracking({
                  ...conversionTracking,
                  googleTagManagerId: e.target.value,
                })
              }
              placeholder="GTM-XXXXXXX"
              className="mt-1"
            />
          </div>

          <Button
            onClick={() => handleSave({ conversion_tracking: conversionTracking })}
            disabled={isLoading}
          >
            Save Tracking Settings
          </Button>
        </div>
      </Section>

      {/* Domain Restrictions */}
      <Section
        title="Domain Restrictions"
        description="Limit where widget can be embedded"
        icon={<Globe className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          <div>
            <Label>Allowed Domains</Label>
            <Textarea
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              placeholder="example.com&#10;www.example.com&#10;booking.example.com"
              rows={4}
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              One domain per line. Leave empty to allow all domains.
            </p>
          </div>

          <Button
            onClick={() =>
              handleSave({
                allowed_domains: allowedDomains
                  .split('\n')
                  .map((d) => d.trim())
                  .filter(Boolean),
              })
            }
            disabled={isLoading}
          >
            Save Domain Restrictions
          </Button>
        </div>
      </Section>

      {/* Custom CSS */}
      <Section
        title="Custom CSS"
        description="Advanced styling for developers"
        icon={<Code2 className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          <div>
            <Label>Custom CSS Code</Label>
            <Textarea
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder={`.embed-widget {
  /* Your custom styles */
}

.embed-button {
  border-radius: 20px !important;
}`}
              rows={10}
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              CSS will be injected into the widget. Use !important to override default styles.
            </p>
          </div>

          <Button
            onClick={() => handleSave({ custom_css: customCss || null })}
            disabled={isLoading}
          >
            Save Custom CSS
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default AdvancedCustomizationPanel;
