/**
 * @file typography.ts
 * @description Centralized typography system for consistent styling across the application
 * @module lib/design-system
 * 
 * @purpose
 * - Provide consistent text styles for all components
 * - Support dark/light theme switching
 * - Ensure payment sections use identical typography
 * - Make it easy for AI agents to apply correct styles
 * 
 * @usage
 * import { getTypography } from '@/lib/design-system/typography';
 * 
 * const { textClass, headingClass } = getTypography(isDark);
 */

/**
 * Typography configuration based on theme
 */
export interface TypographyConfig {
  // ============================================================================
  // TEXT COLORS - Theme-aware text colors
  // ============================================================================
  
  /** Primary text color - Main content */
  textClass: string;
  
  /** Muted text color - Secondary content, descriptions */
  mutedTextClass: string;
  
  /** Border color - Dividers, card borders */
  borderColor: string;
  
  /** Card background - Main card background */
  cardBgClass: string;
  
  /** Secondary background - Nested sections, info boxes */
  secondaryBgClass: string;
  
  // ============================================================================
  // TYPOGRAPHY SIZES - Consistent text sizing
  // ============================================================================
  
  /** Section headings - Main section titles (e.g., "Payments & Subscriptions") */
  headingClass: string;
  
  /** Card titles - Card header titles */
  titleClass: string;
  
  /** Labels - Form labels, data labels */
  labelClass: string;
  
  /** Body text - Regular paragraph text */
  bodyClass: string;
  
  /** Caption text - Small descriptive text */
  captionClass: string;
  
  /** Uppercase labels - Data grid labels, status labels */
  uppercaseClass: string;
  
  /** Code text - Inline code snippets */
  codeClass: string;
  
  // ============================================================================
  // PAYMENT SECTION SPECIFIC - Styles for payment-related sections
  // ============================================================================
  
  /** Section container - Wrapper for payment sections */
  sectionContainerClass: string;
  
  /** Section header wrapper */
  sectionHeaderClass: string;
  
  /** Info box - Status boxes, connected account info */
  infoBoxClass: string;
  
  /** Data grid - Account details, metrics */
  dataGridClass: string;
  
  /** Status badge - Connected, Active, etc. */
  statusBadgeClass: string;
}

/**
 * Get typography configuration based on theme
 * 
 * @param isDark - Whether dark mode is active
 * @returns TypographyConfig object with all typography classes
 * 
 * @example
 * const { textClass, headingClass } = getTypography(theme === 'dark');
 * 
 * <h2 className={headingClass}>Title</h2>
 * <p className={textClass}>Content</p>
 */
export function getTypography(isDark: boolean): TypographyConfig {
  return {
    // ============================================================================
    // TEXT COLORS
    // ============================================================================
    textClass: isDark ? 'text-white' : 'text-gray-900',
    mutedTextClass: isDark ? 'text-gray-400' : 'text-gray-600',
    borderColor: isDark ? 'border-[#333]' : 'border-gray-200',
    cardBgClass: isDark ? 'bg-[#161616]' : 'bg-white',
    secondaryBgClass: isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    
    // ============================================================================
    // TYPOGRAPHY SIZES
    // ============================================================================
    headingClass: 'text-lg font-medium',
    titleClass: 'text-lg',
    labelClass: 'text-sm font-medium',
    bodyClass: 'text-sm',
    captionClass: 'text-xs',
    uppercaseClass: 'text-xs uppercase tracking-wide',
    codeClass: 'px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono',
    
    // ============================================================================
    // PAYMENT SECTION SPECIFIC
    // ============================================================================
    sectionContainerClass: 'border-b-2 pb-6 mb-6',
    sectionHeaderClass: 'flex items-center justify-between mb-4',
    infoBoxClass: 'p-4 rounded-lg border',
    dataGridClass: 'mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm',
    statusBadgeClass: 'px-3 py-1 border-emerald-500 text-emerald-500',
  };
}

/**
 * Payment section typography - Specialized config for payment sections
 * 
 * @param isDark - Whether dark mode is active
 * @returns Complete class strings for payment section elements
 * 
 * @example
 * const styles = getPaymentSectionStyles(isDark);
 * 
 * <div className={styles.container}>
 *   <h2 className={styles.heading}>Stripe Connect Setup</h2>
 *   <p className={styles.description}>Manage embedded components...</p>
 * </div>
 */
