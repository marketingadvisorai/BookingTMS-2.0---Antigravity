/**
 * Code Display Component
 * Shows embed code with copy functionality
 * 
 * @module widget/CodeDisplay
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Code, Copy, Check, Download } from 'lucide-react';
import { CodeFormat } from './types';

interface CodeDisplayProps {
  code: string;
  format: CodeFormat;
  copied: boolean;
  canDownload: boolean;
  onFormatChange: (format: CodeFormat) => void;
  onCopy: () => void;
  onDownload: () => void;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  format,
  copied,
  canDownload,
  onFormatChange,
  onCopy,
  onDownload,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="w-4 h-4" />
            Embed Code
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
            >
              {copied ? (
                <><Check className="w-4 h-4 mr-1 text-green-500" /> Copied</>
              ) : (
                <><Copy className="w-4 h-4 mr-1" /> Copy</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              disabled={!canDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={format} onValueChange={(v) => onFormatChange(v as CodeFormat)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          </TabsList>

          <TabsContent value={format}>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-64">
              <code>{code}</code>
            </pre>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-gray-500 mt-3">
          {format === 'html' && 'Paste this code into your HTML page where you want the widget to appear.'}
          {format === 'react' && 'Use this component in your React/Next.js application.'}
          {format === 'wordpress' && 'Add this shortcode to your WordPress page or use as a custom HTML block.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default CodeDisplay;
