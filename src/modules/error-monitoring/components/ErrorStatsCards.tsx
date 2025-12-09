/**
 * ErrorStatsCards - Display error statistics in cards
 * @module error-monitoring/components/ErrorStatsCards
 */

import React from 'react';
import {
  AlertTriangle,
  Bug,
  CheckCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ErrorStats } from '../types';

interface ErrorStatsCardsProps {
  stats: ErrorStats | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ErrorStatsCards({ stats, loading }: ErrorStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-border/40 animate-pulse">
            <CardContent className="p-4 h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Errors"
        value={stats?.totalErrors || 0}
        icon={<Bug className="h-5 w-5 text-orange-500" />}
        color="text-orange-500"
        trend="Last 24 hours"
      />
      <StatCard
        title="Critical"
        value={stats?.criticalErrors || 0}
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        color="text-red-500"
        trend="Needs attention"
      />
      <StatCard
        title="New"
        value={stats?.newErrors || 0}
        icon={<Clock className="h-5 w-5 text-blue-500" />}
        color="text-blue-500"
        trend="Unreviewed"
      />
      <StatCard
        title="Resolved"
        value={stats?.resolvedErrors || 0}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        color="text-green-500"
        trend="Fixed today"
      />
      <StatCard
        title="Error Rate"
        value={`${stats?.errorRatePerHour?.toFixed(1) || 0}/hr`}
        icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
        color="text-purple-500"
        trend="Per hour"
      />
    </div>
  );
}
