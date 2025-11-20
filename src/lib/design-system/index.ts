/**
 * @file index.ts
 * @description Design system exports - centralized styling utilities
 * @module lib/design-system
 * 
 * @purpose
 * Single import point for all design system utilities
 * 
 * @usage
 * import { Typography, getTypography } from '@/lib/design-system';
 */

export {
  getTypography,
  getPaymentSectionStyles,
  getIconColor,
  getBadgeClasses,
  getMetricCardClasses,
  Typography,
  type TypographyConfig,
} from './typography';
