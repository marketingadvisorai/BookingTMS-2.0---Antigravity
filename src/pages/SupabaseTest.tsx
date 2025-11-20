/**
 * Supabase Connection Test Page
 * Tests and verifies Supabase connection for BookingTMS - Beta V 0.1
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../components/layout/ThemeContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Database, Key, Server, Table } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const SupabaseTest = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  
  const supabaseUrl = `https://${projectId}.supabase.co`;
  
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
          // Check if it's just an empty table or RLS issue
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
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">Running</Badge>;
    }
  };

  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <AdminLayout>
      <PageHeader
        title="Supabase Connection Test"
        subtitle="Verify connection to BookingTMS - Beta V 0.1"
      />

      <div className={`p-4 md:p-6 ${bgClass} min-h-screen`}>
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Project Info Card */}
          <Card className={`${cardBg} border ${borderClass} p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-xl mb-2 ${textClass}`}>Project Information</h2>
                <p className={mutedClass}>BookingTMS - Beta V 0.1</p>
              </div>
              <Database className="w-8 h-8 text-indigo-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className={`p-4 rounded-lg border ${borderClass}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-indigo-500" />
                  <span className={`text-sm ${mutedClass}`}>Project ID</span>
                </div>
                <code className={`text-sm ${textClass}`}>{projectId}</code>
              </div>
              
              <div className={`p-4 rounded-lg border ${borderClass}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  <span className={`text-sm ${mutedClass}`}>Supabase URL</span>
                </div>
                <code className={`text-sm ${textClass} break-all`}>{supabaseUrl}</code>
              </div>
            </div>
          </Card>

          {/* Test Controls */}
          <Card className={`${cardBg} border ${borderClass} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg mb-1 ${textClass}`}>Connection Tests</h3>
                <p className={`text-sm ${mutedClass}`}>
                  Run comprehensive tests to verify Supabase integration
                </p>
              </div>
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run Tests'
                )}
              </Button>
            </div>
          </Card>

          {/* Test Results */}
          {results.length > 0 && (
            <Card className={`${cardBg} border ${borderClass} p-6`}>
              <h3 className={`text-lg mb-4 ${textClass}`}>Test Results</h3>
              
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${borderClass} ${
                      result.status === 'success' ? 'border-green-500/20 bg-green-500/5' :
                      result.status === 'error' ? 'border-red-500/20 bg-red-500/5' :
                      'border-blue-500/20 bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`${textClass}`}>{result.name}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className={`text-sm mt-1 ${mutedClass}`}>{result.message}</p>
                        </div>
                      </div>
                    </div>
                    
                    {result.details && (
                      <div className={`mt-3 p-3 rounded bg-black/20 ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                        <pre className={`text-xs ${mutedClass} overflow-x-auto`}>
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
                  <span className={mutedClass}>
                    {results.filter(r => r.status === 'success').length} / {results.length} tests passed
                  </span>
                  {!isRunning && results.every(r => r.status === 'success') && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      All Systems Operational
                    </Badge>
                  )}
                  {!isRunning && results.some(r => r.status === 'error') && (
                    <Badge className="bg-red-500">
                      <XCircle className="w-4 h-4 mr-1" />
                      Some Tests Failed
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Help Card */}
          <Card className={`${cardBg} border ${borderClass} p-6`}>
            <h3 className={`text-lg mb-3 ${textClass}`}>Need Help?</h3>
            <ul className={`space-y-2 text-sm ${mutedClass}`}>
              <li>• Check the <code className="text-indigo-500">/CONNECT_TO_SUPABASE.md</code> guide</li>
              <li>• Verify environment variables in Figma Make settings</li>
              <li>• Ensure database migrations have been run</li>
              <li>• Check Supabase dashboard for any issues</li>
            </ul>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default SupabaseTest;
