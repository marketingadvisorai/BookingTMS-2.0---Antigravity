/**
 * Password Management Service
 * 
 * Handles password reset and update operations using Supabase Auth.
 * Used by both admin (to reset user passwords) and self-service flows.
 * 
 * @module services/password
 */

import { supabase } from '../lib/supabase/client';

export interface PasswordResetResult {
  success: boolean;
  message: string;
  error?: string;
  method?: 'supabase_smtp' | 'resend' | 'fallback_link';
  resetLink?: string;
}

export interface SetPasswordResult {
  success: boolean;
  message: string;
  error?: string;
}

class PasswordService {
  /**
   * Send password reset email to user
   * Used for self-service "Forgot Password" flow
   */
  async sendResetEmail(email: string): Promise<PasswordResetResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset email error:', error);
        return {
          success: false,
          message: 'Failed to send reset email',
          error: error.message,
        };
      }

      return {
        success: true,
        message: 'Password reset email sent successfully. Check your inbox.',
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
      };
    }
  }

  /**
   * Update password for the currently logged-in user
   * Used after clicking the reset link in email
   */
  async updatePassword(newPassword: string): Promise<SetPasswordResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        return {
          success: false,
          message: 'Failed to update password',
          error: error.message,
        };
      }

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error: any) {
      console.error('Password update error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
      };
    }
  }

  /**
   * Admin: Set a new password for any user
   * Uses edge function with service role to update password
   */
  async adminSetPassword(userId: string, newPassword: string): Promise<SetPasswordResult> {
    try {
      // Validate inputs
      if (!userId || !userId.trim()) {
        console.error('[PasswordService] Invalid userId');
        return {
          success: false,
          message: 'User ID is required',
          error: 'Missing userId',
        };
      }

      if (!newPassword || newPassword.length < 8) {
        console.error('[PasswordService] Invalid password');
        return {
          success: false,
          message: 'Password must be at least 8 characters',
          error: 'Invalid password',
        };
      }

      // Get current session for authorization
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[PasswordService] Session error:', sessionError);
        return {
          success: false,
          message: 'Authentication error',
          error: sessionError.message,
        };
      }
      
      // If no session, try to get user to check for mock auth
      if (!session) {
        console.warn('[PasswordService] No Supabase session found. User may be in demo/mock mode.');
        console.log('[PasswordService] Tip: Log in with real Supabase credentials to use admin password features.');
        return {
          success: false,
          message: 'No active Supabase session. Please log in with your email to use this feature.',
          error: 'Supabase authentication required. Demo mode does not support password management.',
        };
      }

      console.log('[PasswordService] Setting password for user:', userId);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qftjyjpitnoapqxlrvfs.supabase.co';
      
      // Call the edge function with service role
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'set_password',
            userId,
            newPassword,
          }),
        }
      );

      const data = await response.json();
      console.log('[PasswordService] Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('[PasswordService] Error response:', data);
        return {
          success: false,
          message: data.error || 'Failed to set password',
          error: data.details || data.message,
        };
      }

      return {
        success: true,
        message: data.message || 'Password set successfully',
      };
    } catch (error: any) {
      console.error('[PasswordService] Exception:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
      };
    }
  }

  /**
   * Admin: Send password reset email to any user
   * Uses edge function with service role to generate and send reset link
   */
  async adminSendResetEmail(email: string, userName?: string): Promise<PasswordResetResult> {
    try {
      // Validate email
      if (!email || !email.includes('@')) {
        return {
          success: false,
          message: 'Valid email address is required',
          error: 'Invalid email',
        };
      }

      // Get current session for authorization
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[PasswordService] Session error:', sessionError);
        return {
          success: false,
          message: 'Authentication error',
          error: sessionError.message,
        };
      }
      
      // If no session, user might be in demo/mock mode
      if (!session) {
        console.warn('[PasswordService] No Supabase session found. User may be in demo/mock mode.');
        console.log('[PasswordService] Tip: Log in with real Supabase credentials to use admin password features.');
        return {
          success: false,
          message: 'No active Supabase session. Please log in with your email to use this feature.',
          error: 'Supabase authentication required. Demo mode does not support password management.',
        };
      }

      console.log('[PasswordService] Sending reset email for:', email);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qftjyjpitnoapqxlrvfs.supabase.co';
      
      // Call the edge function with explicit action
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'send_reset', // Explicitly set action
            email,
            userName,
            redirectUrl: window.location.origin,
          }),
        }
      );

      const data = await response.json();
      console.log('[PasswordService] Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('[PasswordService] Error response:', data);
        return {
          success: false,
          message: data.error || 'Failed to send reset email',
          error: data.details || data.message,
        };
      }

      return {
        success: true,
        message: data.message || 'Password reset email sent successfully',
        method: data.method,
        resetLink: data.resetLink,
      };
    } catch (error: any) {
      console.error('[PasswordService] Exception:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
      };
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const passwordService = new PasswordService();
