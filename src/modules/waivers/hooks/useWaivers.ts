/**
 * Waivers Module - Main Hook
 * Provides unified access to waiver templates and records with real-time updates
 * @module waivers/hooks/useWaivers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import {
  WaiverTemplate,
  WaiverRecord,
  WaiverStats,
  TemplateStats,
  WaiverFilters,
} from '../types';
import { templateService, waiverService } from '../services';

export interface UseWaiversOptions {
  organizationId?: string;
  autoFetch?: boolean;
  enableRealTime?: boolean;
}

export interface UseWaiversReturn {
  // Data
  templates: WaiverTemplate[];
  waivers: WaiverRecord[];
  templateStats: TemplateStats;
  waiverStats: WaiverStats;
  
  // Loading states
  loading: boolean;
  loadingTemplates: boolean;
  loadingWaivers: boolean;
  
  // Template operations
  createTemplate: (template: Partial<WaiverTemplate>) => Promise<WaiverTemplate>;
  updateTemplate: (id: string, updates: Partial<WaiverTemplate>) => Promise<WaiverTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<WaiverTemplate>;
  
  // Waiver operations
  submitWaiver: (data: Parameters<typeof waiverService.create>[0]) => Promise<WaiverRecord>;
  updateWaiverStatus: (id: string, status: WaiverRecord['status']) => Promise<void>;
  deleteWaiver: (id: string) => Promise<void>;
  verifyWaiverCode: (code: string) => Promise<WaiverRecord | null>;
  recordCheckIn: (waiverId: string, method: 'qr_scan' | 'manual') => Promise<void>;
  sendReminders: (waiverIds: string[]) => Promise<void>;
  
  // Data fetching
  refreshTemplates: () => Promise<void>;
  refreshWaivers: (filters?: WaiverFilters) => Promise<void>;
  searchWaivers: (query: string) => Promise<WaiverRecord[]>;
  
  // Filters
  filters: WaiverFilters;
  setFilters: (filters: WaiverFilters) => void;
}

const DEFAULT_FILTERS: WaiverFilters = {
  search: '',
  status: 'all',
};

export function useWaivers(options: UseWaiversOptions = {}): UseWaiversReturn {
  const { autoFetch = true, enableRealTime = true } = options;
  const { currentUser } = useAuth();
  const organizationId = options.organizationId || currentUser?.organizationId;

  // State
  const [templates, setTemplates] = useState<WaiverTemplate[]>([]);
  const [waivers, setWaivers] = useState<WaiverRecord[]>([]);
  const [templateStats, setTemplateStats] = useState<TemplateStats>({
    total: 0, active: 0, draft: 0, inactive: 0
  });
  const [waiverStats, setWaiverStats] = useState<WaiverStats>({
    total: 0, signed: 0, pending: 0, expired: 0, thisMonth: 0, signedThisWeek: 0
  });
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingWaivers, setLoadingWaivers] = useState(true);
  const [filters, setFilters] = useState<WaiverFilters>(DEFAULT_FILTERS);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch templates
  const refreshTemplates = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoadingTemplates(true);
    try {
      const data = await templateService.list({ organizationId });
      if (mountedRef.current) {
        setTemplates(data);
        setTemplateStats({
          total: data.length,
          active: data.filter(t => t.status === 'active').length,
          draft: data.filter(t => t.status === 'draft').length,
          inactive: data.filter(t => t.status === 'inactive').length,
        });
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      if (mountedRef.current) {
        toast.error('Failed to load waiver templates');
      }
    } finally {
      if (mountedRef.current) setLoadingTemplates(false);
    }
  }, [organizationId]);

  // Fetch waivers
  const refreshWaivers = useCallback(async (customFilters?: WaiverFilters) => {
    if (!mountedRef.current) return;
    
    const activeFilters = customFilters || filters;
    setLoadingWaivers(true);
    
    try {
      const data = await waiverService.list({
        status: activeFilters.status === 'all' ? undefined : activeFilters.status,
        search: activeFilters.search || undefined,
        dateFrom: activeFilters.dateFrom,
        dateTo: activeFilters.dateTo,
        templateId: activeFilters.templateId,
      });
      
      if (mountedRef.current) {
        setWaivers(data);
        const stats = await waiverService.getStats(organizationId);
        setWaiverStats(stats);
      }
    } catch (err) {
      console.error('Error fetching waivers:', err);
      if (mountedRef.current) {
        toast.error('Failed to load waivers');
      }
    } finally {
      if (mountedRef.current) setLoadingWaivers(false);
    }
  }, [filters, organizationId]);

  // Template operations
  const createTemplate = useCallback(async (template: Partial<WaiverTemplate>) => {
    if (!organizationId) throw new Error('Organization ID required');
    const result = await templateService.create(template, organizationId, currentUser?.id);
    toast.success('Template created successfully');
    await refreshTemplates();
    return result;
  }, [organizationId, currentUser?.id, refreshTemplates]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<WaiverTemplate>) => {
    const result = await templateService.update(id, updates);
    toast.success('Template updated successfully');
    await refreshTemplates();
    return result;
  }, [refreshTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    await templateService.delete(id);
    toast.success('Template deleted');
    await refreshTemplates();
  }, [refreshTemplates]);

  const duplicateTemplate = useCallback(async (id: string) => {
    if (!organizationId) throw new Error('Organization ID required');
    const result = await templateService.duplicate(id, organizationId, currentUser?.id);
    toast.success('Template duplicated');
    await refreshTemplates();
    return result;
  }, [organizationId, currentUser?.id, refreshTemplates]);

  // Waiver operations
  const submitWaiver = useCallback(async (data: Parameters<typeof waiverService.create>[0]) => {
    const result = await waiverService.create(data);
    toast.success('Waiver submitted successfully');
    await refreshWaivers();
    return result;
  }, [refreshWaivers]);

  const updateWaiverStatus = useCallback(async (id: string, status: WaiverRecord['status']) => {
    await waiverService.updateStatus(id, status);
    toast.success('Waiver status updated');
    await refreshWaivers();
  }, [refreshWaivers]);

  const deleteWaiver = useCallback(async (id: string) => {
    await waiverService.delete(id);
    toast.success('Waiver deleted');
    await refreshWaivers();
  }, [refreshWaivers]);

  const verifyWaiverCode = useCallback(async (code: string) => {
    return waiverService.getByCode(code);
  }, []);

  const recordCheckIn = useCallback(async (waiverId: string, method: 'qr_scan' | 'manual') => {
    await waiverService.recordCheckIn(waiverId, method, currentUser?.id);
    toast.success('Check-in recorded');
    await refreshWaivers();
  }, [currentUser?.id, refreshWaivers]);

  const sendReminders = useCallback(async (waiverIds: string[]) => {
    const result = await waiverService.sendReminders(waiverIds);
    toast.success(`Sent ${result.sent} reminder(s)`);
  }, []);

  const searchWaivers = useCallback(async (query: string) => {
    return waiverService.list({ search: query });
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealTime) return;

    const channel = supabase.channel('waivers-changes');
    
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiver_templates' }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) refreshTemplates();
        }, 500);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waivers' }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) refreshWaivers();
        }, 500);
      })
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [enableRealTime, refreshTemplates, refreshWaivers]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch) {
      refreshTemplates();
      refreshWaivers();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, refreshTemplates, refreshWaivers]);

  return {
    templates,
    waivers,
    templateStats,
    waiverStats,
    loading: loadingTemplates || loadingWaivers,
    loadingTemplates,
    loadingWaivers,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    submitWaiver,
    updateWaiverStatus,
    deleteWaiver,
    verifyWaiverCode,
    recordCheckIn,
    sendReminders,
    refreshTemplates,
    refreshWaivers,
    searchWaivers,
    filters,
    setFilters,
  };
}
