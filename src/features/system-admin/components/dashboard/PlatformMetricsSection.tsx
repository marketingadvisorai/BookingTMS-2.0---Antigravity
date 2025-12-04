/**
 * Platform Metrics Section
 * Displays KPI cards for system admin dashboard
 * @module system-admin/components/dashboard/PlatformMetricsSection
 */

import { Building2, DollarSign, TrendingUp, Users, Gamepad2, Calendar, CreditCard } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { Skeleton } from '@/components/ui/skeleton';

interface PlatformMetrics {
  totalOwners: number;
  activeSubscriptions: number;
  activeVenues: number;
  totalLocations: number;
  totalGames: number;
  totalBookings: number;
  mrr: number;
}

interface PlatformMetricsSectionProps {
  metrics: PlatformMetrics;
  isLoading?: boolean;
  selectedAccountName?: string | null;
}

export function PlatformMetricsSection({
  metrics,
  isLoading = false,
  selectedAccountName,
}: PlatformMetricsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: selectedAccountName ? 'Organizations' : 'Total Organizations',
      value: metrics.totalOwners.toLocaleString(),
      change: 12,
      icon: Building2,
      iconColor: 'bg-blue-500',
    },
    {
      title: 'Active Subscriptions',
      value: metrics.activeSubscriptions.toLocaleString(),
      change: 8,
      icon: Users,
      iconColor: 'bg-green-500',
    },
    {
      title: 'Active Venues',
      value: metrics.activeVenues.toLocaleString(),
      change: 15,
      icon: Building2,
      iconColor: 'bg-purple-500',
    },
    {
      title: 'Total Locations',
      value: metrics.totalLocations.toLocaleString(),
      change: 5,
      icon: TrendingUp,
      iconColor: 'bg-orange-500',
    },
    {
      title: 'Total Games',
      value: metrics.totalGames.toLocaleString(),
      change: 10,
      icon: Gamepad2,
      iconColor: 'bg-pink-500',
    },
    {
      title: 'Total Bookings',
      value: metrics.totalBookings.toLocaleString(),
      change: 20,
      icon: Calendar,
      iconColor: 'bg-cyan-500',
    },
    {
      title: 'MRR',
      value: `$${metrics.mrr.toLocaleString()}`,
      change: 18,
      icon: CreditCard,
      iconColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
      {kpiCards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  );
}

export default PlatformMetricsSection;
