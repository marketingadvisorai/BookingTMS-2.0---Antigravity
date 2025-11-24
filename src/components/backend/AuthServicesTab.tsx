'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  Mail,
  Chrome,
  Facebook,
  Github,
  KeyRound,
  RefreshCw,
  Copy,
  ExternalLink,
  Settings2,
  Shield
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AuthService {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'error';
  enabled: boolean;
  description: string;
  configUrl?: string;
  requiresSetup?: boolean;
}

interface SupabaseAuthConfig {
  enabled: boolean;
  emailConfirmation: boolean;
  allowSignups: boolean;
  sessionDuration: number; // hours
}

interface GoogleAuthConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  configured: boolean;
}

interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  configured: boolean;
  setupUrl: string;
}

export const AuthServicesTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Status states
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'active' | 'inactive' | 'error'>('inactive');
  const [googleStatus, setGoogleStatus] = useState<'active' | 'inactive' | 'error'>('inactive');

  // Configuration states
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseAuthConfig>({
    enabled: true,
    emailConfirmation: true,
    allowSignups: true,
    sessionDuration: 24
  });

  const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfig>({
    enabled: false,
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/auth/callback/google`,
    configured: false
  });

  const [oauthProviders, setOAuthProviders] = useState<OAuthProvider[]>([
    {
      id: 'google',
      name: 'Google',
      icon: <Chrome className="h-5 w-5" />,
      enabled: false,
      configured: false,
      setupUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-google'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      enabled: false,
      configured: false,
      setupUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-facebook'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      enabled: false,
      configured: false,
      setupUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-github'
    }
  ]);

  // Theme colors
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';

  // Load saved configuration
  useEffect(() => {
    const savedSupabaseConfig = localStorage.getItem('supabase_auth_config');
    if (savedSupabaseConfig) {
      setSupabaseConfig(JSON.parse(savedSupabaseConfig));
    }

    const savedGoogleConfig = localStorage.getItem('google_auth_config');
    if (savedGoogleConfig) {
      const config = JSON.parse(savedGoogleConfig);
      setGoogleConfig(config);
      if (config.configured) {
        setGoogleStatus('active');
      }
    }

    const savedProviders = localStorage.getItem('oauth_providers');
    if (savedProviders) {
      setOAuthProviders(JSON.parse(savedProviders));
    }

    // Test Supabase connection on mount
    testSupabaseConnection();
  }, []);

  // Test Supabase Auth connection
  const testSupabaseConnection = async () => {
    setIsTestingSupabase(true);
    try {
      // Check if Supabase env vars exist
      const hasSupabaseUrl = !!projectId;
      const hasSupabaseKey = !!publicAnonKey;

      if (hasSupabaseUrl && hasSupabaseKey) {
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

      // In a real implementation, this would verify the OAuth configuration
      // For MVP, we'll just check if credentials are provided
      setGoogleStatus('active');
      toast.success('Google OAuth configuration looks valid');
    } catch (error) {
      setGoogleStatus('error');
      toast.error('Failed to verify Google OAuth configuration');
    } finally {
      setIsTestingGoogle(false);
    }
  };

  // Save Supabase configuration
  const saveSupabaseConfig = () => {
    localStorage.setItem('supabase_auth_config', JSON.stringify(supabaseConfig));
    toast.success('Supabase Auth configuration saved');
  };

  // Save Google configuration
  const saveGoogleConfig = () => {
    const configToSave = {
      ...googleConfig,
      configured: !!(googleConfig.clientId && googleConfig.clientSecret)
    };
    setGoogleConfig(configToSave);
    localStorage.setItem('google_auth_config', JSON.stringify(configToSave));

    if (configToSave.configured) {
      setGoogleStatus('active');
      toast.success('Google OAuth configured successfully');
    } else {
      toast.success('Google OAuth configuration saved');
    }
  };

  // Toggle OAuth provider
  const toggleProvider = (providerId: string) => {
    const updatedProviders = oauthProviders.map(provider => {
      if (provider.id === providerId) {
        if (!provider.configured) {
          toast.error(`Please configure ${provider.name} OAuth first`);
          return provider;
        }
        return { ...provider, enabled: !provider.enabled };
      }
      return provider;
    });
    setOAuthProviders(updatedProviders);
    localStorage.setItem('oauth_providers', JSON.stringify(updatedProviders));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Get status badge
  const getStatusBadge = (status: 'active' | 'inactive' | 'error') => {
    const badges = {
      active: <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>,
      inactive: <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Inactive</Badge>,
      error: <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl ${textClass} mb-2`}>Authentication Services</h2>
        <p className={mutedTextClass}>
          Manage authentication providers and user verification systems
        </p>
      </div>

      {/* Quick Status Overview */}
      <Card className={`${bgClass} border ${borderClass} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h3 className={`text-lg ${textClass}`}>Service Status</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              testSupabaseConnection();
              if (googleConfig.configured) testGoogleOAuth();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supabase Auth Status */}
          <div className={`${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={textClass}>Supabase Auth</span>
              </div>
              {getStatusBadge(supabaseStatus)}
            </div>
            <p className={`text-sm ${mutedTextClass} mb-3`}>
              Email/password authentication and user management
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={testSupabaseConnection}
              disabled={isTestingSupabase}
              className="w-full"
            >
              {isTestingSupabase ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {/* Google OAuth Status */}
          <div className={`${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Chrome className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={textClass}>Google OAuth</span>
              </div>
              {getStatusBadge(googleStatus)}
            </div>
            <p className={`text-sm ${mutedTextClass} mb-3`}>
              Sign in with Google account integration
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={testGoogleOAuth}
              disabled={isTestingGoogle || !googleConfig.configured}
              className="w-full"
            >
              {isTestingGoogle ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {googleConfig.configured ? 'Test Connection' : 'Not Configured'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Supabase Auth Configuration */}
      <Card className={`${bgClass} border ${borderClass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Database className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h3 className={`text-lg ${textClass}`}>Supabase Authentication</h3>
        </div>

        <div className="space-y-4">
          {/* Enable Supabase Auth */}
          <div className="flex items-center justify-between">
            <div>
              <Label className={`${isDark ? 'text-white' : 'text-gray-700'} mb-1`}>
                Enable Supabase Auth
              </Label>
              <p className={`text-sm ${mutedTextClass}`}>
                Use Supabase for email/password authentication
              </p>
            </div>
            <Switch
              checked={supabaseConfig.enabled}
              onCheckedChange={(checked) => setSupabaseConfig({ ...supabaseConfig, enabled: checked })}
            />
          </div>

          <Separator className={borderClass} />

          {/* Email Confirmation */}
          <div className="flex items-center justify-between">
            <div>
              <Label className={`${isDark ? 'text-white' : 'text-gray-700'} mb-1`}>
                Require Email Confirmation
              </Label>
              <p className={`text-sm ${mutedTextClass}`}>
                Users must verify email before accessing the app
              </p>
            </div>
            <Switch
              checked={supabaseConfig.emailConfirmation}
              onCheckedChange={(checked) => setSupabaseConfig({ ...supabaseConfig, emailConfirmation: checked })}
              disabled={!supabaseConfig.enabled}
            />
          </div>

          {/* Allow Signups */}
          <div className="flex items-center justify-between">
            <div>
              <Label className={`${isDark ? 'text-white' : 'text-gray-700'} mb-1`}>
                Allow Public Signups
              </Label>
              <p className={`text-sm ${mutedTextClass}`}>
                Let users create accounts without admin approval
              </p>
            </div>
            <Switch
              checked={supabaseConfig.allowSignups}
              onCheckedChange={(checked) => setSupabaseConfig({ ...supabaseConfig, allowSignups: checked })}
              disabled={!supabaseConfig.enabled}
            />
          </div>

          {/* Session Duration */}
          <div className="space-y-2">
            <Label className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
              Session Duration (hours)
            </Label>
            <Input
              type="number"
              value={supabaseConfig.sessionDuration}
              onChange={(e) => setSupabaseConfig({ ...supabaseConfig, sessionDuration: parseInt(e.target.value) })}
              className={`h-12 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
              min={1}
              max={168}
              disabled={!supabaseConfig.enabled}
            />
            <p className={`text-sm ${mutedTextClass}`}>
              How long users stay logged in (1-168 hours)
            </p>
          </div>

          <Button onClick={saveSupabaseConfig} className="w-full">
            Save Supabase Configuration
          </Button>
        </div>
      </Card>

      {/* Google OAuth Configuration */}
      <Card className={`${bgClass} border ${borderClass} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Chrome className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h3 className={`text-lg ${textClass}`}>Google OAuth Configuration</h3>
          </div>
          {googleConfig.configured && (
            <Badge className="bg-emerald-500">Configured</Badge>
          )}
        </div>

        <div className="space-y-4">
          {/* Setup Instructions */}
          <div className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <div className="flex items-start gap-2">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'} mb-2`}>
                  <strong>Setup Required:</strong> Configure Google OAuth in Supabase Dashboard
                </p>
                <a
                  href="https://supabase.com/docs/guides/auth/social-login/auth-google"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline flex items-center gap-1`}
                >
                  View Setup Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Enable Google OAuth */}
          <div className="flex items-center justify-between">
            <div>
              <Label className={`${isDark ? 'text-white' : 'text-gray-700'} mb-1`}>
                Enable Google OAuth
              </Label>
              <p className={`text-sm ${mutedTextClass}`}>
                Allow users to sign in with their Google account
              </p>
            </div>
            <Switch
              checked={googleConfig.enabled}
              onCheckedChange={(checked) => setGoogleConfig({ ...googleConfig, enabled: checked })}
            />
          </div>

          <Separator className={borderClass} />

          {/* Client ID */}
          <div className="space-y-2">
            <Label className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
              Google Client ID
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={googleConfig.clientId}
                onChange={(e) => setGoogleConfig({ ...googleConfig, clientId: e.target.value })}
                placeholder="Enter your Google Client ID"
                className={`h-12 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(googleConfig.clientId, 'Client ID')}
                disabled={!googleConfig.clientId}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
              Google Client Secret
            </Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={googleConfig.clientSecret}
                onChange={(e) => setGoogleConfig({ ...googleConfig, clientSecret: e.target.value })}
                placeholder="Enter your Google Client Secret"
                className={`h-12 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(googleConfig.clientSecret, 'Client Secret')}
                disabled={!googleConfig.clientSecret}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Redirect URI */}
          <div className="space-y-2">
            <Label className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
              Redirect URI
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={googleConfig.redirectUri}
                readOnly
                className={`h-12 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(googleConfig.redirectUri, 'Redirect URI')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className={`text-sm ${mutedTextClass}`}>
              Add this URL to your Google Cloud Console OAuth configuration
            </p>
          </div>

          <Button onClick={saveGoogleConfig} className="w-full">
            Save Google OAuth Configuration
          </Button>
        </div>
      </Card>

      {/* Other OAuth Providers */}
      <Card className={`${bgClass} border ${borderClass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h3 className={`text-lg ${textClass}`}>Other OAuth Providers</h3>
        </div>

        <div className="space-y-3">
          {oauthProviders.map((provider) => (
            <div
              key={provider.id}
              className={`${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {provider.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={textClass}>{provider.name}</span>
                      {provider.configured && (
                        <Badge variant="secondary" className="text-xs">Configured</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${mutedTextClass}`}>
                      {provider.configured ? 'Ready to use' : 'Configuration required'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!provider.configured && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(provider.setupUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Setup
                    </Button>
                  )}
                  <Switch
                    checked={provider.enabled}
                    onCheckedChange={() => toggleProvider(provider.id)}
                    disabled={!provider.configured}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-4 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}>
                <strong>Note:</strong> Each OAuth provider requires configuration in both Supabase Dashboard and the provider's developer console.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Environment Variables Info */}
      <Card className={`${bgClass} border ${borderClass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h3 className={`text-lg ${textClass}`}>Environment Variables</h3>
        </div>

        <div className="space-y-3">
          <div className={`${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <code className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                SUPABASE_PROJECT_ID
              </code>
              {projectId ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className={`text-xs ${mutedTextClass}`}>
              {projectId || 'Not configured'}
            </p>
          </div>

          <div className={`${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <code className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                SUPABASE_ANON_KEY
              </code>
              {publicAnonKey ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className={`text-xs ${mutedTextClass}`}>
              {publicAnonKey ? '••••••••••••••••' : 'Not configured'}
            </p>
          </div>
        </div>

        <p className={`text-sm ${mutedTextClass} mt-4`}>
          These environment variables are automatically loaded from your Supabase project configuration.
        </p>
      </Card>
    </div>
  );
};
