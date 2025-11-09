'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { useCustomers } from '../../hooks/useCustomers';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Crown, Users, Sparkles, UserX, Gamepad2, Building2, TrendingUp, Clock } from 'lucide-react';

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
  const { customers, loading } = useCustomers();
  const [segmentData, setSegmentData] = useState<any[]>([]);

  useEffect(() => {
    if (customers.length > 0) {
      calculateSegments();
    }
  }, [customers]);

  const calculateSegments = () => {
    const total = customers.length;
    
    // Lifecycle stages
    const newCustomers = customers.filter(c => c.metadata?.lifecycle_stage === 'new').length;
    const activeCustomers = customers.filter(c => c.metadata?.lifecycle_stage === 'active').length;
    const atRiskCustomers = customers.filter(c => c.metadata?.lifecycle_stage === 'at-risk').length;
    const churnedCustomers = customers.filter(c => c.metadata?.lifecycle_stage === 'churned').length;
    
    // Spending tiers
    const vipCustomers = customers.filter(c => c.metadata?.spending_tier === 'vip').length;
    const highSpenders = customers.filter(c => c.metadata?.spending_tier === 'high').length;
    
    // Frequency tiers
    const frequentCustomers = customers.filter(c => c.metadata?.frequency_tier === 'frequent').length;
    const regularCustomers = customers.filter(c => c.metadata?.frequency_tier === 'regular').length;
    
    // Game-based segments (customers who have played specific games)
    const customersWithGames = customers.filter(c => c.total_bookings > 0).length;
    
    // Venue-based segments (customers who have visited venues)
    const customersWithVenues = customers.filter(c => c.total_bookings > 0).length;
    
    const segments = [
      // Lifecycle Stages
      {
        name: 'New Customers',
        count: newCustomers,
        percentage: total > 0 ? Math.round((newCustomers / total) * 100) : 0,
        color: '#10b981',
        icon: <Sparkles className="w-5 h-5" style={{ color: '#10b981' }} />,
        description: 'Recently joined, less than 30 days'
      },
      {
        name: 'Active Customers',
        count: activeCustomers,
        percentage: total > 0 ? Math.round((activeCustomers / total) * 100) : 0,
        color: '#3b82f6',
        icon: <Users className="w-5 h-5" style={{ color: '#3b82f6' }} />,
        description: 'Booked within last 30 days'
      },
      {
        name: 'At-Risk Customers',
        count: atRiskCustomers,
        percentage: total > 0 ? Math.round((atRiskCustomers / total) * 100) : 0,
        color: '#f59e0b',
        icon: <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />,
        description: 'No bookings in 30-90 days'
      },
      {
        name: 'Churned Customers',
        count: churnedCustomers,
        percentage: total > 0 ? Math.round((churnedCustomers / total) * 100) : 0,
        color: '#6b7280',
        icon: <UserX className="w-5 h-5" style={{ color: '#6b7280' }} />,
        description: 'No bookings in 90+ days'
      },
      // Spending Tiers
      {
        name: 'VIP Customers',
        count: vipCustomers,
        percentage: total > 0 ? Math.round((vipCustomers / total) * 100) : 0,
        color: '#9333ea',
        icon: <Crown className="w-5 h-5" style={{ color: '#9333ea' }} />,
        description: '$1,000+ lifetime value'
      },
      {
        name: 'High Spenders',
        count: highSpenders,
        percentage: total > 0 ? Math.round((highSpenders / total) * 100) : 0,
        color: '#8b5cf6',
        icon: <TrendingUp className="w-5 h-5" style={{ color: '#8b5cf6' }} />,
        description: '$500-$999 lifetime value'
      },
      // Activity-based
      {
        name: 'Game Players',
        count: customersWithGames,
        percentage: total > 0 ? Math.round((customersWithGames / total) * 100) : 0,
        color: '#ec4899',
        icon: <Gamepad2 className="w-5 h-5" style={{ color: '#ec4899' }} />,
        description: 'Customers who have played games'
      },
      {
        name: 'Venue Visitors',
        count: customersWithVenues,
        percentage: total > 0 ? Math.round((customersWithVenues / total) * 100) : 0,
        color: '#14b8a6',
        icon: <Building2 className="w-5 h-5" style={{ color: '#14b8a6' }} />,
        description: 'Customers who have visited venues'
      }
    ];
    
    setSegmentData(segments);
  };

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`${bgClass} ${borderClass} border rounded-lg p-12 text-center`}>
        <p className={subtextClass}>Loading segments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${bgClass} ${borderClass} border rounded-lg p-6`}>
        <h3 className={`text-lg ${textClass} mb-2`}>About Customer Segments</h3>
        <p className={`${subtextClass}`}>
          Customer segments help you target marketing campaigns and understand customer behavior. 
          Segments are automatically updated based on booking history, spending patterns, games played, and venues visited.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {customers.length} Total Customers
          </Badge>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Real-time Data
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segmentData.map((segment) => (
          <SegmentCard key={segment.name} {...segment} />
        ))}
      </div>

      {/* Marketing Actions */}
      <div className={`${bgClass} ${borderClass} border rounded-lg p-6`}>
        <h3 className={`text-lg ${textClass} mb-4`}>Segment Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {segmentData.find(s => s.name === 'VIP Customers') && (
            <button 
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <p className={textClass}>Email VIP Customers</p>
              <p className={`text-sm ${subtextClass}`}>
                Send exclusive offers to {segmentData.find(s => s.name === 'VIP Customers')?.count || 0} VIPs
              </p>
            </button>
          )}

          {segmentData.find(s => s.name === 'Churned Customers') && (
            <button 
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <p className={textClass}>Re-engage Churned</p>
              <p className={`text-sm ${subtextClass}`}>
                Win back {segmentData.find(s => s.name === 'Churned Customers')?.count || 0} churned customers
              </p>
            </button>
          )}

          {segmentData.find(s => s.name === 'New Customers') && (
            <button 
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <p className={textClass}>Welcome New Customers</p>
              <p className={`text-sm ${subtextClass}`}>
                Send onboarding to {segmentData.find(s => s.name === 'New Customers')?.count || 0} new customers
              </p>
            </button>
          )}

          {segmentData.find(s => s.name === 'At-Risk Customers') && (
            <button 
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <p className={textClass}>Prevent Churn</p>
              <p className={`text-sm ${subtextClass}`}>
                Re-engage {segmentData.find(s => s.name === 'At-Risk Customers')?.count || 0} at-risk customers
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
