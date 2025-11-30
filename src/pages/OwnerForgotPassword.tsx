/**
 * Owner Forgot Password Page
 * 
 * Validates that email exists in organization_members before sending reset.
 * This prevents password reset attempts for non-organization users.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/layout/ThemeContext';
import { toast } from 'sonner';

export default function OwnerForgotPassword() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [venueName, setVenueName] = useState('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [venueNotFound, setVenueNotFound] = useState(false);

  // Fetch organization details
  useEffect(() => {
    if (!slug) {
      setVenueNotFound(true);
      return;
    }
    fetchOrganization();
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('organizations')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setVenueNotFound(true);
        return;
      }

      setOrganizationId(data.id);
      setVenueName(data.name);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setVenueNotFound(true);
    }
  };

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
      // Step 1: Verify email exists in organization_members for this organization
      const { data: memberData, error: memberError } = await (supabase as any)
        .from('organization_members')
        .select(`
          user_id,
          role,
          users!inner(email)
        `)
        .eq('organization_id', organizationId)
        .eq('users.email', email.toLowerCase())
        .single();

      if (memberError || !memberData) {
        setError('This email is not associated with this organization. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Step 2: Send password reset email via Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        setError('Failed to send reset email. Please try again.');
        toast.error('Failed to send reset email');
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success('Reset email sent!');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate(`/${slug}/admin/login`);
  };

  if (venueNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The organization you're trying to access doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{venueName ? `Forgot Password - ${venueName}` : 'Forgot Password'} | BookingTMS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="w-full max-w-md">
          {/* Back to Login */}
          <button
            onClick={handleBackToLogin}
            className={`flex items-center gap-2 mb-6 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login</span>
          </button>

          {/* Card */}
          <div className={`rounded-2xl shadow-xl p-8 border ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100'}`}>
            {!sent ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Forgot Password?
                  </h1>
                  {venueName && (
                    <p className={`text-lg mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {venueName}
                    </p>
                  )}
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter the email associated with your account and we'll send you a reset link.
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
                      placeholder="owner@example.com"
                      className={`h-12 ${isDark ? 'bg-[#161616] border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                      disabled={loading}
                    />
                    {error && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
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
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Check Your Email
                </h2>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  We've sent a password reset link to:
                  <br />
                  <span className="font-medium text-indigo-600">{email}</span>
                </p>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
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
          <p className={`text-center text-xs mt-6 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
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
    </>
  );
}
