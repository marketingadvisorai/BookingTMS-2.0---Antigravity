/**
 * Demo Login Page
 * 
 * Role-based demo login for testing purposes.
 * Access at /demo-login
 * 
 * This is separate from real authentication flows.
 */

'use client';

import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { X, Shield, UserCog, Users, User, Crown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'system-admin' | 'super-admin' | 'admin' | 'beta-owner' | 'manager' | 'staff' | 'customer' | null;

const DemoLogin = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
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
      label: 'System Admin',
      description: 'Platform owner - manage all owners & venues',
      icon: Crown,
      color: isDark ? '#ef4444' : '#dc2626',
    },
    {
      id: 'super-admin' as UserRole,
      label: 'Super Admin',
      description: 'Full system access + user management',
      icon: Shield,
      color: isDark ? '#8b5cf6' : '#7c3aed',
    },
    {
      id: 'admin' as UserRole,
      label: 'Admin',
      description: 'Full operational access',
      icon: UserCog,
      color: isDark ? '#3b82f6' : '#2563eb',
    },
    {
      id: 'manager' as UserRole,
      label: 'Manager',
      description: 'View and limited edit access',
      icon: Users,
      color: isDark ? '#10b981' : '#059669',
    },
    {
      id: 'staff' as UserRole,
      label: 'Staff',
      description: 'Basic view-only access',
      icon: User,
      color: isDark ? '#6b7280' : '#4b5563',
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

  // Handle demo login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedRole) return;

    setLoading(true);

    try {
      // Demo login via AuthContext
      await login(username, password, selectedRole);
      toast.success(`Demo login successful as ${roles.find(r => r.id === selectedRole)?.label}`);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

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

          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
              DEMO MODE
            </div>
          </div>
          <h2 className={`text-2xl ${textPrimary} mb-2`}>
            {selectedRole ? 'Enter demo credentials' : 'Demo Login'}
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            {selectedRole
              ? `Sign in as ${roles.find((r) => r.id === selectedRole)?.label}`
              : 'Select a role to test different permission levels'}
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
                      <div className={`font-medium ${textPrimary}`}>
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
              {/* Username Field */}
              <div className="space-y-2">
                <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Username
                </Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  placeholder="Enter demo username"
                  className={`h-12 ${inputBg} ${inputBorder} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
                  disabled={loading}
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
                    placeholder="Enter demo password"
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
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Demo Hint */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-100'}`}>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  <strong>Demo credentials:</strong> Use any username with password "demo123"
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In (Demo)'
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
            </form>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor}`}>
          <p className={`text-xs ${textSecondary} text-center`}>
            This is a demo environment for testing purposes.
            <br />
            For production access, use{' '}
            <a href="/system-admin-login" className="text-indigo-500 hover:underline">
              System Admin Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
