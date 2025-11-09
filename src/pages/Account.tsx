import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import { useTheme } from '../components/layout/ThemeContext';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Key,
  Bell,
  Eye,
  EyeOff,
  Save,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Settings as SettingsIcon,
  Crown,
  Users,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  metadata: any;
}

export function Account() {
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;

    try {
      setProfileLoading(true);

      // Get user profile from user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          await createUserProfile();
        }
      } else if (profileData) {
        setProfile(profileData);
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setPhone(profileData.phone || '');
        setCompany(profileData.company || '');
      }

      // Get email from auth.users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      }

      // Load notification preferences from metadata
      if (profileData?.metadata) {
        setEmailNotifications(profileData.metadata.emailNotifications ?? true);
        setPushNotifications(profileData.metadata.pushNotifications ?? true);
        setSmsNotifications(profileData.metadata.smsNotifications ?? false);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const createUserProfile = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: currentUser.id,
          role: currentUser.role || 'staff',
          status: 'active',
          metadata: {}
        });

      if (error) throw error;
      
      await loadUserProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          company: company,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      // Update email in auth if changed
      if (email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });

        if (emailError) throw emailError;
        toast.info('Verification email sent to new address');
      }

      toast.success('Profile updated successfully');
      await loadUserProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const metadata = {
        ...(profile?.metadata || {}),
        emailNotifications,
        pushNotifications,
        smsNotifications
      };

      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Notification preferences updated');
      await loadUserProfile();
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      'super-admin': { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Crown },
      'admin': { label: 'Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Shield },
      'beta-owner': { label: 'Beta Owner', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Briefcase },
      'manager': { label: 'Manager', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: Users },
      'staff': { label: 'Staff', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: User }
    };

    const badge = badges[role] || badges['staff'];
    const Icon = badge.icon;

    return (
      <Badge className={`${badge.color} border-0 gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Account"
        description="Manage your account settings and preferences"
      />

      {/* Profile Header Card */}
      <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {firstName && lastName ? getInitials(firstName, lastName) : currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {firstName && lastName ? `${firstName} ${lastName}` : currentUser?.name || 'User'}
                </h2>
                {currentUser?.role && getRoleBadge(currentUser.role)}
              </div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{email}</p>
              {company && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Building2 className="w-3 h-3 inline mr-1" />
                  {company}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-3 ${isDark ? 'bg-[#161616]' : 'bg-gray-100'}`}>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
                <p className="text-xs text-gray-500">
                  Changing your email will require verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company / Organization</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={loadUserProfile}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions Card */}
          <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>Your account role and access level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-200">Current Role</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {currentUser?.role === 'super-admin' && 'Full system access with all permissions'}
                    {currentUser?.role === 'admin' && 'Administrative access to manage organization'}
                    {currentUser?.role === 'beta-owner' && 'Beta program owner with extended access'}
                    {currentUser?.role === 'manager' && 'Manage bookings, staff, and operations'}
                    {currentUser?.role === 'staff' && 'Standard staff access to daily operations'}
                  </p>
                </div>
                {currentUser?.role && getRoleBadge(currentUser.role)}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Permissions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['super-admin', 'admin', 'beta-owner'].includes(currentUser?.role || '') && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Manage Venues</span>
                      </div>
                    </>
                  )}
                  {['super-admin', 'admin', 'beta-owner', 'manager'].includes(currentUser?.role || '') && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Manage Bookings</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>View Reports</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>View Bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Manage Profile</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Password must be at least 6 characters long
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleUpdatePassword} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account information and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                  <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="mt-1 font-medium">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via text message
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleUpdateNotifications} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
