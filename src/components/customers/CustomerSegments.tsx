'use client';

import { useTheme } from '../layout/ThemeContext';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Crown, Users, Sparkles, UserX } from 'lucide-react';

interface SegmentCardProps {
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

function SegmentCard({ name, count, percentage, color, icon, description }: SegmentCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <div className={`${bgClass} ${borderClass} border rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
          <div>
            <h3 className={textClass}>{name}</h3>
            <p className={`text-sm ${subtextClass}`}>{description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-2xl ${textClass}`}>{count}</span>
          <Badge className={`${color.replace('#', 'bg-')} text-white`}>
            {percentage}%
          </Badge>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
}

export function CustomerSegments() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const segments = [
    {
      name: 'VIP Customers',
      count: 342,
      percentage: 12,
      color: '#9333ea',
      icon: <Crown className="w-5 h-5" style={{ color: '#9333ea' }} />,
      description: '10+ bookings or $1,000+ spent'
    },
    {
      name: 'Regular Customers',
      count: 1243,
      percentage: 44,
      color: '#3b82f6',
      icon: <Users className="w-5 h-5" style={{ color: '#3b82f6' }} />,
      description: '3-9 bookings'
    },
    {
      name: 'New Customers',
      count: 891,
      percentage: 31,
      color: '#10b981',
      icon: <Sparkles className="w-5 h-5" style={{ color: '#10b981' }} />,
      description: '1-2 bookings'
    },
    {
      name: 'Inactive',
      count: 371,
      percentage: 13,
      color: '#6b7280',
      icon: <UserX className="w-5 h-5" style={{ color: '#6b7280' }} />,
      description: 'No bookings in 6+ months'
    }
  ];

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className={`${bgClass} ${borderClass} border rounded-lg p-6`}>
        <h3 className={`text-lg ${textClass} mb-2`}>About Customer Segments</h3>
        <p className={`${subtextClass}`}>
          Customer segments help you target marketing campaigns and understand customer behavior. 
          Segments are automatically updated based on booking history and spending patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((segment) => (
          <SegmentCard key={segment.name} {...segment} />
        ))}
      </div>

      {/* Marketing Actions */}
      <div className={`${bgClass} ${borderClass} border rounded-lg p-6`}>
        <h3 className={`text-lg ${textClass} mb-4`}>Segment Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button 
            className="px-4 py-3 text-left rounded-lg border transition-colors"
            style={{ 
              backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
            <p className={textClass}>Email VIP Customers</p>
            <p className={`text-sm ${subtextClass}`}>Send exclusive offers to 342 VIPs</p>
          </button>

          <button 
            className="px-4 py-3 text-left rounded-lg border transition-colors"
            style={{ 
              backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
            <p className={textClass}>Re-engage Inactive</p>
            <p className={`text-sm ${subtextClass}`}>Win back 371 inactive customers</p>
          </button>

          <button 
            className="px-4 py-3 text-left rounded-lg border transition-colors"
            style={{ 
              backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
            <p className={textClass}>Welcome New Customers</p>
            <p className={`text-sm ${subtextClass}`}>Send onboarding to 891 new customers</p>
          </button>

          <button 
            className="px-4 py-3 text-left rounded-lg border transition-colors"
            style={{ 
              backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
            <p className={textClass}>Loyalty Program Invite</p>
            <p className={`text-sm ${subtextClass}`}>Invite regulars to join loyalty program</p>
          </button>
        </div>
      </div>
    </div>
  );
}
