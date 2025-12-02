/**
 * Advanced Customization - State Hook
 * @module embed-pro/components/advanced-customization/useAdvancedCustomization
 */

import { useState, useCallback } from 'react';
import type {
  EmbedConfigWithRelations,
  UpdateEmbedConfigInput,
  CustomField,
  SocialLinks,
  SchedulingConfig,
  DisplayOptions,
  ConversionTracking,
} from '../../types';

export interface AdvancedCustomizationState {
  customCss: string;
  customLogo: string;
  customHeader: string;
  customFooter: string;
  termsConditions: string;
  termsRequired: boolean;
  socialLinks: SocialLinks;
  customFields: CustomField[];
  schedulingConfig: SchedulingConfig;
  displayOptions: DisplayOptions;
  conversionTracking: ConversionTracking;
  allowedDomains: string;
}

export function useAdvancedCustomization(
  config: EmbedConfigWithRelations,
  onUpdate: (updates: UpdateEmbedConfigInput) => Promise<void>
) {
  const [state, setState] = useState<AdvancedCustomizationState>({
    customCss: config.custom_css || '',
    customLogo: config.custom_logo_url || '',
    customHeader: config.custom_header || '',
    customFooter: config.custom_footer || '',
    termsConditions: config.terms_conditions || '',
    termsRequired: config.terms_required || false,
    socialLinks: config.social_links || {},
    customFields: config.custom_fields || [],
    schedulingConfig: config.scheduling_config || {},
    displayOptions: config.display_options || {},
    conversionTracking: config.conversion_tracking || {},
    allowedDomains: (config.allowed_domains || []).join('\n'),
  });

  const handleSave = useCallback(
    async (updates: Partial<UpdateEmbedConfigInput>) => {
      await onUpdate(updates);
    },
    [onUpdate]
  );

  const setField = useCallback(<K extends keyof AdvancedCustomizationState>(
    key: K,
    value: AdvancedCustomizationState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Custom field management
  const addCustomField = useCallback(() => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
    };
    setState(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  }, []);

  const updateCustomField = useCallback((index: number, field: Partial<CustomField>) => {
    setState(prev => {
      const updated = [...prev.customFields];
      updated[index] = { ...updated[index], ...field };
      return { ...prev, customFields: updated };
    });
  }, []);

  const removeCustomField = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    ...state,
    setField,
    handleSave,
    addCustomField,
    updateCustomField,
    removeCustomField,
  };
}

export default useAdvancedCustomization;
