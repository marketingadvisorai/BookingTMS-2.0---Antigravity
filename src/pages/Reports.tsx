import { useState, useEffect } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AnalyticsDashboard } from '../features/booking-analytics';
import { BarChart2, LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/layout/PageHeader';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import {
  Download,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  Percent,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Chart colors for game popularity
const CHART_COLORS = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

export function Reports() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  const chartGridColor = isDark ? '#2a2a2a' : '#e5e7eb';
  const chartAxisColor = isDark ? '#737373' : '#6b7280';
  const tooltipBg = isDark ? '#1e1e1e' : 'white';
  const tooltipBorder = isDark ? '#2a2a2a' : '#e5e7eb';

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>(['revenue', 'games', 'occupancy', 'summary']);
  const [dateRange, setDateRange] = useState('last-30');
  const [loading, setLoading] = useState(true);

  // Real data state
  const [reportData, setReportData] = useState({
    stats: {
      totalRevenue: 0,
      totalBookings: 0,
      avgBookingValue: 0,
      avgOccupancy: 0,
      revenueTrend: 0,
      bookingsTrend: 0,
      occupancyTrend: 0
    },
    revenueData: [] as Array<{ month: string; revenue: number; bookings: number }>,
    activityPopularityData: [] as Array<{ name: string; bookings: number; fill: string }>,
    occupancyData: [] as Array<{ day: string; rate: number }>
  });

  // Load data when component mounts or date range changes
  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  // Get date range based on selection
  const getDateRange = (range: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case 'last-7':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'last-30':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last-90':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'year':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1);
        break;
    }

    return { startDate, endDate };
  };

  // Load all report data
  const loadReportData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(dateRange);

      // Fetch all data in parallel
      const [stats, revenueTrend, activityPopularity, occupancy] = await Promise.all([
        fetchSummaryStats(startDate, endDate),
        fetchRevenueTrend(startDate, endDate),
        fetchActivityPopularity(startDate, endDate),
        fetchOccupancyData(startDate, endDate)
      ]);

      setReportData({
        stats,
        revenueData: revenueTrend,
        activityPopularityData: activityPopularity,
        occupancyData: occupancy
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary statistics
  const fetchSummaryStats = async (startDate: Date, endDate: Date) => {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select('id, total_amount, status, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const activeBookings = data?.filter(b => b.status !== 'cancelled') || [];
    const totalRevenue = activeBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0);
    const totalBookings = activeBookings.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate previous period for trends
    const duration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - duration);
    const prevEndDate = new Date(startDate);

    const { data: prevData } = await (supabase
      .from('bookings') as any)
      .select('id, total_amount, status')
      .gte('created_at', prevStartDate.toISOString())
      .lte('created_at', prevEndDate.toISOString());

    const prevActiveBookings = prevData?.filter(b => b.status !== 'cancelled') || [];
    const prevRevenue = prevActiveBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0);
    const prevBookings = prevActiveBookings.length;

    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const bookingsTrend = prevBookings > 0 ? ((totalBookings - prevBookings) / prevBookings) * 100 : 0;

    return {
      totalRevenue,
      totalBookings,
      avgBookingValue,
      avgOccupancy: 73.6, // Placeholder - would need slot data
      revenueTrend,
      bookingsTrend,
      occupancyTrend: -2.1 // Placeholder
    };
  };

  // Fetch revenue trend by month
  const fetchRevenueTrend = async (startDate: Date, endDate: Date) => {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select('booking_date, total_amount, status')
      .gte('booking_date', startDate.toISOString().split('T')[0])
      .lte('booking_date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    const monthlyData = new Map<string, { revenue: number; bookings: number }>();

    data?.filter(b => b.status !== 'cancelled').forEach(booking => {
      const date = new Date(booking.booking_date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, bookings: 0 });
      }

      const current = monthlyData.get(monthKey)!;
      current.revenue += parseFloat(booking.total_amount || '0');
      current.bookings += 1;
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      bookings: data.bookings
    }));
  };

  // Fetch activity popularity
  const fetchActivityPopularity = async (startDate: Date, endDate: Date) => {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select(`
        activity_id,
        status,
        activities (name)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const activityStats = new Map<string, number>();

    data?.filter(b => b.status !== 'cancelled').forEach(booking => {
      const activityName = (booking.activities as any)?.name || 'Unknown';
      activityStats.set(activityName, (activityStats.get(activityName) || 0) + 1);
    });

    return Array.from(activityStats.entries())
      .map(([name, bookings], index) => ({
        name,
        bookings,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 6);
  };

  // Fetch occupancy data
  const fetchOccupancyData = async (startDate: Date, endDate: Date) => {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select('booking_date, status')
      .gte('booking_date', startDate.toISOString().split('T')[0])
      .lte('booking_date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    const dayStats = new Map<string, number>();
    const dayCounts = new Map<string, number>();

    data?.filter(b => b.status !== 'cancelled').forEach(booking => {
      const date = new Date(booking.booking_date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      dayStats.set(dayName, (dayStats.get(dayName) || 0) + 1);
      dayCounts.set(dayName, (dayCounts.get(dayName) || 0) + 1);
    });

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysOfWeek.map(day => ({
      day,
      rate: Math.round((dayStats.get(day) || 0) * 10) // Simplified calculation
    }));
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dateLabel =
        dateRange === 'last-7' ? 'Last 7 days' :
          dateRange === 'last-30' ? 'Last 30 days' :
            dateRange === 'last-90' ? 'Last 90 days' :
              dateRange === 'year' ? 'This year' : 'All time';

      const summary = (() => {
        const { stats, revenueData, activityPopularityData, occupancyData } = reportData;
        const topActivity = activityPopularityData.length > 0
          ? activityPopularityData.reduce((prev, cur) => cur.bookings > prev.bookings ? cur : prev, activityPopularityData[0])
          : { name: 'N/A', bookings: 0 };
        const avgOccupancy = occupancyData.length > 0
          ? Math.round(occupancyData.reduce((sum, o) => sum + o.rate, 0) / occupancyData.length)
          : 0;
        return {
          totalRevenue: stats.totalRevenue,
          totalBookings: stats.totalBookings,
          avgValue: stats.avgBookingValue,
          topActivity: topActivity.name,
          avgOccupancy
        };
      })();

      if (exportFormat === 'csv') {
        const sections: string[] = [];

        if (selectedReports.includes('summary')) {
          sections.push('Section: Summary Statistics');
          sections.push('Metric,Value');
          sections.push(`Total Revenue,$${summary.totalRevenue}`);
          sections.push(`Total Bookings,${summary.totalBookings}`);
          sections.push(`Average Booking Value,$${summary.avgValue.toFixed(2)}`);
          sections.push(`Top Activity,${summary.topActivity}`);
          sections.push(`Average Occupancy,${summary.avgOccupancy}%`);
        }

        if (selectedReports.includes('revenue')) {
          sections.push('', 'Section: Revenue & Bookings Trend');
          sections.push('Month,Revenue,Bookings');
          reportData.revenueData.forEach(r => sections.push(`${r.month},${r.revenue},${r.bookings}`));
        }

        if (selectedReports.includes('games')) {
          sections.push('', 'Section: Activity Popularity');
          sections.push('Activity,Bookings');
          reportData.activityPopularityData.forEach(g => sections.push(`${g.name},${g.bookings}`));
        }

        if (selectedReports.includes('occupancy')) {
          sections.push('', 'Section: Weekly Occupancy');
          sections.push('Day,Rate (%)');
          reportData.occupancyData.forEach(o => sections.push(`${o.day},${o.rate}`));
        }

        const csvContent = sections.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const doc = new jsPDF();
        let y = 20;
        doc.setFontSize(16);
        doc.text('Reports Export', 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.text(`Range: ${dateLabel}`, 14, y);
        y += 10;

        const addHeading = (title: string) => {
          doc.setFontSize(13);
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(title, 14, y);
          y += 6;
          doc.setFontSize(11);
        };

        const addLine = (text: string) => {
          if (y > 285) { doc.addPage(); y = 20; }
          doc.text(text, 14, y);
          y += 6;
        };

        if (selectedReports.includes('summary')) {
          addHeading('Summary Statistics');
          addLine(`Total Revenue: $${summary.totalRevenue}`);
          addLine(`Total Bookings: ${summary.totalBookings}`);
          addLine(`Average Booking Value: $${summary.avgValue.toFixed(2)}`);
          addLine(`Top Activity: ${summary.topActivity}`);
          addLine(`Average Occupancy: ${summary.avgOccupancy}%`);
          y += 4;
        }

        if (selectedReports.includes('revenue')) {
          addHeading('Revenue & Bookings Trend');
          reportData.revenueData.forEach(r => addLine(`${r.month}: $${r.revenue} revenue, ${r.bookings} bookings`));
          y += 4;
        }

        if (selectedReports.includes('games')) {
          addHeading('Activity Popularity');
          reportData.activityPopularityData.forEach(g => addLine(`${g.name}: ${g.bookings} bookings`));
          y += 4;
        }

        if (selectedReports.includes('occupancy')) {
          addHeading('Weekly Occupancy');
          reportData.occupancyData.forEach(o => addLine(`${o.day}: ${o.rate}%`));
        }

        doc.save(`reports_${new Date().toISOString().slice(0, 10)}.pdf`);
      }

      toast.success(`Report exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export reports');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const toggleReport = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        description="Track performance and business insights"
        sticky
        action={
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="flex-1 sm:w-40 h-11">
                <Calendar className="w-4 h-4 mr-2 sm:hidden" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="last-90">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <PermissionGuard permissions={['reports.export']}>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                className="h-11 w-11 flex-shrink-0 p-0"
                size="icon"
              >
                <Download className="w-4 h-4" />
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'analytics')} className="w-full">
        <TabsList className={`grid w-full max-w-md grid-cols-2 ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Existing Reports */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Revenue</p>
                <p className={`text-2xl mt-2 ${textClass}`}>${reportData.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <DollarSign className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${reportData.stats.revenueTrend >= 0 ? (isDark ? 'text-emerald-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {reportData.stats.revenueTrend >= 0 ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
              <span>{reportData.stats.revenueTrend >= 0 ? '+' : ''}{reportData.stats.revenueTrend.toFixed(1)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Bookings</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{reportData.stats.totalBookings.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <Users className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${reportData.stats.bookingsTrend >= 0 ? (isDark ? 'text-emerald-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {reportData.stats.bookingsTrend >= 0 ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
              <span>{reportData.stats.bookingsTrend >= 0 ? '+' : ''}{reportData.stats.bookingsTrend.toFixed(1)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Avg. Booking Value</p>
                <p className={`text-2xl mt-2 ${textClass}`}>${reportData.stats.avgBookingValue.toFixed(2)}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Percent className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span>Per booking average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Bookings Chart */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <CardTitle className={textClass}>Revenue & Bookings Trend</CardTitle>
              </div>
              <CardDescription className={`${textMutedClass} mt-1`}>
                Monthly performance overview
              </CardDescription>
            </div>
            <Badge variant="secondary" className={isDark ? 'bg-[#1e1e1e] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>
              {dateRange === 'last-7' ? 'Last 7 days' : dateRange === 'last-30' ? 'Last 30 days' : dateRange === 'last-90' ? 'Last 90 days' : dateRange === 'year' ? 'This year' : 'All time'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reportData.revenueData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <BarChart3 className={`w-12 h-12 mb-3 ${textMutedClass}`} />
              <p className={textMutedClass}>No revenue data available for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-[500px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis
                      dataKey="month"
                      stroke={chartAxisColor}
                      fontSize={12}
                      tick={{ fill: chartAxisColor }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={chartAxisColor}
                      fontSize={12}
                      width={60}
                      tick={{ fill: chartAxisColor }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={chartAxisColor}
                      fontSize={12}
                      width={40}
                      tick={{ fill: chartAxisColor }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: isDark ? 'white' : 'black',
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: '12px',
                        color: chartAxisColor
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill={isDark ? '#4f46e5' : '#2563eb'}
                      name="Revenue ($)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="bookings"
                      fill={isDark ? '#7c3aed' : '#7c3aed'}
                      name="Bookings"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Popularity and Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Popularity */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <CardTitle className={textClass}>Activity Popularity</CardTitle>
            </div>
            <CardDescription className={`${textMutedClass} mt-1`}>
              Bookings by activity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {loading ? (
              <div className="flex items-center justify-center h-[260px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reportData.activityPopularityData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[260px] text-center">
                <PieChartIcon className={`w-12 h-12 mb-3 ${textMutedClass}`} />
                <p className={textMutedClass}>No activity data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={reportData.activityPopularityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    dataKey="bookings"
                  >
                    {reportData.activityPopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDark ? 'white' : 'black',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading && reportData.activityPopularityData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {reportData.activityPopularityData.map((activity) => (
                  <div key={activity.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: activity.fill }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm truncate block ${textMutedClass}`}>
                        {activity.name}
                      </span>
                      <span className={`text-xs ${textMutedClass}`}>
                        {activity.bookings} bookings
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              <CardTitle className={textClass}>Weekly Occupancy Rate</CardTitle>
            </div>
            <CardDescription className={`${textMutedClass} mt-1`}>
              Average capacity utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {loading ? (
              <div className="flex items-center justify-center h-[260px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reportData.occupancyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[260px] text-center">
                <Activity className={`w-12 h-12 mb-3 ${textMutedClass}`} />
                <p className={textMutedClass}>No occupancy data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={reportData.occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis
                    dataKey="day"
                    stroke={chartAxisColor}
                    fontSize={12}
                    tick={{ fill: chartAxisColor }}
                  />
                  <YAxis
                    stroke={chartAxisColor}
                    fontSize={12}
                    unit="%"
                    width={45}
                    tick={{ fill: chartAxisColor }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDark ? 'white' : 'black',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={isDark ? '#10b981' : '#16a34a'}
                    strokeWidth={3}
                    dot={{ fill: isDark ? '#10b981' : '#16a34a', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Occupancy Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        </div>
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className={`max-h-[90vh] overflow-y-auto sm:max-w-[500px] ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Export Reports</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Download your analytics data in your preferred format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className={`text-sm mb-2 block ${textClass}`}>Export Format</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${exportFormat === 'csv'
                    ? (isDark
                      ? 'border-[#4f46e5] bg-[#4f46e5]/10'
                      : 'border-blue-600 bg-blue-50'
                    )
                    : (isDark
                      ? `border-[#2a2a2a] ${hoverBgClass}`
                      : 'border-gray-200 hover:border-gray-300'
                    )
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    <p className={`text-sm ${textClass}`}>CSV File</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>Excel compatible</p>
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${exportFormat === 'pdf'
                    ? (isDark
                      ? 'border-[#4f46e5] bg-[#4f46e5]/10'
                      : 'border-blue-600 bg-blue-50'
                    )
                    : (isDark
                      ? `border-[#2a2a2a] ${hoverBgClass}`
                      : 'border-gray-200 hover:border-gray-300'
                    )
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    <p className={`text-sm ${textClass}`}>PDF File</p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>Printable format</p>
                </button>
              </div>
            </div>

            <Separator className={borderClass} />

            <div>
              <Label className={`text-sm mb-2 block ${textClass}`}>Select Reports to Include</Label>
              <div className="space-y-3 mt-2">
                <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${borderClass} ${hoverBgClass}`}>
                  <Checkbox
                    id="revenue"
                    checked={selectedReports.includes('revenue')}
                    onCheckedChange={() => toggleReport('revenue')}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="revenue" className={`text-sm cursor-pointer block ${textClass}`}>
                      Revenue & Bookings Trend
                    </Label>
                    <p className={`text-xs mt-0.5 ${textMutedClass}`}>Monthly performance overview with charts</p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${borderClass} ${hoverBgClass}`}>
                  <Checkbox
                    id="games"
                    checked={selectedReports.includes('games')}
                    onCheckedChange={() => toggleReport('games')}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="games" className={`text-sm cursor-pointer block ${textClass}`}>
                      Game Popularity Analysis
                    </Label>
                    <p className={`text-xs mt-0.5 ${textMutedClass}`}>Booking distribution by game</p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${borderClass} ${hoverBgClass}`}>
                  <Checkbox
                    id="occupancy"
                    checked={selectedReports.includes('occupancy')}
                    onCheckedChange={() => toggleReport('occupancy')}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="occupancy" className={`text-sm cursor-pointer block ${textClass}`}>
                      Weekly Occupancy Rate
                    </Label>
                    <p className={`text-xs mt-0.5 ${textMutedClass}`}>Capacity utilization by day</p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${borderClass} ${hoverBgClass}`}>
                  <Checkbox
                    id="summary"
                    checked={selectedReports.includes('summary')}
                    onCheckedChange={() => toggleReport('summary')}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="summary" className={`text-sm cursor-pointer block ${textClass}`}>
                      Summary Statistics
                    </Label>
                    <p className={`text-xs mt-0.5 ${textMutedClass}`}>Total revenue, bookings, and occupancy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div className="min-w-0">
                  <p className={`text-xs ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>
                    {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected for export
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    File will include charts, graphs, and detailed analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
              className="w-full sm:w-auto h-11"
            >
              Cancel
            </Button>
            <PermissionGuard permissions={['reports.export']}>
              <Button
                style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-[#4338ca]'}
                onClick={handleExport}
                disabled={isExporting || selectedReports.length === 0}
              >
                {isExporting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </PermissionGuard>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
