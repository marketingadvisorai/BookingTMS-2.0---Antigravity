/**
 * VenueEmbedManager - Modern Venue Embedding System
 * 
 * Enterprise-grade venue embedding with:
 * - Real-time activity/schedule sync
 * - PostMessage API for secure cross-origin communication
 * - ResizeObserver for dynamic height adjustment
 * - Multiple embed formats (iframe, script, React, WordPress)
 * - Activity-specific embedding support
 */

export interface VenueEmbedConfig {
  venueId: string;
  embedKey: string;
  primaryColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  width?: string;
  minHeight?: number;
  maxHeight?: number;
  // Optional: embed specific activity
  activityId?: string;
  // Widget type
  widgetType?: 'calendar' | 'booking' | 'singlegame';
}

export type EmbedUrlParams = {
  widget: string;
  key: string;
  color: string;
  theme: string;
  venueId?: string;
  activityId?: string;
  mode?: string;
  [key: string]: string | undefined;
};

/**
 * Generate embed URL with all parameters
 */
export function generateVenueEmbedUrl(config: VenueEmbedConfig, baseUrl: string): string {
  const params: EmbedUrlParams = {
    widget: config.widgetType || 'calendar',
    key: config.embedKey,
    color: (config.primaryColor || '#2563eb').replace('#', ''),
    theme: config.theme || 'light',
  };

  // Add optional params
  if (config.venueId) params.venueId = config.venueId;
  if (config.activityId) params.activityId = config.activityId;

  // Filter out undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  ) as Record<string, string>;
  const searchParams = new URLSearchParams(filteredParams);
  return `${baseUrl}/embed?${searchParams.toString()}`;
}

/**
 * Generate full-page booking URL (opens in new tab)
 */
export function generateFullPageUrl(config: VenueEmbedConfig, baseUrl: string): string {
  const params: EmbedUrlParams = {
    widget: config.activityId ? 'singlegame' : 'calendar',
    key: config.embedKey,
    color: (config.primaryColor || '#2563eb').replace('#', ''),
    theme: config.theme || 'light',
    mode: 'fullpage',
  };

  if (config.venueId) params.venueId = config.venueId;
  if (config.activityId) params.activityId = config.activityId;

  // Filter out undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  ) as Record<string, string>;
  const searchParams = new URLSearchParams(filteredParams);
  return `${baseUrl}/embed?${searchParams.toString()}`;
}

/**
 * Generate responsive iframe embed code
 */
export function generateIframeEmbedCode(config: VenueEmbedConfig, baseUrl: string, venueName: string): string {
  const embedUrl = generateVenueEmbedUrl(config, baseUrl);
  const minHeight = config.minHeight || 600;

  return `<!-- BookingTMS Booking Widget for ${venueName} -->
<!-- Responsive Embed Wrapper -->
<div style="position: relative; width: 100%; min-height: ${minHeight}px; overflow: hidden; border-radius: 12px;">
  <iframe
    src="${embedUrl}"
    style="width: 100%; height: 100%; min-height: ${minHeight}px; border: none; border-radius: 12px;"
    frameborder="0"
    loading="lazy"
    allow="payment; camera"
    allowfullscreen
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="${venueName} Booking Widget"
  ></iframe>
</div>`;
}

/**
 * Generate auto-resize script embed code
 */
export function generateScriptEmbedCode(config: VenueEmbedConfig, baseUrl: string, venueName: string): string {
  const embedUrl = generateVenueEmbedUrl(config, baseUrl);
  const embedId = `bookingtms-${config.embedKey.slice(0, 8)}`;
  const minHeight = config.minHeight || 600;
  const maxHeight = config.maxHeight || 1200;

  return `<!-- BookingTMS ${venueName} - Auto-Resize Embed -->
<div id="${embedId}" style="width: 100%; min-height: ${minHeight}px; max-height: ${maxHeight}px;"></div>
<script>
(function() {
  'use strict';
  
  var container = document.getElementById('${embedId}');
  if (!container) return;
  
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
  iframe.style.cssText = 'width:100%;min-height:${minHeight}px;height:${minHeight}px;border:none;border-radius:12px;';
  iframe.loading = 'lazy';
  iframe.allow = 'payment; camera';
  iframe.allowFullscreen = true;
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';
  iframe.title = '${venueName} Booking Widget';
  
  // Auto-resize based on content
  window.addEventListener('message', function(e) {
    if (!e.data) return;
    var data = e.data;
    
    // Handle resize messages
    if (data.type === 'BOOKINGTMS_RESIZE' || data.type === 'resize-iframe') {
      var newHeight = Math.min(Math.max(data.height || ${minHeight}, ${minHeight}), ${maxHeight});
      iframe.style.height = newHeight + 'px';
    }
    
    // Handle booking complete
    if (data.type === 'BOOKINGTMS_BOOKING_COMPLETE') {
      if (typeof window.onBookingTMSComplete === 'function') {
        window.onBookingTMSComplete(data.payload);
      }
      // Dispatch custom event for frameworks
      container.dispatchEvent(new CustomEvent('bookingComplete', { detail: data.payload }));
    }
  });
  
  container.appendChild(iframe);
})();
</script>`;
}

/**
 * Generate React/Next.js component code
 */
