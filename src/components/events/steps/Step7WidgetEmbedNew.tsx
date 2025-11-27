/**
 * Step 7: Widget & Embed Configuration
 * 
 * Enterprise-grade widget embedding with:
 * - Multi-platform support (HTML, React, WordPress)
 * - Device-responsive preview
 * - Theme customization
 * - Downloadable landing pages
 * 
 * Refactored following SOLID principles.
 * 
 * @module Step7WidgetEmbed
 * @version 2.0.0
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Download, 
  FileCode, 
  Eye,
  Info,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { StepProps } from '../types';

// Modular components
import {
  useWidgetEmbed,
  DevicePreview,
  CodeDisplay,
  CustomizationPanel,
} from './widget';

// ============================================================================
// PROPS
// ============================================================================

interface Step7WidgetEmbedProps extends StepProps {
  activityId?: string;
  venueId?: string;
  embedKey?: string;
  isEditMode?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Step7WidgetEmbed({ 
  activityData, 
  updateActivityData, 
  t,
  isEditMode = false,
  activityId,
  venueId,
  embedKey 
}: Step7WidgetEmbedProps) {
  // All business logic in custom hook
  const {
    copied,
    previewDevice,
    codeFormat,
    primaryColor,
    theme,
    generatedCode,
    previewUrl,
    realEmbedUrl,
    canDownload,
    setPreviewDevice,
    setCodeFormat,
    setPrimaryColor,
    setTheme,
    copyToClipboard,
    openFullPreview,
    downloadLandingPage,
    downloadEmbedHTML,
  } = useWidgetEmbed({
    activityData,
    activityId,
    venueId,
    embedKey,
    isEditMode,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Widget & Embed
          <Badge variant="outline">Step 7</Badge>
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Embed your booking widget on any website with just a few lines of code
        </p>
      </div>

      {/* Features Banner */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium">Instant Setup</p>
            <p className="text-xs text-gray-500">Copy & paste integration</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium">Secure</p>
            <p className="text-xs text-gray-500">Stripe encrypted payments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200">
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium">Responsive</p>
            <p className="text-xs text-gray-500">Works on all devices</p>
          </CardContent>
        </Card>
      </div>

      {/* Save Warning */}
      {!canDownload && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Save your activity first to enable downloads and full preview.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Embed Code (Primary Focus - No Preview to avoid crashes) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Embed Code */}
          <CodeDisplay
            code={generatedCode}
            format={codeFormat}
            copied={copied}
            canDownload={canDownload}
            onFormatChange={setCodeFormat}
            onCopy={copyToClipboard}
            onDownload={downloadEmbedHTML}
          />
          
          {/* Preview Link */}
          {realEmbedUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Live Preview</p>
                    <p className="text-xs text-gray-500">Opens in new tab</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={openFullPreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Open Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Settings & Downloads */}
        <div className="space-y-4">
          {/* Customization */}
          <CustomizationPanel
            primaryColor={primaryColor}
            theme={theme}
            onColorChange={setPrimaryColor}
            onThemeChange={setTheme}
          />

          {/* Downloads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4" />
                Downloads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={downloadLandingPage}
                disabled={!canDownload}
              >
                <FileCode className="w-4 h-4 mr-2" />
                Landing Page (HTML)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={downloadEmbedHTML}
                disabled={!canDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Embed Snippet
              </Button>
              <p className="text-xs text-gray-500">
                Download ready-to-use files for your website.
              </p>
            </CardContent>
          </Card>

          {/* Activity Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Widget Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Activity</span>
                <span className="font-medium truncate max-w-[150px]">
                  {activityData.name || 'Untitled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-medium">
                  ${activityData.adultPrice?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">
                  {activityData.duration || 60} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={canDownload ? 'default' : 'secondary'}>
                  {canDownload ? 'Ready' : 'Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
