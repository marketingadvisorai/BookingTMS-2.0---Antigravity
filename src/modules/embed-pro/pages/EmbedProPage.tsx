/**
 * Embed Pro 2.0 - Page Component
 * @module embed-pro/pages/EmbedProPage
 * 
 * Main entry point for the Embed Pro widget system.
 * Parses URL parameters and renders the appropriate container.
 * Wrapped with ErrorBoundary for crash protection.
 * Uses React.lazy for code splitting and bundle optimization.
 * Includes i18n provider for multi-language support.
 * 
 * URL: /embed-pro?key={embed_key}&theme={light|dark}&preview={true|false}&lang={en|es|fr}
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { WidgetErrorBoundary, WidgetLoading } from '../widget-components';
import { I18nProvider } from '../i18n';
import type { SupportedLocale } from '../i18n/types';

// Lazy load the container for better initial load performance
const EmbedProContainer = lazy(() => import('../containers/EmbedProContainer'));

// =====================================================
// COMPONENT
// =====================================================

export const EmbedProPage: React.FC = () => {
  const [params, setParams] = useState<{
    embedKey: string | null;
    theme: 'light' | 'dark';
    isPreview: boolean;
    locale: SupportedLocale | undefined;
  }>({
    embedKey: null,
    theme: 'light',
    isPreview: false,
    locale: undefined,
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const embedKey = urlParams.get('key');
    const themeParam = urlParams.get('theme');
    const previewParam = urlParams.get('preview');
    const langParam = urlParams.get('lang');

    // Validate locale
    const validLocales: SupportedLocale[] = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'zh'];
    const locale = validLocales.includes(langParam as SupportedLocale) 
      ? (langParam as SupportedLocale) 
      : undefined;

    setParams({
      embedKey,
      theme: themeParam === 'dark' ? 'dark' : 'light',
      isPreview: previewParam === 'true',
      locale,
    });

    console.log('[EmbedProPage] Initialized with params:', {
      embedKey,
      theme: themeParam,
      preview: previewParam,
      lang: langParam,
    });
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Store previous styles
    const prevStyles = {
      htmlBg: html.style.backgroundColor,
      bodyBg: body.style.backgroundColor,
    };

    // Apply theme
    if (params.theme === 'dark') {
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
      html.style.backgroundColor = prevStyles.htmlBg;
      body.style.backgroundColor = prevStyles.bodyBg;
    };
  }, [params.theme]);

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

    // Initial height
    setTimeout(sendHeightUpdate, 500);

    // Watch for resize
    const observer = new ResizeObserver(sendHeightUpdate);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  // Handle booking completion
  const handleBookingComplete = (bookingId: string) => {
    console.log('[EmbedProPage] Booking completed:', bookingId);
    
    // Notify parent window
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'EMBED_PRO_BOOKING_COMPLETE', bookingId },
        '*'
      );
    }
  };

  // Background color based on theme
  const bgClass = params.theme === 'dark' 
    ? 'bg-[#0a0a0a]' 
    : 'bg-white';

  // Handle error boundary errors
  const handleWidgetError = (error: Error) => {
    console.error('[EmbedProPage] Widget error caught by boundary:', error.message);
    
    // Notify parent window of error
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'EMBED_PRO_ERROR', error: error.message },
        '*'
      );
    }
  };

  return (
    <I18nProvider initialLocale={params.locale}>
      <div className={`min-h-screen w-full ${bgClass}`}>
        <div className="w-full max-w-2xl mx-auto py-4 px-4">
          <WidgetErrorBoundary
            onError={handleWidgetError}
            primaryColor="#2563eb"
            showRetry={true}
          >
            <Suspense fallback={<WidgetLoading />}>
              <EmbedProContainer
                embedKey={params.embedKey}
                theme={params.theme}
                isPreview={params.isPreview}
                onBookingComplete={handleBookingComplete}
              />
            </Suspense>
          </WidgetErrorBoundary>
        </div>
      </div>
    </I18nProvider>
  );
};

export default EmbedProPage;
