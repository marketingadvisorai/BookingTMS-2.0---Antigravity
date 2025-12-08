/**
 * System Admin Login Page
 * 
 * Clean, simple login portal for system-admin, super-admin, and admin roles.
 * Uses real Supabase authentication.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../components/layout/ThemeContext';

type AdminRole = 'system-admin' | 'super-admin' | 'admin';

const SystemAdminLogin: React.FC = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState(''); // used as identifier: email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const isDark = theme === 'dark';
  const bgPage = isDark ? 'bg-[#161616]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#161616]' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';

  // Allowed roles for this login portal
  const allowedRoles: AdminRole[] = ['system-admin', 'super-admin', 'admin'];

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Already logged in, redirect to dashboard
          window.location.href = '/dashboard';
          return;
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const identifier = email.trim();

      if (!identifier || !password) {
        setError('Email or username and password are required');
        setLoading(false);
        return;
      }

      // Resolve identifier to email (support username or email)
      let loginEmail = identifier;

      if (!identifier.includes('@')) {
        try {
          console.log('[SystemAdminLogin] Looking up email for username:', identifier);
          const { data: emailFromUsername, error: lookupError } = await (supabase as any)
            .rpc('get_email_by_username', { lookup_username: identifier.toLowerCase() });

          if (!lookupError && emailFromUsername) {
            loginEmail = emailFromUsername as string;
            console.log('[SystemAdminLogin] Found email for username:', loginEmail);
          } else {
            // Fallback: try username@bookingtms.com
            loginEmail = `${identifier}@bookingtms.com`;
            console.log('[SystemAdminLogin] Username not found, trying email:', loginEmail);
          }
        } catch (lookupErr) {
          console.warn('[SystemAdminLogin] Username lookup failed, falling back to direct email:', lookupErr);
          loginEmail = identifier.includes('@') ? identifier : `${identifier}@bookingtms.com`;
        }
      }

      // Attempt Supabase auth with resolved email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        console.error('[SystemAdminLogin] Auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Verify user role
      const { data: userProfileData, error: profileError } = await supabase
        .from('users')
        .select('role, full_name, is_active')
        .eq('id', authData.user.id)
        .single();

      const userProfile = userProfileData as { role: string; full_name: string | null; is_active: boolean } | null;

      if (profileError || !userProfile) {
        setError('User profile not found. Please contact support.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!userProfile.is_active) {
        setError('Your account has been deactivated');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!allowedRoles.includes(userProfile.role as AdminRole)) {
        setError(`Access denied. This portal is for administrators only.`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success - use window.location for full page reload to ensure auth state is fresh
      toast.success(`Welcome back, ${userProfile.full_name || email}!`);
      
      // Small delay to show toast, then redirect with full page reload
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (err: any) {
      console.error('[SystemAdminLogin] Exception:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className={`min-h-screen ${bgPage} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPage} flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${textPrimary}`}>
            System Admin Login
          </h2>
          <p className={`mt-2 text-sm ${textSecondary}`}>
            Sign in to manage your platform and settings
          </p>
        </div>

        {/* Login Card */}
        <div className={`${bgCard} rounded-2xl shadow-xl p-8 border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Email or Username
              </Label>
              <Input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="email or username"
                className={`h-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className={`h-12 pr-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className={`text-center text-sm ${textSecondary}`}>
          Need help?{' '}
          <a 
            href="mailto:support@bookingtms.com" 
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default SystemAdminLogin;
