/**
 * ErrorMonitoringTab - Error monitoring section for Backend Dashboard
 * @module components/backend/ErrorMonitoringTab
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Bot,
  GitBranch,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

// Types
interface SystemError {
  id: string;
  error_type: string;
  message: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  occurrence_count: number;
  auto_fixable: boolean;
  fix_category: 'auto_fixable' | 'approval_required' | 'admin_only';
  first_seen_at: string;
  last_seen_at: string;
  ai_analysis?: Record<string, unknown>;
}

interface FixRequest {
  id: string;
  error_id: string;
  fix_type: string;
  status: string;
  ai_confidence: number;
  proposed_fix: {
    description?: string;
    code_changes?: Array<{ file: string; change: string }>;
  };
  files_affected: string[];
  created_at: string;
  error?: SystemError;
}

interface ErrorStats {
  total: number;
  critical: number;
  new_today: number;
  resolved_today: number;
  pending_fixes: number;
}

export function ErrorMonitoringTab() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [fixRequests, setFixRequests] = useState<FixRequest[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0, critical: 0, new_today: 0, resolved_today: 0, pending_fixes: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('errors');

  // Styling
  const bgCard = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevated = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchErrors(),
        fetchFixRequests(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load error monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const fetchErrors = async () => {
    const { data, error } = await supabase
      .from('system_errors')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setErrors(data as SystemError[]);
    }
  };

  const fetchFixRequests = async () => {
    const { data, error } = await supabase
      .from('llm_fix_requests')
      .select('*, system_errors(*)')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setFixRequests(data.map((d: any) => ({
        ...d,
        error: d.system_errors
      })));
    }
  };

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: errorsData } = await supabase
      .from('system_errors')
      .select('severity, status, created_at')
      .gte('created_at', today);

    const { count: pendingFixes } = await supabase
      .from('llm_fix_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');

    if (errorsData) {
      setStats({
        total: errorsData.length,
        critical: errorsData.filter(e => e.severity === 'critical').length,
        new_today: errorsData.filter(e => e.status === 'new').length,
        resolved_today: errorsData.filter(e => e.status === 'resolved').length,
        pending_fixes: pendingFixes || 0
      });
    }
  };

  const handleApproveFix = async (fixId: string) => {
    const { error } = await supabase.rpc('approve_fix_request', {
      p_fix_request_id: fixId,
      p_approved_by: (await supabase.auth.getUser()).data.user?.id,
      p_approve: true
    });

    if (error) {
      toast.error('Failed to approve fix');
    } else {
      toast.success('Fix approved! Executing...');
      fetchFixRequests();
    }
  };

  const handleRejectFix = async (fixId: string, reason: string) => {
    const { error } = await supabase.rpc('approve_fix_request', {
      p_fix_request_id: fixId,
      p_approved_by: (await supabase.auth.getUser()).data.user?.id,
      p_approve: false,
      p_rejection_reason: reason
    });

    if (error) {
      toast.error('Failed to reject fix');
    } else {
      toast.success('Fix rejected');
      fetchFixRequests();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'error': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500';
      case 'investigating': return 'bg-yellow-500/10 text-yellow-500';
      case 'resolved': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredErrors = errors.filter(e =>
    e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.error_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard
          label="Total Errors"
          value={stats.total}
          icon={<Bug className="w-5 h-5" />}
          color="blue"
          isDark={isDark}
        />
        <StatsCard
          label="Critical"
          value={stats.critical}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          isDark={isDark}
        />
        <StatsCard
          label="New Today"
          value={stats.new_today}
          icon={<AlertCircle className="w-5 h-5" />}
          color="orange"
          isDark={isDark}
        />
        <StatsCard
          label="Resolved"
          value={stats.resolved_today}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
          isDark={isDark}
        />
        <StatsCard
          label="Pending Fixes"
          value={stats.pending_fixes}
          icon={<Bot className="w-5 h-5" />}
          color="purple"
          isDark={isDark}
          highlight={stats.pending_fixes > 0}
        />
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className={`${bgCard} border ${borderColor}`}>
            <TabsTrigger value="errors">
              <Bug className="w-4 h-4 mr-2" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="approvals">
              <Bot className="w-4 h-4 mr-2" />
              Fix Approvals
              {stats.pending_fixes > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{stats.pending_fixes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Errors Tab */}
        <TabsContent value="errors">
          <Card className={`${bgCard} border ${borderColor}`}>
            <div className={`p-4 border-b ${borderColor}`}>
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
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" />
                  <p className={`mt-2 ${textSecondary}`}>Loading errors...</p>
                </div>
              ) : filteredErrors.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className={textPrimary}>No errors found</p>
                  <p className={`text-sm ${textSecondary}`}>Your system is running smoothly!</p>
                </div>
              ) : (
                filteredErrors.map((error) => (
                  <ErrorRow
                    key={error.id}
                    error={error}
                    isDark={isDark}
                    onSelect={() => setSelectedError(error)}
                    getSeverityColor={getSeverityColor}
                    getStatusColor={getStatusColor}
                  />
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Fix Approvals Tab */}
        <TabsContent value="approvals">
          <Card className={`${bgCard} border ${borderColor}`}>
            <div className={`p-4 border-b ${borderColor}`}>
              <h3 className={`${textPrimary} font-medium`}>Pending Fix Approvals</h3>
              <p className={`text-sm ${textSecondary}`}>
                AI-suggested fixes awaiting your approval
              </p>
            </div>

            <div className="divide-y divide-gray-800">
              {fixRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <Bot className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                  <p className={textPrimary}>No pending approvals</p>
                  <p className={`text-sm ${textSecondary}`}>All fixes have been reviewed</p>
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
          <Card className={`${bgCard} border ${borderColor} p-6`}>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-500 mb-3" />
              <p className={textPrimary}>Agent Activity Log</p>
              <p className={`text-sm ${textSecondary}`}>
                Coming soon - View all LLM agent actions and executions
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components

function StatsCard({ label, value, icon, color, isDark, highlight }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'orange' | 'green' | 'purple';
  isDark: boolean;
  highlight?: boolean;
}) {
  const colors = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    red: isDark ? 'text-red-400' : 'text-red-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
    green: isDark ? 'text-green-400' : 'text-green-600',
    purple: isDark ? 'text-purple-400' : 'text-purple-600',
  };

  return (
    <Card className={`p-4 ${isDark ? 'bg-[#161616] border-gray-800' : 'bg-white border-gray-200'} ${highlight ? 'ring-2 ring-purple-500/50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={colors[color]}>{icon}</div>
      </div>
    </Card>
  );
}

function ErrorRow({ error, isDark, onSelect, getSeverityColor, getStatusColor }: {
  error: SystemError;
  isDark: boolean;
  onSelect: () => void;
  getSeverityColor: (s: string) => string;
  getStatusColor: (s: string) => string;
}) {
  return (
    <div
      className={`p-4 hover:${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} cursor-pointer transition-colors`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${getSeverityColor(error.severity)} border text-xs`}>
              {error.severity}
            </Badge>
            <Badge className={`${getStatusColor(error.status)} text-xs`}>
              {error.status}
            </Badge>
            {error.auto_fixable && (
              <Badge className="bg-purple-500/10 text-purple-500 text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Auto-fixable
              </Badge>
            )}
          </div>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
            {error.message}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error.error_type} • {error.occurrence_count} occurrences
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Last seen
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(error.last_seen_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function FixApprovalRow({ fix, isDark, onApprove, onReject }: {
  fix: FixRequest;
  isDark: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Bot className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {fix.fix_type}
            </span>
            <Badge className="bg-blue-500/10 text-blue-500 text-xs">
              {fix.ai_confidence}% confident
            </Badge>
          </div>
          
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {fix.proposed_fix?.description || 'No description'}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              Files: {fix.files_affected?.join(', ') || 'N/A'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showDetails ? 'Hide' : 'View'} Details
            </Button>
          </div>

          {showDetails && fix.proposed_fix?.code_changes && (
            <div className={`mt-3 p-3 rounded ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Proposed Changes:
              </p>
              <pre className={`text-xs overflow-x-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {JSON.stringify(fix.proposed_fix.code_changes, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 hover:bg-red-500/10"
            onClick={() => onReject('Manual rejection')}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onApprove}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
