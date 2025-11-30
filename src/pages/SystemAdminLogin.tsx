/**
 * System Admin Login Page
 * 
 * Dedicated login portal for system-admin, super-admin, and admin roles.
 * Uses real Supabase authentication (not mock/demo).
 * 
 * Features:
 * - Email or username login
 * - Password reset link
 * - Role verification after login
 * - Remember me option
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../lib/auth/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Shield, 
  Loader2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle,
  ArrowLeft,
  Crown,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';

type AdminRole = 'system-admin' | 'super-admin' | 'admin';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

const SystemAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUsers } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrUsername: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Allowed roles for this login portal
  const allowedRoles: AdminRole[] = ['system-admin', 'super-admin', 'admin'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { emailOrUsername, password } = formData;

      if (!emailOrUsername.trim() || !password) {
        setError('Email/username and password are required');
        setLoading(false);
        return;
      }

      // Determine if input is email or username
      let email = emailOrUsername;
      
      // If not an email format, try to look up by username (which is the email)
      if (!emailOrUsername.includes('@')) {
        // Try to find user by searching users table
        const { data: userData, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .or(`email.ilike.${emailOrUsername}%,full_name.ilike.%${emailOrUsername}%`)
          .limit(1)
          .single();
        
        if (lookupError || !userData) {
          // If not found, assume the input might be an email without @ (partial)
          // or just use it as-is for the error message
          setError('User not found. Please use your email address.');
          setLoading(false);
          return;
        }
        email = (userData as { email: string }).email;
      }

      // Attempt Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[SystemAdminLogin] Auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address first.');
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

      // Check if user is active
      if (!userProfile.is_active) {
        setError('Your account has been deactivated. Please contact support.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Check if role is allowed for this portal
      if (!allowedRoles.includes(userProfile.role as AdminRole)) {
        setError(`Access denied. This portal is for System Admins only. Your role: ${userProfile.role}`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success! Refresh the auth context
      if (refreshUsers) {
        await refreshUsers();
      }

      toast.success(`Welcome back, ${userProfile.full_name || email}!`);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('[SystemAdminLogin] Exception:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!resetEmail.trim() || !resetEmail.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system-admin': return Crown;
      case 'super-admin': return Shield;
      default: return UserCog;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute -top-12 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to main login</span>
        </button>

        {/* Login Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">System Admin Portal</h1>
            <p className="text-indigo-200 text-sm mt-1">
              Secure access for platform administrators
            </p>
          </div>

          {/* Role Badges */}
          <div className="flex justify-center gap-2 -mt-3 px-6">
            {allowedRoles.map(role => {
              const Icon = getRoleIcon(role);
              return (
                <div
                  key={role}
                  className="bg-gray-700 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-gray-300 border border-gray-600"
                >
                  <Icon className="w-3 h-3" />
                  {role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="p-6">
            {!showForgotPassword ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Email/Username Field */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Email or Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      name="emailOrUsername"
                      type="text"
                      value={formData.emailOrUsername}
                      onChange={handleInputChange}
                      placeholder="Enter your email or username"
                      className="pl-10 h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: !!checked }))}
                      className="border-gray-600 data-[state=checked]:bg-indigo-600"
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError(null);
                    }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
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
            ) : (
              // Forgot Password Form
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                    setError(null);
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to login</span>
                </button>

                {resetSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
                    <p className="text-gray-400 text-sm">
                      We've sent a password reset link to <strong className="text-white">{resetEmail}</strong>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Reset Password</h3>
                    <p className="text-gray-400 text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-gray-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-10 h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              This portal is restricted to authorized administrators only.
              <br />
              All login attempts are logged for security.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@bookingtms.com" className="text-indigo-400 hover:underline">
            support@bookingtms.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default SystemAdminLogin;
