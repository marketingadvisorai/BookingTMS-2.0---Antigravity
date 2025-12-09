/**
 * AI Analysis Service - AI-powered error analysis
 * @module error-monitoring/services/aiAnalysis
 */

import { supabase } from '@/lib/supabase';
import type { SystemError, AIAnalysis } from '../types';

export type AIProvider = 'anthropic' | 'openai';

interface AnalysisRequest {
  errorId: string;
  provider?: AIProvider;
}

interface AnalysisResult {
  success: boolean;
  analysis?: AIAnalysis;
  error?: string;
}

class AIAnalysisService {
  /**
   * Request AI analysis for an error
   */
  async analyzeError(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-error-analysis', {
        body: {
          errorId: request.errorId,
          provider: request.provider || 'anthropic',
        },
      });

      if (error) throw error;
      
      return {
        success: true,
        analysis: data.analysis,
      };
    } catch (error) {
      console.error('[AIAnalysis] Failed to analyze:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  /**
   * Get analysis prompt for manual use
   */
  generatePrompt(error: SystemError): string {
    return `
You are an expert software engineer analyzing a production error.

ERROR DETAILS:
- Type: ${error.errorType}
- Message: ${error.message}
- Stack Trace: ${error.stackTrace || 'Not available'}
- Component: ${error.component || 'Unknown'}
- File: ${error.filePath || 'Unknown'}${error.lineNumber ? `:${error.lineNumber}` : ''}

CONTEXT:
- URL: ${error.url || 'Unknown'}
- Browser: ${error.browser || 'Unknown'}
- OS: ${error.os || 'Unknown'}
- Occurrences: ${error.occurrenceCount}
- First seen: ${error.firstSeenAt}

Please provide analysis in JSON format:
{
  "rootCause": "What likely caused this error",
  "impact": "How many users might be affected",
  "suggestedFix": "Code fix suggestion if applicable",
  "prevention": "How to prevent this in the future",
  "severity": 1-5 (5 = critical),
  "confidence": 0-100
}
`.trim();
  }

  /**
   * Batch analyze multiple errors
   */
  async batchAnalyze(errorIds: string[]): Promise<Map<string, AnalysisResult>> {
    const results = new Map<string, AnalysisResult>();
    
    // Process in parallel with limit
    const batchSize = 3;
    for (let i = 0; i < errorIds.length; i += batchSize) {
      const batch = errorIds.slice(i, i + batchSize);
      const promises = batch.map(id => this.analyzeError({ errorId: id }));
      const batchResults = await Promise.all(promises);
      
      batch.forEach((id, index) => {
        results.set(id, batchResults[index]);
      });
    }
    
    return results;
  }

  /**
   * Get suggested fix from analysis
   */
  extractFix(analysis: AIAnalysis): string | null {
    if (!analysis.suggestedFix) return null;
    return analysis.suggestedFix;
  }

  /**
   * Check if error is auto-fixable
   */
  isAutoFixable(analysis: AIAnalysis): boolean {
    // Only auto-fix high confidence, low severity issues
    return analysis.confidence >= 85 && analysis.severity <= 2;
  }

  /**
   * Store analysis result in database
   */
  async storeAnalysis(errorId: string, analysis: AIAnalysis): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_errors')
        .update({
          ai_analysis: analysis,
          ai_suggestion: analysis.suggestedFix,
          ai_analyzed_at: new Date().toISOString(),
        })
        .eq('id', errorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[AIAnalysis] Failed to store:', error);
      return false;
    }
  }

  /**
   * Get errors pending analysis
   */
  async getPendingAnalysis(limit = 10): Promise<SystemError[]> {
    try {
      const { data, error } = await supabase
        .from('system_errors')
        .select('*')
        .is('ai_analyzed_at', null)
        .in('severity', ['error', 'critical'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[AIAnalysis] Failed to get pending:', error);
      return [];
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
