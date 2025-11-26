/**
 * BookingTMS Embed SDK v1.0
 * Stripe-style lightweight embedding system
 * 
 * Usage:
 * <script src="https://your-domain.com/embed/bookingtms.js"></script>
 * <div id="bookingtms-widget" data-activity-id="xxx" data-color="2563eb"></div>
 * <script>BookingTMS.mount('#bookingtms-widget');</script>
 */

(function(window, document) {
  'use strict';

  const VERSION = '1.0.0';
  const API_BASE = window.BOOKINGTMS_API_URL || 'https://qftjyjpitnoapqxlrvfs.supabase.co/functions/v1';
  const WIDGET_BASE = window.BOOKINGTMS_WIDGET_URL || window.location.origin;

  // Styles for the widget container
  const CONTAINER_STYLES = `
    .bookingtms-container {
      width: 100%;
      min-height: 600px;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .bookingtms-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #64748b;
    }
    .bookingtms-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--btms-primary, #2563eb);
      border-radius: 50%;
      animation: bookingtms-spin 0.8s linear infinite;
    }
    @keyframes bookingtms-spin {
      to { transform: rotate(360deg); }
    }
    .bookingtms-error {
      padding: 24px;
      text-align: center;
      color: #dc2626;
      background: #fef2f2;
      border-radius: 8px;
      margin: 20px;
    }
    .bookingtms-iframe {
      width: 100%;
      min-height: 700px;
      border: none;
      border-radius: 12px;
      background: transparent;
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('bookingtms-styles')) return;
    const style = document.createElement('style');
    style.id = 'bookingtms-styles';
    style.textContent = CONTAINER_STYLES;
    document.head.appendChild(style);
  }

  // Create loading state
  function createLoader(primaryColor) {
    return `
      <div class="bookingtms-loading">
        <div class="bookingtms-spinner" style="border-top-color: ${primaryColor}"></div>
        <p style="margin-top: 16px; font-size: 14px;">Loading booking widget...</p>
      </div>
    `;
  }

  // Create error state
  function createError(message) {
    return `
      <div class="bookingtms-error">
        <strong>Unable to load booking widget</strong>
        <p style="margin-top: 8px; font-size: 14px;">${message}</p>
      </div>
    `;
  }

  // Main SDK object
  const BookingTMS = {
    version: VERSION,
    instances: new Map(),

    /**
     * Mount widget to a container
     * @param {string|Element} selector - CSS selector or DOM element
     * @param {Object} options - Configuration options
     */
    mount: function(selector, options = {}) {
      injectStyles();

      const container = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;

      if (!container) {
        console.error('[BookingTMS] Container not found:', selector);
        return null;
      }

      // Get options from data attributes or passed options
      const config = {
        activityId: options.activityId || container.dataset.activityId,
        venueId: options.venueId || container.dataset.venueId,
        color: options.color || container.dataset.color || '2563eb',
        theme: options.theme || container.dataset.theme || 'light',
        onReady: options.onReady || function() {},
        onError: options.onError || function() {},
        onBooking: options.onBooking || function() {},
      };

      if (!config.activityId) {
        container.innerHTML = createError('Activity ID is required. Add data-activity-id attribute.');
        return null;
      }

      // Set primary color CSS variable
      container.style.setProperty('--btms-primary', `#${config.color}`);
      container.classList.add('bookingtms-container');
      container.innerHTML = createLoader(`#${config.color}`);

      // Create widget instance
      const instanceId = 'btms-' + Math.random().toString(36).substr(2, 9);
      
      // Build iframe URL with params
      const iframeUrl = new URL(`${WIDGET_BASE}/embed`);
      iframeUrl.searchParams.set('widget', 'singlegame');
      iframeUrl.searchParams.set('activityId', config.activityId);
      if (config.venueId) iframeUrl.searchParams.set('venueId', config.venueId);
      iframeUrl.searchParams.set('color', config.color);
      iframeUrl.searchParams.set('theme', config.theme);
      iframeUrl.searchParams.set('embed', 'true');
      iframeUrl.searchParams.set('instanceId', instanceId);

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'bookingtms-iframe';
      iframe.src = iframeUrl.toString();
      iframe.title = 'BookingTMS Booking Widget';
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow', 'payment');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');

      // Handle iframe load
      iframe.onload = function() {
        config.onReady({ instanceId, activityId: config.activityId });
      };

      iframe.onerror = function() {
        container.innerHTML = createError('Failed to load widget. Please try again.');
        config.onError({ message: 'Iframe load failed' });
      };

      // Listen for messages from iframe
      const messageHandler = function(event) {
        if (!event.data || !event.data.type) return;
        if (!event.data.type.startsWith('BOOKINGTMS_')) return;
        if (event.data.instanceId !== instanceId) return;

        switch (event.data.type) {
          case 'BOOKINGTMS_READY':
            // Widget is ready
            break;
          case 'BOOKINGTMS_RESIZE':
            if (event.data.height) {
              iframe.style.height = Math.max(600, event.data.height) + 'px';
            }
            break;
          case 'BOOKINGTMS_BOOKING_COMPLETE':
            config.onBooking(event.data.booking);
            break;
          case 'BOOKINGTMS_ERROR':
            config.onError(event.data);
            break;
        }
      };

      window.addEventListener('message', messageHandler);

      // Replace loader with iframe
      setTimeout(function() {
        container.innerHTML = '';
        container.appendChild(iframe);
      }, 300);

      // Store instance
      const instance = {
        id: instanceId,
        container: container,
        iframe: iframe,
        config: config,
        destroy: function() {
          window.removeEventListener('message', messageHandler);
          container.innerHTML = '';
          BookingTMS.instances.delete(instanceId);
        }
      };

      this.instances.set(instanceId, instance);
      return instance;
    },

    /**
     * Mount all widgets with data-bookingtms attribute
     */
    mountAll: function() {
      const containers = document.querySelectorAll('[data-bookingtms], [data-activity-id]');
      containers.forEach(function(container) {
        if (!container.dataset.mounted) {
          BookingTMS.mount(container);
          container.dataset.mounted = 'true';
        }
      });
    },

    /**
     * Destroy a widget instance
     */
    destroy: function(instanceId) {
      const instance = this.instances.get(instanceId);
      if (instance) {
        instance.destroy();
      }
    },

    /**
     * Destroy all widget instances
     */
    destroyAll: function() {
      this.instances.forEach(function(instance) {
        instance.destroy();
      });
    }
  };

  // Auto-mount on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      BookingTMS.mountAll();
    });
  } else {
    BookingTMS.mountAll();
  }

  // Expose to global
  window.BookingTMS = BookingTMS;

})(window, document);
