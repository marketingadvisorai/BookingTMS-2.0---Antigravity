/**
 * Advanced Customization - Branding Section
 * @module embed-pro/components/advanced-customization/BrandingSection
 */

import React from 'react';
import { Palette, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Section } from './Section';

interface BrandingSectionProps {
  customLogo: string;
  setCustomLogo: (value: string) => void;
  customHeader: string;
  setCustomHeader: (value: string) => void;
  customFooter: string;
  setCustomFooter: (value: string) => void;
  customCss: string;
  setCustomCss: (value: string) => void;
  onSave: (updates: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

export const BrandingSection: React.FC<BrandingSectionProps> = ({
  customLogo,
  setCustomLogo,
  customHeader,
  setCustomHeader,
  customFooter,
  setCustomFooter,
  customCss,
  setCustomCss,
  onSave,
  isLoading = false,
}) => {
  return (
    <>
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
                onClick={() => onSave({ custom_logo_url: customLogo || null })}
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
              onClick={() => onSave({ custom_header: customHeader || null })}
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
              onClick={() => onSave({ custom_footer: customFooter || null })}
              disabled={isLoading}
            >
              Save Footer
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Custom CSS"
        description="Add custom styles to your widget"
        icon={<Code2 className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-2">
          <Label>CSS Styles</Label>
          <Textarea
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            placeholder={`.booking-widget { \n  /* Your custom styles */\n}`}
            className="font-mono text-sm"
            rows={8}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave({ custom_css: customCss || null })}
            disabled={isLoading}
          >
            Save CSS
          </Button>
          <p className="text-xs text-gray-500">
            Prefix selectors with .booking-widget to scope styles
          </p>
        </div>
      </Section>
    </>
  );
};

export default BrandingSection;
