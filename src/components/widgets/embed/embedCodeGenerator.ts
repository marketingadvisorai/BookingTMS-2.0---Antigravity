// Base URL for widget embeds - can be configured per environment
const BASE_URL = 'https://bookingtms.com';

export interface EmbedCodeParams {
  templateId: string;
  templateName: string;
  primaryColor: string;
  baseUrl?: string;
}

/**
 * Generate HTML embed code for a widget
 */
export const generateHtmlEmbedCode = ({
  templateId,
  templateName,
  primaryColor,
  baseUrl = BASE_URL
}: EmbedCodeParams): string => {
  return `<!-- BookingTMS ${templateName} -->
<div id="bookingtms-widget-${templateId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/widgets/${templateId}.js';
    script.async = true;
    script.setAttribute('data-widget-id', 'YOUR_WIDGET_ID');
    script.setAttribute('data-primary-color', '${primaryColor}');
    script.setAttribute('data-template', '${templateId}');
    document.getElementById('bookingtms-widget-${templateId}').appendChild(script);
  })();
</script>

<!-- Styles (optional) -->
<link rel="stylesheet" href="${baseUrl}/widgets/styles.css">`;
};

/**
 * Generate React embed code for a widget
 */
export const generateReactEmbedCode = ({
  templateId,
  primaryColor,
  baseUrl = BASE_URL
}: EmbedCodeParams): string => {
  return `import { useEffect } from 'react';

export function BookingWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/widgets/${templateId}.js';
    script.async = true;
    script.setAttribute('data-widget-id', 'YOUR_WIDGET_ID');
    script.setAttribute('data-primary-color', '${primaryColor}');
    script.setAttribute('data-template', '${templateId}');
    
    const widgetDiv = document.getElementById('bookingtms-widget');
    if (widgetDiv) {
      widgetDiv.appendChild(script);
    }
    
    return () => {
      if (widgetDiv && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div id="bookingtms-widget" />;
}`;
};

/**
 * Generate WordPress installation instructions
 */
export const generateWordPressInstructions = ({
  templateId,
  primaryColor,
  baseUrl = BASE_URL
}: EmbedCodeParams): string => {
  const htmlCode = generateHtmlEmbedCode({ templateId, templateName: '', primaryColor, baseUrl });
  
  return `1. Login to WordPress Admin Panel
2. Go to Pages or Posts
3. Edit the page where you want the widget
4. Switch to HTML/Code Editor
5. Paste the following code:

${htmlCode}

6. Update/Publish your page
7. Visit the page to see your booking widget

Alternative: Use a shortcode plugin
[bookingtms template="${templateId}" color="${primaryColor}"]`;
};

/**
 * Get all embed code variants for a widget
 */
export const getAllEmbedCodes = (params: EmbedCodeParams) => {
  return {
    html: generateHtmlEmbedCode(params),
    react: generateReactEmbedCode(params),
    wordpress: generateWordPressInstructions(params),
  };
};
