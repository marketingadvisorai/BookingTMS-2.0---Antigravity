/**
 * Secure Secrets Tab Component
 * SECURITY: Uses Edge Function for all secret operations
 * No localStorage storage - all secrets managed server-side
 * 
 * @module components/backend/secrets/SecretsTabSecure
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Lock,
  Shield,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { SecretCategoryCard } from './SecretCategoryCard';
import { useSecrets } from './useSecrets';
import { SECRET_CATEGORIES } from './types';

// ============================================================================
// Component
// ============================================================================

export function SecretsTabSecure() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isDark = theme === 'dark';

  // SECURITY: Check system-admin role
  const isSystemAdmin = currentUser?.role === 'system-admin';

  // Theme colors
  const bgCard = isDark ? 'bg-[#161616]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  // Secrets management hook
  const {
    secrets,
    loading,
    saving,
    validating,
    loadSecrets,
    saveSecret,
    clearSecret,
    validateSecretKey,
    getCategoryStatus,
    isAllConfigured,
  } = useSecrets();

  // SECURITY: Access denied screen
  if (!isSystemAdmin) {
    return (
      <div className="space-y-6">
        <Card className={`${bgCard} border ${borderColor}`}>
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <ShieldAlert className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-3`}>Access Restricted</h3>
            <p className={`text-lg ${textSecondary} mb-6 max-w-2xl mx-auto`}>
              This page contains sensitive API keys and secrets.
              <br />
              Only <strong className="text-red-500">System Administrators</strong> can access this section.
            </p>
            <Alert className={`max-w-md mx-auto ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
              <Shield className="w-4 h-4 text-red-500" />
              <AlertDescription className={`${isDark ? 'text-red-200' : 'text-red-800'}`}>
                <strong>Current Role:</strong> {currentUser?.role || 'Not authenticated'}
                <br />
                <strong>Required Role:</strong> system-admin
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className={`${bgCard} border ${borderColor} p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${bgCard} border ${borderColor}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>Secrets Management</h2>
                <p className={`text-sm ${textSecondary}`}>
                  Securely manage API keys and credentials
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAllConfigured ? (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">All Required Configured</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Missing Required Secrets</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={loadSecrets}
                className={`border ${borderColor}`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Notice */}
      <Alert className={`${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
        <Shield className="w-4 h-4 text-green-500" />
        <AlertDescription className={`${isDark ? 'text-green-200' : 'text-green-800'}`}>
          <strong>Secure Storage:</strong> All secrets are encrypted and stored server-side.
          They are never stored in browser localStorage or exposed to the frontend.
        </AlertDescription>
      </Alert>

      {/* Secret Categories */}
      <div className="grid gap-6">
        {SECRET_CATEGORIES.map((category) => (
          <SecretCategoryCard
            key={category.id}
            category={category}
            secrets={secrets}
            categoryStatus={getCategoryStatus(category.id)}
            saving={saving}
            validating={validating}
            onSave={saveSecret}
            onClear={clearSecret}
            onValidate={validateSecretKey}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}
