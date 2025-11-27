/**
 * Embed Pro 1.1 - useCodeGenerator Hook
 * @module embed-pro/hooks/useCodeGenerator
 * 
 * Manages code generation and clipboard operations
 */

import { useState, useCallback, useMemo } from 'react';
import { codeGeneratorService } from '../services';
import type { CodeFormat, GeneratedCode, EmbedConfigEntity } from '../types';

interface UseCodeGeneratorReturn {
  selectedFormat: CodeFormat;
  setSelectedFormat: (format: CodeFormat) => void;
  generatedCodes: GeneratedCode[];
  currentCode: GeneratedCode | null;
  copyToClipboard: () => Promise<boolean>;
  copied: boolean;
  availableFormats: { value: CodeFormat; label: string; icon: string }[];
}

export function useCodeGenerator(config: EmbedConfigEntity | null): UseCodeGeneratorReturn {
  const [selectedFormat, setSelectedFormat] = useState<CodeFormat>('html');
  const [copied, setCopied] = useState(false);

  // Generate all codes when config changes
  const generatedCodes = useMemo(() => {
    if (!config) return [];
    return codeGeneratorService.generateAllFormats(config);
  }, [config]);

  // Get current code for selected format
  const currentCode = useMemo(() => {
    return generatedCodes.find(c => c.format === selectedFormat) || null;
  }, [generatedCodes, selectedFormat]);

  // Available formats with icons
  const availableFormats = useMemo(() => {
    const formats: CodeFormat[] = ['html', 'react', 'nextjs', 'wordpress', 'iframe'];
    return formats.map(format => ({
      value: format,
      ...codeGeneratorService.getFormatInfo(format),
    }));
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!currentCode) return false;

    try {
      await navigator.clipboard.writeText(currentCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      console.error('Failed to copy to clipboard');
      return false;
    }
  }, [currentCode]);

  return {
    selectedFormat,
    setSelectedFormat,
    generatedCodes,
    currentCode,
    copyToClipboard,
    copied,
    availableFormats,
  };
}
