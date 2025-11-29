'use client';

import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const BetaLogin = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const isDark = theme === 'dark';

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ emailOrUsername?: string; password?: string }>({});

  // Styling - Match main login page
  const bgOverlay = isDark ? 'bg-black/50' : 'bg-black/30';
  const bgModal = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-[#161616]' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';
  const buttonHoverBg = isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50';

  // Demo credentials for testing (mock mode)
  const DEMO_CREDENTIALS = {
    'betaadmin': '123admin',
  };

  const validateForm = () => {
    const newErrors: { emailOrUsername?: string; password?: string } = {};
    if (!emailOrUsername.trim()) newErrors.emailOrUsername = 'Email or username is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const input = emailOrUsername.trim().toLowerCase();
      
      // Check if it's a demo username first
      if (DEMO_CREDENTIALS[input as keyof typeof DEMO_CREDENTIALS]) {
        if (password === DEMO_CREDENTIALS[input as keyof typeof DEMO_CREDENTIALS]) {
          await login(input, password, 'beta-owner');
          toast.success('Welcome to BookingTMS Beta!');
          window.location.href = '/dashboard';
          return;
        } else {
          toast.error('Invalid password for demo account');
          setLoading(false);
          return;
        }
      }

      // Check if input looks like an email - try Supabase auth
      if (input.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input,
          password: password,
        });

        if (error) {
          console.error('Supabase login error:', error);
          toast.error(error.message || 'Invalid email or password');
          setLoading(false);
          return;
        }

        if (data.user) {
          toast.success('Welcome to BookingTMS!');
          window.location.href = '/dashboard';
          return;
        }
      } else {
        // Not an email, not a recognized demo username
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className={`absolute inset-0 ${bgOverlay}`} />

      {/* Modal - Match main login design */}
      <div
        className={`relative ${bgModal} rounded-2xl shadow-2xl w-full max-w-md overflow-hidden`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={() => window.history.back()}
            className={`absolute top-4 right-4 ${textSecondary} ${buttonHoverBg} p-2 rounded-lg transition-colors`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
            Welcome to BookingTMS
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            Sign in to manage your venues, bookings, and business operations
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email or Username Field */}
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Email or Username
              </Label>
              <Input
                type="text"
                value={emailOrUsername}
                onChange={(e) => {
                  setEmailOrUsername(e.target.value);
                  if (errors.emailOrUsername) setErrors({ ...errors, emailOrUsername: undefined });
                }}
                placeholder="Enter your email or username"
                className={`h-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                disabled={loading}
              />
              {errors.emailOrUsername && (
                <p className="text-sm text-red-500">{errors.emailOrUsername}</p>
              )}
            </div>

            {/* Password Field with Visibility Toggle */}
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
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter your password"
                  className={`h-12 pr-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary} hover:${textPrimary} transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <button
                type="button"
                className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                onClick={() => window.location.href = '/forgot-password'}
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor}`}>
          <p className={`text-xs ${textSecondary} text-center`}>
            By continuing, you agree to our{' '}
            <button
              onClick={() => toast.info('Terms of Service')}
              className={isDark ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}
            >
              Terms
            </button>{' '}
            and have read our{' '}
            <button
              onClick={() => toast.info('Privacy Policy')}
              className={isDark ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetaLogin;
