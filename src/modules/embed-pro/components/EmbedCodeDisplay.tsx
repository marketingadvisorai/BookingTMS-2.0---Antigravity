/**
 * Embed Pro 1.1 - Embed Code Display Component
 * @module embed-pro/components/EmbedCodeDisplay
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Code, 
  Atom, 
  Hexagon, 
  Frame,
  Globe
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { useCodeGenerator } from '../hooks';
import type { EmbedConfigEntity, CodeFormat } from '../types';

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
          <TabsList className="w-full justify-start">
            {availableFormats.map((format) => (
              <TabsTrigger
                key={format.value}
                value={format.value}
                className="flex items-center gap-2"
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
        {/* Copy button */}
        <div className="absolute top-3 right-3 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="gap-2 bg-white dark:bg-gray-800"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        {/* Code block */}
        <pre className="p-4 pr-28 overflow-x-auto bg-gray-900 text-gray-100 text-sm font-mono max-h-[400px]">
          <code>{currentCode?.code || '// No code generated'}</code>
        </pre>
      </div>

      {/* Instructions */}
      {currentCode?.instructions && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <span className="font-medium shrink-0">💡 Tip:</span>
            <span>{currentCode.instructions}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default EmbedCodeDisplay;
