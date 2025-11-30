/**
 * Reset Password Page
 * 
 * Allows users to set a new password after clicking the reset link.
 * Validates password strength before updating.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Lock, CheckCircle, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { passwordService } from '../services/password.service';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Styling
  const bgPage = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#161616]' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const allChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current URL parameters
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = url.searchParams;
        
        // Check multiple sources for recovery tokens
        const type = hashParams.get('type') || searchParams.get('type');
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
        
        console.log('[ResetPassword] URL params:', { type, hasAccessToken: !!accessToken, errorCode });
        
        // Handle error from Supabase
        if (errorCode) {
          const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
          setError(errorDesc || 'Invalid or expired reset link.');
          setCheckingSession(false);
          return;
        }
        
        // If we have tokens in URL, set the session
        if (accessToken && (type === 'recovery' || type === 'magiclink')) {
          console.log('[ResetPassword] Setting session from URL tokens...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error('[ResetPassword] Failed to set session:', sessionError);
            setError('Invalid or expired reset link. Please request a new one.');
            setCheckingSession(false);
            return;
          }
          
          if (data.session) {
            setValidSession(true);
            setCheckingSession(false);
            return;
          }
        }
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setValidSession(true);
        } else if (type === 'recovery') {
          // Recovery type without session - try to exchange tokens
          setValidSession(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
        }
      } catch (err) {
        console.error('[ResetPassword] Session check error:', err);
        setError('Unable to verify reset link');
      } finally {
        setCheckingSession(false);
      }
    };

    // Listen for auth state changes (Supabase will auto-handle tokens)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ResetPassword] Auth state changed:', event);
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
        setCheckingSession(false);
      }
    });

    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allChecksPassed) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await passwordService.updatePassword(password);

      if (result.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
      } else {
        setError(result.error || 'Failed to update password');
        toast.error(result.error || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/beta-login';
  };

  const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span className={passed ? 'text-green-600 dark:text-green-400' : textSecondary}>
        {label}
      </span>
    </div>
  );

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className={`min-h-screen ${bgPage} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPage} flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className={`${bgCard} rounded-2xl shadow-xl p-8 border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          {!validSession ? (
            /* Invalid Session State */
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                Invalid Reset Link
              </h2>
              <p className={`${textSecondary} mb-6`}>
                This password reset link is invalid or has expired.
              </p>
              <Button
                onClick={() => window.location.href = '/forgot-password'}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                Request New Link
              </Button>
            </div>
          ) : !success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                  Set New Password
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  Create a strong password for your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter new password"
                      className={`h-12 pr-10 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className={`text-sm font-medium ${textPrimary} mb-2`}>Password must have:</p>
                  <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
                  <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
                  <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
                  <PasswordCheck passed={passwordChecks.number} label="One number" />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Confirm new password"
                      className={`h-12 pr-10 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-red-500">Passwords do not match</p>
                  )}
                  {passwordsMatch && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Passwords match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !allChecksPassed || !passwordsMatch}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                Password Updated!
              </h2>
              <p className={`${textSecondary} mb-6`}>
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Button
                onClick={handleGoToLogin}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