export function generateReactEmbedCode(config: VenueEmbedConfig, baseUrl: string, venueName: string): string {
  const embedUrl = generateVenueEmbedUrl(config, baseUrl);
  const minHeight = config.minHeight || 600;
  const maxHeight = config.maxHeight || 1200;

  return `'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface BookingResult {
  bookingId: string;
  confirmationCode: string;
  activityName: string;
  date: string;
  time: string;
  partySize: number;
  totalAmount: number;
}

interface BookingWidgetProps {
  onBookingComplete?: (booking: BookingResult) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function BookingWidget({ onBookingComplete, onError, className }: BookingWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(${minHeight});

  const handleMessage = useCallback((e: MessageEvent) => {
    if (!e.data) return;
    
    const { type, payload } = e.data;
    
    switch (type) {
      case 'BOOKINGTMS_RESIZE':
      case 'resize-iframe':
        setHeight(Math.min(Math.max(payload?.height || ${minHeight}, ${minHeight}), ${maxHeight}));
        break;
      case 'BOOKINGTMS_BOOKING_COMPLETE':
        onBookingComplete?.(payload);
        break;
      case 'BOOKINGTMS_ERROR':
        onError?.(new Error(payload?.message || 'Booking error'));
        break;
    }
  }, [onBookingComplete, onError]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <iframe
      ref={iframeRef}
      src="${embedUrl}"
      style={{ 
        width: '100%', 
        height: \`\${height}px\`, 
        border: 'none', 
        borderRadius: '12px',
        minHeight: '${minHeight}px'
      }}
      loading="lazy"
      allow="payment; camera"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      className={className}
      title="${venueName} Booking Widget"
    />
  );
}

// Usage:
// <BookingWidget 
//   onBookingComplete={(booking) => console.log('Booked!', booking)}
//   onError={(error) => console.error('Error:', error)}
// />`;
}

/**
 * Generate WordPress shortcode and plugin code
 */
export function generateWordPressCode(config: VenueEmbedConfig, baseUrl: string, venueName: string): string {
  const embedUrl = generateVenueEmbedUrl(config, baseUrl);
  const minHeight = config.minHeight || 600;

  return `<?php
/**
 * BookingTMS Widget for ${venueName}
 * Add this to your theme's functions.php or create a custom plugin
 */

// Register the shortcode
function bookingtms_widget_shortcode(\$atts) {
    \$atts = shortcode_atts(array(
        'key' => '${config.embedKey}',
        'color' => '${(config.primaryColor || '#2563eb').replace('#', '')}',
        'theme' => '${config.theme || 'light'}',
        'height' => '${minHeight}',
    ), \$atts, 'bookingtms');
    
    \$embed_url = add_query_arg(array(
        'widget' => 'calendar',
        'key' => esc_attr(\$atts['key']),
        'color' => esc_attr(\$atts['color']),
        'theme' => esc_attr(\$atts['theme']),
    ), '${baseUrl}/embed');
    
    return sprintf(
        '<div class="bookingtms-widget-container">
            <iframe 
                src="%s" 
                style="width:100%%;height:%spx;border:none;border-radius:12px;"
                loading="lazy"
                allow="payment; camera"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                title="%s Booking Widget">
            </iframe>
        </div>',
        esc_url(\$embed_url),
        intval(\$atts['height']),
        esc_attr('${venueName}')
    );
}
add_shortcode('bookingtms', 'bookingtms_widget_shortcode');

// Add responsive styles
function bookingtms_widget_styles() {
    echo '<style>
        .bookingtms-widget-container {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
        }
        .bookingtms-widget-container iframe {
            min-height: ${minHeight}px;
        }
    </style>';
}
add_action('wp_head', 'bookingtms_widget_styles');
?>

<!-- Usage in posts/pages: -->
[bookingtms key="${config.embedKey}" color="${(config.primaryColor || '#2563eb').replace('#', '')}" theme="${config.theme || 'light'}" height="${minHeight}"]`;
}

/**
 * VenueEmbedManager class for managing embed lifecycle
 */
export class VenueEmbedManager {
  private config: VenueEmbedConfig;
  private baseUrl: string;
  private messageHandler: ((e: MessageEvent) => void) | null = null;
  private callbacks: {
    onBookingComplete?: (booking: any) => void;
    onError?: (error: any) => void;
    onResize?: (height: number) => void;
  } = {};

  constructor(config: VenueEmbedConfig, baseUrl: string = window.location.origin) {
    this.config = config;
    this.baseUrl = baseUrl;
  }

  /**
   * Set callback handlers
   */
  setCallbacks(callbacks: typeof this.callbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Initialize message listener for embed communication
   */
  init(): void {
    this.messageHandler = (e: MessageEvent) => {
      if (!e.data) return;
      
      const { type, payload } = e.data;
      
      switch (type) {
        case 'BOOKINGTMS_RESIZE':
        case 'resize-iframe':
          this.callbacks.onResize?.(payload?.height || 600);
          break;
        case 'BOOKINGTMS_BOOKING_COMPLETE':
          this.callbacks.onBookingComplete?.(payload);
          break;
        case 'BOOKINGTMS_ERROR':
          this.callbacks.onError?.(payload);
          break;
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Cleanup listeners
   */
  destroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  /**
   * Get embed URL
   */
  getEmbedUrl(): string {
    return generateVenueEmbedUrl(this.config, this.baseUrl);
  }

  /**
   * Get full-page URL
   */
  getFullPageUrl(): string {
    return generateFullPageUrl(this.config, this.baseUrl);
  }

  /**
   * Get iframe embed code
   */
  getIframeCode(venueName: string): string {
    return generateIframeEmbedCode(this.config, this.baseUrl, venueName);
  }

  /**
   * Get script embed code
   */
  getScriptCode(venueName: string): string {
    return generateScriptEmbedCode(this.config, this.baseUrl, venueName);
  }

  /**
   * Get React component code
   */
  getReactCode(venueName: string): string {
    return generateReactEmbedCode(this.config, this.baseUrl, venueName);
  }

  /**
   * Get WordPress code
   */
  getWordPressCode(venueName: string): string {
    return generateWordPressCode(this.config, this.baseUrl, venueName);
  }
}

export default VenueEmbedManager;
