/**
 * Media Module
 * @module media
 * 
 * Centralized media management with storage limits and external drive support
 * 
 * Features:
 * - File uploads with size validation (images: 5MB, videos: 15MB)
 * - Per-user storage limits (150MB default)
 * - Google Drive integration
 * - Multi-tenant architecture
 * - Usage tracking
 */

// Types
export * from './types';

// Services
export { mediaService, googleDriveService } from './services';

// Hooks
export { useMedia } from './hooks';

// Components
export { MediaUploader, MediaLibrary } from './components';
