/**
 * Authentication Middleware
 * 
 * Middleware for protecting routes and validating user sessions
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request type with user information
 * Explicitly includes all Express Request properties
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
  body: any;
  params: any;
  query: any;
  headers: any;
}

/**
 * Authenticate middleware
 * Verifies JWT token and adds user to request
 */
export const authenticate = (supabase: any) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No authorization header provided',
        });
      }

      // Extract token (format: "Bearer <token>")
      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid authorization header format',
        });
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      }

      // Get user profile with organization
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, email, role, organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User profile not found',
        });
      }

      // Add user to request
      req.user = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        organizationId: profile.organization_id,
      };

      return next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  };
};

/**
 * Require role middleware
 * Checks if user has required role
 */
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    return next();
  };
};

/**
 * Require permission middleware
 * Checks if user has required permission
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Check permission based on role
    const hasPermission = checkPermission(req.user.role, permission);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    return next();
  };
};

/**
 * Check if role has permission
 */
function checkPermission(role: string, permission: string): boolean {
  const permissions: Record<string, string[]> = {
    'super-admin': ['*'], // All permissions
    'admin': [
      'bookings.*',
      'games.*',
      'customers.*',
      'payments.*',
      'reports.*',
      'settings.view',
    ],
    'manager': [
      'bookings.view',
      'bookings.edit',
      'games.view',
      'customers.view',
      'payments.view',
      'reports.view',
    ],
    'staff': [
      'bookings.view',
      'games.view',
      'customers.view',
    ],
  };

  const rolePermissions = permissions[role] || [];

  // Super admin has all permissions
  if (rolePermissions.includes('*')) {
    return true;
  }

  // Check exact match
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Check wildcard (e.g., 'bookings.*' matches 'bookings.create')
  const parts = permission.split('.');
  if (parts.length === 2) {
    const wildcardPermission = `${parts[0]}.*`;
    if (rolePermissions.includes(wildcardPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Optional authentication middleware
 * Adds user to request if token provided, but doesn't require it
 */
export const optionalAuth = (supabase: any) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id, email, role, organization_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          req.user = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            organizationId: profile.organization_id,
          };
        }
      }
    } catch (error) {
      console.error('Optional auth error:', error);
    }

    return next();
  };
};
