/**
 * Admin User Password Reset Modal
 * 
 * Allows System Admin and Super Admin to:
 * 1. Send password reset email to user
 * 2. Set a new password directly
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Mail, Key, Loader2, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { passwordService } from '../../services/password.service';

interface UserPasswordResetModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export const UserPasswordResetModal: React.FC<UserPasswordResetModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'manual'>('email');
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };
  const allChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSendResetEmail = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const result = await passwordService.adminSendResetEmail(user.email);

      if (result.success) {
        toast.success(`Password reset email sent to ${user.email}`);
        setSuccess(true);
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!user) return;

    if (!allChecksPassed) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await passwordService.adminSetPassword(user.id, newPassword);

      if (result.success) {
        toast.success(`Password updated for ${user.name}`);
        setSuccess(true);
      } else {
        toast.error(result.error || 'Failed to set password');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setSuccess(false);
    setActiveTab('email');
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {activeTab === 'email'
                ? 'Password reset email has been sent successfully.'
                : 'Password has been updated successfully.'}
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Send Email
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Set Password
              </TabsTrigger>
            </TabsList>

            {/* Send Reset Email Tab */}
            <TabsContent value="email" className="space-y-4 pt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Email Reset
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      Send a password reset link to the user's email address. They will be able to set a new password themselves.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendResetEmail}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Email
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Set Password Manually Tab */}
            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Admin Override
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                      Set a new password directly. The user should be informed of their new password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="text-xs space-y-1">
                  <div className={passwordChecks.length ? 'text-green-600' : 'text-gray-400'}>
                    ✓ At least 8 characters
                  </div>
                  <div className={passwordChecks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                    ✓ One uppercase letter
                  </div>
                  <div className={passwordChecks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                    ✓ One lowercase letter
                  </div>
                  <div className={passwordChecks.number ? 'text-green-600' : 'text-gray-400'}>
                    ✓ One number
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button
                  onClick={handleSetPassword}
                  disabled={loading || !allChecksPassed || !passwordsMatch}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Set New Password
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
