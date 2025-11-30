'use client';

import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Building2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const OrgLogin = () => {
  const { theme } = useTheme();
  const { login, isLoading: authLoading } = useAuth();
  const isDark = theme === 'dark';

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const isBusy = loading || authLoading;

  // Styling
  const bgPage = isDark ? 'bg-[#161616]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#161616]' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';

  // Validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const identifier = email.trim();

    // Allow either email OR username
    if (!identifier) {
      newErrors.email = 'Email or username is required';
    } else if (identifier.includes('@') && !/\S+@\S+\.\S+/.test(identifier)) {
      // Only enforce email format if there is an '@'
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Avoid logging in before AuthContext has initialized Supabase client
    if (authLoading) return;

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Call the AuthContext login method
      // For Supabase, role is ignored as it's determined by the user record
      await login(email, password);

      toast.success('Successfully logged in');
      
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bgPage} flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${textPrimary}`}>
            Organization Login
          </h2>
          <p className={`mt-2 text-sm ${textSecondary}`}>
            Sign in to manage your organization and bookings
          </p>
        </div>

        {/* Login Card */}
        <div className={`${bgCard} rounded-2xl shadow-xl p-8 border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <form onSubmit={handleLogin} className="space-y-6">
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
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="email or username"
                className={`h-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                disabled={isBusy}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  onClick={() => window.location.href = '/forgot-password'}
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
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter your password"
                  className={`h-12 pr-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                  disabled={isBusy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className={`text-center text-sm ${textSecondary}`}>
          Need help?{' '}
          <a href="mailto:support@bookingtms.com" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrgLogin;
