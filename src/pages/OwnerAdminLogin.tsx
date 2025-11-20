import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/layout/ThemeContext';

export default function OwnerAdminLogin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [venueName, setVenueName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [venueNotFound, setVenueNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setVenueNotFound(true);
      return;
    }

    // Fetch venue name for display
    fetchVenueName();
  }, [slug]);

  const fetchVenueName = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setVenueNotFound(true);
        return;
      }

      setVenueName(data.name);
    } catch (err) {
      console.error('Error fetching venue:', err);
      setVenueNotFound(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Verify user is owner of this organization
      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations!inner(slug)')
        .eq('user_id', authData.user.id)
        .eq('organizations.slug', slug)
        .single();

      if (orgError || !orgData || orgData.role !== 'owner') {
        await supabase.auth.signOut();
        setError('You do not have owner access to this venue');
        setLoading(false);
        return;
      }

      // Success! Redirect to admin dashboard
      navigate(`/${slug}/admin/dashboard`);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate(`/${slug}/admin/forgot-password`);
  };

  if (venueNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The venue you're trying to access doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{venueName ? `${venueName} - Admin Login` : 'Admin Login'} | BookingTMS</title>
        <meta name="description" content={`Login to manage ${venueName}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Login Page */}
      <div className={`min-h-screen flex ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              BookingTMS
            </h1>
            <p className="text-xl text-indigo-100">
              Professional venue management platform
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Secure Access</h3>
                <p className="text-indigo-100 text-sm">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>

          <div className="text-indigo-100 text-sm">
            &copy; 2024 BookingTMS. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate(`/${slug}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Venue
            </Button>

            {/* Login Card */}
            <div className={`${isDark ? 'bg-[#161616] border border-[#333]' : 'bg-white border border-gray-200'} rounded-2xl shadow-xl p-8`}>
              {/* Header */}
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Admin Login
                </h2>
                {venueName && (
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {venueName}
                  </p>
                )}
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  Sign in to manage your venue
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@example.com"
                      required
                      className={`pl-11 h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-300'}`}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`pl-11 pr-11 h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-300'}`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#333]">
                <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Need help? Contact{' '}
                  <a href="mailto:support@bookingtms.com" className="text-indigo-600 hover:underline">
                    support@bookingtms.com
                  </a>
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-600">
                This is a secure admin area. All activity is monitored and logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
