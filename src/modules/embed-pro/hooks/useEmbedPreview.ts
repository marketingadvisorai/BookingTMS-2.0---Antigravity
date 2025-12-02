/**
 * Embed Pro 1.1 - useEmbedPreview Hook
 * @module embed-pro/hooks/useEmbedPreview
 * 
 * Manages widget preview state and data.
 * Includes cache-busting for proper reload on config change.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { previewService, type PreviewData } from '../services';
import type { EmbedStyle } from '../types';

interface UseEmbedPreviewOptions {
  configId: string | null;
  autoLoad?: boolean;
}

interface UseEmbedPreviewReturn {
  previewData: PreviewData | null;
  loading: boolean;
  error: Error | null;
  previewUrl: string | null;
  styleVariables: Record<string, string>;
  refresh: () => Promise<void>;
  isLivePreview: boolean;
  setIsLivePreview: (value: boolean) => void;
  /** Unique key for iframe cache-busting */
  cacheKey: string;
}

export function useEmbedPreview(options: UseEmbedPreviewOptions): UseEmbedPreviewReturn {
  const { configId, autoLoad = true } = options;
  
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [cacheKey, setCacheKey] = useState(() => Date.now().toString());
  
  // Track previous configId to detect changes and prevent duplicate fetches
  const prevConfigIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch preview data with proper guards
  const loadPreview = useCallback(async () => {
    if (!configId) {
      setPreviewData(null);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      const data = await previewService.getPreviewData(configId);
      
      // Only update state if component is still mounted and configId matches
      if (mountedRef.current) {
        setPreviewData(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('[useEmbedPreview] Failed to load preview:', err);
        setError(err instanceof Error ? err : new Error('Failed to load preview'));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [configId]);

  // Reset state and load when configId changes
  useEffect(() => {
    if (prevConfigIdRef.current !== configId) {
      prevConfigIdRef.current = configId;
      
      if (!configId) {
        // Clear state when no config selected
        setPreviewData(null);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Clear previous data and set loading
      setPreviewData(null);
      setError(null);
      setCacheKey(`${configId}-${Date.now()}`);
      
      // Load new preview data
      if (autoLoad) {
        loadPreview();
      }
    }
  }, [configId, autoLoad, loadPreview]);

  // Refresh with new cache key
  const refresh = useCallback(async () => {
    setCacheKey(`${configId}-${Date.now()}`);
    await loadPreview();
  }, [configId, loadPreview]);

  // Get preview URL with cache-busting parameter
  const previewUrl = useMemo(() => {
    if (!previewData?.embedConfig?.embed_key) return null;
    const baseUrl = previewService.getPreviewUrl(
      previewData.embedConfig.embed_key,
      previewData.embedConfig
    );
    // Add cache-busting timestamp
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}_t=${cacheKey}`;
  }, [previewData, cacheKey]);

  // Get CSS variables from style
  const styleVariables = useMemo(() => {
    if (!previewData?.embedConfig?.style) return {};
    return previewService.getStyleVariables(previewData.embedConfig.style as EmbedStyle);
  }, [previewData]);

  return {
    previewData,
    loading,
    error,
    previewUrl,
    styleVariables,
    refresh,
    isLivePreview,
    setIsLivePreview,
    cacheKey,
  };
}
