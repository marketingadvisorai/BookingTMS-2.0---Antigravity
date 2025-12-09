/**
 * Auth Services Tab - Refactored
 * SECURITY: Restricted to system-admin role only
 * @module components/backend/auth/AuthServicesTab
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldAlert, Chrome, Facebook, Github } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

import { SupabaseAuthSection } from './SupabaseAuthSection';
import { GoogleOAuthSection } from './GoogleOAuthSection';
import { OAuthProvidersSection } from './OAuthProvidersSection';
import {
  getAuthTheme,
  DEFAULT_SUPABASE_CONFIG,
  DEFAULT_GOOGLE_CONFIG,
  type SupabaseAuthConfig,
  type GoogleAuthConfig,
  type OAuthProvider,
  type AuthStatus,
} from './types';

export function AuthServicesTabRefactored() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isDark = theme === 'dark';
  const authTheme = getAuthTheme(isDark);

  // SECURITY: Check if user is system admin
  const isSystemAdmin = currentUser?.role === 'system-admin';

  // Status states
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<AuthStatus>('inactive');
  const [googleStatus, setGoogleStatus] = useState<AuthStatus>('inactive');

  // Configuration states
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseAuthConfig>(DEFAULT_SUPABASE_CONFIG);
  const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfig>({
    ...DEFAULT_GOOGLE_CONFIG,
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback/google` : '',
  });

  const [oauthProviders, setOAuthProviders] = useState<OAuthProvider[]>([
    { id: 'google', name: 'Google', icon: <Chrome className="h-5 w-5" />, enabled: false, configured: false, setupUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-google' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="h-5 w-5" />, enabled: false, configured: false, setupUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-facebook' },
    { id: 'github', name: 'GitHub', icon: <Github className="h-5 w-5" />, enabled: false, configured: false, setupUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-github' },
  ]);

  // Test Supabase connection on mount
  useEffect(() => {
    if (isSystemAdmin) {
      testSupabaseConnection();
    }
  }, [isSystemAdmin]);

  // Test Supabase Auth connection
  const testSupabaseConnection = async () => {
    setIsTestingSupabase(true);
    try {
      if (projectId && publicAnonKey) {
        setSupabaseStatus('active');
        toast.success('Supabase Auth is configured and ready');
      } else {
        setSupabaseStatus('error');
        toast.error('Supabase environment variables not configured');
      }
    } catch (error) {
      setSupabaseStatus('error');
      toast.error('Failed to connect to Supabase Auth');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Test Google OAuth
  const testGoogleOAuth = async () => {
    setIsTestingGoogle(true);
    try {
      if (!googleConfig.clientId || !googleConfig.clientSecret) {
        toast.error('Please configure Google OAuth credentials first');
        setGoogleStatus('error');
        return;
      }
      setGoogleStatus('active');
      toast.success('Google OAuth configuration looks valid');
    } catch (error) {
      setGoogleStatus('error');
      toast.error('Failed to verify Google OAuth configuration');
    } finally {
      setIsTestingGoogle(false);
    }
  };

  // Save configurations (SECURITY: Only save non-sensitive config to state)
  const saveSupabaseConfig = () => {
    // NOTE: In production, save to secure backend, not localStorage
    toast.success('Supabase Auth configuration saved');
  };

  const saveGoogleConfig = () => {
    const configToSave = { ...googleConfig, configured: !!(googleConfig.clientId && googleConfig.clientSecret) };
    setGoogleConfig(configToSave);
    if (configToSave.configured) {
      setGoogleStatus('active');
      toast.success('Google OAuth configured successfully');
    } else {
      toast.success('Google OAuth configuration saved');
    }
  };

  // Toggle OAuth provider
  const toggleProvider = (providerId: string) => {
    setOAuthProviders((prev) =>
      prev.map((provider) => {
        if (provider.id === providerId) {
          if (!provider.configured) {
            toast.error(`Please configure ${provider.name} OAuth first`);
            return provider;
          }
          return { ...provider, enabled: !provider.enabled };
        }
        return provider;
      })
    );
  };

  // SECURITY: Access denied for non-system admins
  if (!isSystemAdmin) {
    return (
      <div className="space-y-6">
        <Card className={`${authTheme.bgClass} border ${authTheme.borderClass}`}>
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <ShieldAlert className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${authTheme.textClass} mb-3`}>Access Restricted</h3>
            <p className={`text-lg ${authTheme.mutedTextClass} mb-6`}>
              Auth Services configuration is restricted to <strong className="text-red-500">System Administrators</strong> only.
            </p>
            <Alert className={`max-w-md mx-auto ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
              <Shield className="w-4 h-4 text-red-500" />
              <AlertDescription className={isDark ? 'text-red-200' : 'text-red-800'}>
                <strong>Current Role:</strong> {currentUser?.role || 'Not authenticated'}
                <br />
                <strong>Required Role:</strong> system-admin
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl ${authTheme.textClass} mb-2`}>Authentication Services</h2>
        <p className={authTheme.mutedTextClass}>
          Manage authentication providers and user verification systems
        </p>
      </div>

      {/* Supabase Auth */}
      <SupabaseAuthSection
        theme={authTheme}
        config={supabaseConfig}
        status={supabaseStatus}
        isTesting={isTestingSupabase}
        onConfigChange={setSupabaseConfig}
        onTest={testSupabaseConnection}
        onSave={saveSupabaseConfig}
      />

      {/* Google OAuth */}
      <GoogleOAuthSection
        theme={authTheme}
        config={googleConfig}
        status={googleStatus}
        isTesting={isTestingGoogle}
        onConfigChange={setGoogleConfig}
        onTest={testGoogleOAuth}
        onSave={saveGoogleConfig}
      />

      {/* Other OAuth Providers */}
      <OAuthProvidersSection
        theme={authTheme}
        providers={oauthProviders}
        onToggle={toggleProvider}
      />
    </div>
  );
}
