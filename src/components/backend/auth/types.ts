/**
 * Auth Services Types
 * @module components/backend/auth/types
 */

import React from 'react';

export interface AuthService {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'error';
  enabled: boolean;
  description: string;
  configUrl?: string;
  requiresSetup?: boolean;
}

export interface SupabaseAuthConfig {
  enabled: boolean;
  emailConfirmation: boolean;
  allowSignups: boolean;
  sessionDuration: number; // hours
}

export interface GoogleAuthConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  configured: boolean;
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  configured: boolean;
  setupUrl: string;
}

export type AuthStatus = 'active' | 'inactive' | 'error';

export interface AuthTheme {
  isDark: boolean;
  bgClass: string;
  textClass: string;
  mutedTextClass: string;
  borderClass: string;
}

export function getAuthTheme(isDark: boolean): AuthTheme {
  return {
    isDark,
    bgClass: isDark ? 'bg-[#161616]' : 'bg-white',
    textClass: isDark ? 'text-white' : 'text-gray-900',
    mutedTextClass: isDark ? 'text-gray-400' : 'text-gray-600',
    borderClass: isDark ? 'border-gray-800' : 'border-gray-200',
  };
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseAuthConfig = {
  enabled: true,
  emailConfirmation: true,
  allowSignups: true,
  sessionDuration: 24,
};

export const DEFAULT_GOOGLE_CONFIG: GoogleAuthConfig = {
  enabled: false,
  clientId: '',
  clientSecret: '',
  redirectUri: '',
  configured: false,
};
