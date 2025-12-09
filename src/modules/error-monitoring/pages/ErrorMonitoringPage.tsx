/**
 * ErrorMonitoringPage - Main error monitoring dashboard for System Admin
 * @module error-monitoring/pages/ErrorMonitoringPage
 */

import React, { useState } from 'react';
import {
  RefreshCw,
  Bug,
  Activity,
  MessageSquare,
  Filter,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  ErrorStatsCards,
  HealthStatusGrid,
  ErrorList,
  ErrorDetailPanel,
  UserReportsQueue,
  ErrorReportForm,
} from '../components';
import { useErrorMonitoring, useHealthStatus, useUserReports } from '../hooks';
import { aiAnalysisService } from '../services';
import type { SystemError, ErrorFilters, ErrorStatus } from '../types';
import { toast } from 'sonner';

export function ErrorMonitoringPage() {
  const [activeTab, setActiveTab] = useState('errors');
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);
  const [reportFormOpen, setReportFormOpen] = useState(false);

  // Hooks
  const {
    errors,
    stats,
    loading: errorsLoading,
    filters,
    setFilters,
    updateStatus,
    refresh: refreshErrors,
  } = useErrorMonitoring({ autoRefresh: true });

  const {
    summaries,
    loading: healthLoading,
    runChecks,
    refresh: refreshHealth,
  } = useHealthStatus({ autoRefresh: true });

  const {
    reports,
    loading: reportsLoading,
    submitReport,
    refresh: refreshReports,
  } = useUserReports();

  // Handlers
  const handleStatusUpdate = async (id: string, status: ErrorStatus) => {
    const success = await updateStatus(id, status);
    if (success) {
      toast.success(`Error marked as ${status}`);
      setSelectedError(null);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleRequestAnalysis = async (id: string) => {
    toast.info('Requesting AI analysis...');
    const result = await aiAnalysisService.analyzeError({ errorId: id });
    if (result.success) {
      toast.success('Analysis complete');
      refreshErrors();
    } else {
      toast.error('Analysis failed: ' + result.error);
    }
  };

  const handleRefresh = () => {
    refreshErrors();
    refreshHealth();
    refreshReports();
    toast.success('Data refreshed');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Error Monitoring</h1>
            <p className="text-muted-foreground">
              System health and error tracking dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setReportFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>

        {/* Stats */}
        <ErrorStatsCards stats={stats} loading={errorsLoading} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="errors" className="gap-2">
              <Bug className="h-4 w-4" />
              Errors ({stats?.totalErrors || 0})
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Activity className="h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              User Reports ({reports.length})
            </TabsTrigger>
          </TabsList>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-4">
            <ErrorFiltersBar filters={filters} onChange={setFilters} />
            <ErrorList
              errors={errors}
              loading={errorsLoading}
              onSelectError={setSelectedError}
            />
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={runChecks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Health Checks
              </Button>
            </div>
            <HealthStatusGrid summaries={summaries} loading={healthLoading} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <UserReportsQueue reports={reports} loading={reportsLoading} />
          </TabsContent>
        </Tabs>

        {/* Error Detail Panel */}
        <ErrorDetailPanel
          error={selectedError}
          open={!!selectedError}
          onClose={() => setSelectedError(null)}
          onUpdateStatus={handleStatusUpdate}
          onRequestAnalysis={handleRequestAnalysis}
        />

        {/* Report Form */}
        <ErrorReportForm
          open={reportFormOpen}
          onClose={() => setReportFormOpen(false)}
          onSubmit={async (input) => {
            const id = await submitReport(input);
            if (id) {
              toast.success('Report submitted');
              return id;
            }
            toast.error('Failed to submit report');
            return null;
          }}
          reporterType="system_admin"
        />
      </div>
    </div>
  );
}

// Filters Component
function ErrorFiltersBar({
  filters,
  onChange,
}: {
  filters: ErrorFilters;
  onChange: (f: ErrorFilters) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Input
          placeholder="Search errors..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <Select
        value={filters.severity || 'all'}
        onValueChange={(v) =>
          onChange({ ...filters, severity: v === 'all' ? undefined : v as any })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severity</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="error">Error</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status || 'all'}
        onValueChange={(v) =>
          onChange({ ...filters, status: v === 'all' ? undefined : v as any })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="investigating">Investigating</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.timeRange || '24h'}
        onValueChange={(v) => onChange({ ...filters, timeRange: v as any })}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1h">Last Hour</SelectItem>
          <SelectItem value="24h">Last 24h</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
