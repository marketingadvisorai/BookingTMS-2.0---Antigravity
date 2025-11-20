import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { InventoryStats as StatsType } from '../types';
import { Gamepad2, Zap, Users, DollarSign } from 'lucide-react';

interface InventoryStatsProps {
  stats: StatsType | null;
  isLoading: boolean;
}

export function InventoryStats({ stats, isLoading }: InventoryStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Total Games",
      value: stats.totalGames,
      icon: Gamepad2,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10"
    },
    {
      label: "Active Games",
      value: stats.activeGames,
      icon: Zap,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      label: "Total Capacity",
      value: `${stats.totalCapacity} people`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      label: "Avg. Price",
      value: `$${stats.avgPrice}/person`,
      icon: DollarSign,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item, index) => (
        <Card key={index} className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-[#737373] mb-1 md:mb-2 font-medium">{item.label}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            </div>
            <div className={`p-2 md:p-3 rounded-full ${item.bg}`}>
              <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
