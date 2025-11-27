/**
 * Embed Pro 1.1 - Code Generator Service
 * @module embed-pro/services/codeGenerator
 * 
 * Generates embed codes in multiple formats
 */

import type { CodeFormat, GeneratedCode, CodeGeneratorOptions, EmbedConfigEntity } from '../types';

// =====================================================
// CODE TEMPLATES
// =====================================================

const getBaseDomain = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://yourdomain.com';
};

// =====================================================
// CODE GENERATOR SERVICE
// =====================================================

class CodeGeneratorService {
  /**
   * Generate embed code for all formats
   */
  generateAllFormats(config: EmbedConfigEntity): GeneratedCode[] {
    const options: CodeGeneratorOptions = {
      embedKey: config.embed_key,
      format: 'html',
      domain: getBaseDomain(),
    };

    return [
      this.generateHtml(options),
      this.generateReact(options),
      this.generateNextJs(options),
      this.generateWordPress(options),
      this.generateIframe(options),
    ];
  }

  /**
   * Generate code for a specific format
   */
  generate(options: CodeGeneratorOptions): GeneratedCode {
    switch (options.format) {
      case 'html':
        return this.generateHtml(options);
      case 'react':
        return this.generateReact(options);
      case 'nextjs':
        return this.generateNextJs(options);
      case 'wordpress':
        return this.generateWordPress(options);
      case 'iframe':
        return this.generateIframe(options);
      default:
        return this.generateHtml(options);
    }
  }

  /**
   * HTML Embed Code
   */
  private generateHtml(options: CodeGeneratorOptions): GeneratedCode {
    const domain = options.domain || getBaseDomain();
    const code = `<!-- BookFlow Widget -->
<div id="bookflow-widget-${options.embedKey}"></div>
<script 
  src="${domain}/embed/bookflow.js" 
  data-key="${options.embedKey}"
  data-theme="light"
  async>
</script>`;

    return {
      format: 'html',
      code,
      instructions: 'Paste this code where you want the widget to appear on your page.',
    };
  }

  /**
   * React Embed Code
   */
  private generateReact(options: CodeGeneratorOptions): GeneratedCode {
    const code = `import { useEffect, useRef } from 'react';

function BookFlowWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${options.domain}/embed/bookflow.js';
    script.dataset.key = '${options.embedKey}';
    script.dataset.theme = 'light';
    script.async = true;
    
    containerRef.current?.appendChild(script);
    
    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} id="bookflow-widget-${options.embedKey}" />;
}

export default BookFlowWidget;`;

    return {
      format: 'react',
      code,
      instructions: 'Create a new component file and paste this code. Import and use it in your app.',
    };
  }

  /**
   * Next.js Embed Code
   */
  private generateNextJs(options: CodeGeneratorOptions): GeneratedCode {
    const code = `'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function BookFlowWidget() {
  return (
    <>
      <div id="bookflow-widget-${options.embedKey}" />
      <Script
        src="${options.domain}/embed/bookflow.js"
        data-key="${options.embedKey}"
        data-theme="light"
        strategy="lazyOnload"
      />
    </>
  );
}`;

    return {
      format: 'nextjs',
      code,
      instructions: 'Create a new component and paste this code. Uses Next.js Script component for optimal loading.',
    };
  }

  /**
   * WordPress Shortcode
   */
  private generateWordPress(options: CodeGeneratorOptions): GeneratedCode {
    const shortcode = `[bookflow_widget key="${options.embedKey}" theme="light"]`;
    
    const phpCode = `// Add to your theme's functions.php
function bookflow_widget_shortcode(\$atts) {
    \$atts = shortcode_atts(array(
        'key' => '',
        'theme' => 'light',
    ), \$atts);
    
    if (empty(\$atts['key'])) return '';
    
    return '<div id="bookflow-widget-' . esc_attr(\$atts['key']) . '"></div>
    <script src="${options.domain}/embed/bookflow.js" 
            data-key="' . esc_attr(\$atts['key']) . '" 
            data-theme="' . esc_attr(\$atts['theme']) . '" 
            async></script>';
}
add_shortcode('bookflow_widget', 'bookflow_widget_shortcode');`;

    return {
      format: 'wordpress',
      code: `Shortcode:\n${shortcode}\n\n--- OR add to functions.php ---\n\n${phpCode}`,
      instructions: 'Use the shortcode in any page/post, or add the PHP code to your theme for the shortcode to work.',
    };
  }

  /**
   * iFrame Embed (Universal)
   */
  private generateIframe(options: CodeGeneratorOptions): GeneratedCode {
    const domain = options.domain || getBaseDomain();
    const code = `<iframe 
  src="${domain}/embed?key=${options.embedKey}"
  width="100%" 
  height="700"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
  title="BookFlow Booking Widget"
  loading="lazy">
</iframe>`;

    return {
      format: 'iframe',
      code,
      instructions: 'Works on any platform. Adjust width and height as needed.',
    };
  }

  /**
   * Get format display info
   */
  getFormatInfo(format: CodeFormat): { label: string; icon: string } {
    const formats: Record<CodeFormat, { label: string; icon: string }> = {
      html: { label: 'HTML', icon: 'Code' },
      react: { label: 'React', icon: 'Atom' },
      nextjs: { label: 'Next.js', icon: 'Hexagon' },
      wordpress: { label: 'WordPress', icon: 'Wordpress' },
      iframe: { label: 'iFrame', icon: 'Frame' },
    };
    return formats[format];
  }
}

// Export singleton instance
export const codeGeneratorService = new CodeGeneratorService();
