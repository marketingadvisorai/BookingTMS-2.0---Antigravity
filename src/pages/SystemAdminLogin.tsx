/**
 * System Admin Login Page
 * 
 * Clean, simple login portal for system-admin, super-admin, and admin roles.
 * Uses real Supabase authentication.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../lib/auth/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type AdminRole = 'system-admin' | 'super-admin' | 'admin';

const SystemAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUsers } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Allowed roles for this login portal
  const allowedRoles: AdminRole[] = ['system-admin', 'super-admin', 'admin'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      // Attempt Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
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

      // Success
      if (refreshUsers) {
        await refreshUsers();
      }

      toast.success(`Welcome back, ${userProfile.full_name || email}!`);
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('[SystemAdminLogin] Exception:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Icon */}
      <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
        <Shield className="w-7 h-7 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        System Admin Login
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Sign in to manage your platform and settings
      </p>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="name@organization.com"
              className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Password</Label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </button>
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
                className="h-11 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
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
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
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
      <p className="text-gray-500 text-sm mt-8">
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
