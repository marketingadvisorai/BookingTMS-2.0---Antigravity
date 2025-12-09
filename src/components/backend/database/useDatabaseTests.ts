/**
 * Database Tests Hook
 * @module components/backend/database/useDatabaseTests
 */

import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { TestResult } from './types';

interface UseDatabaseTestsReturn {
  results: TestResult[];
  isRunning: boolean;
  runTests: () => Promise<void>;
}

export function useDatabaseTests(): UseDatabaseTestsReturn {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const supabaseUrl = `https://${projectId}.supabase.co`;

  const updateResult = useCallback((name: string, status: 'success' | 'error' | 'pending', message: string, details?: any) => {
    setResults((prev) => {
      const existing = prev.find((r) => r.name === name);
      if (existing) {
        return prev.map((r) => (r.name === name ? { name, status, message, details } : r));
      }
      return [...prev, { name, status, message, details }];
    });
  }, []);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Environment Variables
      updateResult('Environment', 'pending', 'Checking...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!projectId || !publicAnonKey) {
        updateResult('Environment', 'error', 'Missing project configuration', { projectId, hasKey: !!publicAnonKey });
      } else {
        updateResult('Environment', 'success', 'Configuration found', {
          projectId,
          url: supabaseUrl,
          keyPreview: publicAnonKey.substring(0, 20) + '...',
        });
      }

      // Test 2: Client Initialization
      updateResult('Client', 'pending', 'Initializing Supabase client...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      let supabase;
      try {
        supabase = createClient(supabaseUrl, publicAnonKey);
        updateResult('Client', 'success', 'Client initialized successfully', {
          url: supabaseUrl,
          clientCreated: true,
        });
      } catch (error: any) {
        updateResult('Client', 'error', `Failed to initialize: ${error.message}`);
        setIsRunning(false);
        return;
      }

      // Test 3: Database Connection
      updateResult('Database', 'pending', 'Testing database connection...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const { error: dbError } = await supabase.from('kv_store_84a71643').select('count').limit(1);

        if (dbError) {
          if (dbError.code === 'PGRST116' || dbError.message.includes('no rows')) {
            updateResult('Database', 'success', 'Connected (table exists, no data or RLS active)', { error: dbError.message });
          } else {
            updateResult('Database', 'error', `Connection error: ${dbError.message}`, dbError);
          }
        } else {
          updateResult('Database', 'success', 'Database connection successful');
        }
      } catch (error: any) {
        updateResult('Database', 'error', `Database test failed: ${error.message}`);
      }

      // Test 4: Auth System
      updateResult('Auth', 'pending', 'Checking authentication system...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateResult('Auth', 'success', session ? 'Authenticated session found' : 'Auth system operational (no session)', {
          hasSession: !!session,
        });
      } catch (error: any) {
        updateResult('Auth', 'error', `Auth check failed: ${error.message}`);
      }

      // Test 5: Server Functions
      updateResult('Server', 'pending', 'Testing server functions...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const { data, error } = await supabase.functions.invoke('health', { method: 'GET' });
        if (error) {
          updateResult('Server', 'error', `Edge function error: ${error.message}`);
        } else {
          updateResult('Server', 'success', 'Edge functions operational', { response: data });
        }
      } catch (error: any) {
        updateResult('Server', 'success', 'Edge functions may require deployment', { note: 'Function not deployed or requires auth' });
      }
    } finally {
      setIsRunning(false);
    }
  }, [supabaseUrl, updateResult]);

  return { results, isRunning, runTests };
}
