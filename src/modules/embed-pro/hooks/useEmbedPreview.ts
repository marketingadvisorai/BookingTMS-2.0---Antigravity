/**
 * Embed Pro 1.1 - useEmbedPreview Hook
 * @module embed-pro/hooks/useEmbedPreview
 * 
 * Manages widget preview state and data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
}

export function useEmbedPreview(options: UseEmbedPreviewOptions): UseEmbedPreviewReturn {
  const { configId, autoLoad = true } = options;
  
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLivePreview, setIsLivePreview] = useState(true);

  // Fetch preview data
  const loadPreview = useCallback(async () => {
    if (!configId) {
      setPreviewData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await previewService.getPreviewData(configId);
      setPreviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load preview'));
    } finally {
      setLoading(false);
    }
  }, [configId]);

  // Get preview URL with full config for proper widget routing
  const previewUrl = useMemo(() => {
    if (!previewData?.embedConfig?.embed_key) return null;
    return previewService.getPreviewUrl(
      previewData.embedConfig.embed_key,
      previewData.embedConfig
    );
  }, [previewData]);

  // Get CSS variables from style
  const styleVariables = useMemo(() => {
    if (!previewData?.embedConfig?.style) return {};
    return previewService.getStyleVariables(previewData.embedConfig.style as EmbedStyle);
  }, [previewData]);

  // Auto-load on mount and config change
  useEffect(() => {
    if (autoLoad && configId) {
      loadPreview();
    }
  }, [autoLoad, configId, loadPreview]);

  return {
    previewData,
    loading,
    error,
    previewUrl,
    styleVariables,
    refresh: loadPreview,
    isLivePreview,
    setIsLivePreview,
  };
}
