import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Lock,
  Bell,
  Shield,
  Globe,
  Clock,
  Palette,
  Save,
  Upload,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  AlertCircle,
  Info,
  Check,
  BarChart3,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { PageHeader } from '../components/layout/PageHeader';
import { toast } from 'sonner';
import avatarImage from 'figma:asset/00e8f72492f468a73fc822a8f3b89537848df6aa.png';

export function ProfileSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedSecurity, setSavedSecurity] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@bookingtms.com',
    phone: '+1 (555) 123-4567',
    company: 'Escape Quest Adventures',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    language: 'en',
    avatar: avatarImage
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailReports: true,
    emailMarketing: false,
    pushBookings: true,
    pushStaff: true,
    smsBookings: false,
    smsReminders: true
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginAlerts: true
  });

  const handleSaveProfile = () => {
    // Show success state
    setSavedProfile(true);
    toast.success('Profile settings saved successfully');

    // Reset saved state after 1.5 seconds
    setTimeout(() => {
      setSavedProfile(false);
    }, 1500);
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    setSavedNotifications(true);
    toast.success('Notification preferences updated');

    // Reset saved state after 1.5 seconds
    setTimeout(() => {
      setSavedNotifications(false);
    }, 1500);
  };

  const handleSaveSecurity = () => {
    // Show success state
    setSavedSecurity(true);
    toast.success('Security settings updated');

    // Reset saved state after 1.5 seconds
    setTimeout(() => {
      setSavedSecurity(false);
    }, 1500);
  };

  const handleSavePreferences = () => {
    // Show success state
    setSavedPreferences(true);
    toast.success('Preferences saved successfully');

    // Reset saved state after 1.5 seconds
    setTimeout(() => {
      setSavedPreferences(false);
    }, 1500);
  };

  const handleChangePassword = () => {
    toast.success('Password updated successfully');
  };

  const handleUploadPhoto = () => {
    toast.success('Profile photo updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information and preferences"
        sticky
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="personal" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Personal Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Prefs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          {/* Profile Photo */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Camera className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Profile Photo</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className={`text-2xl ${isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'}`}>
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={handleUploadPhoto}
                    className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                      isDark 
                        ? 'bg-[#4f46e5] border-[#161616] hover:bg-[#4338ca]' 
                        : 'bg-blue-600 border-white hover:bg-blue-700'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="h-11"
                    onClick={handleUploadPhoto}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Photo
                  </Button>
                  <p className={`text-xs ${textMutedClass}`}>
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <User className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Basic Information</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={textClass}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      First Name
                    </div>
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={textClass}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Last Name
                    </div>
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company Name
                  </div>
                </Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <MapPin className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Address Information</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Your business location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="address" className={textClass}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Street Address
                  </div>
                </Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className={textClass}>City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className={textClass}>State</Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip" className={textClass}>ZIP Code</Label>
                  <Input
                    id="zip"
                    value={profileData.zip}
                    onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Country
                  </div>
                </Label>
                <Select value={profileData.country} onValueChange={(value) => setProfileData({ ...profileData, country: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="h-11"
              disabled={savedProfile}
            >
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: savedProfile ? '#10b981' : (isDark ? '#4f46e5' : undefined) }}
              className={savedProfile ? 'text-white hover:opacity-90' : (isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700')}
              onClick={handleSaveProfile}
              disabled={savedProfile}
            >
              {savedProfile ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Success
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Lock className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Change Password</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Current Password
                  </div>
                </Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    New Password
                  </div>
                </Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showNewPassword ? 'text' : 'password'}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={textClass}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm New Password
                  </div>
                </Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator className={borderClass} />

              <Button 
                variant="outline" 
                onClick={handleChangePassword}
                className="h-11"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Two-Factor Authentication</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    <p className={`text-sm ${textClass}`}>Enable Two-Factor Authentication</p>
                    {security.twoFactorEnabled && (
                      <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
                        Enabled
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Require a verification code in addition to your password
                  </p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                />
              </div>

              {security.twoFactorEnabled && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-2">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Two-Factor Authentication Active</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                        Your account is protected with 2FA. You'll need your authentication app to sign in.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Session Settings</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Manage your login sessions and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Session Timeout
                  </div>
                </Label>
                <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Login Alerts</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Get notified of new login attempts from unrecognized devices
                  </p>
                </div>
                <Switch
                  checked={security.loginAlerts}
                  onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="h-11"
              disabled={savedSecurity}
            >
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: savedSecurity ? '#10b981' : (isDark ? '#4f46e5' : undefined) }}
              className={savedSecurity ? 'text-white hover:opacity-90' : (isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700')}
              onClick={handleSaveSecurity}
              disabled={savedSecurity}
            >
              {savedSecurity ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Success
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Mail className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Email Notifications</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Manage your email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Booking Notifications</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    New bookings, cancellations, and modifications
                  </p>
                </div>
                <Switch
                  checked={notifications.emailBookings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailBookings: checked })}
                />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Reports & Analytics</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Daily, weekly, and monthly reports
                  </p>
                </div>
                <Switch
                  checked={notifications.emailReports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailReports: checked })}
                />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Marketing & Updates</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Product updates, tips, and promotional content
                  </p>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailMarketing: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Push Notifications</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>In-app and browser notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>New Bookings</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Instant alerts for new bookings
                  </p>
                </div>
                <Switch
                  checked={notifications.pushBookings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushBookings: checked })}
                />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Staff Updates</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Staff check-ins and schedule changes
                  </p>
                </div>
                <Switch
                  checked={notifications.pushStaff}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushStaff: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Smartphone className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>SMS Notifications</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Text message alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Booking Alerts</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Critical booking updates via SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.smsBookings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, smsBookings: checked })}
                />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Reminders</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>
                    Upcoming booking reminders
                  </p>
                </div>
                <Switch
                  checked={notifications.smsReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, smsReminders: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="h-11">
              Cancel
            </Button>
            <Button 
              style={{ 
                backgroundColor: savedNotifications 
                  ? '#10b981' 
                  : (isDark ? '#4f46e5' : '#2563eb')
              }}
              className="text-white hover:opacity-90 transition-all duration-300"
              onClick={handleSaveNotifications}
              disabled={savedNotifications}
            >
              {savedNotifications ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Success
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Globe className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Regional Settings</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Set your timezone and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="timezone" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timezone
                  </div>
                </Label>
                <Select value={profileData.timezone} onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Language
                  </div>
                </Label>
                <Select value={profileData.language} onValueChange={(value) => setProfileData({ ...profileData, language: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Palette className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Display Preferences</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>Customize how information is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="dateFormat" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Format
                  </div>
                </Label>
                <Select defaultValue="mm/dd/yyyy">
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat" className={textClass}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Format
                  </div>
                </Label>
                <Select defaultValue="12">
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12-hour (2:30 PM)</SelectItem>
                    <SelectItem value="24">24-hour (14:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className={textClass}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Currency
                  </div>
                </Label>
                <Select defaultValue="usd">
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="h-11"
              disabled={savedPreferences}
            >
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: savedPreferences ? '#10b981' : (isDark ? '#4f46e5' : undefined) }}
              className={savedPreferences ? 'text-white hover:opacity-90' : (isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700')}
              onClick={handleSavePreferences}
              disabled={savedPreferences}
            >
              {savedPreferences ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Success
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
