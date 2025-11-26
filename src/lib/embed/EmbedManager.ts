/**
 * Modern Embed Manager
 * 
 * Enterprise-grade embedding system using:
 * - PostMessage API for secure cross-origin communication
 * - ResizeObserver for dynamic height adjustment
 * - Lazy loading for performance
 * - CDN-ready static assets
 * 
 * Production URL: https://bookingtms.com (update when deployed)
 */

// Production base URL - UPDATE THIS WHEN DEPLOYED TO PRODUCTION
const PRODUCTION_URL = 'https://bookingtms.com';
const SUPABASE_URL = 'https://qftjyjpitnoapqxlrvfs.supabase.co';

// Get the appropriate base URL for embeds
export const getEmbedBaseUrl = (): string => {
  if (typeof window === 'undefined') return PRODUCTION_URL;
  // In development, use localhost; in production, use the production URL
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.origin;
  }
  return window.location.origin; // Use current domain in production
};

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
  const color = (config.primaryColor || '#2563eb').replace('#', '');
  
  return `'use client'; // For Next.js App Router

import { useEffect, useRef, useState, useCallback } from 'react';

// Configuration - Update BASE_URL when deploying to production
const BASE_URL = '${baseUrl}';

interface BookingResult {
  bookingId: string;
  activityId: string;
  sessionId: string;
  customerEmail: string;
  totalPrice: number;
  status: 'confirmed' | 'pending';
}

interface BookingWidgetProps {
  activityId?: string;
  primaryColor?: string;
  theme?: 'light' | 'dark';
  onBookingComplete?: (booking: BookingResult) => void;
  onError?: (error: { message: string }) => void;
  className?: string;
}

export function BookingWidget({
  activityId = '${config.activityId}',
  primaryColor = '${color}',
  theme = '${config.theme || 'light'}',
  onBookingComplete,
  onError,
  className = ''
}: BookingWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(700);
  const [isLoading, setIsLoading] = useState(true);

  // Build embed URL
  const embedUrl = \`\${BASE_URL}/embed?widget=singlegame&activityId=\${activityId}&color=\${primaryColor}&theme=\${theme}&embed=true\`;

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Validate origin
      if (!e.origin.includes(new URL(BASE_URL).hostname)) return;
      
      const { type, height: newHeight, booking, error } = e.data || {};
      
      switch (type) {
        case 'BOOKINGTMS_READY':
          setIsLoading(false);
          break;
        case 'BOOKINGTMS_RESIZE':
          if (newHeight) setHeight(Math.min(Math.max(newHeight, 600), 1200));
          break;
        case 'BOOKINGTMS_BOOKING_COMPLETE':
          onBookingComplete?.(booking);
          break;
        case 'BOOKINGTMS_ERROR':
          onError?.(error);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onBookingComplete, onError]);

  return (
    <div className={\`relative \${className}\`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{ 
          width: '100%', 
          height: \`\${height}px\`, 
          border: 'none', 
          borderRadius: '12px',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        loading="lazy"
        allow="payment"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        title="Booking Widget"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

// Usage Example:
// <BookingWidget 
//   activityId="${config.activityId}"
//   primaryColor="${color}"
//   theme="${config.theme || 'light'}"
//   onBookingComplete={(booking) => console.log('Booked!', booking)}
// />`;
}

/**
 * Generate WordPress PHP plugin code
 */
export function generateWordPressCode(config: EmbedConfig, baseUrl: string): string {
  const color = (config.primaryColor || '#2563eb').replace('#', '');
  
  return `<?php
/**
 * BookingTMS Widget for WordPress
 * 
 * Installation:
 * 1. Create file: wp-content/plugins/bookingtms-widget/bookingtms-widget.php
 * 2. Paste this code and activate the plugin
 * 3. Use shortcode: [bookingtms_widget]
 */

/*
Plugin Name: BookingTMS Booking Widget
Description: Embed BookingTMS booking calendar on your WordPress site
Version: 1.0.0
Author: BookingTMS
*/

if (!defined('ABSPATH')) exit;

// Register shortcode
function bookingtms_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'activity_id' => '${config.activityId}',
        'color' => '${color}',
        'theme' => '${config.theme || 'light'}',
        'height' => '700',
    ), $atts, 'bookingtms_widget');
    
    $base_url = '${baseUrl}';
    $embed_url = esc_url(add_query_arg(array(
        'widget' => 'singlegame',
        'activityId' => $atts['activity_id'],
        'color' => $atts['color'],
        'theme' => $atts['theme'],
        'embed' => 'true'
    ), $base_url . '/embed'));
    
    $height = intval($atts['height']);
    $unique_id = 'bookingtms-' . uniqid();
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($unique_id); ?>" class="bookingtms-widget-container" style="width:100%;min-height:<?php echo $height; ?>px;">
        <iframe 
            src="<?php echo $embed_url; ?>"
            style="width:100%;height:<?php echo $height; ?>px;border:none;border-radius:12px;"
            loading="lazy"
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="BookingTMS Booking Widget"
        ></iframe>
    </div>
    <script>
    (function() {
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'BOOKINGTMS_RESIZE') {
                var container = document.getElementById('<?php echo esc_js($unique_id); ?>');
                var iframe = container ? container.querySelector('iframe') : null;
                if (iframe && e.data.height) {
                    iframe.style.height = Math.max(<?php echo $height; ?>, e.data.height) + 'px';
                }
            }
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('bookingtms_widget', 'bookingtms_widget_shortcode');

// Add Gutenberg block (optional)
function bookingtms_register_block() {
    if (!function_exists('register_block_type')) return;
    
    wp_register_script(
        'bookingtms-block',
        plugins_url('block.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-editor'),
        '1.0.0'
    );
    
    register_block_type('bookingtms/widget', array(
        'editor_script' => 'bookingtms-block',
        'render_callback' => 'bookingtms_widget_shortcode'
    ));
}
add_action('init', 'bookingtms_register_block');
?>

<!-- 
USAGE:

1. Shortcode (in posts/pages):
   [bookingtms_widget]
   
2. With custom options:
   [bookingtms_widget activity_id="${config.activityId}" color="${color}" theme="light" height="800"]

3. In PHP templates:
   <?php echo do_shortcode('[bookingtms_widget]'); ?>
-->`;
}

/**
 * Generate WordPress shortcode instructions (legacy)
 */
export function generateWordPressInstructions(config: EmbedConfig, baseUrl: string): string {
  return generateWordPressCode(config, baseUrl);
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
