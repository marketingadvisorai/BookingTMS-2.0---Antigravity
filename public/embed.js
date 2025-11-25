/**
 * BookingTMS Embed SDK v1.0
 * 
 * Similar to Stripe.js - A lightweight SDK for embedding booking widgets.
 * Usage:
 *   <script src="https://yourapp.com/embed.js"></script>
 *   <script>
 *     BookingTMS.init({ key: 'your-embed-key' });
 *     BookingTMS.mount('#booking-widget');
 *   </script>
 */

(function(window, document) {
  'use strict';

  // Prevent multiple initializations
  if (window.BookingTMS) {
    console.warn('BookingTMS already initialized');
    return;
  }

  var VERSION = '1.0.0';
  var BASE_URL = window.BOOKINGTMS_BASE_URL || window.location.origin;
  var EMBED_PATH = '/embed';

  // Default configuration
  var defaultConfig = {
    key: null,
    theme: 'light',
    primaryColor: '2563eb',
    width: '100%',
    minHeight: 600,
    maxHeight: 1200,
    locale: 'en',
    showBranding: true
  };

  // Current configuration
  var config = Object.assign({}, defaultConfig);
  var mountedElements = [];
  var isReady = false;
  var readyCallbacks = [];

  /**
   * Generate unique ID for iframe
   */
  function generateId() {
    return 'btms-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Build embed URL with parameters
   */
  function buildEmbedUrl(options) {
    var params = new URLSearchParams();
    
    // Required
    if (options.key) params.set('key', options.key);
    
    // Widget type
    params.set('widget', options.widget || 'calendar');
    
    // Optional parameters
    if (options.theme) params.set('theme', options.theme);
    if (options.primaryColor) params.set('color', options.primaryColor.replace('#', ''));
    if (options.activityId) params.set('activityId', options.activityId);
    if (options.venueId) params.set('venueId', options.venueId);
    if (options.locale) params.set('locale', options.locale);
    if (options.mode) params.set('mode', options.mode);
    
    return BASE_URL + EMBED_PATH + '?' + params.toString();
  }

  /**
   * Create loading placeholder
   */
  function createLoader(container) {
    var loader = document.createElement('div');
    loader.className = 'btms-loader';
    loader.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:center;min-height:400px;background:#f9fafb;border-radius:8px;">',
      '  <div style="text-align:center;">',
      '    <div style="width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:#' + (config.primaryColor || '2563eb') + ';border-radius:50%;animation:btms-spin 1s linear infinite;margin:0 auto 16px;"></div>',
      '    <p style="color:#6b7280;font-family:system-ui,sans-serif;font-size:14px;margin:0;">Loading booking widget...</p>',
      '  </div>',
      '</div>',
      '<style>@keyframes btms-spin{to{transform:rotate(360deg)}}</style>'
    ].join('');
    container.appendChild(loader);
    return loader;
  }

  /**
   * Create error placeholder
   */
  function createError(container, message) {
    var error = document.createElement('div');
    error.className = 'btms-error';
    error.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:center;min-height:200px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:24px;">',
      '  <div style="text-align:center;">',
      '    <svg style="width:48px;height:48px;color:#ef4444;margin:0 auto 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
      '      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
      '    </svg>',
      '    <p style="color:#991b1b;font-family:system-ui,sans-serif;font-size:14px;margin:0;">' + (message || 'Unable to load booking widget') + '</p>',
      '    <button onclick="BookingTMS.retry(this.parentElement.parentElement.parentElement)" style="margin-top:12px;padding:8px 16px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Retry</button>',
      '  </div>',
      '</div>'
    ].join('');
    container.appendChild(error);
    return error;
  }

  /**
   * Create iframe element
   */
  function createIframe(options) {
    var iframe = document.createElement('iframe');
    var id = generateId();
    
    iframe.id = id;
    iframe.src = buildEmbedUrl(options);
    iframe.style.cssText = [
      'width:' + (options.width || '100%'),
      'min-height:' + (options.minHeight || 600) + 'px',
      'max-height:' + (options.maxHeight || 1200) + 'px',
      'border:none',
      'border-radius:8px',
      'background:transparent',
      'display:block',
      'overflow:hidden'
    ].join(';');
    
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allow', 'payment');
    iframe.setAttribute('title', 'Booking Widget');
    iframe.setAttribute('loading', 'lazy');
    
    return iframe;
  }

  /**
   * Handle postMessage from iframe
   */
  function handleMessage(event) {
    // Validate origin
    if (event.origin !== BASE_URL) return;
    
    var data = event.data;
    if (!data || typeof data !== 'object') return;
    
    switch (data.type) {
      case 'BOOKINGTMS_WIDGET_LOADED':
        // Widget is ready
        var iframe = document.querySelector('iframe[src*="key=' + data.key + '"]');
        if (iframe) {
          iframe.style.opacity = '1';
          var loader = iframe.parentElement.querySelector('.btms-loader');
          if (loader) loader.remove();
        }
        break;
        
      case 'BOOKINGTMS_RESIZE':
      case 'resize-iframe':
        // Resize iframe to fit content
        var height = data.height || data.payload?.height;
        if (height) {
          var iframes = document.querySelectorAll('iframe[id^="btms-"]');
          iframes.forEach(function(iframe) {
            iframe.style.height = Math.min(Math.max(height, config.minHeight), config.maxHeight) + 'px';
          });
        }
        break;
        
      case 'BOOKINGTMS_BOOKING_COMPLETE':
        // Booking completed - dispatch custom event
        var completeEvent = new CustomEvent('bookingtms:complete', {
          detail: data.payload
        });
        document.dispatchEvent(completeEvent);
        break;
        
      case 'BOOKINGTMS_ERROR':
        // Handle error from widget
        console.error('[BookingTMS] Widget error:', data.message);
        var errorEvent = new CustomEvent('bookingtms:error', {
          detail: { message: data.message }
        });
        document.dispatchEvent(errorEvent);
        break;
    }
  }

  /**
   * Initialize the SDK
   */
  function init(options) {
    if (!options) {
      console.error('[BookingTMS] init() requires configuration object');
      return;
    }
    
    // Merge with defaults
    config = Object.assign({}, defaultConfig, options);
    
    // Validate required fields
    if (!config.key) {
      console.error('[BookingTMS] "key" is required in configuration');
      return;
    }
    
    // Listen for messages
    window.addEventListener('message', handleMessage, false);
    
    isReady = true;
    
    // Execute ready callbacks
    readyCallbacks.forEach(function(cb) {
      try { cb(); } catch (e) { console.error(e); }
    });
    readyCallbacks = [];
    
    return BookingTMS;
  }

  /**
   * Mount widget to a container
   */
  function mount(selector, options) {
    var container;
    
    if (typeof selector === 'string') {
      container = document.querySelector(selector);
    } else if (selector instanceof HTMLElement) {
      container = selector;
    }
    
    if (!container) {
      console.error('[BookingTMS] Container not found:', selector);
      return null;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Merge options
    var mountOptions = Object.assign({}, config, options || {});
    
    // Show loader
    var loader = createLoader(container);
    
    // Create iframe
    var iframe = createIframe(mountOptions);
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.3s ease';
    
    // Handle load error
    var loadTimeout = setTimeout(function() {
      loader.remove();
      iframe.remove();
      createError(container, 'Widget failed to load. Please try again.');
    }, 15000); // 15 second timeout
    
    iframe.onload = function() {
      clearTimeout(loadTimeout);
      // Loader removed via postMessage when widget is ready
    };
    
    iframe.onerror = function() {
      clearTimeout(loadTimeout);
      loader.remove();
      iframe.remove();
      createError(container, 'Unable to load booking widget.');
    };
    
    container.appendChild(iframe);
    
    // Track mounted element
    var mountInfo = {
      container: container,
      iframe: iframe,
      options: mountOptions
    };
    mountedElements.push(mountInfo);
    
    return {
      unmount: function() {
        container.innerHTML = '';
        var index = mountedElements.indexOf(mountInfo);
        if (index > -1) mountedElements.splice(index, 1);
      },
      update: function(newOptions) {
        var updated = Object.assign({}, mountOptions, newOptions);
        iframe.src = buildEmbedUrl(updated);
        mountInfo.options = updated;
      }
    };
  }

  /**
   * Retry loading widget
   */
  function retry(container) {
    if (!container) return;
    
    var error = container.querySelector('.btms-error');
    if (error) error.remove();
    
    // Find the original mount info
    var mountInfo = mountedElements.find(function(m) {
      return m.container === container || m.container.contains(container);
    });
    
    if (mountInfo) {
      mount(mountInfo.container, mountInfo.options);
    }
  }

  /**
   * Register callback for when SDK is ready
   */
  function ready(callback) {
    if (typeof callback !== 'function') return;
    
    if (isReady) {
      callback();
    } else {
      readyCallbacks.push(callback);
    }
  }

  /**
   * Destroy all widgets
   */
  function destroy() {
    mountedElements.forEach(function(m) {
      m.container.innerHTML = '';
    });
    mountedElements = [];
    window.removeEventListener('message', handleMessage);
    isReady = false;
  }

  // Public API
  window.BookingTMS = {
    version: VERSION,
    init: init,
    mount: mount,
    retry: retry,
    ready: ready,
    destroy: destroy,
    
    // Convenience methods for different widget types
    calendar: function(selector, options) {
      return mount(selector, Object.assign({ widget: 'calendar' }, options));
    },
    booking: function(selector, options) {
      return mount(selector, Object.assign({ widget: 'booking' }, options));
    }
  };

  // Auto-initialize if data attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    var autoInit = document.querySelector('[data-bookingtms-key]');
    if (autoInit) {
      init({
        key: autoInit.getAttribute('data-bookingtms-key'),
        theme: autoInit.getAttribute('data-bookingtms-theme') || 'light',
        primaryColor: autoInit.getAttribute('data-bookingtms-color') || '2563eb'
      });
      mount(autoInit);
    }
  });

})(window, document);
