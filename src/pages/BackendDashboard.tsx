/**
 * Backend Dashboard - Refactored
 * SECURITY: Restricted to system-admin role only
 * Modular architecture with <250 lines per file
 * @module pages/BackendDashboard
 */

'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Server,
  RefreshCw,
  Network,
  Lock,
  Shield,
  ShieldAlert,
  Database,
  Activity,
  Code,
  Key,
  Cpu,
  Brain,
  AlertCircle,
} from 'lucide-react';

// Modular dashboard components
import {
  QuickStats,
  ConnectionsTab,
  HealthChecksTab,
  ApiTestsTab,
  EnvVarsTab,
  MonitoringTab,
  LLMTab,
  useBackendConnections,
  getThemeClasses,
} from '@/components/backend/dashboard';

// Tab components
import { DatabaseTab } from '@/components/backend/database';
import { AuthServicesTab } from '@/components/backend/auth';
import { SecretsTabSecure } from '@/components/backend/secrets';
import { ErrorMonitoringTab } from '@/components/backend/error-monitoring';

export default function BackendDashboard() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isDark = theme === 'dark';
  const themeClasses = getThemeClasses(isDark);

  // SECURITY: System Admin only access
  const isSystemAdmin = currentUser?.role === 'system-admin';

  // Connection management hook
  const {
    connections,
    healthChecks,
    apiTests,
    envVars,
    isRefreshing,
    lastCheck,
    checkAllConnections,
  } = useBackendConnections();

  // Check connections on mount (only for system admins)
  useEffect(() => {
    if (isSystemAdmin) {
      checkAllConnections();
    }
  }, [isSystemAdmin, checkAllConnections]);

  // SECURITY: Access denied for non-system admins
  if (!isSystemAdmin) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
        <Card className={`${themeClasses.bgCard} border ${themeClasses.borderColor} max-w-2xl mx-auto mt-20`}>
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <ShieldAlert className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-3`}>Access Restricted</h2>
            <p className={`text-lg ${themeClasses.textSecondary} mb-6`}>
              The Backend Dashboard is restricted to <strong className="text-red-500">System Administrators</strong> only.
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
    <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${themeClasses.bgCard} border ${themeClasses.borderColor}`}>
              <Server className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl ${themeClasses.textPrimary} mb-1`}>Backend Dashboard</h1>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Monitor and test backend services, connections, and API endpoints
              </p>
            </div>
          </div>
          <Button onClick={checkAllConnections} disabled={isRefreshing} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
            {isRefreshing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Refreshing...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" />Refresh All</>
            )}
          </Button>
        </div>
        {lastCheck && (
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <QuickStats theme={themeClasses} connections={connections} healthChecks={healthChecks} apiTests={apiTests} />

      {/* Main Content - Tabs */}
      <Tabs defaultValue="connections" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className={`${themeClasses.bgCard} border ${themeClasses.borderColor} flex-nowrap md:flex-wrap justify-start min-w-max md:min-w-0 gap-1`}>
            <TabsTrigger value="connections"><Network className="w-4 h-4 mr-2" />Connections</TabsTrigger>
            <TabsTrigger value="secrets"><Lock className="w-4 h-4 mr-2" />Secrets</TabsTrigger>
            <TabsTrigger value="auth"><Shield className="w-4 h-4 mr-2" />Auth Services</TabsTrigger>
            <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" />Database</TabsTrigger>
            <TabsTrigger value="health"><Activity className="w-4 h-4 mr-2" />Health</TabsTrigger>
            <TabsTrigger value="api"><Code className="w-4 h-4 mr-2" />API Tests</TabsTrigger>
            <TabsTrigger value="env"><Key className="w-4 h-4 mr-2" />Environment</TabsTrigger>
            <TabsTrigger value="monitoring"><Cpu className="w-4 h-4 mr-2" />Monitoring</TabsTrigger>
            <TabsTrigger value="llm"><Brain className="w-4 h-4 mr-2" />LLM</TabsTrigger>
            <TabsTrigger value="errors"><AlertCircle className="w-4 h-4 mr-2" />Errors</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="connections"><ConnectionsTab theme={themeClasses} connections={connections} /></TabsContent>
        <TabsContent value="secrets"><SecretsTabSecure /></TabsContent>
        <TabsContent value="auth"><AuthServicesTab /></TabsContent>
        <TabsContent value="database"><DatabaseTab isDark={isDark} /></TabsContent>
        <TabsContent value="health"><HealthChecksTab theme={themeClasses} healthChecks={healthChecks} /></TabsContent>
        <TabsContent value="api"><ApiTestsTab theme={themeClasses} apiTests={apiTests} /></TabsContent>
        <TabsContent value="env"><EnvVarsTab theme={themeClasses} envVars={envVars} /></TabsContent>
        <TabsContent value="monitoring"><MonitoringTab theme={themeClasses} /></TabsContent>
        <TabsContent value="llm"><LLMTab theme={themeClasses} /></TabsContent>
        <TabsContent value="errors"><ErrorMonitoringTab /></TabsContent>
      </Tabs>
    </div>
  );
}
