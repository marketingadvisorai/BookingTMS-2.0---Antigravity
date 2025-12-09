/**
 * Auth Services Module Exports
 * @module components/backend/auth
 */

export { SupabaseAuthSection } from './SupabaseAuthSection';
export { GoogleOAuthSection } from './GoogleOAuthSection';
export { OAuthProvidersSection } from './OAuthProvidersSection';
export { AuthServicesTabRefactored as AuthServicesTab } from './AuthServicesTabRefactored';

export { getAuthTheme, DEFAULT_SUPABASE_CONFIG, DEFAULT_GOOGLE_CONFIG } from './types';
export type {
  AuthService,
  SupabaseAuthConfig,
  GoogleAuthConfig,
  OAuthProvider,
  AuthStatus,
  AuthTheme,
} from './types';
