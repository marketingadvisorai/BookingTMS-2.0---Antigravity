/**
 * Embed Key Utilities
 * 
 * IMPORTANT: Never manually generate embed keys!
 * The database automatically generates them via trigger.
 * 
 * These utilities are for validation and URL generation only.
 */

/**
 * Validates if an embed key has the correct format
 * Format: emb_xxxxxxxxxxxx (12 lowercase alphanumeric characters)
 */
export function isValidEmbedKey(embedKey: string | null | undefined): boolean {
  if (!embedKey) return false;
  return /^emb_[a-z0-9]{12}$/.test(embedKey);
}

/**
 * Validates if a slug has the correct format
 * Format: lowercase-alphanumeric-with-hyphens
 */
export function isValidSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generates a widget embed URL
 * @param embedKey - The venue's embed key (must be valid)
 * @param widgetId - The widget type (farebook, multistep, list, quickbook, resolvex)
 * @param baseUrl - Optional base URL (defaults to current origin)
 * @returns Full embed URL or null if invalid
 */
export function generateEmbedUrl(
  embedKey: string | null | undefined,
  widgetId: 'farebook' | 'multistep' | 'list' | 'quickbook' | 'resolvex' = 'farebook',
  baseUrl?: string
): string | null {
  if (!isValidEmbedKey(embedKey)) {
    console.error('Invalid embed_key format:', embedKey);
    return null;
  }

  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/embed?widgetId=${widgetId}&widgetKey=${embedKey}`;
}

/**
 * Generates an iframe embed code
 * @param embedKey - The venue's embed key (must be valid)
 * @param widgetId - The widget type
 * @param options - Iframe options (width, height, etc.)
 * @returns HTML iframe code or null if invalid
 */
export function generateIframeCode(
  embedKey: string | null | undefined,
  widgetId: 'farebook' | 'multistep' | 'list' | 'quickbook' | 'resolvex' = 'farebook',
  options: {
    width?: string;
    height?: string;
    frameBorder?: string;
    style?: string;
    responsive?: boolean;
    paddingTop?: string;
  } = {}
): string | null {
  const url = generateEmbedUrl(embedKey, widgetId);
  if (!url) return null;

  const {
    width = '100%',
    height = '800',
    frameBorder = '0',
    style = 'border: none; border-radius: 8px;',
    responsive = true,
    paddingTop = '135%'
  } = options;

  if (!responsive) {
    return `<iframe src="${url}" width="${width}" height="${height}" frameborder="${frameBorder}" style="${style}"></iframe>`;
  }

  const iframeStyle = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; ${style}`;

  return `<!-- Responsive BookingTMS Widget Wrapper -->
<div style="position: relative; width: ${width}; padding-top: ${paddingTop}; overflow: hidden; border-radius: 8px; max-width: 100%;">
  <iframe
    src="${url}"
    frameborder="${frameBorder}"
    style="${iframeStyle}"
    allow="payment; camera"
    allowfullscreen
    title="BookingTMS Widget"
  ></iframe>
</div>`;
}

/**
 * Generates a React component code snippet
 * @param embedKey - The venue's embed key (must be valid)
 * @param widgetId - The widget type
 * @returns React component code or null if invalid
 */
export function generateReactCode(
  embedKey: string | null | undefined,
  widgetId: 'farebook' | 'multistep' | 'list' | 'quickbook' | 'resolvex' = 'farebook'
): string | null {
  const url = generateEmbedUrl(embedKey, widgetId);
  if (!url) return null;

  return `import React, { useEffect, useRef } from 'react';

export function BookingTMSWidget() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'BOOKINGTMS_RESIZE' || event.data.type === 'resize-iframe') {
        if (iframeRef.current && typeof event.data.height === 'number') {
          iframeRef.current.style.height = event.data.height + 'px';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '135%', overflow: 'hidden', borderRadius: '8px', maxWidth: '100%' }}>
      <iframe
        ref={iframeRef}
        src="${url}"
        title="BookingTMS Widget"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
        allow="payment; camera"
        allowFullScreen
      />
    </div>
  );
}`;
}

/**
 * Extracts embed key from a URL
 * @param url - URL containing widgetKey parameter
 * @returns Embed key or null if not found or invalid
 */
export function extractEmbedKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const embedKey = urlObj.searchParams.get('widgetKey');
    return isValidEmbedKey(embedKey) ? embedKey : null;
  } catch {
    return null;
  }
}

/**
 * Validates venue data before submission
 * @param venueData - Venue data object
 * @returns Validation result with errors
 */
export function validateVenueData(venueData: {
  embed_key?: string;
  slug?: string;
  primary_color?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check embed_key if provided (should usually be auto-generated)
  if (venueData.embed_key) {
    if (!isValidEmbedKey(venueData.embed_key)) {
      errors.push('Invalid embed_key format. Must be emb_xxxxxxxxxxxx (12 lowercase alphanumeric chars)');
    }
  }

  // Check slug if provided
  if (venueData.slug) {
    if (!isValidSlug(venueData.slug)) {
      errors.push('Invalid slug format. Must be lowercase alphanumeric with hyphens only');
    }
  }

  // Check primary_color if provided
  if (venueData.primary_color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(venueData.primary_color)) {
      errors.push('Invalid primary_color format. Must be hex color like #2563eb');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * DO NOT USE THIS FUNCTION!
 * Embed keys are automatically generated by the database.
 * This function is here only to show what NOT to do.
 * 
 * @deprecated Use database trigger instead
 */
export function NEVER_USE_generateEmbedKey(): never {
  throw new Error(
    '❌ NEVER manually generate embed keys! ' +
    'The database automatically generates them via trigger. ' +
    'Simply create a venue without setting embed_key, and it will be generated automatically.'
  );
}

// Export validation regex patterns for reference
export const EMBED_KEY_PATTERN = /^emb_[a-z0-9]{12}$/;
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
