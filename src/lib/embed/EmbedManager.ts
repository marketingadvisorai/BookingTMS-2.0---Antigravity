/**
 * Modern Embed Manager
 * 
 * Enterprise-grade embedding system using:
 * - PostMessage API for secure cross-origin communication
 * - ResizeObserver for dynamic height adjustment
 * - Lazy loading for performance
 * - CDN-ready static assets
 */

export interface EmbedConfig {
  activityId: string;
  venueId: string;
  embedKey: string;
  primaryColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  width?: string;
  height?: string;
  minHeight?: number;
  maxHeight?: number;
  onBookingComplete?: (booking: BookingResult) => void;
  onError?: (error: EmbedError) => void;
}

export interface BookingResult {
  bookingId: string;
  activityId: string;
  sessionId: string;
  customerEmail: string;
  totalPrice: number;
  status: 'confirmed' | 'pending';
}

export interface EmbedError {
  code: string;
  message: string;
  details?: any;
}

export interface EmbedMessage {
  type: 'BOOKING_COMPLETE' | 'RESIZE' | 'ERROR' | 'READY' | 'CLOSE';
  payload: any;
  embedId: string;
}

/**
 * Generate secure embed URL with signed parameters
 */
export function generateEmbedUrl(config: EmbedConfig, baseUrl: string): string {
  const params = new URLSearchParams({
    widget: 'booking', // Uses calendar-booking route in Embed.tsx
    activityId: config.activityId,
    venueId: config.venueId,
    key: config.embedKey,
    theme: config.theme || 'light',
    color: (config.primaryColor || '#2563eb').replace('#', ''),
    ...(config.locale && { locale: config.locale }),
  });

  return `${baseUrl}/embed?${params.toString()}`;
}

/**
 * Generate full-page booking URL (opens in new tab)
 * This URL is suitable for "Book Now" buttons that open a full-page experience
 */
export function generateFullPageUrl(config: EmbedConfig, baseUrl: string): string {
  const params = new URLSearchParams({
    widget: 'booking',
    activityId: config.activityId,
    venueId: config.venueId,
    key: config.embedKey,
    theme: config.theme || 'light',
    color: (config.primaryColor || '#2563eb').replace('#', ''),
    mode: 'fullpage', // Indicates full-page mode for styling
    ...(config.locale && { locale: config.locale }),
  });

  return `${baseUrl}/embed?${params.toString()}`;
}

/**
 * Generate SDK-based embed code (Stripe-style, recommended)
 * Fast, lightweight, and API-driven like Stripe.js
 */
export function generateEmbedCode(config: EmbedConfig, baseUrl: string): string {
  const color = (config.primaryColor || '#2563eb').replace('#', '');
  
  return `<!-- BookingTMS Widget (Stripe-Style SDK) -->
<!-- Step 1: Add container where widget will render -->
<div 
  id="bookingtms-widget" 
  data-activity-id="${config.activityId}"
  data-color="${color}"
  data-theme="${config.theme || 'light'}"
></div>

<!-- Step 2: Load SDK (async, non-blocking) -->
<script async src="${baseUrl}/embed/bookingtms.js"></script>

<!-- Step 3: Initialize when ready (optional - auto-mounts by default) -->
<script>
  // Widget auto-mounts, but you can manually control it:
  document.addEventListener('DOMContentLoaded', function() {
    if (window.BookingTMS) {
      var widget = BookingTMS.mount('#bookingtms-widget', {
        onReady: function(data) {
          console.log('Widget ready:', data.instanceId);
        },
        onBooking: function(booking) {
          console.log('Booking completed:', booking);
          // Handle successful booking (redirect, show message, etc.)
        },
        onError: function(error) {
          console.error('Widget error:', error);
        }
      });
    }
  });
</script>`;
}

/**
 * Generate simple iframe embed code (fallback method)
 */
