/**
 * Database Tab Types
 * @module components/backend/database/types
 */

export interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export interface DatabaseTheme {
  isDark: boolean;
  cardBgClass: string;
  borderClass: string;
  textClass: string;
  textMutedClass: string;
  hoverBgClass: string;
}

export function getDatabaseTheme(isDark: boolean): DatabaseTheme {
  return {
    isDark,
    cardBgClass: isDark ? 'bg-[#161616]' : 'bg-white',
    borderClass: isDark ? 'border-[#2a2a2a]' : 'border-gray-200',
    textClass: isDark ? 'text-white' : 'text-gray-900',
    textMutedClass: isDark ? 'text-[#a3a3a3]' : 'text-gray-600',
    hoverBgClass: isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50',
  };
}
