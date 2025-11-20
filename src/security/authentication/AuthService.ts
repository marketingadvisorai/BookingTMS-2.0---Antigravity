/**
 * Authentication Service
 * Enterprise-grade authentication management
 * @module security/authentication
 */

import { supabase } from '@/lib/supabase';
import { AuthenticationError, ValidationError } from '@/shared/errors/AppError';
import { errorHandler } from '@/shared/errors/ErrorHandler';
import { isValidEmail, isStrongPassword } from '@/shared/utils/validation.utils';

/**
 * User authentication data
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  organizationId: string;
  metadata?: Record<string, any>;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  organizationId: string;
  role?: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  email: string;
  redirectUrl?: string;
}

/**
 * Authentication Service Class
 * Handles all authentication operations
 */
export class AuthService {
  private currentUser: AuthUser | null = null;
  private authListeners: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.notifyListeners(null);
        }
      });
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'initializeAuth' });
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // Validate credentials
      this.validateLoginCredentials(credentials);
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw new AuthenticationError(error.message);
      }
      
      if (!data.user) {
        throw new AuthenticationError('Login failed');
      }
      
      // Load user profile
      await this.loadUserProfile(data.user.id);
      
      if (!this.currentUser) {
        throw new AuthenticationError('Failed to load user profile');
      }
      
      return this.currentUser;
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'login' });
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      // Validate registration data
      this.validateRegistrationData(data);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            organization_id: data.organizationId,
            role: data.role || 'staff',
          },
        },
      });
      
      if (authError) {
        throw new AuthenticationError(authError.message);
      }
      
      if (!authData.user) {
        throw new AuthenticationError('Registration failed');
      }
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          organization_id: data.organizationId,
          role: data.role || 'staff',
          is_active: true,
        });
      
      if (profileError) {
        throw new AuthenticationError('Failed to create user profile');
      }
      
      // Load user profile
      await this.loadUserProfile(authData.user.id);
      
      if (!this.currentUser) {
        throw new AuthenticationError('Failed to load user profile');
      }
      
      return this.currentUser;
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'register' });
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new AuthenticationError(error.message);
      }
      
      this.currentUser = null;
      this.notifyListeners(null);
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'logout' });
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetData): Promise<void> {
    try {
      if (!isValidEmail(data.email)) {
        throw new ValidationError('Invalid email address', {
          email: ['Please provide a valid email address'],
        });
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: data.redirectUrl || `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw new AuthenticationError(error.message);
      }
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'requestPasswordReset' });
      throw error;
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const validation = isStrongPassword(newPassword);
      
      if (!validation.isValid) {
        throw new ValidationError('Weak password', {
          password: validation.errors,
        });
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw new AuthenticationError(error.message);
      }
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'updatePassword' });
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string | string[]): boolean {
    if (!this.currentUser) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.currentUser.role);
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('super-admin');
  }

  /**
   * Add authentication listener
   */
  addAuthListener(listener: (user: AuthUser | null) => void): void {
    this.authListeners.push(listener);
  }

  /**
   * Remove authentication listener
   */
  removeAuthListener(listener: (user: AuthUser | null) => void): void {
    const index = this.authListeners.indexOf(listener);
    if (index > -1) {
      this.authListeners.splice(index, 1);
    }
  }

  /**
   * Load user profile from database
   */
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        throw new AuthenticationError('Failed to load user profile');
      }
      
      this.currentUser = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        organizationId: data.organization_id,
        metadata: data.metadata,
      };
      
      this.notifyListeners(this.currentUser);
    } catch (error) {
      errorHandler.handle(error as Error, { context: 'loadUserProfile' });
      throw error;
    }
  }

  /**
   * Validate login credentials
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    const errors: Record<string, string[]> = {};
    
    if (!isValidEmail(credentials.email)) {
      errors.email = ['Invalid email address'];
    }
    
    if (!credentials.password || credentials.password.length < 6) {
      errors.password = ['Password must be at least 6 characters'];
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Invalid login credentials', errors);
    }
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(data: RegisterData): void {
    const errors: Record<string, string[]> = {};
    
    if (!isValidEmail(data.email)) {
      errors.email = ['Invalid email address'];
    }
    
    const passwordValidation = isStrongPassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }
    
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = ['Full name must be at least 2 characters'];
    }
    
    if (!data.organizationId) {
      errors.organizationId = ['Organization ID is required'];
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Invalid registration data', errors);
    }
  }

  /**
   * Notify authentication listeners
   */
  private notifyListeners(user: AuthUser | null): void {
    this.authListeners.forEach((listener) => {
      try {
        listener(user);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }
}

/**
 * Global authentication service instance
 */
export const authService = new AuthService();
