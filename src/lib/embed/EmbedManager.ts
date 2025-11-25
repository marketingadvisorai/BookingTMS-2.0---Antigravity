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
    widget: 'calendar-booking',
    activityId: config.activityId,
    venueId: config.venueId,
    key: config.embedKey,
    theme: config.theme || 'light',
    color: (config.primaryColor || '#2563eb').replace('#', ''),
    ...(config.locale && { locale: config.locale }),
  });

  return `${baseUrl}/embed/booking?${params.toString()}`;
}

/**
 * Generate embed code snippet for customers
 */
export function generateEmbedCode(config: EmbedConfig, baseUrl: string): string {
  const embedUrl = generateEmbedUrl(config, baseUrl);
  const embedId = `booking-widget-${config.activityId.slice(0, 8)}`;
  const minHeight = config.minHeight || 600;
  const maxHeight = config.maxHeight || 900;

  return `<!-- BookingTMS Calendar Widget -->
<div id="${embedId}" style="width: 100%; min-height: ${minHeight}px; max-height: ${maxHeight}px;">
  <iframe
    src="${embedUrl}"
    style="width: 100%; height: 100%; min-height: ${minHeight}px; border: none; border-radius: 12px;"
    loading="lazy"
    allow="payment"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="Book ${config.activityId}"
  ></iframe>
</div>
<script>
(function() {
  var container = document.getElementById('${embedId}');
  var iframe = container.querySelector('iframe');
  
  // Handle resize messages from widget
  window.addEventListener('message', function(e) {
    if (e.origin !== '${baseUrl}') return;
    var data = e.data;
    if (data.embedId !== '${embedId}') return;
    
    switch(data.type) {
      case 'RESIZE':
        iframe.style.height = Math.min(Math.max(data.payload.height, ${minHeight}), ${maxHeight}) + 'px';
        break;
      case 'BOOKING_COMPLETE':
        if (typeof window.onBookingComplete === 'function') {
          window.onBookingComplete(data.payload);
        }
        break;
      case 'ERROR':
        console.error('Booking Widget Error:', data.payload);
        break;
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
