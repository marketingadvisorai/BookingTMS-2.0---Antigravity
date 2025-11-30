'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase/client';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { X, Shield, UserCog, Users, User, Building2, Crown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'system-admin' | 'super-admin' | 'admin' | 'beta-owner' | 'manager' | 'staff' | 'customer' | null;

const Login = () => {
  const { theme } = useTheme();
  const { login, refreshUsers } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // State
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Styling
  const bgOverlay = isDark ? 'bg-black/50' : 'bg-black/30';
  const bgModal = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-[#161616]' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';
  const buttonHoverBg = isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50';

  // Role configurations
  const roles = [
    {
      id: 'system-admin' as UserRole,
      label: 'System Admin Login',
      description: 'Platform owner - manage all owners & venues',
      icon: Crown,
      color: isDark ? '#ef4444' : '#dc2626',
    },
    {
      id: 'super-admin' as UserRole,
      label: 'Super Admin Login',
      description: 'Full system access + user management',
      icon: Shield,
      color: isDark ? '#8b5cf6' : '#7c3aed',
    },
    {
      id: 'admin' as UserRole,
      label: 'Admin Login',
      description: 'Full operational access',
      icon: UserCog,
      color: isDark ? '#3b82f6' : '#2563eb',
    },
    {
      id: 'manager' as UserRole,
      label: 'Manager Login',
      description: 'View and limited edit access',
      icon: Users,
      color: isDark ? '#10b981' : '#059669',
    },
    {
      id: 'staff' as UserRole,
      label: 'Staff Login',
      description: 'Basic view-only access',
      icon: User,
      color: isDark ? '#6b7280' : '#4b5563',
    },
    {
      id: 'customer' as UserRole,
      label: 'Customer Login',
      description: 'Access your bookings and profile',
      icon: User,
      color: isDark ? '#ec4899' : '#db2777',
    },
  ];

  // Validation
  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrors({});
  };

  // Handle back to role selection
  const handleBack = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setErrors({});
  };

  // Handle login with real Supabase authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedRole) return;

    setLoading(true);

    try {
      // Determine if input is email or username
      let email = username;
      
      // If not an email format, try to look up by username
      if (!username.includes('@')) {
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .or(`email.ilike.${username}%,full_name.ilike.%${username}%`)
          .limit(1)
          .single();
        
        if (userData) {
          email = (userData as { email: string }).email;
        }
      }

      // Attempt Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[Login] Auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Verify user role matches selected role
      const { data: userProfileData } = await supabase
        .from('users')
        .select('role, full_name, is_active')
        .eq('id', authData.user.id)
        .single();

      const userProfile = userProfileData as { role: string; full_name: string | null; is_active: boolean } | null;

      if (!userProfile) {
        toast.error('User profile not found');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!userProfile.is_active) {
        toast.error('Your account has been deactivated');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Refresh auth context
      if (refreshUsers) {
        await refreshUsers();
      }

      toast.success(`Welcome back, ${userProfile.full_name || email}!`);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to forgot password

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className={`absolute inset-0 ${bgOverlay}`} />

      {/* Modal */}
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

          <h2 className={`text-2xl ${textPrimary} mb-2`}>
            {selectedRole ? 'Enter your credentials' : 'Log in to BookingTMS'}
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            {selectedRole
              ? `Sign in as ${roles.find((r) => r.id === selectedRole)?.label.replace(' Login', '')}`
              : 'Manage your bookings, customers, and business operations from one unified platform.'}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {!selectedRole ? (
            // Role Selection View
            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border ${borderColor} ${buttonHoverBg} transition-all group`}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: role.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${textPrimary} group-hover:${isDark ? 'text-blue-400' : 'text-blue-600'} transition-colors`}>
                        {role.label}
                      </div>
                      <div className={`text-sm ${textSecondary}`}>{role.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Login Form View
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email/Username Field */}
              <div className="space-y-2">
                <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Email or Username
                </Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  placeholder="Enter your email or username"
                  className={`h-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                  disabled={loading}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
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
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder="Enter your password"
                    className={`h-12 pr-10 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary} hover:${textPrimary}`}
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
                  className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  variant="outline"
                  className={`w-full h-12 ${borderColor} ${textPrimary} ${buttonHoverBg} rounded-xl transition-colors`}
                >
                  Back to Role Selection
                </Button>
              </div>

              {/* Forgot Password */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Admin Login Link */}
              <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                <button
                  type="button"
                  className={`text-sm ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} transition-colors flex items-center justify-center gap-2 mx-auto`}
                  onClick={() => navigate('/system-admin-login')}
                >
                  <Shield className="w-4 h-4" />
                  System Admin Portal
                </button>
              </div>
            </form>
          )}
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

export default Login;
