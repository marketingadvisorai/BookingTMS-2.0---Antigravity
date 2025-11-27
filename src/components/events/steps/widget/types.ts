/**
 * Widget Embed Types
 * Type definitions for widget/embed step
 * 
 * @module widget/types
 */

import { ActivityData } from '../../types';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type CodeFormat = 'html' | 'react' | 'wordpress';

export interface DeviceConfig {
  width: string;
  scale: number;
  label: string;
  height: string;
}

export interface EmbedConfig {
  activityId: string;
  venueId: string;
  embedKey: string;
  primaryColor: string;
  theme: 'light' | 'dark';
  minHeight: number;
  maxHeight: number;
}

export interface WidgetEmbedProps {
  activityData: ActivityData;
  updateActivityData: (field: keyof ActivityData, value: any) => void;
  t: any;
  activityId?: string;
  venueId?: string;
  embedKey?: string;
  isEditMode?: boolean;
}

export interface UseWidgetEmbedReturn {
  // State
  copied: boolean;
  previewDevice: PreviewDevice;
  codeFormat: CodeFormat;
  primaryColor: string;
  theme: 'light' | 'dark';
  
  // Computed
  generatedCode: string;
  previewUrl: string;
  realEmbedUrl: string | null;
  canDownload: boolean;
  hasValidActivityId: boolean;
  
  // Setters
  setPreviewDevice: (device: PreviewDevice) => void;
  setCodeFormat: (format: CodeFormat) => void;
  setPrimaryColor: (color: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Actions
  copyToClipboard: () => Promise<void>;
  openFullPreview: () => void;
  downloadLandingPage: () => void;
  downloadEmbedHTML: () => void;
}

export const DEVICE_CONFIGS: Record<PreviewDevice, DeviceConfig> = {
  desktop: { width: '100%', scale: 0.55, label: 'Desktop', height: '600px' },
  tablet: { width: '768px', scale: 0.50, label: 'Tablet', height: '550px' },
  mobile: { width: '375px', scale: 0.45, label: 'Mobile', height: '500px' },
};
