/**
 * Waivers Module
 * Enterprise-grade waiver management system
 * 
 * @module waivers
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * import { useWaivers, WaiversPage, templateService } from '@/modules/waivers';
 * 
 * // Use the hook
 * const { templates, waivers, createTemplate } = useWaivers();
 * 
 * // Or use services directly
 * const templates = await templateService.list({ organizationId });
 * ```
 */

// Types
export * from './types';

// Utils
export * from './utils/mappers';

// Services
export { templateService, waiverService } from './services';
export type { ListTemplatesOptions, ListWaiversOptions } from './services';

// Hooks
export { useWaivers } from './hooks/useWaivers';
export type { UseWaiversOptions, UseWaiversReturn } from './hooks/useWaivers';

// Components
export {
  WaiverStatsCards,
  TemplateList,
  WaiverTable,
  TemplateEditorDialog,
} from './components';

// Pages
export { WaiversPage } from './pages/WaiversPage';