export function getPaymentSectionStyles(isDark: boolean) {
  const typography = getTypography(isDark);
  
  return {
    // Container
    container: `${typography.sectionContainerClass} ${typography.borderColor}`,
    
    // Header
    headerWrapper: typography.sectionHeaderClass,
    heading: `${typography.headingClass} ${typography.textClass}`,
    description: `${typography.bodyClass} mt-1 ${typography.mutedTextClass}`,
    
    // Card
    card: `${typography.cardBgClass} border ${typography.borderColor}`,
    cardTitle: `${typography.titleClass} ${typography.textClass}`,
    cardDescription: `${typography.bodyClass} mt-1 ${typography.mutedTextClass}`,
    
    // Info Box (Connected Account Status, etc.)
    infoBox: `${typography.infoBoxClass} ${typography.borderColor} ${typography.secondaryBgClass}`,
    infoBoxLabel: `${typography.labelClass} ${typography.textClass}`,
    infoBoxDescription: `${typography.captionClass} mt-1 ${typography.mutedTextClass}`,
    
    // Status Badge
    statusBadge: `${typography.statusBadgeClass}`,
    
    // Data Grid (Account ID, Environment, etc.)
    dataGrid: `${typography.dataGridClass} ${typography.textClass}`,
    dataLabel: `${typography.uppercaseClass} ${typography.mutedTextClass}`,
    dataValue: `font-semibold ${typography.textClass}`,
    
    // Code
    code: typography.codeClass,
    
    // Lists
    listItem: `flex items-center gap-2 ${typography.captionClass} text-[#a0aec0] dark:text-gray-400`,
    
    // Buttons
    button: 'gap-2',
    buttonIcon: 'w-4 h-4',
  };
}

/**
 * Get icon color classes
 * 
 * @param variant - Icon variant (success, warning, info, etc.)
 * @returns Tailwind color class
 * 
 * @example
 * <CheckCircle className={getIconColor('success')} />
 */
export function getIconColor(variant: 'success' | 'warning' | 'info' | 'error' | 'muted'): string {
  const colors = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-indigo-500',
    error: 'text-red-500',
    muted: 'text-gray-400',
  };
  
  return colors[variant];
}

/**
 * Get badge variant classes
 * 
 * @param variant - Badge variant
 * @returns Tailwind classes for badge
 * 
 * @example
 * <Badge className={getBadgeClasses('success')}>Connected</Badge>
 */
export function getBadgeClasses(variant: 'success' | 'warning' | 'info' | 'default'): string {
  const variants = {
    success: 'border-emerald-500 text-emerald-500',
    warning: 'border-amber-500 text-amber-500',
    info: 'border-blue-500 text-blue-500',
    default: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  };
  
  return `px-3 py-1 ${variants[variant]}`;
}

/**
 * Get metric card classes
 * 
 * @param isDark - Whether dark mode is active
 * @returns Classes for metric display cards
 * 
 * @example
 * const styles = getMetricCardClasses(isDark);
 * 
 * <div className={styles.container}>
 *   <div className={styles.label}>Total Revenue</div>
 *   <div className={styles.value}>$12,345</div>
 * </div>
 */
export function getMetricCardClasses(isDark: boolean) {
  const typography = getTypography(isDark);
  
  return {
    container: `p-4 rounded-lg ${typography.secondaryBgClass}`,
    label: `${typography.bodyClass} ${typography.mutedTextClass} mb-1`,
    value: `text-2xl font-bold ${typography.textClass}`,
    subValue: `${typography.captionClass} ${typography.mutedTextClass}`,
    smallContainer: `p-3 rounded-lg ${typography.secondaryBgClass}`,
    smallLabel: `${typography.captionClass} ${typography.mutedTextClass} mb-1`,
    smallValue: `text-lg font-semibold ${typography.textClass}`,
  };
}

// ============================================================================
// EXPORT CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick access to common typography patterns
 */
export const Typography = {
  /**
   * Get all typography classes
   */
  get: getTypography,
  
  /**
   * Get payment section specific styles
   */
  payment: getPaymentSectionStyles,
  
  /**
   * Get icon color
   */
  icon: getIconColor,
  
  /**
   * Get badge classes
   */
  badge: getBadgeClasses,
  
  /**
   * Get metric card classes
   */
  metric: getMetricCardClasses,
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Typography;
