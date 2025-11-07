import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
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

const revenueData = [
  { month: 'Jan', revenue: 12400, bookings: 42 },
  { month: 'Feb', revenue: 15600, bookings: 52 },
  { month: 'Mar', revenue: 18900, bookings: 63 },
  { month: 'Apr', revenue: 16200, bookings: 54 },
  { month: 'May', revenue: 21300, bookings: 71 },
  { month: 'Jun', revenue: 24800, bookings: 83 },
  { month: 'Jul', revenue: 28400, bookings: 95 },
  { month: 'Aug', revenue: 26100, bookings: 87 },
  { month: 'Sep', revenue: 23700, bookings: 79 },
  { month: 'Oct', revenue: 27500, bookings: 92 },
];

const gamePopularityData = [
  { name: 'Mystery Manor', bookings: 245, fill: '#4f46e5' },
  { name: 'Space Odyssey', bookings: 189, fill: '#7c3aed' },
  { name: 'Zombie Outbreak', bookings: 178, fill: '#10b981' },
  { name: 'Treasure Hunt', bookings: 156, fill: '#f59e0b' },
  { name: 'Prison Break', bookings: 134, fill: '#ef4444' },
  { name: 'Wizards Quest', bookings: 98, fill: '#06b6d4' },
];

const occupancyData = [
  { day: 'Mon', rate: 68 },
  { day: 'Tue', rate: 52 },
  { day: 'Wed', rate: 58 },
  { day: 'Thu', rate: 72 },
  { day: 'Fri', rate: 88 },
  { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 82 },
];

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
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>(['revenue', 'games', 'occupancy', 'summary']);
  const [dateRange, setDateRange] = useState('last-30');

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dateLabel =
        dateRange === 'last-7' ? 'Last 7 days' :
        dateRange === 'last-30' ? 'Last 30 days' :
        dateRange === 'last-90' ? 'Last 90 days' :
        dateRange === 'year' ? 'This year' : 'All time';

      const summary = (() => {
        const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
        const totalBookings = revenueData.reduce((sum, r) => sum + r.bookings, 0);
        const avgValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const topGame = gamePopularityData.reduce((prev, cur) => cur.bookings > prev.bookings ? cur : prev, gamePopularityData[0]);
        const avgOccupancy = Math.round(occupancyData.reduce((sum, o) => sum + o.rate, 0) / occupancyData.length);
        return { totalRevenue, totalBookings, avgValue, topGame: topGame.name, avgOccupancy };
      })();

      if (exportFormat === 'csv') {
        const sections: string[] = [];

        if (selectedReports.includes('summary')) {
          sections.push('Section: Summary Statistics');
          sections.push('Metric,Value');
          sections.push(`Total Revenue,$${summary.totalRevenue}`);
          sections.push(`Total Bookings,${summary.totalBookings}`);
          sections.push(`Average Booking Value,$${summary.avgValue.toFixed(2)}`);
          sections.push(`Top Game,${summary.topGame}`);
          sections.push(`Average Occupancy,${summary.avgOccupancy}%`);
        }

        if (selectedReports.includes('revenue')) {
          sections.push('', 'Section: Revenue & Bookings Trend');
          sections.push('Month,Revenue,Bookings');
          revenueData.forEach(r => sections.push(`${r.month},${r.revenue},${r.bookings}`));
        }

        if (selectedReports.includes('games')) {
          sections.push('', 'Section: Game Popularity');
          sections.push('Game,Bookings');
          gamePopularityData.forEach(g => sections.push(`${g.name},${g.bookings}`));
        }

        if (selectedReports.includes('occupancy')) {
          sections.push('', 'Section: Weekly Occupancy');
          sections.push('Day,Rate (%)');
          occupancyData.forEach(o => sections.push(`${o.day},${o.rate}`));
        }

        const csvContent = sections.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${new Date().toISOString().slice(0,10)}.csv`;
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
          addLine(`Top Game: ${summary.topGame}`);
          addLine(`Average Occupancy: ${summary.avgOccupancy}%`);
          y += 4;
        }

        if (selectedReports.includes('revenue')) {
          addHeading('Revenue & Bookings Trend');
          revenueData.forEach(r => addLine(`${r.month}: $${r.revenue} revenue, ${r.bookings} bookings`));
          y += 4;
        }

        if (selectedReports.includes('games')) {
          addHeading('Game Popularity');
          gamePopularityData.forEach(g => addLine(`${g.name}: ${g.bookings} bookings`));
          y += 4;
        }

        if (selectedReports.includes('occupancy')) {
          addHeading('Weekly Occupancy');
          occupancyData.forEach(o => addLine(`${o.day}: ${o.rate}%`));
        }

        doc.save(`reports_${new Date().toISOString().slice(0,10)}.pdf`);
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Revenue</p>
                <p className={`text-2xl mt-2 ${textClass}`}>$212,400</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <DollarSign className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span>+15.3% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Bookings</p>
                <p className={`text-2xl mt-2 ${textClass}`}>818</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <Users className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span>+12.7% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Avg. Occupancy</p>
                <p className={`text-2xl mt-2 ${textClass}`}>73.6%</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Percent className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              <TrendingDown className="w-4 h-4 flex-shrink-0" />
              <span>-2.1% from last period</span>
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
              Last 10 months
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="min-w-[500px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
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
        </CardContent>
      </Card>

      {/* Game Popularity and Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Popularity */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              <CardTitle className={textClass}>Game Popularity</CardTitle>
            </div>
            <CardDescription className={`${textMutedClass} mt-1`}>
              Bookings by game
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={gamePopularityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  dataKey="bookings"
                >
                  {gamePopularityData.map((entry, index) => (
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
            <div className="mt-4 grid grid-cols-2 gap-3">
              {gamePopularityData.map((game) => (
                <div key={game.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: game.fill }} 
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm truncate block ${textMutedClass}`}>
                      {game.name}
                    </span>
                    <span className={`text-xs ${textMutedClass}`}>
                      {game.bookings} bookings
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={occupancyData}>
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
          </CardContent>
        </Card>
      </div>

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
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    exportFormat === 'csv' 
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
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    exportFormat === 'pdf' 
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
