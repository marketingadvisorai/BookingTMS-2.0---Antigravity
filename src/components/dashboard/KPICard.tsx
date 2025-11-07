import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function KPICard({ title, value, change, icon: Icon, iconColor = 'bg-blue-600' }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="group relative overflow-hidden border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] transition-all hover:-translate-y-0.5">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5]/0 via-transparent to-purple-500/0 dark:from-[#4f46e5]/5 dark:via-transparent dark:to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-[#737373] mb-2 truncate uppercase tracking-wide">{title}</p>
            <p className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-3 truncate">{value}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-[#737373]">vs last month</span>
            </div>
          </div>
          <div className={`${iconColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
