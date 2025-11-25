/**
 * Venue Embed Utilities
 * Functions for generating embed codes and handling clipboard operations
 * 
 * Uses VenueEmbedManager for consistent embed generation across the app
 */

import { Venue } from '../../types/venue';
import { toast } from 'sonner';
import { 
  VenueEmbedManager, 
  generateIframeEmbedCode, 
  generateScriptEmbedCode,
  generateReactEmbedCode,
  generateWordPressCode,
  generateVenueEmbedUrl,
  generateFullPageUrl,
  type VenueEmbedConfig 
} from '../../lib/embed/VenueEmbedManager';

/**
 * Create embed config from venue
 */
export const createEmbedConfig = (venue: Venue, options?: Partial<VenueEmbedConfig>): VenueEmbedConfig => ({
  venueId: venue.id,
  embedKey: venue.embedKey,
  primaryColor: venue.primaryColor || '#2563eb',
  theme: 'light',
  minHeight: 600,
  maxHeight: 1200,
  ...options,
});

/**
 * Generates responsive iframe-based embed code snippet for a venue
 * Uses VenueEmbedManager for consistent code generation
 */
export const generateEmbedCode = (venue: Venue, theme: 'light' | 'dark' = 'light'): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const config = createEmbedConfig(venue, { theme });
  return generateIframeEmbedCode(config, baseUrl, venue.name);
};

/**
 * Copies embed code to clipboard
 */
export const handleCopyEmbedCode = (venue: Venue, setCopiedCallback: (copied: boolean) => void): void => {
  const code = generateEmbedCode(venue);
  navigator.clipboard.writeText(code);
  setCopiedCallback(true);
  toast.success('Embed code copied to clipboard!');
  setTimeout(() => setCopiedCallback(false), 2000);
};

/**
 * Generate script-based embed code (auto-resize)
 */
export const generateScriptEmbed = (venue: Venue, theme: 'light' | 'dark' = 'light'): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const config = createEmbedConfig(venue, { theme });
  return generateScriptEmbedCode(config, baseUrl, venue.name);
};

/**
 * Generate React component code
 */
export const generateReactEmbed = (venue: Venue, theme: 'light' | 'dark' = 'light'): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const config = createEmbedConfig(venue, { theme });
  return generateReactEmbedCode(config, baseUrl, venue.name);
};

/**
 * Generate WordPress shortcode
 */
export const generateWordPressEmbed = (venue: Venue, theme: 'light' | 'dark' = 'light'): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const config = createEmbedConfig(venue, { theme });
  return generateWordPressCode(config, baseUrl, venue.name);
};

/**
 * Get embed URL for venue
 */
export const getVenueEmbedUrl = (venue: Venue, theme: 'light' | 'dark' = 'light'): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const config = createEmbedConfig(venue, { theme });
  return generateVenueEmbedUrl(config, baseUrl);
};

/**
 * Get full-page booking URL
 */
export const getVenueFullPageUrl = (venue: Venue, theme: 'light' | 'dark' = 'light'): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const config = createEmbedConfig(venue, { theme });
  return generateFullPageUrl(config, baseUrl);
};

/**
 * Generates complete HTML file content for download
 */
export const generateHTMLDownload = (venue: Venue): string => {
  const embedCode = generateEmbedCode(venue);
  const primaryColor = venue.primaryColor || '#2563eb';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${venue.name} - Booking Widget</title>
  <meta name="description" content="Book your experience at ${venue.name}">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    h1 {
      color: #111827;
      margin-bottom: 8px;
      font-size: 2rem;
    }
    .subtitle {
      color: #6b7280;
      font-size: 1.1rem;
    }
    .widget-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #9ca3af;
      font-size: 0.875rem;
    }
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
    @media (max-width: 640px) {
      body { padding: 12px; }
      .container { padding: 12px; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${venue.name}</h1>
      <p class="subtitle">Book your experience below</p>
    </div>
    <div class="widget-container">
      ${embedCode}
    </div>
    <div class="footer">
      <p>Powered by <a href="https://bookingtms.com" target="_blank">BookingTMS</a></p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Downloads HTML file with embed code
 */
export const handleDownloadHTML = (venue: Venue): void => {
  const htmlContent = generateHTMLDownload(venue);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${venue.name.toLowerCase().replace(/\s+/g, '-')}-widget.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success('HTML file downloaded!');
};

// Re-export VenueEmbedManager for direct usage
export { VenueEmbedManager, type VenueEmbedConfig };
