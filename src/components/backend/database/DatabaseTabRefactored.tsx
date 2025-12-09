/**
 * Database Tab - Refactored
 * SECURITY: Restricted to system-admin role only
 * @module components/backend/database/DatabaseTab
 */

'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldAlert, RefreshCw, Database, AlertCircle } from 'lucide-react';

import { TestResultCard } from './TestResultCard';
import { useDatabaseTests } from './useDatabaseTests';
import { getDatabaseTheme } from './types';

interface DatabaseTabProps {
  isDark: boolean;
}

export function DatabaseTabRefactored({ isDark }: DatabaseTabProps) {
  const { currentUser } = useAuth();
  const theme = getDatabaseTheme(isDark);

  // SECURITY: Check if user is system admin
  const isSystemAdmin = currentUser?.role === 'system-admin';

  // Hook for database tests
  const { results, isRunning, runTests } = useDatabaseTests();

  // SECURITY: Access denied for non-system admins
  if (!isSystemAdmin) {
    return (
      <div className="space-y-6">
        <Card className={`${theme.cardBgClass} border ${theme.borderClass}`}>
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <ShieldAlert className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${theme.textClass} mb-3`}>Access Restricted</h3>
            <p className={`text-lg ${theme.textMutedClass} mb-6`}>
              Database management is restricted to <strong className="text-red-500">System Administrators</strong> only.
            </p>
            <Alert className={`max-w-md mx-auto ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
              <Shield className="w-4 h-4 text-red-500" />
              <AlertDescription className={isDark ? 'text-red-200' : 'text-red-800'}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${theme.cardBgClass} border ${theme.borderClass}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <Database className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <CardTitle className={theme.textClass}>Database Tests</CardTitle>
                <CardDescription className={theme.textMutedClass}>
                  Test your database connection and configuration
                </CardDescription>
              </div>
            </div>
            <Button onClick={runTests} disabled={isRunning} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
              {isRunning ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Running...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Run Tests</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${theme.textMutedClass}`} />
              <p className={theme.textClass}>No test results yet</p>
              <p className={`text-sm ${theme.textMutedClass}`}>Click "Run Tests" to check your database configuration</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <TestResultCard key={result.name} result={result} theme={theme} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
