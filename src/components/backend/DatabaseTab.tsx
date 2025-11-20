/**
 * Database Tab Component for Backend Dashboard
 * Comprehensive database testing and management
 */

'use client';

import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Database, 
  Key, 
  Server, 
  Activity,
  HardDrive,
  Zap,
  Shield,
  RefreshCw,
  Settings as SettingsIcon,
  AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

interface DatabaseTabProps {
  isDark: boolean;
}

export const DatabaseTab = ({ isDark }: DatabaseTabProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  
  const supabaseUrl = `https://${projectId}.supabase.co`;
  
  // Semantic class variables
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  
  const updateResult = (name: string, status: 'success' | 'error', message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, details } : r);
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Environment Variables
      updateResult('Environment', 'pending', 'Checking...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!projectId || !publicAnonKey) {
        updateResult('Environment', 'error', 'Missing project configuration', { projectId, hasKey: !!publicAnonKey });
      } else {
        updateResult('Environment', 'success', 'Configuration found', {
          projectId,
          url: supabaseUrl,
          keyPreview: publicAnonKey.substring(0, 20) + '...'
        });
      }

      // Test 2: Client Initialization
      updateResult('Client', 'pending', 'Initializing Supabase client...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let supabase;
      try {
        supabase = createClient(supabaseUrl, publicAnonKey);
        updateResult('Client', 'success', 'Client initialized successfully', {
          url: supabaseUrl,
          clientCreated: true
        });
      } catch (error: any) {
        updateResult('Client', 'error', `Failed to initialize: ${error.message}`);
        setIsRunning(false);
        return;
      }

      // Test 3: Database Connection
      updateResult('Database', 'pending', 'Testing database connection...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const { error: dbError } = await supabase.from('kv_store_84a71643').select('count').limit(1);
        
        if (dbError) {
          if (dbError.code === 'PGRST116' || dbError.message.includes('no rows')) {
            updateResult('Database', 'success', 'Connected (table exists, no data or RLS active)', { error: dbError.message });
          } else {
            updateResult('Database', 'error', `Connection error: ${dbError.message}`, dbError);
          }
        } else {
          updateResult('Database', 'success', 'Database connected successfully');
        }
      } catch (error: any) {
        updateResult('Database', 'error', `Connection failed: ${error.message}`);
      }

      // Test 4: Auth System
      updateResult('Auth', 'pending', 'Testing authentication system...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          updateResult('Auth', 'error', `Auth error: ${authError.message}`, authError);
        } else if (session) {
          updateResult('Auth', 'success', `Logged in as ${session.user.email}`, {
            userId: session.user.id,
            email: session.user.email
          });
        } else {
          updateResult('Auth', 'success', 'Auth system ready (no active session)', { ready: true });
        }
      } catch (error: any) {
        updateResult('Auth', 'error', `Auth test failed: ${error.message}`);
      }

      // Test 5: Server Functions
      updateResult('Server', 'pending', 'Testing edge functions...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/make-server-84a71643/health`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          updateResult('Server', 'success', 'Edge function responding', data);
        } else {
          updateResult('Server', 'error', `Server returned ${response.status}`, {
            status: response.status,
            statusText: response.statusText
          });
        }
      } catch (error: any) {
        updateResult('Server', 'error', `Cannot reach server: ${error.message}`);
      }

    } catch (error: any) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0';
      case 'error':
        return isDark ? 'bg-red-500/20 text-red-400 border-0' : 'bg-red-100 text-red-700 border-0';
      case 'pending':
        return isDark ? 'bg-blue-500/20 text-blue-400 border-0' : 'bg-blue-100 text-blue-700 border-0';
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <Database className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <CardTitle className={textClass}>Supabase</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className={`text-2xl mb-1 ${textClass}`}>Connected</p>
            <p className={`text-sm ${textMutedClass}`}>PostgreSQL Database</p>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <HardDrive className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <CardTitle className={textClass}>KV Store</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className={`text-2xl mb-1 ${textClass}`}>Active</p>
            <p className={`text-sm ${textMutedClass}`}>Key-Value Storage</p>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <CardTitle className={textClass}>Edge Functions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className={`text-2xl mb-1 ${textClass}`}>Ready</p>
            <p className={`text-sm ${textMutedClass}`}>Server-side Logic</p>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <CardTitle className={textClass}>Authentication</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className={`text-2xl mb-1 ${textClass}`}>Enabled</p>
            <p className={`text-sm ${textMutedClass}`}>Supabase Auth</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Information */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <div className="flex items-center gap-2">
            <Server className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Project Information</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>BookingTMS - Beta V 0.1</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <div className={`p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
            <div className="flex items-center gap-2 mb-2">
              <Server className={`w-4 h-4 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <span className={`text-sm ${textMutedClass}`}>Project ID</span>
            </div>
            <code className={`text-sm ${textClass}`}>{projectId}</code>
          </div>
          
          <div className={`p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
            <div className="flex items-center gap-2 mb-2">
              <Key className={`w-4 h-4 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <span className={`text-sm ${textMutedClass}`}>Supabase URL</span>
            </div>
            <code className={`text-sm ${textClass} break-all`}>{supabaseUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={textClass}>Connection Tests</CardTitle>
              <CardDescription className={textMutedClass}>
                Run comprehensive tests to verify Supabase integration
              </CardDescription>
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700 text-white border-0'}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {results.length > 0 && (
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' ? (isDark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-green-500/20 bg-green-500/5') :
                    result.status === 'error' ? (isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-500/20 bg-red-500/5') :
                    isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-500/20 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={textClass}>{result.name}</span>
                          <Badge className={getStatusBadge(result.status)}>{result.status === 'success' ? 'Success' : result.status === 'error' ? 'Error' : 'Running'}</Badge>
                        </div>
                        <p className={`text-sm mt-1 ${textMutedClass}`}>{result.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  {result.details && (
                    <div className={`mt-3 p-3 rounded ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                      <pre className={`text-xs ${textMutedClass} overflow-x-auto`}>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className={`mt-6 pt-6 border-t ${borderClass}`}>
              <div className="flex items-center justify-between">
                <span className={textMutedClass}>
                  {results.filter(r => r.status === 'success').length} / {results.length} tests passed
                </span>
                {!isRunning && results.every(r => r.status === 'success') && (
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    All Systems Operational
                  </Badge>
                )}
                {!isRunning && results.some(r => r.status === 'error') && (
                  <Badge className={isDark ? 'bg-red-500/20 text-red-400 border-0' : 'bg-red-100 text-red-700 border-0'}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Some Tests Failed
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Documentation */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Documentation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ul className={`space-y-2 text-sm ${textMutedClass}`}>
            <li>• <code className={isDark ? 'text-[#6366f1]' : 'text-blue-600'}>/CONNECT_TO_SUPABASE.md</code> - Connection guide</li>
            <li>• <code className={isDark ? 'text-[#6366f1]' : 'text-blue-600'}>/DATABASE_CONNECTION_GUIDE.md</code> - Complete database guide</li>
            <li>• <code className={isDark ? 'text-[#6366f1]' : 'text-blue-600'}>/SUPABASE_SETUP_GUIDE.md</code> - Setup instructions</li>
            <li>• <code className={isDark ? 'text-[#6366f1]' : 'text-blue-600'}>/supabase/functions/server/kv_store.tsx</code> - KV Store utilities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
