import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/layout/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Building2, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Zap,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [activeTab, setActiveTab] = useState('business');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Form states
  const [businessInfo, setBusinessInfo] = useState({
    name: 'BookingTMS Escape Rooms',
    email: 'contact@bookingtms.com',
    phone: '+1 (555) 123-4567',
    timezone: 'est',
    address: '123 Main Street, New York, NY 10001'
  });

  const [notifications, setNotifications] = useState({
    emailNewBookings: true,
    emailCancellations: true,
    emailDailyReports: false,
    smsReminders: true,
    smsUrgentAlerts: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    onlinePayments: true,
    autoRefunds: false
  });

  const handleSaveBusinessInfo = () => {
    toast.success('Business information saved successfully');
  };

  const handleSavePayments = () => {
    toast.success('Payment settings saved successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved successfully');
  };

  const handleUpdatePassword = () => {
    toast.success('Password updated successfully');
  };

  const handleSaveAppearance = () => {
    toast.success('Appearance settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        description="Manage your account and business preferences"
        sticky
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Grid Menu for Tab Selection */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 ${cardBgClass} border ${borderClass} rounded-lg p-3 sm:p-4`}>
          <button
            onClick={() => setActiveTab('business')}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-lg border-2 transition-all min-h-[100px] sm:min-h-[120px]
              ${activeTab === 'business'
                ? isDark
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg'
                  : 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : isDark
                  ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5] hover:text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900'
              }
            `}
          >
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-center whitespace-nowrap">Business Info</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-lg border-2 transition-all min-h-[100px] sm:min-h-[120px]
              ${activeTab === 'payments'
                ? isDark
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg'
                  : 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : isDark
                  ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5] hover:text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900'
              }
            `}
          >
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-center whitespace-nowrap">Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-lg border-2 transition-all min-h-[100px] sm:min-h-[120px]
              ${activeTab === 'notifications'
                ? isDark
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg'
                  : 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : isDark
                  ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5] hover:text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900'
              }
            `}
          >
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-center whitespace-nowrap">Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-lg border-2 transition-all min-h-[100px] sm:min-h-[120px]
              ${activeTab === 'security'
                ? isDark
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg'
                  : 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : isDark
                  ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5] hover:text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900'
              }
            `}
          >
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-center whitespace-nowrap">Security</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-lg border-2 transition-all min-h-[100px] sm:min-h-[120px]
              ${activeTab === 'appearance'
                ? isDark
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg'
                  : 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : isDark
                  ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5] hover:text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900'
              }
            `}
          >
            <Palette className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-center whitespace-nowrap">Appearance</span>
          </button>
        </div>

        {/* Business Info */}
        <TabsContent value="business" className="space-y-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Building2 className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={`${textClass} text-lg sm:text-xl`}>Business Information</CardTitle>
              </div>
              <CardDescription className={`${textMutedClass} text-sm`}>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Business Name
                    </div>
                  </Label>
                  <Input 
                    id="businessName" 
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                    className={`h-11 sm:h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Business Email
                    </div>
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                    className={`h-11 sm:h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                  </Label>
                  <Input 
                    id="phone" 
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                    className={`h-11 sm:h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timezone
                    </div>
                  </Label>
                  <Select 
                    value={businessInfo.timezone}
                    onValueChange={(value) => setBusinessInfo({...businessInfo, timezone: value})}
                  >
                    <SelectTrigger className={`h-11 sm:h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Business Address
                  </div>
                </Label>
                <Input 
                  id="address" 
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                  className={`h-11 sm:h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
              </div>

              <Separator className={borderClass} />

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button variant="outline" className="min-h-[44px] h-11 sm:h-12 w-full sm:w-auto">
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={`min-h-[44px] h-11 sm:h-12 w-full sm:w-auto ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={handleSaveBusinessInfo}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <CreditCard className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Payment Gateway</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>
                Configure your payment processing and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <CreditCard className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Stripe Integration</p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                      Connect your Stripe account to accept payments
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeKey" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Stripe Publishable Key
                  </div>
                </Label>
                <Input 
                  id="stripeKey" 
                  placeholder="pk_live_..." 
                  className={`h-11 sm:h-12 font-mono text-sm ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecret" className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Stripe Secret Key
                  </div>
                </Label>
                <Input 
                  id="stripeSecret" 
                  type="password" 
                  placeholder="sk_live_..." 
                  className={`h-11 sm:h-12 font-mono text-sm ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
              </div>

              <Separator className={borderClass} />

              <div className="space-y-3 sm:space-y-4">
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors gap-3`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <p className={`text-sm sm:text-base ${textClass}`}>Enable Online Payments</p>
                    </div>
                    <p className={`text-xs sm:text-sm ${textMutedClass}`}>Accept credit card payments online</p>
                  </div>
                  <Switch 
                    checked={paymentSettings.onlinePayments}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, onlinePayments: checked})}
                    className="flex-shrink-0 self-end sm:self-auto"
                  />
                </div>

                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors gap-3`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className={`w-4 h-4 ${textMutedClass}`} />
                      <p className={`text-sm sm:text-base ${textClass}`}>Automatic Refunds</p>
                    </div>
                    <p className={`text-xs sm:text-sm ${textMutedClass}`}>Process refunds automatically when bookings are cancelled</p>
                  </div>
                  <Switch 
                    checked={paymentSettings.autoRefunds}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, autoRefunds: checked})}
                    className="flex-shrink-0 self-end sm:self-auto"
                  />
                </div>
              </div>

              <Separator className={borderClass} />

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="h-11">
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={handleSavePayments}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Notification Preferences</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>
                Choose how you want to be notified about important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className={`w-4 h-4 ${textMutedClass}`} />
                  <h3 className={`text-sm ${textClass}`}>Email Notifications</h3>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                    <div className="flex-1">
                      <p className={`text-sm ${textClass}`}>New Bookings</p>
                      <p className={`text-sm ${textMutedClass}`}>Get notified when a new booking is made</p>
                    </div>
                    <Switch 
                      checked={notifications.emailNewBookings}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNewBookings: checked})}
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                    <div className="flex-1">
                      <p className={`text-sm ${textClass}`}>Booking Cancellations</p>
                      <p className={`text-sm ${textMutedClass}`}>Get notified when a booking is cancelled</p>
                    </div>
                    <Switch 
                      checked={notifications.emailCancellations}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailCancellations: checked})}
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                    <div className="flex-1">
                      <p className={`text-sm ${textClass}`}>Daily Reports</p>
                      <p className={`text-sm ${textMutedClass}`}>Receive daily summary reports</p>
                    </div>
                    <Switch 
                      checked={notifications.emailDailyReports}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailDailyReports: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator className={borderClass} />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className={`w-4 h-4 ${textMutedClass}`} />
                  <h3 className={`text-sm ${textClass}`}>SMS Notifications</h3>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                    <div className="flex-1">
                      <p className={`text-sm ${textClass}`}>Booking Reminders</p>
                      <p className={`text-sm ${textMutedClass}`}>Send SMS reminders to customers</p>
                    </div>
                    <Switch 
                      checked={notifications.smsReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsReminders: checked})}
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                    <div className="flex-1">
                      <p className={`text-sm ${textClass}`}>Urgent Alerts</p>
                      <p className={`text-sm ${textMutedClass}`}>Get SMS for urgent issues</p>
                    </div>
                    <Switch 
                      checked={notifications.smsUrgentAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsUrgentAlerts: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator className={borderClass} />

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="h-11">
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={handleSaveNotifications}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Security Settings</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
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

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    <p className={`text-sm ${textClass}`}>Two-Factor Authentication</p>
                    {twoFactorEnabled && (
                      <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
                        Enabled
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${textMutedClass}`}>Add an extra layer of security to your account</p>
                </div>
                <Switch 
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <Separator className={borderClass} />

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="h-11">
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={handleUpdatePassword}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Palette className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Appearance Settings</CardTitle>
              </div>
              <CardDescription className={textMutedClass}>
                Customize how the dashboard looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-2">
                <Label className={textClass}>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Theme Mode
                  </div>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                        : (isDark ? `border-[#2a2a2a] ${hoverBgClass}` : 'border-gray-200 hover:border-gray-300')
                    }`}
                  >
                    <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === 'light' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Light</p>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                        : (isDark ? `border-[#2a2a2a] ${hoverBgClass}` : 'border-gray-200 hover:border-gray-300')
                    }`}
                  >
                    <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Dark</p>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                        : (isDark ? `border-[#2a2a2a] ${hoverBgClass}` : 'border-gray-200 hover:border-gray-300')
                    }`}
                  >
                    <Monitor className={`w-6 h-6 mx-auto mb-2 ${theme === 'system' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>System</p>
                  </button>
                </div>
              </div>

              <Separator className={borderClass} />

              <div className="space-y-2">
                <Label className={textClass}>
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Sidebar Position
                  </div>
                </Label>
                <Select defaultValue="left">
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className={borderClass} />

              <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-sm ${textClass}`}>Compact Mode</p>
                  </div>
                  <p className={`text-sm ${textMutedClass}`}>Reduce spacing for more content on screen</p>
                </div>
                <Switch />
              </div>

              <Separator className={borderClass} />

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="h-11">
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={handleSaveAppearance}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
