/**
 * Validators
 * 
 * Validation functions for forms and data
 */

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL - accepts simple formats like "example.com"
 * Also accepts full URLs with http:// or https://
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim().length === 0) return false;
  
  // Domain pattern: allows domain.tld or subdomain.domain.tld
  // Examples: example.com, www.example.com, sub.example.co.uk
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/;
  
  // Check if it's a simple domain (like example.com)
  if (domainPattern.test(url.trim())) {
    return true;
  }
  
  // Try as full URL (with http:// or https://)
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.includes('.');
  } catch {
    return false;
  }
};

/**
 * Normalize URL - ensures URL has https:// prefix
 */
export const normalizeUrl = (url: string): string => {
  if (!url || url.trim().length === 0) return '';
  
  const trimmed = url.trim();
  
  // If already has protocol, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Add https:// prefix
  return `https://${trimmed}`;
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phone.length >= 10 && phoneRegex.test(phone);
};

/**
 * Validate organization name
 */
export const isValidOrganizationName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

/**
 * Validate plan name
 */
export const isValidPlanName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Validate price (positive number)
 */
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

/**
 * Validate percentage (0-100)
 */
export const isValidPercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};

/**
 * Validate organization data
 */
export interface OrganizationValidationErrors {
  name?: string;
  owner_name?: string;
  owner_email?: string;
  website?: string;
  phone?: string;
  plan_id?: string;
}

export const validateOrganization = (data: {
  name?: string;
  owner_name?: string;
  owner_email?: string;
  website?: string;
  phone?: string;
  plan_id?: string;
}): OrganizationValidationErrors => {
  const errors: OrganizationValidationErrors = {};

  if (!data.name || !isValidOrganizationName(data.name)) {
    errors.name = 'Organization name must be between 2 and 100 characters';
  }

  if (!data.owner_name || data.owner_name.trim().length < 2) {
    errors.owner_name = 'Owner name is required (min 2 characters)';
  }

  if (!data.owner_email || !isValidEmail(data.owner_email)) {
    errors.owner_email = 'Valid email address is required';
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.website = 'Invalid URL format';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (!data.plan_id) {
    errors.plan_id = 'Plan selection is required';
  }

  return errors;
};

/**
 * Validate plan data
 */
export interface PlanValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  features?: string;
}

export const validatePlan = (data: {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
}): PlanValidationErrors => {
  const errors: PlanValidationErrors = {};

  if (!data.name || !isValidPlanName(data.name)) {
    errors.name = 'Plan name must be between 2 and 50 characters';
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description is required (min 10 characters)';
  }

  if (data.price === undefined || !isValidPrice(data.price)) {
    errors.price = 'Valid price is required (must be 0 or greater)';
  }

  if (!data.features || data.features.length === 0) {
    errors.features = 'At least one feature is required';
  }

  return errors;
};

/**
 * Check if validation has errors
 */
export const hasValidationErrors = (errors: Record<string, any>): boolean => {
  return Object.keys(errors).length > 0;
};