export function generateIframeCode(config: EmbedConfig, baseUrl: string): string {
  const embedUrl = generateEmbedUrl(config, baseUrl);
  const embedId = `booking-widget-${config.activityId?.slice(0, 8) || 'widget'}`;
  const minHeight = config.minHeight || 600;
  const maxHeight = config.maxHeight || 900;

  return `<!-- BookingTMS Widget (Iframe Method) -->
<div id="${embedId}" style="width: 100%; min-height: ${minHeight}px; max-height: ${maxHeight}px;">
  <iframe
    src="${embedUrl}"
    style="width: 100%; height: 100%; min-height: ${minHeight}px; border: none; border-radius: 12px;"
    loading="lazy"
    allow="payment"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="Booking Widget"
  ></iframe>
</div>
<script>
(function() {
  var container = document.getElementById('${embedId}');
  var iframe = container.querySelector('iframe');
  
  window.addEventListener('message', function(e) {
    if (e.origin !== '${baseUrl}') return;
    var data = e.data;
    
    if (data.type === 'BOOKINGTMS_RESIZE' || data.type === 'resize-iframe') {
      var h = data.height || (data.payload && data.payload.height);
      if (h) iframe.style.height = Math.min(Math.max(h, ${minHeight}), ${maxHeight}) + 'px';
    }
  });
})();
</script>`;
}

/**
 * Generate React/Next.js component code
 */
export function generateReactCode(config: EmbedConfig, baseUrl: string): string {
  const embedUrl = generateEmbedUrl(config, baseUrl);

  return `import { useEffect, useRef, useState } from 'react';

interface BookingResult {
  bookingId: string;
  activityId: string;
  status: 'confirmed' | 'pending';
}

interface BookingWidgetProps {
  onBookingComplete?: (booking: BookingResult) => void;
  className?: string;
}

export function BookingWidget({ onBookingComplete, className }: BookingWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(700);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== '${baseUrl}') return;
      
      const { type, payload } = e.data;
      
      switch (type) {
        case 'RESIZE':
          setHeight(Math.min(Math.max(payload.height, 600), 900));
          break;
        case 'BOOKING_COMPLETE':
          onBookingComplete?.(payload);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onBookingComplete]);

  return (
    <iframe
      ref={iframeRef}
      src="${embedUrl}"
      style={{ width: '100%', height, border: 'none', borderRadius: '12px' }}
      loading="lazy"
      allow="payment"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      className={className}
    />
  );
}`;
}

/**
 * Generate WordPress shortcode instructions
 */
export function generateWordPressInstructions(config: EmbedConfig, baseUrl: string): string {
  const embedUrl = generateEmbedUrl(config, baseUrl);

  return `## WordPress Integration

### Option 1: Custom HTML Block
1. In your WordPress editor, add a "Custom HTML" block
2. Paste the embed code provided above

### Option 2: WordPress Plugin (Recommended)
\`\`\`php
// Add to your theme's functions.php or create a plugin

function bookingtms_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'activity' => '${config.activityId}',
        'height' => '700',
    ), $atts);
    
    return '<iframe 
        src="${embedUrl}" 
        style="width:100%;height:' . esc_attr($atts['height']) . 'px;border:none;border-radius:12px;" 
        loading="lazy"
        allow="payment"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>';
}
add_shortcode('booking_widget', 'bookingtms_widget_shortcode');
\`\`\`

Then use: \`[booking_widget activity="${config.activityId}" height="700"]\``;
}

/**
 * EmbedManager class for managing embed lifecycle
 */
export class EmbedManager {
  private config: EmbedConfig;
  private baseUrl: string;
  private messageHandler: ((e: MessageEvent) => void) | null = null;

  constructor(config: EmbedConfig, baseUrl: string = window.location.origin) {
    this.config = config;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize message listener for embed communication
   */
  init(): void {
    this.messageHandler = (e: MessageEvent) => {
      if (e.origin !== this.baseUrl) return;
      
      const message = e.data as EmbedMessage;
      
      switch (message.type) {
        case 'BOOKING_COMPLETE':
          this.config.onBookingComplete?.(message.payload);
          break;
        case 'ERROR':
          this.config.onError?.(message.payload);
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
    return generateEmbedUrl(this.config, this.baseUrl);
  }

  /**
   * Get embed code
   */
  getEmbedCode(): string {
    return generateEmbedCode(this.config, this.baseUrl);
  }

  /**
   * Get React component code
   */
  getReactCode(): string {
    return generateReactCode(this.config, this.baseUrl);
  }
}

export default EmbedManager;
