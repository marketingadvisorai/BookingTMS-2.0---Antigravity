/**
 * Embed Pro 1.1 - Embed Code Display Component
 * @module embed-pro/components/EmbedCodeDisplay
 * 
 * Displays embed codes with copy, download, and test booking functionality.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Code, 
  Atom, 
  Hexagon, 
  Frame,
  Globe,
  Download,
  ExternalLink,
  FileCode,
  Sparkles
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { useCodeGenerator } from '../hooks';
import type { EmbedConfigEntity, CodeFormat } from '../types';
import { toast } from 'sonner';

interface EmbedCodeDisplayProps {
  config: EmbedConfigEntity | null;
  className?: string;
}

const formatIcons: Record<CodeFormat, React.ReactNode> = {
  html: <Code className="w-4 h-4" />,
  react: <Atom className="w-4 h-4" />,
  nextjs: <Hexagon className="w-4 h-4" />,
  wordpress: <Globe className="w-4 h-4" />,
  iframe: <Frame className="w-4 h-4" />,
};

const formatExtensions: Record<CodeFormat, string> = {
  html: 'html',
  react: 'tsx',
  nextjs: 'tsx',
  wordpress: 'php',
  iframe: 'html',
};

export const EmbedCodeDisplay: React.FC<EmbedCodeDisplayProps> = ({
  config,
  className,
}) => {
  const {
    selectedFormat,
    setSelectedFormat,
    currentCode,
    copyToClipboard,
    copied,
    availableFormats,
  } = useCodeGenerator(config);

  // Download code as file
  const downloadCode = useCallback(() => {
    if (!currentCode || !config) return;
    
    const extension = formatExtensions[selectedFormat];
    const filename = `bookflow-widget-${config.embed_key}.${extension}`;
    const blob = new Blob([currentCode.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }, [currentCode, config, selectedFormat]);

  // Generate and download landing page
  const downloadLandingPage = useCallback(() => {
    if (!config) return;
    
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    const theme = config.style?.theme || 'light';
    const primaryColor = config.style?.primaryColor || '#2563eb';
    
    const landingPageHtml = `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Now - ${config.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root { --primary: ${primaryColor}; }
    .gradient-bg { background: linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%); }
    .btn-primary { background-color: ${primaryColor}; }
    .btn-primary:hover { background-color: color-mix(in srgb, ${primaryColor} 85%, black); }
  </style>
</head>
<body class="min-h-screen gradient-bg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}">
  <!-- Header -->
  <header class="py-6 px-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <h1 class="text-2xl font-bold" style="color: ${primaryColor}">Book Your Experience</h1>
      <span class="text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}">Powered by BookFlow</span>
    </div>
  </header>

  <!-- Main Content -->
  <main class="py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}">
          ${config.name}
        </h2>
        <p class="text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto">
          ${config.description || 'Book your experience quickly and securely with our online booking system.'}
        </p>
      </div>

      <!-- Booking Widget Container -->
      <div class="rounded-2xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-1">
        <div id="bookflow-widget-${config.embed_key}" class="min-h-[600px]"></div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="text-center p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg">
          <div class="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: ${primaryColor}20">
            <svg class="w-6 h-6" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold mb-2">Instant Confirmation</h3>
          <p class="${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm">Get immediate booking confirmation</p>
        </div>
        <div class="text-center p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg">
          <div class="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: ${primaryColor}20">
            <svg class="w-6 h-6" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h3 class="font-semibold mb-2">Secure Payment</h3>
          <p class="${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm">Protected by industry-standard encryption</p>
        </div>
        <div class="text-center p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg">
          <div class="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: ${primaryColor}20">
            <svg class="w-6 h-6" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="font-semibold mb-2">Email Confirmation</h3>
          <p class="${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm">Receive booking details via email</p>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="py-8 px-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} mt-12">
    <div class="max-w-4xl mx-auto text-center">
      <p class="${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm">
        © ${new Date().getFullYear()} All rights reserved. Powered by BookFlow.
      </p>
    </div>
  </footer>

  <!-- BookFlow Widget Script -->
  <script 
    src="${domain}/embed/bookflow.js" 
    data-key="${config.embed_key}"
    data-theme="${theme}"
    data-color="${primaryColor}"
    async>
  </script>
</body>
</html>`;

    const blob = new Blob([landingPageHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-page-${config.embed_key}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Landing page downloaded! Open the HTML file in a browser to preview.');
  }, [config]);

  // Open test booking page
  const openTestBooking = useCallback(() => {
    if (!config) return;
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    const theme = config.style?.theme || 'light';
    const url = `${domain}/embed-pro-widget?key=${config.embed_key}&theme=${theme}`;
    window.open(url, '_blank');
  }, [config]);

  if (!config) {
    return (
      <div className={cn('p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center', className)}>
        <Code className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          Select an embed configuration to view the code
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Header with tabs */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
        <Tabs value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as CodeFormat)}>
          <TabsList className="w-full justify-start flex-wrap">
            {availableFormats.map((format) => (
              <TabsTrigger
                key={format.value}
                value={format.value}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setSelectedFormat(format.value)}
              >
                {formatIcons[format.value]}
                <span className="hidden sm:inline">{format.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Code display */}
      <div className="relative">
        {/* Action buttons */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={downloadCode}
            className="gap-1.5 bg-white dark:bg-gray-800"
            title="Download code"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="gap-1.5 bg-white dark:bg-gray-800"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-3.5 h-3.5 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>

        {/* Code block */}
        <pre className="p-4 pr-32 overflow-x-auto bg-gray-900 text-gray-100 text-sm font-mono max-h-[300px]">
          <code>{currentCode?.code || '// No code generated'}</code>
        </pre>
      </div>

      {/* Instructions */}
      {currentCode?.instructions && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <span className="font-medium shrink-0">💡</span>
            <span>{currentCode.instructions}</span>
          </p>
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Test Booking Button */}
          <Button
            onClick={openTestBooking}
            className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Test Live Booking
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          
          {/* Download Landing Page Button */}
          <Button
            variant="outline"
            onClick={downloadLandingPage}
            className="flex-1 gap-2 border-2"
          >
            <FileCode className="w-4 h-4" />
            Download Landing Page
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Test your widget with a real booking flow or download a ready-to-use landing page
        </p>
      </div>
    </div>
  );
};

export default EmbedCodeDisplay;
