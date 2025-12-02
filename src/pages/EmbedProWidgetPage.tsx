/**
 * Embed Pro Widget Page - Public Customer-Facing Booking Widget
 * @module pages/EmbedProWidgetPage
 * 
 * This is the public page that renders the booking widget for customers.
 * URL: /embed-pro-widget?key={embed_key}&theme={light|dark}
 * 
 * Features:
 * - Loads widget configuration from embed_key
 * - Renders the full booking flow
 * - Supports theme customization
 * - Multi-tenant safe (scoped by organization)
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Lazy load the booking container for better performance
const EmbedProContainer = lazy(() => 
  import('../modules/embed-pro/containers/EmbedProContainer')
);

// =====================================================
// TYPES
// =====================================================

interface EmbedConfig {
  id: string;
  embed_key: string;
  name: string;
  organization_id: string;
  target_type: 'activity' | 'venue' | 'multi-activity';
  target_id: string | null;
  target_ids: string[];
  type: string;
  config: Record<string, unknown>;
  style: {
    theme?: 'light' | 'dark';
    primaryColor?: string;
    [key: string]: unknown;
  };
  is_active: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

const EmbedProWidgetPage: React.FC = () => {
  const [embedKey, setEmbedKey] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');
    const themeParam = urlParams.get('theme');

    setEmbedKey(key);
    setTheme(themeParam === 'dark' ? 'dark' : 'light');

    console.log('[EmbedProWidgetPage] Initialized with:', { key, theme: themeParam });
  }, []);

  // Fetch embed configuration
  useEffect(() => {
    if (!embedKey) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('embed_configs')
          .select('*')
          .eq('embed_key', embedKey)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Widget not found or inactive');
          } else {
            setError('Failed to load widget configuration');
          }
          console.error('[EmbedProWidgetPage] Fetch error:', fetchError);
          return;
        }

        const configData = data as unknown as EmbedConfig;
        setConfig(configData);
        
        // Apply theme from config if not overridden in URL
        if (configData?.style?.theme && !window.location.search.includes('theme=')) {
          setTheme(configData.style.theme as 'light' | 'dark');
        }

        // Track widget view
        await trackWidgetView(configData.id);
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('[EmbedProWidgetPage] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [embedKey]);

  // Apply theme to document
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      html.classList.add('dark');
      html.style.backgroundColor = '#0a0a0a';
      body.style.backgroundColor = '#0a0a0a';
    } else {
      html.classList.remove('dark');
      html.style.backgroundColor = '#ffffff';
      body.style.backgroundColor = '#ffffff';
    }

    // Prevent horizontal scroll
    html.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';

    return () => {
      html.classList.remove('dark');
    };
  }, [theme]);

  // Send height updates to parent (for iframe embedding)
  useEffect(() => {
    const sendHeightUpdate = () => {
      if (window.parent !== window) {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage(
          { type: 'EMBED_PRO_RESIZE', height },
          '*'
        );
      }
    };

    setTimeout(sendHeightUpdate, 500);
    const observer = new ResizeObserver(sendHeightUpdate);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  // Track widget view for analytics
  const trackWidgetView = async (configId: string) => {
    try {
      await supabase.from('embed_analytics').insert({
        embed_config_id: configId,
        event_type: 'view',
        metadata: {
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        },
      } as never);
    } catch (err) {
      console.warn('[EmbedProWidgetPage] Failed to track view:', err);
    }
  };

  // Handle booking completion
  const handleBookingComplete = async (bookingId: string) => {
    console.log('[EmbedProWidgetPage] Booking completed:', bookingId);

    // Track booking completion
    if (config?.id) {
      try {
        await supabase.from('embed_analytics').insert({
          embed_config_id: config.id,
          event_type: 'booking_completed',
          metadata: { bookingId },
        } as never);
      } catch (err) {
        console.warn('Failed to track booking:', err);
      }
    }

    // Notify parent window
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'EMBED_PRO_BOOKING_COMPLETE', bookingId },
        '*'
      );
    }
  };

  // Background color based on theme
  const bgClass = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white';

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Loading booking widget...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !embedKey) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <div className={`text-center max-w-md mx-auto p-8 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {error || 'Missing Widget Key'}
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {!embedKey 
              ? 'Please provide a valid widget key in the URL.'
              : 'The booking widget could not be loaded. Please try again later.'
            }
          </p>
          <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Contact support if this issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${bgClass}`}>
      <div className="w-full max-w-2xl mx-auto py-4 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        }>
          <EmbedProContainer
            embedKey={embedKey}
            theme={theme}
            isPreview={false}
            onBookingComplete={handleBookingComplete}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default EmbedProWidgetPage;
