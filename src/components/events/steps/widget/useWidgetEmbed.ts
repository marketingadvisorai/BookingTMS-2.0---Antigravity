/**
 * Widget Embed Hook
 * Business logic for widget embed step
 * 
 * @module widget/useWidgetEmbed
 */

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  generateEmbedCode, 
  generateReactCode, 
  generateEmbedUrl, 
  generateWordPressCode 
} from '../../../../lib/embed/EmbedManager';
import { ActivityData } from '../../types';
import { 
  PreviewDevice, 
  CodeFormat, 
  EmbedConfig, 
  UseWidgetEmbedReturn 
} from './types';

interface UseWidgetEmbedProps {
  activityData: ActivityData;
  activityId?: string;
  venueId?: string;
  embedKey?: string;
  isEditMode?: boolean;
}

export function useWidgetEmbed({
  activityData,
  activityId,
  venueId,
  embedKey,
  isEditMode = false,
}: UseWidgetEmbedProps): UseWidgetEmbedReturn {
  // State
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [codeFormat, setCodeFormat] = useState<CodeFormat>('html');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Base URL
  const baseUrl = useMemo(() => 
    typeof window !== 'undefined' ? window.location.origin : '', 
  []);

  // Embed config
  const embedConfig: EmbedConfig = useMemo(() => ({
    activityId: activityId || 'preview',
    venueId: venueId || 'preview',
    embedKey: embedKey || 'YOUR_EMBED_KEY',
    primaryColor,
    theme,
    minHeight: 600,
    maxHeight: 900,
  }), [activityId, venueId, embedKey, primaryColor, theme]);

  // Generated code
  const generatedCode = useMemo(() => {
    switch (codeFormat) {
      case 'html':
        return generateEmbedCode(embedConfig, baseUrl);
      case 'react':
        return generateReactCode(embedConfig, baseUrl);
      case 'wordpress':
        return generateWordPressCode(embedConfig, baseUrl);
      default:
        return generateEmbedCode(embedConfig, baseUrl);
    }
  }, [codeFormat, embedConfig, baseUrl]);

  // Preview URL
  const previewUrl = useMemo(() => 
    generateEmbedUrl(embedConfig, baseUrl), 
  [embedConfig, baseUrl]);

  // Real embed URL
  const realEmbedUrl = useMemo(() => {
    if (!activityId || activityId === 'preview') return null;
    const colorHex = primaryColor.replace('#', '');
    return `${baseUrl}/embed?widget=singlegame&activityId=${activityId}&color=${colorHex}&theme=${theme}`;
  }, [activityId, baseUrl, primaryColor, theme]);

  // Validation
  const hasValidActivityId = Boolean(
    activityId && 
    activityId !== 'preview' && 
    activityId.length > 10
  );
  
  const canDownload = isEditMode ? hasValidActivityId : hasValidActivityId;

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  }, [generatedCode]);

  // Open full preview
  const openFullPreview = useCallback(() => {
    if (realEmbedUrl) {
      window.open(realEmbedUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Save the activity first to preview the live widget');
    }
  }, [realEmbedUrl]);

  // Download landing page
  const downloadLandingPage = useCallback(() => {
    if (!canDownload) {
      toast.info('Save the activity first to download');
      return;
    }

    const activityName = activityData.name || 'Book Your Experience';
    const colorHex = primaryColor.replace('#', '');
    const embedIframeUrl = `${baseUrl}/embed?widget=singlegame&activityId=${activityId}&color=${colorHex}&theme=${theme}&embed=true`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activityName} - Book Now</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8fafc; min-height: 100vh; }
    .header { background: ${primaryColor}; color: white; padding: 60px 20px; text-align: center; }
    .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    iframe { width: 100%; border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="header">
    <h1>${activityName}</h1>
    <p>Book your experience today!</p>
  </div>
  <div class="container">
    <iframe src="${embedIframeUrl}" height="800"></iframe>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activityName.replace(/\s+/g, '-').toLowerCase()}-booking.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Landing page downloaded!');
  }, [canDownload, activityData.name, activityId, baseUrl, primaryColor, theme]);

  // Download embed HTML
  const downloadEmbedHTML = useCallback(() => {
    if (!canDownload) {
      toast.info('Save the activity first to download');
      return;
    }

    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'booking-widget-embed.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Embed code downloaded!');
  }, [canDownload, generatedCode]);

  return {
    copied,
    previewDevice,
    codeFormat,
    primaryColor,
    theme,
    generatedCode,
    previewUrl,
    realEmbedUrl,
    canDownload,
    hasValidActivityId,
    setPreviewDevice,
    setCodeFormat,
    setPrimaryColor,
    setTheme,
    copyToClipboard,
    openFullPreview,
    downloadLandingPage,
    downloadEmbedHTML,
  };
}
