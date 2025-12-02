/**
 * BookFlow Widget Embed SDK v2.0
 * Modern, lightweight embedding system for Embed Pro
 * 
 * Usage (Script Tag):
 * <script 
 *   src="https://your-domain.com/embed/bookflow.js"
 *   data-key="emb_xxx"
 *   data-theme="light"
 *   data-color="#2563eb"
 *   async>
 * </script>
 * 
 * Usage (Manual):
 * BookFlow.mount('#container', { key: 'emb_xxx', theme: 'light' });
 */

(function(window, document) {
  'use strict';

  const VERSION = '2.0.0';
  const SDK_NAME = 'BookFlow';

  // Auto-detect base URL from script src
  function getBaseUrl() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src;
      if (src && src.includes('bookflow.js')) {
        return src.replace(/\/embed\/bookflow\.js.*$/, '');
      }
    }
    return window.location.origin;
  }

  const BASE_URL = getBaseUrl();

  // Widget styles
  const STYLES = `
    .bookflow-container {
      width: 100%;
      min-height: 500px;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .bookflow-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #64748b;
    }
    .bookflow-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--bf-primary, #2563eb);
      border-radius: 50%;
      animation: bf-spin 0.7s linear infinite;
    }
    @keyframes bf-spin {
      to { transform: rotate(360deg); }
    }
    .bookflow-error {
      padding: 32px;
      text-align: center;
      color: #dc2626;
      background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%);
      border-radius: 12px;
      margin: 16px;
      border: 1px solid #fecaca;
    }
    .bookflow-iframe {
      width: 100%;
      min-height: 600px;
      border: none;
      border-radius: 12px;
      background: transparent;
      transition: opacity 0.3s ease;
    }
    .bookflow-iframe.loading {
      opacity: 0;
    }
    .bookflow-iframe.loaded {
      opacity: 1;
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('bookflow-styles')) return;
    const style = document.createElement('style');
    style.id = 'bookflow-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // Create loading state
  function createLoader(color) {
    return `
      <div class="bookflow-loader">
        <div class="bookflow-spinner" style="border-top-color: ${color}"></div>
        <p style="margin-top: 16px; font-size: 14px; opacity: 0.8;">Loading booking widget...</p>
      </div>
    `;
  }

  // Create error state
  function createError(message) {
    return `
      <div class="bookflow-error">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin: 0 auto 12px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <strong style="display: block; margin-bottom: 8px;">Unable to load booking widget</strong>
        <p style="font-size: 14px; opacity: 0.8;">${message}</p>
      </div>
    `;
  }

  // Main SDK
  const BookFlow = {
    version: VERSION,
    instances: new Map(),
    baseUrl: BASE_URL,

    /**
     * Mount a widget
     * @param {string|Element} selector - Container selector or element
     * @param {Object} options - Widget options
     */
    mount: function(selector, options = {}) {
      injectStyles();

      const container = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;

      if (!container) {
        console.error(`[${SDK_NAME}] Container not found:`, selector);
        return null;
      }

      // Build config from options or data attributes
      const config = {
        key: options.key || container.dataset.key,
        theme: options.theme || container.dataset.theme || 'light',
        color: options.color || container.dataset.color || '#2563eb',
        onReady: options.onReady || function() {},
        onError: options.onError || function() {},
        onBookingComplete: options.onBookingComplete || function() {},
        onResize: options.onResize || function() {},
      };

      if (!config.key) {
        container.innerHTML = createError('Widget key is required. Add data-key attribute.');
        return null;
      }

      // Setup container
      container.style.setProperty('--bf-primary', config.color);
      container.classList.add('bookflow-container');
      container.innerHTML = createLoader(config.color);

      // Generate instance ID
      const instanceId = 'bf-' + Math.random().toString(36).substr(2, 9);

      // Build iframe URL
      const iframeUrl = new URL(`${BASE_URL}/embed-pro-widget`);
      iframeUrl.searchParams.set('key', config.key);
      iframeUrl.searchParams.set('theme', config.theme);
      iframeUrl.searchParams.set('instanceId', instanceId);

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'bookflow-iframe loading';
      iframe.src = iframeUrl.toString();
      iframe.title = 'BookFlow Booking Widget';
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow', 'payment');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');

      // Handle iframe load
      iframe.onload = function() {
        iframe.classList.remove('loading');
        iframe.classList.add('loaded');
        config.onReady({ instanceId, key: config.key });
      };

      iframe.onerror = function() {
        container.innerHTML = createError('Failed to load widget. Please refresh and try again.');
        config.onError({ message: 'Failed to load iframe' });
      };

      // Message handler for iframe communication
      const messageHandler = function(event) {
        if (!event.data || !event.data.type) return;
        if (!event.data.type.startsWith('EMBED_PRO_')) return;

        switch (event.data.type) {
          case 'EMBED_PRO_RESIZE':
            if (event.data.height) {
              const newHeight = Math.max(500, event.data.height);
              iframe.style.height = newHeight + 'px';
              config.onResize({ height: newHeight });
            }
            break;

          case 'EMBED_PRO_BOOKING_COMPLETE':
            config.onBookingComplete({ 
              bookingId: event.data.bookingId,
              instanceId: instanceId 
            });
            break;

          case 'EMBED_PRO_ERROR':
            config.onError(event.data);
            break;
        }
      };

      window.addEventListener('message', messageHandler);

      // Replace loader with iframe after short delay for smooth transition
      setTimeout(function() {
        container.innerHTML = '';
        container.appendChild(iframe);
      }, 200);

      // Create instance object
      const instance = {
        id: instanceId,
        container: container,
        iframe: iframe,
        config: config,
        destroy: function() {
          window.removeEventListener('message', messageHandler);
          container.innerHTML = '';
          container.classList.remove('bookflow-container');
          BookFlow.instances.delete(instanceId);
        },
        refresh: function() {
          iframe.src = iframeUrl.toString();
        }
      };

      this.instances.set(instanceId, instance);
      return instance;
    },

    /**
     * Auto-mount all containers with data-key attribute
     */
    mountAll: function() {
      const containers = document.querySelectorAll('[data-bookflow], [data-key]:not([data-mounted])');
      containers.forEach(function(container) {
        // Check if it's meant for BookFlow (not other widgets)
        const key = container.dataset.key;
        if (key && key.startsWith('emb_')) {
          BookFlow.mount(container);
          container.dataset.mounted = 'true';
        }
      });
    },

    /**
     * Destroy a specific instance
     */
    destroy: function(instanceId) {
      const instance = this.instances.get(instanceId);
      if (instance) {
        instance.destroy();
      }
    },

    /**
     * Destroy all instances
     */
    destroyAll: function() {
      this.instances.forEach(function(instance) {
        instance.destroy();
      });
    }
  };

  // Auto-initialize from script tag data attributes
  function autoInit() {
    // Find the script tag
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      if (script.src && script.src.includes('bookflow.js') && script.dataset.key) {
        // Create container before this script
        const containerId = 'bookflow-widget-' + script.dataset.key;
        let container = document.getElementById(containerId);
        
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          script.parentNode.insertBefore(container, script);
        }

        BookFlow.mount(container, {
          key: script.dataset.key,
          theme: script.dataset.theme || 'light',
          color: script.dataset.color || '#2563eb',
        });
        break;
      }
    }

    // Also mount any existing containers
    BookFlow.mountAll();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Expose globally
  window.BookFlow = BookFlow;

})(window, document);
