/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email.
 * Works with Supabase Auth for email delivery.
 */

'use client';

import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { passwordService } from '../services/password.service';

const ForgotPassword = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Styling
  const bgPage = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#161616]' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await passwordService.sendResetEmail(email);

      if (result.success) {
        setSent(true);
        toast.success('Reset email sent!');
      } else {
        setError(result.error || 'Failed to send reset email');
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/beta-login';
  };

  return (
    <div className={`min-h-screen ${bgPage} flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <button
          onClick={handleBackToLogin}
          className={`flex items-center gap-2 ${textSecondary} hover:${textPrimary} mb-6 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </button>

        {/* Card */}
        <div className={`${bgCard} rounded-2xl shadow-xl p-8 border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                  Forgot Password?
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="name@company.com"
                    className={`h-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                    disabled={loading}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
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
                Check Your Email
              </h2>
              <p className={`${textSecondary} mb-6`}>
                We've sent a password reset link to:
                <br />
                <span className="font-medium text-indigo-600">{email}</span>
              </p>
              <p className={`text-sm ${textSecondary} mb-6`}>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-indigo-600 hover:underline"
                >
                  try again
                </button>
              </p>
              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className={`text-center text-xs ${textSecondary} mt-6`}>
          Remember your password?{' '}
          <button
            onClick={handleBackToLogin}
            className="text-indigo-600 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
