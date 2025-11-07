/**
 * Notification Center Component
 * Bell icon dropdown showing recent notifications
 */

'use client';

import React, { useState } from 'react';
import { useNotifications } from '../../lib/notifications/NotificationContext';
import { useTheme } from '../layout/ThemeContext';
import {
  Bell,
  Check,
  X,
  Calendar,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Settings as SettingsIcon,
  MessageSquare,
  Info,
  ChevronRight,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import type { NotificationType } from '../../types/notifications';

interface NotificationCenterProps {
  onNavigate?: (page: string) => void;
}

export function NotificationCenter({ onNavigate = () => {} }: NotificationCenterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Get recent notifications (last 10)
  const recentNotifications = notifications.slice(0, 10);

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
    
    switch (type) {
      case 'booking':
        return <Calendar className={`w-4 h-4 ${iconClass}`} />;
      case 'payment':
        return <CreditCard className={`w-4 h-4 ${iconClass}`} />;
      case 'cancellation':
        return <X className={`w-4 h-4 ${iconClass}`} />;
      case 'customer':
        return <UserPlus className={`w-4 h-4 ${iconClass}`} />;
      case 'alert':
        return <AlertTriangle className={`w-4 h-4 ${iconClass}`} />;
      case 'message':
        return <MessageSquare className={`w-4 h-4 ${iconClass}`} />;
      case 'system':
        return <Info className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <Bell className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return isDark ? 'bg-red-500/20 border-red-500/40' : 'bg-red-50 border-red-200';
      case 'high':
        return isDark ? 'bg-orange-500/20 border-orange-500/40' : 'bg-orange-50 border-orange-200';
      case 'medium':
        return isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-50 border-blue-200';
      case 'low':
        return isDark ? 'bg-gray-500/20 border-gray-500/40' : 'bg-gray-50 border-gray-200';
      default:
        return isDark ? 'bg-gray-500/20 border-gray-500/40' : 'bg-gray-50 border-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl && onNavigate) {
      // Map URL paths to page names
      const pageMap: Record<string, string> = {
        '/bookings': 'bookings',
        '/payment-history': 'payment-history',
        '/customers': 'customers',
        '/games': 'games',
        '/staff': 'staff',
        '/reports': 'reports',
      };
      
      const pageName = pageMap[notification.actionUrl] || 'dashboard';
      onNavigate(pageName);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-100'}`}
        >
          <Bell className={`w-5 h-5 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`} />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#4f46e5] text-white text-xs border-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={`w-screen sm:w-[420px] max-w-[420px] p-0 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'} sm:mr-0`}
      >
        {/* Header */}
        <div className={`p-3 sm:p-4 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Badge className="bg-[#4f46e5] text-white text-xs px-2 py-0.5 border-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className={`h-8 text-xs gap-1 flex-shrink-0 ${isDark ? 'text-[#a3a3a3] hover:text-white hover:bg-[#161616]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <CheckCheck className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[60vh] sm:h-[400px] max-h-[500px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
              <Bell className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${isDark ? 'text-[#2a2a2a]' : 'text-gray-300'}`} />
              <p className={`text-sm ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: isDark ? '#2a2a2a' : '#e5e7eb' }}>
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 sm:p-4 cursor-pointer transition-colors active:scale-[0.98] ${
                    !notification.read
                      ? isDark
                        ? 'bg-[#161616] hover:bg-[#1a1a1a]'
                        : 'bg-blue-50 hover:bg-blue-100'
                      : isDark
                      ? 'hover:bg-[#161616]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-2.5 sm:gap-3">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${getPriorityColor(notification.priority)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5 sm:mb-1">
                        <h4
                          className={`text-sm leading-tight ${
                            !notification.read
                              ? isDark
                                ? 'text-white'
                                : 'text-gray-900 font-medium'
                              : isDark
                              ? 'text-[#a3a3a3]'
                              : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#4f46e5] flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p
                        className={`text-xs sm:text-sm mb-2 line-clamp-2 ${
                          isDark ? 'text-[#737373]' : 'text-gray-600'
                        }`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs flex-shrink-0 ${
                            isDark ? 'text-[#737373]' : 'text-gray-500'
                          }`}
                        >
                          {formatTimestamp(notification.timestamp)}
                        </span>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notification.actionLabel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 sm:h-6 text-xs gap-0.5 sm:gap-1 px-1.5 sm:px-2 ${
                                isDark
                                  ? 'text-[#4f46e5] hover:bg-[#1a1a1a]'
                                  : 'text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              <span className="truncate max-w-[60px] sm:max-w-none">{notification.actionLabel}</span>
                              <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(e, notification.id)}
                            className={`h-7 w-7 sm:h-6 sm:w-6 p-0 ${
                              isDark
                                ? 'text-[#737373] hover:text-red-400 hover:bg-[#1a1a1a]'
                                : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <>
            <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
            <div className="p-2 sm:p-3">
              <Button
                variant="ghost"
                className={`w-full justify-center text-sm h-10 sm:h-9 ${
                  isDark
                    ? 'text-[#4f46e5] hover:bg-[#161616]'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('notifications');
                    setIsOpen(false);
                  }
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
