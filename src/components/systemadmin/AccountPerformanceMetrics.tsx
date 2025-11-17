import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShoppingCart, TrendingUp, MousePointer, CreditCard, Package, DollarSign } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';
import { KPICard } from '../dashboard/KPICard';

interface AccountPerformanceMetricsProps {
  account: any;
  metrics?: any;
}

export const AccountPerformanceMetrics = ({
  account,
  metrics,
}: AccountPerformanceMetricsProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  // Account performance data
  const performanceData = {
    totalBookings: metrics?.total_bookings || 245,
    totalSales: metrics?.totalRevenue || 18750,
    totalClicks: metrics?.totalClicks || 3240,
    addToCart: metrics?.addToCart || 892,
    checkoutConversions: metrics?.checkoutConversions || 215,
    conversionRate: ((215 / 892) * 100).toFixed(1),
  };

  return (
    <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-medium ${textClass}`}>Account Performance Metrics</h2>
          <p className={`text-sm mt-1 ${mutedTextClass}`}>
            Performance analytics for {account.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="Total Bookings"
          value={performanceData.totalBookings}
          icon={Package}
          trend={{ value: 18, isPositive: true }}
          period="this month"
        />
        <KPICard
          title="Total Sales"
          value={`$${performanceData.totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 22, isPositive: true }}
          period="this month"
        />
        <KPICard
          title="Clicks"
          value={performanceData.totalClicks.toLocaleString()}
          icon={MousePointer}
          trend={{ value: 15, isPositive: true }}
          period="this month"
        />
        <KPICard
          title="Add to Cart"
          value={performanceData.addToCart}
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
          period="this month"
        />
        <KPICard
          title="Checkouts"
          value={performanceData.checkoutConversions}
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
          period="this month"
        />
        <KPICard
          title="Conversion Rate"
          value={`${performanceData.conversionRate}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          period="this month"
        />
      </div>
    </div>
  );
};
