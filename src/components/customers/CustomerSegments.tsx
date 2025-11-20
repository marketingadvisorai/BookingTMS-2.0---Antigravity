'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { useCustomers } from '../../hooks/useCustomers';
import { Users, Crown, Sparkles, UserX, TrendingUp, Clock, Gamepad2, Building2, RefreshCw, Mail, Gift, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

interface SegmentCardProps {
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  onClick?: () => void;
}

function SegmentCard({ name, count, percentage, color, icon, description, onClick }: SegmentCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <div 
      onClick={onClick}
      className={`${bgClass} ${borderClass} border rounded-lg p-6 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      }`}
    >
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
      {onClick && count > 0 && (
        <div className={`mt-3 text-xs ${subtextClass} text-center`}>
          Click to view customers
        </div>
      )}
    </div>
  );
}

export function CustomerSegments() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { customers, loading, getGameSegments, getVenueSegments, refreshCustomers } = useCustomers();
  const [segmentData, setSegmentData] = useState<any[]>([]);
  const [gameSegments, setGameSegments] = useState<any[]>([]);
  const [venueSegments, setVenueSegments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'games' | 'venues'>('lifecycle');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (customers.length > 0) {
      calculateSegments();
      fetchGameAndVenueSegments();
    }
  }, [customers]);

  const fetchGameAndVenueSegments = async () => {
    // Fetch game segments (no org_id needed - single tenant)
    const games = await getGameSegments();
    setGameSegments(games.map(g => ({
      name: g.game_name,
      count: g.customer_count,
      percentage: customers.length > 0 ? Math.round((g.customer_count / customers.length) * 100) : 0,
      color: '#ec4899',
      icon: <Gamepad2 className="w-5 h-5" style={{ color: '#ec4899' }} />,
      description: `${g.total_bookings} bookings • $${Number(g.total_revenue).toFixed(0)} revenue`,
      gameId: g.game_id,
      imageUrl: g.game_image_url
    })));

    // Fetch venue segments (no org_id needed - single tenant)
    const venues = await getVenueSegments();
    setVenueSegments(venues.map(v => ({
      name: v.venue_name,
      count: v.customer_count,
      percentage: customers.length > 0 ? Math.round((v.customer_count / customers.length) * 100) : 0,
      color: '#14b8a6',
      icon: <Building2 className="w-5 h-5" style={{ color: '#14b8a6' }} />,
      description: `${v.total_bookings} bookings • $${Number(v.total_revenue).toFixed(0)} revenue`,
      venueId: v.venue_id
    })));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCustomers();
    toast.success('Segments refreshed successfully');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleMarketingAction = (action: string, count: number) => {
    if (count === 0) {
      toast.error(`No customers in this segment`);
      return;
    }
    toast.success(`Marketing action: ${action} for ${count} customers`);
    // In production, this would trigger email campaigns, etc.
  };

  const handleSegmentClick = (segmentName: string, count: number) => {
    if (count === 0) {
      toast.info(`No customers in ${segmentName} segment yet`);
      return;
    }
    
    // Get customers for this segment
    const segmentCustomers = customers.filter(c => {
      switch(segmentName) {
        case 'New Customers':
          return c.metadata?.is_new === true;
        case 'Active Customers':
          return c.metadata?.lifecycle_stage === 'active';
        case 'At-Risk Customers':
          return c.metadata?.lifecycle_stage === 'at-risk';
        case 'Churned Customers':
          return c.metadata?.lifecycle_stage === 'churned';
        case 'VIP Customers':
          return c.metadata?.spending_tier === 'vip';
        case 'High Spenders':
          return c.metadata?.spending_tier === 'high';
        case 'Game Players':
          return c.total_bookings > 0;
        case 'Venue Visitors':
          return c.total_bookings > 0;
        default:
          return false;
      }
    });

    const customerNames = segmentCustomers
      .map(c => `${c.first_name} ${c.last_name}`)
      .slice(0, 5)
      .join(', ');
    
    const moreCount = segmentCustomers.length > 5 ? ` and ${segmentCustomers.length - 5} more` : '';
    
    toast.success(
      `${segmentName}: ${customerNames}${moreCount}`,
      { duration: 5000 }
    );
  };

  const calculateSegments = () => {
    const total = customers.length;
    
    // Lifecycle stages
    // New customers: created within 30 days (uses is_new flag)
    const newCustomers = customers.filter(c => c.metadata?.is_new === true).length;
    // Active customers: booked within 30 days (uses lifecycle_stage)
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
        <div className="flex items-start justify-between mb-2">
          <h3 className={`text-lg ${textClass}`}>About Customer Segments</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isDark ? 'bg-[#1e1e1e] hover:bg-[#2a2a2a]' : 'bg-gray-100 hover:bg-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className={`text-sm ${textClass}`}>Refresh</span>
          </button>
        </div>
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
          <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
            {gameSegments.length} Games
          </Badge>
          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
            {venueSegments.length} Venues
          </Badge>
        </div>
      </div>

      {/* Segment Type Tabs */}
      <div className={`${bgClass} ${borderClass} border rounded-lg p-4`}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'lifecycle'
                ? 'bg-blue-500 text-white'
                : isDark ? 'bg-[#1e1e1e] text-[#a3a3a3] hover:bg-[#2a2a2a]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Lifecycle & Spending ({segmentData.length})
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'games'
                ? 'bg-pink-500 text-white'
                : isDark ? 'bg-[#1e1e1e] text-[#a3a3a3] hover:bg-[#2a2a2a]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4 inline mr-1" />
            Game Audiences ({gameSegments.length})
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'venues'
                ? 'bg-teal-500 text-white'
                : isDark ? 'bg-[#1e1e1e] text-[#a3a3a3] hover:bg-[#2a2a2a]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1" />
            Venue Audiences ({venueSegments.length})
          </button>
        </div>
      </div>

      {/* Lifecycle & Spending Segments */}
      {activeTab === 'lifecycle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segmentData.map((segment) => (
            <SegmentCard 
              key={segment.name} 
              {...segment} 
              onClick={() => handleSegmentClick(segment.name, segment.count)}
            />
          ))}
        </div>
      )}

      {/* Game-Based Segments */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameSegments.length > 0 ? (
            gameSegments.map((segment) => (
              <SegmentCard 
                key={segment.gameId || segment.name} 
                {...segment}
                onClick={() => toast.info(`Game: ${segment.name} - ${segment.count} customers have played this game`)}
              />
            ))
          ) : (
            <div className={`${bgClass} ${borderClass} border rounded-lg p-8 col-span-full text-center`}>
              <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className={textClass}>No game segments yet</p>
              <p className={`text-sm ${subtextClass}`}>Game segments will appear once customers start booking games</p>
            </div>
          )}
        </div>
      )}

      {/* Venue-Based Segments */}
      {activeTab === 'venues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venueSegments.length > 0 ? (
            venueSegments.map((segment) => (
              <SegmentCard 
                key={segment.venueId || segment.name} 
                {...segment}
                onClick={() => toast.info(`Venue: ${segment.name} - ${segment.count} customers have visited this venue`)}
              />
            ))
          ) : (
            <div className={`${bgClass} ${borderClass} border rounded-lg p-8 col-span-full text-center`}>
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className={textClass}>No venue segments yet</p>
              <p className={`text-sm ${subtextClass}`}>Venue segments will appear once customers start visiting venues</p>
            </div>
          )}
        </div>
      )}

      {/* Marketing Actions */}
      <div className={`${bgClass} ${borderClass} border rounded-lg p-6`}>
        <h3 className={`text-lg ${textClass} mb-4`}>Segment Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {segmentData.find(s => s.name === 'VIP Customers') && (
            <button 
              onClick={() => handleMarketingAction('Email VIP Customers', segmentData.find(s => s.name === 'VIP Customers')?.count || 0)}
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80 hover:shadow-md"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <p className={textClass}>Email VIP Customers</p>
              </div>
              <p className={`text-sm ${subtextClass} mt-1`}>
                Send exclusive offers to {segmentData.find(s => s.name === 'VIP Customers')?.count || 0} VIPs
              </p>
            </button>
          )}

          {segmentData.find(s => s.name === 'Churned Customers') && (
            <button 
              onClick={() => handleMarketingAction('Re-engage Churned Customers', segmentData.find(s => s.name === 'Churned Customers')?.count || 0)}
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80 hover:shadow-md"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <p className={textClass}>Re-engage Churned</p>
              </div>
              <p className={`text-sm ${subtextClass} mt-1`}>
                Win back {segmentData.find(s => s.name === 'Churned Customers')?.count || 0} churned customers
              </p>
            </button>
          )}

          {segmentData.find(s => s.name === 'New Customers') && (
            <button 
              onClick={() => handleMarketingAction('Welcome New Customers', segmentData.find(s => s.name === 'New Customers')?.count || 0)}
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80 hover:shadow-md"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <p className={textClass}>Welcome New Customers</p>
              </div>
              <p className={`text-sm ${subtextClass} mt-1`}>
                Send onboarding to {segmentData.find(s => s.name === 'New Customers')?.count || 0} new customers
              </p>
            </button>
          )}

          {segmentData.find(s => s.name === 'At-Risk Customers') && (
            <button 
              onClick={() => handleMarketingAction('Prevent Churn', segmentData.find(s => s.name === 'At-Risk Customers')?.count || 0)}
              className="px-4 py-3 text-left rounded-lg border transition-colors hover:bg-opacity-80 hover:shadow-md"
              style={{ 
                backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
                borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
              }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <p className={textClass}>Prevent Churn</p>
              </div>
              <p className={`text-sm ${subtextClass} mt-1`}>
                Re-engage {segmentData.find(s => s.name === 'At-Risk Customers')?.count || 0} at-risk customers
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
