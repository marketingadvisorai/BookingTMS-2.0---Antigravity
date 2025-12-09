/**
 * Error Monitoring Tab - Refactored
 * SECURITY: Restricted to system-admin role only
 * @module components/backend/error-monitoring/ErrorMonitoringTab
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bug, AlertTriangle, CheckCircle2, RefreshCw, Search, Filter, Bot,
  Loader2, AlertCircle, Activity, Shield, ShieldAlert,
} from 'lucide-react';

import { StatsCard } from './StatsCard';
import { ErrorRow } from './ErrorRow';
import { FixApprovalRow } from './FixApprovalRow';
import { useErrorMonitoring } from './useErrorMonitoring';
import { getErrorMonitoringTheme, SystemError } from './types';

export function ErrorMonitoringTabRefactored() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isDark = theme === 'dark';
  const themeClasses = getErrorMonitoringTheme(isDark);

  // SECURITY: Check if user is system admin
  const isSystemAdmin = currentUser?.role === 'system-admin';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('errors');

  // Hook for data management
  const { errors, fixRequests, stats, loading, fetchData, handleApproveFix, handleRejectFix } =
    useErrorMonitoring();

  // Fetch data on mount (only for system admins)
  useEffect(() => {
    if (isSystemAdmin) {
      fetchData();
    }
  }, [isSystemAdmin, fetchData]);

  // SECURITY: Access denied for non-system admins
  if (!isSystemAdmin) {
    return (
      <div className="space-y-4">
        <Card className={`${themeClasses.bgCard} border ${themeClasses.borderColor}`}>
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <ShieldAlert className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-3`}>Access Restricted</h3>
            <p className={`text-lg ${themeClasses.textSecondary} mb-6`}>
              Error Monitoring is restricted to <strong className="text-red-500">System Administrators</strong> only.
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

  const filteredErrors = errors.filter(
    (e) =>
      e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.error_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Total Errors" value={stats.total} icon={<Bug className="w-5 h-5" />} color="blue" isDark={isDark} />
        <StatsCard label="Critical" value={stats.critical} icon={<AlertTriangle className="w-5 h-5" />} color="red" isDark={isDark} />
        <StatsCard label="New Today" value={stats.new_today} icon={<AlertCircle className="w-5 h-5" />} color="orange" isDark={isDark} />
        <StatsCard label="Resolved" value={stats.resolved_today} icon={<CheckCircle2 className="w-5 h-5" />} color="green" isDark={isDark} />
        <StatsCard label="Pending Fixes" value={stats.pending_fixes} icon={<Bot className="w-5 h-5" />} color="purple" isDark={isDark} highlight={stats.pending_fixes > 0} />
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className={`${themeClasses.bgCard} border ${themeClasses.borderColor}`}>
            <TabsTrigger value="errors"><Bug className="w-4 h-4 mr-2" />Errors</TabsTrigger>
            <TabsTrigger value="approvals">
              <Bot className="w-4 h-4 mr-2" />Fix Approvals
              {stats.pending_fixes > 0 && <Badge className="ml-2 bg-red-500 text-white">{stats.pending_fixes}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Activity</TabsTrigger>
          </TabsList>

          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Errors Tab */}
        <TabsContent value="errors">
          <Card className={`${themeClasses.bgCard} border ${themeClasses.borderColor}`}>
            <div className={`p-4 border-b ${themeClasses.borderColor}`}>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search errors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 ${isDark ? 'bg-[#0a0a0a] border-gray-700' : ''}`}
                  />
                </div>
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" />
                  <p className={`mt-2 ${themeClasses.textSecondary}`}>Loading errors...</p>
                </div>
              ) : filteredErrors.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className={themeClasses.textPrimary}>No errors found</p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Your system is running smoothly!</p>
                </div>
              ) : (
                filteredErrors.map((error) => (
                  <ErrorRow key={error.id} error={error} isDark={isDark} onSelect={() => setSelectedError(error)} />
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Fix Approvals Tab */}
        <TabsContent value="approvals">
          <Card className={`${themeClasses.bgCard} border ${themeClasses.borderColor}`}>
            <div className={`p-4 border-b ${themeClasses.borderColor}`}>
              <h3 className={`${themeClasses.textPrimary} font-medium`}>Pending Fix Approvals</h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>AI-suggested fixes awaiting your approval</p>
            </div>

            <div className="divide-y divide-gray-800">
              {fixRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <Bot className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                  <p className={themeClasses.textPrimary}>No pending approvals</p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>All fixes have been reviewed</p>
                </div>
              ) : (
                fixRequests.map((fix) => (
                  <FixApprovalRow
                    key={fix.id}
                    fix={fix}
                    isDark={isDark}
                    onApprove={() => handleApproveFix(fix.id)}
                    onReject={(reason) => handleRejectFix(fix.id, reason)}
                  />
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className={`${themeClasses.bgCard} border ${themeClasses.borderColor} p-6`}>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-500 mb-3" />
              <p className={themeClasses.textPrimary}>Agent Activity Log</p>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Coming soon - View all LLM agent actions and executions</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
