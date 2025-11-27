/**
 * Embed Pro 2.0 - Page Component
 * @module embed-pro/pages/EmbedProPage
 * 
 * Main entry point for the Embed Pro widget system.
 * Parses URL parameters and renders the appropriate container.
 * 
 * URL: /embed-pro?key={embed_key}&theme={light|dark}&preview={true|false}
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EmbedProContainer } from '../containers';

// =====================================================
// COMPONENT
// =====================================================

export const EmbedProPage: React.FC = () => {
  const [params, setParams] = useState<{
    embedKey: string | null;
    theme: 'light' | 'dark';
    isPreview: boolean;
  }>({
    embedKey: null,
    theme: 'light',
    isPreview: false,
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const embedKey = urlParams.get('key');
    const themeParam = urlParams.get('theme');
    const previewParam = urlParams.get('preview');

    setParams({
      embedKey,
      theme: themeParam === 'dark' ? 'dark' : 'light',
      isPreview: previewParam === 'true',
    });

    console.log('[EmbedProPage] Initialized with params:', {
      embedKey,
      theme: themeParam,
      preview: previewParam,
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

  return (
    <div className={`min-h-screen w-full ${bgClass}`}>
      <div className="w-full max-w-2xl mx-auto py-4 px-4">
        <EmbedProContainer
          embedKey={params.embedKey}
          theme={params.theme}
          isPreview={params.isPreview}
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </div>
  );
};

export default EmbedProPage;
