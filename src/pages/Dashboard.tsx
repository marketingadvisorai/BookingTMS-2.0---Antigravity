import { Calendar, DollarSign, TrendingUp, Users, Clock, MapPin, UserCheck, Activity, ArrowRight, Sparkles, RefreshCcw } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/layout/ThemeContext';
import { useEffect, useState } from 'react';
import DataSyncService, { DataSyncEvents } from '../services/DataSyncService';
import { toast } from 'sonner';

// State-driven data populated from localStorage via DataSyncService
const recentActivity: any[] = [];

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingsTrend, setBookingsTrend] = useState<any[]>([]);
  const [todayHourly, setTodayHourly] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [avgGroupSize, setAvgGroupSize] = useState(0);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Chart colors based on theme
  const chartColors = {
    primary: isDark ? '#4f46e5' : '#4f46e5',
    secondary: isDark ? '#5b5bff' : '#9333ea',
    grid: isDark ? '#2a2a2a' : '#e5e7eb',
    text: isDark ? '#737373' : '#6b7280',
    tooltip: isDark ? '#1e1e1e' : '#ffffff',
    tooltipBorder: isDark ? '#2a2a2a' : '#e5e7eb',
    gradient1: isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)',
    gradient2: isDark ? 'rgba(79, 70, 229, 0)' : 'rgba(79, 70, 229, 0)',
  };

  // Load dashboard data from localStorage and subscribe to real-time updates
  useEffect(() => {
    const loadDashboardData = () => {
      const bookings = DataSyncService.getAllBookings();
      const s = DataSyncService.getBookingStats();
      setStats(s);

      // Avg group size
      const avg = bookings.length > 0
        ? bookings.reduce((sum: number, b: any) => sum + (b.participants || 0), 0) / bookings.length
        : 0;
      setAvgGroupSize(avg);

      // Weekly trend: last 8 weeks
      const startOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
        const start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return start;
      };
      const endOfWeek = (start: Date) => {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
      };
      const formatWeekLabel = (start: Date) => {
        return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      };

      const now = new Date();
      const weekly: any[] = [];
      for (let i = 7; i >= 0; i--) {
        const ref = new Date(now);
        ref.setDate(now.getDate() - i * 7);
        const ws = startOfWeek(ref);
        const we = endOfWeek(ws);
        const count = bookings.filter((b: any) => {
          const bd = new Date(b.date || b.timestamp);
          return bd >= ws && bd <= we && b.status !== 'cancelled';
        }).length;
        weekly.push({ week: formatWeekLabel(ws), bookings: count });
      }
      setBookingsTrend(weekly);

      // Today's hourly bookings
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayList = bookings.filter((b: any) => b.date === todayStr && b.status !== 'cancelled');
      const hours = [
        '10:00 AM','11:30 AM','1:00 PM','2:30 PM','4:00 PM','5:30 PM','7:00 PM','8:30 PM'
      ];
      const hourly = hours.map(h => ({
        hour: h,
        bookings: todayList.filter((b: any) => b.time === h).length,
      }));
      setTodayHourly(hourly);

      // Upcoming bookings (next 5)
      const upcomingRaw = bookings
        .filter((b: any) => {
          const bd = new Date(b.date);
          const today = new Date();
          const bdDate = new Date(bd.getFullYear(), bd.getMonth(), bd.getDate());
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return bdDate >= todayDate && b.status !== 'cancelled';
        })
        .sort((a: any, b: any) => {
          const ad = new Date(`${a.date} ${a.time}`);
          const bd = new Date(`${b.date} ${b.time}`);
          return ad.getTime() - bd.getTime();
        })
        .slice(0, 5)
        .map((b: any) => ({
          id: b.id,
          customer: b.customerName,
          status: b.status,
          game: b.gameName,
          time: b.time,
          guests: b.participants || 0,
        }));
      setUpcoming(upcomingRaw);
    };

    loadDashboardData();
    const handler = () => loadDashboardData();
    DataSyncEvents.subscribe('bookings-updated', handler);
    return () => {
      DataSyncEvents.unsubscribe('bookings-updated', handler);
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back! Here's what's happening today - ${today}`}
        sticky
        action={
          <Button 
            variant="outline"
            className="h-11"
            onClick={() => {
              setIsRefreshing(true);
              try {
                window.location.reload();
              } catch (error) {
                toast.error('Failed to refresh dashboard');
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <KPICard
          title="Total Bookings"
          value={new Intl.NumberFormat('en-US').format(stats.totalBookings)}
          change={12.5}
          icon={Calendar}
          iconColor="bg-blue-600 dark:bg-[#4f46e5]"
        />
        <KPICard
          title="Revenue"
          value={`$${new Intl.NumberFormat('en-US').format(Math.round(stats.totalRevenue))}`}
          change={8.2}
          icon={DollarSign}
          iconColor="bg-emerald-600 dark:bg-emerald-500"
        />
        <KPICard
          title="Conversion Rate"
          value={`${(
            stats.totalBookings > 0
              ? (stats.confirmedBookings / stats.totalBookings) * 100
              : 0
          ).toFixed(2)}%`}
          change={-2.1}
          icon={TrendingUp}
          iconColor="bg-purple-600 dark:bg-purple-500"
        />
        <KPICard
          title="Avg Group Size"
          value={`${avgGroupSize.toFixed(1)}`}
          change={5.3}
          icon={Users}
          iconColor="bg-orange-600 dark:bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Weekly Bookings Trend */}
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base sm:text-lg">Weekly Bookings Trend</CardTitle>
                  <Sparkles className="w-4 h-4 text-[#4f46e5] dark:text-[#6366f1]" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Last 8 weeks performance</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[400px] px-4 sm:px-0">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={bookingsTrend}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                    <XAxis 
                      dataKey="week" 
                      stroke={chartColors.text} 
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke={chartColors.text} 
                      fontSize={11} 
                      width={35}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: chartColors.tooltip, 
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: isDark ? '#ffffff' : '#000000'
                      }} 
                    />
                    <Area
                      type="monotone" 
                      dataKey="bookings" 
                      stroke={chartColors.primary} 
                      strokeWidth={2.5}
                      fill="url(#colorBookings)"
                      dot={{ fill: chartColors.primary, r: 4, strokeWidth: 2, stroke: isDark ? '#161616' : '#ffffff' }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      name="Bookings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Bookings by Hour */}
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base sm:text-lg">Today's Bookings</CardTitle>
                  <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Hourly distribution</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[400px] px-4 sm:px-0">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={todayHourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                    <XAxis 
                      dataKey="hour" 
                      stroke={chartColors.text} 
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke={chartColors.text} 
                      fontSize={11} 
                      width={35}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: chartColors.tooltip, 
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: isDark ? '#ffffff' : '#000000'
                      }} 
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill={chartColors.primary}
                      radius={[6, 6, 0, 0]}
                      name="Bookings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Upcoming Bookings */}
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Upcoming Today</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mt-1">Next bookings scheduled</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[#4f46e5] dark:text-[#6366f1] hover:text-[#4338ca] dark:hover:text-[#818cf8] hover:bg-blue-50 dark:hover:bg-[#4f46e5]/10 text-xs sm:text-sm">
                View All
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0">
            <div className="space-y-3">
              {upcoming.map((booking, index) => (
                <div 
                  key={booking.id} 
                  className="group relative flex items-start gap-3 p-3.5 rounded-lg border border-gray-100 dark:border-[#2a2a2a] hover:border-[#4f46e5]/30 dark:hover:border-[#6366f1]/30 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm text-gray-900 dark:text-white truncate group-hover:text-[#4f46e5] dark:group-hover:text-[#6366f1] transition-colors">{booking.customer}</p>
                      <Badge 
                        variant="secondary"
                        className={`flex-shrink-0 text-xs ${
                          booking.status === 'confirmed' 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                        } border`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] truncate mb-2">{booking.game}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-[#737373]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{booking.guests} guests</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mt-1">Latest updates</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="group flex items-start gap-3 pb-3.5 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0 last:pb-0 hover:scale-[1.01] transition-transform"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate group-hover:text-[#4f46e5] dark:group-hover:text-[#6366f1] transition-colors">{activity.customer}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] truncate">{activity.game}</p>
                    <p className="text-xs text-gray-500 dark:text-[#737373] mt-1">{activity.time}</p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`flex-shrink-0 text-xs border ${
                      activity.status === 'confirmed' 
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                        : ''
                    }${
                      activity.status === 'pending' 
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' 
                        : ''
                    }${
                      activity.status === 'cancelled' 
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' 
                        : ''
                    }${
                      activity.status === 'positive' 
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' 
                        : ''
                    }`}
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
