/**
 * Venue Embed Utilities
 * Functions for generating embed codes and handling clipboard operations
 */

import { Venue } from '../../types/venue';
import { toast } from 'sonner';

/**
 * Generates embed code snippet for a venue
 */
export const generateEmbedCode = (venue: Venue): string => {
  const baseUrl = window.location.origin;
  return `<!-- Booking Widget for ${venue.name} -->
<div id="booking-widget-${venue.embedKey}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/widget.js';
    script.setAttribute('data-venue-key', '${venue.embedKey}');
    script.setAttribute('data-widget-type', 'calendar');
    script.setAttribute('data-primary-color', '${venue.primaryColor}');
    script.async = true;
    document.getElementById('booking-widget-${venue.embedKey}').appendChild(script);
  })();
</script>`;
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
 * Generates complete HTML file content for download
 */
export const generateHTMLDownload = (venue: Venue): string => {
  const embedCode = generateEmbedCode(venue);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${venue.name} - Booking Widget</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f9fafb;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #111827;
      margin-bottom: 10px;
    }
    p {
      color: #6b7280;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${venue.name}</h1>
    <p>Book your experience below</p>
    ${embedCode}
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
