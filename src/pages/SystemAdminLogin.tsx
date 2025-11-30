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

type AdminRole = 'system-admin' | 'super-admin' | 'admin';

const SystemAdminLogin: React.FC = () => {
  const [email, setEmail] = useState(''); // used as identifier: email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

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
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
      {/* Icon */}
      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
        <Shield className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
        System Admin Login
      </h1>
      <p className="text-gray-500 text-[15px] mb-8">
        Sign in to manage your platform and settings
      </p>

      {/* Login Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8">
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
            <Label className="text-gray-700 font-medium text-[14px]">Email or Username</Label>
            <Input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="email or username"
              className="h-[46px] bg-[#f8f9fa] border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg text-[15px]"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium text-[14px]">Password</Label>
              <a
                href="/forgot-password"
                className="text-[14px] text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your password"
                className="h-[46px] pr-10 bg-[#f8f9fa] border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg text-[15px]"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-[46px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-[15px] mt-2"
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
        </form>
      </div>

      {/* Help Link */}
      <p className="text-gray-500 text-[14px] mt-8">
        Need help?{' '}
        <a 
          href="mailto:support@bookingtms.com" 
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Contact Support
        </a>
      </p>
    </div>
  );
};

export default SystemAdminLogin;
