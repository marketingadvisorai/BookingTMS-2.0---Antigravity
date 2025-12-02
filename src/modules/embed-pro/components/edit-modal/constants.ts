/**
 * Edit Embed Modal - Constants and Presets
 * @module embed-pro/components/edit-modal/constants
 */

import type { WidgetTheme } from '../../types/embed-config.types';

export interface ThemePreset {
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

export const WIDGET_THEMES: ThemePreset[] = [
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

export const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#dc2626',
  '#ea580c', '#0891b2', '#be185d', '#FF385C',
  '#6366F1', '#000000',
];

export const BORDER_RADIUS_OPTIONS = [
  { value: '0px', label: 'Square' },
  { value: '4px', label: 'Slight' },
  { value: '8px', label: 'Small' },
  { value: '12px', label: 'Medium' },
  { value: '16px', label: 'Large' },
  { value: '24px', label: 'Extra Large' },
];

export const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
];
