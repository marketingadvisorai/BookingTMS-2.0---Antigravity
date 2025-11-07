import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Shield,
  Activity,
  CreditCard,
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  Edit,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { PageHeader } from '../components/layout/PageHeader';
import avatarImage from 'figma:asset/00e8f72492f468a73fc822a8f3b89537848df6aa.png';

export function MyAccount() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  const hoverShadowClass = isDark ? 'hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'hover:shadow-md';

  const [accountData] = useState({
    name: 'John Doe',
    email: 'john.doe@bookingtms.com',
    phone: '+1 (555) 123-4567',
    role: 'Owner',
    company: 'Escape Quest Adventures',
    location: 'San Francisco, CA',
    joinDate: 'January 15, 2024',
    plan: 'Professional',
    status: 'Active',
    avatar: avatarImage
  });

  const [usageStats] = useState({
    bookings: { current: 45, limit: 60 },
    games: { current: 8, limit: 15 },
    staff: { current: 12, limit: 25 },
    aiConversations: { current: 52, limit: 60 },
    credits: { current: 140, limit: 200 }
  });

  const [recentActivity] = useState([
    { action: 'Created new game', details: 'The Haunted Manor', time: '2 hours ago', icon: Activity },
    { action: 'Added staff member', details: 'Sarah Johnson - Manager', time: '5 hours ago', icon: Users },
    { action: 'Updated billing information', details: 'Payment method updated', time: '1 day ago', icon: CreditCard },
    { action: 'Generated report', details: 'Monthly Revenue Report', time: '2 days ago', icon: BarChart3 },
    { action: 'Modified waiver template', details: 'Standard Liability Waiver', time: '3 days ago', icon: Shield }
  ]);

  const getUsagePercentage = (current: number, limit: number) => {
    return (current / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return isDark ? 'bg-red-500' : 'bg-red-600';
    if (percentage >= 70) return isDark ? 'bg-yellow-500' : 'bg-yellow-600';
    return isDark ? '#4f46e5' : 'bg-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Account"
        description="Manage your account information and preferences"
        sticky
      />

      {/* Profile Overview Card */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
              <Avatar className="w-24 h-24">
                <AvatarImage src={accountData.avatar} />
                <AvatarFallback className={`text-2xl ${isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'}`}>
                  {accountData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className={textClass}>{accountData.name}</h2>
                    <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {accountData.status}
                    </Badge>
                  </div>
                  <p className={textMutedClass}>{accountData.role} • {accountData.company}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{accountData.email}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {accountData.phone}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{accountData.company}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {accountData.location}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    Member since {accountData.joinDate}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    {accountData.plan} Plan
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto h-11">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Bookings This Month</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{usageStats.bookings.current}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <Calendar className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Active Games</p>
                <p className={`text-2xl mt-2 ${textClass}`}>8</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <Activity className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Team Members</p>
                <p className={`text-2xl mt-2 ${textClass}`}>12</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Users className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>AI Conversations</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{usageStats.aiConversations.current}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <BarChart3 className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage & Limits */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <CardTitle className={textClass}>Usage & Limits</CardTitle>
            <CardDescription className={textMutedClass}>Current usage across your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0">
            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Bookings this month</span>
                <span className={textClass}>
                  {usageStats.bookings.current.toLocaleString()} / {usageStats.bookings.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.bookings.current, usageStats.bookings.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Active Games</span>
                <span className={textClass}>
                  {usageStats.games.current} / {usageStats.games.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.games.current, usageStats.games.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Staff Members</span>
                <span className={textClass}>
                  {usageStats.staff.current} / {usageStats.staff.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.staff.current, usageStats.staff.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>AI Conversations</span>
                <span className={textClass}>
                  {usageStats.aiConversations.current.toLocaleString()} / {usageStats.aiConversations.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.aiConversations.current, usageStats.aiConversations.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Credits Used</span>
                <span className={textClass}>
                  {usageStats.credits.current} / {usageStats.credits.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.credits.current, usageStats.credits.limit)} 
                className="h-2"
              />
            </div>

            <Separator className={borderClass} />

            <Button 
              variant="outline" 
              className="w-full h-11"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <CardTitle className={textClass}>Recent Activity</CardTitle>
            <CardDescription className={textMutedClass}>Your latest actions and changes</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgElevatedClass}`}>
                      <Icon className={`w-5 h-5 ${textMutedClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${textClass}`}>{activity.action}</p>
                      <p className={`text-xs ${textMutedClass}`}>{activity.details}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className={`w-3 h-3 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                        <p className={`text-xs ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Status */}
      <Card className={`border shadow-sm ${isDark ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-green-200 bg-green-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`w-6 h-6 mt-0.5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
            <div className="flex-1 min-w-0">
              <h3 className={isDark ? 'text-emerald-300' : 'text-green-900'}>Account in Good Standing</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-emerald-400/70' : 'text-green-700'}`}>
                Your account is active and all services are running smoothly. Next billing date: December 15, 2025
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
