/**
 * Notifications Page
 * Full page view of all notifications with filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../components/layout/ThemeContext';
import { useNotifications } from '../lib/notifications/NotificationContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  X,
  AlertTriangle,
  UserPlus,
  MessageSquare,
  Info,
  Shield,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import type { NotificationType } from '../types/notifications';

export default function Notifications() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    playNotificationSound,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Color classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderColor = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    return filtered;
  }, [notifications, activeTab, searchQuery, filterType, filterPriority]);

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
    
    switch (type) {
      case 'booking':
        return <Calendar className={`w-5 h-5 ${iconClass}`} />;
      case 'payment':
        return <CreditCard className={`w-5 h-5 ${iconClass}`} />;
      case 'cancellation':
        return <X className={`w-5 h-5 ${iconClass}`} />;
      case 'customer':
        return <UserPlus className={`w-5 h-5 ${iconClass}`} />;
      case 'alert':
        return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />;
      case 'message':
        return <MessageSquare className={`w-5 h-5 ${iconClass}`} />;
      case 'staff':
        return <Shield className={`w-5 h-5 ${iconClass}`} />;
      case 'system':
        return <Info className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/40 dark:text-red-400">
            Urgent
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/40 dark:text-orange-400">
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/40 dark:text-blue-400">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/40 dark:text-gray-400">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get type badge
  const getTypeBadge = (type: NotificationType) => {
    const typeLabels: Record<NotificationType, string> = {
      booking: 'Booking',
      cancellation: 'Cancellation',
      payment: 'Payment',
      refund: 'Refund',
      customer: 'Customer',
      staff: 'Staff',
      system: 'System',
      alert: 'Alert',
      message: 'Message',
    };

    return (
      <Badge variant="outline" className={`${isDark ? 'border-[#2a2a2a] text-[#a3a3a3]' : 'border-gray-300 text-gray-600'}`}>
        {typeLabels[type]}
      </Badge>
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relative = '';
    if (diffMins < 1) relative = 'Just now';
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays < 7) relative = `${diffDays}d ago`;
    else relative = date.toLocaleDateString();

    const full = date.toLocaleString();

    return { relative, full };
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    // Note: In a future update, this could navigate to the related page
    // For now, we just mark the notification as read
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated with all your booking activities"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => playNotificationSound()}
              className={`gap-2 ${isDark ? 'border-[#1e1e1e] bg-transparent hover:bg-[#161616]' : ''}`}
            >
              <Volume2 className="w-4 h-4" />
              Test Sound
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="gap-2"
                style={{ backgroundColor: '#4f46e5' }}
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${cardBg} border ${borderColor} shadow-sm p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Total</p>
                <p className={`text-2xl ${textPrimary}`}>{notifications.length}</p>
              </div>
              <Bell className={`w-8 h-8 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
            </div>
          </Card>

          <Card className={`${cardBg} border ${borderColor} shadow-sm p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Unread</p>
                <p className={`text-2xl ${textPrimary}`}>{unreadCount}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center">
                <span className="text-white">{unreadCount}</span>
              </div>
            </div>
          </Card>

          <Card className={`${cardBg} border ${borderColor} shadow-sm p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Today</p>
                <p className={`text-2xl ${textPrimary}`}>
                  {notifications.filter(n => {
                    const notifDate = new Date(n.timestamp);
                    const today = new Date();
                    return notifDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <Calendar className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </Card>

          <Card className={`${cardBg} border ${borderColor} shadow-sm p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Urgent</p>
                <p className={`text-2xl ${textPrimary}`}>
                  {notifications.filter(n => n.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card className={`${cardBg} border ${borderColor} shadow-sm`}>
          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                  <SelectItem value="all" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>All Types</SelectItem>
                  <SelectItem value="booking" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Bookings</SelectItem>
                  <SelectItem value="payment" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Payments</SelectItem>
                  <SelectItem value="cancellation" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Cancellations</SelectItem>
                  <SelectItem value="alert" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Alerts</SelectItem>
                  <SelectItem value="system" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>System</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                  <SelectItem value="all" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>All Priorities</SelectItem>
                  <SelectItem value="urgent" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Urgent</SelectItem>
                  <SelectItem value="high" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>High</SelectItem>
                  <SelectItem value="medium" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Medium</SelectItem>
                  <SelectItem value="low" className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
              <TabsList className={isDark ? 'bg-[#0a0a0a] border border-[#2a2a2a]' : 'bg-gray-100'}>
                <TabsTrigger value="all" className="gap-2">
                  <Bell className="w-4 h-4" />
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-2">
                  <div className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#4f46e5] rounded-full" />
                    )}
                  </div>
                  Unread ({unreadCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Bell className={`w-16 h-16 mb-4 ${isDark ? 'text-[#2a2a2a]' : 'text-gray-300'}`} />
                    <p className={`text-lg mb-2 ${textPrimary}`}>No notifications found</p>
                    <p className={textSecondary}>
                      {activeTab === 'unread' ? "You're all caught up!" : 'Try adjusting your filters'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => {
                      const timestamp = formatTimestamp(notification.timestamp);
                      
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            !notification.read
                              ? isDark
                                ? 'bg-[#0a0a0a] border-[#2a2a2a] hover:bg-[#1a1a1a]'
                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                              : isDark
                              ? 'bg-transparent border-[#1e1e1e] hover:bg-[#0a0a0a]'
                              : 'bg-transparent border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`${!notification.read ? textPrimary : textSecondary}`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                                    )}
                                  </div>
                                  <p className={`text-sm ${textSecondary}`}>
                                    {notification.message}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {getPriorityBadge(notification.priority)}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className={`h-8 w-8 p-0 ${isDark ? 'hover:bg-[#1e1e1e] text-[#737373] hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getTypeBadge(notification.type)}
                                  <span className={`text-xs ${textSecondary}`} title={timestamp.full}>
                                    {timestamp.relative}
                                  </span>
                                </div>

                                {notification.actionLabel && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 gap-1 text-xs ${isDark ? 'text-[#4f46e5] hover:bg-[#1a1a1a]' : 'text-blue-600 hover:bg-blue-50'}`}
                                  >
                                    {notification.actionLabel}
                                    <ChevronRight className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </>
  );
}
