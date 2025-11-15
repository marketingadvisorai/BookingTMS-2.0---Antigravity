/**
 * Validation Utilities
 * Common validation functions for form inputs
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate phone number (flexible format)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  // Remove common separators and check if what remains is digits with optional + prefix
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const pattern = /^\+?[\d]{7,15}$/;
  return pattern.test(cleaned);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
  if (!value) return true; // Optional field
  return value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
  if (!value) return true; // Optional field
  return value.length <= max;
};

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate SEO settings
 */
export interface SEOValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateSEOSettings = (config: any): SEOValidationResult => {
  const errors: string[] = [];

  // Email validation
  if (config.emailAddress && !isValidEmail(config.emailAddress)) {
    errors.push('Email address format is invalid');
  }

  // Phone validation
  if (config.phoneNumber && !isValidPhone(config.phoneNumber)) {
    errors.push('Phone number format is invalid');
  }

  // URL validations
  if (config.facebookUrl && !isValidURL(config.facebookUrl)) {
    errors.push('Facebook URL is invalid');
  }

  if (config.instagramUrl && !isValidURL(config.instagramUrl)) {
    errors.push('Instagram URL is invalid');
  }

  if (config.twitterUrl && !isValidURL(config.twitterUrl)) {
    errors.push('Twitter URL is invalid');
  }

  if (config.tripadvisorUrl && !isValidURL(config.tripadvisorUrl)) {
    errors.push('Tripadvisor URL is invalid');
  }

  // Meta description length (recommended 50-160 characters)
  if (config.metaDescription && config.metaDescription.length > 160) {
    errors.push('Meta description should be under 160 characters for optimal SEO');
  }

  // SEO title length (recommended under 60 characters)
  if (config.seoTitle && config.seoTitle.length > 60) {
    errors.push('SEO title should be under 60 characters to avoid truncation in search results');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate custom date
 */
export const validateCustomDate = (date: string, startTime: string, endTime: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Please select a date' };
  }

  if (!startTime || !endTime) {
    return { isValid: false, error: 'Please select both start and end times' };
  }

  if (startTime >= endTime) {
    return { isValid: false, error: 'End time must be after start time' };
  }

  // Check if date is in the past
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return { isValid: false, error: 'Cannot select a past date' };
  }

  return { isValid: true };
};

/**
 * Validate blocked date
 */
export const validateBlockedDate = (date: string, startTime?: string, endTime?: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Please select a date' };
  }

  // If blocking specific time, validate time range
  if (startTime && endTime) {
    if (startTime >= endTime) {
      return { isValid: false, error: 'End time must be after start time' };
    }
  }

  // If one time is provided, both must be provided
  if ((startTime && !endTime) || (!startTime && endTime)) {
    return { isValid: false, error: 'Both start and end times are required for time slot blocking' };
  }

  return { isValid: true };
};
