/**
 * MarketingPro 1.1 - Theme Utilities
 * @description Shared theme classes and color utilities
 */

/**
 * Get semantic class names based on dark mode state
 */
export function getThemeClasses(isDark: boolean) {
  return {
    // Backgrounds
    cardBg: isDark ? 'bg-[#161616]' : 'bg-white',
    bgElevated: isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50',
    codeBg: isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100',
    
    // Borders
    border: isDark ? 'border-[#2a2a2a]' : 'border-gray-200',
    
    // Text
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-[#a3a3a3]' : 'text-gray-600',
    textSecondary: isDark ? 'text-[#d4d4d4]' : 'text-gray-700',
    
    // Status colors
    success: isDark ? 'text-emerald-400' : 'text-green-600',
    successBg: isDark ? 'bg-emerald-500/20' : 'bg-green-100',
    
    // Brand colors
    primary: isDark ? 'text-[#6366f1]' : 'text-blue-600',
    primaryBg: isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100',
    
    // Button styles
    primaryBtn: isDark 
      ? 'bg-[#4f46e5] text-white hover:bg-[#4338ca]' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    outlineBtn: isDark 
      ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' 
      : '',
  };
}

/**
 * Get color classes for stats cards based on color name
 */
export function getStatCardColors(color: string, isDark: boolean) {
  const colorMap: Record<string, { icon: string; bg: string }> = {
    blue: {
      icon: isDark ? 'text-[#6366f1]' : 'text-blue-600',
      bg: isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100',
    },
    green: {
      icon: isDark ? 'text-emerald-400' : 'text-green-600',
      bg: isDark ? 'bg-emerald-500/20' : 'bg-green-100',
    },
    purple: {
      icon: isDark ? 'text-purple-400' : 'text-purple-600',
      bg: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
    },
    orange: {
      icon: isDark ? 'text-orange-400' : 'text-orange-600',
      bg: isDark ? 'bg-orange-500/20' : 'bg-orange-100',
    },
    pink: {
      icon: isDark ? 'text-pink-400' : 'text-pink-600',
      bg: isDark ? 'bg-pink-500/20' : 'bg-pink-100',
    },
    yellow: {
      icon: isDark ? 'text-yellow-400' : 'text-yellow-600',
      bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
    },
    red: {
      icon: isDark ? 'text-red-400' : 'text-red-600',
      bg: isDark ? 'bg-red-500/20' : 'bg-red-100',
    },
  };

  return colorMap[color] || colorMap.blue;
}

/**
 * Get badge classes for different status types
 */
export function getBadgeClasses(type: string, isDark: boolean) {
  const badgeMap: Record<string, string> = {
    active: isDark 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : 'bg-green-100 text-green-700',
    paused: isDark 
      ? 'bg-[#2a2a2a] text-[#a3a3a3]' 
      : 'bg-gray-100 text-gray-700',
    scheduled: isDark 
      ? 'bg-[#4f46e5]/20 text-[#6366f1]' 
      : 'bg-blue-100 text-blue-700',
    sent: isDark 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : 'bg-green-100 text-green-700',
    percentage: isDark 
      ? 'bg-[#4f46e5]/20 text-[#6366f1]' 
      : 'bg-blue-100 text-blue-700',
    fixed: isDark 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : 'bg-green-100 text-green-700',
    verified: isDark 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : 'bg-green-100 text-green-700',
    needsResponse: isDark 
      ? 'bg-red-500/20 text-red-400' 
      : 'bg-red-100 text-red-700',
  };

  return badgeMap[type] || badgeMap.active;
}
