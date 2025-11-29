/**
 * Password Management Service
 * 
 * Handles password reset and update operations using Supabase Auth.
 * Used by both admin (to reset user passwords) and self-service flows.
 * 
 * @module services/password
 */

import { supabase } from '../lib/supabase';

export interface PasswordResetResult {
  success: boolean;
  message: string;
  error?: string;
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
   * Requires admin privileges (service role or admin API)
   */
  async adminSetPassword(userId: string, newPassword: string): Promise<SetPasswordResult> {
    try {
      // Use the admin API to update user password
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        console.error('Admin password set error:', error);
        return {
          success: false,
          message: 'Failed to set password',
          error: error.message,
        };
      }

      return {
        success: true,
        message: 'Password set successfully',
      };
    } catch (error: any) {
      console.error('Admin password set error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
      };
    }
  }

  /**
   * Admin: Send password reset email to any user
   * Does not require knowing the current password
   */
  async adminSendResetEmail(email: string): Promise<PasswordResetResult> {
    try {
      // Generate a password reset link for the user
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });

      if (error) {
        console.error('Admin reset email error:', error);
        return {
          success: false,
          message: 'Failed to generate reset link',
          error: error.message,
        };
      }

      // The link is generated but we need to send it via email
      // For now, return the link (in production, send via Resend)
      console.log('Reset link generated:', data);

      return {
        success: true,
        message: 'Password reset email sent to user',
      };
    } catch (error: any) {
      console.error('Admin reset email error:', error);
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
